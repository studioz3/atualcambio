/**
 * Cockpit Atual — camada server-only.
 * Credenciais lidas apenas aqui, dentro de handlers. Nada retorna token ao frontend.
 */
import type {
  ClarityOverview,
  ClarityPageMetrics,
  Ga4Dim,
  Ga4Overview,
  Ga4Page,
  Ga4Point,
  Ga4Realtime,
  Ga4Totals,
} from "./cockpit-shared";

type StaffCtx = { supabase: any; userId: string; claims: Record<string, unknown> };

export async function assertStaff(context: StaffCtx) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Não foi possível validar o acesso.");
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (roles.length === 0) throw new Error("Acesso restrito ao time da Atual.");
  return { roles: roles as string[], email: (context.claims["email"] as string | undefined) ?? "" };
}

/* ------------------------------------------------------------------ *
 * Google Analytics 4 — Data API (server-side, service account)
 * ------------------------------------------------------------------ */

function ga4Config() {
  const propertyId = (process.env["GA4_PROPERTY_ID"] ?? "").replace(/^properties\//, "").trim();
  const credentials =
    process.env["GA4_SERVICE_ACCOUNT_KEY"] ?? process.env["GA4_SERVICE_ACCOUNT_JSON"];
  if (!propertyId || !credentials) return null;
  try {
    const parsed = JSON.parse(credentials) as { client_email?: string; private_key?: string };
    if (!parsed.client_email || !parsed.private_key) return null;
    return {
      propertyId,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key.replace(/\\n/g, "\n"),
    };
  } catch {
    return null;
  }
}


export function ga4Configured() {
  return ga4Config() !== null;
}

function pemToArrayBuffer(pem: string) {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\\n/g, "")
    .replace(/\s/g, "");
  const raw = atob(body);
  const buf = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buf[i] = raw.charCodeAt(i);
  return buf.buffer;
}

function base64url(input: string | Uint8Array) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

let tokenCache: { token: string; exp: number } | null = null;

async function ga4AccessToken(clientEmail: string, privateKey: string) {
  const now = Math.floor(Date.now() / 1000);
  if (tokenCache && now < tokenCache.exp - 60) return tokenCache.token;

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = new Uint8Array(
    await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${payload}`)),
  );
  const assertion = `${header}.${payload}.${base64url(signature)}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) throw new Error(`Falha na autenticação com o Google Analytics [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, exp: now + json.expires_in };
  return json.access_token;
}

async function ga4Run(path: string, body: unknown) {
  const cfg = ga4Config();
  if (!cfg) throw new Error("Google Analytics não configurado.");
  const token = await ga4AccessToken(cfg.clientEmail, cfg.privateKey);
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${cfg.propertyId}:${path}`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) throw new Error(`Google Analytics respondeu ${res.status}: ${await res.text()}`);
  return (await res.json()) as {
    rows?: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }[];
    totals?: { metricValues: { value: string }[] }[];
  };
}

const num = (v?: string) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};

async function ga4Totals(from: string, to: string): Promise<Ga4Totals> {
  const res = await ga4Run("runReport", {
    dateRanges: [{ startDate: from, endDate: to }],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "screenPageViews" },
      { name: "userEngagementDuration" },
      { name: "eventCount" },
      { name: "conversions" },
    ],
  });
  const m = res.rows?.[0]?.metricValues ?? res.totals?.[0]?.metricValues ?? [];
  const sessions = num(m[0]?.value);
  return {
    sessions,
    users: num(m[1]?.value),
    pageViews: num(m[2]?.value),
    avgEngagementSeconds: sessions > 0 ? num(m[3]?.value) / sessions : 0,
    events: num(m[4]?.value),
    conversions: num(m[5]?.value),
  };
}

async function ga4Dimension(from: string, to: string, dimension: string, limit = 12): Promise<Ga4Dim[]> {
  const res = await ga4Run("runReport", {
    dateRanges: [{ startDate: from, endDate: to }],
    dimensions: [{ name: dimension }],
    metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "conversions" }],
    orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
    limit,
  });
  return (res.rows ?? []).map((r) => ({
    label: r.dimensionValues[0]?.value ?? "—",
    sessions: num(r.metricValues[0]?.value),
    users: num(r.metricValues[1]?.value),
    conversions: num(r.metricValues[2]?.value),
  }));
}

