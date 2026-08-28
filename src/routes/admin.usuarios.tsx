import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { ADMIN_ROLES } from "@/lib/roles-shared";

export const Route = createFileRoute("/admin/usuarios")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Usuários | Painel Atual Câmbio" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestão de acessos — área interna." },
    ],
  }),
  component: () => (
    <AdminShell title="Usuários e acessos" requiredRoles={ADMIN_ROLES}>
      <AdminUsers />
    </AdminShell>
  ),
});
