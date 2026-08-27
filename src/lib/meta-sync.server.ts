/**
 * Sincronização da Meta (Instagram + Facebook) — server-only.
 * Roda apenas em rotas de servidor (/api/cron e /api/admin). Nada no navegador.
 */
import {
  AuthError,
  GraphError,
  GRAPH_VERSION,
  RateLimitAbort,
  createGraphClient,
  sanitize,
  type GraphClient,
} from "./meta-graph.server";
import { POST_ORIGIN } from "./social-shared";

const DAY_MS = 86_400_000;

export type MetaPlatform = "instagram" | "facebook";

type SyncResult = {
  platform: string;
  ok: boolean;
  status: "ok" | "partial" | "erro" | "nao_configurado";
  message: string;
  itemsSynced: number;
  rateLimitPct: number;
  notes: string[];
};

function env(name: string) {
  const value = (process.env[name] ?? "").trim();
  return value ? value : null;
}

function metaCredentials() {
  return {
    appId: env("META_APP_ID"),
    appSecret: env("META_APP_SECRET"),
    token: env("META_SYSTEM_USER_TOKEN"),
    igId: env("IG_BUSINESS_ACCOUNT_ID"),
    pageId: env("FB_PAGE_ID"),
  };
}

export function metaConfigured(platform: MetaPlatform) {
  const c = metaCredentials();
  const base = Boolean(c.appId && c.appSecret && c.token);
  return base && Boolean(platform === "instagram" ? c.igId : c.pageId);
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function fallbackExternalId(platform: string) {
  const c = metaCredentials();
  return (platform === "instagram" ? c.igId : c.pageId) ?? platform;
}

async function upsertAccount(platform: string, patch: Record<string, unknown>) {
  const db = await admin();
  // external_id é NOT NULL: em upserts que não trazem o id da API usamos o configurado.
  if (!("external_id" in patch)) patch = { external_id: fallbackExternalId(platform), ...patch };
  const { error } = await db
    .from("social_accounts")
    .upsert({ platform, ...patch }, { onConflict: "platform" });
  if (error) throw new Error(sanitize(error.message));
}

async function markNeedsReauth(platform: string, message: string) {
  await upsertAccount(platform, {
    status: "precisa_reautorizar",
    last_error: sanitize(message),
    last_error_at: new Date().toISOString(),
  });
}

async function saveDaily(
  platform: string,
  rows: { metric: string; date: string; value: number | null; source?: string }[],
) {
  const clean = rows.filter((r) => r.value != null && Number.isFinite(Number(r.value)));
  if (clean.length === 0) return 0;
  const db = await admin();
  const { error } = await db.from("social_metrics_daily").upsert(
    clean.map((r) => ({
      platform,
      metric: r.metric,
      date: r.date,
      value: Number(r.value),
      source: r.source ?? "api",
    })),
    { onConflict: "platform,metric,date" },
  );
  if (error) throw new Error(sanitize(error.message));
  return clean.length;
}

/* ============================ 6. SAÚDE DO TOKEN ============================ */

export type TokenHealth = {
  valid: boolean;
  tokenExpiresAt: string | null;
  dataAccessExpiresAt: string | null;
  scopes: string[];
  message: string;
};

export async function checkTokenHealth(): Promise<TokenHealth> {
  const { appId, appSecret, token } = metaCredentials();
  if (!appId || !appSecret || !token) {
    return {
      valid: false,
      tokenExpiresAt: null,
      dataAccessExpiresAt: null,
      scopes: [],
      message: "Credenciais da Meta ausentes no servidor.",
    };
  }

  const url = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/debug_token`);
  url.searchParams.set("input_token", token);
  url.searchParams.set("access_token", `${appId}|${appSecret}`);

  const response = await fetch(url.toString(), { headers: { accept: "application/json" } });
  const payload = (await response.json().catch(() => null)) as any;
  const data = payload?.data;
  if (!data) {
    return {
      valid: false,
      tokenExpiresAt: null,
      dataAccessExpiresAt: null,
      scopes: [],
      message: sanitize(payload?.error?.message ?? "Não foi possível validar o token."),
    };
  }

  const toIso = (unix: unknown) => {
    const n = Number(unix);
    return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString() : null;
  };

  return {
    valid: Boolean(data.is_valid),
    tokenExpiresAt: toIso(data.expires_at),
    dataAccessExpiresAt: toIso(data.data_access_expires_at),
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
    message: data.is_valid
      ? "Token válido."
      : sanitize(String(data.error?.message ?? "Token inválido.")),
  };
}

async function applyTokenHealth(platforms: MetaPlatform[]): Promise<TokenHealth> {
  const health = await checkTokenHealth();
  for (const platform of platforms) {
    await upsertAccount(platform, {
      token_expires_at: health.tokenExpiresAt,
      data_access_expires_at: health.dataAccessExpiresAt,
      scopes: health.scopes.length ? health.scopes : null,
      ...(health.valid
        ? {}
        : { status: "precisa_reautorizar", last_error: health.message, last_error_at: new Date().toISOString() }),
    });
  }
  return health;
}

/* ============================== 2/3/4. INSTAGRAM ============================== */

const IG_ACCOUNT_METRICS = [
  "reach",
  "views",
  "total_interactions",
  "accounts_engaged",
  "likes",
  "comments",
  "shares",
  "saves",
  "replies",
  "profile_links_taps",
  "follows_and_unfollows",
];

async function syncInstagramProfile(client: GraphClient, igId: string) {
  const profile = await client.get(igId, {
    fields: "id,username,name,profile_picture_url,followers_count,media_count",
  });

  const today = isoDate(new Date());
  await saveDaily("instagram", [
    { metric: "followers", date: today, value: profile.followers_count ?? null, source: "snapshot" },
    { metric: "media_count", date: today, value: profile.media_count ?? null, source: "snapshot" },
  ]);

  await upsertAccount("instagram", {
    external_id: String(profile.id),
    display_name: profile.name ?? profile.username ?? null,
    handle: profile.username ? `@${profile.username}` : null,
    profile_picture_url: profile.profile_picture_url ?? null,
    profile_url: profile.username ? `https://www.instagram.com/${profile.username}` : null,
    status: "conectado",
  });

  return profile;
}

