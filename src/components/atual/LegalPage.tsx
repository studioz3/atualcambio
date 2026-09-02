import type { ReactNode } from "react";
import { Download } from "lucide-react";
import { Container, Eyebrow, Section } from "./primitives";
import { SpecialistCta } from "./blocks";

/** Converte `**trecho**` em <strong> */
function richText(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
      <strong key={i} className="font-semibold text-navy">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}

export type LegalNode =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

export type LegalBlock = {
  id: string;
  title: string;
  /** Estrutura nova, fiel ao documento original */
  body?: LegalNode[];
  /** Estrutura legada */
  paragraphs?: string[];
  items?: string[];
};

function toNodes(block: LegalBlock): LegalNode[] {
  if (block.body) return block.body;
  const nodes: LegalNode[] = (block.paragraphs ?? []).map((text) => ({ type: "p", text }) as const);
  if (block.items?.length) nodes.push({ type: "ul", items: block.items });
  return nodes;
}

export function LegalPage({
  eyebrow,
  title,
  intro,
  updatedNote,
  blocks,
  footnote,
  download,
}: {
  eyebrow: string;
  title: string;
  intro: string | string[];
  updatedNote?: string;
  blocks: LegalBlock[];
  footnote?: ReactNode;
  download?: { href: string; label: string; description?: string; fileName?: string };
}) {
  const introParagraphs = Array.isArray(intro) ? intro : [intro];

  return (
    <>
      <section className="surface-navy">
        <Container>
          <div className="max-w-3xl py-20 md:py-28">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-display mt-6 text-[32px] leading-[1.1] font-bold text-white md:text-[48px]">
              {title}
            </h1>
            {introParagraphs.map((text) => (
              <p key={text} className="mt-6 text-lg leading-relaxed text-white/75">
                {text}
              </p>
            ))}
            {updatedNote ? <p className="mt-6 text-xs text-white/45">{updatedNote}</p> : null}
          </div>
        </Container>
      </section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Índice" className="lg:sticky lg:top-28 lg:self-start">
            <p className="eyebrow text-muted-foreground">Índice</p>
            <ul className="mt-5 space-y-3">
              {blocks.map((block) => (
                <li key={block.id}>
                  <a
                    href={`#${block.id}`}
                    className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-navy hover:underline"
                  >
                    {block.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="max-w-3xl space-y-12">
            {blocks.map((block) => (
              <article key={block.id} id={block.id} className="scroll-mt-28">
                <h2 className="text-xl font-bold text-navy md:text-2xl">{block.title}</h2>
                {toNodes(block).map((node, i) =>
                  node.type === "p" ? (
                    <p
                      key={`${block.id}-p-${i}`}
                      className="mt-4 text-base leading-[1.65] text-muted-foreground"
                    >
                      {richText(node.text)}
                    </p>
                  ) : (
                    <ul key={`${block.id}-ul-${i}`} className="mt-5 space-y-3">
                      {node.items.map((item) => (
                        <li
                          key={item}
                          className="border-l-2 border-gold/60 pl-4 text-sm leading-relaxed text-muted-foreground"
                        >
                          {richText(item)}
                        </li>
                      ))}
                    </ul>
                  ),
                )}
              </article>
            ))}

            {download ? (
              <div className="rounded-2xl border border-navy/10 bg-navy/[0.03] p-6 md:p-8">
                <h2 className="text-xl font-bold text-navy">Documento oficial</h2>
                {download.description ? (
                  <p className="mt-3 text-base leading-[1.65] text-muted-foreground">
                    {download.description}
                  </p>
                ) : null}
                <a
                  href={download.href}
                  download={download.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-gold-foreground transition-opacity hover:opacity-90"
                >
                  <Download className="size-4 shrink-0" aria-hidden="true" />
                  {download.label}
                </a>
              </div>
            ) : null}

            {footnote ? (
              <p className="border-t border-navy/10 pt-8 text-xs leading-relaxed text-muted-foreground">
                {footnote}
              </p>
            ) : null}
          </div>
        </div>
      </Section>

      <SpecialistCta />
    </>
  );
}
