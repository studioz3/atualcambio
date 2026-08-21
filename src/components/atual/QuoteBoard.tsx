import { ArrowRight } from "lucide-react";
import { quotePairs } from "@/content/site";
import { useLead } from "./LeadProvider";

/**
 * Cotações — nenhum valor é exibido enquanto não houver dados reais.
 * [AGUARDANDO API ONZ] compra, venda e horário de atualização.
 */
export function QuoteBoard({ limit }: { limit?: number }) {
  const { openLead } = useLead();
  const pairs = limit ? quotePairs.slice(0, limit) : quotePairs;

  return (
    <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map((pair) => (
        <div key={pair.code} className="bg-white p-6">
          <div className="flex items-baseline justify-between gap-3">
            <p className="font-display text-xl font-bold text-navy">{pair.code}</p>
            <p className="text-xs text-muted-foreground">{pair.name}</p>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <dt className="eyebrow text-muted-foreground">Compra</dt>
              <dd className="mt-1 text-lg font-semibold text-graphite/40">—</dd>
            </div>
            <div>
              <dt className="eyebrow text-muted-foreground">Venda</dt>
              <dd className="mt-1 text-lg font-semibold text-graphite/40">—</dd>
            </div>
          </dl>
          <p className="mt-5 text-xs text-muted-foreground">
            Cotação indisponível no momento. [AGUARDANDO API ONZ]
          </p>
          <button
            type="button"
            data-event="quote_details"
            onClick={() => openLead({ context: `Cotação ${pair.code}` })}
            className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-soft"
          >
            Ver detalhes <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
