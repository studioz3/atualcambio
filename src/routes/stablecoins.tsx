import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Info, ArrowRight, ShieldCheck, FileCheck2, Headset, Eye } from "lucide-react";
import heroApp from "@/assets/app-mao-2.png.asset.json";
/**
 * Telas reais do app — basta trocar o import (ou o asset) para atualizar a prova de produto.
 */
import appInicio from "@/assets/app-inicio.jpg.asset.json";
import appMercados from "@/assets/app-mercados.jpg.asset.json";
import appExtrato from "@/assets/app-extrato.jpg.asset.json";
import { Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import { Hero, TrustPillars, PathCard, AppMockup, CTASection } from "@/components/atual/ui-kit";
import { StoreBadges } from "@/components/atual/StoreBadges";
import {
  StablecoinLeadForm,
  type StablecoinAsset,
  type StablecoinOperation,
} from "@/components/atual/StablecoinLeadForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/stablecoins")({
  head: () => ({
    meta: [
      { title: "USDT e USDC pela Atual | Atual Câmbio" },
      {
        name: "description",
        content:
          "Compre e venda USDT e USDC pela Conta Atual, em uma plataforma digital com suporte especializado quando você precisar.",
      },
      { property: "og:title", content: "USDT e USDC pela Atual" },
      {
        property: "og:description",
        content:
          "Operações com stablecoins pela Conta Atual: plataforma digital, processos conduzidos pela Atual e especialistas para orientar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Stablecoins,
});

const pillars = [
  {
    id: "tecnologia" as const,
    title: "Plataforma digital",
    text: "Opere pelo ambiente da Conta Atual.",
  },
  {
    id: "seguranca" as const,
    title: "Segurança",
    text: "Processos conduzidos dentro da estrutura da Atual.",
  },
  {
    id: "atendimento" as const,
    title: "Atendimento",
    text: "Especialistas disponíveis quando você precisar de orientação.",
  },
];

const assets: { id: StablecoinAsset; name: string }[] = [
  { id: "USDT", name: "Tether" },
  { id: "USDC", name: "USD Coin" },
];

const buySteps = [
  "Acesse sua Conta Atual.",
  "Tenha saldo disponível.",
  "Escolha USDT ou USDC.",
  "Consulte a cotação apresentada no app.",
  "Revise as informações e confirme a operação.",
];

const sellSteps = [
  "Escolha o ativo.",
  "Informe a quantidade.",
  "Consulte a cotação.",
  "Crie a ordem.",
  "Siga as instruções apresentadas no aplicativo.",
];

const accountFlow = [
  "Baixe o app",
  "Faça seu cadastro",
  "Validação de compliance",
  "Comece a operar",
];

const securityPillars = [
  { icon: FileCheck2, title: "Compliance", text: "Identificação do cliente e monitoramento das operações, conforme as políticas da Atual." },
  { icon: Eye, title: "Clareza da operação", text: "Ativo, cotação e informações da operação apresentados no app antes da confirmação." },
  { icon: ShieldCheck, title: "Segurança", text: "Operações conduzidas dentro da estrutura da Atual, instituição autorizada pelo Banco Central." },
  { icon: Headset, title: "Suporte", text: "Especialistas disponíveis para orientar quando a operação exigir contexto." },
];

const faq = [
  {
    q: "O que é USDT?",
    a: "USDT é uma stablecoin emitida pela Tether, desenhada para acompanhar o valor do dólar americano.",
  },
  {
    q: "O que é USDC?",
    a: "USDC é uma stablecoin emitida pela Circle, também desenhada para acompanhar o valor do dólar americano.",
  },
  {
    q: "Posso comprar USDT e USDC pela Atual?",
    a: "Sim. A compra é feita pela Conta Atual, com a cotação apresentada no aplicativo no momento da operação.",
  },
  {
    q: "Posso vender USDT e USDC?",
    a: "Sim. A venda também é conduzida pela Conta Atual, com criação da ordem e instruções apresentadas no aplicativo.",
  },
  {
    q: "Preciso ter Conta Atual?",
    a: "Sim. As operações com stablecoins acontecem no ambiente da Conta Atual. O cadastro é feito pelo aplicativo e passa por validação de compliance.",
  },
  {
    q: "Como funciona a cotação?",
    a: "A cotação é apresentada no aplicativo no momento da operação. Você consulta o valor antes de revisar e confirmar.",
  },
  {
    q: "Quais redes são aceitas?",
    a: "A moeda e a rede indicadas para cada operação são apresentadas no próprio aplicativo. Confira sempre essa informação no app antes de enviar um ativo.",
  },
  {
    q: "Preciso falar com um especialista?",
    a: "Não. Você pode operar pelo app com autonomia. O especialista existe como suporte, para quando você precisar de orientação.",
  },
  {
    q: "Como adiciono saldo?",
    a: "O saldo é gerenciado dentro da Conta Atual. As formas disponíveis e as instruções são apresentadas no próprio aplicativo.",
  },
  {
    q: "A Atual é autorizada pelo Banco Central?",
    a: "Sim. A Atual Câmbio é instituição autorizada a operar câmbio pelo Banco Central do Brasil e associada à ABRACAM.",
  },
];

function Stablecoins() {
  const [operation, setOperation] = useState<StablecoinOperation>("Comprar");
  const [asset, setAsset] = useState<StablecoinAsset>("USDT");

  useEffect(() => {
    track("stablecoin_page_view", { pagina: "/stablecoins" });
  }, []);

  function selectOperation(value: StablecoinOperation) {
    setOperation(value);
    track("stablecoin_operation_selected", { operacao: value === "Comprar" ? "buy" : "sell" });
    track(value === "Comprar" ? "stablecoin_buy" : "stablecoin_sell", { ativo: asset });
  }

  function selectAsset(value: StablecoinAsset) {
    setAsset(value);
    track("stablecoin_asset_selected", { ativo: value });
    track(value === "USDT" ? "stablecoin_usdt" : "stablecoin_usdc", {
      operacao: operation === "Comprar" ? "buy" : "sell",
    });
  }

  function goToForm() {
    document.getElementById("orientacao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const steps = operation === "Comprar" ? buySteps : sellSteps;

  return (
    <>
      <Hero
        title={
          <>
            USDT e USDC
            <br />
            pela Atual.
          </>
        }
        description="Compre e venda stablecoins pela Conta Atual, em uma plataforma digital com suporte especializado quando você precisar."
        primary={
          <ActionLink
            size="lg"
            href={links.account}
            external
            event="stablecoin_app_click"
          >
            Operar pela Conta Atual
          </ActionLink>
        }
        secondary={
          <ActionButton size="lg" variant="secondaryDark" event="stablecoin_help_start" onClick={goToForm}>
            Falar com especialista
          </ActionButton>
        }
        image={heroApp.url}
        imageAlt="Smartphone exibindo a Conta Atual, com operações de USDT e USDC"
      />

      <TrustPillars items={pillars} />

      {/* Escolha da operação */}
      <Section tone="light" id="operacao">
        <SectionHeading
          eyebrow="Operação"
          title="O que você quer fazer?"
          description="Escolha a operação e o ativo. O fluxo abaixo se ajusta à sua escolha."
        />

        <div className="mt-10 inline-flex rounded-sm border border-line bg-white p-1">
          {(["Comprar", "Vender"] as const).map((item) => (
            <button
              key={item}
              type="button"
              data-event="stablecoin_operation_selected"
              aria-pressed={operation === item}
              onClick={() => selectOperation(item)}
              className={cn(
                "min-h-12 rounded-sm px-7 text-sm font-semibold transition-colors",
                operation === item ? "bg-navy text-white" : "text-navy hover:bg-offwhite",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:max-w-2xl">
          {assets.map((item) => (
            <button
              key={item.id}
              type="button"
              data-event="stablecoin_asset_selected"
              aria-pressed={asset === item.id}
              onClick={() => selectAsset(item.id)}
              className={cn(
                "flex items-center justify-between rounded-lg border p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60",
                asset === item.id ? "border-gold bg-offwhite" : "border-line bg-white",
              )}
            >
              <span>
                <span className="block text-lg font-bold text-navy">{item.id}</span>
                <span className="mt-1 block text-sm text-muted-foreground">{item.name}</span>
              </span>
              <ArrowRight className="size-4 text-gold" aria-hidden />
            </button>
          ))}
        </div>

        {/* Cotação — estrutura preparada para integração futura, sem valores simulados */}
        <div className="mt-12 rounded-lg border border-line bg-white p-8">
          <div className="grid gap-6 md:grid-cols-[1.2fr_auto] md:items-center">
            <div>
              <h3 className="display-h4 text-navy">
                Cotação de {asset} para {operation.toLowerCase()}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                Consulte a cotação pelo app Atual. O valor de {operation === "Comprar" ? "compra" : "venda"},
                o horário de atualização e as informações da operação são apresentados na Conta Atual antes
                da confirmação.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <ActionLink
                href={links.account}
                external
                event="stablecoin_quote_click"
                className="w-full sm:w-auto"
              >
                Consultar no app
              </ActionLink>
            </div>
          </div>
        </div>
      </Section>

      {/* Produto real como prova */}
      <Section tone="ink" id="app">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <SectionHeading
            tone="light-text"
            eyebrow="No app"
            title="Veja antes de confirmar."
            description="Consulte o ativo, a cotação e as informações da operação diretamente pela Conta Atual."
          />
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <AppMockup screenshot={appInicio.url} screenshotAlt="Tela inicial da Conta Atual" />
            <AppMockup
              screenshot={appMercados.url}
              screenshotAlt="Tela de mercados da Conta Atual com ativos disponíveis"
              className="sm:mt-10"
            />
            <AppMockup
              screenshot={appExtrato.url}
              screenshotAlt="Extrato de operações na Conta Atual"
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </div>
      </Section>

      {/* Como comprar / vender */}
      <Section tone="offwhite" id="como-funciona">
        <SectionHeading
          eyebrow="Passo a passo"
          title={`${operation === "Comprar" ? "Comprar" : "Vender"} stablecoins pela Atual`}
          description="Um fluxo simples, conduzido pelo próprio aplicativo."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step} className="bg-white p-7">
              <span className="font-display text-sm font-bold text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 text-sm leading-relaxed text-graphite">{step}</p>
            </li>
          ))}
        </ol>

        {/* Alerta de rede — preparado para receber dados de rede posteriormente */}
        <div className="mt-10 flex gap-4 rounded-lg border border-gold/40 bg-white p-7">
          <Info className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
          <div>
            <h3 className="text-base font-bold text-navy">Confira a rede no aplicativo</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Antes de enviar um ativo, confira no aplicativo a moeda e a rede indicadas para aquela
              operação.
            </p>
          </div>
        </div>
      </Section>

      {/* Conta Atual */}
      <Section tone="light" id="conta-atual">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SectionHeading
            eyebrow="Conta Atual"
            title="Ainda não tem Conta Atual?"
            description="Baixe o app, faça seu cadastro e, após a validação, acesse as soluções disponíveis."
          />
          <div>
            <ol className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
              {accountFlow.map((step, index) => (
                <li key={step} className="flex items-center gap-3 bg-white p-6">
                  <span className="font-display text-sm font-bold text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-semibold text-navy">{step}</span>
                </li>
              ))}
            </ol>
            <StoreBadges className="mt-8 text-navy" origem="stablecoins" />
          </div>
        </div>
      </Section>

      {/* Autonomia + orientação */}
      <Section tone="offwhite" id="caminhos">
        <SectionHeading
          eyebrow="Como você prefere operar"
          title="Plataforma digital quando você quer autonomia. Especialista quando você precisa de orientação."
          className="max-w-4xl"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <PathCard
            eyebrow="Quero operar pelo app"
            title="Autonomia digital"
            description="Compra e venda de USDT e USDC pelo ambiente da Conta Atual."
            items={[
              "Consulta de ativos e cotação no app",
              "Revisão das informações antes de confirmar",
              "Acompanhamento das operações em um só lugar",
              "Sem formulário para começar",
            ]}
            action={
              <ActionLink href={links.account} external event="open_account_click">
                Abrir Conta Atual
              </ActionLink>
            }
          />
          <PathCard
            tone="navy"
            eyebrow="Preciso de orientação"
            title="Suporte especializado"
            description="Quando a operação envolve contexto, valor ou dúvida, um especialista orienta você."
            items={[
              "Orientação sobre a operação",
              "Esclarecimento de dúvidas sobre USDT e USDC",
              "Apoio para operações de maior valor",
              "Atendimento como suporte, não como etapa obrigatória",
            ]}
            action={
              <ActionButton event="stablecoin_help_start" onClick={goToForm}>
                Falar com especialista
              </ActionButton>
            }
          />
        </div>
      </Section>

      {/* Lead */}
      <Section tone="light" id="orientacao">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Orientação"
            title="Precisa de ajuda com a operação?"
            description="Conte o que você pretende fazer e um especialista continua com você. Não pedimos CPF nesta etapa."
          />
          <StablecoinLeadForm
            asset={asset}
            operation={operation}
            onAssetChange={setAsset}
            onOperationChange={setOperation}
          />
        </div>
      </Section>

      {/* Segurança */}
      <Section tone="navy" id="seguranca">
        <SectionHeading
          tone="light-text"
          eyebrow="Estrutura"
          title="Stablecoin também exige estrutura"
          description="Operações digitais conduzidas com processo, clareza e suporte."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-md bg-white/10 md:grid-cols-2">
          {securityPillars.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-navy p-8">
                <Icon className="size-6 text-gold" aria-hidden />
                <h3 className="mt-5 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* Educação rápida */}
      <Section tone="offwhite" id="o-que-sao">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading eyebrow="Conceito" title="USDT e USDC: o que são?" />
          <div className="grid gap-6 sm:grid-cols-2">
            <article className="rounded-lg border border-line bg-white p-8">
              <h3 className="display-h4 text-navy">USDT</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Stablecoin emitida pela Tether, desenhada para acompanhar o valor do dólar americano.
              </p>
            </article>
            <article className="rounded-lg border border-line bg-white p-8">
              <h3 className="display-h4 text-navy">USDC</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Stablecoin emitida pela Circle, também desenhada para acompanhar o valor do dólar
                americano.
              </p>
            </article>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="light" id="faq">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas sobre USDT e USDC" />
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

      <CTASection
        title="Sua próxima operação pode começar pela Conta Atual."
        description="Opere com autonomia pelo app ou fale com um especialista quando precisar de orientação."
        primaryLabel="Abrir Conta Atual"
        onPrimary={() => {
          track("open_account_click", { origem: "stablecoins" });
          window.open(links.account, "_blank", "noopener,noreferrer");
        }}
        secondaryHref="#orientacao"
      />
    </>
  );
}
