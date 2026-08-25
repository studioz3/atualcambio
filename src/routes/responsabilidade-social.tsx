import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/responsabilidade-social";

export const Route = createFileRoute("/responsabilidade-social")({
  head: () =>
    pageHead({
      path: "/responsabilidade-social",
      title: "Responsabilidade Social, Ambiental e Climática (PRSAC) | Atual Câmbio",
      description: "Pilares da PRSAC da Atual Câmbio: sustentabilidade ambiental e climática, responsabilidade social e direitos humanos, governança, ética e conformidade.",
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
