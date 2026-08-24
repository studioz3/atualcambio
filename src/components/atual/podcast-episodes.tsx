import { useState } from "react";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SpotifyPlayer } from "./spotify";
import { formatDuration, formatEpisodeDate, type PodcastEpisode } from "@/lib/podcast-shared";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/** Lista de episódios anteriores com player inline. */
export function PodcastEpisodeList({
  episodes,
  sourcePage = "momento-atual",
  className,
}: {
  episodes: PodcastEpisode[];
  sourcePage?: string;
  className?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  if (episodes.length === 0) return null;

  return (
    <ul className={cn("divide-y divide-white/10 border-t border-white/10", className)}>
      {episodes.map((ep) => {
        const open = openId === ep.id;
        const duration = formatDuration(ep.duracao_segundos);
        return (
          <li key={ep.id} className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-white">{ep.titulo}</h3>
                <p className="mt-1 text-xs text-white/55">
                  <time dateTime={ep.published_at}>{formatEpisodeDate(ep.published_at)}</time>
                  {duration ? <> · {duration}</> : null}
                </p>
                {ep.descricao ? (
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">{ep.descricao}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const next = open ? null : ep.id;
                    setOpenId(next);
                    if (next) {
                      track("podcast_episode_play", { episodio: ep.titulo, source_page: sourcePage });
                    }
                  }}
                  aria-expanded={open}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-white hover:border-gold hover:text-gold"
                >
                  <Play className="size-4" aria-hidden />
                  {open ? "Fechar" : "Ouvir"}
                </button>
                <a
                  href={ep.spotify_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("podcast_open_spotify", { episodio: ep.titulo, source_page: sourcePage })
                  }
                  className="text-sm font-semibold text-gold hover:text-white"
                >
                  Spotify
                </a>
              </div>
            </div>
            {open ? (
              <div className="mt-5">
                <SpotifyPlayer url={ep.spotify_url} title={ep.titulo} compact />
              </div>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Faixa curta para a home: episódio mais recente. */
export function LatestEpisodeStrip({ episode }: { episode: PodcastEpisode | null | undefined }) {
  if (!episode) return null;
  const duration = formatDuration(episode.duracao_segundos);
  return (
    <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div>
        <p className="eyebrow text-gold">Podcast Momento Atual</p>
        <h3 className="display-h3 mt-4 text-white">{episode.titulo}</h3>
        <p className="mt-3 text-sm text-white/60">
          <time dateTime={episode.published_at}>{formatEpisodeDate(episode.published_at)}</time>
          {duration ? <> · {duration}</> : null}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-6">
          <a
            href={episode.spotify_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("podcast_open_spotify", { episodio: episode.titulo, source_page: "home" })}
            className="inline-flex min-h-11 items-center text-sm font-semibold text-gold hover:text-white"
          >
            Ouvir no Spotify
          </a>
          <Link
            to="/momento-atual/episodios"
            onClick={() => track("podcast_ver_episodios", { source_page: "home" })}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white/80 hover:text-gold"
          >
            Episódios anteriores
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
      <SpotifyPlayer url={episode.spotify_url} title={episode.titulo} compact className="w-full" />
    </div>
  );
}
