import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight, Clock } from "lucide-react";
import { Container, Eyebrow, ActionLink } from "./primitives";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import {
  type Article,
  type Editoria,
  type EditorialTone,
  type EditorialSection,
  editoriaMap,
  formatDate,
} from "@/content/editorial";

/* ---------- Hero editorial reutilizável ---------- */
export function EditorialHero({
  eyebrow,
  title,
  subtitle,
  image,
  mobileImage,
  imageAlt,
  tone = "editorial",
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  mobileImage?: string | undefined;
  imageAlt: string;
  tone?: EditorialTone;
}) {
  const imgClass = cn(
    "absolute inset-0 size-full object-cover",
    tone === "wellness" ? "opacity-95" : "opacity-90",
  );
  return (
    <section className="relative overflow-hidden bg-black">
      {mobileImage ? (
        <>
          <img
            src={mobileImage}
            alt={imageAlt}
            width={1080}
            height={1350}
            className={cn(imgClass, "md:hidden")}
          />
          <img
            src={image}
            alt=""
            aria-hidden="true"
            width={1600}
            height={1000}
            className={cn(imgClass, "hidden md:block")}
          />
        </>
      ) : (
        <img src={image} alt={imageAlt} width={1600} height={1000} className={imgClass} />
      )}

      <div
        className={cn(
          "absolute inset-0",
          tone === "cultural"
            ? "bg-gradient-to-r from-black via-black/75 to-black/20"
            : tone === "wellness"
              ? "bg-gradient-to-r from-black/90 via-black/60 to-black/10"
              : "bg-gradient-to-r from-black via-black/80 to-black/25",
        )}
      />
      <Container>
        <div className="relative max-w-2xl pt-[140px] pb-20 md:pt-[190px] md:pb-28">
          <p className="font-display text-xs font-bold tracking-[0.14em] text-gold uppercase sm:text-sm">
            {eyebrow}
          </p>
          <h1 className="hero-title mt-6 text-white">{title}</h1>
          <p className="hero-copy mt-6 text-white/85">{subtitle}</p>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Selo de editoria ---------- */
export function EditoriaTag({ id, className }: { id: Article["editoria"]; className?: string }) {
  const editoria = editoriaMap[id];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-gold/40 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-gold uppercase",
        className,
      )}
    >
      {editoria.name}
    </span>
  );
}

/* ---------- Card de artigo ---------- */
export function ArticleCard({
  article,
  showEditoria = false,
  sourcePage,
}: {
  article: Article;
  showEditoria?: boolean;
  sourcePage?: string;
}) {
  const editoria = editoriaMap[article.editoria];
  return (
    <article className="group flex flex-col">
      <Link
        to={`${editoria.path}/$slug`}
        params={{ slug: article.slug }}
        onClick={() =>
          track("article_view", {
            editoria: editoria.id,
            categoria: article.categoria,
            artigo: article.slug,
            source_page: sourcePage ?? "",
          })
        }
        className="block overflow-hidden rounded-xl bg-line"
      >
        <img
          src={article.imagem_principal}
          alt={article.imagem_alt}
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </Link>
      <div className="mt-6 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-3">
          {showEditoria ? <EditoriaTag id={article.editoria} /> : null}
          <Eyebrow>{article.categoria}</Eyebrow>
        </div>
        <h3 className="display-h4 mt-3 text-navy">
          <Link
            to={`${editoria.path}/$slug`}
            params={{ slug: article.slug }}
            className="hover:text-gold-soft"
          >
            {article.titulo}
          </Link>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{article.resumo}</p>
        <div className="mt-5 flex items-center gap-4">
          <Link
            to={`${editoria.path}/$slug`}
            params={{ slug: article.slug }}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-navy hover:text-gold-soft"
          >
            Ler <ArrowUpRight className="size-4 text-gold" aria-hidden />
          </Link>
          <span className="text-xs text-muted-foreground">{formatDate(article.data)}</span>
        </div>
      </div>
    </article>
  );
}

/* ---------- Matéria principal ---------- */
export function FeaturedArticle({ article }: { article: Article }) {
  const editoria = editoriaMap[article.editoria];
  return (
    <article className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <Link
        to={`${editoria.path}/$slug`}
        params={{ slug: article.slug }}
        className="group block overflow-hidden rounded-xl bg-line"
      >
        <img
          src={article.imagem_principal}
          alt={article.imagem_alt}
          width={1600}
          height={1000}
          className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </Link>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <EditoriaTag id={article.editoria} />
          <Eyebrow>{article.categoria}</Eyebrow>
        </div>
        <h2 className="display-h2 mt-4 text-navy">
          <Link
            to={`${editoria.path}/$slug`}
            params={{ slug: article.slug }}
            className="hover:text-gold-soft"
          >
            {article.titulo}
          </Link>
        </h2>
        <p className="body-lg mt-5 text-muted-foreground">{article.subtitulo}</p>
        <p className="mt-6 text-xs text-muted-foreground">
          {article.autor} · {formatDate(article.data)}
        </p>
        <div className="mt-7">
          <ActionLink
            to={`${editoria.path}/${article.slug}`}
            variant="secondary"
            event="article_view"
          >
            Ler matéria
          </ActionLink>
        </div>
      </div>
    </article>
  );
}

