import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { absoluteUrl } from "@/config/site";
import { EditoriaPage } from "@/components/atual/editorial-pages";
import { getPublishedList } from "@/lib/editorial.functions";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/vida-atual/")({
  head: () =>
    pageHead({
      path: "/vida-atual",
      title: "Vida Atual | Wellness, comportamento e qualidade de vida",
      description: "Ideias, tendências e informação para viver melhor. Curadoria editorial da Atual Câmbio sobre wellness, comportamento e longevidade.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Vida Atual",
          description: "Wellness, comportamento e qualidade de vida.",
          url: absoluteUrl("/vida-atual"),
        },
      ],
    }),
  loader: async () => await getPublishedList({ data: { editoria: "vida-atual" } }),
  errorComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">
      Não foi possível carregar os conteúdos agora.
    </div>
  ),
  notFoundComponent: () => (
    <div className="px-6 pt-40 pb-24 text-center text-navy">Editoria não encontrada.</div>
  ),
  component: VidaAtual,
});

function VidaAtual() {
  useEffect(() => {
    track("vida_atual_view", { editoria: "vida-atual", source_page: "vida-atual" });
  }, []);
  const articles = Route.useLoaderData();
  return <EditoriaPage id="vida-atual" articles={articles} />;
}
