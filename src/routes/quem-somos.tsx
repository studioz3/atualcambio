import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  MonitorSmartphone,
  Headset,
  ShieldCheck,
  Sparkles,
  Globe2,
  HandHeart,
  Compass,
  BadgeCheck,
} from "lucide-react";
import heroQuemSomos from "@/assets/hero-quem-somos.jpg";
import especialistas from "@/assets/especialistas.jpg";
import globalImg from "@/assets/global.jpg";
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
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export const Route = createFileRoute("/quem-somos")({
  head: () =>
    pageHead({
      path: "/quem-somos",
      title: "Quem Somos | Atual Câmbio",
      description: "Conheça a Atual Câmbio, sua atuação, tecnologia, atendimento consultivo e compromisso com segurança em operações nacionais e internacionais.",
    }),
  component: QuemSomosPage,
});

/* ---------- conteúdo institucional validado ---------- */

const values = [
  { title: "Transparência", text: "Clareza antes, durante e depois da operação." },
  { title: "Agilidade", text: "Tecnologia e processos para tornar a jornada mais eficiente." },
  { title: "Segurança", text: "Responsabilidade em cada etapa." },
  { title: "Atendimento", text: "Pessoas disponíveis quando o cliente precisa." },
  { title: "Foco no cliente", text: "A solução começa pela necessidade, não pelo produto." },
];

const traits = [
  {
    icon: Sparkles,
    title: "Sofisticada sem ostentação",
    text: "Comunicação clara, postura discreta e consistência.",
  },
  { icon: Globe2, title: "Global", text: "Visão internacional com execução local." },
  { icon: HandHeart, title: "Presente", text: "Atendimento próximo e acessível." },
  {
    icon: Compass,
    title: "Antecipadora",
    text: "Orienta antes da operação e ajuda o cliente a decidir melhor.",
  },
  {
    icon: BadgeCheck,
    title: "Confiável",
    text: "Clareza, compliance e responsabilidade como parte da relação.",
  },
];

const securityItems = [
  {
    title: "Autorização",
    text: "Instituição autorizada a operar no mercado de câmbio brasileiro, sob regulação e supervisão do Banco Central do Brasil.",
  },
  {
    title: "Compliance",
    text: "Políticas de conhecimento do cliente, prevenção à lavagem de dinheiro e monitoramento de operações.",
  },
  {
    title: "Processos",
    text: "Identificação, finalidade e documentação avaliadas conforme a natureza de cada operação.",
  },
  {
    title: "Proteção de dados",
    text: "Tratamento de dados pessoais conforme a LGPD, com finalidade definida e acesso controlado.",
  },
];

const forPeople = ["Remessas", "Câmbio turismo", "Stablecoins", "Conta Atual"];
const forBusiness = ["Importação", "Exportação", "Pagamentos", "Recebimentos", "Consultoria"];

/* ---------- página ---------- */

