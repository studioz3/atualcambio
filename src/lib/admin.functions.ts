import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { leadStatuses, motivosPerda } from "./admin-shared";
import { CONTENT_ROLES, LEADS_ROLES, hasAnyRole } from "./roles-shared";

/** Colunas expostas ao painel — minimização: nada além do lead comercial. */
const LEAD_COLUMNS =
  "id, created_at, updated_at, nome, email, whatsapp, tipo_cliente, empresa, produto, operacao, moeda, faixa_valor, finalidade, prazo, mensagem, origem, referrer, source_page, source_url, entry_page, utm_source, utm_medium, utm_campaign, utm_content, utm_term, dispositivo, status, consultor, motivo_perda, perda_observacao, cliente_em, cliente_consultor, negocio_fechado_em, negocio_produto, negocio_valor, negocio_moeda, negocio_observacao, negocio_consultor, is_teste";

export type LeadRow = {
  id: string;
  created_at: string;
  updated_at: string;
  nome: string;
  email: string;
  whatsapp: string;
  tipo_cliente: string;
  empresa: string | null;
  produto: string;
  operacao: string | null;
  moeda: string | null;
  faixa_valor: string | null;
  finalidade: string | null;
  prazo: string | null;
  mensagem: string | null;
  origem: string | null;
  referrer: string | null;
  source_page: string | null;
  source_url: string | null;
  entry_page: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  dispositivo: string | null;
  status: string;
  consultor: string | null;
  motivo_perda: string | null;
  perda_observacao: string | null;
  cliente_em: string | null;
  cliente_consultor: string | null;
  negocio_fechado_em: string | null;
  negocio_produto: string | null;
  negocio_valor: number | null;
  negocio_moeda: string | null;
  negocio_observacao: string | null;
  negocio_consultor: string | null;
  is_teste: boolean;
};

export type LeadNote = { id: string; texto: string; autor: string; created_at: string };
export type LeadEvent = {
  id: string;
  tipo: string;
  status_anterior: string | null;
  status_novo: string | null;
  descricao: string | null;
  autor: string | null;
  created_at: string;
};

type StaffCtx = { supabase: any; userId: string; claims: Record<string, unknown> };

async function requireStaff(context: StaffCtx, allowed?: readonly string[]) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  if (error) throw new Error("Não foi possível validar o acesso.");
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (roles.length === 0) throw new Error("Acesso restrito ao time da Atual.");
  if (allowed && !hasAnyRole(roles, allowed)) {
    throw new Error("Seu nível de acesso não permite esta área.");
  }
  const email = (context.claims["email"] as string | undefined) ?? "usuário interno";
  return { roles: roles as string[], email };
}

export const getAdminSession = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { roles, email } = await requireStaff(context as unknown as StaffCtx);
    return { email, roles };
  });

const filtersSchema = z.object({
  from: z.string().nullable().optional(),
  to: z.string().nullable().optional(),
  status: z.string().optional(),
  produto: z.string().optional(),
  tipo_cliente: z.string().optional(),
  operacao: z.string().optional(),
  moeda: z.string().optional(),
  origem: z.string().optional(),
  campanha: z.string().optional(),
  consultor: z.string().optional(),
  busca: z.string().max(120).optional(),
  incluir_testes: z.boolean().optional(),
});

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => filtersSchema.parse(d ?? {}))
  .handler(async ({ context, data }) => {
    const ctx = context as unknown as StaffCtx;
    await requireStaff(ctx, LEADS_ROLES);

    let query = ctx.supabase
      .from("leads")
      .select(LEAD_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (data.from) query = query.gte("created_at", data.from);
    if (data.to) query = query.lte("created_at", data.to);
    if (data.status) query = query.eq("status", data.status);
    if (data.tipo_cliente) query = query.eq("tipo_cliente", data.tipo_cliente);
    if (data.moeda) query = query.eq("moeda", data.moeda);
    if (data.origem) query = query.eq("origem", data.origem);
    if (data.campanha) query = query.eq("utm_campaign", data.campanha);
    if (data.consultor)
      query = data.consultor === "__nao_atribuido" ? query.is("consultor", null) : query.eq("consultor", data.consultor);
    if (data.operacao) query = query.eq("operacao", data.operacao);
    if (!data.incluir_testes) query = query.eq("is_teste", false);
    if (data.busca) {
      const term = data.busca.replace(/[%,()]/g, " ").trim();
      query = query.or(
        `nome.ilike.%${term}%,empresa.ilike.%${term}%,email.ilike.%${term}%,whatsapp.ilike.%${term}%`,
      );
    }

    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { leads: (rows ?? []) as LeadRow[] };
  });

export const getLeadDetail = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const ctx = context as unknown as StaffCtx;
    await requireStaff(ctx, LEADS_ROLES);
    const [lead, notes, events] = await Promise.all([
      ctx.supabase.from("leads").select(LEAD_COLUMNS).eq("id", data.id).maybeSingle(),
      ctx.supabase
        .from("lead_notes")
        .select("id, texto, autor, created_at")
        .eq("lead_id", data.id)
        .order("created_at", { ascending: false }),
      ctx.supabase
        .from("lead_events")
        .select("id, tipo, status_anterior, status_novo, descricao, autor, created_at")
        .eq("lead_id", data.id)
        .order("created_at", { ascending: true }),
    ]);
    if (lead.error) throw new Error(lead.error.message);
    return {
      lead: (lead.data ?? null) as LeadRow | null,
      notes: (notes.data ?? []) as LeadNote[],
      events: (events.data ?? []) as LeadEvent[],
    };
  });

const updateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(leadStatuses).optional(),
  consultor: z.string().trim().max(80).nullable().optional(),
  motivo_perda: z.enum(motivosPerda).nullable().optional(),
  perda_observacao: z.string().trim().max(500).optional(),
  negocio_fechado_em: z.string().trim().max(20).optional(),
  negocio_produto: z.string().trim().max(80).optional(),
  negocio_valor: z.number().nonnegative().nullable().optional(),
  negocio_moeda: z.string().trim().max(20).optional(),
  negocio_observacao: z.string().trim().max(500).optional(),
});

export const updateLead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => updateSchema.parse(d))
  .handler(async ({ context, data }) => {
    const ctx = context as unknown as StaffCtx;
    const { email } = await requireStaff(ctx, LEADS_ROLES);

    const current = await ctx.supabase
      .from("leads")
      .select("status, consultor, produto")
      .eq("id", data.id)
      .maybeSingle();
    if (current.error || !current.data) throw new Error("Lead não encontrado.");
    const anterior = current.data.status as string;

    const patch: Record<string, unknown> = {};
    if (data.status) patch["status"] = data.status;
    if (data.consultor !== undefined) patch["consultor"] = data.consultor || null;
    if (data.motivo_perda !== undefined) patch["motivo_perda"] = data.motivo_perda;
    if (data.perda_observacao !== undefined) patch["perda_observacao"] = data.perda_observacao || null;

    const consultorResponsavel = data.consultor ?? current.data.consultor ?? email;

    if (data.status === "Cliente") {
      patch["cliente_em"] = new Date().toISOString();
      patch["cliente_consultor"] = consultorResponsavel;
    }
    if (data.status === "Negócio fechado") {
      patch["negocio_fechado_em"] = data.negocio_fechado_em || new Date().toISOString().slice(0, 10);
      patch["negocio_produto"] = data.negocio_produto || current.data.produto;
      // Valor real do negócio — nunca sobrescreve a faixa informada pelo lead.
      patch["negocio_valor"] = data.negocio_valor ?? null;
      patch["negocio_moeda"] = data.negocio_moeda || null;
      patch["negocio_observacao"] = data.negocio_observacao || null;
      patch["negocio_consultor"] = consultorResponsavel;
    }
    if (data.status && data.status !== "Perdido") {
      patch["motivo_perda"] = null;
    }

    const { error } = await ctx.supabase.from("leads").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);

    if (data.status && data.status !== anterior) {
      await ctx.supabase.from("lead_events").insert({
        lead_id: data.id,
        tipo: "status",
        status_anterior: anterior,
        status_novo: data.status,
        descricao:
          data.status === "Perdido" && data.motivo_perda ? `Motivo: ${data.motivo_perda}` : null,
        autor: email,
      });
    }
    if (data.consultor !== undefined && data.consultor !== current.data.consultor) {
      await ctx.supabase.from("lead_events").insert({
        lead_id: data.id,
        tipo: "consultor",
        descricao: data.consultor ? `Atribuído a ${data.consultor}` : "Consultor removido",
        autor: email,
      });
    }
    return { ok: true as const };
  });

export const addLeadNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), texto: z.string().trim().min(1).max(1000) }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const ctx = context as unknown as StaffCtx;
    const { email } = await requireStaff(ctx, LEADS_ROLES);
    const { error } = await ctx.supabase
      .from("lead_notes")
      .insert({ lead_id: data.id, texto: data.texto, autor: email });
    if (error) throw new Error(error.message);
    await ctx.supabase.from("lead_events").insert({
      lead_id: data.id,
      tipo: "nota",
      descricao: "Observação adicionada",
      autor: email,
    });
    return { ok: true as const };
  });

export type SubscriberRow = {
  id: string;
  created_at: string;
  nome: string;
  email: string;
  momento_atual: boolean;
  cripto_wine: boolean;
  vida_atual: boolean;
  origem: string | null;
  utm_campaign: string | null;
};

export const listSubscribers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ from: z.string().nullable().optional(), to: z.string().nullable().optional() }).parse(d ?? {}),
  )
  .handler(async ({ context, data }) => {
    const ctx = context as unknown as StaffCtx;
    await requireStaff(ctx, CONTENT_ROLES);
    let query = ctx.supabase
      .from("newsletter_subscribers")
      .select("id, created_at, nome, email, momento_atual, cripto_wine, vida_atual, origem, utm_campaign")
      .order("created_at", { ascending: false })
      .limit(1000);
    if (data.from) query = query.gte("created_at", data.from);
    if (data.to) query = query.lte("created_at", data.to);
    const { data: rows, error } = await query;
    if (error) throw new Error(error.message);
    return { subscribers: (rows ?? []) as SubscriberRow[] };
  });
