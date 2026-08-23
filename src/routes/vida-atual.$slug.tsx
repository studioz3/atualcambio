import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, ArticleNotFound } from "@/components/atual/editorial-pages";
import { SITE_URL } from "@/content/editorial";
import { getPublishedArticle } from "@/lib/editorial.functions";

export const Route = createFileRoute("/vida-atual/$slug")({
  loader: async ({ params }) =>
    await getPublishedArticle({ data: { editoria: "vida-atual", slug: params.slug } }),
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return { meta: [{ title: "Conteúdo não encontrado | Vida Atual" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${SITE_URL}/vida-atual/${article.slug}`;
    return {
      meta: [
        { title: article.seo_title },
        { name: "description", content: article.meta_description },
        { property: "og:title", content: article.seo_title },
        { property: "og:description", content: article.meta_description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.titulo,
            description: article.meta_description,
            datePublished: article.data,
            dateModified: article.updated_at,
            author: { "@type": "Organization", name: article.autor },
            publisher: { "@type": "Organization", name: "Atual Câmbio" },
            mainEntityOfPage: url,
            articleSection: "Vida Atual",
          }),
        },
      ],
    };
  },
  errorComponent: () => <ArticleNotFound id="vida-atual" />,
  notFoundComponent: () => <ArticleNotFound id="vida-atual" />,
  component: VidaAtualArtigo,
});

function VidaAtualArtigo() {
  const data = Route.useLoaderData();
  if (!data) return <ArticleNotFound id="vida-atual" />;
  return <ArticlePage article={data.article} related={data.related} />;
}
