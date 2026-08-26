/**
 * Cockpit Social — camada server-only.
 * Só agrega o que existe no banco (publicações, métricas importadas, leads/UTMs, newsletter)
 * e, quando conectado, sessões do GA4. Nada é estimado.
 */
import {
  editorialLineIds,
  emptyMetrics,
  platformIds,
  socialPlatforms,
  type SocialAccountStatus,
  type SocialAggregate,
  type SocialFilters,
  type SocialMetrics,
  type SocialOverview,
  type SocialPostRow,
  type SocialSeriesPoint,
} from "./social-shared";

type StaffCtx = { supabase: any; userId: string; claims: Record<string, unknown> };

const metricKeys: (keyof SocialMetrics)[] = [
  "reach",
  "impressions",
  "views",
  "engagements",
  "shares",
  "saves",
  "clicks",
  "plays",
  "listeners",
  "watchTimeSeconds",
  "avgViewSeconds",
  "retentionRate",
];

function blankAggregate(): SocialAggregate {
  return {
    ...emptyMetrics,
    posts: 0,
    leads: 0,
    qualifiedLeads: 0,
    clients: 0,
    deals: 0,
    sessions: null,
    followers: null,
    followersGrowth: null,
  };
}

function addMetric(a: number | null, b: number | null) {
  if (a == null && b == null) return null;
  return (a ?? 0) + (b ?? 0);
}

function mergeMetrics(target: SocialMetrics, add: SocialMetrics) {
  for (const k of metricKeys) {
    if (k === "retentionRate" || k === "avgViewSeconds") continue;
    (target as any)[k] = addMetric(target[k], add[k]);
  }
  // médias: mantém a última leitura disponível apenas quando o alvo ainda está vazio
  if (target.avgViewSeconds == null) target.avgViewSeconds = add.avgViewSeconds;
  if (target.retentionRate == null) target.retentionRate = add.retentionRate;
}

function rowMetrics(rows: any[]): SocialMetrics {
  const out: SocialMetrics = { ...emptyMetrics };
  for (const r of rows) {
    mergeMetrics(out, {
      reach: r.reach ?? null,
      impressions: r.impressions ?? null,
      views: r.views ?? null,
      engagements: r.engagements ?? null,
      shares: r.shares ?? null,
      saves: r.saves ?? null,
      clicks: r.clicks ?? null,
      plays: r.plays ?? null,
      listeners: r.listeners ?? null,
      watchTimeSeconds: r.watch_time_seconds ?? null,
      avgViewSeconds: r.avg_view_seconds ?? null,
      retentionRate: r.retention_rate == null ? null : Number(r.retention_rate),
    });
  }
  return out;
}

function normalizePlatform(raw?: string | null) {
  const v = (raw ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v.includes("insta") || v === "ig") return "instagram";
  if (v.includes("face") || v === "fb" || v === "meta") return "facebook";
  if (v.includes("linkedin") || v === "li") return "linkedin";
  if (v.includes("tiktok") || v === "tt") return "tiktok";
  if (v.includes("youtube") || v === "yt") return "youtube";
  if (v.includes("spotify")) return "spotify";
  return null;
}

const dealStatuses = new Set(["Negócio fechado"]);
const clientStatuses = new Set(["Cliente", "Negócio fechado"]);
const qualifiedStatuses = new Set(["Qualificado", "Cliente", "Negócio fechado"]);

