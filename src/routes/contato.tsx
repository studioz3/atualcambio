import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin, Clock, Headset, ArrowUpRight } from "lucide-react";
import especialistas from "@/assets/especialistas.jpg";
import {
  Section,
  SectionHeading,
  ActionButton,
  ActionLink,
  Eyebrow,
  Container,
} from "@/components/atual/primitives";
import { AccreditationSeals } from "@/components/atual/ui-kit";
import { useLead } from "@/components/atual/LeadProvider";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Atual Câmbio" },
      {
        name: "description",
        content:
          "Fale com a Atual Câmbio: atendimento consultivo, ouvidoria, canal de denúncias e canais oficiais para pessoas e empresas.",
      },
      { property: "og:title", content: "Contato | Atual Câmbio" },
      {
        property: "og:description",
        content: "Canais oficiais de atendimento, ouvidoria e especialistas da Atual Câmbio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  const { openLead } = useLead();

  return (
    <>
      <section className="surface-navy">
        <Container>
          <div className="max-w-3xl pt-[130px] pb-16 md:py-28">
            <Eyebrow>Contato</Eyebrow>
            <h1 className="hero-title mt-6 text-white">Fale com a Atual.</h1>
            <p className="hero-copy mt-7 text-white/85">
              Nossos especialistas ajudam a entender a necessidade da operação e indicar o caminho
              adequado. Você também pode acessar os canais oficiais de atendimento e ouvidoria.
            </p>
            <div className="hero-actions mt-9">
              <ActionButton
                size="lg"
                event="specialist_start"
                onClick={() => openLead({ intent: "duvida", context: "Página de contato" })}
              >
                Falar com especialista
              </ActionButton>
              <ActionLink
                size="lg"
                variant="secondaryDark"
                href={links.account}
                external
                event="login_click"
              >
                Acessar minha conta
              </ActionLink>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Canais oficiais"
            title="Onde falar com a gente."
            description="Atendimento, ouvidoria e canais institucionais da Atual Câmbio."
          />
          <ul className="space-y-6">
            <li className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">E-mail</p>
                <a
                  href="mailto:contato@atualcambio.com.br"
                  className="mt-1 block text-base text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
                >
                  contato@atualcambio.com.br
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">Ouvidoria</p>
                <p className="mt-1 text-base text-muted-foreground">0800 770-5422</p>
              </div>
            </li>
            <li className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">Horário</p>
                <p className="mt-1 text-base text-muted-foreground">
                  Segunda a sexta, das 9h às 18h.
                </p>
              </div>
            </li>
            <li className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">Endereço</p>
                <p className="mt-1 text-base text-muted-foreground">Sorocaba — SP</p>
              </div>
            </li>
          </ul>
        </div>
        <div className="mt-14 flex flex-wrap gap-3 border-t border-line pt-10">
          <Link
            to="/ouvidoria"
            className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-navy/25 px-6 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy/5"
          >
            Ouvidoria <ArrowUpRight className="size-4" aria-hidden />
          </Link>
          <Link
            to="/canal-de-denuncias"
            className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-navy/25 px-6 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy/5"
          >
            Canal de Denúncias <ArrowUpRight className="size-4" aria-hidden />
          </Link>
          <Link
            to="/seguranca"
            className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-navy/25 px-6 text-sm font-semibold text-navy transition-colors hover:border-navy hover:bg-navy/5"
          >
            Segurança <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Section>

      <Section tone="offwhite">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <img
            src={especialistas}
            alt="Equipe da Atual Câmbio em atendimento consultivo"
            width={1408}
            height={1008}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <div>
            <SectionHeading
              eyebrow="Atendimento consultivo"
              title="Um especialista para entender o contexto."
              description="Conte o que você precisa e nosso time retorna com a orientação adequada para a sua operação."
            />
            <div className="mt-10 flex flex-wrap gap-3">
              <ActionButton
                size="lg"
                event="specialist_start"
                onClick={() => {
                  track("specialist_start", { origem: "contato" });
                  openLead({ intent: "duvida", context: "Página de contato" });
                }}
              >
                <Headset className="size-4" aria-hidden />
                Falar com especialista
              </ActionButton>
            </div>
          </div>
        </div>
      </Section>

      <Section tone="navy">
        <SectionHeading
          tone="light-text"
          eyebrow="Instituição regulada"
          title="Atendimento dentro de um ambiente regulado."
          description="A Atual Câmbio é autorizada a operar no mercado de câmbio brasileiro e associada à ABRACAM."
          className="max-w-3xl"
        />
        <AccreditationSeals className="mt-12 border-t border-white/10 pt-12" />
      </Section>
    </>
  );
}
