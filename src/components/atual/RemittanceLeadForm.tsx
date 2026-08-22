import { useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "./primitives";
import { TextField, SelectField } from "./fields";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { valueRanges } from "@/lib/lead-intents";
import { remittanceCurrencies, remittancePurposes } from "@/lib/exchange-options";
import { buildWhatsappMessage, buildWhatsappUrl, getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";
import { cn } from "@/lib/utils";

/**
 * Lead de Remessa Internacional.
 * O registro no Cloud acontece SEMPRE antes de qualquer handoff para o WhatsApp.
 */
export function RemittanceLeadForm({
  currency,
  purpose,
  onCurrencyChange,
  onPurposeChange,
}: {
  currency: string;
  purpose: string;
  onCurrencyChange: (value: string) => void;
  onPurposeChange: (value: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<"pf" | "pj">("pf");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  function markStart() {
    if (started) return;
    setStarted(true);
    track("remittance_help_start", { moeda: currency, finalidade: purpose });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const lead: LeadInput = {
      nome: get("nome"),
      email: get("email"),
      whatsapp: get("whatsapp"),
      tipo_cliente: profile,
      produto: "Remessa Internacional",
      operacao: "Envio ao exterior",
      moeda: get("moeda") || currency,
      faixa_valor: get("faixa_valor"),
      finalidade: get("finalidade") || purpose,
      source_page: "remessas-internacionais",
      ...(profile === "pj" && get("empresa") ? { empresa: get("empresa") } : {}),
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
      track("remittance_lead_submit", {
        moeda: lead.moeda ?? "",
        finalidade: lead.finalidade ?? "",
        perfil: profile,
      });

      const url = buildWhatsappUrl(links.whatsapp, buildWhatsappMessage(lead));
      if (url) {
        track("remittance_whatsapp", { moeda: lead.moeda ?? "" });
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
      <fieldset>
        <legend className="mb-3 text-sm font-medium text-graphite">Perfil</legend>
        <div className="inline-flex rounded-sm border border-line p-1">
          {(["pf", "pj"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={profile === item}
              onClick={() => setProfile(item)}
              className={cn(
                "min-h-11 rounded-sm px-5 text-sm font-semibold transition-colors",
                profile === item ? "bg-navy text-white" : "text-navy hover:bg-offwhite",
              )}
            >
              {item === "pf" ? "Pessoa Física" : "Pessoa Jurídica"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
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
        {profile === "pj" ? (
          <TextField label="Empresa" name="empresa" maxLength={160} autoComplete="organization" />
        ) : null}
        <SelectField
          label="Moeda de destino"
          name="moeda"
          options={[...remittanceCurrencies]}
          value={currency}
          onChange={(event) => onCurrencyChange(event.target.value)}
        />
        <SelectField label="Valor aproximado" name="faixa_valor" options={valueRanges} />
        <SelectField
          label="Finalidade"
          name="finalidade"
          options={[...remittancePurposes]}
          value={purpose}
          onChange={(event) => onPurposeChange(event.target.value)}
        />
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
