/**
 * Cockpit Atual — camada server-only.
 * Credenciais lidas apenas aqui, dentro de handlers. Nada retorna token ao frontend.
 */
import type {
  ClarityOverview,
  ClarityPageMetrics,
  Ga4Dim,
  Ga4Overview,
  Ga4Page,
  Ga4Point,
  Ga4Realtime,
  Ga4Totals,
} from "./cockpit-shared";

type StaffCtx = { supabase: any; userId: string; claims: Record<string, unknown> };

export async function assertStaff(context: StaffCtx) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Não foi possível validar o acesso.");
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (roles.length === 0) throw new Error("Acesso restrito ao time da Atual.");
  return { roles: roles as string[], email: (context.claims["email"] as string | undefined) ?? "" };
}

/* ------------------------------------------------------------------ *
 * Google Analytics 4 — Data API (server-side, service account)
 * ------------------------------------------------------------------ */

function ga4Config() {
  const propertyId = (process.env["GA4_PROPERTY_ID"] ?? "").replace(/^properties\//, "").trim();
  const credentials =
    process.env["GA4_SERVICE_ACCOUNT_KEY"] ?? process.env["GA4_SERVICE_ACCOUNT_JSON"];
  if (!propertyId || !credentials) return null;
  try {
    const parsed = JSON.parse(credentials) as { client_email?: string; private_key?: string };
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      propertyId,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}


export function ga4Configured() {
  return ga4Config() !== null;
}

function pemToArrayBuffer(pem: string) {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");
  const raw = atob(body);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

function base64url(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let tokenCache: { token: string; exp: number } | null = null;

async function ga4AccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && now < tokenCache.exp - 60) return tokenCache.token;

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${payload}`)),
  );
  const assertion = `${header}.${payload}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`Falha na autenticação com o Google Analytics [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, exp: now + json.expires_in };
  return json.access_token;
}

async function ga4Run(path: string, body: unknown) {
  const cfg = ga4Config();
  if (!cfg) throw new Error("Google Analytics não configurado.");
  const token = await ga4AccessToken(cfg.clientEmail, cfg.privateKey);
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${cfg.propertyId}:${path}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Google Analytics respondeu ${res.status}: ${await res.text()}`);
  return (await res.json()) as {
    rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
    totals?: { metricValues: { value: string }[] }[];
  };
}

/**
 * Sondas de saúde — retornam status HTTP e latência sem expor credenciais.
 */
export async function ga4Probe(
  kind: "data" | "realtime",
): Promise<{ ok: boolean; status: number | null; durationMs: number; error: string | null }> {
  const started = Date.now();
  const cfg = ga4Config();
  if (!cfg) {
    return { ok: false, status: null, durationMs: 0, error: "Google Analytics não configurado." };
  }
  try {
    const token = await ga4AccessToken(cfg.clientEmail, cfg.privateKey);
    const path = kind === "realtime" ? "runRealtimeReport" : "runReport";
    const body =
      kind === "realtime"
        ? { metrics: [{ name: "activeUsers" }] }
        : {
            dateRanges: [{ startDate: "yesterday", endDate: "today" }],
            metrics: [{ name: "sessions" }],
          };
    const res = await fetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${cfg.propertyId}:${path}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );
    const durationMs = Date.now() - started;
    if (!res.ok) {
      const text = (await res.text()).slice(0, 300);
      return { ok: false, status: res.status, durationMs, error: text };
    }
    await res.json();
    return { ok: true, status: res.status, durationMs, error: null };
  } catch (error) {
    return {
      ok: false,
      status: null,
      durationMs: Date.now() - started,
      error: (error as Error).message.slice(0, 300),
    };
  }
}

