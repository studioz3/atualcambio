import type { ReactNode } from "react";
import { Container, Eyebrow, Section } from "./primitives";
import { SpecialistCta } from "./blocks";

export type LegalBlock = {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
};

export function LegalPage({
  eyebrow,
  title,
  intro,
  updatedNote,
  blocks,
  footnote,
}: {
  eyebrow: string;
  title: string;
  intro: string;
  updatedNote: string;
  blocks: LegalBlock[];
  footnote?: ReactNode;
}) {
  return (
    <>
      <section className="surface-navy">
        <Container>
          <div className="max-w-3xl py-20 md:py-28">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-display mt-6 text-[32px] leading-[1.1] font-bold text-white md:text-[48px]">
              {title}
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-white/75">{intro}</p>
            <p className="mt-6 text-xs text-white/45">{updatedNote}</p>
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
                {block.paragraphs.map((text) => (
                  <p key={text} className="mt-4 text-base leading-[1.65] text-muted-foreground">
                    {text}
                  </p>
                ))}
                {block.items ? (
                  <ul className="mt-5 space-y-3">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="border-l-2 border-gold/60 pl-4 text-sm leading-relaxed text-muted-foreground"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}

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
