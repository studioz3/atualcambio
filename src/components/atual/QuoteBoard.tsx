import { ArrowRight } from "lucide-react";
import { quotePairs } from "@/content/site";
import { useLead } from "./LeadProvider";

/**
 * Cotações — nenhum valor é exibido enquanto não houver dados reais.
 * [AGUARDANDO API ONZ] compra, venda e horário de atualização.
 * Nada de marcador técnico renderizado para o usuário final.
 */
export function QuoteBoard({ limit }: { limit?: number }) {
  const { openLead } = useLead();
  const pairs = limit ? quotePairs.slice(0, limit) : quotePairs;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {pairs.map((pair) => (
        <div
          key={pair.code}
          className="flex flex-col rounded-lg border border-line bg-white p-7 transition-colors hover:border-gold/50"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="display-h4 text-navy">{pair.code}</p>
            <p className="text-xs text-muted-foreground">{pair.name}</p>
          </div>
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
            Cotações disponíveis em breve neste site. Consulte pelo app Atual ou fale com um
            especialista.
          </p>
          <button
            type="button"
            data-event="quote_details"
            onClick={() => openLead({ context: `Cotação ${pair.code}` })}
            className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy transition-colors hover:text-gold-soft"
          >
            Consultar {pair.code} <ArrowRight className="size-4 text-gold" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  );
}
