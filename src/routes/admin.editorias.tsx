import { createFileRoute } from "@tanstack/react-router";
import { CONTENT_ROLES } from "@/lib/roles-shared";
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
    <AdminShell requiredRoles={CONTENT_ROLES} title="Editorias">
      <AdminEditorials />
    </AdminShell>
  ),
});
