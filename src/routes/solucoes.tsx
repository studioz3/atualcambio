import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import {
  Container,
  Section,
  SectionHeading,
  Eyebrow,
  ActionButton,
  ActionLink,
} from "@/components/atual/primitives";
import { SpecialistCta, FaqSection } from "@/components/atual/blocks";
import { useLead } from "@/components/atual/LeadProvider";
import { solutions, brand, faq } from "@/content/site";
import { pageHead, faqSchema } from "@/lib/seo";

/** Cada solução tem uma página dedicada. */
const solutionRoutes: Record<string, string> = {
  remessas: "/remessas-internacionais",
  stablecoins: "/stablecoins",
  turismo: "/cambio-turismo",
  conta: "/conta-atual",
};

/** Ajusta o texto do CTA sem alterar a grafia oficial de USDt e USDc. */
function toSentenceCase(value: string) {
  return value
    .split(" ")
    .map((word) => (word.toUpperCase() === "USDT" ? "USDt" : word.toUpperCase() === "USDC" ? "USDc" : word.toLowerCase()))
    .join(" ");
}

export const Route = createFileRoute("/solucoes")({
  head: () =>
    pageHead({
      path: "/solucoes",
      title: "Soluções | Atual Câmbio",
      description:
        "Remessas internacionais, USDt e USDc, câmbio turismo e Conta Atual: soluções de câmbio com atendimento consultivo.",
      jsonLd: [faqSchema(faq)],
    }),
  component: Solucoes,
});

function Solucoes() {
  const { openLead } = useLead();

  return (
    <>
      <section className="surface-navy">
        <Container>
          <div className="max-w-2xl py-20 md:py-28">
            <Eyebrow>Soluções</Eyebrow>
            <h1 className="font-display mt-6 text-[34px] leading-[1.08] font-bold text-white md:text-[52px]">
              Do envio simples à operação recorrente
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75">{brand.explanation}</p>
          </div>
        </Container>
      </section>

      {solutions.map((item, index) => (
        <Section key={item.id} id={item.id} tone={index % 2 === 0 ? "light" : "offwhite"}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <SectionHeading
              eyebrow={`0${index + 1}`}
              title={item.title}
              description={item.summary}
            />
            <div className="self-center">
              <ul className="space-y-4">
                {item.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-3 text-base text-graphite">
                    <Check className="mt-1 size-4 shrink-0 text-gold" aria-hidden />
                    {bullet}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                {solutionRoutes[item.id] ? (
                  <ActionLink to={solutionRoutes[item.id]!} event="solution_page_click">
                    Ver {toSentenceCase(item.title)}
                  </ActionLink>
                ) : null}
                <ActionButton
                  variant="secondary"
                  event="lead_solution"
                  onClick={() => openLead({ context: item.title })}
                >
                  Falar com especialista
                </ActionButton>
              </div>
            </div>
          </div>
        </Section>
      ))}

      <FaqSection />
      <SpecialistCta context="Soluções" />
    </>
  );
}
