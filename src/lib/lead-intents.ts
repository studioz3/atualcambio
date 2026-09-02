/**
 * Configuração do formulário universal de lead.
 * Os campos adicionais mudam conforme a intenção escolhida.
 * Nesta primeira etapa não pedimos CPF nem CNPJ.
 */

export type LeadIntentId =
  | "empresa"
  | "remessa"
  | "stablecoin"
  | "turismo"
  | "cotacoes"
  | "conta"
  | "duvida";

export type LeadField = {
  name: "empresa" | "operacao" | "moeda" | "faixa_valor" | "finalidade" | "prazo";
  label: string;
  type: "text" | "select";
  options?: string[];
  required?: boolean;
};

export const valueRanges = [
  "Até R$ 10 mil",
  "R$ 10 mil a R$ 50 mil",
  "R$ 50 mil a R$ 250 mil",
  "R$ 250 mil a R$ 1 milhão",
  "Acima de R$ 1 milhão",
  "Ainda não sei",
];

const deadlines = ["Hoje", "Esta semana", "Este mês", "Sem data definida"];

export type LeadIntentConfig = {
  id: LeadIntentId;
  label: string;
  description: string;
  produto: string;
  tipoCliente: "pf" | "pj" | "ambos";
  event: string;
  to: string;
  hash?: string;
  formTitle: string;
  fields: LeadField[];
};

export const leadIntents: LeadIntentConfig[] = [
  {
    id: "empresa",
    label: "Fazer uma operação da minha empresa",
    description: "Importação, exportação e pagamentos internacionais com especialista dedicado.",
    produto: "Câmbio empresarial",
    tipoCliente: "pj",
    event: "business_lead_start",
    to: "/empresas",
    formTitle: "Operação da sua empresa",
    fields: [
      { name: "empresa", label: "Empresa", type: "text", required: true },
      {
        name: "operacao",
        label: "Operação",
        type: "select",
        options: [
          "Importação",
          "Exportação",
          "Pagamento de serviço no exterior",
          "Recebimento do exterior",
          "Câmbio recorrente",
          "Outra",
        ],
        required: true,
      },
      { name: "moeda", label: "Moeda", type: "select", options: ["USD", "EUR", "GBP", "CNY", "USDT", "USDC", "Outra"], required: true },
      { name: "faixa_valor", label: "Faixa de valor", type: "select", options: valueRanges, required: true },
      { name: "prazo", label: "Prazo aproximado", type: "select", options: deadlines },
    ],
  },
  {
    id: "remessa",
    label: "Enviar dinheiro para o exterior",
    description: "Remessas para pessoas, famílias, estudos e manutenção de residentes.",
    produto: "Remessa internacional",
    tipoCliente: "pf",
    event: "remittance_start",
    to: "/remessas-internacionais",
    formTitle: "Remessa internacional",
    fields: [
      { name: "moeda", label: "Moeda", type: "select", options: ["USD", "EUR", "GBP", "CAD", "AUD", "Outra"], required: true },
      { name: "faixa_valor", label: "Valor aproximado", type: "select", options: valueRanges, required: true },
      {
        name: "finalidade",
        label: "Finalidade",
        type: "select",
        options: [
          "Manutenção de residente",
          "Estudos",
          "Ajuda familiar",
          "Investimento no exterior",
          "Serviço contratado",
          "Outra",
        ],
        required: true,
      },
    ],
  },
  {
    id: "stablecoin",
    label: "Comprar ou vender USDt/USDc",
    description: "Stablecoins dentro de um ambiente regulado, com conformidade em cada etapa.",
    produto: "Stablecoins",
    tipoCliente: "ambos",
    event: "stablecoin_buy",
    to: "/stablecoins",
    formTitle: "Operação com stablecoins",
    fields: [
      { name: "moeda", label: "Ativo", type: "select", options: ["USDT", "USDC"], required: true },
      { name: "operacao", label: "Operação", type: "select", options: ["Comprar", "Vender"], required: true },
      { name: "faixa_valor", label: "Valor aproximado", type: "select", options: valueRanges, required: true },
    ],
  },
  {
    id: "turismo",
    label: "Comprar moeda para viajar",
    description: "Moeda em espécie e orientação sobre limites e documentação.",
    produto: "Câmbio turismo",
    tipoCliente: "pf",
    event: "intent_selected",
    to: "/cambio-turismo",
    formTitle: "Moeda para viagem",
    fields: [
      { name: "moeda", label: "Moeda", type: "select", options: ["USD", "EUR", "GBP", "ARS", "CLP", "Outra"], required: true },
      { name: "faixa_valor", label: "Valor aproximado", type: "select", options: valueRanges, required: true },
      { name: "prazo", label: "Data da viagem", type: "select", options: deadlines },
    ],
  },
  {
    id: "cotacoes",
    label: "Ver cotações",
    description: "Acompanhe as moedas e receba a cotação da sua operação.",
    produto: "Cotações",
    tipoCliente: "ambos",
    event: "intent_selected",
    to: "/cotacoes",
    formTitle: "Cotação da sua operação",
    fields: [
      { name: "moeda", label: "Moeda", type: "select", options: ["USD", "EUR", "GBP", "USDT", "USDC", "Outra"], required: true },
      { name: "faixa_valor", label: "Faixa de valor", type: "select", options: valueRanges },
    ],
  },
  {
    id: "conta",
    label: "Abrir a Conta Atual",
    description: "Autonomia digital para operar quando quiser, com especialista a um toque.",
    produto: "Conta Atual",
    tipoCliente: "ambos",
    event: "open_account_click",
    to: "/conta-atual",
    formTitle: "Abrir Conta Atual",
    fields: [
      { name: "operacao", label: "Vai usar a conta para", type: "select", options: ["Uso pessoal", "Uso da empresa"], required: true },
    ],
  },
  {
    id: "duvida",
    label: "Não sei qual opção escolher",
    description: "Conte o que precisa. Um especialista indica o caminho mais simples.",
    produto: "Atendimento consultivo",
    tipoCliente: "ambos",
    event: "specialist_start",
    to: "/",
    hash: "especialista",
    formTitle: "Falar com um especialista",
    fields: [
      { name: "finalidade", label: "O que você precisa resolver?", type: "text", required: true },
    ],
  },
];

export function getLeadIntent(id?: LeadIntentId): LeadIntentConfig {
  return leadIntents.find((item) => item.id === id) ?? leadIntents[leadIntents.length - 1]!;
}
