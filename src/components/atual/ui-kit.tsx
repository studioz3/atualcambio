import bancoCentral from "@/assets/banco-central.png.asset.json";
import abracam from "@/assets/abracam.png.asset.json";
import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  MonitorSmartphone,
  Headset,
  Check,
} from "lucide-react";
import { Container, Eyebrow, ActionButton, ActionLink, Section, SectionHeading } from "./primitives";
import { cn } from "@/lib/utils";

/* ---------- AccreditationSeals ---------- */
export function AccreditationSeals({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md";
}) {
  const bc = size === "sm" ? "h-10" : "h-14";
  const ab = size === "sm" ? "h-7" : "h-10";
  return (
    <div className={cn("flex flex-wrap items-center gap-x-10 gap-y-6", className)}>
      <img
        src={bancoCentral.url}
        alt="Autorizada pelo Banco Central do Brasil"
        loading="lazy"
        className={cn("block w-auto max-w-full shrink-0 object-contain opacity-95", bc)}
      />
      <img
        src={abracam.url}
        alt="Associada à ABRACAM"
        loading="lazy"
        className={cn("block w-auto max-w-full shrink-0 object-contain opacity-95", ab)}
      />
    </div>
  );
}

/* ---------- Hero ---------- */
export function Hero({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  image,
  imageAlt,
  seals = false,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  primary?: ReactNode;
  secondary?: ReactNode;
  image?: string;
  imageAlt?: string;
  seals?: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="surface-navy relative overflow-hidden">
      {image ? (
        <div className="absolute inset-y-0 right-0 hidden w-[58%] lg:block">
          <img
            src={image}
            alt={imageAlt ?? ""}
            width={1920}
            height={720}
            className="size-full object-cover object-right"
          />
          {/* lente azul institucional */}
          <div className="absolute inset-0 bg-navy/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/55 to-transparent" />
        </div>
      ) : null}

      <Container>
        <div className="relative grid gap-12 py-20 md:py-28 lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-36">
          <div className="max-w-2xl">
            {eyebrow ? (
              <p className="font-display text-sm font-bold tracking-[0.01em] text-gold sm:text-base">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="display-hero mt-6 text-white lg:whitespace-nowrap">{title}</h1>
            <p className="body-lg mt-8 max-w-xl text-white/85">{description}</p>
            {primary || secondary ? (
              <div className="mt-12 flex flex-wrap gap-4">
                {primary}
                {secondary}
              </div>
            ) : null}
            {seals ? (
              <AccreditationSeals size="sm" className="mt-14 border-t border-white/12 pt-9" />
            ) : null}
          </div>
          {image ? (
            <div className="relative overflow-hidden rounded-xl lg:hidden">
              <img
                src={image}
                alt={imageAlt ?? ""}
                width={1600}
                height={1200}
                className="aspect-[4/3] w-full object-cover saturate-[0.85]"
              />
              <div className="absolute inset-0 bg-navy/50 mix-blend-multiply" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
            </div>
          ) : null}

          {children}
        </div>
      </Container>
    </section>
  );
}

/* ---------- TrustPillars ---------- */
const pillarIcons = {
  seguranca: ShieldCheck,
  tecnologia: MonitorSmartphone,
  atendimento: Headset,
} as const;

export type TrustPillar = {
  id: keyof typeof pillarIcons;
  title: string;
  text: string;
};

export function TrustPillars({ items }: { items: readonly TrustPillar[] }) {
  return (
    <div className="surface-navy relative border-t border-white/12">
      <Container>
        <ul className="grid gap-px overflow-hidden md:grid-cols-3">
          {items.map((item) => {
            const Icon = pillarIcons[item.id];
            return (
              <li key={item.id} className="flex gap-5 py-10 md:pr-10">
                <span
                  className="flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/40 text-gold"
                  aria-hidden
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="display-h4 text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{item.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Container>
    </div>
  );
}

/* ---------- PhotoIntentCard ---------- */
export function PhotoIntentCard({
  title,
  description,
  image,
  imageAlt,
  action = "Começar",
  event,
  onSelect,
}: {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  action?: string;
  event: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      data-event={event}
      data-intent={title}
      onClick={onSelect}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white text-left transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_24px_60px_-30px_rgba(1,24,58,0.45)]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <img
          src={image}
          alt={imageAlt}
          width={1200}
          height={900}
          loading="lazy"
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/45 to-transparent" />
      </div>
      <div className="flex flex-1 flex-col p-7">
        <h3 className="display-h4 text-navy">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy transition-colors group-hover:text-gold-soft">
          {action}
          <ArrowRight
            className="size-4 text-gold transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </button>
  );
}

/* ---------- PathCard (digital x consultivo) ---------- */
export function PathCard({
  eyebrow,
  title,
  description,
  items,
  action,
  tone = "light",
}: {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  action: ReactNode;
  tone?: "light" | "navy";
}) {
  const dark = tone === "navy";
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-lg border p-9",
        dark ? "border-white/12 bg-navy" : "border-line bg-white",
      )}
    >
      <p className={cn("eyebrow", dark ? "text-gold" : "text-gold-soft")}>{eyebrow}</p>
      <h3 className={cn("display-h3 mt-4", dark ? "text-white" : "text-navy")}>{title}</h3>
      <p
        className={cn(
          "mt-4 text-base leading-relaxed",
          dark ? "text-white/72" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
      <ul className="mt-7 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className={cn(
              "flex gap-3 text-sm leading-relaxed",
              dark ? "text-white/80" : "text-graphite",
            )}
          >
            <Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-9 flex flex-wrap gap-3">{action}</div>
    </article>
  );
}

/* ---------- NewsCard ---------- */
export function NewsCard({
  category,
  title,
  excerpt,
  date,
  image,
  imageAlt,
}: {
  category: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string | undefined;
  imageAlt?: string | undefined;
}) {
  return (
    <article className="group flex flex-col">
      <div className="aspect-[4/3] overflow-hidden rounded-xl bg-line">
        {image ? (
          <img
            src={image}
            alt={imageAlt ?? title}
            width={1200}
            height={900}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : null}
      </div>
      <div className="mt-6 flex flex-1 flex-col">
        <Eyebrow>{category}</Eyebrow>
        <h3 className="display-h4 mt-3 text-navy">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{excerpt}</p>
        <div className="mt-5 flex items-center gap-4">
          <Link
            to="/conteudo"
            data-event="article_click"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Ler <ArrowUpRight className="size-4 text-gold" aria-hidden />
          </Link>
          <span className="text-xs text-muted-foreground">{date}</span>
        </div>
      </div>
    </article>
  );
}

/* ---------- AppMockup ----------
 * Preparado para screenshots reais do app Atual.
 * Basta passar `screenshot` (import de imagem) para substituir o conteúdo.
 */
export function AppMockup({
  className,
  screenshot,
  screenshotAlt = "Tela do aplicativo Atual",
  features = ["Saldo", "Remessas", "USDT e USDC", "Extrato", "Acompanhamento"],
}: {
  className?: string;
  screenshot?: string;
  screenshotAlt?: string;
  features?: string[];
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-[290px] rounded-[36px] border border-white/15 bg-navy-soft p-3 shadow-[0_30px_80px_rgba(1,24,58,0.45)]",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[28px] bg-navy">
        {screenshot ? (
          <img
            src={screenshot}
            alt={screenshotAlt}
            loading="lazy"
            className="block aspect-[9/19] w-full object-cover"
          />
        ) : (
          <div className="p-5">
            <div className="mx-auto h-1.5 w-16 rounded-full bg-white/20" aria-hidden />
            <p className="eyebrow mt-6 text-gold">Conta Atual</p>
            <ul className="mt-5 space-y-3">
              {features.map((item) => (
                <li
                  key={item}
                  className="flex items-center justify-between rounded-md border border-white/10 px-4 py-3 text-xs text-white/80"
                >
                  {item}
                  <ArrowRight className="size-3.5 text-gold" aria-hidden />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- SpecialistBlock ---------- */
export function SpecialistBlock({
  image,
  imageAlt = "Especialista da Atual Câmbio pronto para atender",
  onStart,
}: {
  image: string;
  imageAlt?: string;
  onStart: () => void;
}) {
  return (
    <Section tone="offwhite" id="especialista">
      <div className="grid items-center gap-14 lg:grid-cols-[1fr_1fr]">
        <img
          src={image}
          alt={imageAlt}
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
                Tecnologia para agilizar.
                <br />
                Gente para orientar.
              </>
            }
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
export function ComplianceBlock({ items }: { items: { title: string; text: string }[] }) {
  return (
    <Section tone="navy" id="seguranca">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <SectionHeading
          tone="light-text"
          eyebrow="Segurança"
          title="Operar câmbio exige mais do que velocidade"
          description="Estrutura regulada, conformidade e privacidade em cada etapa da operação."
        />
        <div className="grid gap-px self-start overflow-hidden rounded-md bg-white/10">
          {items.map((item) => (
            <div key={item.title} className="bg-navy p-8">
              <h3 className="flex items-center gap-2 display-h4 text-gold">
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
      <div className="grid items-end gap-12 lg:grid-cols-[1.2fr_auto]">
        <SectionHeading tone="light-text" eyebrow="Atendimento" title={title} description={description} />
        <div className="flex flex-wrap gap-4">
          <ActionButton size="lg" event="open_account_click" onClick={onPrimary}>
            {primaryLabel}
          </ActionButton>
          <ActionLink size="lg" variant="secondaryDark" href={secondaryHref} event="login_click">
            Acessar minha conta
          </ActionLink>
        </div>
      </div>
    </Section>
  );
}
