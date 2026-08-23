/**
 * Camada compartilhada do CMS editorial (client + server).
 * Tipos, tabelas de apoio e helpers puros — nada de acesso a banco aqui.
 */

import type { Article, ArticleCta, EditoriaId } from "@/content/editorial";

export const CMS_BUCKET = "editorial";

export type CmsStatus = "rascunho" | "revisao" | "publicado";
export type CmsTipo = "artigo" | "podcast" | "video";

export const cmsStatuses: { value: CmsStatus; label: string }[] = [
  { value: "rascunho", label: "Rascunho" },
  { value: "revisao", label: "Revisão" },
  { value: "publicado", label: "Publicado" },
];

export const cmsTipos: { value: CmsTipo; label: string }[] = [
  { value: "artigo", label: "Artigo" },
  { value: "podcast", label: "Podcast" },
  { value: "video", label: "Vídeo" },
];

/* ---------------- Blocos do editor visual ---------------- */

export type CmsBlock =
  | { type: "paragrafo"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "lista"; items: string[] }
  | { type: "lista_numerada"; items: string[] }
  | { type: "citacao"; text: string }
  | { type: "destaque"; text: string }
  | { type: "divisor" }
  | { type: "imagem"; url: string; alt: string; legenda?: string }
  // legado (conteúdo migrado)
  | { type: "subtitulo"; text: string };

export const blockLabels: Record<string, string> = {
  paragrafo: "Parágrafo",
  h2: "Título (H2)",
  h3: "Subtítulo (H3)",
  lista: "Lista com marcadores",
  lista_numerada: "Lista numerada",
  citacao: "Citação",
  destaque: "Destaque textual",
  divisor: "Divisor",
  imagem: "Imagem",
  subtitulo: "Título (H2)",
};

export function normalizeBlocks(raw: unknown): CmsBlock[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((b): b is CmsBlock => !!b && typeof b === "object" && "type" in (b as object))
    .map((b) => (b.type === "subtitulo" ? ({ type: "h2", text: b.text } as CmsBlock) : b));
}

/* ---------------- CTAs relacionados ---------------- */

export type CmsCtaKey =
  | "nenhum"
  | "empresas"
  | "remessas"
  | "stablecoins"
  | "conta-atual"
  | "turismo"
  | "especialista";

export const ctaOptions: { value: CmsCtaKey; label: string }[] = [
  { value: "nenhum", label: "Nenhum" },
  { value: "empresas", label: "Empresas" },
  { value: "remessas", label: "Remessas internacionais" },
  { value: "stablecoins", label: "USDT / USDC" },
  { value: "conta-atual", label: "Conta Atual" },
  { value: "turismo", label: "Câmbio Turismo" },
  { value: "especialista", label: "Falar com especialista" },
];

const ctaMap: Record<Exclude<CmsCtaKey, "nenhum">, NonNullable<ArticleCta>> = {
  empresas: {
    title: "Sua empresa opera no mercado internacional?",
    description: "Pagamentos, recebimentos e apoio na documentação exigida.",
    label: "Conhecer soluções para empresas",
    to: "/empresas",
  },
  remessas: {
    title: "Vai movimentar recursos para o exterior?",
    description: "A Atual acompanha a operação do início ao fim, com especialista quando precisar.",
    label: "Conhecer remessas internacionais",
    to: "/remessas-internacionais",
  },
  stablecoins: {
    title: "Conheça as soluções em USDT e USDC da Atual.",
    description: "Operações com stablecoins dentro de um ambiente regulado.",
    label: "Ver stablecoins",
    to: "/stablecoins",
  },
  "conta-atual": {
    title: "Abra sua Conta Atual",
    description: "Câmbio, remessas e acompanhamento em um único ambiente.",
    label: "Conhecer a Conta Atual",
    to: "/conta-atual",
  },
  turismo: {
    title: "Vai viajar?",
    description: "Moeda em espécie e cartão pré-pago com atendimento da Atual.",
    label: "Ver câmbio turismo",
    to: "/cambio-turismo",
  },
  especialista: {
    title: "Fale com um especialista da Atual",
    description: "Atendimento humano para entender a sua operação antes de qualquer proposta.",
    label: "Falar com especialista",
    to: "/fale-com-especialista",
  },
};

