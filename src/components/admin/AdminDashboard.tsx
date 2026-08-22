import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { listLeads, type LeadRow } from "@/lib/admin.functions";
import { funnelOrder, normalizeProduto, origemGrupo, ORIGEM_DESCONHECIDA } from "@/lib/admin-shared";
import { PeriodFilter, defaultPeriod, rangeOf, type PeriodState } from "./PeriodFilter";

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 text-3xl font-bold text-navy">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function Bars({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <p className="text-sm font-semibold text-navy">{title}</p>
      {data.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">Sem dados no período.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {data.map((d) => (
            <li key={d.label}>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{d.label}</span>
                <span className="font-semibold text-navy">{d.value}</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-offwhite">
                <div
                  className="h-2 rounded-full bg-gold"
                  style={{ width: `${(d.value / max) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function countBy(leads: LeadRow[], key: (l: LeadRow) => string) {
  const map = new Map<string, number>();
  for (const l of leads) map.set(key(l), (map.get(key(l)) ?? 0) + 1);
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

export function AdminDashboard() {
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod);
  const range = rangeOf(period);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-leads", range.from, range.to],
    queryFn: () => listLeads({ data: { from: range.from, to: range.to } }),
    retry: false,
  });

  const leads = useMemo(() => data?.leads ?? [], [data]);

  const stats = useMemo(() => {
    const total = leads.length;
    const byStatus = (s: string) => leads.filter((l) => l.status === s).length;
    const clientes = leads.filter((l) => l.status === "Cliente" || l.status === "Negócio fechado").length;
    const fechados = byStatus("Negócio fechado");
    return {
      total,
      novos: byStatus("Novo"),
      qualificados: byStatus("Qualificado"),
      clientes,
      fechados,
      taxaCliente: total > 0 ? `${((clientes / total) * 100).toFixed(1)}%` : "—",
      taxaFechado: total > 0 ? `${((fechados / total) * 100).toFixed(1)}%` : "—",
    };
  }, [leads]);

  if (error) {
    return <p className="text-sm text-destructive">Não foi possível carregar os leads.</p>;
  }

  return (
    <div className="space-y-8">
      <PeriodFilter value={period} onChange={setPeriod} />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : leads.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-semibold text-navy">Nenhum lead encontrado neste período.</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Os indicadores aparecem assim que os formulários do site registrarem novos leads.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi label="Leads capturados" value={String(stats.total)} />
        <Kpi label="Leads novos" value={String(stats.novos)} hint="Ainda não tratados" />
        <Kpi label="Qualificados" value={String(stats.qualificados)} />
        <Kpi label="Clientes adquiridos" value={String(stats.clientes)} />
        <Kpi label="Negócios fechados" value={String(stats.fechados)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Kpi label="Taxa Lead → Cliente" value={stats.taxaCliente} />
        <Kpi label="Taxa Lead → Negócio fechado" value={stats.taxaFechado} />
      </div>

      <div className="rounded-xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-navy">Funil comercial</p>
        <div className="mt-5 grid gap-3 md:grid-cols-5">
          {funnelOrder.map((etapa) => (
            <div key={etapa} className="rounded-lg bg-offwhite p-4">
              <p className="text-xs text-muted-foreground">{etapa}</p>
              <p className="mt-1 text-2xl font-bold text-navy">
                {leads.filter((l) => l.status === etapa).length}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Perdidos no período: {leads.filter((l) => l.status === "Perdido").length}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Bars
          title="Leads por interesse"
          data={countBy(leads, (l) => normalizeProduto(l.produto))}
        />
        <Bars
          title="De onde estão vindo os leads?"
          data={countBy(leads, (l) => origemGrupo(l.origem))}
        />
      </div>

      <Bars
        title="Campanhas (utm_campaign)"
        data={countBy(leads.filter((l) => l.utm_campaign), (l) => l.utm_campaign ?? ORIGEM_DESCONHECIDA)}
      />

      <p className="text-sm">
        <Link to="/admin/leads" className="font-semibold text-navy underline-offset-4 hover:text-gold-soft">
          Ver todos os leads →
        </Link>
      </p>
    </div>
  );
}
