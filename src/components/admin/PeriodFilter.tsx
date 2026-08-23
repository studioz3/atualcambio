import { periodRange, type PeriodPreset } from "@/lib/admin-shared";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const presets: { id: PeriodPreset; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "7 dias" },
  { id: "30d", label: "30 dias" },
  { id: "mes", label: "Este mês" },
  { id: "tudo", label: "Todos" },
  { id: "custom", label: "Personalizado" },
];

export type PeriodState = { preset: PeriodPreset; from: string; to: string };

export const defaultPeriod: PeriodState = { preset: "30d", from: "", to: "" };

export function rangeOf(p: PeriodState) {
  return periodRange(p.preset, p.from, p.to);
}

export function PeriodFilter({
  value,
  onChange,
  tone = "light",
}: {
  value: PeriodState;
  onChange: (v: PeriodState) => void;
  tone?: "light" | "cockpit";
}) {
  const active =
    tone === "cockpit" ? "border-gold bg-gold text-gold-foreground" : "border-navy bg-navy text-white";
  const inactive =
    tone === "cockpit"
      ? "border-white/15 bg-white/5 text-white/60 hover:border-gold/40 hover:text-white"
      : "border-line bg-white text-muted-foreground hover:border-navy/40";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange({ ...value, preset: p.id })}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
            value.preset === p.id ? active : inactive,
          )}
        >
          {p.label}
        </button>
      ))}
      {value.preset === "custom" ? (
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="h-8 w-[150px]"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
          <span className={cn("text-xs", tone === "cockpit" ? "text-white/50" : "text-muted-foreground")}>até</span>
          <Input
            type="date"
            className="h-8 w-[150px]"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      ) : null}
    </div>
  );
}
