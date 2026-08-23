import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { ContentEditor } from "@/components/admin/ContentEditor";

export const Route = createFileRoute("/admin/conteudo/novo")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Novo conteúdo | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Criação de conteúdo editorial da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Novo conteúdo">
      <ContentEditor />
    </AdminShell>
  ),
});
