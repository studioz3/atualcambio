import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Upload } from "lucide-react";
import { PeriodFilter, defaultPeriod, rangeOf, type PeriodState } from "../PeriodFilter";
import { BarList, CockpitCard, CockpitSkeleton, KpiCard } from "../cockpit/primitives";
import { SocialTaxonomyFilters, emptyTaxonomy, type TaxonomyFilters } from "./SocialFilters";
import { SocialPostDialog } from "./SocialPostDialog";
import { getSocialOverview } from "@/lib/social.functions";
import {
  comparableMetrics,
  contentTypeLabel,
  editorialLabel,
  formatWatchTime,
  metricValue,
  platformDot,
  platformLabel,
  type ComparableMetricId,
  type SocialAggregate,
} from "@/lib/social-shared";
import { formatNumber, formatPercent } from "@/lib/cockpit-shared";
import { formatDateTime } from "@/lib/admin-shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const day = 86400000;

function useSocialRange(period: PeriodState) {
  return useMemo(() => {
    const r = rangeOf(period);
    const fromIso = r.from ?? new Date(Date.now() - 29 * day).toISOString();
    const toIso = r.to ?? new Date().toISOString();
    const span = Math.max(day, new Date(toIso).getTime() - new Date(fromIso).getTime());
    const previousTo = new Date(new Date(fromIso).getTime() - 1000).toISOString();
    const previousFrom = new Date(new Date(previousTo).getTime() - span).toISOString();
    return { from: fromIso, to: toIso, previousFrom, previousTo };
  }, [period.preset, period.from, period.to]);
}

function num(v: number | null | undefined) {
  return v == null ? "—" : formatNumber(v);
}

function Cell({ value }: { value: number | null }) {
  return <span className={cn("tabular-nums", value == null ? "text-white/25" : "text-white")}>{num(value)}</span>;
}

