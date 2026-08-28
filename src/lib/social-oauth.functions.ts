import { createServerFn } from "@tanstack/react-start";
import { CONTENT_ROLES } from "./roles-shared";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Gera o state anti-CSRF e devolve a URL de consentimento da plataforma. */
export const startSocialOAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { platform: string }) => data)
  .handler(async ({ context, data }) => {
    const { assertStaff } = await import("./cockpit.server");
    const { authorizeUrl, createOAuthState, isOAuthPlatform } = await import(
      "./social-oauth.server"
    );
    await assertStaff(context as any, CONTENT_ROLES);

    const platform = String(data.platform ?? "").toLowerCase();
    if (!isOAuthPlatform(platform)) throw new Error("Plataforma inválida.");

    const { state, expiresAt } = await createOAuthState(platform, (context as any).userId ?? null);
    const url = authorizeUrl(platform, state);
    if (!url) throw new Error("Credenciais do app desta plataforma ainda não estão no servidor.");
    return { url, expiresAt };
  });
