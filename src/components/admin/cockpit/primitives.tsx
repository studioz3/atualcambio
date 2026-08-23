import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight, ExternalLink, Minus, PlugZap } from "lucide-react";
import { formatNumber, variation } from "@/lib/cockpit-shared";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

/** Contador animado — respeita prefers-reduced-motion. */
export function CountUp({
  value,
  format,
}: {
  value: number;
  format?: ((n: number) => string) | undefined;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const duration = 700;
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, reduced]);

  return <>{(format ?? formatNumber)(display)}</>;
}

export function CockpitCard({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title?: ReactNode | undefined;
  subtitle?: ReactNode | undefined;
  action?: ReactNode | undefined;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-sm transition duration-300 hover:border-gold/30",
        className,
      )}
    >
      {title ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-white">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-white/50">{subtitle}</p> : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  );
}

export function Delta({ current, previous }: { current: number; previous: number | null | undefined }) {
  const v = variation(current, previous);
  if (v === null) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
        <Minus className="size-3" aria-hidden /> sem base de comparação
      </span>
    );
  }
  const up = v >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[11px] font-semibold",
        up ? "text-emerald-400" : "text-rose-400",
      )}
    >
      {up ? <ArrowUpRight className="size-3" aria-hidden /> : <ArrowDownRight className="size-3" aria-hidden />}
      {`${up ? "+" : ""}${(v * 100).toFixed(1)}% vs. período anterior`}
    </span>
  );
}

export function KpiCard({
  label,
  value,
  previous,
  format,
  hint,
  loading,
  unavailable,
}: {
  label: string;
  value: number | null;
  previous?: number | null | undefined;
  format?: ((n: number) => string) | undefined;
  hint?: string | undefined;
  loading?: boolean | undefined;
  unavailable?: string | undefined;
}) {
  return (
    <div className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-gold/40">
      <p className="text-[10px] font-semibold tracking-[0.18em] text-white/45 uppercase">{label}</p>
      {loading ? (
        <div className="mt-4 h-8 w-24 animate-pulse rounded bg-white/10" />
      ) : unavailable ? (
        <p className="mt-3 text-sm text-white/45">{unavailable}</p>
      ) : (
        <p className="mt-3 text-3xl font-bold text-white tabular-nums">
          <CountUp value={value ?? 0} format={format} />
        </p>
      )}
      <div className="mt-2">
        {!loading && !unavailable && value != null ? (
          <Delta current={value} previous={previous ?? null} />
        ) : null}
        {hint ? <p className="mt-1 text-[11px] text-white/40">{hint}</p> : null}
      </div>
    </div>
  );
}

export function BarList({
  data,
  emptyLabel = "Sem dados no período.",
  formatValue,
}: {
  data: { label: string; value: number; hint?: string }[];
  emptyLabel?: string | undefined;
  formatValue?: ((n: number) => string) | undefined;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (data.length === 0) return <p className="text-sm text-white/45">{emptyLabel}</p>;
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate text-white/70">{d.label}</span>
            <span className="font-semibold text-white tabular-nums">
              {(formatValue ?? formatNumber)(d.value)}
            </span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gold transition-[width] duration-700 ease-out"
              style={{ width: `${(d.value / max) * 100}%` }}
            />
          </div>
          {d.hint ? <p className="mt-1 text-[11px] text-white/35">{d.hint}</p> : null}
        </li>
      ))}
    </ul>
  );
}

export function EmptyIntegration({
  service,
  reason,
  steps,
  link,
}: {
  service: string;
  reason?: string | undefined;
  steps?: string[] | undefined;
  link?: { href: string; label: string } | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
      <PlugZap className="mx-auto size-5 text-gold" aria-hidden />
      <p className="mt-3 text-sm font-semibold text-white">{service} ainda não conectado</p>
      <p className="mx-auto mt-1 max-w-md text-xs text-white/50">
        {reason ?? "Nenhum dado é exibido até a conexão ser concluída — o cockpit nunca mostra números estimados."}
      </p>
      {steps?.length ? (
        <ol className="mx-auto mt-4 max-w-md space-y-1 text-left text-[11px] text-white/45">
          {steps.map((s, i) => (
            <li key={s}>
              {i + 1}. {s}
            </li>
          ))}
        </ol>
      ) : null}
      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gold hover:underline"
        >
          {link.label} <ExternalLink className="size-3" aria-hidden />
        </a>
      ) : null}
    </div>
  );
}

export function LiveDot({ active }: { active: boolean }) {
  return (
    <span className="relative inline-flex size-2.5">
      {active ? (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/70" />
      ) : null}
      <span
        className={cn(
          "relative inline-flex size-2.5 rounded-full",
          active ? "bg-emerald-400" : "bg-white/25",
        )}
      />
    </span>
  );
}

export function CockpitSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 animate-pulse rounded bg-white/10" />
      ))}
    </div>
  );
}
