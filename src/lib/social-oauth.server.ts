/**
 * OAuth das redes sociais — camada server-only.
 * Guarda e valida o parâmetro `state` (anti-CSRF) e centraliza as URLs de autorização.
 */

export const oauthPlatforms = ["instagram", "facebook", "youtube", "tiktok", "linkedin"] as const;
export type OAuthPlatform = (typeof oauthPlatforms)[number];

export function isOAuthPlatform(value: string): value is OAuthPlatform {
  return (oauthPlatforms as readonly string[]).includes(value);
}

const STATE_TTL_MINUTES = 10;

function baseUrl(request?: Request) {
  const configured = (process.env["PUBLIC_SITE_URL"] ?? "").trim().replace(/\/$/, "");
  if (configured) return configured;
  if (request) return new URL(request.url).origin;
  return "https://atualcambio.lovable.app";
}

export function callbackUrl(platform: OAuthPlatform, request?: Request) {
  return `${baseUrl(request)}/api/public/social-oauth/${platform}`;
}

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin as any;
}

/** Cria um state de uso único com validade de 10 minutos. */
export async function createOAuthState(platform: OAuthPlatform, createdBy: string | null) {
  const state = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + STATE_TTL_MINUTES * 60_000).toISOString();
  const db = await admin();
  const { error } = await db
    .from("oauth_states")
    .insert({ state, platform, created_by: createdBy, expires_at: expiresAt });
  if (error) throw new Error("Não foi possível iniciar a conexão OAuth.");
  return { state, expiresAt };
}

export type StateCheck = { ok: true } | { ok: false; reason: "invalido" | "usado" | "expirado" };

/** Valida e consome o state recebido no callback. */
export async function consumeOAuthState(
  platform: string,
  state: string | null,
): Promise<StateCheck> {
  if (!state) return { ok: false, reason: "invalido" };
  const db = await admin();
  const { data, error } = await db
    .from("oauth_states")
    .select("id, platform, expires_at, consumed_at")
    .eq("state", state)
    .maybeSingle();
  if (error || !data || data.platform !== platform) return { ok: false, reason: "invalido" };
  if (data.consumed_at) return { ok: false, reason: "usado" };
  if (new Date(data.expires_at).getTime() < Date.now()) return { ok: false, reason: "expirado" };

  const { data: updated, error: updateError } = await db
    .from("oauth_states")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", data.id)
    .is("consumed_at", null)
    .select("id");
  if (updateError || !updated || updated.length === 0) return { ok: false, reason: "usado" };
  return { ok: true };
}

/** Monta a URL de consentimento da plataforma já com o state. */
export function authorizeUrl(platform: OAuthPlatform, state: string, request?: Request) {
  const redirectUri = callbackUrl(platform, request);
  switch (platform) {
    case "instagram":
    case "facebook": {
      const clientId = process.env["META_APP_ID"];
      if (!clientId) return null;
      const scope =
        platform === "instagram"
          ? "instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement"
          : "pages_show_list,pages_read_engagement,read_insights";
      return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    }
    case "youtube": {
      const clientId = process.env["GOOGLE_OAUTH_CLIENT_ID"];
      if (!clientId) return null;
      const scope =
        "https://www.googleapis.com/auth/yt-analytics.readonly https://www.googleapis.com/auth/youtube.readonly";
      return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&response_type=code&access_type=offline&prompt=consent&scope=${encodeURIComponent(scope)}`;
    }
    case "linkedin": {
      const clientId = process.env["LINKEDIN_CLIENT_ID"];
      if (!clientId) return null;
      const scope = "r_organization_social rw_organization_admin";
      return `https://www.linkedin.com/oauth/v2/authorization?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    }
    case "tiktok": {
      const clientKey = process.env["TIKTOK_CLIENT_KEY"];
      if (!clientKey) return null;
      const scope = "user.info.basic,user.info.stats,video.list";
      return `https://www.tiktok.com/v2/auth/authorize/?client_key=${encodeURIComponent(clientKey)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    }
    default:
      return null;
  }
}

/** Sincronização das contas — só executa o que houver credencial no servidor. */
export async function runSocialSync(platforms?: string[]) {
  const db = await admin();
  const targets = (platforms?.length ? platforms : [...oauthPlatforms]).filter(isOAuthPlatform);
  const now = new Date().toISOString();
  const results: { platform: string; ok: boolean; message: string }[] = [];

  for (const platform of targets) {
    const configured = Boolean(authorizeUrl(platform, "probe"));
    const message = configured
      ? "Credenciais presentes. Aguardando token de acesso da plataforma."
      : "Credenciais do app da plataforma ausentes no servidor.";
    results.push({ platform, ok: false, message });
    await db
      .from("social_accounts")
      .update({ last_sync_at: now, last_error: message })
      .eq("platform", platform);
  }

  return { ranAt: now, results };
}

/** Teste de conexão de uma plataforma (somente leitura de configuração). */
export async function testSocialConnection(platform: OAuthPlatform) {
  const configured = Boolean(authorizeUrl(platform, "probe"));
  return {
    platform,
    credentialsConfigured: configured,
    callbackUrl: callbackUrl(platform),
    message: configured
      ? "App configurado. Pronto para iniciar o OAuth."
      : "Faltam credenciais do app desta plataforma no servidor.",
  };
}
