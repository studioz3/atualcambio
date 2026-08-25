import { createFileRoute } from "@tanstack/react-router";
import { ArticlePage, ArticleNotFound } from "@/components/atual/editorial-pages";
import { articleHead } from "@/lib/seo-article";
import { getPublishedArticle } from "@/lib/editorial.functions";

export const Route = createFileRoute("/momento-atual/$slug")({
  loader: async ({ params }) =>
    await getPublishedArticle({ data: { editoria: "momento-atual", slug: params.slug } }),
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return {
        meta: [
          { title: "Conteúdo não encontrado | Momento Atual" },
          { name: "robots", content: "noindex, nofollow" },
        ],
      };
    }
    return articleHead({ editoriaPath: "/momento-atual", editoriaName: "Momento Atual", article });
  },
  errorComponent: () => <ArticleNotFound id="momento-atual" />,
  notFoundComponent: () => <ArticleNotFound id="momento-atual" />,
  component: MomentoAtualArtigo,
});

function MomentoAtualArtigo() {
  const data = Route.useLoaderData();
  if (!data) return <ArticleNotFound id="momento-atual" />;
  return <ArticlePage article={data.article} related={data.related} />;
}
