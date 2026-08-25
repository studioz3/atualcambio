import { createServerFn } from "@tanstack/react-start";
import {
  CMS_LIST_COLUMNS,
  listItemToCard,
  toArticle,
  type CmsListItem,
  type CmsRow,
} from "@/lib/cms-shared";
import type { Article, EditoriaId } from "@/content/editorial";

/** Editoria é um slug dinâmico (tabela `editorials`). */
function isEditoria(value: unknown): value is EditoriaId {
  return typeof value === "string" && /^[a-z0-9-]{2,60}$/.test(value);
}

/**
 * Lista de conteúdos publicados (cards).
 * Por padrão traz apenas artigos — podcasts têm superfície própria no site.
 * Use `formato: "todos"` para trazer todos os formatos.
 */
export const getPublishedList = createServerFn({ method: "GET" })
  .inputValidator(
    (data: { editoria?: EditoriaId; limit?: number; formato?: string } | undefined) => ({
      editoria: isEditoria(data?.editoria) ? data.editoria : undefined,
      limit: typeof data?.limit === "number" ? Math.min(Math.max(data.limit, 1), 60) : 60,
      formato: typeof data?.formato === "string" ? data.formato : "artigo",
    }),
  )
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
    if (data.formato !== "todos") query = query.eq("tipo", data.formato);
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

/** Perfil público de autor + conteúdos assinados (E-E-A-T). */
export const getAuthorProfile = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({
    slug: String(data?.slug ?? "").slice(0, 120),
  }))
  .handler(
    async ({
      data,
    }): Promise<{
      author: {
        nome: string;
        slug: string;
        cargo: string | null;
        bio: string | null;
        foto_url: string | null;
        links: { label?: string; url: string }[];
      };
      articles: Article[];
    } | null> => {
      const { publicClient } = await import("@/lib/cms.server");
      const sb = publicClient();
      const { data: row } = await sb
        .from("editorial_authors")
        .select("id, nome, slug, cargo, bio, foto_url, links")
        .eq("slug", data.slug)
        .eq("ativo", true)
        .maybeSingle();
      if (!row) return null;
      const author = row as {
        id: string;
        nome: string;
        slug: string;
        cargo: string | null;
        bio: string | null;
        foto_url: string | null;
        links: { label?: string; url: string }[] | null;
      };

      const { data: rows } = await sb
        .from("editorial_content")
        .select(CMS_LIST_COLUMNS)
        .eq("status", "publicado")
        .is("deleted_at", null)
        .eq("author_id", author.id)
        .order("published_at", { ascending: false })
        .limit(30);

      return {
        author: { ...author, links: author.links ?? [] },
        articles: ((rows ?? []) as unknown as CmsListItem[]).map(listItemToCard),
      };
    },
  );
