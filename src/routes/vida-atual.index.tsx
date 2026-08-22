import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { EditoriaPage } from "@/components/atual/editorial-pages";
import { SITE_URL } from "@/content/editorial";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/vida-atual/")({
  head: () => ({
    meta: [
      { title: "Vida Atual | Wellness, comportamento e qualidade de vida" },
      {
        name: "description",
        content:
          "Ideias, tendências e informação para viver melhor. Curadoria editorial da Atual Câmbio sobre wellness, comportamento e longevidade.",
      },
      {
        property: "og:title",
        content: "Vida Atual | Wellness, comportamento e qualidade de vida",
      },
      { property: "og:description", content: "Ideias, tendências e informação para viver melhor." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/vida-atual` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/vida-atual` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Vida Atual",
          description: "Wellness, comportamento e qualidade de vida.",
          url: `${SITE_URL}/vida-atual`,
        }),
      },
    ],
  }),
  component: VidaAtual,
});

function VidaAtual() {
  useEffect(() => {
    track("vida_atual_view", { editoria: "vida-atual", source_page: "vida-atual" });
  }, []);
  return <EditoriaPage id="vida-atual" />;
}
