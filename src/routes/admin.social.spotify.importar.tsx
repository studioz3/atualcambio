import { createFileRoute } from "@tanstack/react-router";
import { CONTENT_ROLES } from "@/lib/roles-shared";
import { AdminShell } from "@/components/admin/AdminShell";
import { SpotifyImport } from "@/components/admin/social/SpotifyImport";

export const Route = createFileRoute("/admin/social/spotify/importar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Importar Spotify | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell requiredRoles={CONTENT_ROLES} title="Importar métricas do Spotify" tone="cockpit">
      <SpotifyImport />
    </AdminShell>
  ),
});