export async function clarityProbe(): Promise<{
  ok: boolean;
  status: number | null;
  durationMs: number;
  error: string | null;
}> {
  const started = Date.now();
  const token = process.env["CLARITY_API_TOKEN"];
  if (!token) {
    return { ok: false, status: null, durationMs: 0, error: "Clarity não configurado." };
  }
  try {
    const url = new URL("https://www.clarity.ms/export-data/api/v1/project-live-insights");
    url.searchParams.set("numOfDays", "1");
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    const durationMs = Date.now() - started;
    if (!res.ok) {
      const text = (await res.text()).slice(0, 300);
      return { ok: false, status: res.status, durationMs, error: text };
    }
    await res.json();
    return { ok: true, status: res.status, durationMs, error: null };
  } catch (error) {
    return {
      ok: false,
      status: null,
      durationMs: Date.now() - started,
      error: (error as Error).message.slice(0, 300),
    };
  }
}

const num = (v?: string) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

async function ga4Totals(from: string, to: string): Promise<Ga4Totals> {
  const res = await ga4Run("runReport", {
    dateRanges: [{ startDate: from, endDate: to }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "userEngagementDuration" },
      { name: "eventCount" },
      { name: "conversions" },
    ],
  });
  const m = res.rows?.[0]?.metricValues ?? res.totals?.[0]?.metricValues ?? [];
  const sessions = num(m[0]?.value);
  return {
    sessions,
    users: num(m[1]?.value),
    pageViews: num(m[2]?.value),
    avgEngagementSeconds: sessions > 0 ? num(m[3]?.value) / sessions : 0,
    events: num(m[4]?.value),
    conversions: num(m[5]?.value),
  };
}

export async function ga4Dimension(from: string, to: string, dimension: string, limit = 12): Promise<Ga4Dim[]> {
  const res = await ga4Run("runReport", {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: dimension }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "conversions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });
  return (res.rows ?? []).map((r) => ({
    label: r.dimensionValues[0]?.value ?? "—",
    sessions: num(r.metricValues[0]?.value),
    users: num(r.metricValues[1]?.value),
    conversions: num(r.metricValues[2]?.value),
  }));
}

export async function fetchGa4Overview(input: {
  from: string;
  to: string;
  previousFrom: string | null;
  previousTo: string | null;
  granularity: "hora" | "dia" | "semana";
}): Promise<Ga4Overview> {
  const dimension =
    input.granularity === "hora" ? "dateHour" : input.granularity === "semana" ? "week" : "date";

  const [totals, previous, seriesRes, sources, campaigns, devices, locations, pagesRes] =
    await Promise.all([
      ga4Totals(input.from, input.to),
      input.previousFrom && input.previousTo
        ? ga4Totals(input.previousFrom, input.previousTo).catch(() => null)
        : Promise.resolve(null),
      ga4Run("runReport", {
        dateRanges: [{ startDate: input.from, endDate: input.to }],
        dimensions: [{ name: dimension }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: dimension } }],
        limit: 500,
      }),
      ga4Dimension(input.from, input.to, "sessionDefaultChannelGroup"),
      ga4Dimension(input.from, input.to, "sessionCampaignName"),
      ga4Dimension(input.from, input.to, "deviceCategory", 5),
      ga4Dimension(input.from, input.to, "city", 10),
      ga4Run("runReport", {
        dateRanges: [{ startDate: input.from, endDate: input.to }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "totalUsers" },
          { name: "userEngagementDuration" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 20,
      }),
    ]);

  const series: Ga4Point[] = (seriesRes.rows ?? []).map((r) => ({
    date: r.dimensionValues[0]?.value ?? "",
    sessions: num(r.metricValues[0]?.value),
    users: num(r.metricValues[1]?.value),
    pageViews: num(r.metricValues[2]?.value),
  }));

  const pages: Ga4Page[] = (pagesRes.rows ?? []).map((r) => {
    const users = num(r.metricValues[1]?.value);
    return {
      path: r.dimensionValues[0]?.value ?? "/",
      views: num(r.metricValues[0]?.value),
      users,
      avgEngagementSeconds: users > 0 ? num(r.metricValues[2]?.value) / users : 0,
    };
  });

  return { totals, previous, series, sources, campaigns, devices, locations, pages };
}

