/** Contratos client-safe do monitor de saúde das integrações de analytics. */

export const healthSources = [
  { id: "ga4", label: "GA4 · Data API", hint: "Alimenta /admin e /admin/trafego" },
  { id: "ga4_realtime", label: "GA4 · Realtime API", hint: "Alimenta “Agora no site”" },
  { id: "clarity", label: "Microsoft Clarity", hint: "Alimenta /admin/comportamento" },
] as const;

export type HealthSourceId = (typeof healthSources)[number]["id"];

export type HealthCheck = {
  source: HealthSourceId;
  ok: boolean;
  statusCode: number | null;
  durationMs: number;
  error: string | null;
  checkedAt: string;
};

export type HealthSourceStatus = {
  source: HealthSourceId;
  last: HealthCheck | null;
  /** Checagens das últimas 24h. */
  errors24h: number;
  checks24h: number;
  avgDurationMs: number | null;
  history: HealthCheck[];
};

export type HealthSnapshot = {
  sources: HealthSourceStatus[];
  alerting: { webhook: boolean; email: boolean; recipients: number };
  generatedAt: string;
};

export function sourceLabel(id: string) {
  return healthSources.find((s) => s.id === id)?.label ?? id;
}

export function formatMs(ms: number | null | undefined) {
  if (ms == null || !Number.isFinite(ms)) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)} s` : `${Math.round(ms)} ms`;
}
