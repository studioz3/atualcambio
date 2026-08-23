/**
 * Cockpit Atual — leitura dos dados internos (Cloud) para o dashboard.
 * Dados agregados/comerciais; nada de navegação individual identificada.
 */
import type { CockpitInternal } from "./cockpit-shared";

type StaffCtx = { supabase: any; userId: string; claims: Record<string, unknown> };

const LEAD_FIELDS =
  "id, created_at, nome, produto, origem, status, dispositivo, source_page, utm_campaign, utm_source, utm_medium";

export async function fetchCockpitInternal(
  ctx: StaffCtx,
  input: { from: string | null; to: string | null; previousFrom: string | null; previousTo: string | null },
): Promise<CockpitInternal> {
  let leadsQuery = ctx.supabase
    .from("leads")
    .select(LEAD_FIELDS)
    .eq("is_teste", false)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (input.from) leadsQuery = leadsQuery.gte("created_at", input.from);
  if (input.to) leadsQuery = leadsQuery.lte("created_at", input.to);

  const previousQuery =
    input.previousFrom && input.previousTo
      ? ctx.supabase
          .from("leads")
          .select("id", { count: "exact", head: true })
          .eq("is_teste", false)
          .gte("created_at", input.previousFrom)
          .lte("created_at", input.previousTo)
      : null;

  const [leadsRes, previousRes, subsRes, eventsRes] = await Promise.all([
    leadsQuery,
    previousQuery ?? Promise.resolve({ count: null, error: null }),
    ctx.supabase
      .from("newsletter_subscribers")
      .select("id, nome, created_at, momento_atual, cripto_wine, vida_atual")
      .eq("is_teste", false)
      .order("created_at", { ascending: false })
      .limit(500),
    ctx.supabase
      .from("lead_events")
      .select("id, created_at, tipo, descricao, status_novo, lead_id, leads(nome, produto)")
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  if (leadsRes.error) throw new Error(leadsRes.error.message);

  const subs = (subsRes.data ?? []) as {
    id: string;
    nome: string;
    created_at: string;
    momento_atual: boolean;
    cripto_wine: boolean;
    vida_atual: boolean;
  }[];

  return {
    leads: (leadsRes.data ?? []) as CockpitInternal["leads"],
    previousLeadCount: (previousRes as { count: number | null }).count ?? null,
    newsletter: {
      total: subs.length,
      momento_atual: subs.filter((s) => s.momento_atual).length,
      cripto_wine: subs.filter((s) => s.cripto_wine).length,
      vida_atual: subs.filter((s) => s.vida_atual).length,
      recent: subs.slice(0, 8).map((s) => ({
        id: s.id,
        nome: s.nome,
        created_at: s.created_at,
        editorias: [
          s.momento_atual ? "Momento Atual" : null,
          s.cripto_wine ? "Cripto Wine" : null,
          s.vida_atual ? "Vida Atual" : null,
        ].filter(Boolean) as string[],
      })),
    },
    activity: ((eventsRes.data ?? []) as any[]).map((e) => ({
      id: e.id,
      created_at: e.created_at,
      tipo: e.tipo,
      descricao: e.descricao,
      status_novo: e.status_novo,
      lead_id: e.lead_id,
      lead_nome: e.leads?.nome ?? null,
      lead_produto: e.leads?.produto ?? null,
    })),
  };
}
