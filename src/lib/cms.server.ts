import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Cliente publishable (somente leitura pública, RLS como anon). */
export function publicClient(): SupabaseClient {
  return createClient(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}
