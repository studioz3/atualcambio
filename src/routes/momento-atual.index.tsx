import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { absoluteUrl } from "@/config/site";
import { EditoriaPage } from "@/components/atual/editorial-pages";
import { getPublishedList } from "@/lib/editorial.functions";
import { getPodcastEpisodes } from "@/lib/podcast.functions";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/momento-atual/")({
  head: () =>
    pageHead({
      path: "/momento-atual",
      title: "Momento Atual | Economia, política e mercados",
      description: "O que está acontecendo no mundo — e por que isso importa. Economia, câmbio, mercados, comércio internacional e geopolítica pela Atual Câmbio.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Momento Atual",
          description: "Economia, política, mercados e mundo.",
          url: absoluteUrl("/momento-atual"),
        },
      ],
    }),
  loader: async () => {
    const [articles, episodes] = await Promise.all([
      getPublishedList({ data: { editoria: "momento-atual" } }),
      getPodcastEpisodes({ data: { editoria: "momento-atual" } }),
    ]);
    return { articles, episodes };
  },
  errorComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">
      Não foi possível carregar os conteúdos agora.
    </div>
  ),
  notFoundComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">Editoria não encontrada.</div>
  ),
  component: MomentoAtual,
});

function MomentoAtual() {
  useEffect(() => {
    track("momento_atual_view", { editoria: "momento-atual", source_page: "momento-atual" });
  }, []);
  const { articles, episodes } = Route.useLoaderData();
  return <EditoriaPage id="momento-atual" articles={articles} episodes={episodes} />;
}
