import { createServerFn } from "@tanstack/react-start";
import {
  CMS_LIST_COLUMNS,
  listItemToCard,
  toArticle,
  type CmsListItem,
  type CmsRow,
} from "@/lib/cms-shared";
import type { Article, EditoriaId } from "@/content/editorial";

const editoriaIds = ["momento-atual", "cripto-wine", "vida-atual"] as const;

function isEditoria(value: unknown): value is EditoriaId {
  return typeof value === "string" && (editoriaIds as readonly string[]).includes(value);
}

/** Lista de conteúdos publicados (cards). */
export const getPublishedList = createServerFn({ method: "GET" })
  .inputValidator((data: { editoria?: EditoriaId; limit?: number } | undefined) => ({
    editoria: isEditoria(data?.editoria) ? data.editoria : undefined,
    limit: typeof data?.limit === "number" ? Math.min(Math.max(data.limit, 1), 60) : 60,
  }))
  .handler(async ({ data }): Promise<Article[]> => {
    const { publicClient } = await import("@/lib/cms.server");
    let query = publicClient()
      .from("editorial_content")
      .select(CMS_LIST_COLUMNS)
      .eq("status", "publicado")
      .is("deleted_at", null)
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (data.editoria) query = query.eq("editoria", data.editoria);
    const { data: rows, error } = await query;
    if (error) return [];
    return ((rows ?? []) as unknown as CmsListItem[]).map(listItemToCard);
  });

/** Conteúdo publicado + relacionados. */
export const getPublishedArticle = createServerFn({ method: "GET" })
  .inputValidator((data: { editoria: EditoriaId; slug: string }) => {
    if (!isEditoria(data?.editoria) || typeof data?.slug !== "string") {
      throw new Error("Parâmetros inválidos");
    }
    return { editoria: data.editoria, slug: data.slug.slice(0, 120) };
  })
  .handler(async ({ data }): Promise<{ article: Article; related: Article[] } | null> => {
    const { publicClient } = await import("@/lib/cms.server");
    const sb = publicClient();
    const { data: row } = await sb
      .from("editorial_content")
      .select("*")
      .eq("editoria", data.editoria)
      .eq("slug", data.slug)
      .eq("status", "publicado")
      .is("deleted_at", null)
      .maybeSingle();
    if (!row) return null;

    const [{ data: sources }, { data: rest }] = await Promise.all([
      sb
        .from("editorial_sources")
        .select("nome, url")
        .eq("content_id", (row as CmsRow).id)
        .order("sort_order"),
      sb
        .from("editorial_content")
        .select(CMS_LIST_COLUMNS)
        .eq("status", "publicado")
        .is("deleted_at", null)
        .neq("id", (row as CmsRow).id)
        .order("published_at", { ascending: false })
        .limit(12),
    ]);

    const cards = ((rest ?? []) as unknown as CmsListItem[]).map(listItemToCard);
    const related = [
      ...cards.filter((a) => a.editoria === data.editoria),
      ...cards.filter((a) => a.editoria !== data.editoria),
    ].slice(0, 3);

    return { article: toArticle(row as CmsRow, (sources ?? []) as { nome: string; url: string | null }[]), related };
  });

/** Redirecionamento configurado no CMS para um caminho antigo. */
export const getRedirect = createServerFn({ method: "GET" })
  .inputValidator((data: { path: string }) => ({ path: String(data?.path ?? "").slice(0, 300) }))
  .handler(async ({ data }): Promise<{ target: string; status: number } | null> => {
    const { publicClient } = await import("@/lib/cms.server");
    const { data: row } = await publicClient()
      .from("redirects")
      .select("target_path, status_code")
      .eq("source_path", data.path)
      .maybeSingle();
    if (!row) return null;
    return { target: (row as { target_path: string }).target_path, status: (row as { status_code: number }).status_code };
  });
