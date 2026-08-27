import { createFileRoute } from "@tanstack/react-router";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

/**
 * Coleta agendada do Microsoft Clarity — exige o header x-cron-secret.
 * A API da Microsoft libera 10 chamadas/dia por projeto e cada execução gasta 2,
 * por isso roda 4x por dia (03h, 09h, 15h e 21h de Brasília).
 */
export const Route = createFileRoute("/api/cron/clarity-snapshot")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireCronRequest } = await import("@/lib/api-auth.server");
        const denied = requireCronRequest(request);
        if (denied) return denied;

        const { collectClaritySnapshot } = await import("@/lib/cockpit.server");
        const result = await collectClaritySnapshot(3);
        return new Response(JSON.stringify(result), {
          status: result.ok ? 200 : 502,
          headers: jsonHeaders,
        });
      },
    },
  },
});