export async function fetchGa4Realtime(): Promise<Ga4Realtime> {
  const [users, pages, devices, events] = await Promise.all([
    ga4Run("runRealtimeReport", { metrics: [{ name: "activeUsers" }] }),
    ga4Run("runRealtimeReport", {
      dimensions: [{ name: "unifiedScreenName" }],
      metrics: [{ name: "activeUsers" }],
      limit: 6,
    }).catch(() => ({ rows: [] })),
    ga4Run("runRealtimeReport", {
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      limit: 4,
    }).catch(() => ({ rows: [] })),
    ga4Run("runRealtimeReport", {
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      limit: 6,
    }).catch(() => ({ rows: [] })),
  ]);

  return {
    activeUsers: num(users.rows?.[0]?.metricValues[0]?.value),
    pages: (pages.rows ?? []).map((r) => ({
      path: r.dimensionValues[0]?.value ?? "—",
      activeUsers: num(r.metricValues[0]?.value),
    })),
    devices: (devices.rows ?? []).map((r) => ({
      label: r.dimensionValues[0]?.value ?? "—",
      activeUsers: num(r.metricValues[0]?.value),
    })),
    events: (events.rows ?? []).map((r) => ({
      name: r.dimensionValues[0]?.value ?? "—",
      count: num(r.metricValues[0]?.value),
    })),
  };
}

/* ------------------------------------------------------------------ *
 * Microsoft Clarity — Data Export API com cache e cooldown
 * ------------------------------------------------------------------ */

export function clarityConfigured() {
  return Boolean(process.env["CLARITY_API_TOKEN"]);
}

export function clarityProjectUrl() {
  const url = process.env["CLARITY_PROJECT_URL"];
  const id = process.env["CLARITY_PROJECT_ID"];
  if (url) return url;
  if (id) return `https://clarity.microsoft.com/projects/view/${id}/dashboard`;
  return null;
}

// Coleta agendada 4x/dia; acima de 8h consideramos o snapshot defasado.
const CLARITY_TTL_MS = 1000 * 60 * 60 * 8;

let clarityCache: { at: number; data: ClarityOverview } | null = null;


function emptyPageMetrics(path: string): ClarityPageMetrics {
  return {
    path,
    sessions: 0,
    averageScrollDepth: null,
    averageEngagementSeconds: null,
    rageClicks: 0,
    deadClicks: 0,
    excessiveScroll: 0,
    quickBacks: 0,
    scriptErrors: 0,
    errorClicks: 0,
  };
}

type ClarityRaw = { metricName: string; information: Record<string, string>[] }[];

/** Converte URL absoluta do Clarity em caminho do site. */
function clarityPath(raw: string) {
  if (!raw) return "/";
  try {
    const u = new URL(raw);
    return u.pathname.replace(/\/+$/, "") || "/";
  } catch {
    const p = raw.split("?")[0] ?? raw;
    return p.replace(/\/+$/, "") || "/";
  }
}

const frictionField = {
  RageClickCount: "rageClicks",
  DeadClickCount: "deadClicks",
  ExcessiveScroll: "excessiveScroll",
  QuickbackClick: "quickBacks",
  ScriptErrorCount: "scriptErrors",
  ErrorClickCount: "errorClicks",
} as const;