function QuemSomosPage() {
  const { openLead } = useLead();

  useEffect(() => {
    track("about_page_view");
  }, []);

  const openSpecialist = (origem: string) => {
    track("about_specialist_click", { origem });
    openLead({ intent: "duvida", context: origem });
  };

  return (
    <>
      <Hero
        eyebrow="A Atual"
        title={
          <>
            Global na visão.
            <br />
            Próxima na relação.
          </>
        }
        description="A Atual Câmbio une tecnologia, experiência e atendimento consultivo para tornar operações nacionais e internacionais mais simples, estruturadas e seguras."
        image={heroQuemSomos}
        imageAlt="Profissionais da Atual Câmbio em conversa no escritório"
        primary={
          <ActionLink
            size="lg"
            to="/solucoes"
            event="about_solutions_click"
            className="w-full sm:w-auto"
          >
            Conhecer nossas soluções
          </ActionLink>
        }
        secondary={
          <ActionButton
            size="lg"
            variant="secondaryDark"
            event="about_specialist_click"
            onClick={() => openSpecialist("hero_quem_somos")}
            className="w-full sm:w-auto"
          >
            Falar com especialista
          </ActionButton>
        }
      />

      {/* 3 — Quem somos */}
      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Quem somos"
            title={
              <>
                Tecnologia para simplificar.
                <br className="hidden md:block" /> Experiência para orientar.
              </>
            }
          />
          <div className="max-w-xl space-y-6">
            <p className="body-lg text-muted-foreground">
              A Atual Câmbio nasceu com o propósito de simplificar o mercado de câmbio, unindo
              experiência e tecnologia para oferecer soluções eficientes, seguras e inteligentes a
              clientes e parceiros.
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              Nossa atuação combina processos digitais com profissionais experientes, permitindo que
              cada cliente escolha entre autonomia e orientação conforme a necessidade da operação.
            </p>
          </div>
        </div>
      </Section>

      {/* 4 — Nosso jeito de atuar */}
      <Section tone="offwhite">
        <SectionHeading
          eyebrow="Nosso jeito de atuar"
          title={
            <>
              Digital quando faz sentido.
              <br className="hidden md:block" /> Humano quando faz diferença.
            </>
          }
          description="Plataforma digital quando você quer autonomia. Especialista quando você precisa de orientação."
          className="max-w-3xl"
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
          <div className="flex flex-col bg-white p-8 md:p-10">
            <MonitorSmartphone className="size-6 text-gold" aria-hidden />
            <h3 className="display-h4 mt-6 text-navy">Plataforma digital</h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              A Conta Atual permite acessar soluções digitais, acompanhar operações e utilizar
              funcionalidades disponibilizadas no aplicativo.
            </p>
            <div className="mt-8">
              <ActionLink
                to="/conta-atual"
                variant="text"
                event="about_account_click"
                className="gap-1"
              >
                Conhecer a Conta Atual <ArrowRight className="size-4" aria-hidden />
              </ActionLink>
            </div>
          </div>
          <div className="flex flex-col bg-white p-8 md:p-10">
            <Headset className="size-6 text-gold" aria-hidden />
            <h3 className="display-h4 mt-6 text-navy">Atendimento consultivo</h3>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Quando uma operação exige análise, documentação ou orientação, nossos especialistas
              ajudam a estruturar o caminho.
            </p>
            <div className="mt-8">
              <ActionButton
                variant="text"
                event="about_specialist_click"
                onClick={() => openSpecialist("jeito_de_atuar")}
                className="gap-1"
              >
                Falar com especialista <ArrowRight className="size-4" aria-hidden />
              </ActionButton>
            </div>
          </div>
        </div>
      </Section>

      {/* 5 e 6 — Missão e visão */}
      <Section tone="navy">
        <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <Eyebrow>Nossa missão</Eyebrow>
            <p className="display-h3 mt-6 text-white">
              Facilitar operações de câmbio seguras e ágeis, com atendimento personalizado e
              soluções adequadas às necessidades de cada cliente.
            </p>
          </div>
          <div className="lg:border-l lg:border-white/12 lg:pl-24">
            <Eyebrow>Nossa visão</Eyebrow>
            <p className="display-h3 mt-6 text-white">
              Ser referência em soluções de câmbio no Brasil, reconhecida pela confiança, inovação e
              excelência no atendimento.
            </p>
          </div>
        </div>
      </Section>

      {/* 7 — Valores */}
      <Section tone="light">
        <SectionHeading eyebrow="Valores" title="O que orienta nossas decisões." />
        <ul className="mt-14 divide-y divide-line border-t border-line">
          {values.map((item) => (
            <li
              key={item.title}
              className="grid gap-2 py-8 md:grid-cols-[minmax(200px,280px)_1fr] md:gap-12"
            >
              <h3 className="display-h4 text-navy">{item.title}</h3>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {/* 8 — Posicionamento */}
      <Section tone="ink">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
          <div>
            <Eyebrow>Posicionamento</Eyebrow>
            <h2 className="display-h2 mt-4 text-white">
              Pensar global exige mais do que movimentar dinheiro.
            </h2>
            <p className="body-lg mt-6 text-white/75">
              Exige entender contextos, regras, moedas, mercados e objetivos. A Atual combina visão
              internacional com execução próxima para ajudar pessoas e empresas a avançar com mais
              clareza.
            </p>
            <p className="display-h4 mt-10 text-gold">
              Você toma decisões globais. Nós cuidamos do caminho.
            </p>
          </div>
          <img
            src={globalImg}
            alt="Visão internacional da Atual Câmbio"
            width={1200}
            height={900}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
        </div>
      </Section>

      {/* 9 — Cinco traços */}
      <Section tone="offwhite">
        <SectionHeading eyebrow="Nossos traços" title="Cinco traços da Atual." />
        <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {traits.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="bg-white p-8">
                <Icon className="size-5 text-gold" aria-hidden />
                <h3 className="display-h4 mt-6 text-navy">{item.title}</h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{item.text}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* 10 — Pessoas */}
      <Section tone="light">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <img
            src={especialistas}
            alt="Equipe da Atual Câmbio em atendimento consultivo"
            width={1408}
            height={1008}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <SectionHeading
            eyebrow="Pessoas"
            title="Por trás da tecnologia, tem gente."
            description="Nossa equipe reúne profissionais que acompanham o mercado, entendem operações e estão disponíveis quando o cliente precisa de orientação."
          />
        </div>
      </Section>

      {/* 11 — Especialista como diferencial */}
      <Section tone="navy">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <SectionHeading
            tone="light-text"
            eyebrow="Especialista"
            title={
              <>
                Tecnologia para agilizar.
                <br className="hidden md:block" /> Gente para orientar.
              </>
            }
            description="Nem toda operação precisa de atendimento humano. Mas quando precisa, queremos que exista alguém capaz de entender o contexto e ajudar a encontrar o caminho adequado."
          />
          <div className="lg:justify-self-end">
            <ActionButton
              size="lg"
              event="about_specialist_click"
              onClick={() => openSpecialist("bloco_especialista")}
            >
              Falar com especialista
            </ActionButton>
          </div>
        </div>
      </Section>

      {/* 12 — Tecnologia */}
      <Section tone="light">
        <SectionHeading
          eyebrow="Tecnologia"
          title="Tecnologia não substitui relacionamento. Ela melhora a experiência."
          description="A Atual aplica tecnologia em seus processos para tornar operações mais estruturadas, ágeis e acessíveis, sem abrir mão do atendimento quando ele agrega valor."
          className="max-w-3xl"
        />
        <div className="mt-12 flex flex-wrap gap-3">
          <ActionLink to="/conta-atual" variant="secondary" event="about_account_click">
            Conta Atual
          </ActionLink>
          <ActionLink to="/solucoes" variant="secondary" event="about_solutions_click">
            Remessas internacionais
          </ActionLink>
          <ActionLink to="/stablecoins" variant="secondary" event="about_solutions_click">
            USDT e USDC
          </ActionLink>
          <ActionLink to="/cotacoes" variant="secondary" event="about_solutions_click">
            Cotações
          </ActionLink>
        </div>
      </Section>

      {/* 13 — Segurança e regulação */}
      <Section tone="navy">
        <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <SectionHeading
              tone="light-text"
              eyebrow="Segurança"
              title="Confiança precisa de estrutura."
            />
            <div className="mt-10">
              <ActionLink
                to="/seguranca"
                size="lg"
                variant="secondaryDark"
                event="about_security_click"
              >
                Conhecer nossa estrutura de segurança
              </ActionLink>
            </div>
          </div>
          <div className="grid gap-px self-start overflow-hidden rounded-md bg-white/10">
            {securityItems.map((item) => (
              <div key={item.title} className="bg-navy p-8">
                <h3 className="display-h4 flex items-center gap-2 text-gold">
                  <ShieldCheck className="size-5" aria-hidden />
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-white/75">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
        <AccreditationSeals className="mt-14 border-t border-white/10 pt-12" />
      </Section>

      {/* 15 — Para pessoas e empresas */}
      <Section tone="offwhite">
        <SectionHeading
          eyebrow="Soluções"
          title="Soluções para quem vive e faz negócios no mundo."
          className="max-w-3xl"
        />
        <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2">
          <div className="flex flex-col bg-white p-8 md:p-10">
            <h3 className="display-h4 text-navy">Para você</h3>
            <ul className="mt-6 space-y-3 text-base text-muted-foreground">
              {forPeople.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-8">
              <ActionLink to="/solucoes" variant="text" event="about_solutions_click" className="gap-1">
                Conhecer soluções <ArrowUpRight className="size-4" aria-hidden />
              </ActionLink>
            </div>
          </div>
          <div className="flex flex-col bg-white p-8 md:p-10">
            <h3 className="display-h4 text-navy">Para sua empresa</h3>
            <ul className="mt-6 space-y-3 text-base text-muted-foreground">
              {forBusiness.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <div className="mt-8">
              <ActionLink to="/empresas" variant="text" event="about_business_click" className="gap-1">
                Conhecer soluções para empresas <ArrowUpRight className="size-4" aria-hidden />
              </ActionLink>
            </div>
          </div>
        </div>
      </Section>

      {/* 16 — Atuação consultiva */}
      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading eyebrow="Atuação consultiva" title="Antes de executar, entender." />
          <p className="body-lg max-w-xl text-muted-foreground">
            Uma boa operação começa pela compreensão da necessidade, da finalidade e das condições
            envolvidas. É assim que a Atual busca construir relações de longo prazo com seus
            clientes.
          </p>
        </div>
      </Section>

      {/* 17 — Momento Atual */}
      <Section tone="ink">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-20">
          <div>
            <Eyebrow>Momento Atual</Eyebrow>
            <h2 className="display-h2 mt-4 text-white">
              Informação também faz parte da relação.
            </h2>
          </div>
          <div>
            <p className="body-lg text-white/75">
              No Momento Atual, acompanhamos acontecimentos de mercado, negócios e economia para
              ajudar nossos clientes a entender o contexto antes de decidir.
            </p>
            <div className="mt-8">
              <Link
                to="/conteudo"
                hash="momento-atual"
                data-event="about_content_click"
                onClick={() => track("about_content_click")}
                className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-white/35 px-6 text-sm font-semibold text-white transition-colors hover:border-gold hover:text-gold"
              >
                Acompanhar o Momento Atual <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* 18 — CTA final */}
      <Section tone="navy">
        <SectionHeading
          tone="light-text"
          eyebrow="Comece agora"
          title="Se você pensa global, você é Atual."
          description="Escolha como quer começar: pela plataforma digital ou falando com nosso time."
          className="max-w-3xl"
        />
        <div className="mt-10 flex flex-wrap gap-3">
          <ActionLink
            size="lg"
            href={links.account}
            external
            event="about_open_account_click"
            className="w-full sm:w-auto"
          >
            Abrir Conta Atual
          </ActionLink>
          <ActionButton
            size="lg"
            variant="secondaryDark"
            event="about_specialist_click"
            onClick={() => openSpecialist("cta_final")}
            className="w-full sm:w-auto"
          >
            Falar com especialista
          </ActionButton>
        </div>
      </Section>
    </>
  );
}
