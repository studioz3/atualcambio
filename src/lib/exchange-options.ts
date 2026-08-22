/**
 * Opções compartilhadas entre a página de Remessas e o formulário de lead.
 * Nenhuma cotação, prazo, tarifa ou IOF é calculado aqui.
 * [AGUARDANDO API ONZ] disponibilidade definitiva de moedas e cálculo da operação.
 */

export const remittanceCurrencies = ["USD", "EUR", "GBP", "CAD", "AUD", "Outra moeda"] as const;

export const remittancePurposes = [
  "Estudos",
  "Viagem",
  "Manutenção de residente",
  "Imóveis",
  "Investimentos",
  "Pagamento de serviços",
  "Transferência entre contas próprias",
  "Operação empresarial",
  "Outra finalidade",
] as const;

export const tourismCurrencies = ["USD", "EUR", "GBP", "Outra moeda"] as const;

export const tourismOperations = ["Comprar", "Vender"] as const;

export type TourismOperation = (typeof tourismOperations)[number];
