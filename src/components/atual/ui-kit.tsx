import bancoCentral from "@/assets/banco-central.png.asset.json";
import abracam from "@/assets/abracam.png.asset.json";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ShieldCheck, Smartphone } from "lucide-react";
import { Container, Eyebrow, ActionButton, ActionLink, Section, SectionHeading } from "./primitives";
import { cn } from "@/lib/utils";

/* ---------- Hero ---------- */
export function Hero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  image,
  imageAlt,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  primary?: ReactNode;
  secondary?: ReactNode;
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
}) {
  return (
    <section className="surface-navy relative overflow-hidden">
      {image ? (
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <img
            src={image}
            alt={imageAlt ?? ""}
            width={1600}
            height={1200}
            className="size-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/75 to-transparent" />
        </div>
      ) : null}
      <Container>
        <div className="relative grid gap-12 py-20 md:py-28 lg:min-h-[620px] lg:grid-cols-2 lg:items-center lg:py-32">
          <div className="max-w-xl">
            {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
            <h1 className="font-display mt-6 text-[36px] leading-[1.06] font-bold text-white md:text-[58px]">
              {title}
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">{description}</p>
            {primary || secondary ? (
              <div className="mt-10 flex flex-wrap gap-3">
                {primary}
                {secondary}
              </div>
            ) : null}
          </div>
          {image ? (
            <div className="lg:hidden">
              <img
                src={image}
                alt={imageAlt ?? ""}
                width={1600}
                height={1200}
                className="aspect-[4/3] w-full rounded-xl object-cover"
              />
            </div>
          ) : null}
          {children}
        </div>
      </Container>
    </section>
  );
}

/* ---------- TrustBar ---------- */
export function TrustBar({ items }: { items: string[] }) {
  return (
    <div className="relative border-t border-white/10 surface-navy">
      <Container>
        <ul className="grid gap-4 py-6 md:grid-cols-3">
          {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-white/65">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

/* ---------- IntentCard ---------- */
export function IntentCard({
  title,
  description,
  event,
  onSelect,
  to,
  hash,
}: {
  title: string;
  description: string;
  event: string;
  onSelect: () => void;
  to: string;
  hash?: string | undefined;
}) {
  return (
    <div className="group flex min-h-[190px] flex-col justify-between bg-white p-7 transition-colors hover:bg-offwhite">
      <div>
        <h3 className="text-lg leading-snug font-semibold text-navy">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
        <button
          type="button"
          data-event={event}
          data-intent={title}
          onClick={onSelect}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-soft"
        >
          Começar
          <ArrowRight
            className="size-4 text-gold transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          />
        </button>
        <Link
          to={to}
          {...(hash ? { hash } : {})}
          data-event="intent_selected"
          className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
        >
          Saiba mais
        </Link>
      </div>
    </div>
  );
}

/* ---------- ProductCard ---------- */
export function ProductCard({
  title,
  summary,
  bullets,
  to,
  hash,
  action,
  event,
}: {
  title: string;
  summary: string;
  bullets?: string[];
  to: string;
  hash?: string | undefined;
  action?: ReactNode;
  event?: string;
}) {
  return (
    <article className="flex flex-col bg-white p-8">
      <h3 className="font-display text-xl font-bold text-navy">{title}</h3>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{summary}</p>
      {bullets ? (
        <ul className="mt-6 space-y-3">
          {bullets.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-graphite">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        {action}
        <Link
          to={to}
          {...(hash ? { hash } : {})}
          data-event={event}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
        >
          Ver detalhes <ArrowRight className="size-4 text-gold" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

/* ---------- NewsCard ---------- */
export function NewsCard({
  category,
  title,
  excerpt,
  date,
}: {
  category: string;
  title: string;
  excerpt: string;
  date: string;
}) {
  return (
    <article className="group">
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-line" aria-hidden />
      <div className="mt-5">
        <Eyebrow>{category}</Eyebrow>
        <h3 className="mt-3 text-lg leading-snug font-semibold text-navy">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        <Link
          to="/conteudo"
          data-event="article_click"
          className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
        >
          Ler <ArrowUpRight className="size-4 text-gold" aria-hidden />
        </Link>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </article>
  );
}

/* ---------- AppMockup ---------- */
export function AppMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[280px] rounded-[32px] border border-white/15 bg-navy-soft p-3 shadow-[0_30px_80px_rgba(1,24,58,0.45)]",
        className,
      )}
      aria-hidden
    >
      <div className="rounded-[24px] bg-navy p-5">
        <div className="mx-auto h-1.5 w-16 rounded-full bg-white/20" />
        <p className="eyebrow mt-6 text-gold">Conta Atual</p>
        <p className="font-display mt-2 text-2xl font-bold text-white">—</p>
        <p className="mt-1 text-[11px] text-white/45">Saldo indisponível [AGUARDANDO ONZ]</p>
        <div className="mt-6 space-y-3">
          {["Enviar ao exterior", "Comprar USDT", "Minhas operações"].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3 text-xs text-white/75"
            >
              {item}
              <ArrowRight className="size-3.5 text-gold" />
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center gap-2 text-[11px] text-white/45">
          <Smartphone className="size-3.5" /> Interface ilustrativa
        </div>
      </div>
    </div>
  );
}

/* ---------- SpecialistBlock ---------- */
export function SpecialistBlock({
  image,
  onStart,
}: {
  image: string;
  onStart: () => void;
}) {
  return (
    <Section tone="offwhite" id="especialista">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <img
          src={image}
          alt="Especialistas da Atual Câmbio analisando uma operação"
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl object-cover"
        />
        <div>
          <SectionHeading
            eyebrow="Especialista"
            title="Tecnologia para agilizar. Gente para orientar."
            description="Quando a operação exige contexto, documentação ou timing, você fala com quem entende de câmbio — não com um script."
          />
          <div className="mt-10 flex flex-wrap gap-3">
            <ActionButton size="lg" event="specialist_start" onClick={onStart}>
              Falar com um especialista
            </ActionButton>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ---------- ComplianceBlock ---------- */
export function ComplianceBlock({
  items,
}: {
  items: { title: string; text: string }[];
}) {
  return (
    <Section tone="navy" id="seguranca">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
        <SectionHeading
          tone="light-text"
          eyebrow="Segurança"
          title="Operar câmbio exige mais do que velocidade"
          description="Estrutura regulada, conformidade e privacidade em cada etapa da operação."
        />
        <div className="grid gap-px self-start overflow-hidden rounded-md bg-white/10">
          {items.map((item) => (
            <div key={item.title} className="bg-navy p-7">
              <h3 className="flex items-center gap-2 text-base font-semibold text-gold">
                <ShieldCheck className="size-4" aria-hidden />
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/72">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-14 flex flex-wrap items-center gap-10 border-t border-white/10 pt-10">
        <img
          src={bancoCentral.url}
          alt="Autorizada pelo Banco Central do Brasil"
          loading="lazy"
          className="block h-12 w-auto max-w-full shrink-0 object-contain opacity-90"
        />
        <img
          src={abracam.url}
          alt="Associada à ABRACAM"
          loading="lazy"
          className="block h-8 w-auto max-w-full shrink-0 object-contain opacity-90"
        />
      </div>
    </Section>
  );
}

/* ---------- CTASection ---------- */
export function CTASection({
  title,
  description,
  onPrimary,
  primaryLabel = "Começar uma operação",
  secondaryHref,
}: {
  title: string;
  description: string;
  onPrimary: () => void;
  primaryLabel?: string;
  secondaryHref: string;
}) {
  return (
    <Section tone="navy" id="cta">
      <div className="grid items-end gap-10 lg:grid-cols-[1.2fr_auto]">
        <SectionHeading tone="light-text" eyebrow="Atendimento" title={title} description={description} />
        <div className="flex flex-wrap gap-3">
          <ActionButton size="lg" event="open_account_click" onClick={onPrimary}>
            {primaryLabel}
          </ActionButton>
          <ActionLink
            size="lg"
            variant="secondaryDark"
            href={secondaryHref}
            event="login_click"
          >
            Acessar minha conta
          </ActionLink>
        </div>
      </div>
    </Section>
  );
}
