import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Ship,
  PackageCheck,
  Banknote,
  Download,
  Globe2,
  MessagesSquare,
  ArrowRight,
} from "lucide-react";
import empresasHero from "@/assets/empresas-hero-desktop.jpg.asset.json";
import empresasHeroMobile from "@/assets/empresas-hero-mobile.jpg.asset.json";
import { Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import { Hero, PathCard, ComplianceBlock, CTASection } from "@/components/atual/ui-kit";
import {
  BusinessLeadForm,
  businessOperations,
  type BusinessOperation,
} from "@/components/atual/BusinessLeadForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/lib/analytics";
import { security, links } from "@/content/site";
import { pageHead, faqSchema, serviceSchema } from "@/lib/seo";

const PAGE_DESCRIPTION =
  "Importação, exportação, pagamentos e recebimentos internacionais com tecnologia para agilizar e especialistas para orientar a sua operação.";

export const Route = createFileRoute("/empresas")({
  head: () =>
    pageHead({
      path: "/empresas",
      title: "Câmbio para empresas | Atual Câmbio",
      description: PAGE_DESCRIPTION,
      jsonLd: [
        serviceSchema({
          name: "Câmbio para empresas",
          serviceType: "Operações de câmbio para comércio exterior",
          description: PAGE_DESCRIPTION,
        }),
        faqSchema(faq),
      ],
    }),
  component: Empresas,
});

const trust = [
  "Instituição autorizada pelo Banco Central",
  "Atendimento consultivo",
  "Tecnologia para agilizar operações",
];

const routerOptions: { id: BusinessOperation; text: string; icon: typeof Ship }[] = [
  { id: "Importar", text: "Comprar mercadorias ou insumos de fora do país.", icon: Download },
  { id: "Exportar", text: "Vender para clientes em outros países.", icon: Ship },
  {
    id: "Pagar fornecedor no exterior",
    text: "Enviar valores para um fornecedor internacional.",
    icon: Banknote,
  },
  {
    id: "Receber do exterior",
    text: "Receber valores de clientes internacionais.",
    icon: PackageCheck,
  },
  {
    id: "Pagar serviços internacionais",
    text: "Softwares, licenças, fretes, comissões e serviços contratados fora.",
    icon: Globe2,
  },
  {
    id: "Outra operação",
    text: "Sua necessidade não está na lista? Conte o contexto.",
    icon: MessagesSquare,
  },
];

const steps = [
  { title: "Conte sua necessidade", text: "Você descreve a operação com as suas palavras — sem jargão cambial." },
  { title: "A Atual analisa a operação", text: "Avaliamos o contexto, a moeda, o valor e o que a operação exige." },
  {
    title: "Você recebe orientação",
    text: "Explicamos a documentação envolvida e como a execução acontece.",
  },
  {
    title: "A operação segue pelo canal adequado",
    text: "Pela plataforma digital ou com acompanhamento do especialista, conforme o caso.",
  },
];

const solutions = [
  { title: "Importação", text: "Pagamentos ao exterior vinculados à compra de mercadorias e insumos.", op: "Importar" },
  { title: "Exportação", text: "Recebimento das suas vendas internacionais com acompanhamento.", op: "Exportar" },
  {
    title: "Pagamentos internacionais",
    text: "Envio de valores a fornecedores e parceiros fora do país.",
    op: "Pagar fornecedor no exterior",
  },
  {
    title: "Recebimentos internacionais",
    text: "Entrada de recursos de clientes e parceiros internacionais.",
    op: "Receber do exterior",
  },
  {
    title: "Serviços internacionais",
    text: "Licenças, softwares, fretes, comissões e serviços contratados no exterior.",
    op: "Pagar serviços internacionais",
  },
  {
    title: "Consultoria cambial",
    text: "Orientação sobre documentação, enquadramento e organização da rotina cambial.",
    op: "Outra operação",
  },
] as const;

const faq = [
  {
    q: "A Atual atende importadores?",
    a: "Sim. Atendemos empresas importadoras em operações de câmbio vinculadas às suas compras no exterior, com orientação sobre a documentação envolvida.",
  },
  {
    q: "Posso pagar fornecedores no exterior?",
    a: "Sim. Pagamentos a fornecedores internacionais fazem parte das operações atendidas pela Atual, com acompanhamento de um especialista quando o caso exigir.",
  },
  {
    q: "Posso receber pagamentos do exterior?",
    a: "Sim. Atendemos o recebimento de valores enviados por clientes e parceiros internacionais.",
  },
  {
    q: "Quais documentos podem ser necessários?",
    a: "Depende da natureza da operação. Documentos comerciais como faturas, contratos e comprovantes costumam ser solicitados, além dos documentos de cadastro da empresa. O especialista indica o que se aplica ao seu caso.",
  },
  {
    q: "Como funciona a cotação?",
    a: "A cotação é informada no momento da operação, considerando moeda, valor e características do negócio. Não trabalhamos com cotação fixa divulgada previamente.",
  },
  {
    q: "Quando preciso falar com um especialista?",
    a: "Sempre que a operação envolver documentação específica, estruturação, contexto particular ou dúvida sobre o caminho mais adequado.",
  },
  {
    q: "A Atual é autorizada pelo Banco Central?",
    a: "Sim. A Atual Câmbio é instituição autorizada a operar câmbio pelo Banco Central do Brasil e associada à ABRACAM.",
  },
];

/** Cases reais ainda não validados — seção permanece desativada até haver conteúdo. */
const cases: { company: string; text: string }[] = [];

function Empresas() {
  const [operation, setOperation] = useState<BusinessOperation>(businessOperations[0]);

  useEffect(() => {
    track("business_page_view", { pagina: "/empresas" });
  }, []);

  function selectOperation(value: BusinessOperation) {
    setOperation(value);
    track("business_intent_selected", { operacao: value });
    document.getElementById("formulario")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Hero
        title="Sua empresa no mercado global."
        description="Câmbio e operações internacionais com tecnologia para agilizar processos e especialistas para orientar quando necessário."
        primary={
          <ActionButton
            size="lg"
            event="business_lead_start"
            onClick={() => selectOperation(operation)}
          >
            Falar sobre minha operação
          </ActionButton>
        }
        secondary={
          <ActionLink size="lg" variant="secondaryDark" href="#solucoes">
            Conhecer soluções
          </ActionLink>
        }
        image={empresasHero.url}
        mobileImage={empresasHeroMobile.url}
        imageAlt="Executivo diante de um mapa-múndi e um porto com navio de contêineres"
      />

      <div className="surface-navy">
        <div className="mx-auto flex max-w-[1240px] flex-wrap gap-x-10 gap-y-3 px-6 py-6 lg:px-8">
          {trust.map((item) => (
            <p key={item} className="flex items-center gap-2 text-sm text-white/80">
              <span className="size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              {item}
            </p>
          ))}
        </div>
      </div>

      {/* 2. Roteador de necessidade */}
      <Section tone="light" id="necessidade">
        <SectionHeading
          eyebrow="Por onde começar"
          title="O que sua empresa precisa fazer?"
          description="Escolha pela necessidade da operação. Nós cuidamos da nomenclatura cambial."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {routerOptions.map((item) => {
            const Icon = item.icon;
            const active = operation === item.id;
            return (
              <button
                key={item.id}
                type="button"
                data-event="business_intent_selected"
                onClick={() => selectOperation(item.id)}
                className={`group flex h-full flex-col items-start rounded-lg border p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-[0_24px_60px_-30px_rgba(1,24,58,0.45)] ${
                  active ? "border-gold bg-offwhite" : "border-line bg-white"
                }`}
              >
                <Icon className="size-8 text-gold" aria-hidden />
                <h3 className="mt-6 text-lg font-bold text-navy">{item.id}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                  Começar
                  <ArrowRight
                    className="size-4 text-gold transition-transform duration-200 group-hover:translate-x-1"
                    aria-hidden
                  />
                </span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* 3. Como funciona */}
      <Section tone="offwhite" id="como-funciona">
        <SectionHeading
          eyebrow="Como funciona"
          title="Do primeiro contato à execução da operação"
          description="Um caminho claro, conduzido junto com a sua empresa."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="bg-white p-8">
              <span className="font-display text-sm font-bold text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg font-bold text-navy">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* 4. Diferencial */}
      <Section tone="light" id="diferencial">
        <SectionHeading
          eyebrow="O diferencial Atual"
          title="Plataforma digital quando você quer autonomia. Especialista quando você precisa de orientação."
          className="max-w-4xl"
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <PathCard
            eyebrow="Pela Conta Atual"
            title="Autonomia digital"
            description="Funcionalidades disponíveis digitalmente para o dia a dia da empresa."
            items={[
              "Acesso à conta pelo app e pelo navegador",
              "Acompanhamento das operações em um só lugar",
              "Histórico e comprovantes disponíveis",
              "Solicitação de atendimento sem sair da plataforma",
            ]}
            action={
              <ActionLink
                href={links.account}
                event="business_app_click"
                external
              >
                Acessar a Conta Atual
              </ActionLink>
            }
          />
          <PathCard
            tone="navy"
            eyebrow="Com atendimento consultivo"
            title="Orientação especializada"
            description="Para operações que envolvem documentação, estruturação ou contexto específico."
            items={[
              "Análise da natureza da operação",
              "Orientação sobre documentação necessária",
              "Operações recorrentes de importação e exportação",
              "Acompanhamento até a conclusão",
            ]}
            action={
              <ActionButton event="business_lead_start" onClick={() => selectOperation(operation)}>
                Falar com especialista
              </ActionButton>
            }
          />
        </div>
      </Section>

      {/* 5. Soluções */}
      <Section tone="offwhite" id="solucoes">
        <SectionHeading
          eyebrow="Soluções para empresas"
          title="O que a sua empresa resolve com a Atual"
          description="Cada operação começa por uma conversa contextualizada, não por um formulário genérico."
        />
        <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {solutions.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => selectOperation(item.op as BusinessOperation)}
              className="group flex h-full flex-col items-start bg-white p-8 text-left transition-colors hover:bg-offwhite"
            >
              <h3 className="text-lg font-bold text-navy">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy">
                Falar sobre isso
                <ArrowRight
                  className="size-4 text-gold transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </button>
          ))}
        </div>
      </Section>

      {/* 6. Formulário */}
      <Section tone="light" id="formulario">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeading
            eyebrow="Fale com a Atual"
            title="Conte sobre sua operação."
            description="Quanto mais contexto, mais objetiva a orientação do especialista. Não pedimos CPF ou CNPJ nesta etapa."
          />
          <BusinessLeadForm operation={operation} onOperationChange={setOperation} />
        </div>
      </Section>

      {/* 8. Segurança */}
      <ComplianceBlock items={security} />

      {/* 9. Cases — desativado até haver conteúdo real */}
      {cases.length > 0 ? (
        <Section tone="offwhite" id="cases">
          <SectionHeading eyebrow="Prova" title="Empresas atendidas pela Atual" />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {cases.map((item) => (
              <article key={item.company} className="rounded-lg border border-line bg-white p-8">
                <h3 className="text-lg font-bold text-navy">{item.company}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      {/* 10. FAQ */}
      <Section tone="offwhite" id="faq">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas de quem opera com o exterior" />
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

      {/* 11. CTA final */}
      <CTASection
        title="Vamos falar sobre a sua operação?"
        description="Registramos o seu contato e um especialista continua com você."
        primaryLabel="Falar com especialista"
        onPrimary={() => selectOperation(operation)}
        secondaryHref={links.account}
      />
    </>
  );
}