export async function fetchGa4Overview(input: {
  from: string;
  to: string;
  previousFrom: string | null;
  previousTo: string | null;
  granularity: "hora" | "dia" | "semana";
}): Promise<Ga4Overview> {
  const dimension =
    input.granularity === "hora" ? "dateHour" : input.granularity === "semana" ? "week" : "date";

  const [totals, previous, seriesRes, sources, campaigns, devices, locations, pagesRes] =
    await Promise.all([
      ga4Totals(input.from, input.to),
      input.previousFrom && input.previousTo
        ? ga4Totals(input.previousFrom, input.previousTo).catch(() => null)
        : Promise.resolve(null),
      ga4Run("runReport", {
        dateRanges: [{ startDate: input.from, endDate: input.to }],
        dimensions: [{ name: dimension }],
        metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "screenPageViews" }],
        orderBys: [{ dimension: { dimensionName: dimension } }],
        limit: 500,
      }),
      ga4Dimension(input.from, input.to, "sessionDefaultChannelGroup"),
      ga4Dimension(input.from, input.to, "sessionCampaignName"),
      ga4Dimension(input.from, input.to, "deviceCategory", 5),
      ga4Dimension(input.from, input.to, "city", 10),
      ga4Run("runReport", {
        dateRanges: [{ startDate: input.from, endDate: input.to }],
        dimensions: [{ name: "pagePath" }],
        metrics: [
          { name: "screenPageViews" },
          { name: "totalUsers" },
          { name: "userEngagementDuration" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 20,
      }),
    ]);

  const series: Ga4Point[] = (seriesRes.rows ?? []).map((r) => ({
    date: r.dimensionValues[0]?.value ?? "",
    sessions: num(r.metricValues[0]?.value),
    users: num(r.metricValues[1]?.value),
    pageViews: num(r.metricValues[2]?.value),
  }));

  const pages: Ga4Page[] = (pagesRes.rows ?? []).map((r) => {
    const users = num(r.metricValues[1]?.value);
    return {
      path: r.dimensionValues[0]?.value ?? "/",
      views: num(r.metricValues[0]?.value),
      users,
      avgEngagementSeconds: users > 0 ? num(r.metricValues[2]?.value) / users : 0,
    };
  });

  return { totals, previous, series, sources, campaigns, devices, locations, pages };
}

export async function fetchGa4Realtime(): Promise<Ga4Realtime> {
  const [users, pages, devices, events] = await Promise.all([
    ga4Run("runRealtimeReport", { metrics: [{ name: "activeUsers" }] }),
    ga4Run("runRealtimeReport", {
      dimensions: [{ name: "unifiedScreenName" }],
      metrics: [{ name: "activeUsers" }],
      limit: 6,
    }).catch(() => ({ rows: [] })),
    ga4Run("runRealtimeReport", {
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "activeUsers" }],
      limit: 4,
    }).catch(() => ({ rows: [] })),
    ga4Run("runRealtimeReport", {
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      limit: 6,
    }).catch(() => ({ rows: [] })),
  ]);

  return {
    activeUsers: num(users.rows?.[0]?.metricValues[0]?.value),
    pages: (pages.rows ?? []).map((r) => ({
      path: r.dimensionValues[0]?.value ?? "—",
      activeUsers: num(r.metricValues[0]?.value),
    })),
    devices: (devices.rows ?? []).map((r) => ({
      label: r.dimensionValues[0]?.value ?? "—",
      activeUsers: num(r.metricValues[0]?.value),
    })),
    events: (events.rows ?? []).map((r) => ({
      name: r.dimensionValues[0]?.value ?? "—",
      count: num(r.metricValues[0]?.value),
    })),
  };
}

/* ------------------------------------------------------------------ *
 * Microsoft Clarity — Data Export API com cache e cooldown
 * ------------------------------------------------------------------ */

export function clarityConfigured() {
  return Boolean(process.env["CLARITY_API_TOKEN"]);
}

export function clarityProjectUrl() {
  const url = process.env["CLARITY_PROJECT_URL"];
  const id = process.env["CLARITY_PROJECT_ID"];
  if (url) return url;
  if (id) return `https://clarity.microsoft.com/projects/view/${id}/dashboard`;
  return null;
}

const CLARITY_TTL_MS = 1000 * 60 * 60 * 3; // 3h — a API tem limite diário de chamadas
const CLARITY_COOLDOWN_MS = 1000 * 60 * 10; // atualização manual a cada 10 min

let clarityCache: { at: number; data: ClarityOverview } | null = null;
let clarityLastCall = 0;

function emptyPageMetrics(path: string): ClarityPageMetrics {
  return {
    path,
    sessions: 0,
    averageScrollDepth: null,
    averageEngagementSeconds: null,
    rageClicks: 0,
    deadClicks: 0,
    excessiveScroll: 0,
    quickBacks: 0,
    scriptErrors: 0,
    errorClicks: 0,
  };
}

