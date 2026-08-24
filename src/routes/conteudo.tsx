import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import edtHub from "@/assets/edt-hub.jpg";
import { Container, Section, SectionHeading } from "@/components/atual/primitives";
import {
  ArticleCard,
  ContentSearch,
  EditoriaBlock,
  NewsletterCallout,
} from "@/components/atual/editorial-ui";
import { SpecialistCta } from "@/components/atual/blocks";
import { SITE_URL, editorias, editoriaMap, type Article } from "@/content/editorial";
import { getPublishedList } from "@/lib/editorial.functions";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/conteudo")({
  head: () => ({
    meta: [
      { title: "Conteúdo para quem é Atual | Atual Câmbio" },
      {
        name: "description",
        content:
          "Economia, cultura, tecnologia e bem-estar em três editorias: Momento Atual, Cripto Wine e Vida Atual.",
      },
      { property: "og:title", content: "Conteúdo para quem é Atual | Atual Câmbio" },
      {
        property: "og:description",
        content:
          "Economia, cultura, tecnologia e bem-estar para quem quer entender o mundo por diferentes perspectivas.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/conteudo` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/conteudo` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Conteúdo Atual",
          url: `${SITE_URL}/conteudo`,
          hasPart: editorias.map((e) => ({
            "@type": "CreativeWorkSeries",
            name: e.name,
            url: `${SITE_URL}${e.path}`,
          })),
        }),
      },
    ],
  }),
  loader: async () => await getPublishedList({ data: {} }),
  errorComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">
      Não foi possível carregar os conteúdos agora.
    </div>
  ),
  notFoundComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">Página não encontrada.</div>
  ),
  component: Conteudo,
});

function Conteudo() {
  const recent = Route.useLoaderData();
  const [results, setResults] = useState<Article[] | null>(null);

  const search = (q: string) => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return setResults(null);
    setResults(
      recent.filter((a) =>
        [a.titulo, a.subtitulo, a.resumo, a.categoria, editoriaMap[a.editoria].name]
          .join(" ")
          .toLowerCase()
          .includes(term),
      ),
    );
  };

  useEffect(() => {
    track("content_hub_view", { source_page: "conteudo" });
  }, []);

  return (
    <>
      <section className="relative overflow-hidden bg-black">
        <img
          src={edtHub}
          alt="Pessoas lendo e conversando em um espaço contemporâneo com um mapa-múndi ao fundo"
          width={1600}
          height={1000}
          className="absolute inset-0 size-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-black/25" />
        <Container>
          <div className="relative max-w-2xl pt-[140px] pb-20 md:pt-[190px] md:pb-28">
            <p className="font-display text-xs font-bold tracking-[0.14em] text-gold uppercase sm:text-sm">
              Conteúdo
            </p>
            <h1 className="hero-title mt-6 text-white">Conteúdo para quem é Atual.</h1>
            <p className="hero-copy mt-6 text-white/85">
              Economia, cultura, tecnologia e bem-estar para quem quer entender o mundo por
              diferentes perspectivas.
            </p>
            <div className="mt-10">
              <ContentSearch
                onSearch={search}
              />
            </div>
          </div>
        </Container>
      </section>

      {results ? (
        <Section tone="light">
          <SectionHeading
            eyebrow="Busca"
            title={
              results.length > 0
                ? `${results.length} conteúdo${results.length > 1 ? "s" : ""} encontrado${results.length > 1 ? "s" : ""}`
                : "Nenhum conteúdo encontrado"
            }
            description={
              results.length === 0
                ? "Tente outro termo. A busca cobre as três editorias e apenas conteúdos publicados."
                : undefined
            }
          />
          {results.length > 0 ? (
            <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
              {results.map((a) => (
                <ArticleCard key={a.id} article={a} showEditoria sourcePage="busca" />
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}

      <section className="surface-navy border-b border-white/10 py-12 md:py-16">
        <Container>
          <p className="font-display text-xs font-bold tracking-[0.14em] text-gold uppercase">
            Três editorias
          </p>
          <div className="mt-8 grid gap-8 md:grid-cols-3">
            {editorias.map((e) => (
              <a
                key={e.id}
                href={`#${e.id}`}
                className="group border-t border-white/15 pt-5 transition-colors hover:border-gold"
              >
                <h2 className="display-h4 text-white group-hover:text-gold">{e.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{e.shortDescription}</p>
              </a>
            ))}
          </div>
        </Container>
      </section>

      {editorias.map((editoria, i) => (
        <EditoriaBlock
          key={editoria.id}
          editoria={editoria}
          articles={recent.filter((a) => a.editoria === editoria.id)}
          index={i}
          reverse={i % 2 === 1}
        />
      ))}

      {recent.length > 0 ? (
        <Section tone="light">
          <SectionHeading
            eyebrow="Publicados"
            title="Fique por dentro"
            description="Conteúdos publicados nas editorias da Atual."
          />
          <div className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {recent.slice(0, 6).map((a) => (
              <ArticleCard key={a.id} article={a} showEditoria sourcePage="conteudo" />
            ))}
          </div>
        </Section>
      ) : null}

      <NewsletterCallout />

      <SpecialistCta context="Conteúdo" />
    </>
  );
}
