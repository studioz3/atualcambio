/**
 * Monitor de saúde das integrações de analytics — camada server-only.
 * Executa sondas, grava histórico e dispara alertas (webhook e/ou e-mail).
 * Credenciais lidas apenas aqui; nada é devolvido ao frontend.
 */
import { clarityProbe, ga4Probe } from "./cockpit.server";
import type { HealthCheck, HealthSnapshot, HealthSourceId, HealthSourceStatus } from "./health-shared";
import { healthSources, sourceLabel } from "./health-shared";

/** Não repetir alerta da mesma fonte antes disso, se ela seguir falhando. */
const ALERT_REPEAT_MS = 1000 * 60 * 60;

type ProbeResult = {
  ok: boolean;
  status: number | null;
  durationMs: number;
  error: string | null;
};

function webhookUrl() {
  return process.env["ANALYTICS_ALERT_WEBHOOK_URL"] ?? null;
}

function emailRecipients() {
  return (process.env["ANALYTICS_ALERT_EMAIL_TO"] ?? "")
    .split(/[,;\s]+/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function emailConfigured() {
  return Boolean(process.env["RESEND_API_KEY"]) && emailRecipients().length > 0;
}

export function alertingStatus() {
  return {
    webhook: Boolean(webhookUrl()),
    email: emailConfigured(),
    recipients: emailRecipients().length,
  };
}

async function sendWebhook(payload: unknown) {
  const url = webhookUrl();
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("[health] webhook falhou", (error as Error).message);
  }
}

async function sendEmail(subject: string, lines: string[]) {
  const apiKey = process.env["RESEND_API_KEY"];
  const to = emailRecipients();
  if (!apiKey || to.length === 0) return;
  const from = process.env["ANALYTICS_ALERT_EMAIL_FROM"] ?? "Cockpit Atual <onboarding@resend.dev>";
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to,
        subject,
        html: `<h2>${subject}</h2><ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>`,
      }),
    });
    if (!res.ok) console.error("[health] e-mail falhou", res.status);
  } catch (error) {
    console.error("[health] e-mail falhou", (error as Error).message);
  }
}

async function notify(failures: { source: HealthSourceId; result: ProbeResult }[]) {
  if (failures.length === 0) return false;
  const at = new Date().toISOString();
  const lines = failures.map(
    (f) =>
      `${sourceLabel(f.source)} — status ${f.result.status ?? "sem resposta"} em ${f.result.durationMs} ms — ${
        f.result.error ?? "erro desconhecido"
      }`,
  );
  await Promise.all([
    sendWebhook({
      event: "analytics_health_failure",
      at,
      failures: failures.map((f) => ({
        source: f.source,
        label: sourceLabel(f.source),
        statusCode: f.result.status,
        durationMs: f.result.durationMs,
        error: f.result.error,
      })),
    }),
    sendEmail("Cockpit Atual — falha na sincronização de analytics", [...lines, `Detectado em ${at}`]),
  ]);
  return true;
}

