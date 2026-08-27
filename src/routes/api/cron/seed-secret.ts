import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/cron/seed-secret")({
  server: {
    handlers: {
      POST: async () => {
        const secret = (process.env["CRON_SECRET"] ?? "").trim();
        if (!secret) return new Response(JSON.stringify({ ok: false, reason: "ausente" }), { status: 500 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("app_config" as never)
          .upsert({ key: "CRON_SECRET", value: secret } as never, { onConflict: "key" } as never);
        return new Response(JSON.stringify({ ok: !error, reason: error?.message ?? null }));
      },
    },
  },
});
