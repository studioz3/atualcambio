import { createFileRoute } from "@tanstack/react-router";
import comexImg from "@/assets/comex.jpg";
import especialistasImg from "@/assets/especialistas.jpg";
import { Container, Section, SectionHeading, Eyebrow, ActionButton } from "@/components/atual/primitives";
import { SecuritySection, SpecialistCta } from "@/components/atual/blocks";
import { useLead } from "@/components/atual/LeadProvider";

export const Route = createFileRoute("/empresas")({
  head: () => ({
    meta: [
      { title: "Câmbio para empresas | Atual Câmbio" },
      {
        name: "description",
        content:
          "Pagamentos a fornecedores no exterior, recebimentos e câmbio recorrente com acompanhamento consultivo para empresas.",
      },
      { property: "og:title", content: "Câmbio para empresas | Atual Câmbio" },
      {
        property: "og:description",
        content: "Estrutura, conformidade e especialistas para a operação internacional da sua empresa.",
      },
    ],
  }),
  component: Empresas,
});

const pillars = [
  {
    title: "Pagamento a fornecedores",
    text: "Envio ao exterior com orientação sobre documentação e enquadramento, traduzido para a sua operação.",
  },
  {
    title: "Recebimento do exterior",
    text: "Entrada de valores de clientes internacionais com acompanhamento de ponta a ponta.",
  },
  {
    title: "Câmbio recorrente",
    text: "Rotina de operações desenhada junto com o especialista, com previsibilidade de processo.",
  },
  {
    title: "USDT e USDC",
    text: "Stablecoins dentro do mesmo padrão de identificação e conformidade das demais operações.",
  },
];

function Empresas() {
  const { openLead } = useLead();

  return (
    <>
      <section className="surface-navy relative overflow-hidden">
        <Container>
          <div className="grid items-center gap-12 py-20 md:py-28 lg:grid-cols-2">
            <div className="max-w-xl">
              <Eyebrow>Para empresas</Eyebrow>
              <h1 className="font-display mt-6 text-[34px] leading-[1.08] font-bold text-white md:text-[52px]">
                Comércio exterior exige processo, não improviso
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-white/75">
                Um especialista acompanha a sua operação e a plataforma digital garante autonomia no
                dia a dia.
              </p>
              <div className="mt-10 flex flex-wrap gap-3">
                <ActionButton
                  size="lg"
                  event="pj_lead"
                  onClick={() => openLead({ context: "Câmbio para empresas", profile: "pj" })}
                >
                  Falar com especialista
                </ActionButton>
              </div>
            </div>
            <img
              src={comexImg}
              alt="Porto de contêineres ao amanhecer"
              width={1200}
              height={800}
              loading="lazy"
              className="aspect-[3/2] w-full rounded-xl object-cover"
            />
          </div>
        </Container>
      </section>

      <Section tone="light">
        <SectionHeading
          eyebrow="Operações"
          title="O que a sua empresa resolve com a Atual"
          description="Escolhemos falar a língua da sua operação antes da nomenclatura cambial."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
          {pillars.map((item) => (
            <div key={item.title} className="bg-white p-8">
              <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="offwhite">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <img
            src={especialistasImg}
            alt="Especialistas da Atual analisando documentos de uma operação internacional"
            width={1408}
            height={1008}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <SectionHeading
            eyebrow="Atendimento consultivo"
            title="Especialista quando você precisa de orientação"
            description="Tecnologia para simplificar e agilizar; pessoas para interpretar contexto, prazo e documentação da sua operação."
          />
        </div>
      </Section>

      <SecuritySection />
      <SpecialistCta context="Empresas" title="Vamos desenhar a operação da sua empresa" />
    </>
  );
}