export function SocialCockpit() {
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod);
  const [taxonomy, setTaxonomy] = useState<TaxonomyFilters>(emptyTaxonomy);
  const [metric, setMetric] = useState<ComparableMetricId>("reach");
  const range = useSocialRange(period);

  const filters = {
    ...range,
    platforms: taxonomy.platforms,
    editorialLines: taxonomy.editorialLines,
    contentTypes: taxonomy.contentTypes,
  };

  const query = useQuery({
    queryKey: ["social-overview", filters],
    queryFn: () => getSocialOverview({ data: filters }),
    refetchInterval: 5 * 60_000,
  });

  const data = query.data;
  const hasAnyData =
    !!data && (data.posts.length > 0 || data.series.length > 0 || data.kpis.leads > 0);

  const chartData = useMemo(() => {
    if (!data) return [];
    const byDate = new Map<string, Record<string, number | string>>();
    for (const p of data.series) {
      const row = byDate.get(p.date) ?? { date: p.date };
      const value =
        metric === "leads"
          ? p.leads
          : metric === "followersGrowth"
            ? (p.followers ?? 0)
            : ((p[metric as "reach" | "views" | "engagements" | "clicks"] as number | null) ?? 0);
      row[p.platform] = ((row[p.platform] as number) ?? 0) + (value ?? 0);
      byDate.set(p.date, row);
    }
    return [...byDate.values()].sort((a, b) => String(a.date).localeCompare(String(b.date)));
  }, [data, metric]);

  const activePlatforms = data?.byPlatform.map((p) => p.platform) ?? [];

  const rankedPosts = useMemo(() => {
    if (!data) return [];
    return [...data.posts]
      .sort((a, b) => {
        const av = metric === "leads" ? a.leads : ((a.metrics as any)[metric] ?? 0);
        const bv = metric === "leads" ? b.leads : ((b.metrics as any)[metric] ?? 0);
        return bv - av;
      })
      .slice(0, 12);
  }, [data, metric]);

  const funnel = data?.funnel;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-4">
          <PeriodFilter value={period} onChange={setPeriod} tone="cockpit" />
          <SocialTaxonomyFilters value={taxonomy} onChange={setTaxonomy} />
        </div>
        <div className="flex flex-wrap gap-2">
          <SocialPostDialog />
          <Button asChild size="sm" variant="secondary">
            <Link to="/admin/social/spotify/importar">
              <Upload className="size-3.5" aria-hidden /> Importar Spotify
            </Link>
          </Button>
          <Button asChild size="sm" variant="ghost" className="text-white/70 hover:text-white">
            <Link to="/admin/integracoes">Integrações</Link>
          </Button>
        </div>
      </div>

      {query.isLoading ? <CockpitSkeleton rows={5} /> : null}

      {query.isError ? (
        <CockpitCard title="Não foi possível carregar">
          <p className="text-sm text-white/60">{(query.error as Error).message}</p>
        </CockpitCard>
      ) : null}

      {data && !hasAnyData ? (
        <CockpitCard title="Nenhum dado social no período">
          <p className="text-sm text-white/60">
            Ainda não há publicações, métricas importadas ou leads com UTM de redes sociais neste período.
            Conecte as APIs em <Link to="/admin/integracoes" className="text-gold hover:underline">Integrações</Link>,
            importe o CSV do Spotify ou registre uma publicação manualmente. O cockpit nunca exibe números
            estimados.
          </p>
        </CockpitCard>
      ) : null}

      {data ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Alcance" value={data.kpis.reach} loading={query.isFetching && !data} unavailable={data.kpis.reach == null ? "Sem dados conectados" : undefined} />
            <KpiCard label="Engajamentos" value={data.kpis.engagements} unavailable={data.kpis.engagements == null ? "Sem dados conectados" : undefined} />
            <KpiCard label="Cliques para o site" value={data.kpis.clicks} unavailable={data.kpis.clicks == null ? "Sem dados conectados" : undefined} />
            <KpiCard
              label="Sessões atribuídas (GA4)"
              value={data.kpis.sessions}
              unavailable={data.kpis.sessions == null ? (data.ga4Reason ?? "GA4 não conectado") : undefined}
            />
            <KpiCard label="Leads originados em redes" value={data.kpis.leads} previous={data.previous?.leads ?? null} />
            <KpiCard label="Leads qualificados" value={data.kpis.qualifiedLeads} previous={data.previous?.qualifiedLeads ?? null} />
            <KpiCard label="Clientes" value={data.kpis.clients} previous={data.previous?.clients ?? null} />
            <KpiCard
              label="Seguidores"
              value={data.kpis.followers}
              unavailable={data.kpis.followers == null ? "Depende da conexão das APIs" : undefined}
              hint="Crescimento no período aparece por rede na tabela abaixo."
            />
          </section>

          <CockpitCard
            title="Evolução por rede"
            subtitle="Comparação lado a lado no período selecionado"
            action={
              <div className="flex flex-wrap gap-1.5">
                {comparableMetrics.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetric(m.id)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition",
                      metric === m.id
                        ? "border-gold bg-gold text-gold-foreground"
                        : "border-white/15 text-white/55 hover:text-white",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            }
          >
            {chartData.length === 0 ? (
              <p className="text-sm text-white/45">Sem série temporal para esta métrica no período.</p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                    <XAxis dataKey="date" stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.35)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "#00050D",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    {activePlatforms.map((p) => (
                      <Area
                        key={p}
                        type="monotone"
                        dataKey={p}
                        name={platformLabel(p)}
                        stroke={platformDot(p)}
                        fill={platformDot(p)}
                        fillOpacity={0.12}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CockpitCard>

          <CockpitCard title="Desempenho por rede" subtitle="Somente métricas efetivamente coletadas">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-xs">
                <thead className="text-white/45">
                  <tr>
                    {["Rede", "Publicações", "Alcance", "Engajamentos", "Cliques", "Sessões", "Leads", "Clientes", "Seguidores"].map((h) => (
                      <th key={h} className="pb-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.byPlatform.map((p) => (
                    <tr key={p.platform} className="text-white/80">
                      <td className="py-2.5">
                        <span className="inline-flex items-center gap-2">
                          <span className="size-2 rounded-full" style={{ background: platformDot(p.platform) }} />
                          {platformLabel(p.platform)}
                        </span>
                      </td>
                      <td>{p.posts}</td>
                      <td><Cell value={p.reach} /></td>
                      <td><Cell value={p.engagements} /></td>
                      <td><Cell value={p.clicks} /></td>
                      <td><Cell value={p.sessions} /></td>
                      <td className="font-semibold text-white">{p.leads}</td>
                      <td>{p.clients}</td>
                      <td><Cell value={p.followers ?? null} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CockpitCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <CockpitCard title="Editorias" subtitle="Momento Atual, Cripto Wine, Vida Atual e demais linhas">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead className="text-white/45">
                    <tr>
                      {["Editoria", "Publicações", "Alcance", "Engaj.", "Leads", "Newsletter"].map((h) => (
                        <th key={h} className="pb-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.byEditorial.map((e) => (
                      <tr key={e.editorialLine} className="text-white/80">
                        <td className="py-2.5">{editorialLabel(e.editorialLine)}</td>
                        <td>{e.posts}</td>
                        <td><Cell value={e.reach} /></td>
                        <td><Cell value={e.engagements} /></td>
                        <td>{e.leads}</td>
                        <td>{e.newsletter}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CockpitCard>

            <CockpitCard title="Formatos" subtitle="Qual formato entrega mais resultado">
              <BarList
                data={data.byFormat
                  .map((f) => ({
                    label: contentTypeLabel(f.contentType),
                    value: metricValue(f as SocialAggregate, metric) ?? 0,
                    hint: `${f.posts} publicações · ${f.leads} leads`,
                  }))
                  .sort((a, b) => b.value - a.value)}
                emptyLabel="Nenhum formato com dados no período."
              />
            </CockpitCard>
          </div>

          <CockpitCard title="Editoria × rede" subtitle="Onde cada linha editorial performa melhor">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-xs">
                <thead className="text-white/45">
                  <tr>
                    <th className="pb-2 font-semibold">Editoria</th>
                    {activePlatforms.map((p) => (
                      <th key={p} className="pb-2 font-semibold">{platformLabel(p)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.byEditorial.map((e) => (
                    <tr key={e.editorialLine} className="text-white/80">
                      <td className="py-2.5">{editorialLabel(e.editorialLine)}</td>
                      {activePlatforms.map((p) => {
                        const cell = data.matrix.find(
                          (m) => m.editorialLine === e.editorialLine && m.platform === p,
                        );
                        return (
                          <td key={p}>
                            <Cell value={cell ? metricValue(cell.value, metric) : null} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CockpitCard>

          <CockpitCard title="Funil social → site → lead → cliente">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {(
                [
                  ["Alcance", funnel?.reach ?? null],
                  ["Cliques", funnel?.clicks ?? null],
                  ["Sessões", funnel?.sessions ?? null],
                  ["Leads", funnel?.leads ?? 0],
                  ["Qualificados", funnel?.qualifiedLeads ?? 0],
                  ["Clientes", funnel?.clients ?? 0],
                ] as [string, number | null][]
              ).map(([label, value], i, arr) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">{label}</p>
                  <p className="mt-2 text-2xl font-bold text-white tabular-nums">{num(value)}</p>
                  {i > 0 && arr[i - 1]![1] ? (
                    <p className="mt-1 text-[11px] text-white/40">
                      {formatPercent((value ?? 0) / (arr[i - 1]![1] as number))} do passo anterior
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            {funnel?.sessions == null ? (
              <p className="mt-3 text-[11px] text-white/40">
                Sessões dependem do GA4 conectado e de links com UTM padronizada.
              </p>
            ) : null}
          </CockpitCard>

          <CockpitCard
            title="Ranking de publicações"
            subtitle={`Ordenado por ${comparableMetrics.find((m) => m.id === metric)?.label.toLowerCase()}`}
          >
            {rankedPosts.length === 0 ? (
              <p className="text-sm text-white/45">Nenhuma publicação registrada no período.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-xs">
                  <thead className="text-white/45">
                    <tr>
                      {["Publicação", "Rede", "Editoria", "Formato", "Data", "Alcance", "Engaj.", "Leads"].map((h) => (
                        <th key={h} className="pb-2 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rankedPosts.map((p) => (
                      <tr key={p.id} className="text-white/80">
                        <td className="max-w-[280px] truncate py-2.5">
                          {p.url ? (
                            <a href={p.url} target="_blank" rel="noreferrer" className="hover:text-gold">
                              {p.title ?? p.url}
                            </a>
                          ) : (
                            (p.title ?? "—")
                          )}
                        </td>
                        <td>{platformLabel(p.platform)}</td>
                        <td>{editorialLabel(p.editorialLine)}</td>
                        <td>{contentTypeLabel(p.contentType)}</td>
                        <td>{formatDateTime(p.publishedAt)}</td>
                        <td><Cell value={p.metrics.reach} /></td>
                        <td><Cell value={p.metrics.engagements} /></td>
                        <td className="font-semibold text-white">{p.leads}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CockpitCard>

          <div className="grid gap-6 xl:grid-cols-2">
            <CockpitCard title="Podcast — Momento Atual no Spotify" subtitle="Dados importados do Spotify for Creators">
              {data.episodes.length === 0 ? (
                <p className="text-sm text-white/45">
                  Nenhum episódio importado.{" "}
                  <Link to="/admin/social/spotify/importar" className="text-gold hover:underline">
                    Importar CSV
                  </Link>
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-xs">
                    <thead className="text-white/45">
                      <tr>
                        {["Episódio", "Reproduções", "Ouvintes", "Tempo total", "Retenção", "Leads"].map((h) => (
                          <th key={h} className="pb-2 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {data.episodes.map((e) => (
                        <tr key={e.id} className="text-white/80">
                          <td className="max-w-[240px] truncate py-2.5">{e.title ?? "—"}</td>
                          <td><Cell value={e.plays} /></td>
                          <td><Cell value={e.listeners} /></td>
                          <td>{formatWatchTime(e.watchTimeSeconds)}</td>
                          <td>{e.retentionRate == null ? "—" : formatPercent(e.retentionRate)}</td>
                          <td>{e.leads}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CockpitCard>

            <CockpitCard title="Cadência de publicação" subtitle="Volume por rede, editoria e formato">
              <BarList
                data={data.cadence.slice(0, 10).map((c) => ({
                  label: `${platformLabel(c.platform)} · ${editorialLabel(c.editorialLine)}`,
                  value: c.posts,
                  hint: contentTypeLabel(c.contentType),
                }))}
                emptyLabel="Nenhuma publicação registrada no período."
              />
            </CockpitCard>
          </div>

          <CockpitCard
            title="Status das conexões"
            action={
              <Link to="/admin/integracoes" className="inline-flex items-center gap-1 text-xs font-semibold text-gold hover:underline">
                Gerenciar <ArrowRight className="size-3" aria-hidden />
              </Link>
            }
          >
            <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {data.accounts.map((a) => (
                <li key={a.platform} className="flex items-center justify-between rounded-lg border border-white/10 px-3 py-2 text-xs">
                  <span className="text-white/80">{platformLabel(a.platform)}</span>
                  <span
                    className={cn(
                      "font-semibold",
                      a.status === "conectado" ? "text-emerald-400" : a.status === "erro" ? "text-rose-400" : "text-white/40",
                    )}
                  >
                    {a.status === "conectado" ? "Conectado" : a.status === "erro" ? "Erro" : "Não conectado"}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-white/40">
              Atualizado em {formatDateTime(data.generatedAt)}
            </p>
          </CockpitCard>
        </>
      ) : null}
    </div>
  );
}
