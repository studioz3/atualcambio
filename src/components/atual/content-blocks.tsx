import type { ReactNode } from "react";
import type { CmsBlock } from "@/lib/cms-shared";
import { SpotifyPlayer } from "./spotify";

/**
 * Formatação inline segura: **negrito**, *itálico* e [texto](url).
 * Nada de HTML cru — o texto é sempre tratado como dado.
 */
export function RichText({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]*)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text))) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    if (match[1]) nodes.push(<strong key={key++} className="font-semibold text-navy">{match[1]}</strong>);
    else if (match[2]) nodes.push(<em key={key++}>{match[2]}</em>);
    else if (match[3])
      nodes.push(
        <a
          key={key++}
          href={match[4]}
          {...(match[4]?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="text-navy underline underline-offset-4 hover:text-gold-soft"
        >
          {match[3]}
        </a>,
      );
    last = regex.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
}

export function ContentBlockView({ block }: { block: CmsBlock }) {
  switch (block.type) {
    case "h2":
    case "subtitulo":
      return (
        <h2 className="display-h3 mt-12 text-navy first:mt-0">
          <RichText text={block.text} />
        </h2>
      );
    case "h3":
      return (
        <h3 className="display-h4 mt-10 text-navy">
          <RichText text={block.text} />
        </h3>
      );
    case "lista":
      return (
        <ul className="mt-6 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-base leading-relaxed text-graphite">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-gold" aria-hidden />
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "lista_numerada":
      return (
        <ol className="mt-6 space-y-3">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-base leading-relaxed text-graphite">
              <span className="font-semibold text-gold">{i + 1}.</span>
              <span>
                <RichText text={item} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "citacao":
      return (
        <blockquote className="mt-12 border-l-2 border-gold pl-6 text-xl leading-snug font-semibold text-navy">
          <RichText text={block.text} />
        </blockquote>
      );
    case "destaque":
      return (
        <p className="mt-10 rounded-xl border border-line bg-offwhite p-6 text-base leading-relaxed text-navy">
          <RichText text={block.text} />
        </p>
      );
    case "divisor":
      return <hr className="mt-12 border-line" />;
    case "spotify":
      return (
        <div className="mt-12">
          <SpotifyPlayer url={block.url} title={block.titulo ?? "Player do Spotify"} />
        </div>
      );
    case "imagem":
      return (
        <figure className="mt-12">
          <img
            src={block.url}
            alt={block.alt}
            loading="lazy"
            className="w-full rounded-xl object-cover"
          />
          {block.legenda ? (
            <figcaption className="mt-3 text-xs text-muted-foreground">{block.legenda}</figcaption>
          ) : null}
        </figure>
      );
    default:
      return (
        <p className="mt-6 text-base leading-relaxed text-graphite">
          <RichText text={(block as { text?: string }).text ?? ""} />
        </p>
      );
  }
}
