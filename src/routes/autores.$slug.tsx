import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Section, Eyebrow } from "@/components/atual/primitives";
import { ArticleCard } from "@/components/atual/editorial-ui";
import { pageHead, breadcrumbSchema } from "@/lib/seo";
import { absoluteUrl, ORG_ID } from "@/config/site";
import { getAuthorProfile } from "@/lib/editorial.functions";

export const Route = createFileRoute("/autores/$slug")({
  loader: async ({ params }) => await getAuthorProfile({ data: { slug: params.slug } }),
  head: ({ params, loaderData }) => {
    const author = loaderData?.author;
    if (!author) {
      return {
        meta: [
          { title: "Autor não encontrado | Atual Câmbio" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    const path = `/autores/${params.slug}`;
    return pageHead({
      path,
      title: `${author.nome} | Autor na Atual Câmbio`,
      description:
        author.bio ??
        `Conteúdos sobre câmbio, economia e mercados assinados por ${author.nome} na Atual Câmbio.`,
      type: "profile",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          mainEntity: {
            "@type": "Person",
            "@id": `${absoluteUrl(path)}#person`,
            name: author.nome,
            ...(author.cargo ? { jobTitle: author.cargo } : {}),
            ...(author.bio ? { description: author.bio } : {}),
            ...(author.foto_url ? { image: author.foto_url } : {}),
            url: absoluteUrl(path),
            worksFor: { "@id": ORG_ID },
            ...(author.links.length ? { sameAs: author.links.map((l) => l.url) } : {}),
          },
        },
        breadcrumbSchema([
          { name: "Conteúdo", path: "/conteudo" },
          { name: author.nome, path },
        ]),
      ],
    });
  },
  errorComponent: () => <AuthorMissing />,
  notFoundComponent: () => <AuthorMissing />,
  component: AuthorPage,
});

function AuthorMissing() {
  return (
    <div className="px-6 pt-40 pb-24 text-center text-navy">
      Autor não encontrado.{" "}
      <Link to="/conteudo" className="underline">
        Ver conteúdos
      </Link>
    </div>
  );
}

function AuthorPage() {
  const data = Route.useLoaderData();
  if (!data) return <AuthorMissing />;
  const { author, articles } = data;

  return (
    <>
      <section className="surface-navy pt-32 pb-16 md:pt-40 md:pb-20">
        <Container>
          <nav aria-label="Trilha" className="text-xs text-white/60">
            <Link to="/conteudo" className="hover:text-gold">
              Conteúdo
            </Link>{" "}
            / <span className="text-white/85">{author.nome}</span>
          </nav>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-center">
            {author.foto_url ? (
              <img
                src={author.foto_url}
                alt={`Foto de ${author.nome}`}
                width={128}
                height={128}
                className="size-28 shrink-0 rounded-full object-cover"
              />
            ) : null}
            <div className="max-w-2xl">
              <Eyebrow>Autoria</Eyebrow>
              <h1 className="display-h2 mt-4 text-white">{author.nome}</h1>
              {author.cargo ? <p className="mt-3 text-sm text-gold">{author.cargo}</p> : null}
              {author.bio ? <p className="body-lg mt-5 text-white/80">{author.bio}</p> : null}
              {author.links.length ? (
                <ul className="mt-6 flex flex-wrap gap-4 text-sm">
                  {author.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white/70 underline-offset-4 hover:text-gold hover:underline"
                      >
                        {link.label ?? link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </Container>
      </section>

      <Section tone="light">
        <h2 className="display-h3 text-navy">Conteúdos de {author.nome}</h2>
        {articles.length ? (
          <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} showEditoria />
            ))}
          </div>
        ) : (
          <p className="mt-6 text-muted-foreground">
            Nenhum conteúdo publicado por este autor no momento.
          </p>
        )}
      </Section>
    </>
  );
}
