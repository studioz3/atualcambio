import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getAnalyticsHealth, runAnalyticsHealthCheck } from "@/lib/health.functions";
import { formatMs, healthSources } from "@/lib/health-shared";
import type { HealthSourceStatus } from "@/lib/health-shared";
import { CockpitCard } from "./cockpit/primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";

function when(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" });
}

function StatusPill({ ok }: { ok: boolean | null }) {
  if (ok === null) {
    return (
      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
        Sem checagem
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        ok ? "bg-emerald-500/15 text-emerald-600" : "bg-destructive/15 text-destructive",
      )}
    >
      {ok ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
      {ok ? "Operacional" : "Falha"}
    </span>
  );
}

function Sparkbar({ status }: { status: HealthSourceStatus }) {
  if (status.history.length === 0) return null;
  const max = Math.max(...status.history.map((h) => h.durationMs), 1);
  return (
    <div className="mt-4 flex h-12 items-end gap-1">
      {status.history.map((h, i) => (
        <div
          key={`${h.checkedAt}-${i}`}
          title={`${when(h.checkedAt)} · ${h.statusCode ?? "sem resposta"} · ${formatMs(h.durationMs)}`}
          className={cn("flex-1 rounded-sm", h.ok ? "bg-gold/70" : "bg-destructive")}
          style={{ height: `${Math.max(8, (h.durationMs / max) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export function AdminAnalyticsHealth() {
  const qc = useQueryClient();
  const health = useQuery({
    queryKey: ["analytics-health"],
    queryFn: () => getAnalyticsHealth(),
    refetchInterval: 60_000,
  });

  const run = useMutation({
    mutationFn: () => runAnalyticsHealthCheck(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["analytics-health"] }),
  });

  const alerting = health.data?.alerting;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Monitoramento das APIs que alimentam o cockpit. Atualiza sozinho a cada minuto.
          {health.data ? ` Última leitura: ${when(health.data.generatedAt)}.` : ""}
        </p>
        <Button onClick={() => run.mutate()} disabled={run.isPending}>
          <RefreshCw className={cn("mr-2 size-4", run.isPending && "animate-spin")} />
          {run.isPending ? "Checando…" : "Checar agora"}
        </Button>
      </div>

      {run.isError ? (
        <p className="text-sm text-destructive">Não foi possível executar a checagem agora.</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        {healthSources.map((s) => {
          const status = health.data?.sources.find((x) => x.source === s.id);
          const last = status?.last ?? null;
          return (
            <CockpitCard key={s.id} title={s.label} subtitle={s.hint}>
              <div className="flex items-center justify-between">
                <StatusPill ok={last ? last.ok : null} />
                <span className="text-sm font-semibold text-foreground">
                  {last?.statusCode ?? "—"}
                </span>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Última sincronização</dt>
                  <dd className="font-medium text-foreground">{when(last?.checkedAt)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Tempo de resposta</dt>
                  <dd className="font-medium text-foreground">{formatMs(last?.durationMs ?? null)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Média 24h</dt>
                  <dd className="font-medium text-foreground">{formatMs(status?.avgDurationMs ?? null)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Erros em 24h</dt>
                  <dd
                    className={cn(
                      "font-semibold",
                      (status?.errors24h ?? 0) > 0 ? "text-destructive" : "text-foreground",
                    )}
                  >
                    {status?.errors24h ?? 0} de {status?.checks24h ?? 0}
                  </dd>
                </div>
              </dl>
              {last && !last.ok && last.error ? (
                <p className="mt-3 rounded-md bg-destructive/10 p-2 text-xs break-words text-destructive">
                  {last.error}
                </p>
              ) : null}
              {status ? <Sparkbar status={status} /> : null}
            </CockpitCard>
          );
        })}
      </div>

      <CockpitCard title="Alertas automáticos" subtitle="Disparados quando uma API falha ou responde fora do 200">
        <ul className="space-y-2 text-sm">
          <li className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">Webhook</span>
            <span className={cn("font-semibold", alerting?.webhook ? "text-emerald-600" : "text-muted-foreground")}>
              {alerting?.webhook ? "Ativo" : "Não configurado"}
            </span>
          </li>
          <li className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">E-mail</span>
            <span className={cn("font-semibold", alerting?.email ? "text-emerald-600" : "text-muted-foreground")}>
              {alerting?.email
                ? `Ativo — ${alerting.recipients} destinatário(s)`
                : "Não configurado"}
            </span>
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          Cada falha gera um alerta imediato; se a mesma integração continuar fora do ar, o aviso é
          repetido no máximo uma vez por hora para evitar spam.
        </p>
      </CockpitCard>
    </div>
  );
}
