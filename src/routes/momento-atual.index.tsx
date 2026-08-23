import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EditoriaPage } from "@/components/atual/editorial-pages";
import { getPublishedList } from "@/lib/editorial.functions";
import { getPodcastEpisodes } from "@/lib/podcast.functions";
import { SITE_URL } from "@/content/editorial";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/momento-atual/")({
  head: () => ({
    meta: [
      { title: "Momento Atual | Economia, política e mercados" },
      {
        name: "description",
        content:
          "O que está acontecendo no mundo — e por que isso importa. Economia, câmbio, mercados, comércio internacional e geopolítica pela Atual Câmbio.",
      },
      { property: "og:title", content: "Momento Atual | Economia, política e mercados" },
      {
        property: "og:description",
        content: "O que está acontecendo no mundo — e por que isso importa.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/momento-atual` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/momento-atual` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Momento Atual",
          description: "Economia, política, mercados e mundo.",
          url: `${SITE_URL}/momento-atual`,
        }),
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
