import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/seguranca-cibernetica";

export const Route = createFileRoute("/seguranca-cibernetica")({
  head: () =>
    pageHead({
      path: "/seguranca-cibernetica",
      title: "Política de Segurança Cibernética e da Informação | Atual Câmbio",
      description: "Diretrizes da Atual Câmbio para segurança da informação e segurança cibernética: princípios, atribuições, regras de uso de tecnologia, acessos e exceções.",
    }),
  component: SegurancaCiberneticaPage,
});

function SegurancaCiberneticaPage() {
  return (
    <LegalPage
      eyebrow="Segurança da informação"
      title="Política de Segurança Cibernética e da Informação"
      intro={intro}
      blocks={blocks}
    />
  );
}
