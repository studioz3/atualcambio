import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Phone, Clock, ArrowUpRight, Landmark, Wallet, Headset } from "lucide-react";
import { Section, SectionHeading, ActionLink, Container, Eyebrow } from "@/components/atual/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE_URL, UNIT, ORG_ID, postalAddressSchema, openingHoursSchema } from "@/config/site";
import { pageHead, faqSchema, breadcrumbSchema } from "@/lib/seo";
import { track } from "@/lib/analytics";

const faqLocal = [
  {
    q: "Onde comprar dólar em São José dos Campos?",
    a: "A Atual Câmbio atende presencialmente na sua agência do Jardim Aquarius, na Av. Cassiano Ricardo, 601, Edifício The One, em São José dos Campos. Também é possível iniciar o atendimento pelos canais digitais da Atual.",
  },
  {
    q: "A Atual atende presencialmente?",
    a: "Sim. A agência de São José dos Campos recebe clientes para operações de câmbio turismo, moeda em espécie, remessas internacionais e orientação consultiva.",
  },
  {
    q: "Preciso agendar?",
    a: "Recomendamos falar antes com um especialista pelos canais oficiais da Atual para confirmar horário e disponibilidade antes de se dirigir à agência.",
  },
  {
    q: "Quais documentos levar?",
    a: "A documentação necessária varia conforme o tipo e o valor da operação. Um especialista informa exatamente o que levar antes da sua visita à agência.",
  },
];

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "@id": `${SITE_URL}/unidades/sao-jose-dos-campos#localbusiness`,
  name: UNIT.name,
  parentOrganization: { "@id": ORG_ID },
  telephone: UNIT.phoneE164,
  address: postalAddressSchema,
  openingHoursSpecification: openingHoursSchema,
  url: `${SITE_URL}${UNIT.path}`,
  // TODO [PREENCHER]: coordenadas reais (latitude/longitude) da agência antes de publicar geo.
  geo: {
    "@type": "GeoCoordinates",
    latitude: UNIT.latitude,
    longitude: UNIT.longitude,
  },
};

export const Route = createFileRoute("/unidades/sao-jose-dos-campos")({
  head: () =>
    pageHead({
      path: "/unidades/sao-jose-dos-campos",
      title: "Casa de Câmbio em São José dos Campos | Atual Câmbio",
      description:
        "Agência da Atual Câmbio no Jardim Aquarius, São José dos Campos. Compra e venda de moeda estrangeira, remessas internacionais e atendimento com especialista.",
      jsonLd: [
        localBusiness,
        faqSchema(faqLocal),
        breadcrumbSchema([
          { name: "Início", path: "/" },
          { name: "Unidades", path: "/contato" },
          { name: "São José dos Campos", path: "/unidades/sao-jose-dos-campos" },
        ]),
      ],
    }),
  component: UnidadeSaoJoseDosCampos,
});

const services = [
  {
    icon: Wallet,
    title: "Câmbio turismo e moeda em espécie",
    text: "Compra e venda de moeda estrangeira para viagem, com orientação sobre limites e documentação.",
  },
  {
    icon: Landmark,
    title: "Remessas internacionais",
    text: "Envio e recebimento de valores no exterior para pessoas e empresas, com acompanhamento em cada etapa.",
  },
  {
    icon: Headset,
    title: "Atendimento consultivo",
    text: "Especialistas disponíveis para orientar sobre a melhor forma de conduzir a sua operação.",
  },
];

function UnidadeSaoJoseDosCampos() {
  useEffect(() => {
    track("unit_page_view", { unidade: "sao-jose-dos-campos" });
  }, []);

  return (
    <>
      <section className="surface-ink">
        <Container>
          <div className="max-w-3xl pt-[130px] pb-16 md:py-24">
            <Eyebrow>Nossa agência</Eyebrow>
            <h1 className="hero-title mt-6 text-white">
              Câmbio em São José dos Campos: agência da Atual no Jardim Aquarius
            </h1>
            <p className="hero-copy mt-7 text-white/85">
              Atendimento presencial no Vale do Paraíba, na Avenida Cassiano Ricardo, com apoio de
              especialistas para operações de câmbio e remessas internacionais.
            </p>
            <div className="hero-actions mt-9">
              <ActionLink size="lg" href={UNIT.mapUrl} external event="unit_map_click">
                Ver no Google Maps <ArrowUpRight className="size-4" aria-hidden />
              </ActionLink>
              <ActionLink size="lg" variant="secondaryDark" to="/fale-com-especialista" event="unit_specialist_click">
                Falar com especialista
              </ActionLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Endereço */}
      <Section tone="offwhite">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Endereço"
            title="Onde fica a agência"
            description={`${UNIT.building}, no bairro ${UNIT.neighborhood}, em ${UNIT.city} — SP.`}
          />
          <ul className="space-y-6">
            <li className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">{UNIT.name}</p>
                <p className="mt-1 text-base text-muted-foreground">{UNIT.streetAddress}</p>
                <p className="text-base text-muted-foreground">
                  {UNIT.neighborhood}, {UNIT.city} — {UNIT.region}, CEP {UNIT.postalCode}
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">Telefone</p>
                <a
                  href={`tel:${UNIT.phoneE164}`}
                  onClick={() => track("unit_phone_click", { unidade: "sao-jose-dos-campos" })}
                  className="mt-1 block text-base text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
                >
                  {UNIT.phone}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">Horário</p>
                <p className="mt-1 text-base text-muted-foreground">{UNIT.hours}</p>
              </div>
            </li>
            <li>
              <a
                href={UNIT.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track("unit_map_click", { unidade: "sao-jose-dos-campos" })}
                className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-navy/25 px-4 text-sm font-semibold text-navy hover:bg-navy/5"
              >
                Ver no mapa <ArrowUpRight className="size-4" aria-hidden />
              </a>
            </li>
            <li className="overflow-hidden rounded-sm border border-line">
              <iframe
                src={UNIT.mapEmbedUrl}
                title={`Mapa da agência ${UNIT.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-64 w-full border-0"
              />
            </li>
          </ul>
        </div>
      </Section>

      {/* Serviços atendidos presencialmente */}
      <Section tone="light">
        <SectionHeading
          eyebrow="Atendimento presencial"
          title="O que você resolve nesta agência"
          description="Operações que podem ser conduzidas presencialmente, com apoio de um especialista."
        />
        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-3">
          {services.map((item) => (
            <li key={item.title} className="bg-background p-8">
              <item.icon className="size-7 text-gold" aria-hidden />
              <h3 className="display-h4 mt-5 text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Localização */}
      <Section tone="offwhite">
        <SectionHeading
          eyebrow="Localização"
          title="Referência no Vale do Paraíba"
          description={`A agência fica no bairro ${UNIT.neighborhood}, na Avenida Cassiano Ricardo, uma das principais vias comerciais de ${UNIT.city}, região do Vale do Paraíba.`}
        />
      </Section>

      {/* FAQ */}
      <Section tone="light">
        <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes sobre a agência" />
        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqLocal.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger className="text-left text-base font-semibold text-navy">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Section>

      {/* CTA final */}
      <Section tone="navy">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          <SectionHeading
            tone="light-text"
            eyebrow="Atendimento consultivo"
            title="Prefere ser atendido antes de ir até a agência?"
            description="Fale com um especialista da Atual para confirmar horário e a melhor forma de conduzir sua operação."
          />
          <div className="lg:justify-self-end">
            <ActionLink size="lg" to="/fale-com-especialista" event="unit_specialist_click">
              Falar com especialista
            </ActionLink>
          </div>
        </div>
      </Section>
    </>
  );
}
