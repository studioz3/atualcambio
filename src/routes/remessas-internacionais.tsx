import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import heroApp from "@/assets/remessas-hero-desktop.jpg.asset.json";
import heroAppMobile from "@/assets/remessas-hero-mobile.jpg.asset.json";
import appRemessa from "@/assets/app-remessa.jpg.asset.json";
import appExtrato from "@/assets/app-extrato.jpg.asset.json";
import remEstudos from "@/assets/rem-estudos.jpg";
import remFamilia from "@/assets/rem-familia.jpg";
import remImoveis from "@/assets/rem-imoveis.jpg";
import remInvestimentos from "@/assets/rem-investimentos.jpg";
import remServicos from "@/assets/rem-servicos.jpg";
import cardEmpresas from "@/assets/card-empresas.jpg";
import { Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import { Hero, TrustPillars, PathCard } from "@/components/atual/ui-kit";
import { StoreBadges } from "@/components/atual/StoreBadges";
import { RemittanceLeadForm } from "@/components/atual/RemittanceLeadForm";
import { SelectField } from "@/components/atual/fields";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { remittanceCurrencies, remittancePurposes } from "@/lib/exchange-options";
import { valueRanges } from "@/lib/lead-intents";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export const Route = createFileRoute("/remessas-internacionais")({
  head: () => ({
    meta: [
      { title: "Remessas Internacionais | Atual Câmbio" },
      {
        name: "description",
        content:
          "Envie recursos para o exterior, acompanhe sua operação pela Conta Atual e conte com atendimento especializado quando precisar.",
      },
      { property: "og:title", content: "Remessas Internacionais | Atual Câmbio" },
      {
        property: "og:description",
        content:
          "Simule sua remessa, consulte cotação e custos antes da confirmação e acompanhe pela Conta Atual.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Remessas,
});

const pillars = [
  {
    id: "tecnologia" as const,
    title: "Autonomia digital",
    text: "Inicie e acompanhe suas remessas pela Conta Atual.",
  },
  {
    id: "seguranca" as const,
    title: "Ambiente regulado",
    text: "Operações conduzidas por instituição autorizada pelo Banco Central.",
  },
  {
    id: "atendimento" as const,
    title: "Orientação quando precisar",
    text: "Especialistas para operações que exigem contexto ou documentação.",
  },
];

const steps = [
  "Escolha moeda, valor e finalidade.",
  "Selecione ou cadastre o beneficiário.",
  "Consulte a cotação e os custos apresentados antes da confirmação.",
  "Confirme a operação.",
  "Acompanhe status e liquidação.",
];

const useCases = [
  {
    title: "Estudos",
    description: "Mensalidades, matrículas e custos de intercâmbio.",
    image: remEstudos,
    alt: "Estudante caminhando pelo campus de uma universidade no exterior",
  },
  {
    title: "Família",
    description: "Apoio a familiares e manutenção de residentes no exterior.",
    image: remFamilia,
    alt: "Família em videochamada com parentes que moram fora do país",
  },
  {
    title: "Imóveis",
    description: "Pagamentos relacionados a imóveis no exterior.",
    image: remImoveis,
    alt: "Casal visitando um apartamento no exterior",
  },
  {
    title: "Investimentos",
    description: "Envio de recursos para aplicações e contas no exterior.",
    image: remInvestimentos,
    alt: "Profissional analisando documentos de investimento",
  },
  {
    title: "Serviços",
    description: "Pagamento de serviços contratados fora do Brasil.",
    image: remServicos,
    alt: "Profissional em reunião on-line com cliente internacional",
  },
  {
    title: "Empresas",
    description: "Pagamentos e recebimentos internacionais da sua operação.",
    image: cardEmpresas,
    alt: "Equipe de uma empresa em reunião de trabalho",
  },
];

const faq = [
  {
    q: "Como funciona uma remessa internacional?",
    a: "Você informa moeda, valor e finalidade, indica o beneficiário e revisa as informações da operação antes de confirmar. Depois da confirmação, é possível acompanhar o status pela Conta Atual.",
  },
  {
    q: "Quais moedas estão disponíveis?",
    a: "As moedas disponíveis para cada operação são apresentadas no momento da solicitação. Se a moeda que você precisa não aparecer, um especialista verifica a possibilidade com você.",
  },
  {
    q: "Quais documentos podem ser necessários?",
    a: "A documentação varia conforme a finalidade, o valor e o perfil do cliente. A Atual indica exatamente o que é necessário antes de qualquer envio de documento.",
  },
  {
    q: "Quanto tempo leva?",
    a: "O prazo depende da moeda, do país de destino, do banco recebedor e do horário de fechamento da operação. A estimativa aplicável ao seu caso é informada durante o atendimento.",
  },
  {
    q: "Posso enviar para minha própria conta?",
    a: "Sim. A transferência entre contas próprias é uma das finalidades previstas e segue as mesmas etapas de identificação e verificação.",
  },
  {
    q: "Empresas podem utilizar?",
    a: "Sim. A Atual atende empresas em pagamentos e recebimentos internacionais, com acompanhamento consultivo.",
  },
  {
    q: "Preciso ter Conta Atual?",
    a: "As remessas disponíveis no ambiente digital são iniciadas e acompanhadas pela Conta Atual. Se preferir orientação, um especialista conduz o atendimento com você.",
  },
  {
    q: "A Atual é autorizada pelo Banco Central?",
    a: "Sim. A Atual Câmbio é autorizada a operar no mercado de câmbio brasileiro, sujeita à regulação e supervisão do Banco Central do Brasil, e associada à ABRACAM.",
  },
];

function Remessas() {
  const [currency, setCurrency] = useState<string>(remittanceCurrencies[0]);
  const [purpose, setPurpose] = useState<string>(remittancePurposes[0]);
  const [amount, setAmount] = useState<string>(valueRanges[0]!);

  useEffect(() => {
    track("remittance_page_view", { pagina: "/remessas-internacionais" });
  }, []);

  function goToForm() {
    track("remittance_help_start", { moeda: currency, finalidade: purpose });
    document.getElementById("orientacao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const specialistSearch = {
    assunto: "remessa",
    moeda: currency,
    operacao: purpose,
  };

  return (
    <>
      <Hero
        eyebrow="REMESSAS INTERNACIONAIS"
        title={<>Envie recursos para o exterior com mais clareza.</>}
        description="Simule sua remessa, consulte cotação e custos antes da confirmação e acompanhe sua operação pela Conta Atual."
        primary={
          <ActionButton
            size="lg"
            event="remittance_start"
            onClick={() => {
              track("remittance_start", { origem: "hero" });
              document
                .getElementById("simulacao")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Começar minha remessa
          </ActionButton>
        }
        secondary={
          <ActionButton
            size="lg"
            variant="secondaryDark"
            event="remittance_help_start"
            onClick={goToForm}
          >
            Preciso de orientação
          </ActionButton>
        }
        image={heroApp.url}
        mobileImage={heroApp.url}

        imageAlt="Smartphone exibindo a Conta Atual com uma remessa internacional"
      />

      <TrustPillars items={pillars} />

      {/* Módulo inicial — sem cotação, IOF, tarifa, VET ou prazo até a integração */}
      <Section tone="light" id="simulacao">
        <SectionHeading
          eyebrow="Comece por aqui"
          title="Sua remessa em três informações"
          description="Escolha moeda, valor aproximado e finalidade. A simulação com cotação e custos é apresentada na Conta Atual antes da confirmação."
        />

        <div className="mt-10 rounded-lg border border-line bg-white p-7 md:p-9">
          <div className="grid gap-5 md:grid-cols-3">
            <SelectField
              label="Moeda de destino"
              name="moeda-simulacao"
              options={[...remittanceCurrencies]}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            />
            <SelectField
              label="Valor aproximado"
              name="valor-simulacao"
              options={valueRanges}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <SelectField
              label="Finalidade"
              name="finalidade-simulacao"
              options={[...remittancePurposes]}
              value={purpose}
              onChange={(event) => setPurpose(event.target.value)}
            />
          </div>

          <div className="mt-8 rounded-md border border-gold/40 bg-offwhite p-6">
            <p className="text-base font-semibold text-navy">
              Continue sua simulação pela Conta Atual.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A cotação, os custos e as informações da operação são apresentados no aplicativo antes
              de qualquer confirmação.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ActionLink
                href={links.account}
                external
                event="remittance_app_click"
                onClick={() =>
                  track("remittance_app_click", { moeda: currency, finalidade: purpose })
                }
              >
                Continuar no app
              </ActionLink>
              <ActionButton variant="secondary" event="remittance_help_start" onClick={goToForm}>
                Preciso de orientação
              </ActionButton>
            </div>
          </div>
        </div>
      </Section>

      {/* Como funciona */}
      <Section tone="offwhite" id="como-funciona">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Passo a passo"
              title="Como funciona uma remessa pela Atual"
              description="Um fluxo conduzido pelo próprio aplicativo, com revisão antes da confirmação."
            />
            <ol className="mt-10 grid gap-px overflow-hidden rounded-md border border-line bg-line">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-4 bg-white p-6">
                  <span className="font-display text-sm font-bold text-gold">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm leading-relaxed text-graphite">{step}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            <img
              src={appRemessa.url}
              alt="Tela de remessa internacional no aplicativo da Atual"
              loading="lazy"
              className="w-full rounded-xl border border-line object-contain"
            />
            <img
              src={appExtrato.url}
              alt="Tela de acompanhamento de operações no aplicativo da Atual"
              loading="lazy"
              className="w-full rounded-xl border border-line object-contain"
            />
          </div>
        </div>
      </Section>

      {/* Para que serve */}
      <Section tone="light" id="finalidades">
        <SectionHeading
          eyebrow="Para que serve"
          title="Cada remessa tem um motivo"
          description="A finalidade orienta a documentação e o enquadramento da operação."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((item) => (
            <article
              key={item.title}
              className="flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white"
            >
              <img
                src={item.image}
                alt={item.alt}
                width={1200}
                height={900}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-7">
                <h3 className="display-h4 text-navy">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Section>

      {/* Conta Atual */}
      <Section tone="ink" id="conta-atual">
        <div className="grid gap-12 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <SectionHeading
            tone="light-text"
            eyebrow="Conta Atual"
            title="As remessas disponíveis podem ser iniciadas e acompanhadas pela Conta Atual."
            description="Baixe o app, faça seu cadastro e, após a validação, acesse as operações disponíveis."
          />
          <div>
            <ActionLink
              size="lg"
              href={links.account}
              external
              event="remittance_app_click"
              onClick={() => track("remittance_app_click", { origem: "bloco-conta" })}
            >
              Abrir Conta Atual
            </ActionLink>
            <StoreBadges className="mt-8" origem="remessas" />
          </div>
        </div>
      </Section>

      {/* Caminhos */}
      <Section tone="offwhite" id="caminhos">
        <SectionHeading
          eyebrow="Como você prefere seguir"
          title="Autonomia pelo app. Especialista quando precisar de orientação."
          className="max-w-4xl"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <PathCard
            eyebrow="Quero fazer pelo app"
            title="Autoatendimento"
            description="Você conduz a remessa pelo ambiente da Conta Atual."
            items={[
              "Escolha de moeda, valor e finalidade",
              "Cadastro do beneficiário",
              "Revisão das informações antes de confirmar",
              "Acompanhamento do status da operação",
            ]}
            action={
              <ActionLink href={links.account} external event="remittance_app_click">
                Continuar no app
              </ActionLink>
            }
          />
          <PathCard
            tone="navy"
            eyebrow="Preciso de orientação"
            title="Atendimento consultivo"
            description="Um especialista acompanha operações que exigem contexto, valor maior ou documentação."
            items={[
              "Orientação sobre finalidade e documentação",
              "Apoio em operações de maior valor",
              "Esclarecimento de dúvidas antes do envio",
              "Atendimento como suporte, não como etapa obrigatória",
            ]}
            action={
              <ActionLink
                to="/fale-com-especialista"
                search={specialistSearch}
                event="remittance_help_start"
              >
                Falar com especialista
              </ActionLink>
            }
          />
        </div>
      </Section>

      {/* Lead */}
      <Section tone="light" id="orientacao">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Orientação"
            title="Precisa de ajuda com a sua remessa?"
            description="Conte o que você precisa enviar e um especialista continua com você. Não pedimos CPF nesta etapa."
          />
          <RemittanceLeadForm
            currency={currency}
            purpose={purpose}
            onCurrencyChange={setCurrency}
            onPurposeChange={setPurpose}
          />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="offwhite" id="faq">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas sobre remessas" />
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
        <SectionHeading
          tone="light-text"
          eyebrow="Comece agora"
          title="Sua próxima remessa pode começar pela Conta Atual."
          description="Opere com autonomia pelo app ou fale com um especialista quando precisar de orientação."
          className="max-w-3xl"
        />
        <div className="mt-10 flex flex-wrap gap-4">
          <ActionLink
            size="lg"
            href={links.account}
            external
            event="remittance_app_click"
            className="w-full sm:w-auto"
          >
            Começar minha remessa
          </ActionLink>
          <ActionLink
            size="lg"
            variant="secondaryDark"
            to="/fale-com-especialista"
            search={specialistSearch}
            event="remittance_help_start"
            className="w-full sm:w-auto"
          >
            Falar com especialista
          </ActionLink>
        </div>
        <p className="mt-10">
          <Link
            to="/cambio-turismo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-gold"
          >
            Vai viajar? Conheça o Câmbio Turismo
            <ArrowRight className="size-4 text-gold" aria-hidden />
          </Link>
        </p>
      </Section>
    </>
  );
}
