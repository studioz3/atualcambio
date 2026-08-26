import { ArrowRight, AlertTriangle, Clock } from "lucide-react";
import {
  formatQuoteTime,
  formatQuoteValue,
  type QuoteAsset,
  type QuoteResult,
} from "@/lib/quotes";
import { cn } from "@/lib/utils";

/**
 * Card de cotação — a mesma estrutura atende hoje (sem dado) e amanhã (com API).
 * Estados: loading | success | stale | error | unavailable.
 * Nenhum valor de exemplo é renderizado.
 */
export function QuoteCard({
  asset,
  result,
  onSelect,
  ctaLabel = "Consultar no app",
  description,
}: {
  asset: QuoteAsset;
  result: QuoteResult;
  onSelect: () => void;
  ctaLabel?: string;
  description?: string;
}) {
  const { status, data } = result;
  const hasData = (status === "success" || status === "stale") && data;

  return (
    <article className="flex h-full flex-col rounded-lg border border-line bg-white p-6 transition-colors hover:border-gold/50 md:p-7">
      <div className="flex items-baseline justify-between gap-3">
        <p className="display-h4 text-navy">{asset.code}</p>
        <p className="text-xs text-muted-foreground">{asset.name}</p>
      </div>

      <div className="mt-6 flex-1">
        {status === "loading" ? (
          <div className="space-y-3" aria-live="polite" aria-busy="true">
            <div className="h-4 w-2/3 animate-pulse rounded-sm bg-line" />
            <div className="h-4 w-1/2 animate-pulse rounded-sm bg-line" />
            <span className="sr-only">Carregando cotação</span>
          </div>
        ) : null}

        {hasData ? (
          <>
            {typeof data.bid === "number" && typeof data.ask === "number" ? (
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-xs text-muted-foreground">Compra</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy">
                    {formatQuoteValue(data.bid, data.referenceCurrency)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Venda</dt>
                  <dd className="mt-1 text-lg font-semibold text-navy">
                    {formatQuoteValue(data.ask, data.referenceCurrency)}
                  </dd>
                </div>
              </dl>
            ) : typeof data.price === "number" ? (
              <dl>
                <dt className="text-xs text-muted-foreground">
                  Referência{data.network ? ` · rede ${data.network}` : ""}
                </dt>
                <dd className="mt-1 text-lg font-semibold text-navy">
                  {formatQuoteValue(data.price, data.referenceCurrency)}
                </dd>
              </dl>
            ) : null}
            <p
              className={cn(
                "mt-5 inline-flex items-center gap-2 text-xs",
                status === "stale" ? "text-gold-soft" : "text-muted-foreground",
              )}
            >
              <Clock className="size-3.5" aria-hidden />
              {status === "stale"
                ? `Última atualização às ${formatQuoteTime(data.timestamp)}. Pode estar desatualizada.`
                : `Atualizado às ${formatQuoteTime(data.timestamp)}`}
            </p>
            {data.validUntil ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Cotação válida até {formatQuoteTime(data.validUntil)}
              </p>
            ) : null}
          </>
        ) : null}

        {status === "error" ? (
          <p className="inline-flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
            Cotação temporariamente indisponível.
          </p>
        ) : null}

        {status === "unavailable" ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {description ??
              (asset.category === "stablecoin"
                ? "Consulte compra e venda pela Conta Atual."
                : "Consulte a cotação atual pelo app.")}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        data-event={asset.event}
        onClick={onSelect}
        className="mt-6 inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-navy transition-colors hover:text-gold-soft"
      >
        {hasData ? "Começar operação" : status === "error" ? "Consultar pelo app Atual" : ctaLabel}
        <ArrowRight className="size-4 text-gold" aria-hidden />
      </button>
    </article>
  );
}
