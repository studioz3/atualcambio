import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, ArticleNotFound } from "@/components/atual/editorial-pages";
import { SITE_URL, articleBySlug } from "@/content/editorial";

export const Route = createFileRoute("/cripto-wine/$slug")({
  head: ({ params }) => {
    const article = articleBySlug("cripto-wine", params.slug);
    if (!article) {
      return { meta: [{ title: "Conteúdo não encontrado | Cripto Wine" }, { name: "robots", content: "noindex" }] };
    }
    const url = `${SITE_URL}/cripto-wine/${article.slug}`;
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
            articleSection: "Cripto Wine",
          }),
        },
      ],
    };
  },
  component: CriptoWineArtigo,
});

function CriptoWineArtigo() {
  const { slug } = Route.useParams();
  const article = articleBySlug("cripto-wine", slug);
  if (!article) return <ArticleNotFound id="cripto-wine" />;
  return <ArticlePage article={article} />;
}
