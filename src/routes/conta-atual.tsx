import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Wallet,
  ArrowDownToLine,
  Send,
  Coins,
  ReceiptText,
  Activity,
  ShieldCheck,
  UserCheck,
  FileCheck2,
  CheckCircle2,
  Lock,
} from "lucide-react";

import heroDesktop from "@/assets/conta-hero-desktop-v3.jpg.asset.json";
import heroMobile from "@/assets/conta-hero-mobile-v3.jpg.asset.json";
/** Telas reais do app — trocar o import (ou o asset) atualiza a prova de produto. */
import appInicio from "@/assets/app-inicio.jpg.asset.json";
import appRemessa from "@/assets/app-remessa.jpg.asset.json";
import appMercados from "@/assets/app-mercados.jpg.asset.json";
import appExtrato from "@/assets/app-extrato.jpg.asset.json";
import especialistas from "@/assets/especialistas.jpg";
import { Section, SectionHeading, ActionButton, ActionLink } from "@/components/atual/primitives";
import { Hero, TrustPillars, PathCard } from "@/components/atual/ui-kit";
import { StoreBadges } from "@/components/atual/StoreBadges";
import { AccountLeadForm } from "@/components/atual/AccountLeadForm";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { track } from "@/lib/analytics";
import { links } from "@/content/site";

