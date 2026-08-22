import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroAsset from "@/assets/hero-banner-2.jpg.asset.json";
import appMao from "@/assets/app-mao.png.asset.json";

import especialistaImg from "@/assets/card-especialista.jpg";
import cardEmpresas from "@/assets/card-empresas.jpg";
import cardRemessas from "@/assets/card-remessas.jpg";
import cardStablecoins from "@/assets/card-stablecoins.jpg";
import cardViagem from "@/assets/card-viagem.jpg";
import cardCotacoes from "@/assets/card-cotacoes.jpg";
import editorial1 from "@/assets/editorial-1.jpg";
import editorial2 from "@/assets/editorial-2.jpg";
import editorial3 from "@/assets/editorial-3.jpg";
import { Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import {
  Hero,
  TrustPillars,
  PhotoIntentCard,
  PathCard,
  NewsCard,
  AppMockup,
  SpecialistBlock,
  ComplianceBlock,
  CTASection,
} from "@/components/atual/ui-kit";
import { FaqSection } from "@/components/atual/blocks";
import { QuoteBoard } from "@/components/atual/QuoteBoard";
import { useLead } from "@/components/atual/LeadProvider";
import { track } from "@/lib/analytics";
import { brand, pillars, security, editorial, links } from "@/content/site";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

/* Fotografias facilmente substituíveis: troque o import correspondente. */
const intentCards = [
  {
    id: "empresa" as const,
    title: "Fazer uma operação da minha empresa",
    description: "Importação, exportação e pagamentos internacionais com especialista dedicado.",
    image: cardEmpresas,
    imageAlt: "Profissional analisando documentos de comércio exterior em um escritório",
    event: "business_lead_start",
  },
  {
    id: "remessa" as const,
    title: "Enviar dinheiro para o exterior",
    description: "Remessas para pessoas, famílias, estudos e manutenção de residentes.",
    image: cardRemessas,
    imageAlt: "Pessoa em videochamada com familiares no exterior",
    event: "remittance_start",
  },
  {
    id: "stablecoin" as const,
    title: "Comprar ou vender USDT/USDC",
    description: "Stablecoins em ambiente regulado, com conformidade em cada etapa.",
    image: cardStablecoins,
    imageAlt: "Pessoa usando um aplicativo financeiro no smartphone",
    event: "stablecoin_buy",
  },
  {
    id: "turismo" as const,
    title: "Comprar moeda para viajar",
    description: "Moeda para a sua viagem e orientação sobre limites e documentação.",
    image: cardViagem,
    imageAlt: "Viajante caminhando com bagagem em um aeroporto internacional",
    event: "intent_selected",
  },
  {
    id: "cotacoes" as const,
    title: "Ver cotações",
    description: "Acompanhe moedas e stablecoins e receba a cotação da sua operação.",
    image: cardCotacoes,
    imageAlt: "Skyline de um centro financeiro ao entardecer",
    event: "intent_selected",
  },
  {
    id: "duvida" as const,
    title: "Não sei qual opção escolher",
    description: "Conte o que precisa. Um especialista indica o caminho mais simples.",
    image: especialistaImg,
    imageAlt: "Especialista da Atual Câmbio pronto para atender",
    event: "specialist_start",
  },
];

const editorialImages = [editorial1, editorial2, editorial3];

function Home() {
  const { openLead } = useLead();

  return (
    <>
      <Hero
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
          <ActionLink size="lg" variant="secondaryDark" href={links.account} event="login_click">
            Acessar minha conta
          </ActionLink>
        }
        seals
        image={heroAsset.url}
        imageAlt="Atendimento internacional da Atual Câmbio com globo conectado ao fundo"

      />

      <TrustPillars items={pillars} />

      {/* Roteador de intenção */}
      <Section tone="light" id="intencoes">
        <SectionHeading
          eyebrow="Por onde começar"
          title="O que você precisa fazer?"
          description="Escolha pelo seu objetivo, não pela nomenclatura do câmbio."
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {intentCards.map((card) => (
            <PhotoIntentCard
              key={card.id}
              title={card.title}
              description={card.description}
              image={card.image}
              imageAlt={card.imageAlt}
              event={card.event}
              onSelect={() => {
                track("intent_selected", { intent: card.id });
                openLead({ intent: card.id });
              }}
            />
          ))}
        </div>
      </Section>

      {/* Como a Atual atende */}
      <Section tone="offwhite" id="solucoes">
        <SectionHeading
          eyebrow="Como atendemos"
          title={
            <>
              Digital quando faz sentido.
              <br />
              Especialista quando importa.
            </>
          }
          description={brand.valueProp}
          className="max-w-3xl"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <PathCard
            eyebrow="Pela Conta Atual"
            title="Autonomia digital"
            description="Você opera direto pelo aplicativo, no seu tempo, com acompanhamento das operações em um só lugar."
            items={[
              "Remessas internacionais",
              "Compra e venda de USDT e USDC",
              "Acompanhamento das suas operações",
              "Histórico e comprovantes disponíveis no app",
            ]}
            action={
              <ActionButton
                event="open_account_click"
                onClick={() => openLead({ intent: "conta", context: "Abrir Conta Atual" })}
              >
                Abrir Conta Atual
              </ActionButton>
            }
          />
          <PathCard
            tone="navy"
            eyebrow="Com atendimento consultivo"
            title="Orientação de quem opera câmbio"
            description="Quando a operação envolve documentação, prazo ou contexto, um especialista conduz com você."
            items={[
              "Operações empresariais",
              "Comércio exterior: importação e exportação",
              "Situações que exigem documentação específica",
              "Operações que precisam de orientação e timing",
            ]}
            action={
              <ActionButton
                event="specialist_start"
                onClick={() => {
                  track("specialist_start", { origem: "caminhos" });
                  openLead({ intent: "duvida" });
                }}
              >
                Falar com um especialista
              </ActionButton>
            }
          />
        </div>
      </Section>

      {/* Conta Atual */}
      <Section tone="navy" id="conta-atual">
        <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionHeading
              tone="light-text"
              eyebrow="Conta Atual"
              title="Sua operação internacional no aplicativo"
              description="Acompanhe saldo, remessas, USDT, USDC e extrato com autonomia — e chame um especialista quando precisar."
            />
            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {["Saldo", "Remessas", "USDT", "USDC", "Extrato", "Acompanhamento"].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 rounded-md border border-white/12 px-4 py-3 text-sm text-white/80"
                >
                  <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <ActionButton
                size="lg"
                event="open_account_click"
                onClick={() => openLead({ intent: "conta", context: "Abrir Conta Atual" })}
              >
                Abrir Conta Atual
              </ActionButton>
              <a
                href={links.appStore}
                data-event="app_store_click"
                onClick={() => track("app_store_click", { origem: "home" })}
                className="inline-flex min-h-14 items-center rounded-sm border border-white/25 px-6 text-sm text-white transition-colors hover:border-gold hover:text-gold"
              >
                App Store
              </a>
              <a
                href={links.googlePlay}
                data-event="google_play_click"
                onClick={() => track("google_play_click", { origem: "home" })}
                className="inline-flex min-h-14 items-center rounded-sm border border-white/25 px-6 text-sm text-white transition-colors hover:border-gold hover:text-gold"
              >
                Google Play
              </a>
            </div>
          </div>
          {/* Screenshots reais do app Atual */}
          <div className="relative flex items-center justify-center gap-4 lg:gap-0">
            <AppMockup
              screenshot={appExtrato.url}
              screenshotAlt="Extrato da Conta Atual no aplicativo"
              className="hidden max-w-[210px] rotate-[-6deg] opacity-90 lg:block lg:-mr-16"
            />
            <AppMockup
              screenshot={appInicio.url}
              screenshotAlt="Tela inicial da Conta Atual com saldo e atalhos"
              className="relative z-10 max-w-[250px] lg:max-w-[270px]"
            />
            <AppMockup
              screenshot={appMercados.url}
              screenshotAlt="Cotações de USDC e USDT no aplicativo Atual"
              className="hidden max-w-[210px] rotate-[6deg] opacity-90 lg:block lg:-ml-16"
            />
          </div>

        </div>
      </Section>

      {/* Cotações */}
      <Section tone="light" id="cotacoes">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Cotações"
            title="O mercado muda. A cotação também."
            description="Consulte moedas e stablecoins com informação atualizada."
            className="max-w-2xl"
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
        image={especialistaImg}
        onStart={() => {
          track("specialist_start", { origem: "home" });
          openLead({ intent: "duvida" });
        }}
      />

      {/* Momento Atual */}
      <Section tone="light" id="momento-atual">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Conteúdo"
            title="Momento Atual"
            description="Informação para decidir com contexto."
            className="max-w-2xl"
          />
          <Link
            to="/conteudo"
            data-event="article_click"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Ver conteúdo <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {editorial.map((item, index) => (
            <NewsCard
              key={item.title}
              category={item.category}
              title={item.title}
              excerpt={item.excerpt}
              date={item.date}
              image={editorialImages[index]}
              imageAlt={item.title}
            />
          ))}
        </div>
      </Section>

      <FaqSection />

      <CTASection
        title="Comece a sua operação com a Atual."
        description="Conte a sua necessidade. Registramos o seu contato e um especialista continua com você."
        onPrimary={() => openLead({ context: "Começar uma operação" })}
        secondaryHref={links.account}
      />
    </>
  );
}
