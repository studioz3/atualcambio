import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQuery as _unused } from "@tanstack/react-query";
import { getPtaxMoedas, getPtaxMoeda } from "@/lib/ptax.functions";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const fallbackMoedas = [
  { simbolo: "USD", nome: "Dólar dos Estados Unidos" },
  { simbolo: "EUR", nome: "Euro" },
  { simbolo: "GBP", nome: "Libra Esterlina" },
];

const nf = (digits: number) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Card compacto de simulação de câmbio, pensado para o Hero. */
export function HeroSimulator({
  className,
  onConvert,
}: {
  className?: string;
  onConvert?: () => void;
}) {
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("2000");

  const moedasQuery = useQuery({
    queryKey: ["ptax-moedas"],
    queryFn: () => getPtaxMoedas(),
    staleTime: 1000 * 60 * 60 * 12,
  });

  const cotacaoQuery = useQuery({
    queryKey: ["ptax-moeda", currency],
    queryFn: () => getPtaxMoeda({ data: { simbolo: currency } }),
    staleTime: 1000 * 60 * 30,
  });

  const moedas = moedasQuery.data?.length ? moedasQuery.data : fallbackMoedas;
  const rate = cotacaoQuery.data?.venda ?? null;

  const total = useMemo(() => {
    const qty = Number(amount.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, ""));
    if (!rate || !Number.isFinite(qty)) return null;
    return qty * rate;
  }, [amount, rate]);

  const fieldClass =
    "min-h-12 w-full rounded-md border border-line bg-white px-4 text-base text-graphite outline-none transition-colors focus:border-navy";

  return (
    <div
      className={cn(
        "w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-2xl",
        className,
      )}
    >
      <div className="bg-gold px-6 py-6 text-center">
        <img
          src="/brand/simbolo.png"
          alt=""
          aria-hidden
          className="mx-auto h-10 w-auto shrink-0 object-contain"
        />
        <p className="mt-3 text-xl font-bold text-gold-foreground">Simulador de Câmbio</p>
      </div>

      <div className="space-y-4 px-6 py-6">
        <div>
          <label className="mb-2 block text-sm text-graphite" htmlFor="hero-sim-moeda">
            Selecione a Moeda:
          </label>
          <select
            id="hero-sim-moeda"
            value={currency}
            onChange={(event) => {
              setCurrency(event.target.value);
              track("currency_converter_change", { moeda: event.target.value, origem: "hero" });
            }}
            className={fieldClass}
          >
            {moedas.map((moeda) => (
              <option key={moeda.simbolo} value={moeda.simbolo}>
                {moeda.nome} ({moeda.simbolo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm text-graphite" htmlFor="hero-sim-valor">
            Quantidade:
          </label>
          <input
            id="hero-sim-valor"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={fieldClass}
          />
        </div>

        <div>
          <p className="mb-2 text-sm text-graphite">Câmbio de referência (PTAX):</p>
          <div className="flex min-h-12 items-center rounded-md bg-offwhite px-4 text-base text-graphite">
            {rate ? nf(4).format(rate) : cotacaoQuery.isPending ? "Consultando…" : "Indisponível"}
          </div>
        </div>

        <div className="flex items-baseline justify-between gap-4 pt-1">
          <span className="text-sm text-graphite">Total em Reais:</span>
          <span className="text-xl font-bold text-navy">
            {total !== null ? `R$ ${nf(2).format(total)}` : "—"}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            track("currency_converter_open", { origem: "hero", moeda: currency });
            onConvert?.();
          }}
          className="mt-2 min-h-13 w-full rounded-full bg-gold px-6 text-base font-semibold text-gold-foreground transition-colors hover:bg-gold-soft"
        >
          Converter
        </button>

        <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
          Valores informativos com base no boletim de fechamento PTAX do Banco Central.
        </p>
      </div>
    </div>
  );
}
