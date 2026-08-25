import { createServerFn } from "@tanstack/react-start";

/**
 * Cotação PTAX (Banco Central) — boletim de fechamento oficial.
 * Nunca inventa valores: se a consulta falhar ou não houver boletim
 * na janela pesquisada, retorna lista vazia.
 */

export type PtaxCotacao = {
  moeda: "USD" | "EUR" | "GBP";
  compra: number;
  venda: number;
  dataHoraCotacao: string;
};

type BcbBoletim = {
  cotacaoCompra: number;
  cotacaoVenda: number;
  dataHoraCotacao: string;
};

function formatBcbDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}-${date.getFullYear()}`;
}

async function fetchMoedaPtax(moeda: "USD" | "EUR" | "GBP"): Promise<PtaxCotacao | null> {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 10);

  const url =
    `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaPeriodoFechamento(` +
    `codigoMoeda=@codigoMoeda,dataInicialCotacao=@dataInicialCotacao,dataFinalCotacao=@dataFinalCotacao)` +
    `?@codigoMoeda='${moeda}'&@dataInicialCotacao='${formatBcbDate(start)}'&@dataFinalCotacao='${formatBcbDate(end)}'` +
    `&$top=1&$orderby=dataHoraCotacao desc&$format=json`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const json = (await res.json()) as { value?: BcbBoletim[] };
    const item = json.value?.[0];
    if (!item) return null;
    return {
      moeda,
      compra: item.cotacaoCompra,
      venda: item.cotacaoVenda,
      dataHoraCotacao: item.dataHoraCotacao,
    };
  } catch {
    return null;
  }
}

export const getPtaxCotacoes = createServerFn({ method: "GET" }).handler(
  async (): Promise<PtaxCotacao[]> => {
    const moedas: ("USD" | "EUR" | "GBP")[] = ["USD", "EUR", "GBP"];
    const resultados = await Promise.all(moedas.map(fetchMoedaPtax));
    return resultados.filter((item): item is PtaxCotacao => item !== null);
  },
);
