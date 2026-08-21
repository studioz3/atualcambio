import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const leadSchema = z.object({
  profile: z.enum(["pf", "pj"]),
  name: z.string().min(2),
  company: z.string().optional(),
  whatsapp: z.string().min(8),
  email: z.string().email(),
  need: z.string().min(1),
  currency: z.string().min(1),
  range: z.string().min(1),
  context: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Recebe o lead antes de qualquer handoff comercial.
 * [AGUARDANDO VALIDAÇÃO] persistência em banco de leads e integração com CRM.
 * O CRM não é dependência estrutural do site: o lead é sempre registrado aqui primeiro.
 */
export const submitLead = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => leadSchema.parse(data))
  .handler(async ({ data }) => {
    console.info("[lead]", {
      ...data,
      status: "Novo",
      receivedAt: new Date().toISOString(),
    });
    return { ok: true as const };
  });
