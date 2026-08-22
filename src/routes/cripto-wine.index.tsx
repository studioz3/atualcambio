import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EditoriaPage } from "@/components/atual/editorial-pages";
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
  component: CriptoWine,
});

function CriptoWine() {
  useEffect(() => {
    track("cripto_wine_view", { editoria: "cripto-wine", source_page: "cripto-wine" });
  }, []);
  return <EditoriaPage id="cripto-wine" />;
}
