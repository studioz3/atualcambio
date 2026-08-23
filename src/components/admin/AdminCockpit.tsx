import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PeriodFilter, defaultPeriod, type PeriodState } from "./PeriodFilter";
import {
  BarList,
  CockpitCard,
  CockpitSkeleton,
  EmptyIntegration,
  KpiCard,
  LiveDot,
} from "./cockpit/primitives";
import { useClarity, useGa4, useInternal, useIntegrations, useRealtime } from "./cockpit/useCockpit";
import {
  buildInsights,
  formatNumber,
  formatSeconds,
  pageLabel,
  type Insight,
} from "@/lib/cockpit-shared";
import { formatDateTime, funnelOrder, normalizeProduto, origemGrupo } from "@/lib/admin-shared";
import { Activity, ArrowRight, Lightbulb, TriangleAlert } from "lucide-react";

function toneClass(tone: Insight["tone"]) {
  if (tone === "alerta") return "border-rose-400/30 bg-rose-400/5 text-rose-200";
  if (tone === "positivo") return "border-emerald-400/30 bg-emerald-400/5 text-emerald-200";
  return "border-gold/30 bg-gold/5 text-gold";
}

function formatAxis(value: string) {
  if (/^\d{8}$/.test(value)) return `${value.slice(6, 8)}/${value.slice(4, 6)}`;
  if (/^\d{10}$/.test(value)) return `${value.slice(6, 8)}/${value.slice(4, 6)} ${value.slice(8, 10)}h`;
  return value;
}

