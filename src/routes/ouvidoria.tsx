import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/ouvidoria";

export const Route = createFileRoute("/ouvidoria")({
  head: () =>
    pageHead({
      path: "/ouvidoria",
      title: "Ouvidoria | Atual Câmbio",
      description: "Canal de segunda instância, imparcial e independente da Atual Câmbio: como acionar, prazos de resposta e canais de contato conforme o Banco Central.",
    }),
  component: OuvidoriaPage,
});

function OuvidoriaPage() {
  return (
    <LegalPage
      eyebrow="Ouvidoria"
      title="Relatórios de Ouvidoria"
      intro={intro}
      blocks={blocks}
    />
  );
}