export function ctaFromKey(key: string | null | undefined): ArticleCta {
  if (!key || key === "nenhum") return null;
  return ctaMap[key as Exclude<CmsCtaKey, "nenhum">] ?? null;
}

/* ---------------- Slug ---------------- */

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/* ---------------- Linha do banco ---------------- */

export type CmsRow = {
  id: string;
  editoria: EditoriaId;
  tipo: CmsTipo;
  titulo: string;
  subtitulo: string | null;
  resumo: string | null;
  slug: string;
  categoria: string | null;
  category_id: string | null;
  author_id: string | null;
  autor_nome: string | null;
  hero_image: string | null;
  hero_alt: string | null;
  social_image: string | null;
  corpo: unknown;
  related_cta: string;
  destaque_editoria: boolean;
  destaque_home: boolean;
  newsletter_selected: boolean;
  status: CmsStatus;
  seo_title: string | null;
  meta_description: string | null;
  canonical: string | null;
  indexable: boolean;
  podcast: Record<string, unknown> | null;
  video: Record<string, unknown> | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CmsSource = { nome: string; url: string | null };

/** Colunas leves para listagens (nunca o corpo completo). */
export const CMS_LIST_COLUMNS =
  "id, editoria, tipo, titulo, slug, resumo, categoria, autor_nome, hero_image, hero_alt, status, destaque_editoria, destaque_home, published_at, created_at, updated_at";

export type CmsListItem = Pick<
  CmsRow,
  | "id"
  | "editoria"
  | "tipo"
  | "titulo"
  | "slug"
  | "resumo"
  | "categoria"
  | "autor_nome"
  | "hero_image"
  | "hero_alt"
  | "status"
  | "destaque_editoria"
  | "destaque_home"
  | "published_at"
  | "created_at"
  | "updated_at"
>;

/** Converte uma linha do banco no formato consumido pelos templates públicos. */
export function toArticle(row: CmsRow, sources: CmsSource[] = []): Article {
  const video = (row.video ?? {}) as { url?: string };
  const podcast = (row.podcast ?? {}) as { audio_url?: string };
  return {
    id: row.id,
    editoria: row.editoria,
    categoria: row.categoria ?? "Editorial",
    titulo: row.titulo,
    slug: row.slug,
    subtitulo: row.subtitulo ?? "",
    resumo: row.resumo ?? "",
    imagem_principal: row.hero_image ?? "",
    imagem_alt: row.hero_alt ?? row.titulo,
    conteudo: normalizeBlocks(row.corpo) as Article["conteudo"],
    autor: row.autor_nome ?? "Redação Atual",
    data: row.published_at ?? row.created_at,
    fonte: sources.map((s) => ({ label: s.nome, ...(s.url ? { url: s.url } : {}) })),
    video_url: video.url ?? null,
    audio_url: podcast.audio_url ?? null,
    imagem_social: row.social_image,
    seo_title: row.seo_title ?? row.titulo,
    meta_description: row.meta_description ?? row.resumo ?? "",
    cta: ctaFromKey(row.related_cta),
    destaque: row.destaque_editoria,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

/** Item leve → card. */
export function listItemToCard(row: CmsListItem): Article {
  return toArticle({
    ...(row as unknown as CmsRow),
    subtitulo: null,
    corpo: [],
    related_cta: "nenhum",
    social_image: null,
    seo_title: null,
    meta_description: null,
    canonical: null,
    indexable: true,
    podcast: null,
    video: null,
    deleted_at: null,
    author_id: null,
    category_id: null,
    newsletter_selected: false,
  });
}

export function editoriaPath(editoria: EditoriaId): string {
  return `/${editoria}`;
}

export function contentUrl(editoria: EditoriaId, slug: string): string {
  return `/${editoria}/${slug}`;
}
