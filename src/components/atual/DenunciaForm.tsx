import { useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, Copy, Check } from "lucide-react";
import { ActionButton } from "./primitives";
import { TextField, SelectField, TextareaField } from "./fields";
import { cn } from "@/lib/utils";
import { submitDenuncia, denunciaCategorias, type DenunciaInput } from "@/lib/denuncias.functions";

export function DenunciaForm() {
  const [anonima, setAnonima] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "").trim();

    const payload: DenunciaInput = {
      anonima,
      categoria: get("categoria") as DenunciaInput["categoria"],
      relato: get("relato"),
      ...(get("envolvidos") ? { envolvidos: get("envolvidos") } : {}),
      ...(get("ocorrido_em") ? { ocorrido_em: get("ocorrido_em") } : {}),
      ...(get("local") ? { local: get("local") } : {}),
      ...(anonima
        ? {}
        : {
            ...(get("nome") ? { nome: get("nome") } : {}),
            ...(get("email") ? { email: get("email") } : {}),
            ...(get("telefone") ? { telefone: get("telefone") } : {}),
          }),
    };

    const nextErrors: Record<string, string> = {};
    if (payload.relato.length < 20)
      nextErrors['relato'] = "Descreva o ocorrido com pelo menos 20 caracteres.";
    if (!anonima) {
      if (!payload.nome || payload.nome.length < 2) nextErrors['nome'] = "Informe seu nome.";
      if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email))
        nextErrors['email'] = "Informe um e-mail válido para retorno.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const result = await submitDenuncia({ data: payload });
      if (!result.ok || !result.protocolo) throw new Error("falha");
      setProtocolo(result.protocolo);
    } catch {
      toast.error("Não foi possível registrar agora. Tente novamente em instantes.");
    } finally {
      setLoading(false);
    }
  }

  if (protocolo) {
    return (
      <div className="rounded-2xl border border-navy/10 bg-navy/[0.03] p-6 md:p-8">
        <h2 className="text-xl font-bold text-navy">Denúncia registrada</h2>
        <p className="mt-3 text-base leading-[1.65] text-muted-foreground">
          Guarde o número de protocolo abaixo. Ele é a única forma de acompanhar a apuração caso
          você tenha optado pelo anonimato.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <code className="rounded-md border border-line bg-white px-4 py-3 text-base font-semibold tracking-wide text-navy">
            {protocolo}
          </code>
          <ActionButton
            type="button"
            variant="secondary"
            onClick={() => {
              void navigator.clipboard.writeText(protocolo);
              setCopied(true);
              toast.success("Protocolo copiado.");
            }}
          >
            {copied ? (
              <Check className="size-4 shrink-0" aria-hidden />
            ) : (
              <Copy className="size-4 shrink-0" aria-hidden />
            )}
            Copiar protocolo
          </ActionButton>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-navy/10 bg-navy/[0.03] p-6 md:p-8"
    >
      <h2 className="text-xl font-bold text-navy">Registrar uma denúncia</h2>
      <p className="mt-3 text-base leading-[1.65] text-muted-foreground">
        Você pode se identificar ou enviar o relato de forma totalmente anônima. Em ambos os casos,
        o tratamento é sigiloso e a retaliação é proibida.
      </p>

      <fieldset className="mt-6">
        <legend className="sr-only">Forma de envio</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              { value: true, label: "Denúncia anônima", hint: "Nenhum dado de contato é gravado." },
              { value: false, label: "Quero me identificar", hint: "Recebe retorno pelo contato informado." },
            ] as const
          ).map((option) => (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={anonima === option.value}
              onClick={() => setAnonima(option.value)}
              className={cn(
                "rounded-[10px] border px-4 py-3 text-left transition-colors focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:outline-none",
                anonima === option.value
                  ? "border-navy bg-navy text-white"
                  : "border-line bg-white text-navy hover:border-navy/40",
              )}
            >
              <span className="block text-sm font-semibold">{option.label}</span>
              <span
                className={cn(
                  "mt-1 block text-xs leading-relaxed",
                  anonima === option.value ? "text-white/70" : "text-muted-foreground",
                )}
              >
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 space-y-6">
        {!anonima ? (
          <>
            <TextField label="Nome" name="nome" error={errors['nome']} autoComplete="name" maxLength={120} />
            <TextField
              label="E-mail"
              name="email"
              type="email"
              error={errors['email']}
              autoComplete="email"
              maxLength={200}
            />
            <TextField
              label="Telefone (opcional)"
              name="telefone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={30}
            />
          </>
        ) : null}

        <SelectField label="Categoria" name="categoria" options={[...denunciaCategorias]} />
        <TextareaField
          label="O que aconteceu"
          name="relato"
          error={errors['relato']}
          hint="Descreva com o máximo de detalhes: fatos, datas e evidências que você conheça."
          maxLength={4000}
        />
        <TextField
          label="Pessoas ou áreas envolvidas (opcional)"
          name="envolvidos"
          maxLength={300}
        />
        <div className="grid gap-6 sm:grid-cols-2">
          <TextField label="Quando ocorreu (opcional)" name="ocorrido_em" type="date" />
          <TextField label="Onde ocorreu (opcional)" name="local" maxLength={160} />
        </div>
      </div>

      <ActionButton type="submit" size="lg" disabled={loading} className="mt-8 w-full sm:w-auto">
        {loading ? "Enviando…" : "Enviar denúncia"}
      </ActionButton>

      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
        O relato é recebido por um comitê independente. Ao final, você recebe um número de protocolo
        para acompanhar a apuração, mesmo no envio anônimo.
      </p>
    </form>
  );
}
