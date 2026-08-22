/**
 * Estrutura de cotações — preparada para a futura integração da API.
 *
 * Nenhum valor é obtido, calculado ou exibido enquanto não houver dados reais.
 * Quando a integração existir, basta um provedor que devolva `QuoteResult`
 * (via server function) para os cards passarem a exibir compra, venda,
 * horário de atualização e validade.
 */

export type QuoteStatus = "loading" | "success" | "stale" | "error" | "unavailable";

export type AssetCategory = "moeda" | "stablecoin";

export type QuoteAsset = {
  /** Código do ativo (USD, EUR, GBP, USDT, USDC…) */
  code: string;
  /** Nome por extenso */
  name: string;
  category: AssetCategory;
  /** Evento de analytics disparado ao interagir com o card */
  event: string;
};

export type QuoteData = {
  code: string;
  name: string;
  /** Preço de compra (a instituição compra do cliente) */
  bid: number;
  /** Preço de venda (a instituição vende ao cliente) */
  ask: number;
  /** Momento da apuração da cotação (ISO 8601) */
  timestamp: string;
  /** Validade da cotação, quando houver (ISO 8601) */
  validUntil?: string;
  /** Moeda de referência do par (ex.: BRL) */
  referenceCurrency: string;
  /** Origem do dado */
  source: string;
};

export type QuoteResult = {
  status: QuoteStatus;
  data?: QuoteData;
};

/** Moedas e stablecoins preparadas na página de cotações. */
export const quoteAssets: QuoteAsset[] = [
  { code: "USD", name: "Dólar Americano", category: "moeda", event: "quote_usd_click" },
  { code: "EUR", name: "Euro", category: "moeda", event: "quote_eur_click" },
  { code: "GBP", name: "Libra Esterlina", category: "moeda", event: "quote_gbp_click" },
  { code: "USDT", name: "Tether", category: "stablecoin", event: "quote_usdt_click" },
  { code: "USDC", name: "USD Coin", category: "stablecoin", event: "quote_usdc_click" },
];

/**
 * Ponto único de leitura das cotações.
 * Sem provedor conectado, todos os ativos retornam `unavailable`
 * e o card renderiza o estado elegante, sem número algum.
 */
export function getQuoteResult(_code: string): QuoteResult {
  return { status: "unavailable" };
}

/** Formatação de horário usada quando houver dado real. */
export function formatQuoteTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

/** Formatação de valor usada quando houver dado real. */
export function formatQuoteValue(value: number, currency = "BRL"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}