type LeadRow = {
  created_at: string;
  status: string;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

/** Requisitos técnicos por plataforma — exibidos nos empty states e em /admin/integracoes. */
export const platformRequirements: Record<string, string[]> = {
  instagram: [
    "Conta profissional (Business) do Instagram vinculada à Página do Facebook",
    "App no Meta for Developers com Instagram Graph API",
    "OAuth do administrador com permissões instagram_basic e instagram_manage_insights",
    "Instagram Business Account ID",
  ],
  facebook: [
    "Página oficial do Facebook da Atual",
    "App no Meta for Developers (mesmo app do Instagram)",
    "OAuth com pages_read_engagement e read_insights",
    "Page ID e Page Access Token de longa duração (armazenado só no servidor)",
  ],
  linkedin: [
    "Organization ID/URN da página da Atual",
    "LinkedIn Developer App com produto Community Management API aprovado",
    "OAuth de um administrador da organização",
    "Scopes r_organization_social e rw_organization_admin",
  ],
  tiktok: [
    "TikTok Developer App aprovado",
    "Conta business da Atual e Account ID",
    "OAuth com scopes user.info.stats e video.list",
  ],
  youtube: [
    "Canal oficial da Atual no YouTube",
    "Projeto no Google Cloud com YouTube Data API v3 habilitada",
    "OAuth do proprietário do canal para a YouTube Analytics API (watch time e retenção)",
    "Channel ID",
  ],
  spotify: [
    "Exportação CSV do Spotify for Creators (analytics privados não têm API pública)",
    "Importar em /admin/social/spotify/importar",
  ],
};

const platformSecretEnv: Record<string, string[]> = {
  instagram: ["META_APP_ID", "META_APP_SECRET", "INSTAGRAM_BUSINESS_ACCOUNT_ID"],
  facebook: ["META_APP_ID", "META_APP_SECRET", "FACEBOOK_PAGE_ID"],
  linkedin: ["LINKEDIN_CLIENT_ID", "LINKEDIN_CLIENT_SECRET", "LINKEDIN_ORGANIZATION_ID"],
  tiktok: ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"],
  youtube: ["YOUTUBE_API_KEY"],
  spotify: [],
};

function credentialsConfigured(platform: string) {
  const keys = platformSecretEnv[platform] ?? [];
  if (keys.length === 0) return false;
  return keys.every((k) => Boolean((process.env[k] ?? "").trim()));
}

export async function fetchSocialAccounts(ctx: StaffCtx): Promise<SocialAccountStatus[]> {
  const { data } = await ctx.supabase.from("social_accounts").select("*");
  const rows = (data ?? []) as any[];
  return socialPlatforms.map((p) => {
    const row = rows.find((r) => r.platform === p.id);
    return {
      platform: p.id,
      displayName: row?.display_name ?? p.label,
      handle: row?.handle ?? null,
      profileUrl: row?.profile_url ?? null,
      status: (row?.status as SocialAccountStatus["status"]) ?? "nao_conectado",
      lastSyncAt: row?.last_sync_at ?? null,
      lastError: row?.last_error ?? null,
      credentialsConfigured: credentialsConfigured(p.id),
      requirements: platformRequirements[p.id] ?? [],
    };
  });
}

export async function fetchSocialOverview(
  ctx: StaffCtx,
  filters: SocialFilters,
): Promise<SocialOverview> {
  const platforms = filters.platforms.length ? filters.platforms : platformIds;
  const lines = filters.editorialLines;
  const types = filters.contentTypes;

  let postQuery = ctx.supabase
    .from("social_posts")
    .select(
      "id, platform, editorial_line, content_type, title, url, thumbnail_url, published_at, campaign, utm_campaign, utm_content, cms_content_id, editorial_content ( titulo )",
    )
    .in("platform", platforms)
    .order("published_at", { ascending: false })
    .limit(500);
  if (filters.from) postQuery = postQuery.gte("published_at", filters.from);
  if (filters.to) postQuery = postQuery.lte("published_at", filters.to);
  if (lines.length) postQuery = postQuery.in("editorial_line", lines);
  if (types.length) postQuery = postQuery.in("content_type", types);

  const { data: postData } = await postQuery;
  const postRows = (postData ?? []) as any[];
  const postIds = postRows.map((p) => p.id);

  const { data: metricData } = postIds.length
    ? await ctx.supabase.from("social_post_metrics").select("*").in("post_id", postIds)
    : { data: [] as any[] };
  const metricRows = (metricData ?? []) as any[];

  let dailyQuery = ctx.supabase
    .from("social_platform_daily")
    .select("*")
    .in("platform", platforms)
    .order("metric_date", { ascending: true });
  if (filters.from) dailyQuery = dailyQuery.gte("metric_date", filters.from.slice(0, 10));
  if (filters.to) dailyQuery = dailyQuery.lte("metric_date", filters.to.slice(0, 10));
  const { data: dailyData } = await dailyQuery;
  const dailyRows = (dailyData ?? []) as any[];

  // Leads e newsletter — atribuição por UTM já capturada nos formulários do site.
  let leadQuery = ctx.supabase
    .from("leads")
    .select("created_at, status, utm_source, utm_campaign, utm_content")
    .eq("is_teste", false)
    .not("utm_source", "is", null);
  if (filters.from) leadQuery = leadQuery.gte("created_at", filters.from);
  if (filters.to) leadQuery = leadQuery.lte("created_at", filters.to);
  const { data: leadData } = await leadQuery;
  const leadRows = ((leadData ?? []) as LeadRow[]).filter((l) => {
    const p = normalizePlatform(l.utm_source);
    return p != null && platforms.includes(p);
  });

  let previousLeads: LeadRow[] = [];
  if (filters.previousFrom && filters.previousTo) {
    const { data: prev } = await ctx.supabase
      .from("leads")
      .select("created_at, status, utm_source, utm_campaign, utm_content")
      .eq("is_teste", false)
      .not("utm_source", "is", null)
      .gte("created_at", filters.previousFrom)
      .lte("created_at", filters.previousTo);
    previousLeads = ((prev ?? []) as LeadRow[]).filter((l) => {
      const p = normalizePlatform(l.utm_source);
      return p != null && platforms.includes(p);
    });
  }

  let newsQuery = ctx.supabase
    .from("newsletter_subscribers")
    .select("created_at, utm_source, momento_atual, cripto_wine, vida_atual")
    .eq("is_teste", false);
  if (filters.from) newsQuery = newsQuery.gte("created_at", filters.from);
  if (filters.to) newsQuery = newsQuery.lte("created_at", filters.to);
  const { data: newsData } = await newsQuery;
  const newsRows = (newsData ?? []) as any[];

  // GA4 (sessões por origem de tráfego) — opcional.
  let ga4Sessions: Record<string, number> | null = null;
  let ga4Reason: string | null = null;
  const { ga4Configured, ga4Dimension } = await import("./cockpit.server");
  const ga4On = ga4Configured();
  if (ga4On && filters.from && filters.to) {
    try {
      const sources = await ga4Dimension(
        filters.from.slice(0, 10),
        filters.to.slice(0, 10),
        "sessionSource",
        50,
      );
      ga4Sessions = {};
      for (const s of sources) {
        const p = normalizePlatform(s.label);
        if (p) ga4Sessions[p] = (ga4Sessions[p] ?? 0) + s.sessions;
      }
    } catch (error) {
      ga4Reason = (error as Error).message;
    }
  } else if (!ga4On) {
    ga4Reason = "Conecte o Google Analytics 4 para ver sessões atribuídas às redes.";
  }


  // ---------- montagem ----------
  const metricsByPost = new Map<string, any[]>();
  for (const m of metricRows) {
    const list = metricsByPost.get(m.post_id) ?? [];
    list.push(m);
    metricsByPost.set(m.post_id, list);
  }

  const leadsByPost = new Map<string, LeadRow[]>();
  const leadsByPlatform = new Map<string, LeadRow[]>();
  const postByUtmContent = new Map<string, any>();
  for (const p of postRows) {
    if (p.utm_content) postByUtmContent.set(String(p.utm_content).toLowerCase(), p);
  }
  for (const l of leadRows) {
    const platform = normalizePlatform(l.utm_source)!;
    leadsByPlatform.set(platform, [...(leadsByPlatform.get(platform) ?? []), l]);
    const key = (l.utm_content ?? "").toLowerCase();
    const post = key ? postByUtmContent.get(key) : null;
    if (post) leadsByPost.set(post.id, [...(leadsByPost.get(post.id) ?? []), l]);
  }

  function countLeads(list: LeadRow[]) {
    return {
      leads: list.length,
      qualifiedLeads: list.filter((l) => qualifiedStatuses.has(l.status)).length,
      clients: list.filter((l) => clientStatuses.has(l.status)).length,
      deals: list.filter((l) => dealStatuses.has(l.status)).length,
    };
  }

  const posts: SocialPostRow[] = postRows.map((p) => {
    const leads = leadsByPost.get(p.id) ?? [];
    const c = countLeads(leads);
    return {
      id: p.id,
      platform: p.platform,
      editorialLine: p.editorial_line,
      contentType: p.content_type,
      title: p.title,
      url: p.url,
      thumbnailUrl: p.thumbnail_url,
      publishedAt: p.published_at,
      campaign: p.campaign,
      utmContent: p.utm_content,
      utmCampaign: p.utm_campaign,
      cmsContentId: p.cms_content_id,
      cmsTitle: p.editorial_content?.titulo ?? null,
      metrics: rowMetrics(metricsByPost.get(p.id) ?? []),
      ...c,
    };
  });

  function aggregate(subset: SocialPostRow[], platformScope?: string[]): SocialAggregate {
    const agg = blankAggregate();
    agg.posts = subset.length;
    for (const p of subset) {
      mergeMetrics(agg, p.metrics);
      agg.leads += p.leads;
      agg.qualifiedLeads += p.qualifiedLeads;
      agg.clients += p.clients;
      agg.deals += p.deals;
    }
    if (platformScope) {
      // leads por UTM existem mesmo sem publicação cadastrada
      const list = platformScope.flatMap((pl) => leadsByPlatform.get(pl) ?? []);
      const c = countLeads(list);
      agg.leads = c.leads;
      agg.qualifiedLeads = c.qualifiedLeads;
      agg.clients = c.clients;
      agg.deals = c.deals;
      if (ga4Sessions) {
        agg.sessions = platformScope.reduce((sum, pl) => sum + (ga4Sessions![pl] ?? 0), 0);
      }
      const daily = dailyRows.filter((d) => platformScope.includes(d.platform));
      if (daily.length) {
        const last = daily[daily.length - 1];
        agg.followers = last.followers ?? null;
        const gained = daily.reduce<number | null>((a, d) => addMetric(a, d.followers_gained ?? null), null);
        const lost = daily.reduce<number | null>((a, d) => addMetric(a, d.followers_lost ?? null), null);
        agg.followersGrowth = gained == null && lost == null ? null : (gained ?? 0) - (lost ?? 0);
        for (const d of daily) {
          mergeMetrics(agg, {
            ...emptyMetrics,
            reach: d.reach ?? null,
            impressions: d.impressions ?? null,
            views: d.views ?? null,
            engagements: d.engagements ?? null,
            clicks: d.clicks ?? null,
          });
        }
      }
    }
    return agg;
  }

  const kpis = { ...aggregate(posts, platforms) } as SocialOverview["kpis"];

  const prevCounts = countLeads(previousLeads);
  const previous: SocialOverview["previous"] = filters.previousFrom
    ? {
        ...blankAggregate(),
        ...prevCounts,
        followers: null,
        followersGrowth: null,
      }
    : null;

  const byPlatform = platforms.map((pl) => ({
    platform: pl,
    ...aggregate(
      posts.filter((p) => p.platform === pl),
      [pl],
    ),
  }));

  const activeLines = lines.length ? lines : editorialLineIds;
  const newsletterByEditorial = [
    { editorialLine: "momento_atual", subscribers: newsRows.filter((n) => n.momento_atual).length },
    { editorialLine: "cripto_wine", subscribers: newsRows.filter((n) => n.cripto_wine).length },
    { editorialLine: "vida_atual", subscribers: newsRows.filter((n) => n.vida_atual).length },
  ];

  const byEditorial = activeLines.map((line) => ({
    editorialLine: line,
    ...aggregate(posts.filter((p) => p.editorialLine === line)),
    newsletter: newsletterByEditorial.find((n) => n.editorialLine === line)?.subscribers ?? 0,
  }));

  const activeTypes = types.length ? types : Array.from(new Set(posts.map((p) => p.contentType)));
  const byFormat = activeTypes.map((t) => ({
    contentType: t,
    ...aggregate(posts.filter((p) => p.contentType === t)),
  }));

  const matrix = activeLines.flatMap((line) =>
    platforms.map((pl) => ({
      editorialLine: line,
      platform: pl,
      value: aggregate(posts.filter((p) => p.editorialLine === line && p.platform === pl)),
    })),
  );

  // Série temporal por dia/plataforma
  const seriesMap = new Map<string, SocialSeriesPoint>();
  function pointFor(date: string, platform: string) {
    const key = `${date}|${platform}`;
    let point = seriesMap.get(key);
    if (!point) {
      point = { date, platform, reach: null, views: null, engagements: null, clicks: null, followers: null, leads: 0 };
      seriesMap.set(key, point);
    }
    return point;
  }
  const postPlatformById = new Map(postRows.map((p) => [p.id, p.platform as string]));
  for (const m of metricRows) {
    const platform = postPlatformById.get(m.post_id);
    if (!platform) continue;
    const point = pointFor(String(m.metric_date), platform);
    point.reach = addMetric(point.reach, m.reach ?? null);
    point.views = addMetric(point.views, m.views ?? null);
    point.engagements = addMetric(point.engagements, m.engagements ?? null);
    point.clicks = addMetric(point.clicks, m.clicks ?? null);
  }
  for (const d of dailyRows) {
    const point = pointFor(String(d.metric_date), d.platform);
    point.followers = d.followers ?? point.followers;
    point.reach = addMetric(point.reach, d.reach ?? null);
    point.views = addMetric(point.views, d.views ?? null);
    point.engagements = addMetric(point.engagements, d.engagements ?? null);
    point.clicks = addMetric(point.clicks, d.clicks ?? null);
  }
  for (const l of leadRows) {
    const platform = normalizePlatform(l.utm_source)!;
    pointFor(l.created_at.slice(0, 10), platform).leads += 1;
  }
  const series = [...seriesMap.values()].sort((a, b) => a.date.localeCompare(b.date));

  const cadenceMap = new Map<string, { platform: string; editorialLine: string; contentType: string; posts: number }>();
  for (const p of posts) {
    const key = `${p.platform}|${p.editorialLine}|${p.contentType}`;
    const row = cadenceMap.get(key) ?? {
      platform: p.platform,
      editorialLine: p.editorialLine,
      contentType: p.contentType,
      posts: 0,
    };
    row.posts += 1;
    cadenceMap.set(key, row);
  }

  const leadsBySource = platforms.map((pl) => ({
    platform: pl,
    ...countLeads(leadsByPlatform.get(pl) ?? []),
  }));

  const episodes = posts
    .filter((p) => p.platform === "spotify" || p.contentType === "podcast")
    .map((p) => ({
      id: p.id,
      title: p.title,
      publishedAt: p.publishedAt,
      plays: p.metrics.plays,
      listeners: p.metrics.listeners,
      watchTimeSeconds: p.metrics.watchTimeSeconds,
      avgViewSeconds: p.metrics.avgViewSeconds,
      retentionRate: p.metrics.retentionRate,
      leads: p.leads,
    }));

  const funnel = {
    reach: kpis.reach,
    clicks: kpis.clicks,
    sessions: kpis.sessions,
    leads: kpis.leads,
    qualifiedLeads: kpis.qualifiedLeads,
    clients: kpis.clients,
    deals: kpis.deals,
  };

  return {
    kpis,
    previous,
    byPlatform,
    byEditorial,
    byFormat,
    matrix,
    series,
    posts,
    funnel,
    cadence: [...cadenceMap.values()].sort((a, b) => b.posts - a.posts),
    leadsBySource,
    newsletterByEditorial,
    episodes,
    accounts: await fetchSocialAccounts(ctx),
    ga4Configured: ga4On,
    ga4Reason,
    generatedAt: new Date().toISOString(),
  };
}

/* ------------------------------------------------------------------ *
 * Importação CSV do Spotify for Creators
 * ------------------------------------------------------------------ */

export type SpotifyImportRow = {
  episode: string;
  publishedAt: string | null;
  plays: number | null;
  listeners: number | null;
  totalSeconds: number | null;
  avgSeconds: number | null;
};

export async function importSpotifyRows(
  ctx: StaffCtx,
  input: { rows: SpotifyImportRow[]; fileName: string | null; overwrite: boolean },
) {
  let imported = 0;
  let skipped = 0;
  const dates: string[] = [];

  for (const row of input.rows) {
    const title = row.episode?.trim();
    if (!title) {
      skipped += 1;
      continue;
    }
    const externalId = `csv:${title.toLowerCase().replace(/\s+/g, "-").slice(0, 120)}`;
    const publishedAt = row.publishedAt ?? new Date().toISOString();
    dates.push(publishedAt.slice(0, 10));

    const { data: existing } = await ctx.supabase
      .from("social_posts")
      .select("id")
      .eq("platform", "spotify")
      .eq("external_id", externalId)
      .maybeSingle();

    let postId = existing?.id as string | undefined;
    if (!postId) {
      const { data: created, error } = await ctx.supabase
        .from("social_posts")
        .insert({
          platform: "spotify",
          editorial_line: "cripto_wine",
          content_type: "podcast",
          external_id: externalId,
          title,
          published_at: publishedAt,
          utm_source: "spotify",
          utm_medium: "podcast",
          origin: "csv_spotify",
        })
        .select("id")
        .single();
      if (error) {
        skipped += 1;
        continue;
      }
      postId = created.id as string;
    }

    const metricDate = publishedAt.slice(0, 10);
    const { data: existingMetric } = await ctx.supabase
      .from("social_post_metrics")
      .select("id")
      .eq("post_id", postId)
      .eq("metric_date", metricDate)
      .maybeSingle();

    if (existingMetric && !input.overwrite) {
      skipped += 1;
      continue;
    }

    const payload = {
      post_id: postId,
      metric_date: metricDate,
      plays: row.plays,
      listeners: row.listeners,
      watch_time_seconds: row.totalSeconds,
      avg_view_seconds: row.avgSeconds,
    };
    const { error: metricError } = existingMetric
      ? await ctx.supabase.from("social_post_metrics").update(payload).eq("id", existingMetric.id)
      : await ctx.supabase.from("social_post_metrics").insert(payload);
    if (metricError) {
      skipped += 1;
      continue;
    }
    imported += 1;
  }

  const sorted = dates.sort();
  await ctx.supabase.from("social_imports").insert({
    platform: "spotify",
    kind: "csv",
    file_name: input.fileName,
    rows_imported: imported,
    rows_skipped: skipped,
    period_from: sorted[0] ?? null,
    period_to: sorted[sorted.length - 1] ?? null,
    imported_by: ctx.userId,
  });

  // A linha de social_accounts só existe quando houve conexão/importação real.
  if (imported > 0) {
    await ctx.supabase.from("social_accounts").upsert(
      {
        platform: "spotify",
        external_id: "csv:spotify",
        display_name: "Spotify",
        status: "conectado",
        last_sync_at: new Date().toISOString(),
        last_error: null,
      },
      { onConflict: "platform" },
    );
  }

  return { imported, skipped };
}