/** total_value é agregado da janela: pedimos um dia por vez para ter série diária. */
async function syncInstagramInsightsForDay(client: GraphClient, igId: string, day: Date) {
  const since = Math.floor(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()) / 1000);
  const until = since + 86_400;
  const date = isoDate(day);

  const payload = await client.get(`${igId}/insights`, {
    metric: IG_ACCOUNT_METRICS.join(","),
    period: "day",
    metric_type: "total_value",
    since,
    until,
  });

  const rows: { metric: string; date: string; value: number | null }[] = [];
  for (const entry of payload?.data ?? []) {
    const value = entry?.total_value?.value;
    // Ausência de dado vem como lista vazia / undefined: gravamos nada, nunca zero.
    if (value == null) continue;
    rows.push({ metric: String(entry.name), date, value: Number(value) });
  }
  return saveDaily("instagram", rows);
}

/** reach aceita time_series: usamos para o backfill em blocos de 30 dias. */
async function backfillInstagramReach(client: GraphClient, igId: string, days: number) {
  let saved = 0;
  const end = new Date();
  for (let offset = 0; offset < days; offset += 30) {
    const until = new Date(end.getTime() - offset * DAY_MS);
    const since = new Date(until.getTime() - Math.min(30, days - offset) * DAY_MS);
    const payload = await client.get(`${igId}/insights`, {
      metric: "reach",
      period: "day",
      since: Math.floor(since.getTime() / 1000),
      until: Math.floor(until.getTime() / 1000),
    });
    const rows: { metric: string; date: string; value: number | null }[] = [];
    for (const entry of payload?.data ?? []) {
      for (const point of entry?.values ?? []) {
        if (point?.value == null || !point?.end_time) continue;
        rows.push({ metric: "reach", date: isoDate(new Date(point.end_time)), value: Number(point.value) });
      }
    }
    saved += await saveDaily("instagram", rows);
  }
  return saved;
}

