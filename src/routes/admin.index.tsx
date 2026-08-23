import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminCockpit } from "@/components/admin/AdminCockpit";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cockpit Atual | Painel gerencial" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Visão geral" tone="cockpit">
      <AdminCockpit />
    </AdminShell>
  ),
});
