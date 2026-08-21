import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/responsabilidade-social";

export const Route = createFileRoute("/responsabilidade-social")({
  head: () => ({
    meta: [
      { title: "Responsabilidade Social, Ambiental e Climática (PRSAC) | Atual Câmbio" },
      {
        name: "description",
        content:
          "Pilares da PRSAC da Atual Câmbio: sustentabilidade ambiental e climática, responsabilidade social e direitos humanos, governança, ética e conformidade.",
      },
      {
        property: "og:title",
        content: "Responsabilidade Social, Ambiental e Climática | Atual Câmbio",
      },
      {
        property: "og:description",
        content: "Compromisso com um futuro sustentável, ético e transparente, alinhado à Resolução CMN nº 4.945.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResponsabilidadeSocialPage,
});

function ResponsabilidadeSocialPage() {
  return (
    <LegalPage
      eyebrow="PRSAC"
      title="Responsabilidade Social, Ambiental e Climática"
      intro={intro}
      blocks={blocks}
    />
  );
}
