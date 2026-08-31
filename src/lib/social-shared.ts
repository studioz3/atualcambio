/**
 * Cockpit Social — vocabulário, taxonomia e contratos (client-safe).
 * Nenhum dado fictício: apenas catálogos, tipos e helpers de leitura.
 */

export const socialPlatforms = [
  { id: "instagram", label: "Instagram", utmSource: "instagram", utmMedium: "social", dot: "#E1306C" },
  { id: "facebook", label: "Facebook", utmSource: "facebook", utmMedium: "social", dot: "#1877F2" },
  { id: "linkedin", label: "LinkedIn", utmSource: "linkedin", utmMedium: "social", dot: "#0A66C2" },
  { id: "tiktok", label: "TikTok", utmSource: "tiktok", utmMedium: "social", dot: "#25F4EE" },
  { id: "youtube", label: "YouTube", utmSource: "youtube", utmMedium: "social", dot: "#FF0000" },
  { id: "spotify", label: "Spotify", utmSource: "spotify", utmMedium: "podcast", dot: "#1DB954" },
] as const;

export type PlatformId = (typeof socialPlatforms)[number]["id"];
export const platformIds = socialPlatforms.map((p) => p.id) as PlatformId[];

/**
 * Origem do registro em social_posts.
 * A coluna tem default 'manual'; TODO post vindo de API precisa gravar POST_ORIGIN.api
 * explicitamente, senão o painel não distingue importado de cadastrado à mão.
 */
export const POST_ORIGIN = {
  manual: "manual",
  api: "api",
  csvSpotify: "csv_spotify",
} as const;

export function platformLabel(id: string) {
  return socialPlatforms.find((p) => p.id === id)?.label ?? id;
}
export function platformDot(id: string) {
  return socialPlatforms.find((p) => p.id === id)?.dot ?? "#D0A32E";
}

/** Linhas editoriais ativas no MVP. Partners/Academy já existem na arquitetura, mas não são exibidas. */
export const editorialLines = [
  { id: "momento_atual", label: "Momento Atual", hint: "Economia, política, mercados e mundo." },
  { id: "cripto_wine", label: "Cripto Wine", hint: "Vinho, tecnologia, mercado e cultura." },
  { id: "vida_atual", label: "Vida Atual", hint: "Wellness, comportamento e qualidade de vida." },
  { id: "comercial", label: "Comercial", hint: "Produtos, serviços, conversão." },
  { id: "institucional", label: "Institucional", hint: "Marca, segurança, posicionamento." },
  { id: "nao_classificada", label: "Não classificada", hint: "Publicações ainda sem taxonomia." },
] as const;

/** Reservadas para fases futuras — não aparecem nos filtros do MVP. */
export const futureEditorialLines = ["partners", "academy"] as const;

export type EditorialLineId = (typeof editorialLines)[number]["id"];
export const editorialLineIds = editorialLines.map((e) => e.id) as EditorialLineId[];
export function editorialLabel(id: string) {
  return editorialLines.find((e) => e.id === id)?.label ?? id;
}

export const contentTypes = [
  { id: "reel", label: "Reel / Short" },
  { id: "carrossel", label: "Carrossel" },
  { id: "post", label: "Post" },
  { id: "story", label: "Story" },
  { id: "video", label: "Vídeo longo" },
  { id: "podcast", label: "Podcast" },
  { id: "artigo", label: "Artigo" },
  { id: "link", label: "Link" },
  { id: "nao_classificada", label: "Não classificada" },
] as const;

export type ContentTypeId = (typeof contentTypes)[number]["id"];
export const contentTypeIds = contentTypes.map((c) => c.id) as ContentTypeId[];
export function contentTypeLabel(id: string) {
  return contentTypes.find((c) => c.id === id)?.label ?? id;
}

/** Métricas agregáveis. `null` significa "a plataforma não fornece" — nunca estimamos. */
export type SocialMetrics = {
  reach: number | null;
  impressions: number | null;
  views: number | null;
  engagements: number | null;
  shares: number | null;
  saves: number | null;
  clicks: number | null;
  plays: number | null;
  listeners: number | null;
  watchTimeSeconds: number | null;
  avgViewSeconds: number | null;
  retentionRate: number | null;
};

export const emptyMetrics: SocialMetrics = {
  reach: null,
  impressions: null,
  views: null,
  engagements: null,
  shares: null,
  saves: null,
  clicks: null,
  plays: null,
  listeners: null,
  watchTimeSeconds: null,
  avgViewSeconds: null,
  retentionRate: null,
};

export const comparableMetrics = [
  { id: "reach", label: "Alcance" },
  { id: "impressions", label: "Impressões" },
  { id: "views", label: "Visualizações" },
  { id: "engagements", label: "Engajamentos" },
  { id: "shares", label: "Compartilhamentos" },
  { id: "saves", label: "Salvamentos" },
  { id: "clicks", label: "Cliques para o site" },
  { id: "leads", label: "Leads atribuídos" },
  { id: "followersGrowth", label: "Crescimento de seguidores" },
] as const;

