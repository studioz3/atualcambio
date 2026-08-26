import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeftRight } from "lucide-react";
import { getPtaxMoedas, getPtaxMoeda } from "@/lib/ptax.functions";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useLead } from "@/components/atual/LeadProvider";
import { ActionButton } from "@/components/atual/primitives";

const fallbackMoedas = [
  { simbolo: "USD", nome: "Dólar dos Estados Unidos" },
  { simbolo: "EUR", nome: "Euro" },
  { simbolo: "GBP", nome: "Libra Esterlina" },
];

function parseAmount(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".").replace(/[^\d.]/g, "");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

function formatDate(iso: string): string {
  const date = new Date(iso.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

const fieldClass =
  "min-h-13 w-full rounded-sm border border-line bg-white px-4 text-base text-graphite outline-none transition-colors focus:border-navy";

export function CurrencyConverter({ className }: { className?: string }) {
  const [amount, setAmount] = useState("1.000,00");
  const [currency, setCurrency] = useState("USD");
  const [direction, setDirection] = useState<"brl-to-foreign" | "foreign-to-brl">(
    "brl-to-foreign",
  );
  const [fee, setFee] = useState("0");

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
  const cotacao = cotacaoQuery.data ?? null;

  const result = useMemo(() => {
    if (!cotacao) return null;
    const value = parseAmount(amount);
    const feePct = Math.min(Math.max(parseAmount(fee), 0), 20);
    // Compra: instituição compra a moeda de você. Venda: você compra a moeda.
    const rate = direction === "brl-to-foreign" ? cotacao.venda : cotacao.compra;
    if (!rate) return null;
    const adjusted =
      direction === "brl-to-foreign" ? rate * (1 + feePct / 100) : rate * (1 - feePct / 100);
    const converted = direction === "brl-to-foreign" ? value / adjusted : value * adjusted;
    return { converted, rate, adjusted, feePct };
  }, [amount, cotacao, direction, fee]);

  const fromCurrency = direction === "brl-to-foreign" ? "BRL" : currency;
  const toCurrency = direction === "brl-to-foreign" ? currency : "BRL";

  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      <div className="grid gap-5 md:grid-cols-[1.1fr_auto_1.1fr] md:items-end">
        <div>
          <label className="mb-2 block text-sm font-medium text-graphite" htmlFor="conv-amount">
            Valor em {fromCurrency}
          </label>
          <input
            id="conv-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className={fieldClass}
          />
        </div>

        <button
          type="button"
          aria-label="Inverter moedas"
          onClick={() => {
            setDirection((prev) =>
              prev === "brl-to-foreign" ? "foreign-to-brl" : "brl-to-foreign",
            );
            track("currency_converter_swap", { moeda: currency });
          }}
          className="mx-auto flex size-12 items-center justify-center rounded-full border border-line text-navy transition-colors hover:border-navy hover:bg-navy hover:text-white md:mb-1"
        >
          <ArrowLeftRight className="size-4" aria-hidden />
        </button>

        <div>
          <label className="mb-2 block text-sm font-medium text-graphite" htmlFor="conv-currency">
            Moeda estrangeira
          </label>
          <select
            id="conv-currency"
            value={currency}
            onChange={(event) => {
              setCurrency(event.target.value);
              track("currency_converter_change", { moeda: event.target.value });
            }}
            className={fieldClass}
          >
            {moedas.map((moeda) => (
              <option key={moeda.simbolo} value={moeda.simbolo}>
                {moeda.simbolo} — {moeda.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 max-w-xs">
        <label className="mb-2 block text-sm font-medium text-graphite" htmlFor="conv-fee">
          Taxa adicional da instituição (%)
        </label>
        <input
          id="conv-fee"
          inputMode="decimal"
          value={fee}
          onChange={(event) => setFee(event.target.value)}
          className={fieldClass}
        />
        <p className="mt-2 text-xs text-muted-foreground">
          Opcional. Simule o efeito de um spread sobre a taxa de referência.
        </p>
      </div>

      <div className="mt-8 rounded-lg bg-offwhite p-6">
        {cotacaoQuery.isPending ? (
          <p className="text-sm text-muted-foreground">Consultando o boletim do Banco Central…</p>
        ) : !cotacao || !result ? (
          <p className="text-sm text-muted-foreground">
            Não foi possível obter o boletim PTAX para {currency} agora. Tente novamente em
            instantes.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              {formatMoney(parseAmount(amount), fromCurrency)} equivale a
            </p>
            <p className="display-h3 mt-2 text-navy">
              {formatMoney(result.converted, toCurrency)}
            </p>
            <dl className="mt-5 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              <div>
                <dt className="inline">Taxa PTAX utilizada: </dt>
                <dd className="inline">
                  1 {currency} ={" "}
                  {new Intl.NumberFormat("pt-BR", {
                    minimumFractionDigits: 4,
                    maximumFractionDigits: 4,
                  }).format(result.rate)}{" "}
                  BRL ({direction === "brl-to-foreign" ? "venda" : "compra"})
                </dd>
              </div>
              {result.feePct > 0 ? (
                <div>
                  <dt className="inline">Taxa com adicional: </dt>
                  <dd className="inline">
                    {new Intl.NumberFormat("pt-BR", {
                      minimumFractionDigits: 4,
                      maximumFractionDigits: 4,
                    }).format(result.adjusted)}{" "}
                    BRL
                  </dd>
                </div>
              ) : null}
              <div className="sm:col-span-2">
                <dt className="inline">Boletim de fechamento: </dt>
                <dd className="inline">{formatDate(cotacao.dataHoraCotacao)}</dd>
              </div>
            </dl>
          </>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Valores meramente informativos, baseados no boletim de fechamento PTAX do Banco Central
          do Brasil. Não representam a cotação final da sua operação, que considera finalidade,
          impostos e tarifas aplicáveis.
        </p>
      </div>
    </div>
  );
}
