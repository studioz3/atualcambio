import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Container, Section, Eyebrow, ActionButton, ActionLink } from "@/components/atual/primitives";
import { SITE_URL, editorias, type EditoriaId } from "@/content/editorial";
import { subscribeNewsletter } from "@/lib/newsletter.functions";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter da Atual | Escolha o que quer acompanhar" },
      {
        name: "description",
        content:
          "Receba Momento Atual, Cripto Wine e Vida Atual de acordo com os temas que fazem sentido para você.",
      },
      { property: "og:title", content: "Newsletter da Atual | Escolha o que quer acompanhar" },
      {
        property: "og:description",
        content: "Preferências editoriais: economia, vinho e tecnologia, wellness.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/newsletter` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/newsletter` }],
  }),
  component: Newsletter,
});

type Prefs = Record<EditoriaId, boolean>;

function Newsletter() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [prefs, setPrefs] = useState<Prefs>({
    "momento-atual": false,
    "cripto-wine": false,
    "vida-atual": false,
  });
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    track("newsletter_view", { source_page: "newsletter" });
  }, []);

  const toggle = (id: EditoriaId) => {
    setPrefs((p) => {
      const next = { ...p, [id]: !p[id] };
      if (next[id]) track("newsletter_preference_selected", { editoria: id });
      return next;
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!Object.values(prefs).some(Boolean)) {
      setError("Selecione ao menos uma editoria.");
      return;
    }
    if (!consent) {
      setError("É necessário autorizar o envio para concluir a inscrição.");
      return;
    }
    setStatus("sending");
    try {
      const params = new URLSearchParams(
        typeof window !== "undefined" ? window.location.search : "",
      );
      await subscribeNewsletter({
        data: {
          nome,
          email,
          momento_atual: prefs["momento-atual"],
          cripto_wine: prefs["cripto-wine"],
          vida_atual: prefs["vida-atual"],
          consentimento: true,
          origem: "newsletter",
          source_url: typeof window !== "undefined" ? window.location.href : "",
          utm_source: params.get("utm_source") ?? undefined,
          utm_medium: params.get("utm_medium") ?? undefined,
          utm_campaign: params.get("utm_campaign") ?? undefined,
          utm_content: params.get("utm_content") ?? undefined,
          utm_term: params.get("utm_term") ?? undefined,
        },
      });
      track("newsletter_signup", {
        momento_atual: prefs["momento-atual"],
        cripto_wine: prefs["cripto-wine"],
        vida_atual: prefs["vida-atual"],
        source_page: "newsletter",
      });
      setStatus("done");
    } catch {
      setStatus("error");
      setError("Não foi possível concluir agora. Tente novamente em instantes.");
    }
  };

  return (
    <>
      <section className="surface-navy pt-[130px] pb-16 md:pt-[170px] md:pb-20">
        <Container>
          <div className="max-w-2xl">
            <Eyebrow>Newsletter</Eyebrow>
            <h1 className="hero-title mt-6 text-white">Escolha o que quer acompanhar.</h1>
            <p className="hero-copy mt-6 text-white/85">
              Receba conteúdos da Atual de acordo com os temas que fazem sentido para você.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="light">
        {status === "done" ? (
          <div className="max-w-2xl">
            <CheckCircle2 className="size-8 text-gold" aria-hidden />
            <h2 className="display-h2 mt-5 text-navy">Inscrição registrada.</h2>
            <p className="body-lg mt-5 text-muted-foreground">
              Você receberá apenas as editorias selecionadas. É possível alterar as preferências ou
              cancelar a qualquer momento pelos links de cada envio.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <ActionLink to="/conteudo">Ver conteúdos</ActionLink>
              <ActionLink to="/privacidade" variant="secondary">
                Política de Privacidade
              </ActionLink>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="max-w-2xl">
            <div className="grid gap-6 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-semibold text-navy">Nome</span>
                <input
                  required
                  minLength={2}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="mt-2 min-h-12 w-full rounded-sm border border-line px-4 text-base text-navy focus:border-navy focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold text-navy">E-mail</span>
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 min-h-12 w-full rounded-sm border border-line px-4 text-base text-navy focus:border-navy focus:outline-none"
                />
              </label>
            </div>

            <fieldset className="mt-10">
              <legend className="text-sm font-semibold text-navy">Preferências editoriais</legend>
              <p className="mt-2 text-sm text-muted-foreground">
                Selecione uma ou mais editorias.
              </p>
              <div className="mt-6 space-y-4">
                {editorias.map((e) => (
                  <label
                    key={e.id}
                    className="flex cursor-pointer items-start gap-4 rounded-xl border border-line p-5 transition-colors hover:border-navy"
                  >
                    <input
                      type="checkbox"
                      checked={prefs[e.id]}
                      onChange={() => toggle(e.id)}
                      className="mt-1 size-5 accent-[var(--gold)]"
                    />
                    <span>
                      <span className="block font-semibold text-navy">{e.name}</span>
                      <span className="mt-1 block text-sm text-muted-foreground">
                        {e.shortDescription}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="mt-10 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={() => setConsent((v) => !v)}
                className="mt-1 size-5 accent-[var(--gold)]"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                Autorizo a Atual Câmbio a enviar os conteúdos editoriais selecionados para o meu
                e-mail. Este consentimento é exclusivo da newsletter e não configura solicitação de
                atendimento comercial. Consulte a{" "}
                <ActionLink to="/privacidade" variant="text" className="text-sm">
                  Política de Privacidade
                </ActionLink>
                .
              </span>
            </label>

            {error ? <p className="mt-6 text-sm text-destructive">{error}</p> : null}

            <div className="mt-9">
              <ActionButton type="submit" disabled={status === "sending"} event="newsletter_signup">
                {status === "sending" ? "Enviando…" : "Quero receber"}
              </ActionButton>
            </div>
          </form>
        )}
      </Section>
    </>
  );
}
