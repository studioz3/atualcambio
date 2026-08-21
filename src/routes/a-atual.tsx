import { createFileRoute } from "@tanstack/react-router";
import especialistasImg from "@/assets/especialistas.jpg";
import { Container, Section, Eyebrow, SectionHeading } from "@/components/atual/primitives";
import { SecuritySection, SpecialistCta } from "@/components/atual/blocks";
import { brand } from "@/content/site";

export const Route = createFileRoute("/a-atual")({
  head: () => ({
    meta: [
      { title: "A Atual | Câmbio consultivo com tecnologia" },
      {
        name: "description",
        content:
          "Quem é a Atual Câmbio: atendimento consultivo com tecnologia para simplificar e agilizar operações, sempre com segurança.",
      },
      { property: "og:title", content: "A Atual | Se você pensa global, você é Atual" },
      {
        property: "og:description",
        content: "Atendimento consultivo com tecnologia, dentro de um ambiente regulado.",
      },
    ],
  }),
  component: AAtual,
});

const principles = [
  {
    title: "Autonomia",
    text: "A plataforma digital resolve o dia a dia sem depender de intermediação para tudo.",
  },
  {
    title: "Orientação",
    text: "Especialistas para interpretar contexto, documentação e finalidade da operação.",
  },
  {
    title: "Segurança",
    text: "Conformidade e monitoramento em um ambiente regulado, sem abrir mão de agilidade.",
  },
];

function AAtual() {
  return (
    <>
      <section className="surface-navy">
        <Container>
          <div className="max-w-3xl py-20 md:py-28">
            <Eyebrow>A Atual</Eyebrow>
            <h1 className="font-display mt-6 text-[34px] leading-[1.08] font-bold text-white md:text-[52px]">
              {brand.positioning}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75">{brand.valueProp}</p>
          </div>
        </Container>
      </section>

      <Section tone="light">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Como trabalhamos"
            title="Tecnologia para agilizar. Gente para orientar."
            description={brand.explanation}
          />
          <img
            src={especialistasImg}
            alt="Time da Atual em atendimento consultivo"
            width={1408}
            height={1008}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3">
          {principles.map((item) => (
            <div key={item.title} className="bg-white p-8">
              <h3 className="font-display text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
        {/* [AGUARDANDO VALIDAÇÃO] história institucional, números, liderança e fotos reais da equipe. */}
      </Section>

      <SecuritySection />
      <SpecialistCta context="A Atual" />
    </>
  );
}
