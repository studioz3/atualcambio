import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { deriveOrigem, leadStatuses, type LeadStatus } from "./admin-shared";

export { leadStatuses };
export type { LeadStatus };

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
  entry_page: z.string().trim().max(500).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(120).optional(),
  utm_term: z.string().trim().max(120).optional(),
  dispositivo: z.enum(["mobile", "tablet", "desktop"]).optional(),
  timestamp: z.string().trim().max(40).optional(),
  is_teste: z.boolean().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Registro do lead — sempre executado ANTES de qualquer handoff (WhatsApp).
 * Persiste no banco do painel gerencial e cria o primeiro evento da timeline.
 */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { timestamp: _ts, ...rest } = data;
    const row: Record<string, string | boolean | null> = {
      origem: deriveOrigem({
        utm_source: data.utm_source ?? null,
        utm_medium: data.utm_medium ?? null,
        source_page: data.source_page ?? null,
        referrer: data.referrer ?? null,
      }),
      status: "Novo",
      is_teste: data.is_teste ?? false,
    };
    for (const [key, value] of Object.entries(rest)) {
      if (key === "is_teste") continue;
      row[key] = value === undefined ? null : (value as string | boolean);
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("leads")
      .insert(row as never)
      .select("id, status")
      .single();

    if (error || !inserted) {
      console.error("[lead] falha ao registrar", error?.message);
      return { ok: false as const, id: null, status: "Novo" as const };
    }

    await supabaseAdmin.from("lead_events").insert({
      lead_id: inserted.id,
      tipo: "recebido",
      status_novo: "Novo",
      descricao: "Lead recebido pelo site",
      autor: "site",
    });

    return { ok: true as const, id: inserted.id, status: inserted.status as LeadStatus };
  });
