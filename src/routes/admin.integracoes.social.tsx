import { createFileRoute } from "@tanstack/react-router";
import { CONTENT_ROLES } from "@/lib/roles-shared";
import { AdminShell } from "@/components/admin/AdminShell";
import { SocialConnections } from "@/components/admin/social/SocialConnections";

export const Route = createFileRoute("/admin/integracoes/social")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conexões das redes sociais | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell requiredRoles={CONTENT_ROLES} title="Conexões das redes sociais" tone="cockpit">
      <SocialConnections />
    </AdminShell>
  ),
});
