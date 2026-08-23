/**
 * Player do Spotify — embed oficial (open.spotify.com/embed).
 * Aceita URL de show, episódio, playlist, álbum ou faixa e converte
 * para a URL de embed. Nada de script externo: apenas iframe.
 */

export function spotifyEmbedUrl(input: string): string | null {
  if (!input) return null;
  const value = input.trim();

  // spotify:show:ID
  const uri = value.match(/^spotify:(show|episode|playlist|album|track):([A-Za-z0-9]+)/);
  if (uri) return `https://open.spotify.com/embed/${uri[1]}/${uri[2]}`;

  try {
    const url = new URL(value);
    if (!url.hostname.endsWith("spotify.com")) return null;
    const parts = url.pathname.split("/").filter(Boolean);
    // suporta /intl-pt/show/ID e /embed/show/ID
    const kinds = ["show", "episode", "playlist", "album", "track"];
    const idx = parts.findIndex((p) => kinds.includes(p));
    if (idx === -1 || !parts[idx + 1]) return null;
    const id = parts[idx + 1].split("?")[0];
    return `https://open.spotify.com/embed/${parts[idx]}/${id}`;
  } catch {
    return null;
  }
}

export function SpotifyPlayer({
  url,
  title = "Player do Spotify",
  compact = false,
  className,
}: {
  url: string;
  title?: string;
  compact?: boolean;
  className?: string;
}) {
  const src = spotifyEmbedUrl(url);
  if (!src) return null;
  return (
    <iframe
      src={src}
      title={title}
      loading="lazy"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      style={{ borderRadius: "12px" }}
      className={className}
      width="100%"
      height={compact ? 152 : 352}
      frameBorder={0}
    />
  );
}
