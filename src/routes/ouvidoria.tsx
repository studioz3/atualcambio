import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/ouvidoria";

export const Route = createFileRoute("/ouvidoria")({
  head: () => ({
    meta: [
      { title: "Ouvidoria | Atual Câmbio" },
      {
        name: "description",
        content:
          "Canal de segunda instância, imparcial e independente da Atual Câmbio: como acionar, prazos de resposta e canais de contato conforme o Banco Central.",
      },
      { property: "og:title", content: "Ouvidoria | Atual Câmbio" },
      {
        property: "og:description",
        content: "Canal de última instância para mediar conflitos e garantir a defesa dos direitos dos clientes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
