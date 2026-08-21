import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/canal-de-denuncias";

export const Route = createFileRoute("/canal-de-denuncias")({
  head: () => ({
    meta: [
      { title: "Canal de Denúncias | Atual Câmbio" },
      {
        name: "description",
        content:
          "Canal seguro, sigiloso e independente para relatar fraudes, indícios de lavagem de dinheiro, assédio, vazamento de dados e violações ao Código de Conduta.",
      },
      { property: "og:title", content: "Canal de Denúncias | Atual Câmbio" },
      {
        property: "og:description",
        content: "Ambiente seguro e anônimo para relatar condutas que violem o Código de Ética ou a legislação vigente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
