/**
 * Editorias — entidade administrável (client + server).
 * Nada de acesso a banco aqui: apenas tipos e helpers puros.
 */

export type Editorial = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  visible_on_site: boolean;
  display_order: number;
  image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
};

export type EditorialWithCount = Editorial & { content_count: number };

export const EDITORIAL_COLUMNS =
  "id, name, slug, description, status, visible_on_site, display_order, image, meta_title, meta_description, created_at, updated_at";

export const editorialStatuses: { value: string; label: string }[] = [
  { value: "ativa", label: "Ativa" },
  { value: "inativa", label: "Inativa" },
];

/** Slugs já usados por rotas fixas do site — não podem virar editoria. */
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "a-atual",
  "cambio-turismo",
  "canal-de-denuncias",
  "codigo-de-conduta",
  "conta-atual",
  "contato",
  "conteudo",
  "cookies",
  "cotacoes",
  "empresas",
  "fale-com-especialista",
  "newsletter",
  "ouvidoria",
  "pld-ft",
  "privacidade",
  "quem-somos",
  "remessas-internacionais",
  "responsabilidade-social",
  "seguranca",
  "seguranca-cibernetica",
  "solucoes",
  "stablecoins",
  "termos",
];

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.includes(slug.trim().toLowerCase());
}
