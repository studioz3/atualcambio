import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";

/** Checagem periódica (cron) das integrações de analytics + disparo de alertas. */
export const Route = createFileRoute("/api/public/analytics-health")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const { runHealthChecks } = await import("@/lib/health.server");
        const result = await runHealthChecks();
        const allOk = result.results.every((r) => r.ok);
        return new Response(JSON.stringify(result), {
          status: allOk ? 200 : 503,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
