import { useState } from "react";
import { toast } from "sonner";
import { ActionButton } from "./primitives";
import { TextField, SelectField } from "./fields";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { buildWhatsappMessage, buildWhatsappUrl, getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export const accountSubjects = [
  "Conta Atual",
  "Remessa Internacional",
  "USDT / USDC",
  "Operação empresarial",
  "Câmbio Turismo",
  "Outro",
] as const;

export type AccountSubject = (typeof accountSubjects)[number];

export function AccountLeadForm({ defaultSubject = "Conta Atual" }: { defaultSubject?: AccountSubject }) {
  const [profile, setProfile] = useState<"pf" | "pj">("pf");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  function markStart() {
    if (started) return;
    setStarted(true);
    track("account_specialist_start", { origem: "formulario" });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const assunto = get("assunto") || defaultSubject;
    const empresa = get("empresa");

    const lead: LeadInput = {
      nome: get("nome"),
      email: get("email"),
      whatsapp: get("whatsapp"),
      tipo_cliente: profile,
      produto: "Conta Atual",
      operacao: assunto,
      ...(profile === "pj" && empresa ? { empresa } : {}),
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
      track("account_lead_submit", { assunto, tipo_cliente: profile });

      const url = buildWhatsappUrl(links.whatsapp, buildWhatsappMessage(lead));
      if (url) {
        track("account_whatsapp", { assunto });
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
      <div
        role="group"
        aria-label="Perfil"
        className="mb-6 grid max-w-xs grid-cols-2 gap-1 rounded-sm bg-offwhite p-1"
      >
        {(["pf", "pj"] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={profile === value}
            onClick={() => setProfile(value)}
            className={`min-h-11 rounded-sm text-sm font-medium transition-colors ${
              profile === value ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
            }`}
          >
            {value === "pf" ? "Pessoa física" : "Empresa"}
          </button>
        ))}
      </div>

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
        <SelectField label="Assunto" name="assunto" options={[...accountSubjects]} />
        {profile === "pj" ? (
          <TextField label="Empresa" name="empresa" autoComplete="organization" maxLength={160} />
        ) : null}
      </div>

      <ActionButton type="submit" size="lg" disabled={loading} className="mt-8 w-full md:w-auto">
        {loading ? "Enviando…" : "Falar com especialista"}
      </ActionButton>
      <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
        Ao enviar, você concorda com o tratamento dos seus dados conforme a Política de Privacidade.
        Não pedimos CPF, senha ou dados bancários nesta etapa.
      </p>
    </form>
  );
}
