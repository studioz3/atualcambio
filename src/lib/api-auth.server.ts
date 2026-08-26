/**
 * Autenticação para rotas HTTP (server routes).
 * - requireAdminRequest: exige sessão válida + papel no time da Atual.
 * - requireCronRequest: exige o header x-cron-secret igual ao secret CRON_SECRET.
 */
import { createClient } from "@supabase/supabase-js";

const jsonHeaders = { "Content-Type": "application/json", "Cache-Control": "no-store" };

function deny(status: number, error: string) {
  return new Response(JSON.stringify({ error }), { status, headers: jsonHeaders });
}

export async function requireAdminRequest(
  request: Request,
): Promise<{ denied: Response } | { denied: null; userId: string; supabase: any }> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return { denied: deny(500, "backend_nao_configurado") };

  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get("authorization") ?? "");
  const token = match?.[1]?.trim();
  if (!token) return { denied: deny(401, "nao_autenticado") };

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return { denied: deny(401, "nao_autenticado") };

  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", data.user.id);
  if (!roles || roles.length === 0) return { denied: deny(403, "acesso_restrito") };

  return { denied: null, userId: data.user.id, supabase };
}

export function requireCronRequest(request: Request): Response | null {
  const secret = (process.env["CRON_SECRET"] ?? "").trim();
  if (!secret) return deny(500, "cron_secret_nao_configurado");
  const provided = (request.headers.get("x-cron-secret") ?? "").trim();
  if (!provided) return deny(401, "nao_autorizado");

  const a = new TextEncoder().encode(provided);
  const b = new TextEncoder().encode(secret);
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
  if (diff !== 0) return deny(401, "nao_autorizado");
  return null;
}
