import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/codigo-de-conduta";

export const Route = createFileRoute("/codigo-de-conduta")({
  head: () =>
    pageHead({
      path: "/codigo-de-conduta",
      title: "Código de Conduta | Atual Câmbio",
      description: "Princípios, ética, compliance, confidencialidade e postura institucional que orientam o relacionamento da Atual Câmbio com clientes e parceiros.",
    }),
  component: CodigoDeCondutaPage,
});

function CodigoDeCondutaPage() {
  return (
    <LegalPage eyebrow="Ética e conduta" title="Código de Conduta" intro={intro} blocks={blocks} />
  );
}
