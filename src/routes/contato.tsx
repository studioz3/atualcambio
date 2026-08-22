import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Headset,
  ArrowUpRight,
  Copy,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import especialistas from "@/assets/especialistas.jpg";
import {
  Section,
  SectionHeading,
  ActionButton,
  ActionLink,
  Eyebrow,
  Container,
} from "@/components/atual/primitives";
import { AccreditationSeals } from "@/components/atual/ui-kit";
import { StoreBadges } from "@/components/atual/StoreBadges";
import { track } from "@/lib/analytics";
import { links, contact } from "@/content/site";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Atual Câmbio" },
      {
        name: "description",
        content:
          "Encontre os canais oficiais de atendimento, contato, Ouvidoria e suporte da Atual Câmbio.",
      },
      { property: "og:title", content: "Contato | Atual Câmbio" },
      {
        property: "og:description",
        content: "Canais oficiais de atendimento, Ouvidoria e Canal de Denúncias da Atual Câmbio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContatoPage,
});

const faq = [
  {
    q: "Como falo com um especialista?",
    a: "Use a página Fale com um especialista. Você informa o perfil, o assunto e alguns dados da operação, e o time dá sequência ao atendimento com o contexto já registrado.",
  },
  {
    q: "Já sou cliente. Onde acesso minha conta?",
    a: "O acesso é feito pela Conta Atual, no aplicativo ou pelo ambiente digital da Atual. Consultas, operações e comprovantes ficam disponíveis nesse ambiente.",
  },
  {
    q: "Qual canal devo usar para Ouvidoria?",
    a: "A Ouvidoria é um canal de segunda instância, acionado quando o atendimento regular não resolveu a questão. O contato é feito pelo telefone 0800 770-5422 ou pelo e-mail ouvidoria@atualcambio.com.br, com o número de protocolo do atendimento anterior.",
  },
  {
    q: "Onde fica o Canal de Denúncias?",
    a: "O Canal de Denúncias é um canal específico, sigiloso e independente, destinado a relatos de conduta. Ele não substitui o atendimento comercial nem a Ouvidoria.",
  },
  {
    q: "Como confirmar se estou falando com um canal oficial?",
    a: "Os canais oficiais da Atual são os publicados neste site, com domínio atualcambio.com.br. A Atual não solicita senhas, códigos de acesso ou credenciais por telefone, e-mail ou mensagem.",
  },
];