const POST_FIELDS =
  "id,caption,media_type,media_product_type,permalink,thumbnail_url,timestamp,like_count,comments_count,saved_count,shares_count";
// view_count não é acessível fora da Business Discovery API: views vêm de /insights.

type IgMedia = any;

async function listInstagramMedia(client: GraphClient, igId: string, sinceIso: string | null) {
  const items: IgMedia[] = [];
  let page = await client.get(`${igId}/media`, { fields: POST_FIELDS, limit: 100 });
  for (;;) {
    for (const item of page?.data ?? []) {
      if (sinceIso && item.timestamp && item.timestamp <= sinceIso) return items;
      items.push(item);
    }
    const next = page?.paging?.next;
    // Só paramos quando paging.next some — nunca por "vieram menos que o limit".
    if (!next || items.length >= 500) return items;
    page = await client.getUrl(next);
  }
}

function insightMetricsFor(productType: string): string[] | null {
  switch (productType) {
    case "REELS":
      return ["reach", "views", "total_interactions", "saved", "shares", "ig_reels_avg_watch_time", "reels_skip_rate"];
    case "STORY":
      // Insights de story vivem 24h e exigem job próprio; fora do escopo do run diário.
      return null;
    case "AD":
      return null;
    default:
      return ["reach", "views", "total_interactions", "saved", "shares"];
  }
}

const BASIC_METRICS = ["reach", "views", "total_interactions"];

function readInsightValues(node: any) {
  const out: Record<string, number> = {};
  for (const entry of node?.data ?? []) {
    const value = entry?.values?.[0]?.value ?? entry?.total_value?.value;
    if (value == null || typeof value === "object") continue;
    out[String(entry.name)] = Number(value);
  }
  return out;
}

async function fetchInsightsBatch(
  client: GraphClient,
  ids: string[],
  metrics: string[],
): Promise<{ byId: Record<string, Record<string, number>>; unavailable: string | null }> {
  // O parâmetro ids foi descontinuado na v26.0: pedimos insight por mídia.
  const byId: Record<string, Record<string, number>> = {};
  let lastError: string | null = null;

  for (const id of ids) {
    try {
      byId[id] = readInsightValues(await client.get(`${id}/insights`, { metric: metrics.join(",") }));
    } catch (error) {
      if (error instanceof RateLimitAbort || error instanceof AuthError) throw error;
      const code = error instanceof GraphError ? error.code : null;
      if (code !== 100 && code !== 36104) {
        lastError = sanitize(error instanceof Error ? error.message : String(error));
        continue;
      }
      try {
        byId[id] = readInsightValues(await client.get(`${id}/insights`, { metric: BASIC_METRICS.join(",") }));
      } catch (fallbackError) {
        if (fallbackError instanceof RateLimitAbort || fallbackError instanceof AuthError) throw fallbackError;
        lastError = sanitize(
          fallbackError instanceof Error ? fallbackError.message : "Insights indisponíveis para esta mídia.",
        );
      }
    }
  }

  return { byId, unavailable: Object.keys(byId).length === 0 ? (lastError ?? "Insights indisponíveis.") : null };
}

