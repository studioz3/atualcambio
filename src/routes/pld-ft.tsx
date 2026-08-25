import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/pld-ft";

export const Route = createFileRoute("/pld-ft")({
  head: () =>
    pageHead({
      path: "/pld-ft",
      title: "Política de PLD/FT — Circular nº 3.978/20 | Atual Câmbio",
      description: "Política de Prevenção à Lavagem de Dinheiro e ao Financiamento do Terrorismo da Atual Câmbio: abordagem baseada em risco, KYC, monitoramento e comunicações aos reguladores.",
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
