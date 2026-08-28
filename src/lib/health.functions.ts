import { createServerFn } from "@tanstack/react-start";
import { CONTENT_ROLES } from "./roles-shared";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { HealthSnapshot } from "./health-shared";

export const getAnalyticsHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<HealthSnapshot> => {
    const { assertStaff } = await import("./cockpit.server");
    const { fetchHealthSnapshot } = await import("./health.server");
    await assertStaff(context as any, CONTENT_ROLES);
    return fetchHealthSnapshot(context as any);
  });

export const runAnalyticsHealthCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./cockpit.server");
    const { runHealthChecks } = await import("./health.server");
    await assertStaff(context as any, CONTENT_ROLES);
    return runHealthChecks();
  });
