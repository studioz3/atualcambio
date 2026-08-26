import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const rateAlertSchema = z.object({
  email: z.string().trim().email().max(200),
  nome: z.string().trim().max(120).optional(),
  base: z.string().trim().max(10).default("BRL"),
  moeda: z.string().trim().min(2).max(10),
  taxa_referencia: z.number().finite().optional(),
  taxa_alvo: z.number().finite().optional(),
  atualizacoes_diarias: z.boolean().default(true),
  alerta_valor: z.boolean().default(false),
  source_url: z.string().trim().max(500).optional(),
  utm_source: z.string().trim().max(120).optional(),
  utm_medium: z.string().trim().max(120).optional(),
  utm_campaign: z.string().trim().max(120).optional(),
  utm_content: z.string().trim().max(120).optional(),
  utm_term: z.string().trim().max(120).optional(),
});

export type RateAlertInput = z.input<typeof rateAlertSchema>;

/** Cadastro de alerta de taxa de câmbio (acompanhamento por e-mail). */
export const createRateAlert = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => rateAlertSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const row: Record<string, string | number | boolean | null> = {};
    for (const [key, value] of Object.entries(data)) {
      row[key] = value === undefined ? null : (value as string | number | boolean);
    }
    row["ativo"] = true;

    const { error } = await supabaseAdmin
      .from("rate_alerts")
      .upsert(row as never, { onConflict: "email,moeda" });

    if (error) {
      console.error("[rate-alert] falha ao registrar", error.message);
      return { ok: false as const };
    }
    return { ok: true as const };
  });
