import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import { Container, Section, Eyebrow, SectionHeading, ActionLink, ActionButton } from "./primitives";
import {
  ArticleCard,
  CategoryFilter,
  EditorialHero,
  EditoriaTag,
  FeaturedArticle,
  NewsletterCallout,
} from "./editorial-ui";
import {
  type Article,
  type EditoriaId,
  editoriaMap,
  formatDate,
  getEditoria,
} from "@/content/editorial";
import { ContentBlockView } from "./content-blocks";
import { SpotifyPlayer } from "./spotify";
import type { PodcastEpisode } from "@/lib/podcast-shared";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

/* ================= Página de editoria ================= */
export function EditoriaPage({
  id,
  articles,
  episodes = [],
}: {
  id: EditoriaId;
  articles: Article[];
  episodes?: PodcastEpisode[];
}) {
  const editoria = getEditoria(id);
  const all = articles;
  const [category, setCategory] = useState("Todos");

  const featured = all.find((a) => a.destaque) ?? all[0] ?? null;
  const rest = useMemo(
    () =>
      all
        .filter((a) => a.id !== featured?.id)
        .filter((a) => category === "Todos" || a.categoria === category),
    [all, featured, category],
  );


  return (
    <>
      <EditorialHero
        eyebrow={editoria.eyebrow}
        title={editoria.headline}
        subtitle={editoria.subheadline}
        image={editoria.image}
        imageAlt={editoria.imageAlt}
        tone={editoria.tone}
      />


      {featured ? (
        <Section tone="light">
          <Eyebrow>Matéria principal</Eyebrow>
          <div className="mt-8">
            <FeaturedArticle article={featured} />
          </div>
        </Section>
      ) : null}

      {editoria.podcast ? (
        <section className="surface-navy section-y">
          <Container>
            <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div>
                <Eyebrow>Podcast</Eyebrow>
                <h2 className="display-h3 mt-4 text-white">{editoria.podcast.titulo}</h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
                  {editoria.podcast.descricao}
                </p>
                <a
                  href={editoria.podcast.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    track("podcast_open_spotify", {
                      editoria: editoria.id,
                      source_page: editoria.id,
                    })
                  }
                  className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-white"
                >
                  Ouvir no Spotify
                </a>
              </div>
              <SpotifyPlayer
                url={editoria.podcast.url}
                title={editoria.podcast.titulo}
                className="w-full"
              />
            </div>
            {episodes.length > 0 ? (
              <div className="mt-12">
                <ActionLink
                  to="/momento-atual/episodios"
                  variant="secondaryDark"
                  event="podcast_ver_episodios"
                >
                  Episódios anteriores
                </ActionLink>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {all.length > 1 ? (
        <Section tone="light">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Publicados" title="Fique por dentro" className="max-w-xl" />
            <CategoryFilter
              categories={[...new Set(all.map((a) => a.categoria))]}
              active={category}
              onChange={setCategory}
            />
          </div>
          <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <ArticleCard key={a.id} article={a} sourcePage={editoria.id} />
            ))}
          </div>
          {rest.length === 0 ? (
            <p className="mt-10 text-sm text-muted-foreground">
              Nenhum conteúdo publicado nesta categoria ainda.
            </p>
          ) : null}
        </Section>
      ) : null}


      <NewsletterCallout editoria={editoria} />
    </>
  );
}

/* ================= Template de artigo ================= */
export function ArticlePage({
  article,
  related = [],
}: {
  article: Article;
  related?: Article[];
}) {
  const editoria = editoriaMap[article.editoria];

  const share = async () => {
    track("article_share", {
      editoria: editoria.id,
      categoria: article.categoria,
      artigo: article.slug,
    });
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: article.titulo, url });
        return;
      } catch {
        /* usuário cancelou */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
    }
  };

  return (
    <>
      <section className="surface-ink pt-[130px] pb-16 md:pt-[170px] md:pb-20">
        <Container>
          <nav aria-label="Trilha" className="text-xs text-white/60">
            <Link to="/conteudo" className="hover:text-gold">
              Conteúdo
            </Link>{" "}
            /{" "}
            <Link to={editoria.path} className="hover:text-gold">
              {editoria.name}
            </Link>{" "}
            / <span className="text-white/85">{article.categoria}</span>
          </nav>
          <div className="mt-8 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <EditoriaTag id={article.editoria} />
              <span className="text-[11px] font-semibold tracking-[0.1em] text-white/60 uppercase">
                {article.categoria}
              </span>
            </div>
            <h1 className="display-h2 mt-6 text-white">{article.titulo}</h1>
            <p className="body-lg mt-6 text-white/80">{article.subtitulo}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-white/60">
              <span>{article.autor}</span>
              <span aria-hidden>·</span>
              <time dateTime={article.data}>{formatDate(article.data)}</time>
              <button
                type="button"
                onClick={share}
                className="inline-flex min-h-11 items-center gap-2 text-white hover:text-gold"
              >
                <Share2 className="size-4" aria-hidden /> Compartilhar
              </button>
            </div>
          </div>
        </Container>
      </section>

      <Section tone="light">
        <figure className="mx-auto max-w-4xl">
          <img
            src={article.imagem_principal}
            alt={article.imagem_alt}
            width={1600}
            height={1000}
            className="aspect-[16/9] w-full rounded-xl object-cover"
          />
          <figcaption className="mt-3 text-xs text-muted-foreground">{article.imagem_alt}</figcaption>
        </figure>

        <div className="mx-auto mt-14 max-w-[68ch]">
          {article.conteudo.map((block, i) => (
            <ContentBlockView key={i} block={block} />
          ))}

          {article.video_url ? (
            <div className="mt-12 aspect-video w-full overflow-hidden rounded-xl bg-line">
              <iframe
                src={article.video_url}
                title={article.titulo}
                allowFullScreen
                className="size-full"
              />
            </div>
          ) : null}

          {article.audio_url ? (
            <audio controls src={article.audio_url} className="mt-12 w-full">
              <track kind="captions" />
            </audio>
          ) : null}

          {article.fonte.length > 0 ? (
            <div className="mt-14 border-t border-line pt-8">
              <Eyebrow>Fontes</Eyebrow>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {article.fonte.map((f) => (
                  <li key={f.label}>
                    {f.url ? (
                      <a
                        href={f.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:text-navy hover:underline"
                      >
                        {f.label}
                      </a>
                    ) : (
                      f.label
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {article.cta ? (
            <aside className="mt-14 rounded-xl border border-line bg-offwhite p-8">
              <h3 className="display-h4 text-navy">{article.cta.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {article.cta.description}
              </p>
              <div className="mt-6">
                <ActionLink
                  to={article.cta.to}
                  event="article_cta_click"
                  onClick={() =>
                    track("article_cta_click", {
                      editoria: editoria.id,
                      categoria: article.categoria,
                      artigo: article.slug,
                    })
                  }
                >
                  {article.cta.label}
                </ActionLink>
              </div>
            </aside>
          ) : null}

          <div className="mt-12">
            <Link
              to={editoria.path}
              className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
            >
              <ArrowLeft className="size-4" aria-hidden /> Voltar para {editoria.name}
            </Link>
          </div>
        </div>
      </Section>

      {related.length > 0 ? (
        <Section tone="offwhite">
          <SectionHeading eyebrow="Continue lendo" title="Conteúdos relacionados" />
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} showEditoria sourcePage="artigo" />
            ))}
          </div>
        </Section>
      ) : null}

      <NewsletterCallout editoria={editoria} />
    </>
  );
}

/* ================= Artigo não encontrado ================= */
export function ArticleNotFound({ id }: { id: EditoriaId }) {
  const editoria = getEditoria(id);
  return (
    <Section tone="light" className="pt-[160px]">
      <div className="max-w-2xl">
        <Eyebrow>{editoria.name}</Eyebrow>
        <h1 className="display-h2 mt-4 text-navy">Conteúdo ainda não publicado</h1>
        <p className="body-lg mt-5 text-muted-foreground">
          Este endereço não corresponde a um conteúdo publicado nesta editoria.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ActionLink to={editoria.path}>Ver {editoria.name}</ActionLink>
          <ActionLink to="/conteudo" variant="secondary">
            Ir para Conteúdo
          </ActionLink>
        </div>
      </div>
    </Section>
  );
}

export { ActionButton };
