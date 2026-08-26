import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { SocialCockpit } from "@/components/admin/social/SocialCockpit";

export const Route = createFileRoute("/admin/social/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cockpit Social | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Redes sociais e audiência" tone="cockpit">
      <SocialCockpit />
    </AdminShell>
  ),
});