export type ComparableMetricId = (typeof comparableMetrics)[number]["id"];

/* ------------------------------------------------------------------ *
 * Camada única de tradução: rótulo do cockpit -> chaves reais gravadas
 * em social_metrics_daily, por plataforma.
 * Chave ausente = a plataforma realmente não fornece a métrica.
 * ------------------------------------------------------------------ */
export type DailyMetricKey =
  | "reach"
  | "impressions"
  | "views"
  | "engagements"
  | "shares"
  | "saves"
  | "clicks"
  | "followers"
  | "followersGained"
  | "followersLost";

export const dailyMetricSources: Record<string, Partial<Record<DailyMetricKey, string[]>>> = {
  instagram: {
    reach: ["reach"],
    views: ["views"],
    engagements: ["total_interactions"],
    shares: ["shares"],
    saves: ["saves"],
    clicks: ["profile_links_taps"],
    followers: ["followers_count", "followers"],
    followersGained: ["follower_gains"],
    followersLost: ["follower_losses"],
    // impressions: descontinuada pela Meta — nenhuma chave.
  },
  facebook: {
    reach: ["page_total_media_view_unique"],
    followers: ["fan_count", "followers"],
    followersGained: ["page_follows"],
  },
};

/** Traduz uma chave crua de social_metrics_daily para a coluna canônica do cockpit. */
export function dailyMetricColumn(platform: string, metric: string): DailyMetricKey | null {
  const table = dailyMetricSources[platform];
  if (!table) return null;
  for (const [column, keys] of Object.entries(table)) {
    if (keys?.includes(metric)) return column as DailyMetricKey;
  }
  return null;
}

/** A plataforma tem chave mapeada para a métrica do comparativo? */
export function platformProvidesMetric(platform: string, metric: ComparableMetricId) {
  if (metric === "leads") return true;
  const table = dailyMetricSources[platform];
  if (!table) return true; // plataformas sem série diária dependem dos posts/CSV
  if (metric === "followersGrowth") return Boolean(table.followersGained ?? table.followers);
  return Boolean(table[metric as DailyMetricKey]);
}

/**
 * A Meta entrega media_product_type (FEED/REELS/STORY) e media_type
 * (IMAGE/VIDEO/CAROUSEL_ALBUM). Aqui vira o formato exibido nos filtros.
 */
export function deriveContentType(
  mediaProductType?: string | null,
  mediaType?: string | null,
  fallback?: string | null,
): string {
  const product = (mediaProductType ?? "").toUpperCase();
  const media = (mediaType ?? "").toUpperCase();
  if (product === "REELS" || media === "REELS") return "reel";
  if (product === "STORY") return "story";
  if (media === "CAROUSEL_ALBUM") return "carrossel";
  if (product === "FEED" && (media === "IMAGE" || media === "VIDEO")) return "post";
  const current = (fallback ?? "").trim();
  return current && current !== "nao_classificada" ? current : "nao_classificada";
}


export type SocialAggregate = SocialMetrics & {
  posts: number;
  leads: number;
  qualifiedLeads: number;
  clients: number;
  deals: number;
  sessions: number | null;
  followers?: number | null;
  followersGrowth?: number | null;
  followersGained?: number | null;
  followersLost?: number | null;
  /** Redes no escopo que não fornecem contagem de seguidores — viram nota, nunca zero. */
  followersMissing?: string[];
};

export type SocialPostRow = {
  id: string;
  platform: string;
  editorialLine: string;
  contentType: string;
  title: string | null;
  caption: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  publishedAt: string;
  campaign: string | null;
  utmContent: string | null;
  utmCampaign: string | null;
  cmsContentId: string | null;
  cmsTitle: string | null;
  /** false = a plataforma não devolveu métricas para este post. Nunca exibir zero. */
  metricsAvailable: boolean;
  metricsUnavailableReason: string | null;
  metrics: SocialMetrics;
  leads: number;
  qualifiedLeads: number;
  clients: number;
  deals: number;
};


export type SocialKpis = SocialAggregate & {
  followers: number | null;
  followersGrowth: number | null;
  followersGained: number | null;
  followersLost: number | null;
  followersMissing: string[];
};

export type SocialSeriesPoint = {
  date: string;
  platform: string;
  reach: number | null;
  views: number | null;
  engagements: number | null;
  clicks: number | null;
  followers: number | null;
  leads: number;
};

export type SocialSyncRun = {
  id: string;
  platform: string;
  status: string | null;
  startedAt: string;
  finishedAt: string | null;
  itemsSynced: number;
  errorMessage: string | null;
  /** Run concluído sem pontos de insight — nota, não erro. */
  note: string | null;
};

export type AccountHealth = "verde" | "amarelo" | "vermelho" | "cinza";

