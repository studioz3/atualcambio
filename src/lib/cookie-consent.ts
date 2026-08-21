export type CookieCategory = "necessarios" | "analytics" | "marketing";

export type CookieConsent = {
  necessarios: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: 1;
};

export const CONSENT_STORAGE_KEY = "atual:cookie-consent";
export const CONSENT_OPEN_EVENT = "atual:cookie-preferences";

export const cookieCategories: {
  id: CookieCategory;
  title: string;
  description: string;
  required?: boolean;
}[] = [
  {
    id: "necessarios",
    title: "Necessários",
    description:
      "Essenciais para o funcionamento do site, segurança, prevenção a fraudes e manutenção da sessão. Não podem ser desativados.",
    required: true,
  },
  {
    id: "analytics",
    title: "Desempenho e análise",
    description:
      "Ajudam a entender como o site é utilizado (páginas visitadas, erros e tempo de navegação) para melhorar a experiência.",
  },
  {
    id: "marketing",
    title: "Marketing e comunicação",
    description:
      "Permitem mensurar campanhas e apresentar conteúdos e ofertas mais relevantes sobre soluções de câmbio.",
  },
];

export function readConsent(): CookieConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsent;
    if (parsed?.version !== 1) return null;
    return { ...parsed, necessarios: true };
  } catch {
    return null;
  }
}

export function writeConsent(value: { analytics: boolean; marketing: boolean }): CookieConsent {
  const consent: CookieConsent = {
    necessarios: true,
    analytics: value.analytics,
    marketing: value.marketing,
    updatedAt: new Date().toISOString(),
    version: 1,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
    } catch {
      /* armazenamento indisponível */
    }
  }
  return consent;
}

export function openCookiePreferences() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}