export function AdminCockpit() {
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod);
  const integrations = useIntegrations();
  const ga4Enabled = integrations.data?.ga4 === true;
  const clarityEnabled = integrations.data?.clarity === true;

  const internal = useInternal(period);
  const ga4 = useGa4(period, ga4Enabled);
  const realtime = useRealtime(ga4Enabled);
  const clarity = useClarity(clarityEnabled);

  const leads = internal.data?.leads ?? [];
  const ga4Data = ga4.data?.configured ? ga4.data.data : null;
  const clarityData = clarity.data?.configured ? clarity.data.data : null;

  const funnel = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of leads) counts.set(l.status, (counts.get(l.status) ?? 0) + 1);
    return funnelOrder.map((status) => ({ status, value: counts.get(status) ?? 0 }));
  }, [leads]);

  const origens = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) {
      const key = origemGrupo(l.origem);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const produtos = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) {
      const key = normalizeProduto(l.produto);
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()]
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [leads]);

  const insights = useMemo(
    () => buildInsights({ ga4: ga4Data, clarity: clarityData, leads }),
    [ga4Data, clarityData, leads],
  );

  const series = (ga4Data?.series ?? []).map((p) => ({ ...p, label: formatAxis(p.date) }));
  const leadsTotal = leads.length;
  const conversion =
    ga4Data && ga4Data.totals.sessions > 0 ? leadsTotal / ga4Data.totals.sessions : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter value={period} onChange={setPeriod} tone="cockpit" />
        <div className="flex items-center gap-2 text-xs text-white/45">
          <LiveDot active={ga4Enabled && realtime.data?.configured === true} />
          {ga4Enabled ? "Tempo real ativo" : "Tempo real aguardando GA4"}
        </div>
      </div>

      {/* Faixa tempo real */}
      <CockpitCard
        title="Agora no site"
        subtitle={ga4Enabled ? "Atualiza a cada 30 segundos" : undefined}
        action={
          <Link to="/admin/trafego" className="text-xs font-semibold text-gold hover:underline">
            Ver tráfego
          </Link>
        }
      >
        {!ga4Enabled ? (
          <EmptyIntegration
            service="Google Analytics 4"
            reason={
              integrations.isLoading
                ? "Verificando conexões…"
                : "Sem GA4 conectado, o cockpit não exibe visitantes em tempo real."
            }
            steps={[
              "Criar uma conta de serviço com acesso de leitura à propriedade GA4",
              "Informar GA4_PROPERTY_ID e GA4_SERVICE_ACCOUNT_JSON nas configurações do backend",
              "Recarregar o painel — os dados aparecem automaticamente",
            ]}
          />
        ) : realtime.data?.configured ? (
          <div className="grid gap-5 md:grid-cols-[auto_1fr_1fr]">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">
                Usuários ativos
              </p>
              <p className="mt-2 text-5xl font-bold text-white tabular-nums">
                {formatNumber(realtime.data.data.activeUsers)}
              </p>
            </div>
            <div>
              <p className="mb-2 text-[11px] text-white/45">Páginas em foco</p>
              <BarList
                data={realtime.data.data.pages.map((p) => ({
                  label: pageLabel(p.path),
                  value: p.activeUsers,
                }))}
                emptyLabel="Nenhuma sessão ativa neste instante."
              />
            </div>
            <div>
              <p className="mb-2 text-[11px] text-white/45">Eventos recentes</p>
              <BarList
                data={realtime.data.data.events.map((e) => ({ label: e.name, value: e.count }))}
                emptyLabel="Sem eventos nos últimos 30 minutos."
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/45">{realtime.data?.reason ?? "Carregando tempo real…"}</p>
        )}
      </CockpitCard>

      {/* KPIs executivos */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Sessões"
          value={ga4Data?.totals.sessions ?? null}
          previous={ga4Data?.previous?.sessions ?? null}
          loading={ga4.isLoading && ga4Enabled}
          unavailable={ga4Enabled ? undefined : "Aguardando GA4"}
        />
        <KpiCard
          label="Leads capturados"
          value={leadsTotal}
          previous={internal.data?.previousLeadCount ?? null}
          loading={internal.isLoading}
          hint="Dados do Cloud Atual (exclui registros de teste)"
        />
        <KpiCard
          label="Conversão site → lead"
          value={conversion}
          format={(n) => `${(n * 100).toFixed(2)}%`}
          loading={ga4.isLoading && ga4Enabled}
          unavailable={ga4Enabled ? undefined : "Requer GA4"}
        />
        <KpiCard
          label="Tempo médio engajado"
          value={ga4Data?.totals.avgEngagementSeconds ?? null}
          previous={ga4Data?.previous?.avgEngagementSeconds ?? null}
          format={formatSeconds}
          loading={ga4.isLoading && ga4Enabled}
          unavailable={ga4Enabled ? undefined : "Aguardando GA4"}
        />
      </div>

      {/* Série temporal + funil */}
      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <CockpitCard title="Tráfego no período" subtitle="Sessões, usuários e visualizações">
          {!ga4Enabled ? (
            <EmptyIntegration service="Google Analytics 4" />
          ) : ga4.isLoading ? (
            <CockpitSkeleton rows={6} />
          ) : series.length === 0 ? (
            <p className="text-sm text-white/45">Sem dados do GA4 para este período.</p>
          ) : (
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: -18, right: 8, top: 8 }}>
                  <defs>
                    <linearGradient id="cockpit-sessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D0A32E" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="#D0A32E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={24}
                  />
                  <YAxis
                    tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#00050d",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="sessions"
                    name="Sessões"
                    stroke="#D0A32E"
                    strokeWidth={2}
                    fill="url(#cockpit-sessions)"
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Usuários"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth={1.5}
                    fill="transparent"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </CockpitCard>

        <CockpitCard
          title="Funil comercial"
          subtitle="Leads por estágio no período"
          action={
            <Link to="/admin/leads" className="text-xs font-semibold text-gold hover:underline">
              Abrir leads
            </Link>
          }
        >
          {internal.isLoading ? (
            <CockpitSkeleton rows={5} />
          ) : (
            <ul className="space-y-3">
              {funnel.map((stage, i) => {
                const base = funnel[0]?.value ?? 0;
                const pct = base > 0 ? stage.value / base : 0;
                return (
                  <li key={stage.status}>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-white/70">{stage.status}</span>
                      <span className="font-semibold text-white tabular-nums">
                        {formatNumber(stage.value)}
                        {i > 0 && base > 0 ? (
                          <span className="ml-2 text-[11px] font-normal text-white/40">
                            {(pct * 100).toFixed(0)}%
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold to-gold/50 transition-[width] duration-700"
                        style={{ width: `${Math.max(pct * 100, stage.value > 0 ? 6 : 0)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CockpitCard>
      </div>

      {/* Origem, produtos, insights */}
      <div className="grid gap-4 lg:grid-cols-3">
        <CockpitCard title="De onde vêm os leads" subtitle="Origem consolidada por UTM e página">
          {internal.isLoading ? <CockpitSkeleton /> : <BarList data={origens} />}
        </CockpitCard>
        <CockpitCard title="Interesse por produto" subtitle="Taxonomia comercial da Atual">
          {internal.isLoading ? <CockpitSkeleton /> : <BarList data={produtos} />}
        </CockpitCard>
        <CockpitCard
          title="Insights"
          subtitle="Gerados apenas a partir de dados reais conectados"
          action={<Lightbulb className="size-4 text-gold" aria-hidden />}
        >
          {insights.length === 0 ? (
            <p className="text-sm text-white/45">
              Sem sinais relevantes no período — ou aguardando GA4 e Clarity para cruzar comportamento
              com conversão.
            </p>
          ) : (
            <ul className="space-y-2">
              {insights.map((i) => (
                <li
                  key={i.id}
                  className={`rounded-xl border px-3 py-2 text-xs leading-relaxed ${toneClass(i.tone)}`}
                >
                  {i.tone === "alerta" ? (
                    <TriangleAlert className="mr-1.5 inline size-3.5 align-[-2px]" aria-hidden />
                  ) : null}
                  {i.text}
                </li>
              ))}
            </ul>
          )}
        </CockpitCard>
      </div>

      {/* Atividade + páginas */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <CockpitCard
          title="Atividade recente"
          subtitle="Últimos movimentos no funil"
          action={<Activity className="size-4 text-gold" aria-hidden />}
        >
          {internal.isLoading ? (
            <CockpitSkeleton rows={5} />
          ) : (internal.data?.activity.length ?? 0) === 0 ? (
            <p className="text-sm text-white/45">Nenhum movimento registrado ainda.</p>
          ) : (
            <ul className="space-y-3">
              {internal.data!.activity.slice(0, 8).map((e) => (
                <li key={e.id} className="flex gap-3 text-xs">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  <div className="min-w-0">
                    <p className="truncate text-white/80">
                      {e.lead_nome ?? "Lead"}
                      {e.status_novo ? ` — ${e.status_novo}` : ""}
                    </p>
                    <p className="truncate text-white/40">
                      {e.descricao ?? e.tipo} · {formatDateTime(e.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CockpitCard>

        <CockpitCard
          title="Páginas que mais convertem"
          subtitle="Visualizações do GA4 x leads originados"
          action={
            <Link to="/admin/comportamento" className="text-xs font-semibold text-gold hover:underline">
              Comportamento <ArrowRight className="inline size-3" aria-hidden />
            </Link>
          }
        >
          {!ga4Enabled ? (
            <EmptyIntegration service="Google Analytics 4" />
          ) : ga4.isLoading ? (
            <CockpitSkeleton rows={5} />
          ) : (
            <BarList
              data={(ga4Data?.pages ?? []).slice(0, 8).map((p) => {
                const originated = leads.filter((l) => (l.source_page ?? "").startsWith(p.path)).length;
                return {
                  label: pageLabel(p.path),
                  value: p.views,
                  hint: `${formatNumber(originated)} leads · engajamento ${formatSeconds(
                    p.avgEngagementSeconds,
                  )}`,
                };
              })}
            />
          )}
        </CockpitCard>
      </div>
    </div>
  );
}
