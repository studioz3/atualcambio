import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "./primitives";
import { TextField, SelectField } from "./fields";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { valueRanges } from "@/lib/lead-intents";
import { buildWhatsappMessage, buildWhatsappUrl, getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export const businessOperations = [
  "Importar",
  "Exportar",
  "Pagar fornecedor no exterior",
  "Receber do exterior",
  "Pagar serviços internacionais",
  "Outra operação",
] as const;

export type BusinessOperation = (typeof businessOperations)[number];

const currencies = ["USD", "EUR", "GBP", "CNY", "JPY", "USDT", "USDC", "Outra"];
const deadlines = ["Hoje", "Esta semana", "Este mês", "Sem data definida"];

export function BusinessLeadForm({
  operation,
  onOperationChange,
}: {
  operation: BusinessOperation;
  onOperationChange: (value: BusinessOperation) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setErrors({});
  }, [operation]);

  function markStart() {
    if (started) return;
    setStarted(true);
    track("business_lead_start", { operacao: operation });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const lead: LeadInput = {
      nome: get("nome"),
      email: get("email"),
      whatsapp: get("whatsapp"),
      tipo_cliente: "pj",
      produto: "empresa/PJ",
      empresa: get("empresa"),
      operacao: get("operacao") || operation,
      moeda: get("moeda"),
      faixa_valor: get("faixa_valor"),
      prazo: get("prazo"),
      ...getUtm(),
    };

    const nextErrors: Record<string, string> = {};
    if (lead.nome.length < 2) nextErrors['nome'] = "Informe seu nome completo.";
    if (!lead.empresa) nextErrors['empresa'] = "Informe o nome da empresa.";
    if (lead.whatsapp.replace(/\D/g, "").length < 10)
      nextErrors['whatsapp'] = "Informe um WhatsApp com DDD.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email))
      nextErrors['email'] = "Informe um e-mail válido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      // O lead é sempre registrado ANTES de qualquer handoff para o WhatsApp.
      await submitLead({ data: lead });
      track("business_lead_submit", {
        operacao: lead.operacao ?? operation,
        moeda: lead.moeda ?? "",
        faixa_valor: lead.faixa_valor ?? "",
      });

      const url = buildWhatsappUrl(links.whatsapp, buildWhatsappMessage(lead));
      if (url) {
        track("business_whatsapp", { operacao: lead.operacao ?? operation });
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.success("Recebemos os dados da sua operação. Um especialista vai continuar com você.");
      }
      (event.target as HTMLFormElement).reset();
      setStarted(false);
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      onFocus={markStart}
      noValidate
      className="rounded-lg border border-line bg-white p-7 md:p-9"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Nome" name="nome" error={errors['nome']} autoComplete="name" maxLength={120} />
        <TextField
          label="Empresa"
          name="empresa"
          error={errors['empresa']}
          autoComplete="organization"
          maxLength={160}
        />
        <TextField
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          error={errors['whatsapp']}
          hint="Com DDD."
          autoComplete="tel"
          maxLength={30}
        />
        <TextField
          label="E-mail"
          name="email"
          type="email"
          error={errors['email']}
          autoComplete="email"
          maxLength={200}
        />
        <SelectField
          label="Tipo de operação"
          name="operacao"
          options={[...businessOperations]}
          value={operation}
          onChange={(event) => onOperationChange(event.target.value as BusinessOperation)}
        />
        <SelectField label="Moeda" name="moeda" options={currencies} />
        <SelectField label="Faixa de valor" name="faixa_valor" options={valueRanges} />
        <SelectField label="Prazo aproximado" name="prazo" options={deadlines} />
      </div>

      <ActionButton type="submit" size="lg" disabled={loading} className="mt-8 w-full md:w-auto">
        {loading ? "Enviando…" : "Falar com especialista"}
      </ActionButton>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Ao enviar, você concorda com o tratamento dos seus dados conforme a Política de Privacidade.
        Não pedimos CPF ou CNPJ nesta etapa.
      </p>
    </form>
  );
}
