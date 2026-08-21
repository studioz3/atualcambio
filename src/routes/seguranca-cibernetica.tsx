import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/seguranca-cibernetica";

export const Route = createFileRoute("/seguranca-cibernetica")({
  head: () => ({
    meta: [
      { title: "Política de Segurança Cibernética e da Informação | Atual Câmbio" },
      {
        name: "description",
        content:
          "Diretrizes da Atual Câmbio para segurança da informação e segurança cibernética: princípios, atribuições, regras de uso de tecnologia, acessos e exceções.",
      },
      {
        property: "og:title",
        content: "Política de Segurança Cibernética e da Informação | Atual Câmbio",
      },
      {
        property: "og:description",
        content: "Princípios e controles que protegem informações, sistemas e operações da Atual Câmbio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
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