async function syncInstagramPosts(client: GraphClient, igId: string, notes: string[]) {
  const db = await admin();
  const { data: lastRow } = await db
    .from("social_posts")
    .select("published_at")
    .eq("platform", "instagram")
    .eq("origin", POST_ORIGIN.api)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  // Cursores expiram: o incremental usa o timestamp do último post processado.
  const sinceIso: string | null = lastRow?.published_at ?? null;

  const media = await listInstagramMedia(client, igId, sinceIso);
  if (media.length === 0) return 0;

  const groups = new Map<string, IgMedia[]>();
  for (const item of media) {
    const type = String(item.media_product_type ?? "FEED");
    if (type === "STORY") {
      notes.push("Stories ignorados: insights expiram em 24h e exigem job dedicado.");
      continue;
    }
    if (type === "AD") continue;
    const list = groups.get(type) ?? [];
    list.push(item);
    groups.set(type, list);
  }

  const insights: Record<string, Record<string, number>> = {};
  const unavailable: Record<string, string> = {};

  for (const [type, items] of groups) {
    const metrics = insightMetricsFor(type);
    if (!metrics) continue;
    for (let i = 0; i < items.length; i += 50) {
      const chunk = items.slice(i, i + 50);
      const ids = chunk.map((m) => String(m.id));
      const result = await fetchInsightsBatch(client, ids, metrics);
      if (result.unavailable) {
        for (const id of ids) unavailable[id] = result.unavailable;
        continue;
      }
      Object.assign(insights, result.byId);
    }
  }

  const nowIso = new Date().toISOString();
  const rows = media
    .filter((m) => String(m.media_product_type ?? "FEED") !== "AD")
    .map((m) => {
      const id = String(m.id);
      const ins = insights[id] ?? {};
      const reason = unavailable[id] ?? null;
      const caption: string | null = m.caption ?? null;
      return {
        platform: "instagram",
        content_id: id,
        origin: POST_ORIGIN.api,
        caption,
        title: caption ? caption.slice(0, 140) : null,
        media_type: m.media_type ?? null,
        media_product_type: m.media_product_type ?? null,
        permalink: m.permalink ?? null,
        url: m.permalink ?? null,
        thumbnail_url: m.thumbnail_url ?? null,
        published_at: m.timestamp ?? null,
        likes: m.like_count ?? null,
        comments: m.comments_count ?? null,
        saves: m.saved_count ?? ins["saved"] ?? null,
        shares: m.shares_count ?? ins["shares"] ?? null,
        views: ins["views"] ?? null,
        reach: ins["reach"] ?? null,
        engagements: ins["total_interactions"] ?? null,
        avg_watch_time: ins["ig_reels_avg_watch_time"] ?? null,
        skip_rate: ins["reels_skip_rate"] ?? null,
        metrics_available: !reason,
        metrics_unavailable_reason: reason,
        last_synced_at: nowIso,
      };
    });

  const { error } = await db.from("social_posts").upsert(rows, { onConflict: "platform,content_id" });
  if (error) throw new Error(sanitize(error.message));
  return rows.length;
}

async function syncInstagram(client: GraphClient, igId: string): Promise<Omit<SyncResult, "platform">> {
  const notes: string[] = [];
  let items = 0;

  await syncInstagramProfile(client, igId);
  items += 1;

  const db = await admin();
  const { count } = await db
    .from("social_metrics_daily")
    .select("id", { count: "exact", head: true })
    .eq("platform", "instagram")
    .eq("metric", "reach");
  const firstRun = !count || count === 0;

  if (firstRun) {
    items += await backfillInstagramReach(client, igId, 90);
    notes.push("Backfill inicial de 90 dias (alcance) executado.");
  }

  // Dados da Meta atrasam até 48h: re-sincronizamos sempre os últimos 3 dias.
  for (let offset = 1; offset <= 3; offset++) {
    items += await syncInstagramInsightsForDay(client, igId, new Date(Date.now() - offset * DAY_MS));
  }

  items += await syncInstagramPosts(client, igId, notes);

  await upsertAccount("instagram", {
    status: "conectado",
    last_sync_at: new Date().toISOString(),
    last_error: null,
  });

  return {
    ok: true,
    status: "ok",
    message: "Instagram sincronizado.",
    itemsSynced: items,
    rateLimitPct: client.usagePct(),
    notes: Array.from(new Set(notes)),
  };
}

