import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { ActionButton } from "./primitives";
import { TextField, SelectField } from "./fields";
import { submitLead, type LeadInput } from "@/lib/leads.functions";
import { getLeadIntent, leadIntents, type LeadIntentId } from "@/lib/lead-intents";
import { buildWhatsappMessage, buildWhatsappUrl, getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export function LeadDrawer({
  open,
  onOpenChange,
  intentId,
  context,
  initialProfile = "pf",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intentId?: LeadIntentId | undefined;
  context?: string | undefined;
  initialProfile?: "pf" | "pj" | undefined;
}) {
  const [selected, setSelected] = useState<LeadIntentId>(intentId ?? "duvida");
  const [profile, setProfile] = useState<"pf" | "pj">(initialProfile);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const intent = useMemo(() => getLeadIntent(selected), [selected]);

  useEffect(() => {
    if (!open) return;
    const next = intentId ?? "duvida";
    setSelected(next);
    const config = getLeadIntent(next);
    setProfile(config.tipoCliente === "ambos" ? initialProfile : config.tipoCliente);
    setErrors({});
  }, [open, intentId, initialProfile]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim() || undefined;

    const lead: LeadInput = {
      nome: get("nome") ?? "",
      email: get("email") ?? "",
      whatsapp: get("whatsapp") ?? "",
      tipo_cliente: profile,
      produto: intent.produto,
      ...(get("empresa") ? { empresa: get("empresa")! } : {}),
      ...(get("operacao") ? { operacao: get("operacao")! } : {}),
      ...(get("moeda") ? { moeda: get("moeda")! } : {}),
      ...(get("faixa_valor") ? { faixa_valor: get("faixa_valor")! } : {}),
      ...(get("finalidade") ? { finalidade: get("finalidade")! } : {}),
      ...(get("prazo") ? { prazo: get("prazo")! } : {}),
      ...(context ? { finalidade: get("finalidade") ?? context } : {}),
      ...getUtm(),
    };

    const nextErrors: Record<string, string> = {};
    if (lead.nome.length < 2) nextErrors['nome'] = "Informe seu nome completo.";
    if (lead.whatsapp.replace(/\D/g, "").length < 10)
      nextErrors['whatsapp'] = "Informe um WhatsApp com DDD.";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) nextErrors['email'] = "Informe um e-mail válido.";
    for (const field of intent.fields) {
      if (field.required && !lead[field.name]) nextErrors[field.name] = "Campo obrigatório.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      // O lead é sempre salvo ANTES de qualquer handoff.
      await submitLead({ data: lead });
      track(intent.id === "empresa" ? "business_lead_submit" : "specialist_start", {
        produto: lead.produto,
        tipo_cliente: lead.tipo_cliente,
      });

      const message = buildWhatsappMessage(lead);
      const url = buildWhatsappUrl(links.whatsapp, message);
      if (url) {
        track("whatsapp_click", { produto: lead.produto });
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        // [AGUARDANDO VALIDAÇÃO] número oficial de WhatsApp para o handoff automático.
        toast.success("Recebemos seus dados. Um especialista vai continuar com você.");
      }
      onOpenChange(false);
    } catch {
      toast.error("Não foi possível enviar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  const showProfile = intent.tipoCliente === "ambos";
  const fields = intent.fields.filter((f) => f.name !== "empresa" || profile === "pj");
  const needsCompany = profile === "pj" && !intent.fields.some((f) => f.name === "empresa");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 overflow-hidden border-0 bg-white p-0 sm:max-w-[500px] [&>button]:hidden"
      >
        <header className="relative isolate overflow-hidden bg-navy px-6 pt-6 pb-7 sm:px-8">
          <img
            src={BRAND_SYMBOL}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-8 -bottom-10 -z-10 h-44 w-auto object-contain opacity-[0.07]"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="absolute top-5 right-4 grid size-11 place-items-center rounded-full text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <X className="size-5" aria-hidden />
          </button>
          <div className="flex flex-col items-center text-center">
            <img src={BRAND_SYMBOL} alt="Atual Câmbio" className="h-10 w-auto shrink-0 object-contain" />
            <SheetTitle className="font-display mt-4 text-xl leading-[1.15] font-bold tracking-[-0.01em] text-balance text-white sm:text-[1.375rem]">
              {intent.formTitle}
            </SheetTitle>
            <SheetDescription className="mt-3 max-w-[38ch] text-sm leading-relaxed text-pretty text-white/70">
              {context ?? "Conte o essencial. Pedimos só o necessário agora."}
            </SheetDescription>
          </div>
        </header>

        <form
          onSubmit={onSubmit}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-7 pb-8 sm:px-8"
          noValidate
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-graphite" htmlFor="intent">
              O que você precisa fazer
            </label>
            <select
              id="intent"
              className="h-13 w-full rounded-[10px] border border-line bg-white px-4 text-base text-graphite outline-none transition-colors focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
              value={selected}
              onChange={(event) => {
                const value = event.target.value as LeadIntentId;
                setSelected(value);
                const config = getLeadIntent(value);
                if (config.tipoCliente !== "ambos") setProfile(config.tipoCliente);
                track("intent_selected", { intent: value });
              }}
            >
              {leadIntents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {showProfile ? (
            <fieldset>
              <legend className="sr-only">Perfil</legend>
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
          ) : null}


          <TextField label="Nome" name="nome" error={errors['nome']} autoComplete="name" maxLength={120} />
          <TextField
            label="WhatsApp"
            name="whatsapp"
            type="tel"
            inputMode="tel"
            error={errors['whatsapp']}
            hint="Com DDD. Usamos apenas para falar sobre a sua operação."
            autoComplete="tel"
            maxLength={30}
          />
          <TextField label="E-mail" name="email" type="email" error={errors['email']} autoComplete="email" maxLength={200} />

          {needsCompany ? (
            <TextField label="Empresa" name="empresa" autoComplete="organization" maxLength={160} />
          ) : null}

          {fields.map((field) =>
            field.type === "select" ? (
              <SelectField
                key={field.name}
                label={field.label}
                name={field.name}
                options={field.options ?? []}
                error={errors[field.name]}
              />
            ) : (
              <TextField
                key={field.name}
                label={field.label}
                name={field.name}
                error={errors[field.name]}
                maxLength={300}
              />
            ),
          )}

          <ActionButton type="submit" size="lg" disabled={loading} event="lead_submit">
            {loading ? "Enviando…" : "Enviar e falar com especialista"}
          </ActionButton>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Ao enviar, você concorda com o tratamento dos seus dados conforme a Política de
            Privacidade. Não pedimos CPF ou CNPJ nesta etapa.
          </p>
        </form>
      </SheetContent>
    </Sheet>
  );
}
