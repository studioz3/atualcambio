import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Inscrição na newsletter editorial.
 * Consentimento separado do atendimento comercial: um assinante NÃO é
 * classificado nem convertido automaticamente em lead comercial.
 */
const newsletterSchema = z
  .object({
    nome: z.string().trim().min(2).max(120),
    email: z.string().trim().email().max(200),
    momento_atual: z.boolean(),
    cripto_wine: z.boolean(),
    vida_atual: z.boolean(),
    consentimento: z.literal(true),
    origem: z.string().trim().max(120).optional(),
    source_url: z.string().trim().max(500).optional(),
    utm_source: z.string().trim().max(120).optional(),
    utm_medium: z.string().trim().max(120).optional(),
    utm_campaign: z.string().trim().max(120).optional(),
    utm_content: z.string().trim().max(120).optional(),
    utm_term: z.string().trim().max(120).optional(),
  })
  .refine((v) => v.momento_atual || v.cripto_wine || v.vida_atual, {
    message: "Selecione ao menos uma editoria.",
    path: ["momento_atual"],
  });

export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => newsletterSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { consentimento: _c, ...rest } = data;
    const row: Record<string, string | boolean | null> = {};
    for (const [key, value] of Object.entries(rest)) {
      row[key] = value === undefined ? null : (value as string | boolean);
    }
    const { data: saved, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(row as never, { onConflict: "email" })
      .select("id")
      .single();

    if (error || !saved) {
      console.error("[newsletter] falha ao registrar", error?.message);
      return { ok: false as const, id: null };
    }
    return { ok: true as const, id: saved.id };
  });
