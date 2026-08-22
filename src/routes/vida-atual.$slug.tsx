import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, ArticleNotFound } from "@/components/atual/editorial-pages";
import { SITE_URL, articleBySlug } from "@/content/editorial";

export const Route = createFileRoute("/vida-atual/$slug")({
  head: ({ params }) => {
    const article = articleBySlug("vida-atual", params.slug);
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
  component: VidaAtualArtigo,
});

function VidaAtualArtigo() {
  const { slug } = Route.useParams();
  const article = articleBySlug("vida-atual", slug);
  if (!article) return <ArticleNotFound id="vida-atual" />;
  return <ArticlePage article={article} />;
}
