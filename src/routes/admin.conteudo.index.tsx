import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminContent } from "@/components/admin/AdminContent";

export const Route = createFileRoute("/admin/conteudo/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conteúdo | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestão editorial da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Conteúdo editorial">
      <AdminContent />
    </AdminShell>
  ),
});
