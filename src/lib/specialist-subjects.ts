/**
 * Configuração da página /fale-com-especialista.
 * Progressive disclosure: perfil → assunto → campos relevantes.
 * Nunca pedimos CPF, CNPJ, senha, PIN ou credenciais.
 */

import { valueRanges } from "./lead-intents";

export type SpecialistSubjectId =
  | "empresa"
  | "remessa"
  | "stablecoins"
  | "turismo"
  | "conta"
  | "outro";

export type WizardFieldName =
  | "empresa"
  | "operacao"
  | "moeda"
  | "faixa_valor"
  | "finalidade"
  | "prazo"
  | "mensagem";

export type WizardField = {
  name: WizardFieldName;
  label: string;
  type: "text" | "select" | "textarea";
  options?: string[];
  required?: boolean;
  hint?: string;
  maxLength?: number;
};

export type SpecialistSubject = {
  id: SpecialistSubjectId;
  label: string;
  description: string;
  produto: string;
  /** perfil sugerido quando o assunto é essencialmente PF ou PJ */
  suggestedProfile?: "pf" | "pj";
  fields: WizardField[];
};

const deadlines = ["Hoje", "Esta semana", "Este mês", "Sem data definida"];

export const specialistSubjects: SpecialistSubject[] = [
  {
    id: "empresa",
    label: "Empresa / PJ",
    description: "Importação, exportação, pagamentos e recebimentos internacionais.",
    produto: "Câmbio empresarial",
    suggestedProfile: "pj",
    fields: [
      { name: "empresa", label: "Empresa", type: "text", required: true, maxLength: 160 },
      {
        name: "operacao",
        label: "Tipo de operação",
        type: "select",
        required: true,
        options: [
          "Importação",
          "Exportação",
          "Pagamento de serviço no exterior",
          "Recebimento do exterior",
          "Câmbio recorrente",
          "Outra",
        ],
      },
      {
        name: "moeda",
        label: "Moeda",
        type: "select",
        required: true,
        options: ["USD", "EUR", "GBP", "CNY", "USDT", "USDC", "Outra"],
      },
      {
        name: "faixa_valor",
        label: "Faixa aproximada de valor",
        type: "select",
        required: true,
        options: valueRanges,
      },
      { name: "prazo", label: "Prazo aproximado", type: "select", options: deadlines },
    ],
  },
  {
    id: "remessa",
    label: "Remessa Internacional",
    description: "Envio ou recebimento de recursos.",
    produto: "Remessa internacional",
    fields: [
      {
        name: "moeda",
        label: "Moeda",
        type: "select",
        required: true,
        options: ["USD", "EUR", "GBP", "CAD", "AUD", "Outra"],
      },
      {
        name: "faixa_valor",
        label: "Valor aproximado",
        type: "select",
        required: true,
        options: valueRanges,
      },
      {
        name: "finalidade",
        label: "Finalidade",
        type: "select",
        required: true,
        options: [
          "Manutenção de residente",
          "Estudos",
          "Ajuda familiar",
          "Investimento no exterior",
          "Serviço contratado",
          "Outra",
        ],
      },
    ],
  },
  {
    id: "stablecoins",
    label: "USDt / USDc",
    description: "Compra ou venda de stablecoins.",
    produto: "Stablecoins",
    fields: [
      { name: "moeda", label: "Ativo", type: "select", required: true, options: ["USDT", "USDC"] },
      {
        name: "operacao",
        label: "Operação",
        type: "select",
        required: true,
        options: ["Comprar", "Vender"],
      },
      {
        name: "faixa_valor",
        label: "Faixa aproximada de valor",
        type: "select",
        required: true,
        options: valueRanges,
      },
    ],
  },
  {
    id: "turismo",
    label: "Câmbio Turismo",
    description: "Moeda estrangeira.",
    produto: "Câmbio turismo",
    suggestedProfile: "pf",
    fields: [
      {
        name: "moeda",
        label: "Moeda",
        type: "select",
        required: true,
        options: ["USD", "EUR", "GBP", "ARS", "CLP", "Outra"],
      },
      {
        name: "operacao",
        label: "Operação",
        type: "select",
        required: true,
        options: ["Comprar", "Vender"],
      },
      {
        name: "faixa_valor",
        label: "Valor aproximado",
        type: "select",
        required: true,
        options: valueRanges,
      },
    ],
  },
  {
    id: "conta",
    label: "Conta Atual",
    description: "Cadastro, acesso ou funcionalidades.",
    produto: "Conta Atual",
    fields: [
      {
        name: "operacao",
        label: "Assunto",
        type: "select",
        required: true,
        options: [
          "Abertura de conta",
          "Cadastro",
          "Acesso",
          "Operação não encontrada",
          "Outro",
        ],
      },
    ],
  },
  {
    id: "outro",
    label: "Outro",
    description: "Necessidade não encontrada nas opções anteriores.",
    produto: "Atendimento consultivo",
    fields: [
      {
        name: "mensagem",
        label: "Descreva rapidamente sua necessidade",
        type: "textarea",
        required: true,
        maxLength: 400,
        hint: "Até 400 caracteres.",
      },
    ],
  },
];

export function getSubject(id?: string | null): SpecialistSubject | undefined {
  return specialistSubjects.find((item) => item.id === id);
}

/** Mapeia valores de query string (?assunto=...) para os ids internos. */
export function normalizeSubjectParam(value?: string | null): SpecialistSubjectId | undefined {
  if (!value) return undefined;
  const key = value.toLowerCase();
  const aliases: Record<string, SpecialistSubjectId> = {
    empresa: "empresa",
    empresas: "empresa",
    pj: "empresa",
    remessa: "remessa",
    remessas: "remessa",
    stablecoin: "stablecoins",
    stablecoins: "stablecoins",
    usdt: "stablecoins",
    usdc: "stablecoins",
    turismo: "turismo",
    conta: "conta",
    "conta-atual": "conta",
    outro: "outro",
  };
  return aliases[key];
}
