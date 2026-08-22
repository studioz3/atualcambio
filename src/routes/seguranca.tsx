import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  ScrollText,
  Lock,
  Headset,
  UserCheck,
  Target,
  FileText,
  SearchCheck,
  ArrowRight,
  ArrowUpRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  KeyRound,
  Server,
  Activity,
  Database,
} from "lucide-react";
import heroSeguranca from "@/assets/hero-seguranca.jpg";
import especialistas from "@/assets/especialistas.jpg";
import {
  Section,
  SectionHeading,
  ActionButton,
  ActionLink,
  Eyebrow,
  Container,
} from "@/components/atual/primitives";
import { Hero, AccreditationSeals } from "@/components/atual/ui-kit";
import { useLead } from "@/components/atual/LeadProvider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export const Route = createFileRoute("/seguranca")({
  head: () => ({
    meta: [
      { title: "Segurança, Compliance e Regulação | Atual Câmbio" },
      {
        name: "description",
        content:
          "Conheça os processos de segurança, compliance, proteção de dados e regulação que fazem parte das operações da Atual Câmbio.",
      },
      { property: "og:title", content: "Segurança, Compliance e Regulação | Atual Câmbio" },
      {
        property: "og:description",
        content:
          "Regulação, compliance, segurança digital e atendimento responsável em cada etapa da relação com a Atual Câmbio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SegurancaPage,
});

/* ---------- conteúdo ---------- */

const pillars = [
  {
    icon: ShieldCheck,
    title: "Regulação",
    text: "Instituição autorizada pelo Banco Central do Brasil.",
  },
  {
    icon: ScrollText,
    title: "Compliance",
    text: "Procedimentos para conhecer clientes e compreender operações.",
  },
  {
    icon: Lock,
    title: "Segurança digital",
    text: "Tecnologia e processos voltados à proteção do ambiente de operação.",
  },
  {
    icon: Headset,
    title: "Atendimento",
    text: "Pessoas disponíveis quando uma situação exige orientação.",
  },
];

const meaning = [
  {
    title: "Regras",
    text: "A atividade segue normas específicas para instituições do mercado financeiro.",
  },
  {
    title: "Identificação",
    text: "Clientes e operações passam pelos procedimentos aplicáveis de identificação e análise.",
  },
  {
    title: "Registro",
    text: "As operações seguem processos e documentação compatíveis com sua natureza.",
  },
  {
    title: "Responsabilidade",
    text: "A Atual possui estrutura e canais para atendimento, compliance e ouvidoria.",
  },
];

const complianceSteps = [
  { icon: UserCheck, title: "Identificação", text: "Quem está realizando a operação?" },
  { icon: Target, title: "Finalidade", text: "Por que os recursos estão sendo movimentados?" },
  {
    icon: FileText,
    title: "Documentação",
    text: "Quais informações podem ser necessárias para aquela operação?",
  },
  {
    icon: SearchCheck,
    title: "Análise",
    text: "A operação está de acordo com os procedimentos aplicáveis?",
  },
  {
    icon: ArrowRight,
    title: "Continuidade",
    text: "Depois das verificações necessárias, a operação pode seguir pelo canal apropriado.",
  },
];

/**
 * [AGUARDANDO VALIDAÇÃO ONZ] — autenticação, infraestrutura, monitoramento,
 * proteção de dados, APIs, segurança de integrações, armazenamento, logs,
 * prevenção a fraude, continuidade e resposta a incidentes.
 * Nenhuma tecnologia, certificação ou padrão técnico é afirmado antes da
 * confirmação oficial da Atual / ONZ. Não renderizar este marcador na UI.
 */
const digitalAreas = [
  {
    icon: KeyRound,
    title: "Conta e acesso",
    text: "Orientações para proteger credenciais pessoais.",
  },
  {
    icon: Database,
    title: "Dados",
    text: "Tratamento de informações dentro dos processos aplicáveis da Atual.",
  },
  {
    icon: Server,
    title: "Sistemas",
    text: "Tecnologia empregada para suportar as operações digitais.",
  },
  {
    icon: Activity,
    title: "Monitoramento",
    text: "Processos para identificação e tratamento de situações que exijam atenção.",
  },
];

const credentialTips = [
  "Não compartilhe sua senha com ninguém, mesmo que a solicitação pareça oficial.",
  "Não envie credenciais por formulários do site ou por mensagem.",
  "Confirme se está utilizando os canais oficiais da Atual.",
  "Desconfie de solicitações incomuns, com urgência ou fora do padrão.",
  "Em caso de dúvida, procure a Atual pelos canais oficiais.",
];

const documents: { label: string; to: string; event: string }[] = [
  { label: "Termos de Uso", to: "/termos", event: "security_privacy_click" },
  { label: "Política de Privacidade", to: "/privacidade", event: "security_privacy_click" },
  { label: "Política de Cookies", to: "/cookies", event: "security_privacy_click" },
  { label: "Código de Conduta", to: "/codigo-de-conduta", event: "security_cyber_click" },
  {
    label: "Política de Segurança Cibernética",
    to: "/seguranca-cibernetica",
    event: "security_cyber_click",
  },
  { label: "PLD/FT", to: "/pld-ft", event: "security_pld_click" },
  {
    label: "Responsabilidade Social",
    to: "/responsabilidade-social",
    event: "security_cyber_click",
  },
  { label: "Relatórios de Ouvidoria", to: "/ouvidoria", event: "security_ombudsman_click" },
  {
    label: "Canal de Denúncias",
    to: "/canal-de-denuncias",
    event: "security_whistleblower_click",
  },
];

const faq = [
  {
    q: "A Atual é autorizada pelo Banco Central?",
    a: "Sim. A Atual Câmbio é autorizada a operar no mercado de câmbio brasileiro e está sujeita à regulação e à supervisão do Banco Central do Brasil. Também é associada à ABRACAM.",
  },
  {
    q: "Por que minha Conta Atual passa por análise?",
    a: "Porque instituições do mercado financeiro seguem procedimentos de identificação e análise antes de liberar funcionalidades. Essa etapa faz parte do compliance aplicável à atividade.",
  },
  {
    q: "Por que podem ser solicitados documentos?",
    a: "As informações solicitadas variam conforme o tipo de operação, o valor e o perfil do cliente. Elas servem para identificar o cliente e compreender a finalidade da operação.",
  },
  {
    q: "O que é compliance?",
    a: "É o conjunto de procedimentos que a instituição adota para atuar de acordo com as normas aplicáveis, incluindo conhecer o cliente, entender a operação e analisar as informações necessárias.",
  },
  {
    q: "O que é PLD/FT?",
    a: "É a sigla para prevenção à lavagem de dinheiro e ao financiamento do terrorismo. Reúne procedimentos de identificação, qualificação, análise e monitoramento previstos nas normas aplicáveis.",
  },
  {
    q: "Como sei se estou falando com um canal oficial?",
    a: "Confira os canais publicados neste site. Se receber um contato que gere dúvida, interrompa a conversa e procure a Atual pelos canais oficiais antes de enviar dados ou recursos.",
  },
  {
    q: "A Atual pede minha senha por WhatsApp?",
    a: "Não. Sua senha é pessoal e não deve ser compartilhada com ninguém, por nenhum canal.",
  },
  {
    q: "Onde encontro a Política de Privacidade?",
    a: "A Política de Privacidade está disponível nesta página, na área de documentos, e também no rodapé do site.",
  },
  {
    q: "Como acesso a Ouvidoria?",
    a: "A Ouvidoria é um canal de segunda instância, acionado quando o atendimento regular não resolveu a demanda. Os contatos e as condições estão na página de Ouvidoria.",
  },
  {
    q: "Onde fica o Canal de Denúncias?",
    a: "O Canal de Denúncias tem página própria, com orientações sobre o que relatar e como o relato é tratado, inclusive de forma anônima.",
  },
];

/* ---------- página ---------- */

function SegurancaPage() {
  const { openLead } = useLead();

  useEffect(() => {
    track("security_page_view", { pagina: "/seguranca" });
  }, []);

  function openSpecialist(context: string) {
    track("security_specialist_click", { contexto: context });
    openLead({ intent: "duvida", context });
  }

  return (
    <>
      <Hero
        eyebrow="Segurança"
        title="Confiança faz parte da operação."
        description="Tecnologia, processos de compliance e atendimento responsável para proteger cada etapa da relação com a Atual."
        image={heroSeguranca}
        imageAlt="Fachada de vidro de um edifício corporativo ao anoitecer"
        primary={
          <ActionLink size="lg" href="#processos" event="security_bacen_click">
            Conhecer nossos processos
          </ActionLink>
        }
        secondary={
          <ActionButton
            size="lg"
            variant="secondaryDark"
            event="security_specialist_click"
            onClick={() => openSpecialist("Segurança — hero")}
          >
            Falar com especialista
          </ActionButton>
        }
      />

      {/* Trust bar */}
      <div className="bg-black">
        <Container>
          <ul className="grid gap-12 py-16 sm:grid-cols-2 md:py-20 lg:grid-cols-4 lg:gap-10">
            {pillars.map((item) => (
              <li key={item.title} className="flex flex-col items-start text-left lg:pr-8">
                <item.icon className="size-9 text-gold" aria-hidden />
                <h2 className="mt-6 text-lg font-bold text-white">{item.title}</h2>
                <p className="mt-4 text-sm leading-relaxed text-white/75">{item.text}</p>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {/* Banco Central */}
      <Section tone="navy" id="processos">
        <div className="grid gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <SectionHeading
            tone="light-text"
            eyebrow="Regulação"
            title="Operar com uma instituição autorizada faz diferença."
            description="A Atual Câmbio atua dentro do ambiente regulado do Sistema Financeiro Nacional e segue as regras aplicáveis às suas atividades."
          />
          <div className="rounded-xl border border-white/12 bg-white/[0.04] p-8 md:p-10">
            <p className="eyebrow text-gold">Instituição autorizada e associada</p>
            <AccreditationSeals className="mt-8" />
            <p className="mt-8 text-sm leading-relaxed text-white/70">
              Autorizada a operar no mercado de câmbio brasileiro, sujeita à regulação e supervisão
              do Banco Central do Brasil, e associada à ABRACAM.
            </p>
          </div>
        </div>
      </Section>

      {/* O que isso significa */}
      <Section tone="offwhite">
        <SectionHeading
          eyebrow="Na prática"
          title="Regulação não é apenas um selo."
          description="O que muda, de fato, quando a sua operação acontece dentro de uma instituição regulada."
        />
        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl bg-line sm:grid-cols-2">
          {meaning.map((item) => (
            <li key={item.title} className="bg-background p-8 md:p-10">
              <h3 className="display-h4 text-navy">{item.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{item.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Compliance */}
      <Section tone="light">
        <SectionHeading
          eyebrow="Compliance"
          title="Segurança começa antes da operação."
          description="Conhecer o cliente, entender a finalidade e analisar as informações necessárias faz parte de uma operação financeira responsável."
        />
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {complianceSteps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-lg border border-line bg-white p-8 transition-colors hover:border-gold/50"
            >
              <div className="flex items-center gap-3">
                <step.icon className="size-6 text-gold" aria-hidden />
                <span className="font-display text-xs font-bold tracking-wide text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-bold text-navy">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Conta Atual e compliance */}
      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <SectionHeading
            tone="light-text"
            eyebrow="Conta Atual"
            title="Por isso a Conta Atual passa por validação."
            description="Ao abrir uma Conta Atual, os dados informados passam pelos procedimentos de compliance aplicáveis antes da liberação das funcionalidades."
          />
          <div className="lg:justify-self-end">
            <ActionLink size="lg" to="/conta-atual" event="security_open_account_click">
              Conhecer a Conta Atual
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* PLD/FT */}
      <Section tone="offwhite">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <SectionHeading
            eyebrow="Prevenção"
            title="Prevenção à lavagem de dinheiro também protege o sistema."
            description="A Atual possui procedimentos relacionados à prevenção à lavagem de dinheiro e ao financiamento do terrorismo — PLD/FT — conforme as normas aplicáveis às suas atividades."
          />
          <div>
            <ul className="grid gap-4">
              {[
                "Identificação de clientes e das partes envolvidas.",
                "Qualificação das informações cadastrais.",
                "Análise das informações apresentadas.",
                "Compreensão das operações e da sua finalidade.",
                "Monitoramento conforme os procedimentos aplicáveis.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-base leading-relaxed text-graphite">
                  <ShieldCheck className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <ActionLink
              className="mt-10"
              variant="secondary"
              to="/pld-ft"
              event="security_pld_click"
            >
              Consultar política de PLD/FT
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* Segurança digital */}
      <Section tone="navy">
        <SectionHeading
          tone="light-text"
          eyebrow="Segurança digital"
          title="Segurança também é digital."
          description="Frentes que acompanham a operação no ambiente digital da Atual."
        />
        <ul className="mt-14 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2">
          {digitalAreas.map((area) => (
            <li key={area.title} className="bg-navy p-8 md:p-10">
              <area.icon className="size-7 text-gold" aria-hidden />
              <h3 className="mt-5 text-lg font-bold text-white">{area.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{area.text}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Proteção de dados */}
      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr]">
          <SectionHeading
            eyebrow="Proteção de dados"
            title="Seus dados merecem o mesmo cuidado que sua operação."
            description="A Atual trata dados pessoais de acordo com sua Política de Privacidade e com as obrigações aplicáveis."
          />
          <ul className="grid content-start gap-3">
            {[
              { label: "Política de Privacidade", to: "/privacidade" },
              { label: "Política de Cookies", to: "/cookies" },
              { label: "Termos de Uso", to: "/termos" },
            ].map((doc) => (
              <li key={doc.to}>
                <Link
                  to={doc.to}
                  data-event="security_privacy_click"
                  onClick={() => track("security_privacy_click", { documento: doc.label })}
                  className="flex items-center justify-between gap-6 rounded-lg border border-line bg-white px-6 py-5 text-base font-semibold text-navy transition-colors hover:border-gold/60 hover:text-gold-soft"
                >
                  {doc.label}
                  <ArrowUpRight className="size-5 shrink-0" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {/* Senhas e credenciais + golpes */}
      <Section tone="offwhite">
        <div className="grid gap-14 lg:grid-cols-2">
          <div>
            <Eyebrow>Credenciais</Eyebrow>
            <h2 className="display-h2 mt-4 text-navy">Sua senha é só sua.</h2>
            <ul className="mt-8 grid gap-4">
              {credentialTips.map((tip) => (
                <li key={tip} className="flex gap-3 text-base leading-relaxed text-graphite">
                  <KeyRound className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-line bg-white p-8 md:p-10">
            <Eyebrow>Contatos</Eyebrow>
            <h2 className="display-h3 mt-4 text-navy">Na dúvida, confirme com a Atual.</h2>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              Se você receber uma mensagem, ligação ou solicitação incomum em nome da Atual,
              confirme a origem antes de enviar dados ou recursos.
            </p>
            <ActionLink
              className="mt-8"
              variant="secondary"
              href="#canais-oficiais"
              event="security_contact_click"
            >
              Ver canais oficiais
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* Canais oficiais */}
      <Section tone="ink" id="canais-oficiais">
        <SectionHeading
          tone="light-text"
          eyebrow="Canais oficiais"
          title="Fale com a Atual pelos canais oficiais."
          description="Atendimento e Ouvidoria têm finalidades diferentes. Use o canal adequado para a sua situação."
        />
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl border border-white/12 bg-white/[0.04] p-8">
            <h3 className="display-h4 text-gold">Atendimento</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Para dúvidas, operações e suporte — este é o primeiro contato.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-gold" aria-hidden />
                <a
                  href="tel:08007705422"
                  onClick={() => track("security_contact_click", { canal: "telefone" })}
                  className="transition-colors hover:text-white"
                >
                  0800 770-5422
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-gold" aria-hidden />
                <a
                  href="mailto:contato@atualcambio.com.br"
                  onClick={() => track("security_contact_click", { canal: "email" })}
                  className="break-all transition-colors hover:text-white"
                >
                  contato@atualcambio.com.br
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="size-4 shrink-0 text-gold" aria-hidden />
                Segunda a sexta, das 9h às 18h
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-white/12 bg-white/[0.04] p-8">
            <h3 className="display-h4 text-gold">Ouvidoria</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Canal de segunda instância, para situações que já passaram pelo atendimento regular e
              exigem tratamento pelo canal apropriado.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-gold" aria-hidden />
                <a href="tel:08007705422" className="transition-colors hover:text-white">
                  0800 770-5422
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-gold" aria-hidden />
                <a
                  href="mailto:ouvidoria@atualcambio.com.br"
                  className="break-all transition-colors hover:text-white"
                >
                  ouvidoria@atualcambio.com.br
                </a>
              </li>
              <li className="flex gap-3">
                <MapPin className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                <span>
                  Ag. Iguatemi Sorocaba — Av. Prof. Izoraida Marques Peres, 256, Campolim, CEP
                  18048-110, Shopping Iguatemi, Sorocaba-SP.
                </span>
              </li>
            </ul>
            <ActionLink
              className="mt-8"
              variant="textLight"
              to="/ouvidoria"
              event="security_ombudsman_click"
            >
              Acessar a Ouvidoria
            </ActionLink>
          </div>

          <div className="rounded-xl border border-white/12 bg-white/[0.04] p-8">
            <h3 className="display-h4 text-gold">Canal de Denúncias</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              A Atual mantém canal destinado ao recebimento de comunicações relacionadas a condutas
              que devam ser analisadas pelo processo apropriado.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-white/80">
              <li className="flex items-center gap-3">
                <Mail className="size-4 shrink-0 text-gold" aria-hidden />
                <a
                  href="mailto:denuncias@atualcambio.com.br"
                  className="break-all transition-colors hover:text-white"
                >
                  denuncias@atualcambio.com.br
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-gold" aria-hidden />
                <a href="tel:08007705422" className="transition-colors hover:text-white">
                  0800 770-5422
                </a>
              </li>
            </ul>
            <ActionLink
              className="mt-8"
              variant="textLight"
              to="/canal-de-denuncias"
              event="security_whistleblower_click"
            >
              Acessar Canal de Denúncias
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* Documentos */}
      <Section tone="light">
        <SectionHeading
          eyebrow="Documentos e políticas"
          title="Transparência também é acesso à informação."
          description="Consulte na íntegra os documentos institucionais da Atual Câmbio."
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {documents.map((doc) => (
            <li key={doc.to}>
              <Link
                to={doc.to}
                data-event={doc.event}
                onClick={() => track(doc.event, { documento: doc.label })}
                className="flex h-full items-center justify-between gap-5 rounded-lg border border-line bg-white px-6 py-5 text-base font-semibold text-navy transition-colors hover:border-gold/60 hover:text-gold-soft"
              >
                <span>{doc.label}</span>
                <ArrowUpRight className="size-5 shrink-0" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      {/* Especialista */}
      <Section tone="offwhite">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <img
            src={especialistas}
            alt="Time de especialistas da Atual Câmbio em atendimento"
            width={1200}
            height={900}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <div>
            <SectionHeading
              eyebrow="Especialista"
              title={
                <>
                  Tecnologia protege o processo.
                  <br />
                  Pessoas ajudam nas decisões.
                </>
              }
              description="Quando sua operação exige orientação, documentação específica ou uma análise mais próxima, nosso time está disponível."
            />
            <ActionButton
              className="mt-10"
              size="lg"
              event="security_specialist_click"
              onClick={() => openSpecialist("Segurança — especialista")}
            >
              Falar com especialista
            </ActionButton>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="light">
        <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes sobre segurança" />
        <Accordion type="single" collapsible className="mt-12 w-full">
          {faq.map((item) => (
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
        <SectionHeading
          tone="light-text"
          className="max-w-3xl"
          eyebrow="Comece agora"
          title={
            <>
              Segurança para operar.
              <br />
              Orientação quando precisar.
            </>
          }
        />
        <div className="mt-10 flex flex-wrap gap-4">
          <ActionLink
            size="lg"
            href={links.account}
            external
            event="security_open_account_click"
          >
            Abrir Conta Atual
          </ActionLink>
          <ActionButton
            size="lg"
            variant="secondaryDark"
            event="security_specialist_click"
            onClick={() => openSpecialist("Segurança — CTA final")}
          >
            Falar com especialista
          </ActionButton>
        </div>
      </Section>
    </>
  );
}
