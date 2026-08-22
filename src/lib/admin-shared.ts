/**
 * Vocabulário compartilhado do painel gerencial (client-safe).
 * Nenhum dado fictício: apenas listas de domínio e helpers de normalização.
 */

export const leadStatuses = [
  "Novo",
  "Contatado",
  "Qualificado",
  "Cliente",
  "Negócio fechado",
  "Perdido",
] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const funnelOrder: LeadStatus[] = [
  "Novo",
  "Contatado",
  "Qualificado",
  "Cliente",
  "Negócio fechado",
];

export const motivosPerda = [
  "Sem resposta",
  "Não tinha interesse real",
  "Preço/condição",
  "Operação não disponível",
  "Documentação",
  "Prazo",
  "Concorrente",
  "Outro",
] as const;

export const produtosPadrao = [
  "Empresas / PJ",
  "Remessa Internacional",
  "USDT / USDC",
  "Câmbio Turismo",
  "Conta Atual",
  "Outro",
] as const;
export type ProdutoPadrao = (typeof produtosPadrao)[number];

/** Normaliza o produto informado pelos formulários para a taxonomia do painel. */
export function normalizeProduto(raw?: string | null): ProdutoPadrao {
  const v = (raw ?? "").toLowerCase();
  if (!v) return "Outro";
  if (/(empresa|pj|corporativ|import|export)/.test(v)) return "Empresas / PJ";
  if (/(remessa|envio|transfer)/.test(v)) return "Remessa Internacional";
  if (/(usdt|usdc|stablecoin|cripto)/.test(v)) return "USDT / USDC";
  if (/(turismo|viagem|espécie|especie|cartão|cartao)/.test(v)) return "Câmbio Turismo";
  if (/(conta atual|conta|abertura)/.test(v)) return "Conta Atual";
  return "Outro";
}

export const ORIGEM_DESCONHECIDA = "Origem não identificada";

/** Origem comercial do lead a partir de UTMs, página de conversão e referrer. */
export function deriveOrigem(input: {
  utm_source?: string | null;
  utm_medium?: string | null;
  source_page?: string | null;
  referrer?: string | null;
}): string {
  const src = (input.utm_source ?? "").toLowerCase().trim();
  const page = (input.source_page ?? "").toLowerCase();
  const ref = (input.referrer ?? "").toLowerCase();

  if (src) {
    if (/google/.test(src)) return /cpc|ads|paid/.test((input.utm_medium ?? "").toLowerCase()) ? "Google Ads" : "Google Orgânico";
    if (/insta/.test(src)) return "Instagram";
    if (/face|meta|fb/.test(src)) return "Facebook";
    if (/linkedin/.test(src)) return "LinkedIn";
    if (/newsletter|email|e-mail|mail/.test(src)) return "Newsletter";
    return src;
  }

  if (/momento-atual/.test(page) || /momento-atual/.test(ref)) return "Momento Atual";
  if (/cripto-wine/.test(page) || /cripto-wine/.test(ref)) return "Cripto Wine";
  if (/vida-atual/.test(page) || /vida-atual/.test(ref)) return "Vida Atual";
  if (/newsletter/.test(page)) return "Newsletter";

  if (ref) {
    if (/google\./.test(ref)) return "Google Orgânico";
    if (/instagram/.test(ref)) return "Instagram";
    if (/facebook/.test(ref)) return "Facebook";
    if (/linkedin/.test(ref)) return "LinkedIn";
    if (/atualcambio/.test(ref)) return "Direto";
    return "Outro";
  }

  return ORIGEM_DESCONHECIDA;
}

/** Agrupamento macro para o quadro "de onde vêm os leads". */
export function origemGrupo(origem?: string | null): string {
  const v = (origem ?? "").toLowerCase();
  if (!v) return ORIGEM_DESCONHECIDA;
  if (/google/.test(v)) return "Google";
  if (/instagram|facebook|linkedin/.test(v)) return "Social";
  if (/momento atual|cripto wine|vida atual|newsletter/.test(v)) return "Conteúdo";
  if (/direto/.test(v)) return "Direto";
  if (/não identificada/.test(v)) return ORIGEM_DESCONHECIDA;
  return "Outros";
}

export function whatsappLink(numero: string, nome?: string) {
  const digits = (numero ?? "").replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const texto = `Olá${nome ? `, ${nome.split(" ")[0]}` : ""}! Aqui é da Atual Câmbio.`;
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(texto)}`;
}

export type PeriodPreset = "hoje" | "7d" | "30d" | "mes" | "tudo" | "custom";

export function periodRange(preset: PeriodPreset, from?: string, to?: string) {
  const now = new Date();
  const start = new Date(now);
  switch (preset) {
    case "hoje":
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: null as string | null };
    case "7d":
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: null };
    case "30d":
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { from: start.toISOString(), to: null };
    case "mes": {
      const first = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: first.toISOString(), to: null };
    }
    case "custom":
      return {
        from: from ? new Date(`${from}T00:00:00`).toISOString() : null,
        to: to ? new Date(`${to}T23:59:59`).toISOString() : null,
      };
    default:
      return { from: null, to: null };
  }
}

export function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
