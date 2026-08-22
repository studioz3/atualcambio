import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Info } from "lucide-react";
import heroCotacoes from "@/assets/hero-cotacoes.jpg";
import {
  Section,
  SectionHeading,
  ActionButton,
  ActionLink,
  Eyebrow,
} from "@/components/atual/primitives";
import { Hero, PathCard } from "@/components/atual/ui-kit";
import { QuoteCard } from "@/components/atual/QuoteCard";
import { useLead } from "@/components/atual/LeadProvider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getQuoteResult, quoteAssets, type QuoteAsset } from "@/lib/quotes";
import { track } from "@/lib/analytics";
import { links, editorial } from "@/content/site";

export const Route = createFileRoute("/cotacoes")({
  head: () => ({
    meta: [
      { title: "Cotação de Câmbio, Dólar, Euro, USDT e USDC | Atual Câmbio" },
      {
        name: "description",
        content:
          "Consulte informações sobre moedas e stablecoins e encontre o melhor caminho para realizar sua operação com a Atual Câmbio.",
      },
      { property: "og:title", content: "Cotação de Câmbio, Dólar, Euro, USDT e USDC | Atual Câmbio" },
      {
        property: "og:description",
        content:
          "Acompanhe moedas e stablecoins e escolha o melhor caminho para a sua operação pela Conta Atual ou com um especialista.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Cotacoes,
});

const faq = [
  {
    q: "O que é cotação de câmbio?",
    a: "É a referência de preço de uma moeda em relação a outra em determinado momento. Ela varia ao longo do dia conforme as condições de mercado.",
  },
  {
    q: "A cotação exibida é o preço final da operação?",
    a: "Não necessariamente. O valor final de uma operação pode envolver condições específicas, impostos, tarifas e a finalidade declarada. As informações aplicáveis ao seu caso são apresentadas antes da confirmação.",
  },
  {
    q: "Qual a diferença entre compra e venda?",
    a: "São os dois lados da mesma operação: um valor é aplicado quando a instituição compra a moeda de você e outro quando ela vende a moeda para você.",
  },
  {
    q: "Como consultar USDT e USDC?",
    a: "As informações de compra e venda de stablecoins são consultadas na Conta Atual, no momento da operação.",
  },
  {
    q: "A cotação pode mudar?",
    a: "Sim. O mercado se movimenta ao longo do dia, por isso toda cotação é apresentada com o horário da atualização e, quando aplicável, com prazo de validade.",
  },
  {
    q: "Como faço para fechar uma operação?",
    a: "Você pode operar pela Conta Atual, com autonomia, ou falar com um especialista da Atual para conduzir a operação com orientação.",
  },
  {
    q: "Preciso ter Conta Atual?",
    a: "Para operar digitalmente, sim: o cadastro é feito pelo aplicativo e passa por validação de compliance. Para tirar dúvidas, você pode falar com um especialista antes.",
  },
  {
    q: "Posso falar com um especialista?",
    a: "Sim. Basta enviar seus dados pelo formulário de atendimento que um especialista continua com você.",
  },
];

function Cotacoes() {
  const { openLead } = useLead();

  useEffect(() => {
    track("quotes_page_view", { pagina: "/cotacoes" });
  }, []);

  function openSpecialist(context: string) {
    track("quote_specialist_click", { contexto: context });
    openLead({ context });
  }

  function selectAsset(asset: QuoteAsset) {
    track("quote_asset_selected", { ativo: asset.code, categoria: asset.category });
    track(asset.event, { ativo: asset.code });
    track("quote_app_click", { origem: `card_${asset.code}` });
    openLead({ context: `Cotação ${asset.code}` });
  }

  const moedas = quoteAssets.filter((asset) => asset.category === "moeda");
  const stablecoins = quoteAssets.filter((asset) => asset.category === "stablecoin");

  return (
    <>
      <Hero
        eyebrow="Cotações"
        title={
          <>
            <span className="block lg:whitespace-nowrap">O mercado muda.</span>
            <span className="block lg:whitespace-nowrap">A cotação também.</span>
          </>
        }
        description="Acompanhe moedas e stablecoins e escolha o melhor caminho para sua operação."
        primary={
          <ActionLink
            size="lg"
            href={links.account}
            external
            event="quote_app_click"
          >
            Consultar pelo app Atual
          </ActionLink>
        }
        secondary={
          <ActionButton
            size="lg"
            variant="secondaryDark"
            event="quote_specialist_click"
            onClick={() => openSpecialist("Cotações — hero")}
          >
            Falar com especialista
          </ActionButton>
        }
        image={heroCotacoes}
        imageAlt="Painel financeiro global com mapa de conexões e skyline noturno"
      />

      <Section tone="light" id="consultar">
        <SectionHeading
          eyebrow="Cotações"
          title="Consulte o que você precisa."
          description="Moedas e stablecoins operadas pela Atual. A cotação aplicável à sua operação é apresentada no app, no momento da consulta."
        />

        <div className="mt-12">
          <h3 className="display-h4 text-navy">Moedas</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {moedas.map((asset) => (
              <QuoteCard
                key={asset.code}
                asset={asset}
                result={getQuoteResult(asset.code)}
                onSelect={() => selectAsset(asset)}
              />
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Outras moedas podem ser consultadas com um especialista da Atual.
          </p>
        </div>

        <div className="mt-14">
          <h3 className="display-h4 text-navy">Stablecoins</h3>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stablecoins.map((asset) => (
              <QuoteCard
                key={asset.code}
                asset={asset}
                result={getQuoteResult(asset.code)}
                onSelect={() => selectAsset(asset)}
              />
            ))}
          </div>
        </div>
      </Section>

      <Section tone="offwhite" id="entenda">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_auto]">
          <SectionHeading
            eyebrow="Antes de confirmar"
            title="Cotação é parte da operação."
            description="O valor final de uma operação pode envolver condições específicas, impostos, tarifas e finalidade. Antes de confirmar, consulte as informações aplicáveis ao seu caso."
          />
          <ActionButton
            size="lg"
            event="quote_specialist_click"
            onClick={() => openSpecialist("Cotações — orientação")}
            className="lg:self-end"
          >
            Preciso de orientação
          </ActionButton>
        </div>
        <p className="mt-10 inline-flex items-start gap-3 rounded-md border border-line bg-white p-5 text-sm leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
          As informações desta página têm caráter informativo. Toda cotação apresentada pela Atual vem
          acompanhada do horário de atualização e, quando houver, do prazo de validade.
        </p>
      </Section>

      <Section tone="light" id="caminhos">
        <SectionHeading
          eyebrow="Cotação e operação"
          title="Dois caminhos para seguir."
          description="Plataforma digital quando você quer autonomia. Especialista quando você precisa de orientação."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <PathCard
            eyebrow="Autonomia"
            title="Quero operar pelo app"
            description="Para operações disponíveis digitalmente."
            items={[
              "Consulta de cotação no momento da operação",
              "Revisão das informações antes de confirmar",
              "Histórico e comprovantes na Conta Atual",
            ]}
            action={
              <ActionLink size="lg" href={links.account} external event="quote_app_click">
                Abrir Conta Atual
              </ActionLink>
            }
          />
          <PathCard
            tone="navy"
            eyebrow="Orientação"
            title="Quero falar sobre minha operação"
            description="Para dúvidas ou necessidades específicas."
            items={[
              "Operações com documentação ou finalidade específica",
              "Volumes e recorrência empresarial",
              "Orientação sobre o melhor caminho",
            ]}
            action={
              <ActionButton
                size="lg"
                event="quote_specialist_click"
                onClick={() => openSpecialist("Cotações — caminhos")}
              >
                Falar com especialista
              </ActionButton>
            }
          />
        </div>
      </Section>

      <Section tone="ink" id="stablecoins">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1fr]">
          <SectionHeading
            tone="light-text"
            eyebrow="Stablecoins"
            title="USDT e USDC"
            description="Consulte as soluções disponíveis para compra e venda de stablecoins pela Conta Atual."
          />
          <div>
            <div className="grid gap-5 sm:grid-cols-2">
              {stablecoins.map((asset) => (
                <div key={asset.code} className="rounded-lg border border-white/12 bg-white/5 p-6">
                  <p className="display-h4 text-white">{asset.code}</p>
                  <p className="mt-2 text-sm text-white/70">{asset.name}</p>
                </div>
              ))}
            </div>
            <ActionLink
              to="/stablecoins"
              size="lg"
              event="quote_usdt_click"
              className="mt-8"
            >
              Conhecer Stablecoins
            </ActionLink>
          </div>
        </div>
      </Section>

      <Section tone="offwhite" id="remessas">
        <div className="grid items-start gap-10 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-white p-8 md:p-9">
            <Eyebrow>Remessas</Eyebrow>
            <h3 className="display-h3 mt-4 text-navy">Vai enviar dinheiro para o exterior?</h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A cotação é apenas uma parte da remessa. Pela Conta Atual, você pode consultar as
              informações da operação antes da confirmação.
            </p>
            <Link
              to="/solucoes"
              hash="remessas"
              data-event="quote_remittance_click"
              onClick={() => track("quote_remittance_click", { origem: "cotacoes" })}
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
            >
              Conhecer Remessas Internacionais
              <ArrowUpRight className="size-4 text-gold" aria-hidden />
            </Link>
          </div>

          <div className="rounded-lg border border-line bg-white p-8 md:p-9">
            <Eyebrow>Empresas</Eyebrow>
            <h3 className="display-h3 mt-4 text-navy">Sua empresa opera no exterior?</h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Importação, exportação, pagamentos e recebimentos internacionais podem exigir condições
              específicas para cada operação.
            </p>
            <Link
              to="/empresas"
              data-event="quote_business_click"
              onClick={() => track("quote_business_click", { origem: "cotacoes" })}
              className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
            >
              Falar sobre minha operação
              <ArrowUpRight className="size-4 text-gold" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>

      <Section tone="light" id="momento-atual">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Momento Atual"
            title="Entenda o que está movendo o mercado."
            className="max-w-xl"
          />
          <Link
            to="/conteudo"
            data-event="quote_article_click"
            onClick={() => track("quote_article_click", { origem: "ver_todos" })}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Ver Momento Atual <ArrowUpRight className="size-4 text-gold" aria-hidden />
          </Link>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {editorial.slice(0, 3).map((item) => (
            <article key={item.title}>
              <Eyebrow>{item.category}</Eyebrow>
              <h3 className="display-h4 mt-3 text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.excerpt}</p>
              <Link
                to="/conteudo"
                data-event="quote_article_click"
                onClick={() => track("quote_article_click", { titulo: item.title })}
                className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
              >
                Ler <ArrowUpRight className="size-4 text-gold" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="offwhite" id="faq">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas sobre cotação" />
          <Accordion type="single" collapsible className="w-full">
            {faq.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="border-b border-line">
                <AccordionTrigger
                  onClick={() => track("faq_open", { pergunta: item.q })}
                  className="py-6 text-left text-base font-medium text-navy hover:no-underline"
                >
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

      <Section tone="navy" id="cta">
        <div className="grid items-start gap-10">
          <SectionHeading
            tone="light-text"
            eyebrow="Próximo passo"
            title="Viu a cotação? Agora escolha como seguir."
            description="Opere com autonomia pela Conta Atual ou fale com um especialista da Atual."
            className="max-w-3xl"
          />
          <div className="flex flex-wrap gap-4">
            <ActionLink size="lg" href={links.account} external event="quote_app_click">
              Abrir Conta Atual
            </ActionLink>
            <ActionButton
              size="lg"
              variant="secondaryDark"
              event="quote_specialist_click"
              onClick={() => openSpecialist("Cotações — CTA final")}
            >
              Falar com especialista
            </ActionButton>
          </div>
        </div>
      </Section>
    </>
  );
}
