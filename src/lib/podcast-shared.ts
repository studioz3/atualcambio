/** Episódios de podcast (Momento Atual) — tipos e helpers compartilhados. */

export type PodcastEpisode = {
  id: string;
  editoria: string;
  titulo: string;
  descricao: string | null;
  spotify_url: string;
  duracao_segundos: number | null;
  published_at: string;
  ativo: boolean;
  sort_order: number;
};

export const PODCAST_COLUMNS =
  "id, editoria, titulo, descricao, spotify_url, duracao_segundos, published_at, ativo, sort_order";

export function formatDuration(seconds: number | null | undefined): string | null {
  if (!seconds || seconds <= 0) return null;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}min${s ? ` ${String(s).padStart(2, "0")}s` : ""}`;
}

export function formatEpisodeDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}
