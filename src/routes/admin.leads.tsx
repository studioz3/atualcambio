import { createFileRoute } from "@tanstack/react-router";
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
    <AdminShell title="Leads">
      <AdminLeads />
    </AdminShell>
  ),
});