type ClarityRaw = { metricName: string; information: Record<string, string>[] }[];

function parseClarity(raw: ClarityRaw): Omit<ClarityOverview, "updatedAt" | "stale" | "projectUrl"> {
  const totals = emptyPageMetrics("todas");
  const pageMap = new Map<string, ClarityPageMetrics>();
  const devices: { label: string; sessions: number }[] = [];
  const sources: { label: string; sessions: number }[] = [];

  const pageOf = (path: string) => {
    const key = path || "/";
    if (!pageMap.has(key)) pageMap.set(key, emptyPageMetrics(key));
    return pageMap.get(key)!;
  };

  const numeric = (v?: string) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  };

  for (const metric of raw ?? []) {
    const rows = metric.information ?? [];
    for (const row of rows) {
      const url = row["Url"] ?? row["url"] ?? row["URL"] ?? "";
      const sessions = numeric(row["sessionsCount"] ?? row["sessionsWithMetricPercentage"]);
      switch (metric.metricName) {
        case "Traffic": {
          totals.sessions += numeric(row["totalSessionCount"] ?? row["sessionsCount"]);
          break;
        }
        case "PopularPages": {
          const p = pageOf(url);
          p.sessions += numeric(row["visitsCount"] ?? row["sessionsCount"]);
          break;
        }
        case "Browser":
        case "Device":
        case "OS": {
          if (metric.metricName === "Device") {
            devices.push({
              label: row["Device"] ?? row["deviceType"] ?? "—",
              sessions: numeric(row["sessionsCount"] ?? row["visitsCount"]),
            });
          }
          break;
        }
        case "ReferrerUrl":
        case "Source": {
          sources.push({
            label: row["Source"] ?? row["ReferrerUrl"] ?? "—",
            sessions: numeric(row["sessionsCount"] ?? row["visitsCount"]),
          });
          break;
        }
        case "ScrollDepth": {
          const value = numeric(row["averageScrollDepth"]) / 100;
          if (url) pageOf(url).averageScrollDepth = value;
          else totals.averageScrollDepth = value;
          break;
        }
        case "EngagementTime": {
          const value = numeric(row["activeTime"] ?? row["totalTime"]);
          if (url) pageOf(url).averageEngagementSeconds = value;
          else totals.averageEngagementSeconds = value;
          break;
        }
        case "RageClickCount":
        case "DeadClickCount":
        case "ExcessiveScroll":
        case "QuickbackClick":
        case "ScriptErrorCount":
        case "ErrorClickCount": {
          const field =
            metric.metricName === "RageClickCount"
              ? "rageClicks"
              : metric.metricName === "DeadClickCount"
                ? "deadClicks"
                : metric.metricName === "ExcessiveScroll"
                  ? "excessiveScroll"
                  : metric.metricName === "QuickbackClick"
                    ? "quickBacks"
                    : metric.metricName === "ScriptErrorCount"
                      ? "scriptErrors"
                      : "errorClicks";
          const value = sessions || numeric(row["subTotal"]);
          totals[field] += value;
          if (url) pageOf(url)[field] += value;
          break;
        }
        default:
          break;
      }
    }
  }

  return {
    totals,
    pages: [...pageMap.values()].sort((a, b) => b.sessions - a.sessions),
    devices,
    sources,
  };
}

export async function fetchClarity(input: { days: number; force: boolean }): Promise<ClarityOverview> {
  const token = process.env["CLARITY_API_TOKEN"];
  if (!token) throw new Error("Clarity não configurado.");

  const now = Date.now();
  const fresh = clarityCache && now - clarityCache.at < CLARITY_TTL_MS;
  const cooling = now - clarityLastCall < CLARITY_COOLDOWN_MS;
  if (clarityCache && (fresh || (input.force && cooling))) {
    return { ...clarityCache.data, stale: !fresh };
  }

  clarityLastCall = now;
  try {
    const days = Math.min(3, Math.max(1, input.days));
    const url = new URL("https://www.clarity.ms/export-data/api/v1/project-live-insights");
    url.searchParams.set("numOfDays", String(days));
    const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) throw new Error(`Clarity respondeu ${res.status}: ${await res.text()}`);
    const raw = (await res.json()) as ClarityRaw;
    const parsed = parseClarity(raw);
    const data: ClarityOverview = {
      ...parsed,
      updatedAt: new Date().toISOString(),
      stale: false,
      projectUrl: clarityProjectUrl(),
    };
    clarityCache = { at: now, data };
    return data;
  } catch (err) {
    if (clarityCache) return { ...clarityCache.data, stale: true };
    throw err;
  }
}
