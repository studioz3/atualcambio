import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { Container, Section, SectionHeading, ActionButton, Eyebrow } from "@/components/atual/primitives";
import { IntentGrid, SecuritySection, FaqSection, EditorialSection, SpecialistCta } from "@/components/atual/blocks";
import { QuoteBoard } from "@/components/atual/QuoteBoard";
import { useLead } from "@/components/atual/LeadProvider";
import { brand, trust, solutions } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atual Câmbio | Câmbio digital com especialista quando precisar" },
      {
        name: "description",
        content:
          "Remessas internacionais, USDT e USDC, câmbio turismo e Conta Atual. Autonomia digital com orientação de especialistas.",
      },
      { property: "og:title", content: "Atual Câmbio | Se você pensa global, você é Atual" },
      {
        property: "og:description",
        content:
          "Plataforma digital quando você quer autonomia. Especialista quando você precisa de orientação.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const { openLead } = useLead();

  return (
    <>
      <section className="surface-navy relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <img
            src={heroImg}
            alt="Profissional observando o skyline de uma cidade global a partir de um escritório"
            width={1600}
            height={1200}
            className="size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/70 to-transparent" />
        </div>
        <Container>
          <div className="relative grid gap-12 py-20 md:py-28 lg:min-h-[620px] lg:grid-cols-2 lg:items-center lg:py-32">
            <div className="max-w-xl">
              <Eyebrow>{brand.positioning}</Eyebrow>
              <h1 className="font-display mt-6 text-[38px] leading-[1.05] font-bold text-white md:text-[60px]">
                Câmbio global,
                <br />
                do seu jeito
              </h1>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-white/75">
                {brand.valueProp}
              </p>

              <div className="mt-10 flex flex-wrap gap-3">
                <ActionButton
                  size="lg"
                  event="open_account"
                  onClick={() => openLead({ context: "Abrir Conta Atual" })}
                >
                  Abrir Conta Atual
                </ActionButton>
                <ActionButton
                  size="lg"
                  variant="secondaryDark"
                  event="whatsapp"
                  onClick={() => openLead({ context: "Falar com especialista" })}
                >
                  Falar com especialista
                </ActionButton>
              </div>
            </div>
            <div className="lg:hidden">
              <img
                src={heroImg}
                alt="Profissional observando o skyline de uma cidade global a partir de um escritório"
                width={1600}
                height={1200}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </div>
          </div>
        </Container>
        <div className="relative border-t border-white/10">
          <Container>
            <ul className="grid gap-4 py-6 md:grid-cols-3">
              {trust.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-white/65">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </div>
      </section>

      <IntentGrid />

      <Section tone="offwhite" id="solucoes">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Soluções"
            title="Uma estrutura de câmbio para cada momento"
            description={brand.explanation}
            className="max-w-2xl"
          />
          <Link
            to="/solucoes"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Conhecer soluções <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
          {solutions.map((item) => (
            <Link
              key={item.id}
              to="/solucoes"
              hash={item.id}
              className="group bg-white p-8 transition-colors hover:bg-offwhite"
            >
              <h3 className="font-display text-xl font-bold text-navy">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{item.summary}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                Ver detalhes
                <ArrowRight
                  className="size-4 text-gold transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="light" id="cotacoes">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Cotações"
            title="Câmbio sem número inventado"
            description="Só exibimos cotação quando ela é real e com o horário da atualização."
            className="max-w-xl"
          />
          <Link
            to="/cotacoes"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Ver cotações <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-12">
          <QuoteBoard limit={3} />
        </div>
      </Section>

      <SecuritySection />
      <EditorialSection />
      <FaqSection />
      <SpecialistCta context="Home" />
    </>
  );
}