/* ================================ 5. FACEBOOK ================================ */

const MIRROR_NOTICE =
  "Métricas de engajamento indisponíveis: conteúdo publicado via espelhamento automático do Instagram não gera insight próprio no Facebook.";

async function syncFacebook(client: GraphClient, pageId: string): Promise<Omit<SyncResult, "platform">> {
  const notes: string[] = [];
  let items = 0;

  const page = await client.get(pageId, { fields: "id,name,fan_count,followers_count" });
  const today = isoDate(new Date());
  items += await saveDaily("facebook", [
    { metric: "fan_count", date: today, value: page.fan_count ?? null, source: "snapshot" },
    { metric: "followers", date: today, value: page.followers_count ?? null, source: "snapshot" },
  ]);

  await upsertAccount("facebook", {
    external_id: String(page.id),
    display_name: page.name ?? null,
    profile_url: `https://www.facebook.com/${page.id}`,
    status: "conectado",
  });

  let mirrored = false;
  try {
    const insights = await client.get(`${pageId}/insights`, {
      metric: "page_total_media_view_unique,page_follows",
      period: "day",
    });
    const rows: { metric: string; date: string; value: number | null }[] = [];
    for (const entry of insights?.data ?? []) {
      for (const point of entry?.values ?? []) {
        if (point?.value == null || typeof point.value === "object" || !point?.end_time) continue;
        rows.push({ metric: String(entry.name), date: isoDate(new Date(point.end_time)), value: Number(point.value) });
      }
    }
    if (rows.length === 0) {
      mirrored = true;
    } else {
      items += await saveDaily("facebook", rows);
    }
  } catch (error) {
    if (error instanceof RateLimitAbort || error instanceof AuthError) throw error;
    notes.push(sanitize(error instanceof Error ? error.message : String(error)));
  }

  await upsertAccount("facebook", {
    status: "conectado",
    last_sync_at: new Date().toISOString(),
    last_error: mirrored ? MIRROR_NOTICE : null,
    last_error_at: mirrored ? new Date().toISOString() : null,
  });
  if (mirrored) notes.push(MIRROR_NOTICE);

  return {
    ok: true,
    status: "ok",
    message: mirrored ? MIRROR_NOTICE : "Facebook sincronizado.",
    itemsSynced: items,
    rateLimitPct: client.usagePct(),
    notes,
  };
}

/* ================================ ORQUESTRAÇÃO ================================ */

/** Busca o Page Access Token da página configurada (sem ele, insights retornam #190/#36104). */
async function resolvePageToken(client: GraphClient, pageId: string | null) {
  if (!pageId) return null;
  const payload = await client.get("me/accounts", { fields: "id,access_token", limit: 200 });
  for (const page of payload?.data ?? []) {
    if (String(page.id) === String(pageId)) return (page.access_token as string) ?? null;
  }
  return null;
}

async function startRun(platform: string) {
  const db = await admin();
  const { data } = await db
    .from("social_sync_runs")
    .insert({ platform, status: "running", started_at: new Date().toISOString() })
    .select("id")
    .maybeSingle();
  return data?.id as string | undefined;
}

async function finishRun(id: string | undefined, patch: Record<string, unknown>) {
  if (!id) return;
  const db = await admin();
  await db.from("social_sync_runs").update({ finished_at: new Date().toISOString(), ...patch }).eq("id", id);
}

