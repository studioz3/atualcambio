import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, MessageCircle, Mail } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addLeadNote, getLeadDetail, updateLead } from "@/lib/admin.functions";
import {
  formatDateTime,
  leadStatuses,
  motivosPerda,
  normalizeProduto,
  whatsappLink,
  type LeadStatus,
} from "@/lib/admin-shared";

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <p className="mt-0.5 text-sm break-words text-navy">{value === null || value === undefined || value === "" ? "—" : String(value)}</p>
    </div>
  );
}

async function copiar(texto: string, label: string) {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(`${label} copiado.`);
  } catch {
    toast.error("Não foi possível copiar.");
  }
}

export function LeadDetailSheet({
  leadId,
  onClose,
  consultores,
}: {
  leadId: string | null;
  onClose: () => void;
  consultores: string[];
}) {
  const qc = useQueryClient();
  const [nota, setNota] = useState("");
  const [statusSel, setStatusSel] = useState<LeadStatus | "">("");
  const [motivo, setMotivo] = useState<string>("");
  const [perdaObs, setPerdaObs] = useState("");
  const [negocio, setNegocio] = useState({ data: "", produto: "", valor: "", moeda: "", obs: "" });

  const detail = useQuery({
    queryKey: ["admin-lead", leadId],
    queryFn: () => getLeadDetail({ data: { id: leadId! } }),
    enabled: !!leadId,
    retry: false,
  });

  const lead = detail.data?.lead ?? null;

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ["admin-lead", leadId] });
    void qc.invalidateQueries({ queryKey: ["admin-leads"] });
  };

  const salvar = useMutation({
    mutationFn: (payload: Record<string, unknown> & { id: string }) =>
      updateLead({ data: payload as never }),
    onSuccess: () => {
      invalidate();
      toast.success("Lead atualizado.");
      setStatusSel("");
      setMotivo("");
      setPerdaObs("");
      setNegocio({ data: "", produto: "", valor: "", moeda: "", obs: "" });
    },
    onError: () => toast.error("Não foi possível atualizar o lead."),
  });

  const criarNota = useMutation({
    mutationFn: () => addLeadNote({ data: { id: leadId!, texto: nota.trim() } }),
    onSuccess: () => {
      setNota("");
      invalidate();
      toast.success("Observação registrada.");
    },
    onError: () => toast.error("Não foi possível salvar a observação."),
  });

  const aplicarStatus = () => {
    if (!lead || !statusSel) return;
    salvar.mutate({
      id: lead.id,
      status: statusSel,
      ...(statusSel === "Perdido"
        ? {
            motivo_perda: (motivo || null) as never,
            perda_observacao: perdaObs,
          }
        : {}),
      ...(statusSel === "Negócio fechado"
        ? {
            negocio_fechado_em: negocio.data,
            negocio_produto: negocio.produto || normalizeProduto(lead.produto),
            negocio_valor: negocio.valor ? Number(negocio.valor.replace(",", ".")) : null,
            negocio_moeda: negocio.moeda,
            negocio_observacao: negocio.obs,
          }
        : {}),
    });
  };

  return (
    <Sheet open={!!leadId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-navy">{lead?.nome ?? "Lead"}</SheetTitle>
          <SheetDescription>
            {lead ? `${lead.tipo_cliente === "pj" ? "Empresa" : "Pessoa física"} · ${formatDateTime(lead.created_at)}` : "Carregando…"}
          </SheetDescription>
        </SheetHeader>

        {lead ? (
          <div className="space-y-8 px-4 pb-10">
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={whatsappLink(lead.whatsapp, lead.nome)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-4" aria-hidden /> WhatsApp
                </a>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a href={`mailto:${lead.email}`}>
                  <Mail className="size-4" aria-hidden /> E-mail
                </a>
              </Button>
              <Button size="sm" variant="outline" onClick={() => copiar(lead.whatsapp, "Telefone")}>
                <Copy className="size-4" aria-hidden /> Telefone
              </Button>
              <Button size="sm" variant="outline" onClick={() => copiar(lead.email, "E-mail")}>
                <Copy className="size-4" aria-hidden /> E-mail
              </Button>
            </div>

            <section>
              <h3 className="text-sm font-semibold text-navy">Identificação</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Nome" value={lead.nome} />
                <Field label="E-mail" value={lead.email} />
                <Field label="WhatsApp" value={lead.whatsapp} />
                <Field label="Perfil" value={lead.tipo_cliente === "pj" ? "Empresa" : "Pessoa física"} />
                <Field label="Empresa" value={lead.empresa} />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy">Interesse</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Produto" value={normalizeProduto(lead.produto)} />
                <Field label="Produto informado" value={lead.produto} />
                <Field label="Operação" value={lead.operacao} />
                <Field label="Moeda" value={lead.moeda} />
                <Field label="Faixa de valor (informada pelo lead)" value={lead.faixa_valor} />
                <Field label="Finalidade" value={lead.finalidade} />
                <Field label="Prazo" value={lead.prazo} />
              </div>
              <div className="mt-4">
                <Field label="Mensagem" value={lead.mensagem} />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy">Origem</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Origem" value={lead.origem} />
                <Field label="Página de entrada" value={lead.entry_page} />
                <Field label="Página de conversão" value={lead.source_page} />
                <Field label="URL de conversão" value={lead.source_url} />
                <Field label="Referrer" value={lead.referrer} />
                <Field label="UTM Source" value={lead.utm_source} />
                <Field label="UTM Medium" value={lead.utm_medium} />
                <Field label="UTM Campaign" value={lead.utm_campaign} />
                <Field label="UTM Content" value={lead.utm_content} />
                <Field label="UTM Term" value={lead.utm_term} />
                <Field label="Dispositivo" value={lead.dispositivo} />
                <Field label="Data/hora" value={formatDateTime(lead.created_at)} />
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy">Comercial</h3>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Status atual" value={lead.status} />
                <Field label="Consultor" value={lead.consultor ?? "Não atribuído"} />
                <Field label="Cliente desde" value={lead.cliente_em ? formatDateTime(lead.cliente_em) : null} />
                <Field label="Negócio fechado em" value={lead.negocio_fechado_em} />
                <Field
                  label="Valor real do negócio"
                  value={lead.negocio_valor !== null ? `${lead.negocio_moeda ?? ""} ${lead.negocio_valor}`.trim() : null}
                />
                <Field label="Motivo de perda" value={lead.motivo_perda} />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Consultor responsável</Label>
                  <Select
                    value={lead.consultor ?? "__nao_atribuido"}
                    onValueChange={(v) =>
                      salvar.mutate({ id: lead.id, consultor: v === "__nao_atribuido" ? null : v })
                    }
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__nao_atribuido">Não atribuído</SelectItem>
                      {consultores.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Alterar status</Label>
                  <Select value={statusSel} onValueChange={(v) => setStatusSel(v as LeadStatus)}>
                    <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                    <SelectContent>
                      {leadStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {statusSel === "Perdido" ? (
                <div className="mt-4 space-y-3 rounded-lg border border-line bg-offwhite p-4">
                  <div>
                    <Label>Motivo da perda (opcional)</Label>
                    <Select value={motivo} onValueChange={setMotivo}>
                      <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                      <SelectContent>
                        {motivosPerda.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Observação</Label>
                    <Textarea value={perdaObs} onChange={(e) => setPerdaObs(e.target.value)} maxLength={500} />
                  </div>
                </div>
              ) : null}

              {statusSel === "Negócio fechado" ? (
                <div className="mt-4 grid gap-3 rounded-lg border border-line bg-offwhite p-4 sm:grid-cols-2">
                  <div>
                    <Label>Data do fechamento</Label>
                    <Input type="date" value={negocio.data} onChange={(e) => setNegocio({ ...negocio, data: e.target.value })} />
                  </div>
                  <div>
                    <Label>Produto</Label>
                    <Input
                      value={negocio.produto || normalizeProduto(lead.produto)}
                      onChange={(e) => setNegocio({ ...negocio, produto: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Valor da operação (opcional)</Label>
                    <Input inputMode="decimal" value={negocio.valor} onChange={(e) => setNegocio({ ...negocio, valor: e.target.value })} />
                  </div>
                  <div>
                    <Label>Moeda (opcional)</Label>
                    <Input value={negocio.moeda} onChange={(e) => setNegocio({ ...negocio, moeda: e.target.value })} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label>Observação (opcional)</Label>
                    <Textarea value={negocio.obs} onChange={(e) => setNegocio({ ...negocio, obs: e.target.value })} maxLength={500} />
                  </div>
                </div>
              ) : null}

              {statusSel ? (
                <Button className="mt-4" onClick={aplicarStatus} disabled={salvar.isPending}>
                  Salvar status “{statusSel}”
                </Button>
              ) : null}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy">Observações</h3>
              <div className="mt-3 space-y-2">
                <Textarea
                  value={nota}
                  onChange={(e) => setNota(e.target.value)}
                  maxLength={1000}
                  placeholder="Registrar contato, contexto ou próximo passo…"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!nota.trim() || criarNota.isPending}
                  onClick={() => criarNota.mutate()}
                >
                  Adicionar observação
                </Button>
              </div>
              <ul className="mt-4 space-y-3">
                {(detail.data?.notes ?? []).map((n) => (
                  <li key={n.id} className="rounded-lg border border-line bg-white p-3">
                    <p className="text-sm text-navy">{n.texto}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {n.autor} · {formatDateTime(n.created_at)}
                    </p>
                  </li>
                ))}
                {(detail.data?.notes ?? []).length === 0 ? (
                  <li className="text-sm text-muted-foreground">Nenhuma observação registrada.</li>
                ) : null}
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-semibold text-navy">Histórico</h3>
              <ol className="mt-3 space-y-2 border-l border-line pl-4">
                {(detail.data?.events ?? []).map((e) => (
                  <li key={e.id} className="text-sm text-muted-foreground">
                    <span className="font-medium text-navy">{formatDateTime(e.created_at)}</span> —{" "}
                    {e.tipo === "status"
                      ? `${e.status_anterior} → ${e.status_novo}`
                      : (e.descricao ?? e.tipo)}
                    {e.autor ? ` (${e.autor})` : ""}
                  </li>
                ))}
              </ol>
            </section>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