/** Executa todas as sondas, grava o histórico e alerta quando algo falha. */
export async function runHealthChecks() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  // Estado anterior por fonte, para evitar alerta repetido e poupar a cota do Clarity.
  const { data: previous } = await supabaseAdmin
    .from("analytics_health_checks")
    .select("source, ok, status_code, duration_ms, error, alerted, checked_at")
    .order("checked_at", { ascending: false })
    .limit(80);

  const previousRows = (previous ?? []) as {
    source: string;
    ok: boolean;
    status_code: number | null;
    duration_ms: number;
    error: string | null;
    alerted: boolean;
    checked_at: string;
  }[];

  // A Data Export API do Clarity tem cota diária baixa: só sondamos a cada 3h.
  const lastClarityOk = previousRows.find((r) => r.source === "clarity" && r.ok);
  const clarityFresh =
    lastClarityOk && Date.now() - new Date(lastClarityOk.checked_at).getTime() < CLARITY_PROBE_MS;

  const [ga4, ga4Realtime, clarity] = await Promise.all([
    ga4Probe("data"),
    ga4Probe("realtime"),
    clarityFresh
      ? Promise.resolve<ProbeResult>({
          ok: true,
          status: lastClarityOk!.status_code ?? 200,
          durationMs: lastClarityOk!.duration_ms,
          error: null,
        })
      : clarityProbe().then((r) =>
          r.status === 429
            ? {
                ...r,
                error:
                  "Cota diária da API do Clarity atingida — a coleta no site segue normal; os dados voltam a atualizar no próximo ciclo.",
              }
            : r,
        ),
  ]);
  const results: { source: HealthSourceId; result: ProbeResult }[] = [
    { source: "ga4", result: ga4 },
    { source: "ga4_realtime", result: ga4Realtime },
    { source: "clarity", result: clarity },
  ];

  const lastBySource = new Map<string, { ok: boolean; alerted: boolean; checked_at: string }>();
  for (const row of (previous ?? []) as { source: string; ok: boolean; alerted: boolean; checked_at: string }[]) {
    if (!lastBySource.has(row.source)) lastBySource.set(row.source, row);
  }
  const lastAlertBySource = new Map<string, string>();
  for (const row of (previous ?? []) as { source: string; alerted: boolean; checked_at: string }[]) {
    if (row.alerted && !lastAlertBySource.has(row.source)) lastAlertBySource.set(row.source, row.checked_at);
  }

  const now = Date.now();
  const toAlert = results.filter(({ source, result }) => {
    if (result.ok) return false;
    const lastAlert = lastAlertBySource.get(source);
    if (!lastAlert) return true;
    return now - new Date(lastAlert).getTime() > ALERT_REPEAT_MS;
  });

  const alerted = await notify(toAlert);
  const alertedSources = new Set(alerted ? toAlert.map((f) => f.source) : []);

  await supabaseAdmin.from("analytics_health_checks").insert(
    results.map(({ source, result }) => ({
      source,
      ok: result.ok,
      status_code: result.status,
      duration_ms: result.durationMs,
      error: result.error,
      alerted: alertedSources.has(source),
    })),
  );

  return {
    checkedAt: new Date().toISOString(),
    results: results.map(({ source, result }) => ({ source, ...result })),
    alertsSent: alertedSources.size,
    alerting: alertingStatus(),
  };
}

type Row = {
  source: string;
  ok: boolean;
  status_code: number | null;
  duration_ms: number;
  error: string | null;
  checked_at: string;
};

function toCheck(row: Row): HealthCheck {
  return {
    source: row.source as HealthSourceId,
    ok: row.ok,
    statusCode: row.status_code,
    durationMs: row.duration_ms,
    error: row.error,
    checkedAt: row.checked_at,
  };
}

/** Snapshot lido com o cliente do próprio usuário (RLS: só time interno). */
export async function fetchHealthSnapshot(context: { supabase: any }): Promise<HealthSnapshot> {
  const since = new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString();
  const { data, error } = await context.supabase
    .from("analytics_health_checks")
    .select("source, ok, status_code, duration_ms, error, checked_at")
    .gte("checked_at", since)
    .order("checked_at", { ascending: false })
    .limit(400);
  if (error) throw new Error("Não foi possível ler o histórico de saúde.");

  const rows = (data ?? []) as Row[];
  const sources: HealthSourceStatus[] = healthSources.map(({ id }) => {
    const list = rows.filter((r) => r.source === id).map(toCheck);
    const durations = list.map((c) => c.durationMs).filter((d) => d > 0);
    return {
      source: id,
      last: list[0] ?? null,
      errors24h: list.filter((c) => !c.ok).length,
      checks24h: list.length,
      avgDurationMs:
        durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
      history: list.slice(0, 40).reverse(),
    };
  });

  return { sources, alerting: alertingStatus(), generatedAt: new Date().toISOString() };
}
