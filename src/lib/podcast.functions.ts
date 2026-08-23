import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PODCAST_COLUMNS, type PodcastEpisode } from "@/lib/podcast-shared";

const episodeSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  editoria: z.string().max(40).default("momento-atual"),
  titulo: z.string().min(2).max(200),
  descricao: z.string().max(1200).nullable().optional(),
  spotify_url: z.string().min(8).max(600),
  duracao_segundos: z.number().int().min(0).max(360000).nullable().optional(),
  published_at: z.string().min(4),
  ativo: z.boolean().default(true),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export type PodcastEpisodeInput = z.input<typeof episodeSchema>;

/** Episódios publicados (público). */
export const getPodcastEpisodes = createServerFn({ method: "GET" })
  .inputValidator((data: { editoria?: string; limit?: number } | undefined) => ({
    editoria: typeof data?.editoria === "string" ? data.editoria.slice(0, 40) : "momento-atual",
    limit: typeof data?.limit === "number" ? Math.min(Math.max(data.limit, 1), 60) : 30,
  }))
  .handler(async ({ data }): Promise<PodcastEpisode[]> => {
    const { publicClient } = await import("@/lib/cms.server");
    const { data: rows, error } = await publicClient()
      .from("podcast_episodes")
      .select(PODCAST_COLUMNS)
      .eq("editoria", data.editoria)
      .eq("ativo", true)
      .order("sort_order", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(data.limit);
    if (error) return [];
    return (rows ?? []) as unknown as PodcastEpisode[];
  });

/** Lista para o painel — inclui inativos. */
export const podcastList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PodcastEpisode[]> => {
    const { data, error } = await context.supabase
      .from("podcast_episodes")
      .select(PODCAST_COLUMNS)
      .order("published_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as unknown as PodcastEpisode[];
  });

/** Cria ou atualiza um episódio. */
export const podcastSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: PodcastEpisodeInput) => episodeSchema.parse(data))
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { id, ...values } = data;
    const payload = {
      ...values,
      descricao: values.descricao ?? null,
      duracao_segundos: values.duracao_segundos ?? null,
    };
    if (id) {
      const { error } = await context.supabase.from("podcast_episodes").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("podcast_episodes")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (row as { id: string }).id };
  });

/** Remove um episódio. */
export const podcastDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { error } = await context.supabase.from("podcast_episodes").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Episódios publicados + miniatura (oEmbed do Spotify). */
export const getPodcastEpisodesWithArt = createServerFn({ method: "GET" })
  .inputValidator((data: { editoria?: string } | undefined) => ({
    editoria: typeof data?.editoria === "string" ? data.editoria.slice(0, 40) : "momento-atual",
  }))
  .handler(async ({ data }): Promise<(PodcastEpisode & { thumbnail_url: string | null })[]> => {
    const { publicClient } = await import("@/lib/cms.server");
    const { data: rows, error } = await publicClient()
      .from("podcast_episodes")
      .select(PODCAST_COLUMNS)
      .eq("editoria", data.editoria)
      .eq("ativo", true)
      .order("sort_order", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(200);
    if (error) return [];
    const episodes = (rows ?? []) as unknown as PodcastEpisode[];
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
