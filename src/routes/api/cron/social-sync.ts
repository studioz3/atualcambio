import { createFileRoute } from "@tanstack/react-router";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

/** Sincronização diária agendada — exige o header x-cron-secret. */
export const Route = createFileRoute("/api/cron/social-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronRequest } = await import("@/lib/api-auth.server");
        const denied = requireCronRequest(request);
        if (denied) return denied;

        const { runSocialSync } = await import("@/lib/social-oauth.server");
        const result = await runSocialSync();
        return new Response(JSON.stringify(result), { status: 200, headers: jsonHeaders });
      },
    },
  },
});