function parseClarity(
  base: ClarityRaw,
  byUrl: ClarityRaw,
): Omit<ClarityOverview, "updatedAt" | "stale" | "projectUrl"> {
  const totals = emptyPageMetrics("todas");
  const pageMap = new Map<string, ClarityPageMetrics>();
  const devices: { label: string; sessions: number }[] = [];
  const sources: { label: string; sessions: number }[] = [];

  const pageOf = (path: string) => {
    if (!pageMap.has(path)) pageMap.set(path, emptyPageMetrics(path));
    return pageMap.get(path)!;
  };

  const numeric = (v?: string) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  // --- Agregado do projeto (sem dimensão) ---
  for (const metric of base ?? []) {
    for (const row of metric.information ?? []) {
      switch (metric.metricName) {
        case "Traffic":
          totals.sessions += numeric(row["totalSessionCount"] ?? row["sessionsCount"]);
          break;
        case "ScrollDepth":
          totals.averageScrollDepth = numeric(row["averageScrollDepth"]) / 100;
          break;
        case "EngagementTime": {
          const active = numeric(row["activeTime"]);
          totals.averageEngagementSeconds = active;
          break;
        }
        case "Device":
          devices.push({ label: row["name"] ?? "—", sessions: numeric(row["sessionsCount"]) });
          break;
        case "ReferrerUrl":
          sources.push({
            label: row["name"] ? clarityHost(row["name"]) : "direto",
            sessions: numeric(row["sessionsCount"]),
          });
          break;
        case "PopularPages": {
          const p = pageOf(clarityPath(row["url"] ?? row["Url"] ?? ""));
          p.sessions += numeric(row["visitsCount"] ?? row["sessionsCount"]);
          break;
        }
        default: {
          const field = frictionField[metric.metricName as keyof typeof frictionField];
          if (field) totals[field] += numeric(row["subTotal"]);
          break;
        }
      }
    }
  }

  // --- Quebra por URL ---
  for (const metric of byUrl ?? []) {
    for (const row of metric.information ?? []) {
      const url = row["URL"] ?? row["Url"] ?? row["url"] ?? "";
      if (!url) continue;
      const p = pageOf(clarityPath(url));
      switch (metric.metricName) {
        case "Traffic":
          if (p.sessions === 0) p.sessions = numeric(row["totalSessionCount"]);
          break;
        case "ScrollDepth":
          p.averageScrollDepth = numeric(row["averageScrollDepth"]) / 100;
          break;
        case "EngagementTime":
          p.averageEngagementSeconds = numeric(row["activeTime"]);
          break;
        default: {
          const field = frictionField[metric.metricName as keyof typeof frictionField];
          if (field) p[field] += numeric(row["subTotal"]);
          break;
        }
      }
    }
  }

  const merge = (list: { label: string; sessions: number }[]) => {
    const map = new Map<string, number>();
    for (const item of list) map.set(item.label, (map.get(item.label) ?? 0) + item.sessions);
    return [...map.entries()]
      .map(([label, sessions]) => ({ label, sessions }))
      .sort((a, b) => b.sessions - a.sessions);
  };

  return {
    totals,
    pages: [...pageMap.values()].sort((a, b) => b.sessions - a.sessions),
    devices: merge(devices),
    sources: merge(sources),
  };

}

function clarityHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

const CLARITY_SNAPSHOT_KEY = "live-insights-3d";

async function readClaritySnapshot(): Promise<{ at: number; data: ClarityOverview } | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("clarity_snapshots")
      .select("payload, fetched_at")
      .eq("key", CLARITY_SNAPSHOT_KEY)
      .maybeSingle();
    if (error || !data) return null;
    return {
      at: new Date(data.fetched_at as string).getTime(),
      data: data.payload as unknown as ClarityOverview,
    };
  } catch {
    return null;
  }
}

/** Prefixo das linhas históricas: uma por dia de coleta (última coleta do dia). */
const CLARITY_HISTORY_PREFIX = "live-insights-3d:";

async function writeClaritySnapshot(data: ClarityOverview) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const dayKey = `${CLARITY_HISTORY_PREFIX}${now.slice(0, 10)}`;
    await supabaseAdmin.from("clarity_snapshots").upsert(
      [
        { key: CLARITY_SNAPSHOT_KEY, payload: data as never, fetched_at: now },
        { key: dayKey, payload: data as never, fetched_at: now },
      ],
      { onConflict: "key" },
    );
  } catch {
    /* cache best-effort */
  }
}

