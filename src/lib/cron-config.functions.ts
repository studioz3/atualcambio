import { createServerFn } from "@tanstack/react-start";

/** Copia o CRON_SECRET (env) para app_config, usado pelo agendador do banco. */
export const syncCronSecret = createServerFn({ method: "POST" }).handler(async () => {
  const secret = (process.env["CRON_SECRET"] ?? "").trim();
  if (!secret) return { ok: false, reason: "cron_secret_ausente" };
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("app_config" as never)
    .upsert({ key: "CRON_SECRET", value: secret, updated_at: new Date().toISOString() } as never, {
      onConflict: "key",
    } as never);
  return { ok: !error, reason: error?.message ?? null };
});
