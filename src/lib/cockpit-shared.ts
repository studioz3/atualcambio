/**
 * Cockpit Atual — vocabulário e tipos compartilhados (client-safe).
 * Nenhum dado fictício: apenas contratos, catálogos e regras de leitura.
 */

export type IntegrationState = {
  configured: boolean;
  /** Mensagem amigável quando não configurado. */
  reason?: string;
};

export type Ga4Point = {
  date: string;
  sessions: number;
  users: number;
  pageViews: number;
};

export type Ga4Dim = {
  label: string;
  sessions: number;
  users: number;
  conversions: number;
};

export type Ga4Page = {
  path: string;
  views: number;
  users: number;
  avgEngagementSeconds: number;
};

export type Ga4Totals = {
  sessions: number;
  users: number;
  pageViews: number;
  avgEngagementSeconds: number;
  events: number;
  conversions: number;
};

export type Ga4Overview = {
  totals: Ga4Totals;
  previous: Ga4Totals | null;
  series: Ga4Point[];
  sources: Ga4Dim[];
  campaigns: Ga4Dim[];
  devices: Ga4Dim[];
  locations: Ga4Dim[];
  pages: Ga4Page[];
};

export type Ga4Realtime = {
  activeUsers: number;
  pages: { path: string; activeUsers: number }[];
  devices: { label: string; activeUsers: number }[];
  events: { name: string; count: number }[];
};

export type ClarityPageMetrics = {
  path: string;
  sessions: number;
  averageScrollDepth: number | null;
  averageEngagementSeconds: number | null;
  rageClicks: number;
  deadClicks: number;
  excessiveScroll: number;
  quickBacks: number;
  scriptErrors: number;
  errorClicks: number;
};

export type ClarityOverview = {
  updatedAt: string;
  /** true quando a API estava indisponível/limitada e usamos o último dado válido. */
  stale: boolean;
  /** Motivo técnico do dado estar defasado (ex.: limite diário da API). */
  staleReason?: string;

  totals: ClarityPageMetrics;
  pages: ClarityPageMetrics[];
  devices: { label: string; sessions: number }[];
  sources: { label: string; sessions: number }[];
  projectUrl: string | null;
};

/** Ponto do histórico persistido de coletas do Clarity (sem consumir cota). */
export type ClarityHistoryPoint = {
  /** Dia da coleta (YYYY-MM-DD). */
  date: string;
  collectedAt: string;
  sessions: number;
  averageScrollDepth: number | null;
  averageEngagementSeconds: number | null;
  rageClicks: number;
  deadClicks: number;
  quickBacks: number;
};

export type ClarityHistoryResult =
  | ({ configured: false } & IntegrationState)
  | { configured: true; data: ClarityHistoryPoint[] };

export type Ga4Result =
  | ({ configured: false } & IntegrationState)
  | { configured: true; data: Ga4Overview };

export type Ga4RealtimeResult =
  | ({ configured: false } & IntegrationState)
  | { configured: true; data: Ga4Realtime };

export type ClarityResult =
  | ({ configured: false } & IntegrationState)
  | { configured: true; data: ClarityOverview };

/** Páginas monitoradas — usadas nos seletores de comportamento e mapa de calor. */
export const trackedPages = [
  { path: "/", label: "Home" },
  { path: "/empresas", label: "Empresas" },
  { path: "/stablecoins", label: "Stablecoins" },
  { path: "/remessas-internacionais", label: "Remessas" },
  { path: "/cambio-turismo", label: "Câmbio Turismo" },
  { path: "/conta-atual", label: "Conta Atual" },
  { path: "/conteudo", label: "Conteúdo" },
  { path: "/momento-atual", label: "Momento Atual" },
  { path: "/cripto-wine", label: "Cripto Wine" },
  { path: "/vida-atual", label: "Vida Atual" },
] as const;

export function pageLabel(path: string) {
  const clean = path.split("?")[0]?.replace(/\/$/, "") || "/";
  return trackedPages.find((p) => p.path === clean)?.label ?? clean;
}

export const editorias = [
  { slug: "momento-atual", label: "Momento Atual", field: "momento_atual" },
  { slug: "cripto-wine", label: "Cripto Wine", field: "cripto_wine" },
  { slug: "vida-atual", label: "Vida Atual", field: "vida_atual" },
] as const;

/** Limiares configuráveis dos insights — nada é gerado fora deles. */
export const insightThresholds = {
  /** % mínimo de rage clicks concentrado numa página para virar alerta. */
  rageConcentration: 0.3,
  /** scroll médio abaixo disso vira alerta. */
  lowScroll: 0.5,
  /** diferença relativa de engajamento entre dispositivos. */
  deviceEngagementGap: 0.15,
  /** taxa de conversão de página considerada baixa. */
  lowConversion: 0.005,
  /** mínimo de sessões/visualizações para uma página entrar na análise. */
  minSample: 30,
};

