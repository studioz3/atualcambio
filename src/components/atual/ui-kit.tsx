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
  mobileImage,
  imageAlt,
  seals = false,
  scrim = "navy",
  zoomImage = false,
  rawImage = false,
  softScrim = false,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: ReactNode;
  primary?: ReactNode;
  secondary?: ReactNode;
  image?: string;
  mobileImage?: string;
  imageAlt?: string;
  seals?: boolean;
  scrim?: "ink" | "navy";
  zoomImage?: boolean;
  /** Exibe a arte sem tratamento de cor (sem "lente") nem zoom. */
  rawImage?: boolean;
  /** Scrim mais leve, para artes que já têm área escura para o texto. */
  softScrim?: boolean;
  children?: ReactNode;
}) {
  const navyScrim = scrim === "navy";

  return (
    <section
      className={cn(
        "hero-shell relative overflow-hidden",
        rawImage && "hero-shell-raw",
        image && !navyScrim ? "surface-ink" : "surface-navy",
      )}
    >
      {image ? (
        <div className="absolute inset-0 hidden lg:block">
          <img
            src={image}
            alt={imageAlt ?? ""}
            width={1920}
            height={1080}
            className={cn(
              rawImage
                ? "size-full object-cover object-right"
                : "ml-auto h-full w-auto max-w-none object-contain object-right",
              !rawImage && navyScrim && "contrast-[1.1] saturate-[1.08] brightness-[1.03]",
              !rawImage && navyScrim && zoomImage &&
                "origin-right -translate-x-[1.5%] scale-[1.06]",
            )}
          />

          {/* scrim para legibilidade */}
          {rawImage ? null : softScrim ? (
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/35 via-45% to-transparent" />
          ) : navyScrim ? (
            <>
              {/* pretos profundos + área de texto limpa */}
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/72 via-38% to-transparent" />
              {/* navy como estrutura, não como filtro uniforme */}
              <div className="absolute inset-0 bg-gradient-to-r from-navy/55 via-navy/16 to-navy/0" />

              {/* vinheta para profundidade nas bordas */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
          )}
        </div>
      ) : null}

      {mobileImage ? (
        <div className="absolute inset-0 lg:hidden">
          <img
            src={mobileImage}
            alt={imageAlt ?? ""}
            width={1080}
            height={1350}
            className={cn(
              "size-full object-cover object-center",
              !rawImage && navyScrim && "contrast-[1.1] saturate-[1.06]",
            )}
          />
          {rawImage ? null : softScrim ? (
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/20 via-60% to-black/40" />
          ) : navyScrim ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/76 to-black/92" />
              <div className="absolute inset-0 bg-gradient-to-b from-navy/38 via-navy/12 to-navy/45" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-black/92 via-black/70 to-black/92" />
          )}
        </div>
      ) : null}




      <div className="hero-container">
        <div className="relative grid flex-1 content-start gap-8 pt-[60px] pb-16 md:gap-12 md:py-28 lg:h-full lg:min-h-[680px] lg:grid-cols-[1.05fr_0.95fr] lg:content-center lg:items-center lg:py-24 lg:pt-24">

          <div className="w-full max-w-none lg:max-w-2xl">
            {eyebrow ? (
              <p className="font-display text-sm font-bold tracking-[0.01em] text-gold sm:text-base">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="hero-title mt-2 text-white md:mt-6 lg:whitespace-nowrap">{title}</h1>
            <p className="hero-copy mt-5 text-white/85 md:mt-8">{description}</p>

            {primary || secondary ? (
              <div className="hero-actions mt-9 md:mt-12">
                {primary}
                {secondary}
              </div>
            ) : null}
            {seals ? (
              <AccreditationSeals size="sm" className="mt-11 border-t border-white/12 pt-9 md:mt-14" />
            ) : null}
          </div>

          {image && !mobileImage ? (
            <div className="relative lg:hidden">
              <img
                src={image}
                alt={imageAlt ?? ""}
                width={1920}
                height={1440}
                className="mx-auto block max-h-[46svh] w-full object-contain"
              />
            </div>
          ) : null}


          {children}
        </div>
      </div>

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
    <div className="relative bg-black">
      <Container>
        <ul className="grid gap-12 py-16 md:grid-cols-3 md:gap-10 md:py-20">
          {items.map((item) => {
            const Icon = pillarIcons[item.id];
            return (
              <li key={item.id} className="flex flex-col items-start text-left md:pr-10">
                <Icon className="size-9 text-gold" aria-hidden />
                <h3 className="mt-6 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-white/75">{item.text}</p>
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
      <div className="grid items-start gap-10">
        <SectionHeading tone="light-text" eyebrow="Atendimento" title={title} description={description} className="max-w-3xl" />
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
