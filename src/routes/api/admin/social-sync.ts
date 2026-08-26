import { createFileRoute } from "@tanstack/react-router";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

/** Sincronização manual das redes sociais — exige sessão de administrador. */
export const Route = createFileRoute("/api/admin/social-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireAdminRequest } = await import("@/lib/api-auth.server");
        const auth = await requireAdminRequest(request);
        if (auth.denied) return auth.denied;

        let platforms: string[] | undefined;
        try {
          const body = (await request.json()) as { platforms?: string[] };
          platforms = Array.isArray(body?.platforms) ? body.platforms.slice(0, 10) : undefined;
        } catch {
          platforms = undefined;
        }

        const { runSocialSync } = await import("@/lib/social-oauth.server");
        const result = await runSocialSync(platforms);
        return new Response(JSON.stringify(result), { status: 200, headers: jsonHeaders });
      },
    },
  },
});