export type Insight = { id: string; text: string; tone: "alerta" | "atenção" | "positivo" };

export function formatSeconds(total: number | null | undefined) {
  if (total == null || !Number.isFinite(total) || total <= 0) return "—";
  const m = Math.floor(total / 60);
  const s = Math.round(total % 60);
  return m > 0 ? `${m}m ${String(s).padStart(2, "0")}s` : `${s}s`;
}

export function formatPercent(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatNumber(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("pt-BR").format(Math.round(value));
}

/** Variação percentual apenas quando há base de comparação real. */
export function variation(current: number, previous: number | null | undefined) {
  if (previous == null || previous <= 0) return null;
  return (current - previous) / previous;
}

export type CockpitInternal = {
  leads: {
    id: string;
    created_at: string;
    nome: string;
    produto: string;
    origem: string | null;
    status: string;
    dispositivo: string | null;
    source_page: string | null;
    utm_campaign: string | null;
    utm_source: string | null;
    utm_medium: string | null;
  }[];
  previousLeadCount: number | null;
  newsletter: {
    total: number;
    momento_atual: number;
    cripto_wine: number;
    vida_atual: number;
    recent: { id: string; nome: string; created_at: string; editorias: string[] }[];
  };
  activity: {
    id: string;
    created_at: string;
    tipo: string;
    descricao: string | null;
    status_novo: string | null;
    lead_id: string;
    lead_nome: string | null;
    lead_produto: string | null;
  }[];
};

/** Insights derivados exclusivamente de dados existentes. */
export function buildInsights(input: {
  ga4: Ga4Overview | null;
  clarity: ClarityOverview | null;
  leads: CockpitInternal["leads"] | null;
}): Insight[] {
  const out: Insight[] = [];
  const t = insightThresholds;

  const clarity = input.clarity;
  if (clarity && clarity.pages.length > 0) {
    const totalRage = clarity.pages.reduce((a, p) => a + p.rageClicks, 0);
    if (totalRage > 0) {
      const top = [...clarity.pages].sort((a, b) => b.rageClicks - a.rageClicks)[0]!;
      const share = top.rageClicks / totalRage;
      if (share >= t.rageConcentration) {
        out.push({
          id: "rage",
          tone: "alerta",
          text: `${pageLabel(top.path)} concentra ${(share * 100).toFixed(0)}% dos rage clicks do período.`,
        });
      }
    }
    for (const p of clarity.pages) {
      if (p.sessions >= t.minSample && p.averageScrollDepth != null && p.averageScrollDepth < t.lowScroll) {
        out.push({
          id: `scroll-${p.path}`,
          tone: "atenção",
          text: `Apenas ${(p.averageScrollDepth * 100).toFixed(0)}% da página ${pageLabel(p.path)} é percorrida em média.`,
        });
      }
    }
    if (clarity.devices.length > 1) {
      const mobile = clarity.devices.find((d) => /mobile|celular/i.test(d.label));
      const desktop = clarity.devices.find((d) => /desktop|pc/i.test(d.label));
      if (mobile && desktop && desktop.sessions > 0) {
        const gap = (mobile.sessions - desktop.sessions) / desktop.sessions;
        if (Math.abs(gap) >= t.deviceEngagementGap) {
          out.push({
            id: "device-share",
            tone: "atenção",
            text: `Mobile responde por ${(
              (mobile.sessions / (mobile.sessions + desktop.sessions)) * 100
            ).toFixed(0)}% das sessões analisadas pelo Clarity.`,
          });
        }
      }
    }
  }

  const ga4 = input.ga4;
  const leads = input.leads;
  if (ga4 && leads && ga4.pages.length > 0) {
    for (const page of ga4.pages) {
      if (page.views < t.minSample) continue;
      const originated = leads.filter((l) => (l.source_page ?? "").startsWith(page.path)).length;
      const rate = page.views > 0 ? originated / page.views : 0;
      if (originated === 0 || rate < t.lowConversion) {
        out.push({
          id: `conv-${page.path}`,
          tone: "atenção",
          text: `${pageLabel(page.path)} tem boa visitação (${formatNumber(page.views)} visualizações) e conversão baixa em leads.`,
        });
      }
    }
  }

  if (leads && leads.length >= 10) {
    const byProduto = new Map<string, number>();
    for (const l of leads) byProduto.set(l.produto, (byProduto.get(l.produto) ?? 0) + 1);
    const top = [...byProduto.entries()].sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] / leads.length >= 0.35) {
      out.push({
        id: "produto",
        tone: "positivo",
        text: `${top[0]} concentra ${((top[1] / leads.length) * 100).toFixed(0)}% das oportunidades do período.`,
      });
    }
  }

  return out.slice(0, 6);
}
