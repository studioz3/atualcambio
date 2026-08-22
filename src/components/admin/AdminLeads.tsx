import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search } from "lucide-react";
import { listLeads, type LeadRow } from "@/lib/admin.functions";
import {
  formatDateTime,
  leadStatuses,
  normalizeProduto,
  origemGrupo,
  produtosPadrao,
  whatsappLink,
} from "@/lib/admin-shared";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PeriodFilter, defaultPeriod, rangeOf, type PeriodState } from "./PeriodFilter";
import { LeadDetailSheet } from "./LeadDetailSheet";
import { cn } from "@/lib/utils";

const TODOS = "__todos";

const statusTone: Record<string, string> = {
  Novo: "bg-gold/15 text-navy",
  Contatado: "bg-navy/10 text-navy",
  Qualificado: "bg-navy/15 text-navy",
  Cliente: "bg-emerald-100 text-emerald-900",
  "Negócio fechado": "bg-emerald-600 text-white",
  Perdido: "bg-muted text-muted-foreground",
};

function toCsv(rows: LeadRow[]) {
  const headers = [
    "data",
    "nome",
    "email",
    "whatsapp",
    "perfil",
    "empresa",
    "produto",
    "operacao",
    "moeda",
    "faixa_valor_informada",
    "origem",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "status",
    "consultor",
    "motivo_perda",
    "negocio_fechado_em",
    "negocio_valor",
    "negocio_moeda",
  ];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = rows.map((l) =>
    [
      formatDateTime(l.created_at),
      l.nome,
      l.email,
      l.whatsapp,
      l.tipo_cliente === "pj" ? "Empresa" : "Pessoa física",
      l.empresa,
      normalizeProduto(l.produto),
      l.operacao,
      l.moeda,
      l.faixa_valor,
      l.origem,
      l.utm_source,
      l.utm_medium,
      l.utm_campaign,
      l.status,
      l.consultor,
      l.motivo_perda,
      l.negocio_fechado_em,
      l.negocio_valor,
      l.negocio_moeda,
    ]
      .map(esc)
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}

export function AdminLeads() {
  const [period, setPeriod] = useState<PeriodState>(defaultPeriod);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState(TODOS);
  const [produto, setProduto] = useState(TODOS);
  const [perfil, setPerfil] = useState(TODOS);
  const [consultor, setConsultor] = useState(TODOS);
  const [incluirTestes, setIncluirTestes] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const range = rangeOf(period);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-leads", range.from, range.to, status, perfil, consultor, busca, incluirTestes],
    queryFn: () =>
      listLeads({
        data: {
          from: range.from,
          to: range.to,
          ...(status !== TODOS ? { status } : {}),
          ...(perfil !== TODOS ? { tipo_cliente: perfil } : {}),
          ...(consultor !== TODOS ? { consultor } : {}),
          ...(busca.trim() ? { busca: busca.trim() } : {}),
          incluir_testes: incluirTestes,
        },
      }),
    retry: false,
  });

  const leads = useMemo(() => {
    const all = data?.leads ?? [];
    return produto === TODOS ? all : all.filter((l) => normalizeProduto(l.produto) === produto);
  }, [data, produto]);

  const consultores = useMemo(() => {
    const set = new Set<string>();
    for (const l of data?.leads ?? []) if (l.consultor) set.add(l.consultor);
    return [...set].sort();
  }, [data]);

  const exportar = () => {
    const blob = new Blob(["\uFEFF" + toCsv(leads)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-atual-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PeriodFilter value={period} onChange={setPeriod} />

      <div className="grid gap-3 rounded-xl border border-line bg-white p-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="relative md:col-span-2 xl:col-span-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            className="pl-9"
            placeholder="Nome, empresa, e-mail, telefone"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            maxLength={120}
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os status</SelectItem>
            {leadStatuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={produto} onValueChange={setProduto}>
          <SelectTrigger><SelectValue placeholder="Interesse" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os interesses</SelectItem>
            {produtosPadrao.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={perfil} onValueChange={setPerfil}>
          <SelectTrigger><SelectValue placeholder="Perfil" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>PF e PJ</SelectItem>
            <SelectItem value="pf">Pessoa física</SelectItem>
            <SelectItem value="pj">Empresa</SelectItem>
          </SelectContent>
        </Select>
        <Select value={consultor} onValueChange={setConsultor}>
          <SelectTrigger><SelectValue placeholder="Consultor" /></SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos os consultores</SelectItem>
            <SelectItem value="__nao_atribuido">Não atribuídos</SelectItem>
            {consultores.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="incluir-testes"
            checked={incluirTestes}
            onCheckedChange={(v) => setIncluirTestes(v === true)}
          />
          <Label htmlFor="incluir-testes" className="text-sm font-normal text-muted-foreground">
            Incluir leads marcados como teste
          </Label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{leads.length} lead(s)</span>
          <Button size="sm" variant="outline" onClick={exportar} disabled={leads.length === 0}>
            <Download className="size-4" aria-hidden /> Exportar CSV
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-destructive">Não foi possível carregar os leads.</p> : null}

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-offwhite text-xs tracking-wide text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Perfil</th>
              <th className="px-4 py-3">Interesse</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Consultor</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">Carregando…</td></tr>
            ) : leads.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                  Nenhum lead encontrado com os filtros atuais.
                </td>
              </tr>
            ) : (
              leads.map((l) => (
                <tr
                  key={l.id}
                  className="cursor-pointer border-t border-line hover:bg-offwhite/60"
                  onClick={() => setOpenId(l.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatDateTime(l.created_at)}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-navy">{l.nome}</span>
                    {l.empresa ? <span className="block text-xs text-muted-foreground">{l.empresa}</span> : null}
                  </td>
                  <td className="px-4 py-3">{l.tipo_cliente === "pj" ? "Empresa" : "PF"}</td>
                  <td className="px-4 py-3">{normalizeProduto(l.produto)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{origemGrupo(l.origem)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", statusTone[l.status] ?? "bg-muted")}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{l.consultor ?? "—"}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <a href={whatsappLink(l.whatsapp, l.nome)} target="_blank" rel="noopener noreferrer">
                          WhatsApp
                        </a>
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setOpenId(l.id)}>
                        Abrir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <LeadDetailSheet leadId={openId} onClose={() => setOpenId(null)} consultores={consultores} />
    </div>
  );
}
