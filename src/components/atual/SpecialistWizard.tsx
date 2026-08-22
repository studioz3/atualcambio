import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, MessageCircle, ShieldAlert } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ActionButton } from "./primitives";
import { TextField, SelectField, TextareaField } from "./fields";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import {
  getSubject,
  specialistSubjects,
  type SpecialistSubjectId,
  type WizardFieldName,
} from "@/lib/specialist-subjects";
import { buildWhatsappMessage, buildWhatsappUrl, getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { contact, links } from "@/content/site";
import { cn } from "@/lib/utils";

export type SpecialistPrefill = {
  assunto?: string | undefined;
  perfil?: string | undefined;
  ativo?: string | undefined;
  operacao?: string | undefined;
  moeda?: string | undefined;
};

type Profile = "pf" | "pj";

const profileOptions: { id: Profile; label: string; description: string }[] = [
  { id: "pf", label: "Pessoa física", description: "Atendimento para você e sua família." },
  { id: "pj", label: "Empresa", description: "Operações em nome de uma empresa." },
];

function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

export function SpecialistWizard({
  initialSubject,
  prefill,
}: {
  initialSubject?: SpecialistSubjectId | undefined;
  prefill?: SpecialistPrefill;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subjectId, setSubjectId] = useState<SpecialistSubjectId | null>(initialSubject ?? null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState<{ url: string | null } | null>(null);
  const stepRef = useRef<HTMLDivElement>(null);

  const subject = useMemo(() => (subjectId ? getSubject(subjectId) : undefined), [subjectId]);

  useEffect(() => {
    if (!initialSubject) return;
    const config = getSubject(initialSubject);
    if (config?.suggestedProfile) setProfile(config.suggestedProfile);
  }, [initialSubject]);

  useEffect(() => {
    const param = prefill?.perfil?.toLowerCase();
    if (param === "pf" || param === "pj") setProfile(param);
  }, [prefill?.perfil]);

  const step = done ? 3 : !profile ? 1 : !subject ? 2 : 3;

  function markStart() {
    if (started) return;
    setStarted(true);
    track("specialist_form_start", { customer_type: profile ?? "", subject: subjectId ?? "" });
  }

  function defaultFor(name: WizardFieldName): string | undefined {
    if (name === "moeda") {
      if (subjectId === "stablecoins") return prefill?.ativo?.toUpperCase();
      return prefill?.moeda?.toUpperCase();
    }
    if (name === "operacao" && prefill?.operacao) return titleCase(prefill.operacao);
    return undefined;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!subject || !profile) return;
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const consent = form.get("consentimento") === "on";

    const lead: LeadInput = {
      nome: get("nome"),
      email: get("email"),
      whatsapp: get("whatsapp"),
      tipo_cliente: profile,
      produto: subject.produto,
      source_page: "fale-com-especialista",
      ...(get("empresa") ? { empresa: get("empresa") } : {}),
      ...(get("operacao") ? { operacao: get("operacao") } : {}),
      ...(get("moeda") ? { moeda: get("moeda") } : {}),
      ...(get("faixa_valor") ? { faixa_valor: get("faixa_valor") } : {}),
      ...(get("finalidade") ? { finalidade: get("finalidade") } : {}),
      ...(get("prazo") ? { prazo: get("prazo") } : {}),
      ...(get("mensagem") ? { mensagem: get("mensagem") } : {}),
      ...getUtm(),
    };

    const nextErrors: Record<string, string> = {};
    if (lead.nome.length < 2) nextErrors["nome"] = "Informe seu nome completo.";
    if (lead.whatsapp.replace(/\D/g, "").length < 10)
      nextErrors["whatsapp"] = "Informe um WhatsApp com DDD.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email))
      nextErrors["email"] = "Informe um e-mail válido.";
    for (const field of subject.fields) {
      if (field.required && !lead[field.name]) nextErrors[field.name] = "Campo obrigatório.";
    }
    if (!consent) nextErrors["consentimento"] = "É necessário autorizar para continuarmos.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      // O lead é sempre salvo ANTES de qualquer handoff para o WhatsApp.
      await submitLead({ data: lead });
      track("specialist_lead_saved", {
        customer_type: profile,
        subject: subject.id,
        asset: subject.id === "stablecoins" ? (lead.moeda ?? "") : "",
        operation: lead.operacao ?? "",
        currency: lead.moeda ?? "",
        value_range: lead.faixa_valor ?? "",
        source_page: "fale-com-especialista",
      });
      track("specialist_form_complete", { customer_type: profile, subject: subject.id });
      setDone({ url: buildWhatsappUrl(links.whatsapp, buildWhatsappMessage(lead)) });
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return <Confirmation url={done.url} />;
  }

  return (
    <div ref={stepRef}>
      <ProgressIndicator step={step} />

      {/* Etapa 1 — perfil */}
      <fieldset className="mt-10">
        <legend className="display-h3 text-navy">Você está falando como:</legend>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {profileOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={profile === option.id}
              onClick={() => {
                setProfile(option.id);
                track("specialist_customer_type", { customer_type: option.id });
              }}
              className={cn(
                "min-h-20 rounded-lg border p-5 text-left transition-colors",
                profile === option.id
                  ? "border-gold bg-gold/8"
                  : "border-line hover:border-navy/40",
              )}
            >
              <span className="block text-base font-semibold text-navy">{option.label}</span>
              <span className="mt-1 block text-sm text-muted-foreground">{option.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {/* Etapa 2 — assunto */}
      {profile ? (
        <fieldset className="mt-12 animate-in fade-in duration-300">
          <legend className="display-h3 text-navy">Sobre o que você quer falar?</legend>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {specialistSubjects.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={subjectId === item.id}
                onClick={() => {
                  setSubjectId(item.id);
                  setErrors({});
                  track("specialist_subject_selected", {
                    subject: item.id,
                    customer_type: profile,
                  });
                  track("specialist_form_step_2", { subject: item.id });
                }}
                className={cn(
                  "min-h-24 rounded-lg border p-5 text-left transition-colors",
                  subjectId === item.id
                    ? "border-gold bg-gold/8"
                    : "border-line hover:border-navy/40",
                )}
              >
                <span className="block text-base font-semibold text-navy">{item.label}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.description}</span>
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      {/* Etapa 3 — campos */}
      {profile && subject ? (
        <form
          onSubmit={onSubmit}
          onFocus={markStart}
          noValidate
          className="mt-12 animate-in fade-in duration-300 rounded-lg border border-line bg-white p-6 md:p-9"
        >
          <h3 className="display-h4 text-navy">Seus dados</h3>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <TextField
              label="Nome"
              name="nome"
              autoComplete="name"
              maxLength={120}
              error={errors["nome"]}
            />
            <TextField
              label="WhatsApp"
              name="whatsapp"
              type="tel"
              inputMode="tel"
              hint="Com DDD."
              autoComplete="tel"
              maxLength={30}
              error={errors["whatsapp"]}
            />
            <TextField
              label="E-mail"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={200}
              error={errors["email"]}
            />
            {subject.fields.map((field) => {
              if (field.type === "text") {
                return (
                  <TextField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    maxLength={field.maxLength ?? 160}
                    error={errors[field.name]}
                    {...(field.hint ? { hint: field.hint } : {})}
                  />
                );
              }
              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="md:col-span-2">
                    <TextareaField
                      label={field.label}
                      name={field.name}
                      maxLength={field.maxLength ?? 400}
                      error={errors[field.name]}
                      {...(field.hint ? { hint: field.hint } : {})}
                    />
                  </div>
                );
              }
              return (
                <SelectField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  options={field.options ?? []}
                  defaultValue={defaultFor(field.name)}
                  error={errors[field.name]}
                />
              );
            })}
          </div>

          <p className="mt-7 flex gap-3 rounded-sm border border-line bg-offwhite/60 p-4 text-sm text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            Nunca envie senhas, códigos de acesso ou credenciais financeiras por este formulário.
          </p>

          <div className="mt-6">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-muted-foreground">
              <input
                type="checkbox"
                name="consentimento"
                aria-invalid={Boolean(errors["consentimento"])}
                className="mt-1 size-5 shrink-0 rounded-sm border border-line accent-[color:var(--color-navy,#01183A)]"
              />
              <span>
                Autorizo a Atual a utilizar meus dados para atender esta solicitação, conforme a{" "}
                <Link to="/privacidade" className="text-navy underline underline-offset-4">
                  Política de Privacidade
                </Link>
                .
              </span>
            </label>
            {errors["consentimento"] ? (
              <p role="alert" className="mt-2 text-xs text-destructive">
                {errors["consentimento"]}
              </p>
            ) : null}
          </div>

          <ActionButton type="submit" size="lg" disabled={loading} className="mt-8 w-full md:w-auto">
            {loading ? "Enviando…" : "Enviar e falar com especialista"}
          </ActionButton>

          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            Atendimento: {contact.hours} Não pedimos CPF, CNPJ ou dados bancários nesta etapa.
          </p>
        </form>
      ) : null}
    </div>
  );
}

function ProgressIndicator({ step }: { step: number }) {
  return (
    <div>
      <p className="text-sm font-semibold text-muted-foreground">{step} de 3</p>
      <div className="mt-3 flex gap-2" aria-hidden>
        {[1, 2, 3].map((item) => (
          <span
            key={item}
            className={cn(
              "h-1 w-16 rounded-full transition-colors",
              item <= step ? "bg-gold" : "bg-line",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function Confirmation({ url }: { url: string | null }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="rounded-lg border border-line bg-white p-7 md:p-10">
      <span className="inline-flex size-11 items-center justify-center rounded-full bg-gold/12 text-gold">
        <Check className="size-5" aria-hidden />
      </span>
      <h2 className="display-h3 mt-6 text-navy">Recebemos suas informações.</h2>
      <p className="body-lg mt-4 text-muted-foreground">
        Agora você pode continuar a conversa pelo WhatsApp com o contexto da sua solicitação.
      </p>

      {url ? (
        <ActionButton
          size="lg"
          className="mt-8 w-full md:w-auto"
          onClick={() => {
            track("specialist_whatsapp_click", {});
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          <MessageCircle className="size-4" aria-hidden />
          Continuar pelo WhatsApp
        </ActionButton>
      ) : (
        <div className="mt-8 rounded-sm border border-line bg-offwhite/60 p-5">
          <p className="text-sm text-muted-foreground">
            Sua solicitação já está registrada com a nossa equipe. Se preferir, você também pode
            falar com a gente por e-mail.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${contact.email}`}
              className="text-base font-semibold text-navy underline underline-offset-4"
            >
              {contact.email}
            </a>
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard?.writeText(contact.email);
                setCopied(true);
              }}
              className="inline-flex min-h-10 items-center gap-2 rounded-sm border border-navy/25 px-4 text-sm font-semibold text-navy hover:bg-navy/5"
            >
              <Copy className="size-4" aria-hidden />
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-xs text-muted-foreground">
        Registro concluído: seus dados já estão com o nosso time, mesmo que o WhatsApp não abra.
      </p>
    </div>
  );
}
