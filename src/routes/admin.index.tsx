import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export const Route = createFileRoute("/admin/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel gerencial | Atual Câmbio" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Visão geral">
      <AdminDashboard />
    </AdminShell>
  ),
});
