import { useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "./primitives";
import { TextField, SelectField } from "./fields";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { valueRanges } from "@/lib/lead-intents";
import { buildWhatsappMessage, buildWhatsappUrl, getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export type StablecoinAsset = "USDT" | "USDC";
export type StablecoinOperation = "Comprar" | "Vender";

export function StablecoinLeadForm({
  asset,
  operation,
  onAssetChange,
  onOperationChange,
}: {
  asset: StablecoinAsset;
  operation: StablecoinOperation;
  onAssetChange: (value: StablecoinAsset) => void;
  onOperationChange: (value: StablecoinOperation) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  function markStart() {
    if (started) return;
    setStarted(true);
    track("stablecoin_help_start", { ativo: asset, operacao: operation });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const selectedAsset = (get("ativo") || asset) as StablecoinAsset;
    const selectedOperation = (get("operacao") || operation) as StablecoinOperation;

    const lead: LeadInput = {
      nome: get("nome"),
      email: get("email"),
      whatsapp: get("whatsapp"),
      tipo_cliente: "pf",
      produto: "stablecoins",
      operacao: `${selectedOperation} ${selectedAsset}`,
      moeda: selectedAsset,
      faixa_valor: get("faixa_valor"),
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
      // O lead é sempre registrado ANTES de qualquer handoff para o WhatsApp.
      await submitLead({ data: lead });
      track("stablecoin_lead_submit", {
        ativo: selectedAsset,
        operacao: selectedOperation === "Comprar" ? "buy" : "sell",
        faixa_valor: lead.faixa_valor ?? "",
      });

      const url = buildWhatsappUrl(links.whatsapp, buildWhatsappMessage(lead));
      if (url) {
        track("stablecoin_whatsapp", { ativo: selectedAsset, operacao: selectedOperation });
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.success("Recebemos seus dados. Um especialista vai continuar com você.");
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
          label="Ativo"
          name="ativo"
          options={["USDt", "USDc"]}
          value={asset}
          onChange={(event) => onAssetChange(event.target.value as StablecoinAsset)}
        />
        <SelectField
          label="Operação"
          name="operacao"
          options={["Comprar", "Vender"]}
          value={operation}
          onChange={(event) => onOperationChange(event.target.value as StablecoinOperation)}
        />
        <SelectField label="Faixa aproximada de valor" name="faixa_valor" options={valueRanges} />
      </div>

      <ActionButton type="submit" size="lg" disabled={loading} className="mt-8 w-full md:w-auto">
        {loading ? "Enviando…" : "Falar com especialista"}
      </ActionButton>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Ao enviar, você concorda com o tratamento dos seus dados conforme a Política de Privacidade.
        Não pedimos CPF nesta etapa.
      </p>
    </form>
  );
}
