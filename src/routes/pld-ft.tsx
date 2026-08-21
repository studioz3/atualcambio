import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/pld-ft";

export const Route = createFileRoute("/pld-ft")({
  head: () => ({
    meta: [
      { title: "Política de PLD/FT — Circular nº 3.978/20 | Atual Câmbio" },
      {
        name: "description",
        content:
          "Política de Prevenção à Lavagem de Dinheiro e ao Financiamento do Terrorismo da Atual Câmbio: abordagem baseada em risco, KYC, monitoramento e comunicações aos reguladores.",
      },
      { property: "og:title", content: "Política de PLD/FT | Atual Câmbio" },
      {
        property: "og:description",
        content: "Diretrizes de prevenção à lavagem de dinheiro e ao financiamento do terrorismo, conforme a Circular BCB nº 3.978/2020.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PldFtPage,
});

function PldFtPage() {
  return (
    <LegalPage
      eyebrow="Compliance"
      title="Política de Prevenção à Lavagem de Dinheiro e ao Financiamento de Terrorismo (PLD/FT)"
      intro={intro}
      blocks={blocks}
    />
  );
}