export type SocialAccountStatus = {
  platform: string;
  /** Agrupamento comercial exibido no card (Meta reúne Instagram + Facebook). */
  group: "meta" | "linkedin" | "tiktok" | "youtube" | "spotify";
  displayName: string | null;
  handle: string | null;
  profileUrl: string | null;
  profilePictureUrl: string | null;
  status: "conectado" | "nao_conectado" | "erro" | "precisa_reautorizar";
  lastSyncAt: string | null;
  lastError: string | null;
  lastErrorAt: string | null;
  tokenExpiresAt: string | null;
  dataAccessExpiresAt: string | null;
  health: AccountHealth;
  healthLabel: string;
  /** Motivo do semáforo em texto real (nunca genérico quando há last_error). */
  healthReason: string | null;
  lastRun: SocialSyncRun | null;
  canOauth: boolean;
  /** Segredos configurados no servidor para esta plataforma (nunca o valor). */
  credentialsConfigured: boolean;
  requirements: string[];
};

export const groupLabel: Record<SocialAccountStatus["group"], string> = {
  meta: "Meta (Instagram + Facebook)",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  spotify: "Spotify",
};

export const emptyStateText =
  "Nenhum dado é exibido até a conexão ser concluída — o cockpit nunca mostra números estimados nem dados de demonstração.";

export function relativeTime(iso: string | null | undefined) {
  if (!iso) return "nunca";
  const diff = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(diff)) return "nunca";
  const min = Math.round(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const hours = Math.round(min / 60);
  if (hours < 48) return `há ${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `há ${days}d`;
  return `há ${Math.round(days / 30)} meses`;
}


export type SocialFunnel = {
  reach: number | null;
  clicks: number | null;
  sessions: number | null;
  leads: number;
  qualifiedLeads: number;
  clients: number;
  deals: number;
};

export type SocialOverview = {
  kpis: SocialKpis;
  previous: SocialKpis | null;
  byPlatform: (SocialAggregate & { platform: string })[];
  byEditorial: (SocialAggregate & { editorialLine: string; newsletter: number })[];
  byFormat: (SocialAggregate & { contentType: string })[];
  matrix: { editorialLine: string; platform: string; value: SocialAggregate }[];
  series: SocialSeriesPoint[];
  posts: SocialPostRow[];
  funnel: SocialFunnel;
  cadence: { platform: string; editorialLine: string; contentType: string; posts: number }[];
  leadsBySource: { platform: string; leads: number; qualifiedLeads: number; clients: number; deals: number }[];
  newsletterByEditorial: { editorialLine: string; subscribers: number }[];
  episodes: {
    id: string;
    title: string | null;
    publishedAt: string;
    plays: number | null;
    listeners: number | null;
    watchTimeSeconds: number | null;
    avgViewSeconds: number | null;
    retentionRate: number | null;
    leads: number;
  }[];
  accounts: SocialAccountStatus[];
  syncRuns: SocialSyncRun[];
  ga4Configured: boolean;
  ga4Reason: string | null;
  generatedAt: string;
};

export type SocialFilters = {
  from: string | null;
  to: string | null;
  previousFrom: string | null;
  previousTo: string | null;
  platforms: string[];
  editorialLines: string[];
  contentTypes: string[];
};

export function metricValue(agg: SocialAggregate, metric: ComparableMetricId): number | null {
  if (metric === "leads") return agg.leads;
  if (metric === "followersGrowth") return agg.followersGrowth ?? null;
  return agg[metric] ?? null;
}

export function formatWatchTime(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

/** Gera a UTM padronizada da Atual para uma publicação. */
export function buildUtm(input: {
  url: string;
  platform: PlatformId | string;
  campaign?: string | null;
  content?: string | null;
}) {
  const p = socialPlatforms.find((x) => x.id === input.platform);
  const params = new URLSearchParams();
  params.set("utm_source", p?.utmSource ?? String(input.platform));
  params.set("utm_medium", p?.utmMedium ?? "social");
  if (input.campaign) params.set("utm_campaign", input.campaign);
  if (input.content) params.set("utm_content", input.content);
  const sep = input.url.includes("?") ? "&" : "?";
  return `${input.url}${sep}${params.toString()}`;
}

export type SpotifyCsvRow = {
  episode: string;
  publishedAt: string | null;
  plays: number | null;
  listeners: number | null;
  totalSeconds: number | null;
  avgSeconds: number | null;
};

export const spotifyColumnAliases: Record<keyof SpotifyCsvRow, string[]> = {
  episode: ["episode", "episode name", "episódio", "titulo", "título", "name"],
  publishedAt: ["date", "release date", "data", "publicado em", "published"],
  plays: ["plays", "streams", "reproduções", "reproducoes", "starts"],
  listeners: ["listeners", "ouvintes", "unique listeners"],
  totalSeconds: ["total time", "tempo total", "consumption", "total seconds", "time listened"],
  avgSeconds: ["average time", "tempo médio", "tempo medio", "avg time", "average listen time"],
};
