import { useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "./primitives";
import { TextField, SelectField } from "./fields";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { tourismCurrencies, type TourismOperation } from "@/lib/exchange-options";
import { buildWhatsappUrl, getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

/**
 * Lead de Câmbio Turismo.
 * O registro no Cloud acontece SEMPRE antes de abrir o WhatsApp.
 * Sem cotação, sem preço e sem promessa de entrega/retirada.
 */
export function TourismLeadForm({
  operation,
  currency,
  amount,
  onOperationChange,
  onCurrencyChange,
  onAmountChange,
}: {
  operation: TourismOperation;
  currency: string;
  amount: string;
  onOperationChange: (value: TourismOperation) => void;
  onCurrencyChange: (value: string) => void;
  onAmountChange: (value: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function buildMessage(lead: LeadInput) {
    const first = lead.nome.split(" ")[0] ?? lead.nome;
    const verbo = operation === "Comprar" ? "compra" : "venda";
    const valor = lead.faixa_valor ? `, aproximadamente ${lead.faixa_valor}` : "";
    return `Olá, sou ${first}. Gostaria de solicitar cotação para ${verbo} de ${lead.moeda}${valor}.`;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const lead: LeadInput = {
      nome: get("nome"),
      email: get("email"),
      whatsapp: get("whatsapp"),
      tipo_cliente: "pf",
      produto: "Câmbio Turismo",
      operacao: operation,
      moeda: get("moeda") || currency,
      faixa_valor: get("valor") || amount,
      source_page: "cambio-turismo",
      ...getUtm(),
    };

    const nextErrors: Record<string, string> = {};
    if (lead.nome.length < 2) nextErrors['nome'] = "Informe seu nome completo.";
    if (lead.whatsapp.replace(/\D/g, "").length < 10)
      nextErrors['whatsapp'] = "Informe um WhatsApp com DDD.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email))
      nextErrors['email'] = "Informe um e-mail válido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await submitLead({ data: lead });
      track("tourism_lead_submit", {
        operacao: operation,
        moeda: lead.moeda ?? "",
        valor: lead.faixa_valor ?? "",
      });

      const url = buildWhatsappUrl(links.whatsapp, buildMessage(lead));
      if (url) {
        track("tourism_whatsapp", { operacao: operation, moeda: lead.moeda ?? "" });
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.success("Recebemos seu pedido de cotação. Um especialista vai continuar com você.");
      }
      (event.target as HTMLFormElement).reset();
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-lg border border-line bg-white p-7 md:p-9"
    >
      <div className="grid gap-5 md:grid-cols-2">
        <TextField label="Nome" name="nome" error={errors['nome']} autoComplete="name" maxLength={120} />
        <TextField
          label="WhatsApp"
          name="whatsapp"
          type="tel"
          inputMode="tel"
          hint="Com DDD."
          error={errors['whatsapp']}
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
          label="Operação"
          name="operacao"
          options={["Comprar", "Vender"]}
          value={operation}
          onChange={(event) => onOperationChange(event.target.value as TourismOperation)}
        />
        <SelectField
          label="Moeda"
          name="moeda"
          options={[...tourismCurrencies]}
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
        />
        <TextField
          label="Valor aproximado"
          name="valor"
          inputMode="decimal"
          placeholder="Ex.: 2.000"
          hint="Valor na moeda escolhida. Apenas para orientar o atendimento."
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          maxLength={20}
        />
      </div>

      <ActionButton type="submit" size="lg" disabled={loading} className="mt-8 w-full md:w-auto">
        {loading ? "Enviando…" : "Solicitar cotação"}
      </ActionButton>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Ao enviar, você concorda com o tratamento dos seus dados conforme a Política de Privacidade.
        Não pedimos CPF nesta etapa. As condições aplicáveis são apresentadas durante o atendimento.
      </p>
    </form>
  );
}
