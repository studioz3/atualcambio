import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import especialistasImg from "@/assets/especialistas.jpg";
import { Container, Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import {
  Hero,
  TrustBar,
  IntentCard,
  ProductCard,
  NewsCard,
  AppMockup,
  SpecialistBlock,
  ComplianceBlock,
  CTASection,
} from "@/components/atual/ui-kit";
import { FaqSection } from "@/components/atual/blocks";
import { QuoteBoard } from "@/components/atual/QuoteBoard";
import { useLead } from "@/components/atual/LeadProvider";
import { leadIntents } from "@/lib/lead-intents";
import { track } from "@/lib/analytics";
import { brand, trustBar, security, solutions, editorial, links } from "@/content/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atual Câmbio | Seu dinheiro, sem fronteiras" },
      {
        name: "description",
        content:
          "Câmbio, remessas internacionais e stablecoins em uma plataforma digital, com atendimento especializado quando você precisar.",
      },
      { property: "og:title", content: "Atual Câmbio | Seu dinheiro, sem fronteiras" },
      {
        property: "og:description",
        content:
          "Câmbio, remessas e stablecoins em uma plataforma digital, com especialista quando você precisar.",
      },
    ],
  }),
  component: Home,
});

const productOrder = ["empresas", "stablecoins", "remessas", "conta"] as const;

function Home() {
  const { openLead } = useLead();

  return (
    <>
      <Hero
        eyebrow={brand.positioning}
        title={
          <>
            Seu dinheiro,
            <br />
            sem fronteiras.
          </>
        }
        description="Câmbio, remessas e stablecoins em uma plataforma digital, com atendimento especializado quando você precisar."
        primary={
          <ActionButton
            size="lg"
            event="open_account_click"
            onClick={() => {
              track("open_account_click", { origem: "hero" });
              openLead({ context: "Começar uma operação" });
            }}
          >
            Começar uma operação
          </ActionButton>
        }
        secondary={
          <ActionLink
            size="lg"
            variant="secondaryDark"
            href={links.account}
            event="login_click"
          >
            Acessar minha conta
          </ActionLink>
        }
        seals
        image={heroImg}
        imageAlt="Profissional observando o skyline de uma cidade global a partir de um escritório"

      />
      <TrustBar items={trustBar} />

      {/* Roteador de intenção */}
      <Section tone="light" id="intencoes">
        <SectionHeading
          eyebrow="Por onde começar"
          title="O que você precisa fazer?"
          description="Escolha pelo seu objetivo, não pela nomenclatura do câmbio."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {leadIntents
            .filter((intent) => intent.id !== "conta")
            .map((intent) => (
              <IntentCard
                key={intent.id}
                title={intent.label}
                description={intent.description}
                event={intent.event}
                to={intent.to}
                hash={intent.hash}
                onSelect={() => {
                  track("intent_selected", { intent: intent.id });
                  openLead({ intent: intent.id });
                }}
              />
            ))}
        </div>
      </Section>

      {/* Produtos */}
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
          <ProductCard
            title="Para empresas"
            summary="Importação, exportação e pagamentos internacionais com especialista dedicado e conformidade em cada etapa."
            bullets={[
              "Pagamento a fornecedores no exterior",
              "Recebimento de clientes internacionais",
              "Câmbio recorrente para comércio exterior",
            ]}
            to="/empresas"
            event="business_lead_start"
            action={
              <ActionButton
                event="business_lead_start"
                onClick={() => openLead({ intent: "empresa", profile: "pj" })}
              >
                Falar sobre minha operação
              </ActionButton>
            }
          />
          <ProductCard
            title="USDT e USDC"
            summary={solutions.find((s) => s.id === "stablecoins")?.summary ?? ""}
            bullets={solutions.find((s) => s.id === "stablecoins")?.bullets ?? []}
            to="/solucoes"
            hash="stablecoins"
            event="stablecoin_buy"
            action={
              <ActionButton
                event="stablecoin_buy"
                onClick={() => openLead({ intent: "stablecoin" })}
              >
                Comprar ou vender
              </ActionButton>
            }
          />
          <ProductCard
            title="Remessas internacionais"
            summary={solutions.find((s) => s.id === "remessas")?.summary ?? ""}
            bullets={solutions.find((s) => s.id === "remessas")?.bullets ?? []}
            to="/solucoes"
            hash="remessas"
            event="remittance_start"
            action={
              <ActionButton event="remittance_start" onClick={() => openLead({ intent: "remessa" })}>
                Enviar dinheiro
              </ActionButton>
            }
          />
          <div className="bg-navy p-8 text-white">
            <div className="grid items-center gap-10 md:grid-cols-[1.1fr_auto]">
              <div>
                <h3 className="font-display text-xl font-bold text-white">Conta Atual</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/72">
                  Autonomia digital para operar quando quiser, com especialista a um toque.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <ActionButton
                    event="open_account_click"
                    onClick={() => openLead({ intent: "conta", context: "Abrir Conta Atual" })}
                  >
                    Abrir Conta Atual
                  </ActionButton>
                </div>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a
                    href={links.appStore}
                    data-event="app_store_click"
                    onClick={() => track("app_store_click")}
                    className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white hover:border-gold hover:text-gold"
                  >
                    App Store
                  </a>
                  <a
                    href={links.googlePlay}
                    data-event="google_play_click"
                    onClick={() => track("google_play_click")}
                    className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white hover:border-gold hover:text-gold"
                  >
                    Google Play
                  </a>
                </div>
                <p className="mt-4 text-xs text-white/45">
                  [AGUARDANDO ONZ] deeplinks do app, onboarding e atribuição de instalação.
                </p>
              </div>
              <AppMockup className="hidden md:block" />
            </div>
          </div>
        </div>
        <p className="sr-only">{productOrder.join(" ")}</p>
      </Section>

      {/* Cotações */}
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

      <ComplianceBlock items={security} />

      <SpecialistBlock
        image={especialistasImg}
        onStart={() => {
          track("specialist_start", { origem: "home" });
          openLead({ intent: "duvida" });
        }}
      />

      {/* Momento Atual */}
      <Section tone="light" id="momento-atual">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Momento Atual"
            title="Informação para decidir com contexto"
            className="max-w-xl"
          />
          <Link
            to="/conteudo"
            data-event="article_click"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Ver conteúdo <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {editorial.map((item) => (
            <NewsCard
              key={item.title}
              category={item.category}
              title={item.title}
              excerpt={item.excerpt}
              date={item.date}
            />
          ))}
        </div>
      </Section>

      <FaqSection />

      <CTASection
        title="Comece a sua operação com a Atual"
        description="Conte a sua necessidade. Registramos o seu contato e um especialista continua com você."
        onPrimary={() => openLead({ context: "Começar uma operação" })}
        secondaryHref={links.account}
      />

      <Container>
        <p className="py-6 text-xs text-muted-foreground">
          [AGUARDANDO ONZ] cotação cambial, USDT, USDC, remessas, deep links, atribuição de app,
          onboarding e webhooks.
        </p>
      </Container>
    </>
  );
}
