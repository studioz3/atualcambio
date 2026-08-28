import { createFileRoute } from "@tanstack/react-router";
import { CONTENT_ROLES } from "@/lib/roles-shared";
import { AdminShell } from "@/components/admin/AdminShell";
import { SocialIntegrations } from "@/components/admin/SocialIntegrations";

export const Route = createFileRoute("/admin/integracoes/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Integrações | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell requiredRoles={CONTENT_ROLES} title="Integrações" tone="cockpit">
      <SocialIntegrations />
    </AdminShell>
  ),
});
