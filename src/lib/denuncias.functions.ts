import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const denunciaCategorias = [
  "Fraude financeira ou operacional",
  "Lavagem de dinheiro ou financiamento ao terrorismo",
  "Corrupção, suborno ou favorecimento",
  "Assédio ou discriminação",
  "Vazamento de dados / LGPD",
  "Outra violação ao Código de Conduta",
] as const;

const denunciaSchema = z.object({
  anonima: z.boolean(),
  nome: z.string().trim().max(120).optional(),
  email: z.string().trim().max(200).optional(),
  telefone: z.string().trim().max(30).optional(),
  categoria: z.enum(denunciaCategorias),
  relato: z.string().trim().min(20).max(4000),
  envolvidos: z.string().trim().max(300).optional(),
  ocorrido_em: z.string().trim().max(40).optional(),
  local: z.string().trim().max(160).optional(),
});

export type DenunciaInput = z.infer<typeof denunciaSchema>;

function gerarProtocolo() {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DEN-${stamp}-${random}`;
}

/** Registro sigiloso de denúncia. Dados de contato só são gravados quando o relato é identificado. */
export const submitDenuncia = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => denunciaSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const protocolo = gerarProtocolo();

    const row = {
      protocolo,
      anonima: data.anonima,
      nome: data.anonima ? null : (data.nome ?? null),
      email: data.anonima ? null : (data.email ?? null),
      telefone: data.anonima ? null : (data.telefone ?? null),
      categoria: data.categoria,
      relato: data.relato,
      envolvidos: data.envolvidos ?? null,
      ocorrido_em: data.ocorrido_em ?? null,
      local: data.local ?? null,
      status: "Nova",
    };

    const { error } = await supabaseAdmin.from("denuncias").insert(row as never);
    if (error) {
      console.error("[denuncia] falha ao registrar", error.message);
      return { ok: false as const, protocolo: null };
    }
    return { ok: true as const, protocolo };
  });