export const Route = createFileRoute("/conta-atual")({
  head: () => ({
    meta: [
      { title: "Conta Atual: o app da Atual Câmbio | Atual Câmbio" },
      {
        name: "description",
        content:
          "Abra sua Conta Atual pelo aplicativo: saldo em reais, remessas internacionais, USDT e USDC, extrato e acompanhamento das suas operações.",
      },
      { property: "og:title", content: "Sua Conta Atual, onde você estiver" },
      {
        property: "og:description",
        content:
          "Acesse as soluções digitais da Atual, acompanhe suas operações e movimente recursos pelo aplicativo.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContaAtual,
});

const pillars = [
  {
    id: "tecnologia" as const,
    title: "Digital",
    text: "Operações e acompanhamento pelo aplicativo.",
  },
  {
    id: "seguranca" as const,
    title: "Segurança",
    text: "Cadastro e validação dentro dos processos da Atual.",
  },
  {
    id: "atendimento" as const,
    title: "Atendimento",
    text: "Especialistas disponíveis quando você precisar de orientação.",
  },
];

const features = [
  { icon: Wallet, title: "Saldo em reais", text: "Consulte seu saldo disponível." },
  {
    icon: ArrowDownToLine,
    title: "Depositar recursos",
    text: "Adicione saldo por Pix ou TED, conforme disponibilidade apresentada no aplicativo.",
  },
  {
    icon: Send,
    title: "Remessas internacionais",
    text: "Simule e acompanhe transferências internacionais.",
  },
  { icon: Coins, title: "USDT", text: "Compre e venda USDT." },
  { icon: Coins, title: "USDC", text: "Compre e venda USDC." },
  { icon: ReceiptText, title: "Extrato", text: "Consulte movimentações e histórico." },
  {
    icon: Activity,
    title: "Acompanhamento",
    text: "Acompanhe suas operações e seus respectivos status.",
  },
];

const screens = [
  { src: appInicio.url, alt: "Tela inicial da Conta Atual com saldo em reais", label: "Saldo" },
  { src: appRemessa.url, alt: "Tela de transferência internacional no app da Atual", label: "Transferência internacional" },
  { src: appMercados.url, alt: "Tela de mercados com USDT e USDC no app da Atual", label: "USDT e USDC" },
  { src: appExtrato.url, alt: "Tela de extrato de operações no app da Atual", label: "Extrato" },
];

const steps = [
  { title: "Baixe o aplicativo", text: "Google Play ou App Store." },
  { title: "Faça seu cadastro", text: "Informe os dados solicitados no aplicativo." },
  { title: "Envie as informações necessárias", text: "Conforme solicitado durante o processo." },
  {
    title: "Sua conta passa pela validação",
    text: "A Atual realiza os procedimentos de compliance aplicáveis.",
  },
  {
    title: "Depois da aprovação, você pode começar a operar",
    text: "Conforme as funcionalidades disponíveis para sua conta.",
  },
];

const complianceItems = [
  { icon: UserCheck, title: "Identificação", text: "Precisamos saber quem está utilizando a conta." },
  {
    icon: FileCheck2,
    title: "Informações",
    text: "Alguns dados e documentos podem ser solicitados durante o cadastro.",
  },
  {
    icon: ShieldCheck,
    title: "Análise",
    text: "As informações passam pelos procedimentos aplicáveis da Atual.",
  },
  {
    icon: CheckCircle2,
    title: "Aprovação",
    text: "Após a validação, você acessa as funcionalidades disponibilizadas para sua conta.",
  },
];

const faq = [
  {
    q: "O que é a Conta Atual?",
    a: "A Conta Atual é o acesso digital às soluções disponíveis da Atual Câmbio. Pelo aplicativo você consulta seu saldo, movimenta recursos e acompanha suas operações.",
  },
  {
    q: "Como abro minha Conta Atual?",
    a: "Baixe o aplicativo na Google Play ou na App Store, faça seu cadastro e envie as informações solicitadas durante o processo. Depois da validação, você acessa as funcionalidades disponíveis para sua conta.",
  },
  {
    q: "Minha conta passa por análise?",
    a: "Sim. A validação faz parte dos procedimentos de segurança e compliance aplicáveis às operações financeiras da Atual.",
  },
  {
    q: "Quanto tempo leva para a conta ser aprovada?",
    a: "O prazo pode variar conforme a análise e as informações necessárias ao processo.",
  },
  {
    q: "O que posso fazer pelo aplicativo?",
    a: "Consultar seu saldo em reais, adicionar saldo conforme as opções apresentadas no app, iniciar e acompanhar remessas internacionais, comprar e vender USDT e USDC, consultar extrato e acompanhar o status das operações.",
  },
  {
    q: "Posso fazer remessas internacionais?",
    a: "Sim. Pela Conta Atual você simula, inicia e acompanha as remessas internacionais disponíveis no aplicativo.",
  },
  {
    q: "Posso comprar e vender USDT e USDC?",
    a: "Sim. As operações de compra e venda de USDT e USDC são feitas pelo ambiente da Conta Atual.",
  },
  {
    q: "Como adiciono saldo?",
    a: "O saldo pode ser adicionado por Pix ou TED, conforme a disponibilidade e as instruções apresentadas no próprio aplicativo.",
  },
  {
    q: "Onde vejo minhas movimentações?",
    a: "No extrato do aplicativo, onde ficam registradas as movimentações e o histórico das suas operações.",
  },
  {
    q: "Não encontrei a operação que preciso. O que faço?",
    a: "Fale com um especialista da Atual. Ele orienta sobre o caminho mais adequado para a sua operação.",
  },
  {
    q: "A Atual é autorizada pelo Banco Central?",
    a: "Sim. A Atual Câmbio é instituição autorizada a operar câmbio pelo Banco Central do Brasil e associada à ABRACAM.",
  },
];

function ContaAtual() {
  useEffect(() => {
    track("account_page_view", { pagina: "/conta-atual" });
  }, []);

  function goToForm() {
    track("account_specialist_start", { origem: "cta" });
    document.getElementById("especialista")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <Hero
        title="Sua Conta Atual, onde você estiver."
        description="Acesse soluções digitais da Atual, acompanhe suas operações e movimente recursos pelo aplicativo."
        primary={
          <ActionLink size="lg" href={links.account} external event="open_account_click">
            Abrir Conta Atual
          </ActionLink>
        }
        secondary={
          <ActionLink
            size="lg"
            variant="secondaryDark"
            href={links.account}
            external
            event="existing_client_click"
          >
            Já tenho conta
          </ActionLink>
        }
        image={heroDesktop.url}
        mobileImage={heroMobile.url}
        rawImage
        imageAlt="Smartphones exibindo o aplicativo da Conta Atual"
      />

      <TrustPillars items={pillars} />

      {/* O que você pode fazer */}
      <Section tone="light" id="funcionalidades">
        <div className="grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="No aplicativo"
              title="Uma plataforma para suas operações com a Atual."
              description="As funcionalidades disponíveis para sua conta ficam reunidas em um só lugar."
            />
            <ul className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="bg-white p-7">
                    <Icon className="size-6 text-gold" aria-hidden />
                    <h3 className="mt-5 text-base font-bold text-navy">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                  </li>
                );
              })}
            </ul>
          </div>
          <img
            src={appInicio.url}
            alt="Tela inicial da Conta Atual com saldo em reais"
            loading="lazy"
            className="mx-auto block h-auto w-full max-w-[320px] rounded-2xl border border-line object-contain shadow-[0_30px_80px_-40px_rgba(1,24,58,0.55)] lg:max-w-[380px]"
          />
        </div>
      </Section>

      {/* Produto real como prova */}
      <Section tone="ink" id="app">
        <SectionHeading
          tone="light-text"
          eyebrow="Produto real"
          title="Feita para você ver, acompanhar e operar."
          description="Telas reais da Conta Atual: saldo, transferência internacional, USDT e USDC e extrato."
        />
        <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {screens.map((screen, index) => (
            <li
              key={screen.label}
              className={index % 2 === 1 ? "lg:translate-y-8" : undefined}
            >
              <img
                src={screen.src}
                alt={screen.alt}
                loading="lazy"
                className="mx-auto block h-auto w-full max-w-[280px] rounded-2xl border border-white/12 object-contain"
              />
              <p className="mt-5 text-center text-sm font-semibold text-white/80">{screen.label}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* Como abrir a conta */}
      <Section tone="offwhite" id="abrir-conta">
        <SectionHeading
          eyebrow="Passo a passo"
          title="Abra sua Conta Atual pelo app."
          description="Uma jornada simples, conduzida pelo próprio aplicativo."
        />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.title} className="bg-white p-7">
              <span className="font-display text-sm font-bold text-gold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-base font-bold text-navy">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
            </li>
          ))}
        </ol>
        <StoreBadges className="mt-10 text-navy" origem="conta-atual" />
      </Section>

      {/* Compliance */}
      <Section tone="navy" id="seguranca">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              tone="light-text"
              eyebrow="Compliance"
              title="Segurança começa antes da primeira operação."
              description="A validação da conta faz parte dos procedimentos de segurança e compliance aplicáveis às operações financeiras da Atual."
            />
            <ActionLink
              to="/seguranca-cibernetica"
              variant="secondaryDark"
              className="mt-10"
              event="account_security_click"
            >
              Conheça nossa estrutura de segurança
            </ActionLink>
          </div>
          <div className="grid gap-px self-start overflow-hidden rounded-md bg-white/10 sm:grid-cols-2">
            {complianceItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-navy p-8">
                  <Icon className="size-6 text-gold" aria-hidden />
                  <h3 className="mt-5 text-base font-bold text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{item.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Novo cliente x cliente existente */}
      <Section tone="light" id="como-continuar">
        <SectionHeading eyebrow="Escolha o caminho" title="Como você quer continuar?" />
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <PathCard
            eyebrow="Novo por aqui"
            title="Ainda não tenho Conta Atual"
            description="Baixe o aplicativo e comece seu cadastro."
            items={[
              "Cadastro feito pelo aplicativo",
              "Validação dentro dos processos da Atual",
              "Acesso às funcionalidades disponíveis após a aprovação",
            ]}
            action={
              <ActionLink href={links.account} external event="open_account_click">
                Abrir Conta Atual
              </ActionLink>
            }
          />
          <PathCard
            tone="navy"
            eyebrow="Já sou cliente"
            title="Já sou cliente"
            description="Acesse sua conta e continue suas operações."
            items={[
              "Saldo e extrato em um só lugar",
              "Remessas internacionais e stablecoins",
              "Acompanhamento das operações",
            ]}
            action={
              <ActionLink href={links.account} external event="existing_client_click">
                Acessar minha conta
              </ActionLink>
            }
          />
        </div>
      </Section>

      {/* Remessas */}
      <Section tone="offwhite" id="remessas">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionHeading
              eyebrow="Remessas"
              title="Envie recursos para o exterior."
              description="Pela Conta Atual, você pode iniciar e acompanhar remessas internacionais disponíveis no aplicativo."
            />
            <ActionLink
              to="/solucoes"
              className="mt-10"
              event="account_remittance_click"
            >
              Conhecer Remessas Internacionais
            </ActionLink>
          </div>
          <img
            src={appRemessa.url}
            alt="Tela de transferência internacional no app da Atual"
            loading="lazy"
            className="mx-auto block h-auto w-full max-w-[300px] rounded-2xl border border-line object-contain"
          />
        </div>
      </Section>

      {/* USDT / USDC */}
      <Section tone="light" id="stablecoins">
        <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
          <img
            src={appMercados.url}
            alt="Tela de mercados com USDT e USDC no app da Atual"
            loading="lazy"
            className="order-2 mx-auto block h-auto w-full max-w-[300px] rounded-2xl border border-line object-contain lg:order-1"
          />
          <div className="order-1 lg:order-2">
            <SectionHeading
              eyebrow="Stablecoins"
              title="USDT e USDC pela Conta Atual."
              description="Consulte as soluções disponíveis para comprar e vender stablecoins pelo aplicativo."
            />
            <ActionLink to="/stablecoins" className="mt-10" event="account_stablecoin_click">
              Conhecer USDT / USDC
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* Autonomia + orientação */}
      <Section tone="offwhite" id="autonomia">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <img
            src={especialistas}
            alt="Especialistas da Atual Câmbio em atendimento"
            width={1200}
            height={900}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-xl object-cover"
          />
          <div>
            <SectionHeading
              eyebrow="Autonomia e orientação"
              title={
                <>
                  Resolva pelo app.
                  <br />
                  Conte com a Atual quando precisar.
                </>
              }
              description="A plataforma digital dá autonomia para acessar as soluções disponíveis. Quando surgir uma dúvida ou uma operação exigir orientação, nosso time está disponível."
            />
            <div className="mt-10 flex flex-wrap gap-4">
              <ActionLink href={links.account} external event="existing_client_click">
                Acessar Conta Atual
              </ActionLink>
              <ActionButton variant="secondary" event="account_specialist_start" onClick={goToForm}>
                Falar com especialista
              </ActionButton>
            </div>
          </div>
        </div>
      </Section>

      {/* Especialista + formulário */}
      <Section tone="light" id="especialista">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow="Suporte"
              title="Quando o especialista entra"
              description="Se você não encontrar no aplicativo a operação que precisa, ou quiser orientação antes de seguir, fale com um especialista da Atual."
            />
            <div className="mt-10 flex gap-4 rounded-lg border border-gold/40 bg-offwhite p-7">
              <Lock className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <h3 className="text-base font-bold text-navy">Seus dados de acesso são pessoais.</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  A Atual nunca deve solicitar sua senha por meio de formulário público do site.
                </p>
              </div>
            </div>
          </div>
          <AccountLeadForm />
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="offwhite" id="faq">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas sobre a Conta Atual" />
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

      {/* CTA final */}
      <Section tone="navy" id="cta">
        <SectionHeading
          tone="light-text"
          eyebrow="Comece agora"
          title="Comece pela Conta Atual."
          description="Baixe o aplicativo, faça seu cadastro e acesse as soluções disponíveis depois da validação."
          className="max-w-3xl"
        />
        <div className="mt-10 flex flex-wrap gap-4">
          <ActionLink
            size="lg"
            href={links.account}
            external
            event="open_account_click"
            className="w-full sm:w-auto"
          >
            Abrir Conta Atual
          </ActionLink>
          <ActionLink
            size="lg"
            variant="secondaryDark"
            href={links.account}
            external
            event="existing_client_click"
            className="w-full sm:w-auto"
          >
            Já tenho conta
          </ActionLink>
        </div>
        <StoreBadges className="mt-12 text-white" origem="conta-atual-cta" />
      </Section>
    </>
  );
}
