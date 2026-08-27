import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type {
  ClarityHistoryResult,
  ClarityResult,
  CockpitInternal,
  Ga4RealtimeResult,
  Ga4Result,
} from "./cockpit-shared";

const rangeSchema = z.object({
  from: z.string(),
  to: z.string(),
  previousFrom: z.string().nullable().default(null),
  previousTo: z.string().nullable().default(null),
  granularity: z.enum(["hora", "dia", "semana"]).default("dia"),
});

export const getIntegrationsStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff, ga4Configured, clarityConfigured, clarityProjectUrl } = await import(
      "./cockpit.server"
    );
    await assertStaff(context as any);
    return {
      ga4: ga4Configured(),
      clarity: clarityConfigured(),
      clarityProjectUrl: clarityProjectUrl(),
      cloud: true,
    };
  });

export const getGa4Overview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => rangeSchema.parse(data))
  .handler(async ({ context, data }): Promise<Ga4Result> => {
    const { assertStaff, ga4Configured, fetchGa4Overview } = await import("./cockpit.server");
    await assertStaff(context as any);
    if (!ga4Configured()) {
      return { configured: false, reason: "Conecte o Google Analytics 4 para ver dados de tráfego." };
    }
    try {
      return { configured: true, data: await fetchGa4Overview(data) };
    } catch (error) {
      console.error("[cockpit] GA4 overview falhou", error);
      return { configured: false, reason: (error as Error).message };
    }
  });

export const getGa4Realtime = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Ga4RealtimeResult> => {
    const { assertStaff, ga4Configured, fetchGa4Realtime } = await import("./cockpit.server");
    await assertStaff(context as any);
    if (!ga4Configured()) {
      return { configured: false, reason: "Tempo real disponível após conectar o Google Analytics 4." };
    }
    try {
      return { configured: true, data: await fetchGa4Realtime() };
    } catch (error) {
      console.error("[cockpit] GA4 realtime falhou", error);
      return { configured: false, reason: (error as Error).message };
    }
  });

export const getClarityOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ClarityResult> => {
    const { assertStaff, clarityConfigured, fetchClarity } = await import("./cockpit.server");
    await assertStaff(context as any);
    if (!clarityConfigured()) {
      return { configured: false, reason: "Conecte o Microsoft Clarity para ver comportamento e mapas de calor." };
    }
    try {
      return { configured: true, data: await fetchClarity() };
    } catch (error) {
      console.error("[cockpit] Clarity falhou", error);
      return { configured: false, reason: (error as Error).message };
    }
  });

/** Histórico já coletado do Clarity — lê somente o banco, sem gastar cota da API. */
export const getClarityHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ from: z.string(), to: z.string() }).parse(data),
  )
  .handler(async ({ context, data }): Promise<ClarityHistoryResult> => {
    const { assertStaff, clarityConfigured, fetchClarityHistory } = await import("./cockpit.server");
    await assertStaff(context as any);
    if (!clarityConfigured()) {
      return { configured: false, reason: "Microsoft Clarity não conectado." };
    }
    try {
      return { configured: true, data: await fetchClarityHistory(data.from, data.to) };
    } catch (error) {
      console.error("[cockpit] Histórico Clarity falhou", error);
      return { configured: false, reason: (error as Error).message };
    }
  });


export const getCockpitInternal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        from: z.string().nullable().default(null),
        to: z.string().nullable().default(null),
        previousFrom: z.string().nullable().default(null),
        previousTo: z.string().nullable().default(null),
      })
      .parse(data),
  )
  .handler(async ({ context, data }): Promise<CockpitInternal> => {
    const { assertStaff } = await import("./cockpit.server");
    const { fetchCockpitInternal } = await import("./cockpit-internal.server");
    await assertStaff(context as any);
    return fetchCockpitInternal(context as any, data);
  });
