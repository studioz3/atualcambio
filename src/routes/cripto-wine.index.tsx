import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { absoluteUrl } from "@/config/site";
import { EditoriaPage } from "@/components/atual/editorial-pages";
import { getPublishedList } from "@/lib/editorial.functions";
import { track } from "@/lib/analytics";

export const Route = createFileRoute("/cripto-wine/")({
  head: () =>
    pageHead({
      path: "/cripto-wine",
      title: "Cripto Wine | Vinho, tecnologia e cultura",
      description: "Conversas sobre vinho, mercado, tecnologia e tudo o que conecta esses mundos. A editoria cultural da Atual Câmbio.",
      jsonLd: [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Cripto Wine",
          url: absoluteUrl("/cripto-wine"),
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
