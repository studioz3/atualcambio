import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { slugify } from "@/lib/cms-shared";
import {
  EDITORIAL_COLUMNS,
  isReservedSlug,
  type Editorial,
  type EditorialWithCount,
} from "@/lib/editorials-shared";

const editorialSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(60).optional(),
  description: z.string().max(600).nullable().optional(),
  status: z.enum(["ativa", "inativa"]).default("ativa"),
  visible_on_site: z.boolean().default(true),
  display_order: z.number().int().min(0).max(999).default(0),
  image: z.string().max(600).nullable().optional(),
  meta_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(320).nullable().optional(),
});

export type EditorialInput = z.input<typeof editorialSchema>;

/** Editorias visíveis no site (público). */
export const getPublicEditorials = createServerFn({ method: "GET" }).handler(
  async (): Promise<Editorial[]> => {
    const { publicClient } = await import("@/lib/cms.server");
    const { data, error } = await publicClient()
      .from("editorials")
      .select(EDITORIAL_COLUMNS)
      .eq("status", "ativa")
      .eq("visible_on_site", true)
      .order("display_order");
    if (error) return [];
    return (data ?? []) as unknown as Editorial[];
  },
);

/** Uma editoria pública pelo slug. */
export const getPublicEditorial = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data?.slug ?? "").slice(0, 60) }))
  .handler(async ({ data }): Promise<Editorial | null> => {
    const { publicClient } = await import("@/lib/cms.server");
    const { data: row } = await publicClient()
      .from("editorials")
      .select(EDITORIAL_COLUMNS)
      .eq("slug", data.slug)
      .eq("status", "ativa")
      .eq("visible_on_site", true)
      .maybeSingle();
    return (row ?? null) as unknown as Editorial | null;
  });

/** Todas as editorias (painel), com contagem de conteúdos. */
export const editorialsList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EditorialWithCount[]> => {
    const [{ data: rows, error }, { data: contents }] = await Promise.all([
      context.supabase.from("editorials").select(EDITORIAL_COLUMNS).order("display_order"),
      context.supabase.from("editorial_content").select("editoria").is("deleted_at", null),
    ]);
    if (error) throw new Error(error.message);
    const counts = new Map<string, number>();
    for (const c of (contents ?? []) as { editoria: string }[]) {
      counts.set(c.editoria, (counts.get(c.editoria) ?? 0) + 1);
    }
    return ((rows ?? []) as unknown as Editorial[]).map((e) => ({
      ...e,
      content_count: counts.get(e.slug) ?? 0,
    }));
  });

/** Cria ou atualiza uma editoria. */
export const editorialSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: EditorialInput) => editorialSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string; slug: string }> => {
    const slug = slugify(data.slug || data.name);
    if (!slug) throw new Error("Slug inválido.");
    if (isReservedSlug(slug)) {
      throw new Error(`O slug "${slug}" já é usado por uma página do site. Escolha outro.`);
    }

    const payload = {
      name: data.name.trim(),
      slug,
      description: data.description ?? null,
      status: data.status,
      visible_on_site: data.visible_on_site,
      display_order: data.display_order,
      image: data.image ?? null,
      meta_title: data.meta_title ?? null,
      meta_description: data.meta_description ?? null,
    };

    if (data.id) {
      const { data: current } = await context.supabase
        .from("editorials")
        .select("slug")
        .eq("id", data.id)
        .maybeSingle();
      const oldSlug = (current as { slug: string } | null)?.slug;
      const { error } = await context.supabase
        .from("editorials")
        .update(payload as never)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      // Mantém o identificador textual dos conteúdos alinhado ao slug da editoria.
      if (oldSlug && oldSlug !== slug) {
        await context.supabase
          .from("editorial_content")
          .update({ editoria: slug } as never)
          .eq("editoria", oldSlug);
      }
      return { id: data.id, slug };
    }

    const { data: inserted, error } = await context.supabase
      .from("editorials")
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (inserted as { id: string }).id, slug };
  });

/** Ativa/desativa uma editoria sem apagar conteúdos. */
export const editorialSetStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: "ativa" | "inativa" }) =>
    z.object({ id: z.string().uuid(), status: z.enum(["ativa", "inativa"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("editorials")
      .update({ status: data.status } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Transfere todos os conteúdos de uma editoria para outra. */
export const editorialTransfer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { from: string; to: string }) =>
    z.object({ from: z.string().uuid(), to: z.string().uuid() }).parse(data),
  )
  .handler(async ({ data, context }) => {
    if (data.from === data.to) throw new Error("Selecione uma editoria de destino diferente.");
    const { data: rows, error } = await context.supabase
      .from("editorials")
      .select("id, slug")
      .in("id", [data.from, data.to]);
    if (error) throw new Error(error.message);
    const list = (rows ?? []) as { id: string; slug: string }[];
    const from = list.find((r) => r.id === data.from);
    const to = list.find((r) => r.id === data.to);
    if (!from || !to) throw new Error("Editoria não encontrada.");
    const { error: upErr } = await context.supabase
      .from("editorial_content")
      .update({ editoria: to.slug, editorial_id: to.id } as never)
      .eq("editoria", from.slug);
    if (upErr) throw new Error(upErr.message);
    return { ok: true };
  });

/** Exclui apenas editorias sem conteúdos associados. */
export const editorialDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("editorials")
      .select("slug")
      .eq("id", data.id)
      .maybeSingle();
    if (!row) throw new Error("Editoria não encontrada.");
    const { count } = await context.supabase
      .from("editorial_content")
      .select("id", { count: "exact", head: true })
      .eq("editoria", (row as { slug: string }).slug);
    if ((count ?? 0) > 0) {
      throw new Error("Esta editoria possui conteúdos. Desative-a ou transfira os conteúdos antes.");
    }
    const { error } = await context.supabase.from("editorials").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
