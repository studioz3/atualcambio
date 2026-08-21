import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/privacidade";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade | Atual Câmbio" },
      {
        name: "description",
        content:
          "Como a Atual Câmbio coleta, utiliza, compartilha e protege dados pessoais, e como o titular exerce seus direitos previstos na LGPD.",
      },
      { property: "og:title", content: "Política de Privacidade | Atual Câmbio" },
      {
        property: "og:description",
        content: "Tratamento de dados pessoais com transparência, segurança e conformidade com a LGPD.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
