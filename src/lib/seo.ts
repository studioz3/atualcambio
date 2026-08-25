/**
 * Camada única de metadados de SEO.
 *
 * Toda rota deve montar seu `head()` com `pageHead(...)`, garantindo:
 * - canonical autocanônico + og:url derivados de SITE_URL
 * - og:title / twitter:title sempre iguais ao <title>
 * - og:image / twitter:image sempre absolutos
 * - meta robots controlada por IS_INDEXABLE (MVP = noindex)
 */

import { IS_INDEXABLE, OG_IMAGE, SITE_URL, absoluteUrl, organizationSchema } from "@/config/site";

type Meta = Record<string, string>;
type LinkTag = Record<string, string>;
type ScriptTag = { type: string; children: string };

export type PageHeadInput = {
  /** Caminho da página, começando com "/". */
  path: string;
  title: string;
  description: string;
  /** Caminho ou URL da imagem social; convertido para absoluto. */
  image?: string | null;
  type?: "website" | "article" | "profile";
  /** Blocos JSON-LD extras da página. */
  jsonLd?: unknown[];
  /** Força noindex mesmo quando o site estiver indexável (ex.: 404, admin). */
  noindex?: boolean;
};

export function robotsContent(noindex = false): string {
  if (noindex || !IS_INDEXABLE) return "noindex, nofollow";
  return "index, follow, max-image-preview:large";
}

export function pageHead({
  path,
  title,
  description,
  image,
  type = "website",
  jsonLd = [],
  noindex = false,
}: PageHeadInput): { meta: Meta[]; links: LinkTag[]; scripts: ScriptTag[] } {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image || OG_IMAGE);

  const meta: Meta[] = [
    { title },
    { name: "description", content: description },
    { name: "robots", content: robotsContent(noindex) },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "Atual Câmbio" },
    { property: "og:locale", content: "pt_BR" },
    { property: "og:image", content: ogImage },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  return {
    meta,
    links: [{ rel: "canonical", href: url }],
    scripts: jsonLd.filter(Boolean).map((data) => ({
      type: "application/ld+json",
      children: JSON.stringify(data),
    })),
  };
}

/** Organization/FinancialService — injetado uma única vez, no root. */
export const orgSchema = organizationSchema;

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  url: SITE_URL,
  name: "Atual Câmbio",
  inLanguage: "pt-BR",
  publisher: { "@id": `${SITE_URL}/#organization` },
};

/** Remove HTML e normaliza espaços — respostas de FAQ em texto puro. */
export function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * FAQPage gerado a partir do mesmo array que alimenta o acordeão visual —
 * nunca dessincroniza com a página.
 */
export function faqSchema(items: { q: string; a: string }[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: plainText(item.q),
      acceptedAnswer: { "@type": "Answer", text: plainText(item.a) },
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  serviceType: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    serviceType: input.serviceType,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: { "@type": "Country", name: "Brasil" },
    description: input.description,
  };
}

export function howToSchema(input: { name: string; description?: string; steps: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    step: input.steps.map((text, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: plainText(text).slice(0, 110),
      text: plainText(text),
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}
