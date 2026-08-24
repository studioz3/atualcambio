import { useMemo, useState } from "react";
import {
  BarList,
  CockpitCard,
  CockpitSkeleton,
  EmptyIntegration,
  KpiCard,
} from "./cockpit/primitives";
import { useClarity, useGa4, useIntegrations, useInternal } from "./cockpit/useCockpit";
import { defaultPeriod, PeriodFilter, type PeriodState } from "./PeriodFilter";
import {
  buildInsights,
  formatNumber,
  formatPercent,
  formatSeconds,
  pageLabel,
  trackedPages,
} from "@/lib/cockpit-shared";
import { cn } from "@/lib/utils";
import { ExternalLink, MousePointerClick, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminBehavior() {
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod);
  const [selected, setSelected] = useState<string>("todas");
  const [force, setForce] = useState(false);

  const integrations = useIntegrations();
  const clarityEnabled = integrations.data?.clarity === true;
  const clarity = useClarity(clarityEnabled, force);
  const ga4 = useGa4(period, integrations.data?.ga4 === true);
  const internal = useInternal(period);

  const data = clarity.data?.configured ? clarity.data.data : null;
  const page = useMemo(() => {
    if (!data) return null;
    if (selected === "todas") return data.totals;
    return data.pages.find((p) => p.path.replace(/\/$/, "") === selected.replace(/\/$/, "")) ?? null;
  }, [data, selected]);

  const insights = useMemo(
    () =>
      buildInsights({
        ga4: ga4.data?.configured ? ga4.data.data : null,
        clarity: data,
        leads: internal.data?.leads ?? null,
      }),
    [ga4.data, data, internal.data],
  );

  if (!clarityEnabled) {
    return (
      <div className="space-y-6">
        <CockpitCard title="Comportamento e mapas de calor">
          <EmptyIntegration
            service="Microsoft Clarity"
            reason={
              integrations.isLoading
                ? "Verificando conexões…"
                : "Scroll, cliques de frustração e gravações vêm do Clarity. Sem conexão, nada é exibido."
            }
            steps={[
              "Criar o projeto do site no Microsoft Clarity",
              "Gerar um API token no Clarity (Settings → Data Export)",
              "Cadastrar CLARITY_API_TOKEN e CLARITY_PROJECT_ID no backend",
            ]}
          />
        </CockpitCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter value={period} onChange={setPeriod} tone="cockpit" />
        <div className="flex items-center gap-3 text-[11px] text-white/45">
          {data ? (
            <span>
              Clarity atualizado em {new Date(data.updatedAt).toLocaleString("pt-BR")}
              {data.stale ? " · exibindo último dado válido" : ""}
            </span>
          ) : null}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setForce((f) => !f)}
            disabled={clarity.isFetching}
          >
            <RefreshCw className={cn("mr-1.5 size-3.5", clarity.isFetching && "animate-spin")} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[{ path: "todas", label: "Todas as páginas" }, ...trackedPages].map((p) => (
          <button
            key={p.path}
            type="button"
            onClick={() => setSelected(p.path)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              selected === p.path
                ? "border-gold bg-gold text-gold-foreground"
                : "border-white/15 bg-white/5 text-white/60 hover:border-gold/40 hover:text-white",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      {clarity.isLoading ? (
        <CockpitSkeleton rows={6} />
      ) : !page ? (
        <CockpitCard title="Sem dados">
          <p className="text-sm text-white/45">
            O Clarity ainda não registrou sessões suficientes para {pageLabel(selected)} no período disponível
            (a API cobre os últimos 3 dias).
          </p>
        </CockpitCard>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Sessões analisadas" value={page.sessions} />
            <KpiCard
              label="Scroll médio"
              value={page.averageScrollDepth}
              format={(n) => formatPercent(n, 0)}
              unavailable={page.averageScrollDepth == null ? "Sem amostra" : undefined}
            />
            <KpiCard
              label="Tempo ativo médio"
              value={page.averageEngagementSeconds}
              format={formatSeconds}
              unavailable={page.averageEngagementSeconds == null ? "Sem amostra" : undefined}
            />
            <KpiCard label="Rage clicks" value={page.rageClicks} hint="Cliques repetidos de frustração" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <CockpitCard title="Pontos de fricção" subtitle="Sinais capturados pelo Clarity">
              <BarList
                data={[
                  { label: "Rage clicks", value: page.rageClicks },
                  { label: "Dead clicks", value: page.deadClicks },
                  { label: "Scroll excessivo", value: page.excessiveScroll },
                  { label: "Retornos rápidos", value: page.quickBacks },
                  { label: "Cliques com erro", value: page.errorClicks },
                  { label: "Erros de script", value: page.scriptErrors },
                ].filter((d) => d.value > 0)}
                emptyLabel="Nenhuma fricção relevante registrada."
              />
            </CockpitCard>

            <CockpitCard
              title="Mapa de calor"
              subtitle="Renderizado dentro do Clarity, com a sessão da sua conta"
              action={<MousePointerClick className="size-4 text-gold" aria-hidden />}
            >
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
                <p className="text-xs text-white/50">
                  Os mapas de calor e as gravações não são expostos pela API de exportação — abra o projeto
                  no Clarity para visualizá-los com o filtro da página selecionada.
                </p>
                {data?.projectUrl ? (
                  <a
                    href={data.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
                  >
                    Abrir mapa de calor no Clarity <ExternalLink className="size-3" aria-hidden />
                  </a>
                ) : (
                  <p className="mt-3 text-[11px] text-white/35">
                    Cadastre CLARITY_PROJECT_ID no backend para gerar o link direto.
                  </p>
                )}
              </div>
            </CockpitCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <CockpitCard title="Páginas por sessões" subtitle="Amostra do Clarity (últimos 3 dias)">
              <BarList
                data={(data?.pages ?? []).slice(0, 10).map((p) => ({
                  label: pageLabel(p.path),
                  value: p.sessions,
                  hint:
                    p.averageScrollDepth != null
                      ? `scroll ${formatPercent(p.averageScrollDepth, 0)} · ${formatNumber(
                          p.rageClicks,
                        )} rage clicks`
                      : `${formatNumber(p.rageClicks)} rage clicks`,
                }))}
              />
            </CockpitCard>
            <CockpitCard title="Dispositivos" subtitle="Sessões registradas pelo Clarity">
              <BarList
                data={(data?.devices ?? []).map((d) => ({ label: d.label, value: d.sessions }))}
                emptyLabel="Sem amostra de dispositivos no período."
              />
            </CockpitCard>
            <CockpitCard title="Origens" subtitle="Referrers das sessões">
              <BarList
                data={(data?.sources ?? []).map((s) => ({ label: s.label, value: s.sessions }))}
                emptyLabel="Sem referrers registrados no período."
              />
            </CockpitCard>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <CockpitCard title="Resumo do período" subtitle="Agregado do projeto no Clarity">
              <BarList
                data={[
                  { label: "Sessões", value: page.sessions },
                  { label: "Quick backs", value: page.quickBacks },
                  { label: "Dead clicks", value: page.deadClicks },
                  { label: "Rage clicks", value: page.rageClicks },
                  { label: "Erros de script", value: page.scriptErrors },
                ]}
              />
            </CockpitCard>

            <CockpitCard title="Insights de UX" subtitle="Somente com base nos dados conectados">
              {insights.length === 0 ? (
                <p className="text-sm text-white/45">Nenhum sinal fora dos limiares definidos.</p>
              ) : (
                <ul className="space-y-2 text-xs leading-relaxed text-white/70">
                  {insights.map((i) => (
                    <li key={i.id} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      {i.text}
                    </li>
                  ))}
                </ul>
              )}
            </CockpitCard>
          </div>
        </>
      )}
    </div>
  );
}
