import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { getPtaxMoedas, getPtaxMoeda } from "@/lib/ptax.functions";
import { getOnzQuotes } from "@/lib/onz-quotes.functions";
import { createRateAlert } from "@/lib/rate-alerts.functions";
import { getUtm } from "@/lib/whatsapp";
import { track } from "@/lib/analytics";

const fallbackMoedas = [
  { simbolo: "USD", nome: "Dólar dos Estados Unidos" },
  { simbolo: "EUR", nome: "Euro" },
  { simbolo: "GBP", nome: "Libra Esterlina" },
];

const stableNames: Record<string, string> = { USDT: "Tether", USDC: "USD Coin" };

const nf4 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 4, maximumFractionDigits: 4 });

const fieldClass =
  "min-h-12 w-full rounded-[10px] border border-line bg-white px-4 text-base text-graphite outline-none transition-colors focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20";

/** Modal de acompanhamento de taxa de câmbio (alerta por e-mail). */
export function RateAlertDialog({
  open,
  onOpenChange,
  initialCurrency = "USD",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCurrency?: string | undefined;
}) {
  const [currency, setCurrency] = useState(initialCurrency);
  const [daily, setDaily] = useState(true);
  const [valueAlert, setValueAlert] = useState(true);
  const [target, setTarget] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setCurrency(initialCurrency);
  }, [open, initialCurrency]);

  const isStable = currency === "USDT" || currency === "USDC";

  const moedasQuery = useQuery({
    queryKey: ["ptax-moedas"],
    queryFn: () => getPtaxMoedas(),
    staleTime: 1000 * 60 * 60 * 12,
    enabled: open,
  });

  const cotacaoQuery = useQuery({
    queryKey: ["ptax-moeda", currency],
    queryFn: () => getPtaxMoeda({ data: { simbolo: currency } }),
    staleTime: 1000 * 60 * 30,
    enabled: open && !isStable,
  });

  const onzQuery = useQuery({
    queryKey: ["onz-quotes"],
    queryFn: () => getOnzQuotes(),
    staleTime: 1000 * 60 * 2,
    enabled: open,
  });

  const stableOptions = useMemo(() => {
    const assets = new Set(
      (onzQuery.data?.quotes ?? [])
        .map((q) => q.asset)
        .filter((asset) => asset === "USDT" || asset === "USDC"),
    );
    return [...assets].map((asset) => ({ simbolo: asset, nome: stableNames[asset] ?? asset }));
  }, [onzQuery.data]);

  const moedas = moedasQuery.data?.length ? moedasQuery.data : fallbackMoedas;

  const rate = useMemo(() => {
    if (isStable) {
      const match = (onzQuery.data?.quotes ?? []).filter((q) => q.asset === currency);
      return match.length ? Math.min(...match.map((q) => q.priceBrl)) : null;
    }
    return cotacaoQuery.data?.venda ?? null;
  }, [currency, isStable, onzQuery.data, cotacaoQuery.data]);

  const loadingRate = isStable ? onzQuery.isPending : cotacaoQuery.isPending;

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
  const canSubmit = emailOk && (daily || valueAlert) && !loading;

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      const parsedTarget = Number(target.replace(/\./g, "").replace(",", "."));
      const res = await createRateAlert({
        data: {
          email: email.trim(),
          base: "BRL",
          moeda: currency,
          atualizacoes_diarias: daily,
          alerta_valor: valueAlert,
          ...(rate ? { taxa_referencia: rate } : {}),
          ...(valueAlert && Number.isFinite(parsedTarget) && parsedTarget > 0
            ? { taxa_alvo: parsedTarget }
            : {}),
          ...(typeof window !== "undefined" ? { source_url: window.location.href } : {}),
          ...getUtm(),
        },
      });
      if (!res.ok) throw new Error("falha");
      track("rate_alert_submit", { moeda: currency, diario: daily, alvo: valueAlert });
      toast.success("Alerta criado. Vamos avisar você por e-mail.");
      onOpenChange(false);
      setEmail("");
      setTarget("");
    } catch {
      toast.error("Não foi possível criar o alerta agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] w-[min(100vw-2rem,520px)] overflow-y-auto rounded-2xl border-0 bg-white p-0 sm:max-w-[520px] [&>button]:hidden">
        <div className="relative px-6 pt-8 pb-6 sm:px-8">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-graphite/60 transition-colors hover:bg-offwhite hover:text-navy"
          >
            <X className="size-5" aria-hidden />
          </button>

          <DialogTitle className="font-display text-center text-2xl font-bold tracking-[-0.01em] text-navy">
            Acompanhe o câmbio comercial
          </DialogTitle>
          <DialogDescription className="mt-2 text-center text-sm text-graphite">
            Receba a variação da moeda que você acompanha direto no seu e-mail.
          </DialogDescription>

          <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
            <div>
              <label className="mb-2 block text-sm text-graphite" htmlFor="alert-base">
                De
              </label>
              <input
                id="alert-base"
                value="BRL — Real Brasileiro"
                readOnly
                className={`${fieldClass} bg-offwhite`}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-graphite" htmlFor="alert-moeda">
                Para
              </label>
              <select
                id="alert-moeda"
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                className={fieldClass}
              >
                {stableOptions.length > 0 ? (
                  <optgroup label="Stablecoins">
                    {stableOptions.map((moeda) => (
                      <option key={moeda.simbolo} value={moeda.simbolo}>
                        {moeda.nome} ({moeda.simbolo})
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="Moedas">
                  {moedas.map((moeda) => (
                    <option key={moeda.simbolo} value={moeda.simbolo}>
                      {moeda.nome} ({moeda.simbolo})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="rounded-[12px] bg-offwhite px-5 py-4">
              <p className="text-lg font-bold text-navy">
                {rate
                  ? `1 ${currency} = ${nf4.format(rate)} BRL`
                  : loadingRate
                    ? "Consultando…"
                    : "Cotação indisponível"}
              </p>
              <p className="mt-1 text-xs text-graphite">
                {isStable
                  ? "Preço de referência de stablecoins."
                  : "Boletim de fechamento PTAX do Banco Central."}
              </p>
            </div>

            <div className="flex items-start justify-between gap-4 border-t border-line pt-4">
              <div>
                <p className="text-sm font-semibold text-navy">Atualizações diárias</p>
                <p className="mt-1 text-xs text-graphite">
                  Receba a taxa de BRL – {currency} todos os dias.
                </p>
              </div>
              <Switch checked={daily} onCheckedChange={setDaily} aria-label="Atualizações diárias" />
            </div>

            <div className="flex items-start justify-between gap-4 border-t border-line pt-4">
              <div>
                <p className="text-sm font-semibold text-navy">Atualizações de valor</p>
                <p className="mt-1 text-xs text-graphite">
                  Avisamos quando BRL – {currency} atingir a taxa desejada.
                </p>
              </div>
              <Switch
                checked={valueAlert}
                onCheckedChange={setValueAlert}
                aria-label="Atualizações de valor"
              />
            </div>

            {valueAlert ? (
              <div>
                <label className="mb-2 block text-sm text-graphite" htmlFor="alert-alvo">
                  Taxa desejada (BRL)
                </label>
                <input
                  id="alert-alvo"
                  inputMode="decimal"
                  value={target}
                  onChange={(event) => setTarget(event.target.value)}
                  placeholder={rate ? nf4.format(rate) : "0,0000"}
                  className={fieldClass}
                />
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm text-graphite" htmlFor="alert-email">
                Seu endereço de e-mail
              </label>
              <input
                id="alert-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nome@email.com"
                className={fieldClass}
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="min-h-13 w-full rounded-full bg-gold px-6 text-base font-semibold text-gold-foreground transition-colors hover:bg-gold-soft disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Criando alerta…" : "Criar alerta de câmbio"}
            </button>

            <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
              Ao criar o alerta, você concorda em receber comunicações da Atual Câmbio sobre a taxa
              selecionada. Valores informativos.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
