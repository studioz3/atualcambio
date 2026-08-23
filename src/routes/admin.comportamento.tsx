import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminBehavior } from "@/components/admin/AdminBehavior";

export const Route = createFileRoute("/admin/comportamento")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Comportamento e UX | Cockpit Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Comportamento e UX" tone="cockpit">
      <AdminBehavior />
    </AdminShell>
  ),
});
