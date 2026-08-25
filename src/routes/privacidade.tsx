import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/privacidade";

export const Route = createFileRoute("/privacidade")({
  head: () =>
    pageHead({
      path: "/privacidade",
      title: "Política de Privacidade | Atual Câmbio",
      description: "Como a Atual Câmbio coleta, utiliza, compartilha e protege dados pessoais, e como o titular exerce seus direitos previstos na LGPD.",
    }),
  component: PrivacidadePage,
});

function PrivacidadePage() {
  return (
    <LegalPage
      eyebrow="Privacidade e LGPD"
      title="Política de Privacidade"
      intro={intro}
      blocks={blocks}
    />
  );
}
