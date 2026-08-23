import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EditoriaPage } from "@/components/atual/editorial-pages";
import { getPublishedList } from "@/lib/editorial.functions";
import { SITE_URL } from "@/content/editorial";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/cripto-wine/")({
  head: () => ({
    meta: [
      { title: "Cripto Wine | Vinho, tecnologia e cultura" },
      {
        name: "description",
        content:
          "Conversas sobre vinho, mercado, tecnologia e tudo o que conecta esses mundos. A editoria cultural da Atual Câmbio.",
      },
      { property: "og:title", content: "Cripto Wine | Vinho, tecnologia e cultura" },
      {
        property: "og:description",
        content: "Onde vinho, tecnologia, cultura e mercado se encontram.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/cripto-wine` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/cripto-wine` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cripto Wine",
          description: "Vinho, tecnologia, cultura e negócios.",
          url: `${SITE_URL}/cripto-wine`,
        }),
      },
    ],
  }),
  loader: async () => await getPublishedList({ data: { editoria: "cripto-wine" } }),
  errorComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">
      Não foi possível carregar os conteúdos agora.
    </div>
  ),
  notFoundComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">Editoria não encontrada.</div>
  ),
  component: CriptoWine,
});

function CriptoWine() {
  useEffect(() => {
    track("cripto_wine_view", { editoria: "cripto-wine", source_page: "cripto-wine" });
  }, []);
  const articles = Route.useLoaderData();
  return <EditoriaPage id="cripto-wine" articles={articles} />;
}
