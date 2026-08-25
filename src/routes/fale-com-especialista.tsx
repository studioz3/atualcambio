import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import especialistas from "@/assets/especialistas.jpg";
import { Section, Container, Eyebrow } from "@/components/atual/primitives";
import { SpecialistWizard } from "@/components/atual/SpecialistWizard";
import { AccreditationSeals } from "@/components/atual/ui-kit";
import { normalizeSubjectParam } from "@/lib/specialist-subjects";
import { track } from "@/lib/analytics";

type SpecialistSearch = {
  assunto?: string;
  perfil?: string;
  ativo?: string;
  operacao?: string;
  moeda?: string;
};

const pick = (value: unknown) =>
  typeof value === "string" && value.length > 0 && value.length <= 40 ? value : undefined;

export const Route = createFileRoute("/fale-com-especialista")({
  validateSearch: (search: Record<string, unknown>): SpecialistSearch => ({
    ...(pick(search['assunto']) ? { assunto: pick(search['assunto'])! } : {}),
    ...(pick(search['perfil']) ? { perfil: pick(search['perfil'])! } : {}),
    ...(pick(search['ativo']) ? { ativo: pick(search['ativo'])! } : {}),
    ...(pick(search['operacao']) ? { operacao: pick(search['operacao'])! } : {}),
    ...(pick(search['moeda']) ? { moeda: pick(search['moeda'])! } : {}),
  }),
  head: () =>
    pageHead({
      path: "/fale-com-especialista",
      title: "Fale com um Especialista | Atual Câmbio",
      description: "Conte o que precisa resolver e fale com um especialista da Atual sobre câmbio, remessas, empresas, USDT, USDC e Conta Atual.",
    }),
  component: SpecialistPage,
});

function SpecialistPage() {
  const search = Route.useSearch();
  const subject = normalizeSubjectParam(search.assunto);

  useEffect(() => {
    track("specialist_page_view", { subject: subject ?? "", source_page: "fale-com-especialista" });
  }, [subject]);

  return (
    <>
      <section className="relative overflow-hidden surface-ink">
        <div className="absolute inset-0">
          <img
            src={especialistas}
            alt="Especialistas da Atual Câmbio em atendimento"
            width={1408}
            height={1008}
            className="size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/45" />
        </div>
        <Container>
          <div className="relative max-w-3xl pt-[130px] pb-16 md:py-24">
            <Eyebrow>Atendimento consultivo</Eyebrow>
            <h1 className="hero-title mt-6 text-white">Conte o que você precisa resolver.</h1>
            <p className="hero-copy mt-7 text-white/85">
              Algumas operações podem ser feitas diretamente pelo app. Quando você precisar de
              orientação, nosso time está disponível.
            </p>
          </div>
        </Container>
      </section>

      <Section tone="light">
        <div className="mx-auto w-full max-w-3xl">
          <SpecialistWizard
            initialSubject={subject}
            prefill={{
              assunto: search.assunto,
              perfil: search.perfil,
              ativo: search.ativo,
              operacao: search.operacao,
              moeda: search.moeda,
            }}
          />
        </div>
      </Section>

      <Section tone="navy">
        <div className="max-w-3xl">
          <Eyebrow>Instituição regulada</Eyebrow>
          <h2 className="display-h2 mt-4 text-white">
            Atendimento dentro de um ambiente regulado.
          </h2>
          <p className="body-lg mt-6 text-white/80">
            A Atual Câmbio é autorizada a operar no mercado de câmbio brasileiro e associada à
            ABRACAM.
          </p>
        </div>
        <AccreditationSeals className="mt-12 border-t border-white/10 pt-12" />
      </Section>
    </>
  );
}
