import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/canal-de-denuncias";

export const Route = createFileRoute("/canal-de-denuncias")({
  head: () =>
    pageHead({
      path: "/canal-de-denuncias",
      title: "Canal de Denúncias | Atual Câmbio",
      description: "Canal seguro, sigiloso e independente para relatar fraudes, indícios de lavagem de dinheiro, assédio, vazamento de dados e violações ao Código de Conduta.",
    }),
  component: CanalDeDenunciasPage,
});

function CanalDeDenunciasPage() {
  return (
    <LegalPage
      eyebrow="Integridade"
      title="Canal de Denúncias"
      intro={intro}
      blocks={blocks}
    />
  );
}
