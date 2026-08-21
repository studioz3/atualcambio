import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/codigo-de-conduta";

export const Route = createFileRoute("/codigo-de-conduta")({
  head: () => ({
    meta: [
      { title: "Código de Conduta | Atual Câmbio" },
      {
        name: "description",
        content:
          "Princípios, ética, compliance, confidencialidade e postura institucional que orientam o relacionamento da Atual Câmbio com clientes e parceiros.",
      },
      { property: "og:title", content: "Código de Conduta | Atual Câmbio" },
      {
        property: "og:description",
        content: "Transparência, integridade, segurança e responsabilidade no relacionamento com clientes e parceiros.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CodigoDeCondutaPage,
});

function CodigoDeCondutaPage() {
  return (
    <LegalPage eyebrow="Ética e conduta" title="Código de Conduta" intro={intro} blocks={blocks} />
  );
}
