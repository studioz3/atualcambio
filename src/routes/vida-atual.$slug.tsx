import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, ArticleNotFound } from "@/components/atual/editorial-pages";
import { articleHead } from "@/lib/seo-article";
import { getPublishedArticle } from "@/lib/editorial.functions";

export const Route = createFileRoute("/vida-atual/$slug")({
  loader: async ({ params }) =>
    await getPublishedArticle({ data: { editoria: "vida-atual", slug: params.slug } }),
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return {
        meta: [
          { title: "Conteúdo não encontrado | Vida Atual" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    return articleHead({ editoriaPath: "/vida-atual", editoriaName: "Vida Atual", article });
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
