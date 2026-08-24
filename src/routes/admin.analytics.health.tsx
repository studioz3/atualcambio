import { createFileRoute } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminAnalyticsHealth } from "@/components/admin/AdminAnalyticsHealth";

export const Route = createFileRoute("/admin/analytics/health")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Saúde das integrações | Cockpit Atual" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Área interna da Atual Câmbio." },
    ],
  }),
  component: () => (
    <AdminShell title="Saúde das integrações" tone="cockpit">
      <AdminAnalyticsHealth />
    </AdminShell>
  ),
});
