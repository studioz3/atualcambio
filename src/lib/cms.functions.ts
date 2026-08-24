import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { CMS_LIST_COLUMNS, slugify, type CmsListItem, type CmsRow } from "@/lib/cms-shared";

/** Editoria é um slug dinâmico validado contra a tabela `editorials`. */
const editoriaSchema = z.string().min(2).max(60);
const statusSchema = z.enum(["rascunho", "revisao", "agendado", "publicado"]);
const tipoSchema = z.enum(["artigo", "podcast", "video"]);

const blockSchema = z.record(z.string(), z.unknown());

const contentSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  editoria: editoriaSchema,
  tipo: tipoSchema,
  titulo: z.string().min(3).max(200),
  subtitulo: z.string().max(400).nullable().optional(),
  resumo: z.string().max(600).nullable().optional(),
  slug: z.string().max(120).optional(),
  categoria: z.string().max(80).nullable().optional(),
  autor_nome: z.string().max(120).nullable().optional(),
  hero_image: z.string().max(600).nullable().optional(),
  hero_alt: z.string().max(300).nullable().optional(),
  social_image: z.string().max(600).nullable().optional(),
  corpo: z.array(blockSchema).default([]),
  related_cta: z.string().max(40).default("nenhum"),
  destaque_editoria: z.boolean().default(false),
  destaque_home: z.boolean().default(false),
  newsletter_selected: z.boolean().default(false),
  status: statusSchema.default("rascunho"),
  seo_title: z.string().max(200).nullable().optional(),
  meta_description: z.string().max(320).nullable().optional(),
  canonical: z.string().max(600).nullable().optional(),
  indexable: z.boolean().default(true),
  podcast: z.record(z.string(), z.unknown()).nullable().optional(),
  video: z.record(z.string(), z.unknown()).nullable().optional(),
  published_at: z.string().nullable().optional(),
  fontes: z.array(z.object({ nome: z.string().min(1).max(200), url: z.string().max(600).nullable() })).default([]),
});

export type CmsContentInput = z.input<typeof contentSchema>;
export type { CmsListItem, CmsRow };

/** Lista para o painel — inclui rascunhos. */
export const cmsList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { editoria?: string; status?: string; tipo?: string; q?: string } | undefined) =>
    z
      .object({
        editoria: editoriaSchema.optional(),
        status: statusSchema.optional(),
        tipo: tipoSchema.optional(),
        q: z.string().max(120).optional(),
      })
      .parse(data ?? {}),
  )
  .handler(async ({ data, context }): Promise<CmsListItem[]> => {
    let query = context.supabase
      .from("editorial_content")
      .select(CMS_LIST_COLUMNS)
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .limit(300);
    if (data.editoria) query = query.eq("editoria", data.editoria);
    if (data.status) query = query.eq("status", data.status);
    if (data.tipo) query = query.eq("tipo", data.tipo);
    if (data.q) query = query.ilike("titulo", `%${data.q}%`);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as CmsListItem[];
  });

export const cmsGet = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("editorial_content")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) return null;
    const { data: fontes } = await context.supabase
      .from("editorial_sources")
      .select("nome, url")
      .eq("content_id", data.id)
      .order("sort_order");
    return { row: row as unknown as CmsRow, fontes: (fontes ?? []) as { nome: string; url: string | null }[] };
  });

export const cmsSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: CmsContentInput) => contentSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string; slug: string }> => {
    const slug = slugify(data.slug || data.titulo);
    const { data: editorialRow } = await context.supabase
      .from("editorials")
      .select("id")
      .eq("slug", data.editoria)
      .maybeSingle();
    if (!editorialRow) throw new Error("Editoria inválida.");
    const publishedAt =
      data.status === "publicado" ? (data.published_at ?? new Date().toISOString()) : (data.published_at ?? null);

    const payload = {
      editoria: data.editoria,
      editorial_id: (editorialRow as { id: string }).id,
      tipo: data.tipo,
      titulo: data.titulo,
      subtitulo: data.subtitulo ?? null,
      resumo: data.resumo ?? null,
      slug,
      categoria: data.categoria ?? null,
      autor_nome: data.autor_nome ?? "Redação Atual",
      hero_image: data.hero_image ?? null,
      hero_alt: data.hero_alt ?? null,
      social_image: data.social_image ?? null,
      corpo: data.corpo,
      related_cta: data.related_cta,
      destaque_editoria: data.destaque_editoria,
      destaque_home: data.destaque_home,
      newsletter_selected: data.newsletter_selected,
      status: data.status,
      seo_title: data.seo_title ?? null,
      meta_description: data.meta_description ?? null,
      canonical: data.canonical ?? null,
      indexable: data.indexable,
      podcast: data.podcast ?? null,
      video: data.video ?? null,
      published_at: publishedAt,
      updated_by: context.userId,
    } as never;

    let id = data.id ?? null;
    if (id) {
      const { error } = await context.supabase.from("editorial_content").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
    } else {
      const { data: inserted, error } = await context.supabase
        .from("editorial_content")
        .insert({ ...(payload as object), created_by: context.userId } as never)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      id = (inserted as { id: string }).id;
    }

    await context.supabase.from("editorial_sources").delete().eq("content_id", id);
    if (data.fontes.length > 0) {
      await context.supabase.from("editorial_sources").insert(
        data.fontes.map((f, i) => ({ content_id: id!, nome: f.nome, url: f.url || null, sort_order: i })),
      );
    }

    return { id: id!, slug };
  });

export const cmsSetStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) =>
    z.object({ id: z.string().uuid(), status: statusSchema }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const patch = {
      status: data.status,
      updated_by: context.userId,
      ...(data.status === "publicado" ? { published_at: new Date().toISOString() } : {}),
    };
    const { error } = await context.supabase.from("editorial_content").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cmsDuplicate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("editorial_content")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    const src = row as unknown as CmsRow;
    const { data: inserted, error: insErr } = await context.supabase
      .from("editorial_content")
      .insert({
        ...(src as object),
        id: undefined,
        titulo: `${src.titulo} (cópia)`,
        slug: `${src.slug}-copia-${Date.now().toString().slice(-5)}`,
        status: "rascunho",
        published_at: null,
        destaque_home: false,
        destaque_editoria: false,
        created_at: undefined,
        updated_at: undefined,
        created_by: context.userId,
        updated_by: context.userId,
      } as never)
      .select("id")
      .single();
    if (insErr) throw new Error(insErr.message);
    return { id: (inserted as { id: string }).id };
  });

/** Arquivar (soft delete) — mantém histórico. */
export const cmsArchive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("editorial_content")
      .update({ deleted_at: new Date().toISOString(), status: "rascunho", updated_by: context.userId } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const cmsCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("editorial_categories")
      .select("id, editoria, nome, slug, sort_order")
      .eq("ativo", true)
      .order("sort_order");
    return (data ?? []) as { id: string; editoria: string; nome: string; slug: string; sort_order: number }[];
  });

/** URL assinada de upload não é necessária: o bucket aceita upload autenticado do staff. */
export const cmsStoragePath = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { filename: string }) =>
    z.object({ filename: z.string().min(1).max(160) }).parse(data),
  )
  .handler(async ({ data }) => {
    const ext = data.filename.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    return { path: `hero/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}` };
  });
