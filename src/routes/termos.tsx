import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/termos";

export const Route = createFileRoute("/termos")({
  head: () =>
    pageHead({
      path: "/termos",
      title: "Termos de Uso | Atual Câmbio",
      description: "Condições de uso do site da Atual Câmbio: aceitação, uso da plataforma, informações institucionais, cadastro, propriedade intelectual e responsabilidades.",
    }),
  component: TermosPage,
});

function TermosPage() {
  return <LegalPage eyebrow="Termos de Uso" title="Termos de Uso" intro={intro} blocks={blocks} />;
}
