import { createServerFn } from "@tanstack/react-start";
import { CONTENT_ROLES } from "./roles-shared";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { SocialAccountStatus, SocialFilters, SocialOverview } from "./social-shared";

export const getSocialOverview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SocialFilters) => data)
  .handler(async ({ context, data }): Promise<SocialOverview> => {
    const { assertStaff } = await import("./cockpit.server");
    const { fetchSocialOverview } = await import("./social.server");
    await assertStaff(context as any, CONTENT_ROLES);
    return fetchSocialOverview(context as any, data);
  });

export const getSocialAccounts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SocialAccountStatus[]> => {
    const { assertStaff } = await import("./cockpit.server");
    const { fetchSocialAccounts } = await import("./social.server");
    await assertStaff(context as any, CONTENT_ROLES);
    return fetchSocialAccounts(context as any);
  });

export const saveSocialAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: { platform: string; handle: string | null; profileUrl: string | null }) => data,
  )
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./cockpit.server");
    await assertStaff(context as any, CONTENT_ROLES);
    // Pode não existir linha ainda (plataforma nunca conectada): upsert por platform.
    const { error } = await (context as any).supabase.from("social_accounts").upsert(
      {
        platform: data.platform,
        external_id: `manual:${data.platform}`,
        handle: data.handle,
        profile_url: data.profileUrl,
      },
      { onConflict: "platform" },
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export type SocialPostInput = {
  id?: string | null;
  platform: string;
  editorialLine: string;
  contentType: string;
  title: string | null;
  url: string | null;
  thumbnailUrl: string | null;
  publishedAt: string;
  campaign: string | null;
  utmCampaign: string | null;
  utmContent: string | null;
  cmsContentId: string | null;
  metrics: {
    metricDate: string;
    reach: number | null;
    impressions: number | null;
    views: number | null;
    engagements: number | null;
    shares: number | null;
    saves: number | null;
    clicks: number | null;
  } | null;
};

export const saveSocialPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: SocialPostInput) => data)
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./cockpit.server");
    await assertStaff(context as any, CONTENT_ROLES);
    const supabase = (context as any).supabase;
    const payload = {
      platform: data.platform,
      editorial_line: data.editorialLine,
      content_type: data.contentType,
      title: data.title,
      url: data.url,
      thumbnail_url: data.thumbnailUrl,
      published_at: data.publishedAt,
      campaign: data.campaign,
      utm_campaign: data.utmCampaign,
      utm_content: data.utmContent,
      cms_content_id: data.cmsContentId,
      origin: "manual",
    };
    let postId = data.id ?? null;
    if (postId) {
      const { error } = await supabase.from("social_posts").update(payload).eq("id", postId);
      if (error) throw new Error(error.message);
    } else {
      const { data: created, error } = await supabase
        .from("social_posts")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      postId = created.id as string;
    }

    if (data.metrics) {
      const m = data.metrics;
      const { data: existing } = await supabase
        .from("social_post_metrics")
        .select("id")
        .eq("post_id", postId)
        .eq("metric_date", m.metricDate)
        .maybeSingle();
      const metricPayload = {
        post_id: postId,
        metric_date: m.metricDate,
        reach: m.reach,
        impressions: m.impressions,
        views: m.views,
        engagements: m.engagements,
        shares: m.shares,
        saves: m.saves,
        clicks: m.clicks,
      };
      const { error } = existing
        ? await supabase.from("social_post_metrics").update(metricPayload).eq("id", existing.id)
        : await supabase.from("social_post_metrics").insert(metricPayload);
      if (error) throw new Error(error.message);
    }
    return { id: postId };
  });

export const deleteSocialPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./cockpit.server");
    await assertStaff(context as any, CONTENT_ROLES);
    const { error } = await (context as any).supabase.from("social_posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const importSpotifyCsv = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      rows: {
        episode: string;
        publishedAt: string | null;
        plays: number | null;
        listeners: number | null;
        totalSeconds: number | null;
        avgSeconds: number | null;
      }[];
      fileName: string | null;
      overwrite: boolean;
    }) => data,
  )
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./cockpit.server");
    const { importSpotifyRows } = await import("./social.server");
    await assertStaff(context as any, CONTENT_ROLES);
    return importSpotifyRows(context as any, data);
  });

export const getSocialImports = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./cockpit.server");
    await assertStaff(context as any, CONTENT_ROLES);
    const { data } = await (context as any).supabase
      .from("social_imports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    return (data ?? []) as {
      id: string;
      platform: string;
      file_name: string | null;
      rows_imported: number;
      rows_skipped: number;
      period_from: string | null;
      period_to: string | null;
      created_at: string;
    }[];
  });

/** Histórico das execuções do sync — é onde se olha quando algo quebra. */
export const getSocialSyncRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertStaff } = await import("./cockpit.server");
    const { fetchSocialSyncRuns } = await import("./social.server");
    await assertStaff(context as any, CONTENT_ROLES);
    return fetchSocialSyncRuns(context as any, 25);
  });
