import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, FileCheck2, Headset, Eye } from "lucide-react";
import turismoHero from "@/assets/turismo-hero.jpg";
import { Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import { Hero } from "@/components/atual/ui-kit";
import { TourismLeadForm } from "@/components/atual/TourismLeadForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { tourismCurrencies, tourismOperations, type TourismOperation } from "@/lib/exchange-options";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cambio-turismo")({
  head: () => ({
    meta: [
      { title: "Câmbio Turismo | Comprar e Vender Moeda | Atual Câmbio" },
      {
        name: "description",
        content:
          "Solicite cotação para compra ou venda de moeda estrangeira e organize seu câmbio para viagens com a Atual Câmbio.",
      },
      { property: "og:title", content: "Câmbio Turismo | Atual Câmbio" },
      {
        property: "og:description",
        content:
          "Compre ou venda moeda estrangeira com atendimento da Atual para organizar seu câmbio antes da viagem.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Turismo,
});

const steps = [
  "Informe moeda e valor.",
  "A Atual apresenta as condições aplicáveis.",
  "Confirme a operação.",
  "Siga as orientações para conclusão conforme a disponibilidade confirmada no atendimento.",
];

const securityPillars = [
  {
    icon: ShieldCheck,
    title: "Instituição autorizada",
    text: "A Atual Câmbio é autorizada a operar câmbio pelo Banco Central do Brasil e associada à ABRACAM.",
  },
  {
    icon: Headset,
    title: "Atendimento oficial",
    text: "O contato acontece pelos canais oficiais da Atual, com equipe identificada.",
  },
  {
    icon: Eye,
    title: "Clareza das condições",
    text: "As condições aplicáveis à operação são apresentadas antes da confirmação.",
  },
  {
    icon: FileCheck2,
    title: "Documentação aplicável",
    text: "Comprovantes e documentos da operação seguem as exigências do mercado de câmbio.",
  },
];

const faq = [
  {
    q: "Qual a diferença entre Dólar Comercial e Dólar Turismo?",
    a: "O dólar comercial é a referência usada em operações entre empresas e instituições, como importação, exportação e pagamentos internacionais. O dólar turismo se refere à moeda destinada a viagens. São mercados diferentes, com custos e finalidades diferentes.",
  },
  {
    q: "Como funciona a cotação?",
    a: "A cotação é apresentada no momento da operação e considera a moeda, o valor e a forma de atendimento. Nenhum valor exibido no site substitui a condição apresentada durante o atendimento.",
  },
  {
    q: "Posso comprar e vender moeda estrangeira?",
    a: "Sim. A Atual atende operações de compra e de venda de moeda estrangeira para viagem.",
  },
  {
    q: "Quais moedas a Atual trabalha?",
    a: "As moedas disponíveis variam conforme a operação e o momento. Informe a moeda desejada no pedido de cotação e a Atual confirma a disponibilidade.",
  },
  {
    q: "A Atual entrega moeda estrangeira?",
    a: "As formas de retirada ou entrega dependem da disponibilidade e das condições da operação. Consulte a Atual.",
  },
  {
    q: "Quais documentos podem ser necessários?",
    a: "A documentação varia conforme o valor e o perfil do cliente. A Atual indica exatamente o que é necessário antes de qualquer envio de documento.",
  },
  {
    q: "Como confirmo minha operação?",
    a: "Depois de receber as condições aplicáveis, você confirma a operação com o atendimento e recebe as orientações para conclusão.",
  },
  {
    q: "A Atual é autorizada pelo Banco Central?",
    a: "Sim. A Atual Câmbio é autorizada a operar no mercado de câmbio brasileiro, sujeita à regulação e supervisão do Banco Central do Brasil, e associada à ABRACAM.",
  },
];

function Turismo() {
  const [operation, setOperation] = useState<TourismOperation>("Comprar");
  const [currency, setCurrency] = useState<string>(tourismCurrencies[0]);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    track("tourism_page_view", { pagina: "/cambio-turismo" });
  }, []);

  function selectOperation(value: TourismOperation) {
    setOperation(value);
    track("tourism_operation_selected", { operacao: value });
  }

  function selectCurrency(value: string) {
    setCurrency(value);
    track("tourism_currency_selected", { moeda: value });
  }

  function goToForm() {
    track("tourism_quote_start", { operacao: operation, moeda: currency });
    document.getElementById("cotacao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const specialistSearch = {
    assunto: "turismo",
    operacao: operation,
    moeda: currency,
  };

  return (
    <>
      <Hero
        eyebrow="CÂMBIO TURISMO"
        title={<>Sua viagem começa antes do embarque.</>}
        description="Compre ou venda moeda estrangeira com atendimento da Atual para organizar seu câmbio antes da viagem."
        primary={
          <ActionButton size="lg" event="tourism_quote_start" onClick={goToForm}>
            Pedir cotação
          </ActionButton>
        }
        secondary={
          <ActionLink
            size="lg"
            variant="secondaryDark"
            to="/fale-com-especialista"
            search={specialistSearch}
            event="specialist_start"
          >
            Falar com especialista
          </ActionLink>
        }
        image={turismoHero}
        imageAlt="Viajante observando a cidade pela janela ao entardecer"
      />

      {/* Qualificador */}
      <Section tone="light" id="simulador">
        <SectionHeading
          eyebrow="Sua operação"
          title="Qual moeda você precisa?"
          description="Informe a operação, a moeda e um valor aproximado. As condições aplicáveis são apresentadas pelo atendimento."
        />

        <div className="mt-10 rounded-lg border border-line bg-white p-7 md:p-9">
          <p className="text-sm font-medium text-graphite">Operação</p>
          <div className="mt-3 inline-flex rounded-sm border border-line p-1">
            {tourismOperations.map((item) => (
              <button
                key={item}
                type="button"
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

          <p className="mt-8 text-sm font-medium text-graphite">Moeda</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tourismCurrencies.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={currency === item}
                onClick={() => selectCurrency(item)}
                className={cn(
                  "flex min-h-14 items-center justify-between rounded-lg border px-5 text-left text-base font-semibold text-navy transition-colors",
                  currency === item ? "border-gold bg-offwhite" : "border-line bg-white",
                )}
              >
                {item}
                <ArrowRight className="size-4 text-gold" aria-hidden />
              </button>
            ))}
          </div>

          <div className="mt-8 max-w-sm">
            <label className="mb-2 block text-sm font-medium text-graphite" htmlFor="valor-turismo">
              Valor aproximado
            </label>
            <input
              id="valor-turismo"
              name="valor-turismo"
              inputMode="decimal"
              placeholder="Ex.: 2.000"
              maxLength={20}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="min-h-13 w-full rounded-sm border border-line bg-white px-4 text-base text-graphite outline-none transition-colors focus:border-navy"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Valor na moeda escolhida. Serve apenas para orientar o atendimento.
            </p>
          </div>

          <ActionButton
            size="lg"
            event="tourism_quote_start"
            onClick={goToForm}
            className="mt-8 w-full sm:w-auto"
          >
            Solicitar cotação
          </ActionButton>
        </div>
      </Section>

      {/* Captura de lead */}
      <Section tone="offwhite" id="cotacao">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Pedido de cotação"
            title="Receba as condições da sua operação"
            description="Informe seus dados e um especialista da Atual continua com você. Não pedimos CPF nesta etapa."
          />
          <TourismLeadForm
            operation={operation}
            currency={currency}
            amount={amount}
            onOperationChange={setOperation}
            onCurrencyChange={setCurrency}
            onAmountChange={setAmount}
          />
        </div>
      </Section>

      {/* Como funciona */}
      <Section tone="light" id="como-funciona">
        <SectionHeading
          eyebrow="Passo a passo"
          title="Como funciona o câmbio turismo na Atual"
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step} className="bg-white p-7">
              <span className="font-display text-sm font-bold text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="mt-4 text-sm leading-relaxed text-graphite">{step}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Segurança */}
      <Section tone="navy" id="seguranca">
        <SectionHeading
          tone="light-text"
          eyebrow="Segurança"
          title="Câmbio também é questão de segurança."
          description="Operações conduzidas dentro de uma instituição autorizada, com condições apresentadas antes da confirmação."
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
        <div className="mt-10">
          <ActionLink variant="secondaryDark" to="/seguranca" event="security_page_view">
            Conhecer nossa estrutura de segurança
          </ActionLink>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="offwhite" id="faq">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas sobre câmbio turismo" />
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

      <Section tone="ink" id="cta">
        <SectionHeading
          tone="light-text"
          eyebrow="Antes de embarcar"
          title="Vai viajar? Organize seu câmbio com antecedência."
          description="Peça sua cotação e fale com um especialista da Atual."
          className="max-w-3xl"
        />
        <div className="mt-10 flex flex-wrap gap-4">
          <ActionButton
            size="lg"
            event="tourism_quote_start"
            onClick={goToForm}
            className="w-full sm:w-auto"
          >
            Pedir cotação
          </ActionButton>
          <ActionLink
            size="lg"
            variant="secondaryDark"
            to="/fale-com-especialista"
            search={specialistSearch}
            event="specialist_start"
            className="w-full sm:w-auto"
          >
            Falar com especialista
          </ActionLink>
        </div>
        <p className="mt-10">
          <Link
            to="/remessas-internacionais"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-gold"
          >
            Precisa enviar recursos ao exterior? Conheça as Remessas
            <ArrowRight className="size-4 text-gold" aria-hidden />
          </Link>
        </p>
      </Section>
    </>
  );
}
