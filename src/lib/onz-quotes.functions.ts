import { createServerFn } from "@tanstack/react-start";

/**
 * Cotações de stablecoins (USDT/USDC) — API pública ONZ.
 * Nunca inventa valores: em caso de falha retorna lista vazia.
 */

export type OnzQuote = {
  asset: string;
  network: string;
  priceBrl: number;
};

export type OnzQuotesResult = {
  asOf: string | null;
  base: string;
  stale: boolean;
  quotes: OnzQuote[];
  error: boolean;
};

const ONZ_QUOTES_URL =
  "https://api.atualc-prod.onz.software/public/gw_cripto_broker/quotes.json";

type OnzPayload = {
  asOf?: string;
  base?: string;
  stale?: boolean;
  quotes?: { asset?: string; network?: string; priceBrl?: string | number }[];
};

export const getOnzQuotes = createServerFn({ method: "GET" }).handler(
  async (): Promise<OnzQuotesResult> => {
    const empty: OnzQuotesResult = {
      asOf: null,
      base: "BRL",
      stale: false,
      quotes: [],
      error: true,
    };

    try {
      const res = await fetch(ONZ_QUOTES_URL, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return empty;
      const json = (await res.json()) as OnzPayload;

      const quotes: OnzQuote[] = (json.quotes ?? [])
        .map((item) => ({
          asset: String(item.asset ?? "").toUpperCase(),
          network: String(item.network ?? ""),
          priceBrl: Number(item.priceBrl),
        }))
        .filter((item) => item.asset !== "" && Number.isFinite(item.priceBrl));

      if (quotes.length === 0) return empty;

      return {
        asOf: json.asOf ?? null,
        base: json.base ?? "BRL",
        stale: json.stale === true,
        quotes,
        error: false,
      };
    } catch {
      return empty;
    }
  },
);
