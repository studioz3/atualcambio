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
  "remittance_page_view",
  "remittance_start",
  "remittance_app_click",
  "remittance_help_start",
  "remittance_lead_submit",
  "remittance_whatsapp",
  "tourism_page_view",
  "tourism_operation_selected",
  "tourism_currency_selected",
  "tourism_quote_start",
  "tourism_lead_submit",
  "tourism_whatsapp",
  "specialist_start",
  "newsletter_signup",
  "content_hub_view",
  "editorial_selected",
  "momento_atual_view",
  "cripto_wine_view",
  "vida_atual_view",
  "article_view",
  "article_share",
  "article_related_click",
  "article_cta_click",
  "newsletter_view",
  "newsletter_preference_selected",
  "article_click",
  "faq_open",
  "account_page_view",
  "existing_client_click",
  "account_remittance_click",
  "account_stablecoin_click",
  "account_specialist_start",
  "account_lead_submit",
  "account_drawer_open",
  "account_drawer_step_2",
  "account_purpose_selected",
  "account_drawer_app_click",
  "account_whatsapp",
  "quotes_page_view",
  "quote_asset_selected",
  "quote_usd_click",
  "quote_eur_click",
  "quote_gbp_click",
  "quote_usdt_click",
  "quote_usdc_click",
  "quote_app_click",
  "quote_specialist_click",
  "quote_remittance_click",
  "quote_business_click",
  "quote_article_click",
  "security_page_view",
  "security_bacen_click",
  "security_privacy_click",
  "security_cyber_click",
  "security_pld_click",
  "security_whistleblower_click",
  "security_ombudsman_click",
  "security_contact_click",
  "security_specialist_click",
  "security_open_account_click",
  "about_page_view",
  "about_solutions_click",
  "about_account_click",
  "about_business_click",
  "about_security_click",
  "about_specialist_click",
  "about_content_click",
  "about_open_account_click",
  "contact_page_view",
  "contact_commercial_click",
  "contact_whatsapp_click",
  "contact_phone_click",
  "contact_email_click",
  "contact_ombudsman_click",
  "contact_whistleblower_click",
  "contact_security_click",
  "specialist_page_view",
  "specialist_customer_type",
  "specialist_subject_selected",
  "specialist_form_start",
  "specialist_form_step_2",
  "specialist_form_complete",
  "specialist_lead_saved",
  "specialist_whatsapp_click",
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
    gtag?: (...args: unknown[]) => void;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

function ensureGtag() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer!.push(args);
    };
  }
}

let ga4Ready = false;

export function track(event: AnalyticsEvent | string, params: Params = {}) {
  if (typeof window === "undefined") return;
  const consent = readConsent();
  if (!consent?.analytics) return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  if (ga4Ready && window.gtag) {
    window.gtag("event", event, params);
  }
}

/** Envia um page_view no GA4 (necessário em navegação SPA). */
export function trackPageView(path: string, title?: string) {
  if (typeof window === "undefined") return;
  const consent = readConsent();
  if (!consent?.analytics || !ga4Ready || !window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: title ?? document.title,
  });
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
    ensureGtag();
    if (analyticsConfig.gtmId) {
      window.dataLayer!.push({ "gtm.start": Date.now(), event: "gtm.js" });
      injectScript(
        "gtm-script",
        `https://www.googletagmanager.com/gtm.js?id=${analyticsConfig.gtmId}`,
      );
    }
    if (analyticsConfig.ga4Id && !ga4Ready) {
      injectScript(
        "ga4-script",
        `https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.ga4Id}`,
      );
      window.gtag!("js", new Date());
      window.gtag!("config", analyticsConfig.ga4Id, {
        send_page_view: true,
        page_path: window.location.pathname,
      });
      ga4Ready = true;
    }
    if (analyticsConfig.clarityId) {
      injectScript("clarity-script", `https://www.clarity.ms/tag/${analyticsConfig.clarityId}`);
    }
  }

  if (consent.marketing && analyticsConfig.metaPixelId) {
    injectScript("meta-pixel-script", "https://connect.facebook.net/en_US/fbevents.js");
  }
}