/**
 * Histórico já coletado — lê apenas o banco, sem consumir cota da API.
 * Cada ponto é a última coleta gravada naquele dia (janela móvel de 3 dias do Clarity).
 */
export async function fetchClarityHistory(
  from: string,
  to: string,
): Promise<ClarityHistoryPoint[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("clarity_snapshots")
    .select("key, payload, fetched_at")
    .like("key", `${CLARITY_HISTORY_PREFIX}%`)
    .gte("fetched_at", from)
    .lte("fetched_at", to)
    .order("fetched_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => {
    const payload = row.payload as unknown as ClarityOverview;
    const totals = payload?.totals;
    return {
      date: String(row.key).slice(CLARITY_HISTORY_PREFIX.length),
      collectedAt: new Date(row.fetched_at as string).toISOString(),
      sessions: totals?.sessions ?? 0,
      averageScrollDepth: totals?.averageScrollDepth ?? null,
      averageEngagementSeconds: totals?.averageEngagementSeconds ?? null,
      rageClicks: totals?.rageClicks ?? 0,
      deadClicks: totals?.deadClicks ?? 0,
      quickBacks: totals?.quickBacks ?? 0,
    };
  });
}

/**
 * Leitura do cockpit — NUNCA chama a API do Clarity.
 * A API da Microsoft libera apenas 10 chamadas por dia e por projeto; cada coleta
 * gasta 2 chamadas. Por isso a coleta é feita por job agendado (4x/dia = 8 chamadas)
 * e o cockpit lê somente o último snapshot gravado no banco.
 */
export async function fetchClarity(): Promise<ClarityOverview> {
  if (!clarityCache) clarityCache = await readClaritySnapshot();
  const snapshot = clarityCache ?? (await readClaritySnapshot());
  if (!snapshot) {
    throw new Error(
      "Nenhuma coleta do Clarity gravada ainda. A próxima coleta agendada preenche os dados.",
    );
  }
  const ageMs = Date.now() - snapshot.at;
  const stale = ageMs > CLARITY_TTL_MS;
  return {
    ...snapshot.data,
    projectUrl: clarityProjectUrl(),
    stale,
    ...(stale
      ? { staleReason: "última coleta agendada com mais de 8 horas" }
      : {}),
  };
}

/**
 * Coleta agendada — única função autorizada a consumir a cota da API do Clarity.
 * Gasta 2 chamadas (agregado + quebra por URL) e grava o snapshot no banco.
 */
export async function collectClaritySnapshot(days = 3): Promise<{
  ok: boolean;
  updatedAt?: string;
  error?: string;
  apiCalls: number;
}> {
  const token = process.env["CLARITY_API_TOKEN"];
  if (!token) return { ok: false, error: "Clarity não configurado.", apiCalls: 0 };

  let apiCalls = 0;
  const call = async (dimension?: string) => {
    const url = new URL("https://www.clarity.ms/export-data/api/v1/project-live-insights");
    url.searchParams.set("numOfDays", String(Math.min(3, Math.max(1, days))));
    if (dimension) url.searchParams.set("dimension1", dimension);
    apiCalls += 1;
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) {
      const body = (await res.text().catch(() => "")).slice(0, 200);
      throw new Error(`Clarity respondeu ${res.status}${body ? ` — ${body}` : ""}`);
    }
    return (await res.json()) as ClarityRaw;
  };

  try {
    const base = await call();
    const byUrl = await call("URL").catch(() => [] as ClarityRaw);
    const data: ClarityOverview = {
      ...parseClarity(base, byUrl),
      updatedAt: new Date().toISOString(),
      stale: false,
      projectUrl: clarityProjectUrl(),
    };
    clarityCache = { at: Date.now(), data };
    await writeClaritySnapshot(data);
    return { ok: true, updatedAt: data.updatedAt, apiCalls };
  } catch (err) {
    return { ok: false, error: (err as Error).message, apiCalls };
  }
}



