import { createFileRoute } from "@tanstack/react-router";

const allowedPlatforms = ["instagram", "facebook", "youtube", "tiktok", "linkedin"] as const;

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

/** Callback público de OAuth das redes sociais: /api/public/social-oauth/<plataforma>?code=... */
export const Route = createFileRoute("/api/public/social-oauth/$platform")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request, params }) => {
        const platform = String(params.platform ?? "").toLowerCase();
        if (!(allowedPlatforms as readonly string[]).includes(platform)) {
          return json({ error: "plataforma_invalida", platform }, 404);
        }
        const code = new URL(request.url).searchParams.get("code");
        if (!code) return json({ platform, code_recebido: false, error: "code_ausente" }, 400);
        return json({ platform, code_recebido: true });
      },
    },
  },
});
