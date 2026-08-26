import { ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { quotePairs } from "@/content/site";
import { getPtaxCotacoes } from "@/lib/ptax.functions";
import { getOnzQuotes } from "@/lib/onz-quotes.functions";
import { formatQuoteTime, formatQuoteValue } from "@/lib/quotes";
import { useLead } from "./LeadProvider";

/**
 * Cotações — moedas com boletim PTAX (Banco Central) e stablecoins com
 * preço de referência da ONZ. Nenhum valor é inventado: sem dado, o card
 * mantém a mensagem de consulta pelo app.
 */
export function QuoteBoard({ limit }: { limit?: number }) {
  const { openLead } = useLead();
  const pairs = limit ? quotePairs.slice(0, limit) : quotePairs;

  const ptaxQuery = useQuery({
    queryKey: ["ptax-cotacoes"],
    queryFn: () => getPtaxCotacoes(),
    staleTime: 1000 * 60 * 30,
  });

  const onzQuery = useQuery({
    queryKey: ["onz-quotes"],
    queryFn: () => getOnzQuotes(),
    staleTime: 1000 * 60 * 2,
  });

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map((pair) => {
        const ptax = ptaxQuery.data?.find((item) => item.moeda === pair.code) ?? null;
        const stable = onzQuery.data?.quotes.find((item) => item.asset === pair.code) ?? null;
        const loading = ptaxQuery.isPending && onzQuery.isPending;

        return (
          <div
            key={pair.code}
            className="flex flex-col rounded-lg border border-line bg-white p-7 transition-colors hover:border-gold/50"
          >
            <div className="flex items-baseline justify-between gap-3">
              <p className="display-h4 text-navy">{pair.code}</p>
              <p className="text-xs text-muted-foreground">{pair.name}</p>
            </div>

            <div className="mt-6 flex-1">
              {ptax ? (
                <>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-xs text-muted-foreground">Compra</dt>
                      <dd className="mt-1 text-lg font-semibold text-navy">
                        {formatQuoteValue(ptax.compra)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Venda</dt>
                      <dd className="mt-1 text-lg font-semibold text-navy">
                        {formatQuoteValue(ptax.venda)}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-xs text-muted-foreground">
                    Boletim PTAX do Banco Central · {formatQuoteTime(ptax.dataHoraCotacao.replace(" ", "T"))}
                  </p>
                </>
              ) : stable ? (
                <>
                  <p className="text-xs text-muted-foreground">
                    Referência{stable.network ? ` · rede ${stable.network}` : ""}
                  </p>
                  <p className="mt-1 text-lg font-semibold text-navy">
                    {formatQuoteValue(stable.priceBrl)}
                  </p>
                </>
              ) : loading ? (
                <div className="space-y-3" aria-busy="true">
                  <div className="h-4 w-2/3 animate-pulse rounded-sm bg-line" />
                  <div className="h-4 w-1/2 animate-pulse rounded-sm bg-line" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Cotação indisponível agora. Consulte pelo app Atual ou fale com um especialista.
                </p>
              )}
            </div>

            <button
              type="button"
              data-event="quote_details"
              onClick={() => openLead({ context: `Cotação ${pair.code}` })}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-soft"
            >
              Consultar {pair.code} <ArrowRight className="size-4 text-gold" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