function ContatoPage() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    track("contact_page_view", {});
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden surface-ink">
        <div className="absolute inset-0">
          <img
            src={especialistas}
            alt="Equipe da Atual Câmbio em atendimento"
            width={1408}
            height={1008}
            className="size-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/45" />
        </div>
        <Container>
          <div className="relative max-w-3xl pt-[130px] pb-16 md:py-24">
            <Eyebrow>Contato</Eyebrow>
            <h1 className="hero-title mt-6 text-white">Fale com a Atual.</h1>
            <p className="hero-copy mt-7 text-white/85">
              Escolha o canal mais adequado para sua dúvida, operação ou atendimento.
            </p>
            <div className="hero-actions mt-9">
              <ActionLink
                size="lg"
                to="/fale-com-especialista"
                event="contact_commercial_click"
                onClick={() => track("contact_commercial_click", { origem: "hero" })}
              >
                Falar com especialista
              </ActionLink>
              <ActionLink
                size="lg"
                variant="secondaryDark"
                href={links.account}
                external
                event="login_click"
              >
                Acessar minha conta
              </ActionLink>
            </div>
          </div>
        </Container>
      </section>

      {/* Atendimento comercial */}
      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:gap-20">
          <SectionHeading
            eyebrow="Atendimento comercial"
            title="Precisa falar sobre uma operação?"
            description="Nosso time pode orientar sobre remessas, operações empresariais, stablecoins, câmbio turismo e outras necessidades."
          />
          <div className="lg:justify-self-end">
            <ActionLink
              size="lg"
              to="/fale-com-especialista"
              event="contact_commercial_click"
              onClick={() => track("contact_commercial_click", { origem: "secao_comercial" })}
            >
              <Headset className="size-4" aria-hidden />
              Falar com especialista
            </ActionLink>
          </div>
        </div>
      </Section>

      {/* Canais oficiais */}
      <Section tone="offwhite">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Canais oficiais"
            title="Onde falar com a gente."
            description="Canais publicados e mantidos pela Atual Câmbio."
          />
          <ul className="space-y-7">
            <li className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">E-mail</p>
                <a
                  href={`mailto:${contact.email}`}
                  onClick={() => track("contact_email_click", { canal: "comercial" })}
                  className="mt-1 block text-base text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
                >
                  {contact.email}
                </a>
              </div>
            </li>

            {contact.whatsapp ? (
              <li className="flex gap-4">
                <MessageCircle className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                <div>
                  <p className="display-h4 text-navy">WhatsApp</p>
                  <a
                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("contact_whatsapp_click", {})}
                    className="mt-1 block text-base text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
                  >
                    {contact.whatsapp}
                  </a>
                </div>
              </li>
            ) : null}

            {contact.phone ? (
              <li className="flex gap-4">
                <Phone className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                <div>
                  <p className="display-h4 text-navy">Telefone</p>
                  <a
                    href={`tel:${contact.phone.replace(/\D/g, "")}`}
                    onClick={() => track("contact_phone_click", { canal: "comercial" })}
                    className="mt-1 block text-base text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
                  >
                    {contact.phone}
                  </a>
                </div>
              </li>
            ) : null}

            <li className="flex gap-4">
              <Clock className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">Horário de atendimento</p>
                <p className="mt-1 text-base text-muted-foreground">{contact.hours}</p>
              </div>
            </li>

            <li className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
              <div>
                <p className="display-h4 text-navy">Endereço</p>
                <p className="mt-1 text-base text-muted-foreground">{contact.address.label}</p>
                {contact.address.lines.map((line) => (
                  <p key={line} className="text-base text-muted-foreground">
                    {line}
                  </p>
                ))}
                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={contact.address.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-navy/25 px-4 text-sm font-semibold text-navy hover:bg-navy/5"
                  >
                    Ver no mapa <ArrowUpRight className="size-4" aria-hidden />
                  </a>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard?.writeText(contact.address.full);
                      setCopied(true);
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-navy/25 px-4 text-sm font-semibold text-navy hover:bg-navy/5"
                  >
                    <Copy className="size-4" aria-hidden />
                    {copied ? "Endereço copiado" : "Copiar endereço"}
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </Section>

      {/* Conta Atual */}
      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          <SectionHeading
            eyebrow="Conta Atual"
            title="Já é cliente?"
            description="Acesse a Conta Atual para consultar suas operações e funcionalidades disponíveis."
          />
          <div className="flex flex-col gap-6 lg:items-end">
            <ActionLink size="lg" href={links.account} external event="login_click">
              Acessar minha conta
            </ActionLink>
            <StoreBadges />
          </div>
        </div>
      </Section>

      {/* Ouvidoria */}
      <Section tone="navy">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            tone="light-text"
            eyebrow="Segunda instância"
            title="Ouvidoria"
            description="A Ouvidoria é um canal destinado ao tratamento de situações que já passaram pelos canais regulares de atendimento e precisam de análise pelo canal apropriado."
          />
          <ul className="space-y-6 text-white/85">
            <li>
              <p className="display-h4 text-white">Telefone</p>
              <a
                href={`tel:${contact.ouvidoria.phone.replace(/\D/g, "")}`}
                onClick={() => track("contact_ombudsman_click", { canal: "telefone" })}
                className="mt-1 block text-base underline-offset-4 hover:text-gold hover:underline"
              >
                {contact.ouvidoria.phone}
              </a>
            </li>
            <li>
              <p className="display-h4 text-white">E-mail</p>
              <a
                href={`mailto:${contact.ouvidoria.email}`}
                onClick={() => track("contact_ombudsman_click", { canal: "email" })}
                className="mt-1 block text-base underline-offset-4 hover:text-gold hover:underline"
              >
                {contact.ouvidoria.email}
              </a>
            </li>
            <li>
              <p className="display-h4 text-white">Horário</p>
              <p className="mt-1 text-base">{contact.ouvidoria.hours}</p>
            </li>
            <li>
              <Link
                to="/ouvidoria"
                onClick={() => track("contact_ombudsman_click", { canal: "pagina" })}
                className="inline-flex min-h-12 items-center gap-2 rounded-sm border border-white/35 px-6 text-sm font-semibold text-white hover:border-gold hover:text-gold"
              >
                Conhecer a Ouvidoria <ArrowUpRight className="size-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </Section>

      {/* Canal de denúncias */}
      <Section tone="offwhite">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          <SectionHeading
            eyebrow="Integridade"
            title="Canal de Denúncias"
            description="Para comunicações relacionadas a condutas que devam ser analisadas pelo processo apropriado, utilize o canal específico da Atual."
          />
          <div className="lg:justify-self-end">
            <Link
              to="/canal-de-denuncias"
              onClick={() => track("contact_whistleblower_click", {})}
              className="inline-flex min-h-14 items-center gap-2 rounded-sm border border-navy/25 px-8 text-base font-semibold text-navy hover:border-navy hover:bg-navy/5"
            >
              Acessar Canal de Denúncias <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </Section>

      {/* Privacidade e segurança */}
      <Section tone="light">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <SectionHeading
            eyebrow="Privacidade"
            title="Seus dados e sua segurança."
            description="Transparência sobre como tratamos informações pessoais e como protegemos as operações."
          />
          <div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Política de Privacidade", to: "/privacidade" as const },
                { label: "Política de Cookies", to: "/cookies" as const },
                { label: "Segurança", to: "/seguranca" as const },
                { label: "Termos de Uso", to: "/termos" as const },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="flex min-h-14 items-center justify-between gap-3 rounded-sm border border-line px-5 text-sm font-semibold text-navy transition-colors hover:border-navy"
                  >
                    {item.label}
                    <ArrowUpRight className="size-4 text-gold" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              to="/seguranca"
              onClick={() => track("contact_security_click", {})}
              className="mt-6 inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-navy underline underline-offset-4 hover:text-gold"
            >
              <ShieldCheck className="size-4" aria-hidden />
              Conhecer nossa estrutura de segurança
            </Link>
          </div>
        </div>
      </Section>

      {/* FAQ */}
      <Section tone="offwhite">
        <SectionHeading eyebrow="Perguntas frequentes" title="Dúvidas sobre canais de contato." />
        <div className="mt-12 divide-y divide-line border-t border-line">
          {faq.map((item) => (
            <details key={item.q} className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left text-base font-semibold text-navy md:text-lg">
                {item.q}
                <span className="text-gold transition-transform group-open:rotate-45" aria-hidden>
                  +
                </span>
              </summary>
              <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
                {item.a}
              </p>
            </details>
          ))}
        </div>
      </Section>

      {/* CTA final */}
      <Section tone="navy">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          <SectionHeading
            tone="light-text"
            eyebrow="Atendimento consultivo"
            title="Precisa de orientação sobre uma operação?"
            description="Conte o que você precisa resolver e um especialista dá sequência com o contexto da sua solicitação."
          />
          <div className="lg:justify-self-end">
            <ActionLink
              size="lg"
              to="/fale-com-especialista"
              event="contact_commercial_click"
              onClick={() => track("contact_commercial_click", { origem: "cta_final" })}
            >
              Falar com especialista
            </ActionLink>
          </div>
        </div>
        <AccreditationSeals className="mt-14 border-t border-white/10 pt-12" />
      </Section>
    </>
  );
}
