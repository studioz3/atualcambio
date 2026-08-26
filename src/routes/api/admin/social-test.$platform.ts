import { createFileRoute } from "@tanstack/react-router";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

/** Teste de conexão de uma plataforma — exige sessão de administrador. */
export const Route = createFileRoute("/api/admin/social-test/$platform")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { requireAdminRequest } = await import("@/lib/api-auth.server");
        const auth = await requireAdminRequest(request);
        if (auth.denied) return auth.denied;

        const { isOAuthPlatform, testSocialConnection } = await import("@/lib/social-oauth.server");
        const platform = String(params.platform ?? "").toLowerCase();
        if (!isOAuthPlatform(platform)) {
          return new Response(JSON.stringify({ error: "plataforma_invalida" }), {
            status: 404,
            headers: jsonHeaders,
          });
        }
        const result = await testSocialConnection(platform);
        return new Response(JSON.stringify(result), { status: 200, headers: jsonHeaders });
      },
    },
  },
});