export async function runMetaSync(platforms?: string[]): Promise<{ ranAt: string; results: SyncResult[] }> {
  const targets = (["instagram", "facebook"] as MetaPlatform[]).filter(
    (p) => !platforms?.length || platforms.includes(p),
  );
  const ranAt = new Date().toISOString();
  const results: SyncResult[] = [];
  const { appSecret, token, igId, pageId } = metaCredentials();

  const configured = targets.filter((p) => metaConfigured(p));
  for (const platform of targets.filter((p) => !metaConfigured(p))) {
    results.push({
      platform,
      ok: false,
      status: "nao_configurado",
      message: "Credenciais da Meta ausentes no servidor.",
      itemsSynced: 0,
      rateLimitPct: 0,
      notes: [],
    });
  }
  if (configured.length === 0) return { ranAt, results };

  const health = await applyTokenHealth(configured);
  if (!health.valid) {
    for (const platform of configured) {
      results.push({
        platform,
        ok: false,
        status: "erro",
        message: health.message,
        itemsSynced: 0,
        rateLimitPct: 0,
        notes: [],
      });
    }
    return { ranAt, results };
  }

  // Insights (IG e Página) exigem Page Access Token; o token de usuário só serve para leituras básicas.
  const userClient = createGraphClient(token!, appSecret!);
  let client = userClient;
  try {
    const pageToken = await resolvePageToken(userClient, pageId);
    if (pageToken) client = createGraphClient(pageToken, appSecret!);
  } catch (error) {
    if (error instanceof AuthError || error instanceof RateLimitAbort) throw error;
  }

  for (const platform of configured) {
    const runId = await startRun(platform);
    try {
      const outcome =
        platform === "instagram"
          ? await syncInstagram(client, igId!)
          : await syncFacebook(client, pageId!);
      results.push({ platform, ...outcome });
      await finishRun(runId, {
        status: outcome.status,
        items_synced: outcome.itemsSynced,
        rate_limit_pct: Math.round(outcome.rateLimitPct),
        error_message: outcome.notes[0] ?? null,
      });
    } catch (error) {
      const message = sanitize(error instanceof Error ? error.message : String(error));
      console.error("[meta-sync]", platform, error instanceof Error ? error.stack : error);
      const rateLimited = error instanceof RateLimitAbort;
      if (error instanceof AuthError) await markNeedsReauth(platform, message);
      else {
        await upsertAccount(platform, { last_error: message, last_error_at: new Date().toISOString() });
      }
      results.push({
        platform,
        ok: false,
        status: rateLimited ? "partial" : "erro",
        message,
        itemsSynced: 0,
        rateLimitPct: client.usagePct(),
        notes: [],
      });
      await finishRun(runId, {
        status: rateLimited ? "partial" : "erro",
        error_message: message,
        rate_limit_pct: Math.round(client.usagePct()),
      });
      // Rate limit ou token inválido: paramos todas as chamadas deste token.
      if (rateLimited || error instanceof AuthError) break;
    }
  }

  return { ranAt, results };
}

/** Teste leve: debug_token + uma leitura de perfil. */
export async function testMetaConnection(platform: MetaPlatform) {
  const { appSecret, token, igId, pageId } = metaCredentials();
  if (!metaConfigured(platform)) {
    return {
      platform,
      ok: false,
      credentialsConfigured: false,
      message: "Credenciais da Meta ausentes no servidor.",
    };
  }

  const health = await checkTokenHealth();
  if (!health.valid) {
    await markNeedsReauth(platform, health.message);
    return { platform, ok: false, credentialsConfigured: true, message: health.message, health };
  }

  let client = createGraphClient(token!, appSecret!);
  try {
    const pageToken = await resolvePageToken(client, pageId);
    if (pageToken) client = createGraphClient(pageToken, appSecret!);
  } catch { /* segue com o token de usuário */ }
  try {
    const profile =
      platform === "instagram"
        ? await client.get(igId!, { fields: "id,username,name" })
        : await client.get(pageId!, { fields: "id,name" });
    return {
      platform,
      ok: true,
      credentialsConfigured: true,
      message: `Conexão OK: ${profile.name ?? profile.username ?? profile.id}`,
      health,
    };
  } catch (error) {
    const message = sanitize(error instanceof Error ? error.message : String(error));
    if (error instanceof AuthError) await markNeedsReauth(platform, message);
    return { platform, ok: false, credentialsConfigured: true, message, health };
  }
}
