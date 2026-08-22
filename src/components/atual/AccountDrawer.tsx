import { useEffect, useState } from "react";
import { toast } from "sonner";
import { X, ArrowRight, Check } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ActionButton } from "./primitives";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";
import { cn } from "@/lib/utils";

/** Símbolo oficial da marca — trocar o arquivo mantém o componente intacto. */
const BRAND_SYMBOL = "/brand/simbolo.png";

const purposes = [
  { id: "pessoal", label: "Uso pessoal" },
  { id: "remessas", label: "Remessas internacionais" },
  { id: "stablecoins", label: "USDT / USDC" },
  { id: "empresa", label: "Operações da empresa" },
  { id: "outro", label: "Outro" },
] as const;

type PurposeId = (typeof purposes)[number]["id"];

const inputClass =
  "h-13 w-full rounded-[10px] border border-line bg-white px-4 text-base text-graphite outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20";

/** Destino provisório de app já configurado (loja oficial). Sem deeplink inventado. */
function appDestination() {
  if (typeof navigator === "undefined") return links.googlePlay;
  return /iphone|ipad|ipod|mac/i.test(navigator.userAgent) ? links.appStore : links.googlePlay;
}

export function AccountDrawer({
  open,
  onOpenChange,
  context,
  initialProfile = "pf",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context?: string | undefined;
  initialProfile?: "pf" | "pj" | undefined;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<"pf" | "pj">(initialProfile);
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [purpose, setPurpose] = useState<PurposeId | null>(null);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setProfile(initialProfile);
    setPurpose(null);
    setConsent(false);
    setErrors({});
    track("account_drawer_open", { source: context ?? "site" });
  }, [open, initialProfile, context]);

  function validateStep1() {
    const next: Record<string, string> = {};
    if (nome.trim().length < 2) next['nome'] = "Informe seu nome completo.";
    if (whatsapp.replace(/\D/g, "").length < 10) next['whatsapp'] = "Informe um WhatsApp com DDD.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) next['email'] = "Informe um e-mail válido.";
    if (profile === "pj" && empresa.trim().length < 2) next['empresa'] = "Informe o nome da empresa.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function onContinue(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep1()) return;
    setStep(2);
    track("account_drawer_step_2", { tipo_cliente: profile });
  }

  async function onFinish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!purpose) next['finalidade'] = "Selecione uma opção para continuar.";
    if (!consent) next['consent'] = "É necessário concordar para continuar.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const lead: LeadInput = {
      nome: nome.trim(),
      email: email.trim(),
      whatsapp: whatsapp.trim(),
      tipo_cliente: profile,
      produto: "Conta Atual",
      finalidade: purposes.find((p) => p.id === purpose)?.label ?? "Outro",
      ...(profile === "pj" && empresa.trim() ? { empresa: empresa.trim() } : {}),
      source_page: "drawer_conta_atual",
      ...(typeof window !== "undefined" ? { source_url: window.location.href } : {}),
      ...getUtm(),
    };

    setLoading(true);
    try {
      // Lead salvo com status inicial "Novo", sempre ANTES de qualquer handoff.
      await submitLead({ data: lead });
      track("account_lead_submit", { tipo_cliente: profile, finalidade: lead.finalidade ?? "" });
      setStep(3);
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  function goToApp() {
    track("account_drawer_app_click", { tipo_cliente: profile });
    window.open(appDestination(), "_blank", "noopener,noreferrer");
  }

  const stepLabel = step === 1 ? "1 de 2 · Seus dados" : "2 de 2 · Como você pretende usar a conta";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden border-line bg-white p-0 sm:max-w-[500px] [&>button]:hidden"
      >
        {/* Header institucional */}
        <header className="relative isolate overflow-hidden bg-navy px-6 pt-6 pb-7 sm:px-8">
          <img
            src={BRAND_SYMBOL}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-8 -bottom-10 -z-10 h-44 w-auto object-contain opacity-[0.07]"
          />
          <div className="flex items-start justify-between gap-4">
            <img
              src={BRAND_SYMBOL}
              alt="Atual Câmbio"
              className="h-9 w-auto shrink-0 object-contain"
            />
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              aria-label="Fechar"
              className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <p className="mt-6 text-[11px] font-semibold tracking-[0.16em] text-gold uppercase">
            Conta Atual
          </p>
          <SheetTitle className="font-display mt-2 text-[1.75rem] leading-[1.12] font-bold tracking-[-0.02em] text-balance text-white">
            {step === 3 ? "Tudo certo." : "Abra sua Conta Atual."}
          </SheetTitle>
          <SheetDescription className="mt-3 max-w-[38ch] text-sm leading-relaxed text-pretty text-white/70">
            {step === 3
              ? "Agora você pode continuar a abertura da Conta Atual pelo aplicativo."
              : "Comece seu cadastro e continue sua jornada pelo app."}
          </SheetDescription>
        </header>

        {step !== 3 ? (
          <div className="flex items-center gap-3 border-b border-line bg-offwhite px-6 py-3 sm:px-8">
            <span className="text-xs font-semibold tracking-[0.06em] text-navy">{stepLabel}</span>
            <span className="ml-auto flex gap-1.5" aria-hidden>
              <span className="h-1 w-8 rounded-full bg-navy" />
              <span className={cn("h-1 w-8 rounded-full", step === 2 ? "bg-navy" : "bg-navy/15")} />
            </span>
          </div>
        ) : null}

        <div className="flex-1 overflow-y-auto px-6 pt-7 pb-8 sm:px-8">
          {step === 1 ? (
            <form onSubmit={onContinue} noValidate className="flex flex-col gap-6">
              <fieldset>
                <legend className="sr-only">Tipo de conta</legend>
                <div className="grid grid-cols-2 gap-3">
                  {(
                    [
                      { value: "pf", label: "Pessoa Física" },
                      { value: "pj", label: "Pessoa Jurídica" },
                    ] as const
                  ).map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={profile === option.value}
                      onClick={() => setProfile(option.value)}
                      className={cn(
                        "min-h-[48px] rounded-[10px] border px-4 py-3 text-center transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none",
                        profile === option.value
                          ? "border-navy bg-navy text-white"
                          : "border-line bg-offwhite text-navy hover:border-navy/40",
                      )}
                    >
                      <span className="block text-sm font-semibold">{option.label}</span>
                    </button>
                  ))}
                </div>
              </fieldset>


              <Field label="Nome" name="nome" error={errors['nome']}>
                <input
                  id="nome"
                  name="nome"
                  autoComplete="name"
                  maxLength={120}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={Boolean(errors['nome'])}
                  className={cn(inputClass, errors['nome'] && "border-destructive")}
                />
              </Field>

              {profile === "pj" ? (
                <Field label="Empresa" name="empresa" error={errors['empresa']}>
                  <input
                    id="empresa"
                    name="empresa"
                    autoComplete="organization"
                    maxLength={160}
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    aria-invalid={Boolean(errors['empresa'])}
                    className={cn(inputClass, errors['empresa'] && "border-destructive")}
                  />
                </Field>
              ) : null}

              <Field
                label="WhatsApp"
                name="whatsapp"
                error={errors['whatsapp']}
                hint="Com DDD. Usaremos este contato apenas para dar continuidade à sua solicitação."
              >
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  maxLength={30}
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  aria-invalid={Boolean(errors['whatsapp'])}
                  className={cn(inputClass, errors['whatsapp'] && "border-destructive")}
                />
              </Field>

              <Field label="E-mail" name="email" error={errors['email']}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  maxLength={200}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={Boolean(errors['email'])}
                  className={cn(inputClass, errors['email'] && "border-destructive")}
                />
              </Field>

              <ActionButton type="submit" size="lg" className="w-full" event="account_step_1">
                Continuar
                <ArrowRight className="ml-2 size-4" aria-hidden />
              </ActionButton>

              <SpecialistFallback />
            </form>
          ) : null}

          {step === 2 ? (
            <form onSubmit={onFinish} noValidate className="flex flex-col gap-6">
              <fieldset>
                <legend className="mb-3 text-sm font-medium text-graphite">
                  Vai usar a Conta Atual para:
                </legend>
                <div className="flex flex-col gap-2.5">
                  {purposes.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={purpose === option.id}
                      onClick={() => {
                        setPurpose(option.id);
                        track("account_purpose_selected", { finalidade: option.label });
                      }}
                      className={cn(
                        "flex min-h-[52px] items-center justify-between gap-3 rounded-[10px] border px-4 py-3 text-left text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none",
                        purpose === option.id
                          ? "border-navy bg-navy text-white"
                          : "border-line bg-offwhite text-navy hover:border-navy/40",
                      )}
                    >
                      {option.label}
                      {purpose === option.id ? (
                        <Check className="size-4 shrink-0 text-gold" aria-hidden />
                      ) : null}
                    </button>
                  ))}
                </div>
                {errors['finalidade'] ? (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    {errors['finalidade']}
                  </p>
                ) : null}
              </fieldset>

              <div>
                <label className="flex items-start gap-3 text-xs leading-relaxed text-pretty text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-invalid={Boolean(errors['consent'])}
                    className="mt-0.5 size-5 shrink-0 accent-[#01183A]"
                  />
                  <span>
                    Seus dados serão tratados conforme nossa{" "}
                    <a href="/privacidade" className="text-navy underline underline-offset-2">
                      Política de Privacidade
                    </a>
                    .
                  </span>
                </label>
                {errors['consent'] ? (
                  <p role="alert" className="mt-2 text-xs text-destructive">
                    {errors['consent']}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3">
                <ActionButton
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                  event="account_step_2"
                >
                  {loading ? "Enviando…" : "Continuar no app"}
                </ActionButton>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="min-h-11 text-sm text-muted-foreground underline underline-offset-4 hover:text-navy"
                >
                  Voltar
                </button>
              </div>

              <SpecialistFallback />
            </form>
          ) : null}

          {step === 3 ? (
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-3 rounded-[10px] border border-line bg-offwhite p-5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-navy">
                  <Check className="size-4 text-gold" aria-hidden />
                </span>
                <p className="text-sm leading-relaxed text-pretty text-graphite">
                  Recebemos seus dados. A abertura da Conta Atual continua no aplicativo, com o
                  mesmo e-mail informado aqui.
                </p>
              </div>
              <ActionButton
                type="button"
                size="lg"
                className="w-full"
                onClick={goToApp}
                event="account_drawer_app_click"
              >
                Continuar no app
              </ActionButton>
              <SpecialistFallback label="Falar com especialista →" />
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function SpecialistFallback({ label = "Fale com um especialista →" }: { label?: string }) {
  return (
    <p className="text-sm text-muted-foreground">
      Precisa de ajuda?{" "}
      <a
        href="/fale-com-especialista?assunto=conta"
        onClick={() => track("account_specialist_start", { origem: "drawer_conta_atual" })}
        className="font-medium text-navy underline underline-offset-4 hover:text-gold-soft"
      >
        {label}
      </a>
    </p>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string | undefined;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-graphite" htmlFor={name}>
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="mt-2 text-xs leading-relaxed text-pretty text-muted-foreground">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
