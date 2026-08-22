import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const leadStatuses = [
  "Novo",
  "Contatado",
  "Qualificado",
  "Cliente",
  "Negócio fechado",
  "Perdido",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

const leadSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  whatsapp: z.string().trim().min(8).max(30),
  tipo_cliente: z.enum(["pf", "pj"]),
  empresa: z.string().trim().max(160).optional(),
  produto: z.string().trim().min(1).max(80),
  operacao: z.string().trim().max(120).optional(),
  moeda: z.string().trim().max(40).optional(),
  faixa_valor: z.string().trim().max(80).optional(),
  finalidade: z.string().trim().max(300).optional(),
  prazo: z.string().trim().max(80).optional(),
  mensagem: z.string().trim().max(600).optional(),
  referrer: z.string().trim().max(500).optional(),
  source_page: z.string().trim().max(120).optional(),
  source_url: z.string().trim().max(500).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(120).optional(),
  utm_term: z.string().trim().max(120).optional(),
  dispositivo: z.enum(["mobile", "tablet", "desktop"]).optional(),
  timestamp: z.string().trim().max(40).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

export type LeadRecord = LeadInput & {
  id: string;
  status: LeadStatus;
  consultor: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Registro do lead — sempre executado ANTES de qualquer handoff (WhatsApp/CRM).
 * [AGUARDANDO VALIDAÇÃO] persistência definitiva em banco de leads e integração com CRM.
 * O CRM não é dependência estrutural: o lead é registrado aqui primeiro.
 */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const now = new Date().toISOString();
    const lead: LeadRecord = {
      ...data,
      id: crypto.randomUUID(),
      status: "Novo",
      consultor: null,
      created_at: now,
      updated_at: now,
    };
    console.info("[lead]", lead);
    return { ok: true as const, id: lead.id, status: lead.status };
  });
