import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminEditorials } from "@/components/admin/AdminEditorials";

export const Route = createFileRoute("/admin/editorias")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Editorias | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestão das editorias da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Editorias">
      <AdminEditorials />
    </AdminShell>
  ),
});
