import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroAsset from "@/assets/home-hero-desktop-v3.jpg.asset.json";
import heroMobile from "@/assets/home-hero-mobile.jpg.asset.json";
import appMao from "@/assets/app-mao-2.png.asset.json";

import especialistaImg from "@/assets/card-especialista.jpg";
import cardEmpresas from "@/assets/card-empresas.jpg";
import cardRemessas from "@/assets/card-remessas.jpg";
import cardStablecoins from "@/assets/card-stablecoins.jpg";
import cardViagem from "@/assets/card-viagem.jpg";
import cardCotacoes from "@/assets/card-cotacoes.jpg";
import { Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import {
  Hero,
  TrustPillars,
  PhotoIntentCard,
  PathCard,
  
  SpecialistBlock,
  ComplianceBlock,
  CTASection,
} from "@/components/atual/ui-kit";
import { FaqSection } from "@/components/atual/blocks";
import { QuoteBoard } from "@/components/atual/QuoteBoard";

import { StoreBadges } from "@/components/atual/StoreBadges";
import { FloatingSimulator } from "@/components/atual/FloatingSimulator";

import { useLead } from "@/components/atual/LeadProvider";
import { track } from "@/lib/analytics";
import { brand, pillars, security, links, faq } from "@/content/site";
import { pageHead, websiteSchema, faqSchema } from "@/lib/seo";
import { editorias } from "@/content/editorial";
import { getPublishedList } from "@/lib/editorial.functions";
import { getPodcastEpisodes } from "@/lib/podcast.functions";
import { LatestEpisodeStrip } from "@/components/atual/podcast-episodes";

export const Route = createFileRoute("/")({
  head: () => ({
    ...pageHead({
      path: "/",
      title: "Atual Câmbio | Câmbio, Remessas Internacionais e Stablecoins",
      description:
        "Câmbio, remessas internacionais e stablecoins em uma plataforma digital, com atendimento especializado quando você precisar.",
      jsonLd: [websiteSchema, faqSchema(faq)],
    }),
  }),
  loader: async () => {
    const [destaques, episodes] = await Promise.all([
      getPublishedList({ data: { limit: 12 } }),
      getPodcastEpisodes({ data: { editoria: "momento-atual", limit: 1 } }),
    ]);
    return { destaques, ultimoEpisodio: episodes[0] ?? null };
  },
  errorComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">
      Não foi possível carregar a página agora.
    </div>
  ),
  notFoundComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">Página não encontrada.</div>
  ),
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
    title: "Comprar ou vender USDt/USDc",
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

function Home() {
  const { openLead } = useLead();
  const { destaques, ultimoEpisodio } = Route.useLoaderData();

  return (
    <>
      <Hero
        scrim="navy"
        rawImage
        imageFit="contain"
        title={
          <>
            Seu dinheiro,
            <br />
            sem fronteiras.
          </>
        }
        description={
          <>
            Câmbio, remessas e stablecoins em uma plataforma digital, com atendimento
            especializado quando você precisar.
            <span className="mt-3 block text-sm text-white/70">
              Câmbio turismo, remessas internacionais, comércio exterior e USDT/USDC — tudo em
              um só lugar.
            </span>
          </>
        }
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
        mobileImage={heroMobile.url}
        imageAlt="Atendimento internacional da Atual Câmbio com globo conectado ao fundo"
      >
      </Hero>

      <FloatingSimulator
        onConvert={() => openLead({ intent: "turismo", context: "Simulador de câmbio (flutuante)" })}
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
      <Section tone="ink" id="conta-atual">
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
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <ActionButton
                size="lg"
                event="open_account_click"
                onClick={() => openLead({ intent: "conta", context: "Abrir Conta Atual" })}
              >
                Abrir Conta Atual
              </ActionButton>
              <StoreBadges origem="home" />
            </div>

          </div>
          {/* Ilustração real do app Atual — sangra na borda direita */}
          <div className="relative flex items-center justify-center lg:justify-end">
            <img
              src={appMao.url}
              alt="Mão segurando smartphone com a Conta Atual aberta"
              loading="lazy"
              className="h-auto w-[125%] max-w-none object-contain sm:w-[110%] lg:my-[-14%] lg:w-[150%] lg:-mr-[12vw]"
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

      {/* Ecossistema editorial */}
      <Section tone="light" id="conteudo">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Conteúdo"
            title="Conteúdo para quem é Atual."
            description="Três editorias para entender o mundo por diferentes perspectivas."
            className="max-w-2xl"
          />
          <Link
            to="/conteudo"
            data-event="content_hub_view"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Ver conteúdos <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {editorias.map((editoria) => {
            const latest = destaques?.find((a) => a.editoria === editoria.id);
            return (
              <Link
                key={editoria.id}
                to={editoria.path}
                onClick={() => track("editorial_selected", { editoria: editoria.id, source_page: "home" })}
                className="group flex flex-col"
              >
                <div className="overflow-hidden rounded-xl bg-line">
                  <img
                    src={editoria.image}
                    alt={editoria.imageAlt}
                    width={1600}
                    height={1000}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <h3 className="display-h4 mt-6 text-navy group-hover:text-gold-soft">
                  {editoria.name}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {editoria.shortDescription}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {latest ? latest.titulo : "Novos conteúdos em breve"}
                </p>
              </Link>
            );
          })}
        </div>
      </Section>

      {ultimoEpisodio ? (
        <section className="surface-navy section-y">
          <div className="mx-auto w-full max-w-[1200px] px-6">
            <LatestEpisodeStrip episode={ultimoEpisodio} />
          </div>
        </section>
      ) : null}




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
