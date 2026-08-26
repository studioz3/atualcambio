import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** Callback público de OAuth das redes sociais: /api/public/social-oauth/<plataforma>?code=...&state=... */
export const Route = createFileRoute("/api/public/social-oauth/$platform")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request, params }) => {
        const { consumeOAuthState, isOAuthPlatform } = await import("@/lib/social-oauth.server");
        const platform = String(params.platform ?? "").toLowerCase();
        if (!isOAuthPlatform(platform)) {
          return json({ error: "plataforma_invalida", platform }, 404);
        }

        const url = new URL(request.url);
        const state = url.searchParams.get("state");
        const check = await consumeOAuthState(platform, state);
        if (!check.ok) {
          return json({ error: "state_invalido", motivo: check.reason }, 400);
        }

        const code = url.searchParams.get("code");
        if (!code) return json({ platform, code_recebido: false, error: "code_ausente" }, 400);
        return json({ platform, code_recebido: true });
      },
    },
  },
});
