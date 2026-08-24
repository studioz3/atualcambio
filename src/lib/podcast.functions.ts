import { createServerFn } from "@tanstack/react-start";
import type { PodcastEpisode } from "@/lib/podcast-shared";

/**
 * Podcast é um FORMATO de conteúdo: os episódios vivem na biblioteca
 * `editorial_content` (tipo = "podcast"). A tabela antiga `podcast_episodes`
 * permanece no banco apenas como histórico da migração.
 */

type ContentRow = {
  id: string;
  editoria: string;
  titulo: string;
  resumo: string | null;
  published_at: string | null;
  created_at: string;
  status: string;
  podcast: { spotify_url?: string; duracao_segundos?: number | null } | null;
  corpo: unknown;
};

const CONTENT_PODCAST_COLUMNS =
  "id, editoria, titulo, resumo, published_at, created_at, status, podcast, corpo";

function spotifyFrom(row: ContentRow): string | null {
  const direct = row.podcast?.spotify_url;
  if (direct) return direct;
  const blocks = Array.isArray(row.corpo) ? (row.corpo as { type?: string; url?: string }[]) : [];
  return blocks.find((b) => b?.type === "spotify" && b.url)?.url ?? null;
}

function toEpisode(row: ContentRow): PodcastEpisode | null {
  const url = spotifyFrom(row);
  if (!url) return null;
  return {
    id: row.id,
    editoria: row.editoria,
    titulo: row.titulo,
    descricao: row.resumo,
    spotify_url: url,
    duracao_segundos: row.podcast?.duracao_segundos ?? null,
    published_at: row.published_at ?? row.created_at,
    ativo: row.status === "publicado",
    sort_order: 0,
  };
}

async function fetchEpisodes(editoria: string | undefined, limit: number): Promise<PodcastEpisode[]> {
  const { publicClient } = await import("@/lib/cms.server");
  let query = publicClient()
    .from("editorial_content")
    .select(CONTENT_PODCAST_COLUMNS)
    .eq("tipo", "podcast")
    .eq("status", "publicado")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (editoria) query = query.eq("editoria", editoria);
  const { data, error } = await query;
  if (error) return [];
  return ((data ?? []) as unknown as ContentRow[])
    .map(toEpisode)
    .filter((e): e is PodcastEpisode => e !== null);
}

/** Episódios publicados (público). */
export const getPodcastEpisodes = createServerFn({ method: "GET" })
  .inputValidator((data: { editoria?: string; limit?: number } | undefined) => ({
    editoria: typeof data?.editoria === "string" ? data.editoria.slice(0, 60) : undefined,
    limit: typeof data?.limit === "number" ? Math.min(Math.max(data.limit, 1), 60) : 30,
  }))
  .handler(async ({ data }): Promise<PodcastEpisode[]> =>
    fetchEpisodes(data.editoria, data.limit),
  );

/** Episódios publicados + miniatura (oEmbed do Spotify). */
export const getPodcastEpisodesWithArt = createServerFn({ method: "GET" })
  .inputValidator((data: { editoria?: string } | undefined) => ({
    editoria: typeof data?.editoria === "string" ? data.editoria.slice(0, 60) : undefined,
  }))
  .handler(async ({ data }): Promise<(PodcastEpisode & { thumbnail_url: string | null })[]> => {
    const episodes = await fetchEpisodes(data.editoria, 60);
    return Promise.all(
      episodes.map(async (ep) => {
        let thumbnail_url: string | null = null;
        try {
          const res = await fetch(
            `https://open.spotify.com/oembed?url=${encodeURIComponent(ep.spotify_url)}`,
          );
          if (res.ok) {
            const json = (await res.json()) as { thumbnail_url?: string };
            thumbnail_url = json.thumbnail_url ?? null;
          }
        } catch {
          thumbnail_url = null;
        }
        return { ...ep, thumbnail_url };
      }),
    );
  });
