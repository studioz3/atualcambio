import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { absoluteUrl } from "@/config/site";
import { ArrowLeft, Play } from "lucide-react";
import { Container, Eyebrow } from "@/components/atual/primitives";
import { SpotifyPlayer } from "@/components/atual/spotify";
import { getPodcastEpisodesWithArt } from "@/lib/podcast.functions";
import { formatDuration, formatEpisodeDate } from "@/lib/podcast-shared";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/momento-atual/episodios")({
  head: () =>
    pageHead({
      path: "/momento-atual/episodios",
      title: "Episódios do Momento Atual | Podcast da Atual Câmbio",
      description: "Todos os episódios do podcast Momento Atual: economia, câmbio e mercados comentados semana a semana pela Atual Câmbio.",
    }),
  loader: async () => await getPodcastEpisodesWithArt({ data: { editoria: "momento-atual" } }),
  errorComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">
      Não foi possível carregar os episódios agora.
    </div>
  ),
  notFoundComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">Episódios não encontrados.</div>
  ),
  component: EpisodesPage,
});

function EpisodesPage() {
  const episodes = Route.useLoaderData();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="surface-navy pt-32 pb-24 md:pt-40">
      <Container>
        <Link
          to="/momento-atual"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/70 hover:text-gold"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Momento Atual
        </Link>
        <div className="mt-8">
          <Eyebrow>Podcast</Eyebrow>
        </div>
        <h1 className="display-h2 mt-3 text-white">Todos os episódios</h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
          O programa da Atual Câmbio sobre economia, câmbio e mercados. Ouça direto por aqui ou
          acompanhe no Spotify.
        </p>

        {episodes.length === 0 ? (
          <p className="mt-12 text-sm text-white/60">Nenhum episódio publicado ainda.</p>
        ) : (
          <ul className="mt-12 grid gap-6 md:grid-cols-2">
            {episodes.map((ep) => {
              const open = openId === ep.id;
              const duration = formatDuration(ep.duracao_segundos);
              return (
                <li
                  key={ep.id}
                  className="rounded-2xl border border-white/12 bg-white/5 p-5 transition-colors hover:border-white/25"
                >
                  <div className="flex gap-5">
                    {ep.thumbnail_url ? (
                      <img
                        src={ep.thumbnail_url}
                        alt={`Capa do episódio ${ep.titulo}`}
                        loading="lazy"
                        className="size-24 shrink-0 rounded-xl object-cover md:size-28"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-white">{ep.titulo}</h2>
                      <p className="mt-1 text-xs text-white/55">
                        <time dateTime={ep.published_at}>{formatEpisodeDate(ep.published_at)}</time>
                        {duration ? <> · {duration}</> : null}
                      </p>
                      {ep.descricao ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/70">
                          {ep.descricao}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap items-center gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            const next = open ? null : ep.id;
                            setOpenId(next);
                            if (next) {
                              track("podcast_episode_play", {
                                episodio: ep.titulo,
                                source_page: "momento-atual-episodios",
                              });
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
                            track("podcast_open_spotify", {
                              episodio: ep.titulo,
                              source_page: "momento-atual-episodios",
                            })
                          }
                          className="text-sm font-semibold text-gold hover:text-white"
                        >
                          Spotify
                        </a>
                      </div>
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
        )}
      </Container>
    </div>
  );
}
