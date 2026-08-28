import { createFileRoute } from "@tanstack/react-router";
import { CONTENT_ROLES } from "@/lib/roles-shared";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminTraffic } from "@/components/admin/AdminTraffic";

export const Route = createFileRoute("/admin/trafego")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Tráfego e aquisição | Cockpit Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell requiredRoles={CONTENT_ROLES} title="Tráfego e aquisição" tone="cockpit">
      <AdminTraffic />
    </AdminShell>
  ),
});
