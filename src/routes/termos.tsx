import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/termos";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso | Atual Câmbio" },
      {
        name: "description",
        content:
          "Condições de uso do site da Atual Câmbio: aceitação, uso da plataforma, informações institucionais, cadastro, propriedade intelectual e responsabilidades.",
      },
      { property: "og:title", content: "Termos de Uso | Atual Câmbio" },
      {
        property: "og:description",
        content: "Regras de uso do site e dos canais digitais da Atual Câmbio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermosPage,
});

function TermosPage() {
  return <LegalPage eyebrow="Termos de Uso" title="Termos de Uso" intro={intro} blocks={blocks} />;
}
