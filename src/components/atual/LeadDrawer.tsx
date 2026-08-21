import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ActionButton } from "./primitives";
import { submitLead } from "@/lib/leads.functions";

const currencies = ["USD", "EUR", "GBP", "USDT", "USDC", "Outra"];
const ranges = [
  "Até R$ 10 mil",
  "R$ 10 mil a R$ 50 mil",
  "R$ 50 mil a R$ 250 mil",
  "Acima de R$ 250 mil",
  "Ainda não sei",
];
const needsPF = [
  "Enviar dinheiro para o exterior",
  "Receber dinheiro do exterior",
  "Comprar USDT ou USDC",
  "Moeda para viagem",
  "Outra necessidade",
];
const needsPJ = [
  "Pagar fornecedor no exterior",
  "Receber de cliente no exterior",
  "Operar com USDT ou USDC",
  "Estruturar câmbio recorrente",
  "Outra operação",
];

const fieldClass =
  "min-h-13 w-full rounded-sm border border-line bg-white px-4 text-base text-graphite outline-none transition-colors focus:border-navy";
const labelClass = "mb-2 block text-sm font-medium text-graphite";

export function LeadDrawer({
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
  const [profile, setProfile] = useState<"pf" | "pj">(initialProfile);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) setProfile(initialProfile);
  }, [open, initialProfile]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data = {
      profile,
      name: String(form.get("name") ?? "").trim(),
      company: String(form.get("company") ?? "").trim(),
      whatsapp: String(form.get("whatsapp") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      need: String(form.get("need") ?? ""),
      currency: String(form.get("currency") ?? ""),
      range: String(form.get("range") ?? ""),
      context,
    };

    const nextErrors: Record<string, string> = {};
    if (data.name.length < 2) nextErrors['name'] = "Informe seu nome completo.";
    if (profile === "pj" && (data.company?.length ?? 0) < 2)
      nextErrors['company'] = "Informe o nome da empresa.";
    if (data.whatsapp.replace(/\D/g, "").length < 10)
      nextErrors['whatsapp'] = "Informe um WhatsApp com DDD.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) nextErrors['email'] = "Informe um e-mail válido.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      await submitLead({ data });
      // [AGUARDANDO VALIDAÇÃO] handoff para WhatsApp contextualizado após salvar o lead.
      toast.success("Recebemos seus dados. Um especialista vai continuar com você.");
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  const needs = profile === "pj" ? needsPJ : needsPF;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-line bg-white sm:max-w-[480px]"
      >
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="font-display text-2xl leading-tight text-navy">
            Falar com especialista
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {context
              ? `${context} — conte o essencial e seguimos com você.`
              : "Conte o essencial. Pedimos só o necessário agora."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-5 px-6 pt-2 pb-8" noValidate>
          <div
            role="tablist"
            aria-label="Perfil"
            className="grid grid-cols-2 gap-1 rounded-sm bg-offwhite p-1"
          >
            {(["pf", "pj"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={profile === value}
                onClick={() => setProfile(value)}
                className={`min-h-11 rounded-sm text-sm font-medium transition-colors ${
                  profile === value ? "bg-navy text-white" : "text-muted-foreground hover:text-navy"
                }`}
              >
                {value === "pf" ? "Pessoa" : "Empresa"}
              </button>
            ))}
          </div>

          <Field label="Nome" name="name" error={errors['name']} autoComplete="name" />
          {profile === "pj" ? (
            <Field label="Empresa" name="company" error={errors['company']} autoComplete="organization" />
          ) : null}
          <Field
            label="WhatsApp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            error={errors['whatsapp']}
            hint="Com DDD. Usamos apenas para falar sobre a sua operação."
            autoComplete="tel"
          />
          <Field label="E-mail" name="email" type="email" error={errors['email']} autoComplete="email" />

          <div>
            <label className={labelClass} htmlFor="need">
              {profile === "pj" ? "Operação" : "Necessidade"}
            </label>
            <select id="need" name="need" className={fieldClass} defaultValue={needs[0]}>
              {needs.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="currency">
                Moeda
              </label>
              <select id="currency" name="currency" className={fieldClass} defaultValue="USD">
                {currencies.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="range">
                Faixa de valor
              </label>
              <select id="range" name="range" className={fieldClass} defaultValue={ranges[0]}>
                {ranges.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <ActionButton type="submit" size="lg" disabled={loading} event="lead_submit">
            {loading ? "Enviando…" : "Enviar e falar com especialista"}
          </ActionButton>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ao enviar, você concorda com o contato da Atual sobre a sua operação. Tratamos seus dados
            conforme a LGPD.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  error?: string | undefined;
  hint?: string | undefined;
  type?: string | undefined;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const describedBy = [hint ? `${name}-hint` : null, error ? `${name}-error` : null]
    .filter(Boolean)
    .join(" ");
  return (
    <div>
      <label className={labelClass} htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy || undefined}
        className={`${fieldClass} ${error ? "border-destructive" : ""}`}
        {...rest}
      />
      {hint ? (
        <p id={`${name}-hint`} className="mt-2 text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${name}-error`} className="mt-2 text-xs font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
