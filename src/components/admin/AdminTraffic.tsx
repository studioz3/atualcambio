import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
} from "./cockpit/primitives";
import { useGa4, useInternal, useIntegrations } from "./cockpit/useCockpit";
import { formatNumber, formatSeconds, pageLabel } from "@/lib/cockpit-shared";

const donutColors = ["#D0A32E", "#5B7FA6", "#8FA9C2", "#3D5673", "#B9C6D4"];

export function AdminTraffic() {
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod);
  const integrations = useIntegrations();
  const ga4Enabled = integrations.data?.ga4 === true;
  const ga4 = useGa4(period, ga4Enabled);
  const internal = useInternal(period);

  const data = ga4.data?.configured ? ga4.data.data : null;
  const leads = internal.data?.leads ?? [];

  const utmLeads = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of leads) {
      const key = l.utm_campaign || l.utm_source || "sem campanha";
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  }, [leads]);

  if (!ga4Enabled) {
    return (
      <div className="space-y-6">
        <PeriodFilter value={period} onChange={setPeriod} tone="cockpit" />
        <CockpitCard title="Tráfego e aquisição">
          <EmptyIntegration
            service="Google Analytics 4"
            reason={
              integrations.isLoading
                ? "Verificando conexões…"
                : "Canais, campanhas, dispositivos e localidades vêm direto do GA4. Nada é estimado aqui."
            }
            steps={[
              "Criar conta de serviço com acesso de leitura à propriedade GA4",
              "Cadastrar GA4_PROPERTY_ID e GA4_SERVICE_ACCOUNT_JSON no backend",
              "Recarregar esta página",
            ]}
          />
        </CockpitCard>
        <CockpitCard title="Campanhas com leads (dados internos)" subtitle="UTM registrada na captura">
          <BarList data={utmLeads} />
        </CockpitCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodFilter value={period} onChange={setPeriod} tone="cockpit" />
        {ga4.dataUpdatedAt ? (
          <span className="text-[11px] text-white/45">
            GA4 sincronizado em {new Date(ga4.dataUpdatedAt).toLocaleString("pt-BR")}
          </span>
        ) : null}
      </div>


      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Sessões"
          value={data?.totals.sessions ?? null}
          previous={data?.previous?.sessions ?? null}
          loading={ga4.isLoading}
        />
        <KpiCard
          label="Usuários"
          value={data?.totals.users ?? null}
          previous={data?.previous?.users ?? null}
          loading={ga4.isLoading}
        />
        <KpiCard
          label="Visualizações"
          value={data?.totals.pageViews ?? null}
          previous={data?.previous?.pageViews ?? null}
          loading={ga4.isLoading}
        />
        <KpiCard
          label="Eventos"
          value={data?.totals.events ?? null}
          previous={data?.previous?.events ?? null}
          loading={ga4.isLoading}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <CockpitCard title="Canais de aquisição" subtitle="Agrupamento padrão do GA4">
          {ga4.isLoading ? (
            <CockpitSkeleton rows={6} />
          ) : (
            <BarList
              data={(data?.sources ?? []).map((s) => ({
                label: s.label,
                value: s.sessions,
                hint: `${formatNumber(s.users)} usuários`,
              }))}
            />
          )}
        </CockpitCard>

        <CockpitCard title="Dispositivos" subtitle="Sessões por categoria">
          {ga4.isLoading ? (
            <CockpitSkeleton rows={4} />
          ) : (data?.devices.length ?? 0) === 0 ? (
            <p className="text-sm text-white/45">Sem dados no período.</p>
          ) : (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data!.devices.map((d) => ({ name: d.label, value: d.sessions }))}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {data!.devices.map((_, i) => (
                      <Cell key={i} fill={donutColors[i % donutColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#00050d",
                      border: "1px solid rgba(255,255,255,0.12)",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </CockpitCard>
      </div>

      <CockpitCard title="Campanhas" subtitle="Sessões e conversões registradas no GA4">
        {ga4.isLoading ? (
          <CockpitSkeleton rows={5} />
        ) : (data?.campaigns.length ?? 0) === 0 ? (
          <p className="text-sm text-white/45">Nenhuma campanha identificada no período.</p>
        ) : (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data!.campaigns.slice(0, 10)} margin={{ left: -18, right: 8, top: 8 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.07)" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  height={54}
                  angle={-18}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{
                    background: "#00050d",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 12,
                    color: "#fff",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sessions" name="Sessões" fill="#D0A32E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CockpitCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <CockpitCard title="Localidades" subtitle="Principais cidades">
          {ga4.isLoading ? (
            <CockpitSkeleton />
          ) : (
            <BarList data={(data?.locations ?? []).map((l) => ({ label: l.label, value: l.sessions }))} />
          )}
        </CockpitCard>
        <CockpitCard title="Páginas mais vistas" subtitle="Visualizações e engajamento médio">
          {ga4.isLoading ? (
            <CockpitSkeleton />
          ) : (
            <BarList
              data={(data?.pages ?? []).slice(0, 10).map((p) => ({
                label: pageLabel(p.path),
                value: p.views,
                hint: formatSeconds(p.avgEngagementSeconds),
              }))}
            />
          )}
        </CockpitCard>
        <CockpitCard title="Campanhas com leads" subtitle="UTM capturada no formulário (Cloud Atual)">
          {internal.isLoading ? <CockpitSkeleton /> : <BarList data={utmLeads} />}
        </CockpitCard>
      </div>
    </div>
  );
}
