/**
 * Camada de analytics preparada — nenhum ID fictício.
 *
 * Os IDs reais devem ser informados por variáveis de ambiente públicas:
 *   VITE_GTM_ID, VITE_GA4_ID, VITE_META_PIXEL_ID, VITE_CLARITY_ID
 * Enquanto não existirem, nenhum script de terceiro é carregado.
 *
 * Todo script não essencial só é ativado após consentimento de cookies
 * (categoria "analytics" para GA4/GTM/Clarity, "marketing" para Meta Pixel).
 */

import { readConsent, type CookieConsent } from "./cookie-consent";

export const ANALYTICS_EVENTS = [
  "intent_selected",
  "open_account_click",
  "login_click",
  "app_store_click",
  "google_play_click",
  "business_lead_start",
  "business_lead_submit",
  "business_page_view",
  "business_intent_selected",
  "business_whatsapp",
  "business_app_click",
  "whatsapp_click",
  "stablecoin_page_view",
  "stablecoin_buy",
  "stablecoin_sell",
  "stablecoin_usdt",
  "stablecoin_usdc",
  "stablecoin_asset_selected",
  "stablecoin_operation_selected",
  "stablecoin_quote_click",
  "stablecoin_app_click",
  "stablecoin_help_start",
  "stablecoin_lead_submit",
  "stablecoin_whatsapp",
  "remittance_start",
  "remittance_app_click",
  "specialist_start",
  "newsletter_signup",
  "article_click",
  "faq_open",
  "account_page_view",
  "existing_client_click",
  "account_remittance_click",
  "account_stablecoin_click",
  "account_specialist_start",
  "account_lead_submit",
  "account_whatsapp",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

type Params = Record<string, string | number | boolean | undefined>;

export const analyticsConfig = {
  gtmId: import.meta.env['VITE_GTM_ID'] ?? "",
  ga4Id: import.meta.env['VITE_GA4_ID'] ?? "",
  metaPixelId: import.meta.env['VITE_META_PIXEL_ID'] ?? "",
  clarityId: import.meta.env['VITE_CLARITY_ID'] ?? "",
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

export function track(event: AnalyticsEvent | string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const consent = readConsent();
  if (!consent?.analytics) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
}

function injectScript(id: string, src: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

/** Ativa os provedores conforme consentimento. Sem ID configurado, nada acontece. */
export function applyAnalyticsConsent(consent: CookieConsent | null) {
  if (typeof window === "undefined" || !consent) return;

  if (consent.analytics) {
    window.dataLayer = window.dataLayer ?? [];
    if (analyticsConfig.gtmId) {
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      injectScript(
        "gtm-script",
        `https://www.googletagmanager.com/gtm.js?id=${analyticsConfig.gtmId}`,
      );
    }
    if (analyticsConfig.ga4Id && !analyticsConfig.gtmId) {
      injectScript(
        "ga4-script",
        `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga4Id}`,
      );
      window.dataLayer.push({ event: "gtag_config", send_to: analyticsConfig.ga4Id });
    }
    if (analyticsConfig.clarityId) {
      injectScript("clarity-script", `https://www.clarity.ms/tag/${analyticsConfig.clarityId}`);
    }
  }

  if (consent.marketing && analyticsConfig.metaPixelId) {
    injectScript("meta-pixel-script", "https://connect.facebook.net/en_US/fbevents.js");
  }
}