/* ---------- Pauta em preparação ---------- */
export function ComingSoonCard({
  title,
  description,
  categoria,
  dark = false,
}: {
  title: string;
  description: string;
  categoria: string;
  dark?: boolean;
}) {
  return (
    <article
      className={cn(
        "flex flex-col rounded-xl border p-7",
        dark ? "border-white/12 bg-white/5" : "border-line bg-offwhite",
      )}
    >
      <div className="flex items-center gap-2">
        <Clock className="size-4 text-gold" aria-hidden />
        <span className="text-[11px] font-semibold tracking-[0.14em] text-gold uppercase">
          Em breve
        </span>
      </div>
      <p
        className={cn(
          "mt-4 text-[11px] font-semibold tracking-[0.1em] uppercase",
          dark ? "text-white/50" : "text-muted-foreground",
        )}
      >
        {categoria}
      </p>
      <h3 className={cn("display-h4 mt-2", dark ? "text-white" : "text-navy")}>{title}</h3>
      <p
        className={cn(
          "mt-3 text-sm leading-relaxed",
          dark ? "text-white/70" : "text-muted-foreground",
        )}
      >
        {description}
      </p>
    </article>
  );
}

/* ---------- Filtro por categoria ---------- */
export function CategoryFilter({
  categories,
  active,
  onChange,
  dark = false,
}: {
  categories: string[];
  active: string;
  onChange: (value: string) => void;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
      {["Todos", ...categories].map((cat) => {
        const isActive = active === cat;
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className={cn(
              "min-h-10 rounded-full border px-4 text-sm transition-colors",
              isActive
                ? "border-gold bg-gold text-gold-foreground"
                : dark
                  ? "border-white/20 text-white/75 hover:border-gold hover:text-gold"
                  : "border-line text-navy hover:border-navy",
            )}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Bloco de editoria (hub) ---------- */
export function EditoriaBlock({
  editoria,
  articles,
  index,
  reverse = false,
}: {
  editoria: Editoria;
  articles: Article[];
  index: number;
  reverse?: boolean;
}) {
  const light = editoria.tone === "wellness";
  return (
    <section
      className={cn(
        "section-y",
        editoria.tone === "editorial"
          ? "surface-ink"
          : editoria.tone === "cultural"
            ? "surface-navy"
            : "surface-offwhite",
      )}
      id={editoria.id}
    >
      <Container>
        <div
          className={cn(
            "grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-20",
            reverse && "lg:[&>*:first-child]:order-2",
          )}
        >
          <div className="relative">
            <img
              src={editoria.image}
              alt={editoria.imageAlt}
              width={1600}
              height={1200}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-xl object-cover lg:aspect-[4/4.4]"
            />
            <span
              className={cn(
                "font-display absolute -top-4 left-4 text-6xl leading-none font-bold tracking-[-0.04em] md:-top-6 md:text-7xl",
                light ? "text-navy/15" : "text-white/20",
              )}
              aria-hidden
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div>
            <p className="font-display text-xs font-bold tracking-[0.14em] text-gold uppercase">
              {editoria.eyebrow}
            </p>
            <h2 className={cn("display-h2 mt-4", light ? "text-navy" : "text-white")}>
              {editoria.name}
            </h2>
            <p
              className={cn(
                "mt-4 text-base font-semibold",
                light ? "text-navy/70" : "text-white/70",
              )}
            >
              {editoria.shortDescription}
            </p>
            <p className={cn("body-lg mt-6", light ? "text-muted-foreground" : "text-white/80")}>
              {editoria.promise}
            </p>

            <ul className="mt-8 flex flex-wrap gap-2">
              {editoria.categories.slice(0, 5).map((cat) => (
                <li
                  key={cat}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    light ? "border-line text-muted-foreground" : "border-white/20 text-white/70",
                  )}
                >
                  {cat}
                </li>
              ))}
            </ul>

            <div className="mt-10">
              <p
                className={cn(
                  "text-[11px] font-semibold tracking-[0.14em] uppercase",
                  light ? "text-muted-foreground" : "text-white/50",
                )}
              >
                {articles.length > 0 ? "Conteúdos recentes" : "Na pauta"}
              </p>
              <div className="mt-4 space-y-4">
                {articles.length > 0
                  ? articles.slice(0, 3).map((a) => (
                      <Link
                        key={a.id}
                        to={`${editoria.path}/$slug`}
                        params={{ slug: a.slug }}
                        onClick={() =>
                          track("article_view", {
                            editoria: editoria.id,
                            categoria: a.categoria,
                            artigo: a.slug,
                            source_page: "conteudo",
                          })
                        }
                        className={cn(
                          "flex items-start justify-between gap-6 border-t pt-4 text-sm transition-colors",
                          light
                            ? "border-line text-navy hover:text-gold-soft"
                            : "border-white/12 text-white hover:text-gold",
                        )}
                      >
                        <span className="font-semibold">{a.titulo}</span>
                        <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />
                      </Link>
                    ))
                  : (editoria.sections ?? []).slice(0, 4).map((s) => (
                      <div
                        key={s.id}
                        className={cn(
                          "flex items-start justify-between gap-6 border-t pt-4 text-sm",
                          light ? "border-line text-navy" : "border-white/12 text-white/85",
                        )}
                      >
                        <span className="font-semibold">{s.title}</span>
                        <span className="shrink-0 text-[11px] font-semibold tracking-[0.12em] text-gold uppercase">
                          Em breve
                        </span>
                      </div>
                    ))}
              </div>
            </div>

            <div className="mt-10">
              <ActionLink
                to={editoria.path}
                variant={light ? "secondary" : "secondaryDark"}
                event="editorial_selected"
                onClick={() =>
                  track("editorial_selected", { editoria: editoria.id, source_page: "conteudo" })
                }
              >
                Entrar em {editoria.name}
              </ActionLink>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Busca de conteúdo ---------- */
export function ContentSearch({ onSearch }: { onSearch: (q: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="max-w-xl">
      <label htmlFor="busca-conteudo" className="text-sm font-semibold text-white/80">
        Buscar conteúdo
      </label>
      <input
        id="busca-conteudo"
        type="search"
        value={value}
        placeholder="Buscar por tema, editoria ou palavra-chave"
        onChange={(e) => {
          setValue(e.target.value);
          onSearch(e.target.value);
        }}
        className="mt-3 min-h-12 w-full rounded-sm border border-white/20 bg-white/5 px-4 text-base text-white placeholder:text-white/40 focus:border-gold focus:outline-none"
      />
    </div>
  );
}

/* ---------- Chamada para a newsletter ---------- */
export function NewsletterCallout({ editoria }: { editoria?: Editoria }) {
  return (
    <section className="surface-navy section-y">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <Eyebrow>Newsletter</Eyebrow>
            <h2 className="display-h2 mt-4 text-white">Escolha o que quer acompanhar.</h2>
            <p className="body-lg mt-5 text-white/80">
              {editoria
                ? `Receba ${editoria.name} e outras editoriais da Atual conforme os temas que fazem sentido para você.`
                : "Receba conteúdos da Atual de acordo com os temas que fazem sentido para você."}
            </p>
          </div>
          <ActionLink to="/newsletter" event="newsletter_view">
            Escolher preferências <ArrowRight className="size-4" aria-hidden />
          </ActionLink>
        </div>
      </Container>
    </section>
  );
}

/* ---------- Blocos conceituais de uma editoria ---------- */
export function EditorialSections({
  sections,
  dark = false,
}: {
  sections: EditorialSection[];
  dark?: boolean;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {sections.map((s) => (
        <article
          key={s.id}
          className={cn(
            "group flex flex-col overflow-hidden rounded-xl border",
            dark ? "border-white/12 bg-white/[0.04]" : "border-line bg-offwhite",
          )}
        >
          {s.image ? (
            <div className="relative overflow-hidden">
              <img
                src={s.image}
                alt={s.imageAlt ?? ""}
                width={1408}
                height={1056}
                loading="lazy"
                className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <span className="absolute top-4 left-4 rounded-full bg-black/70 px-3 py-1 text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">
                Em breve
              </span>
            </div>
          ) : (
            <div
              className={cn(
                "flex aspect-[16/10] flex-col justify-between p-7",
                dark
                  ? "bg-[linear-gradient(140deg,rgba(255,255,255,0.10),rgba(255,255,255,0))]"
                  : "bg-[linear-gradient(140deg,rgba(1,24,58,0.07),rgba(1,24,58,0))]",
              )}
            >
              <span className="text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">
                Em breve
              </span>
              <span
                className={cn(
                  "font-display text-3xl leading-[1.05] font-bold tracking-[-0.02em]",
                  dark ? "text-white/25" : "text-navy/20",
                )}
              >
                {s.label}
              </span>
            </div>
          )}
          <div className="flex flex-1 flex-col p-7">
            <h3 className={cn("display-h4", dark ? "text-white" : "text-navy")}>{s.title}</h3>
            <p
              className={cn(
                "mt-3 text-sm leading-relaxed",
                dark ? "text-white/70" : "text-muted-foreground",
              )}
            >
              {s.description}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
