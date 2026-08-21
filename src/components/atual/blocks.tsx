import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Section, SectionHeading, ActionButton, Eyebrow } from "./primitives";
import { useLead } from "./LeadProvider";
import { intents, faq, security, editorial } from "@/content/site";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* Cards de intenção */
export function IntentGrid() {
  return (
    <Section tone="light" id="intencoes">
      <SectionHeading
        eyebrow="Por onde começar"
        title="O que você precisa resolver hoje?"
        description="Escolha o caminho pela sua necessidade, não pela nomenclatura do câmbio."
      />
      <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
        {intents.map((item) => (
          <Link
            key={item.title}
            to={item.to}
            data-event={item.event}
            className="group flex min-h-[168px] flex-col justify-between bg-white p-7 transition-colors hover:bg-offwhite"
          >
            <div>
              <h3 className="text-lg font-semibold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
            <ArrowRight
              className="mt-6 size-5 text-gold transition-transform duration-200 group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </Section>
  );
}

/* Segurança */
export function SecuritySection() {
  return (
    <Section tone="navy" id="seguranca">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <SectionHeading
          tone="light-text"
          eyebrow="Segurança"
          title="Operar câmbio exige mais do que velocidade"
          description="Tecnologia para agilizar, estrutura e conformidade para proteger cada operação."
        />
        <div className="grid gap-px self-start overflow-hidden rounded-md bg-white/10">
          {security.map((item) => (
            <div key={item.title} className="bg-navy p-7">
              <h3 className="text-base font-semibold text-gold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/72">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-14 flex flex-wrap items-center gap-8 border-t border-white/10 pt-10">
        <img
          src="/brand/acreditacao.png"
          alt="Selos de acreditação da Atual Câmbio"
          loading="lazy"
          className="h-10 w-auto opacity-90"
        />
        <p className="text-xs text-white/50">
          [AGUARDANDO VALIDAÇÃO] descrição textual e links oficiais de cada acreditação.
        </p>
      </div>
    </Section>
  );
}

/* FAQ */
export function FaqSection() {
  return (
    <Section tone="offwhite" id="faq">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
        <SectionHeading eyebrow="Perguntas frequentes" title="O essencial, sem rodeio" />
        <Accordion type="single" collapsible className="w-full">
          {faq.map((item) => (
            <AccordionItem key={item.q} value={item.q} className="border-b border-line">
              <AccordionTrigger className="py-6 text-left text-base font-medium text-navy hover:no-underline">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

/* Editorial */
export function EditorialSection() {
  return (
    <Section tone="light" id="conteudo">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading
          eyebrow="Momento Atual"
          title="Informação para decidir com contexto"
          className="max-w-xl"
        />
        <Link
          to="/conteudo"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
        >
          Ver notícias <ArrowUpRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {editorial.map((item) => (
          <article key={item.title} className="group">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-line" aria-hidden />
            <Eyebrow>{item.category}</Eyebrow>
            <h3 className="mt-3 text-lg leading-snug font-semibold text-navy">{item.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
            <p className="mt-4 text-xs text-muted-foreground">{item.date}</p>
          </article>
        ))}
      </div>
    </Section>
  );
}

/* CTA final */
export function SpecialistCta({
  title = "Fale com um especialista da Atual",
  description = "Conte a sua necessidade. Indicamos o caminho mais simples e seguro para a sua operação.",
  context,
}: {
  title?: string;
  description?: string;
  context?: string;
}) {
  const { openLead } = useLead();
  return (
    <Section tone="navy" id="especialista">
      <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_auto]">
        <SectionHeading tone="light-text" eyebrow="Atendimento" title={title} description={description} />
        <div className="flex flex-wrap gap-3">
          <ActionButton
            size="lg"
            event="whatsapp"
            onClick={() => openLead(context ? { context } : {})}
          >
            Falar com especialista
          </ActionButton>
          <ActionButton
            size="lg"
            variant="secondaryDark"
            event="open_account"
            onClick={() => openLead({ context: "Abrir Conta Atual" })}
          >
            Abrir Conta Atual
          </ActionButton>
        </div>
      </div>
    </Section>
  );
}
