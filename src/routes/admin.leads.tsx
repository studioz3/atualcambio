import { createFileRoute } from "@tanstack/react-router";
import { LEADS_ROLES } from "@/lib/roles-shared";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLeads } from "@/components/admin/AdminLeads";

export const Route = createFileRoute("/admin/leads")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Leads | Painel Atual Câmbio" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestão de leads — área interna." },
    ],
  }),
  component: () => (
    <AdminShell requiredRoles={LEADS_ROLES} title="Leads">
      <AdminLeads />
    </AdminShell>
  ),
});
