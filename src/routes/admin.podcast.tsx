import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminPodcast } from "@/components/admin/AdminPodcast";

export const Route = createFileRoute("/admin/podcast")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Podcast | Painel gerencial Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Gestão dos episódios do podcast Momento Atual." },
    ],
  }),
  component: () => (
    <AdminShell title="Podcast Momento Atual">
      <AdminPodcast />
    </AdminShell>
  ),
});
