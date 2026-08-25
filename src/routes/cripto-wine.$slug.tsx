import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, ArticleNotFound } from "@/components/atual/editorial-pages";
import { articleHead } from "@/lib/seo-article";
import { getPublishedArticle } from "@/lib/editorial.functions";

export const Route = createFileRoute("/cripto-wine/$slug")({
  loader: async ({ params }) =>
    await getPublishedArticle({ data: { editoria: "cripto-wine", slug: params.slug } }),
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return {
        meta: [
          { title: "Conteúdo não encontrado | Cripto Wine" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    return articleHead({ editoriaPath: "/cripto-wine", editoriaName: "Cripto Wine", article });
  },
  errorComponent: () => <ArticleNotFound id="cripto-wine" />,
  notFoundComponent: () => <ArticleNotFound id="cripto-wine" />,
  component: CriptoWineArtigo,
});

function CriptoWineArtigo() {
  const data = Route.useLoaderData();
  if (!data) return <ArticleNotFound id="cripto-wine" />;
  return <ArticlePage article={data.article} related={data.related} />;
}
