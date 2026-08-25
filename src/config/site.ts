/**
 * Configuração única de domínio, indexação e identidade da Atual Câmbio.
 *
 * REGRA ABSOLUTA: nenhuma URL absoluta deve ser escrita manualmente no código.
 * Canonical, og:url, og:image, JSON-LD, sitemap e robots.txt derivam de SITE_URL.
 *
 * VITE_IS_INDEXABLE só deve ir para "true" quando:
 *   1. o site estiver no domínio definitivo (atualcambio.com.br), e
 *   2. os redirecionamentos 301 do site antigo (WordPress) estiverem publicados.
 * Enquanto for MVP em domínio temporário, o site fica noindex para não competir
 * com o site antigo pelo mesmo conteúdo.
 */

export const SITE_URL: string =
  (import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "https://atualcambio.lovable.app";

export const IS_INDEXABLE: boolean = import.meta.env["VITE_IS_INDEXABLE"] === "true";

/** Converte um caminho relativo (ou URL já absoluta) em URL absoluta do site. */
export function absoluteUrl(path = "/"): string {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Imagem OG institucional padrão (1200x630) servida do próprio domínio. */
export const OG_IMAGE = absoluteUrl("/og/atual-og.jpg");

export const ORG_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/**
 * Dados institucionais.
 * TODO [COMPLIANCE]: confirmar a razão social exata registrada e o CNPJ.
 * Hoje circulam três variantes ("Atual Câmbio Serviços Financeiros Ltda.",
 * "Atual Corretora de Câmbio Ltda", "Atual Sociedade Corretora de Câmbio Ltda").
 * Use UMA só aqui — este valor alimenta rodapé, schema e páginas legais.
 */
export const LEGAL_NAME = "{RAZAO_SOCIAL_OFICIAL}"; // TODO preencher
export const CNPJ = "{CNPJ}"; // TODO preencher (ex.: 44.323.831/0001-70)

/** Agência física única da Atual. */
export const UNIT = {
  name: "Atual Câmbio — São José dos Campos",
  building: "Edifício The One",
  streetAddress: "Av. Cassiano Ricardo, 601 — Sala 25 — Edifício The One",
  neighborhood: "Jardim Aquarius",
  city: "São José dos Campos",
  region: "SP",
  postalCode: "12246-870",
  country: "BR",
  phone: "(12) 3500-2009",
  phoneE164: "+55-12-3500-2009",
  hours: "Segunda a sexta, das 9h às 18h, exceto feriados nacionais.",
  path: "/unidades/sao-jose-dos-campos",
  mapUrl:
    "https://www.google.com/maps/search/?api=1&query=Av.+Cassiano+Ricardo,+601,+Jardim+Aquarius,+S%C3%A3o+Jos%C3%A9+dos+Campos+SP",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Av.+Cassiano+Ricardo,+601,+Jardim+Aquarius,+S%C3%A3o+Jos%C3%A9+dos+Campos+SP&output=embed",
  // TODO [PREENCHER]: coordenadas reais da agência.
  latitude: "{LAT}",
  longitude: "{LNG}",
} as const;

export const SOCIAL_PROFILES = [
  "https://www.instagram.com/atualcambio/",
  "https://www.linkedin.com/company/atualcambio/",
  "https://www.youtube.com/@Atual.C%C3%A2mbio",
  "https://www.tiktok.com/@atual.cambio",
  "https://www.facebook.com/profile.php?id=61573205567154",
];

export const postalAddressSchema = {
  "@type": "PostalAddress",
  streetAddress: UNIT.streetAddress,
  addressLocality: UNIT.city,
  addressRegion: UNIT.region,
  postalCode: UNIT.postalCode,
  addressCountry: UNIT.country,
};

export const openingHoursSchema = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "09:00",
    closes: "18:00",
  },
];

/** Organization + FinancialService — presente em todas as páginas. */
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "@id": ORG_ID,
  name: "Atual Câmbio",
  legalName: LEGAL_NAME,
  taxID: CNPJ,
  url: SITE_URL,
  logo: absoluteUrl("/brand/simbolo.png"),
  image: OG_IMAGE,
  description:
    "Instituição autorizada a operar no mercado de câmbio brasileiro, oferecendo câmbio turismo, remessas internacionais, operações empresariais de comércio exterior e stablecoins USDT e USDC.",
  areaServed: { "@type": "Country", name: "Brasil" },
  address: postalAddressSchema,
  openingHoursSpecification: openingHoursSchema,
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: UNIT.phoneE164,
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: "Portuguese",
    },
    {
      "@type": "ContactPoint",
      telephone: "+55-800-770-5422",
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: "Portuguese",
    },
    {
      "@type": "ContactPoint",
      email: "contato@atualcambio.com.br",
      contactType: "customer service",
      areaServed: "BR",
      availableLanguage: "Portuguese",
    },
  ],
  sameAs: SOCIAL_PROFILES,
};
