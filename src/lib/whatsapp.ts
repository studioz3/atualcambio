import type { LeadInput } from "./leads.functions";

/**
 * Mensagem contextual de WhatsApp — montada a partir do formulário.
 * Nunca abrimos o WhatsApp com mensagem genérica.
 * [AGUARDANDO VALIDAÇÃO] número oficial de atendimento.
 */
export function buildWhatsappMessage(lead: LeadInput): string {
  const parts: string[] = [];
  const first = lead.nome.split(" ")[0] ?? lead.nome;
  parts.push(`Olá, sou ${first}.`);

  const empresa = lead.tipo_cliente === "pj" && lead.empresa ? ` da ${lead.empresa}` : "";
  const operacao = lead.operacao ? `${lead.operacao.toLowerCase()}` : lead.produto.toLowerCase();
  const moeda = lead.moeda ? ` em ${lead.moeda}` : "";
  parts.push(`Gostaria de falar sobre uma operação de ${operacao}${moeda}${empresa}.`);

  if (lead.faixa_valor && lead.faixa_valor !== "Ainda não sei") {
    parts.push(`Faixa de valor: ${lead.faixa_valor}.`);
  }
  if (lead.finalidade) parts.push(`Finalidade: ${lead.finalidade}.`);
  if (lead.prazo && lead.prazo !== "Sem data definida") parts.push(`Prazo: ${lead.prazo}.`);

  return parts.join(" ");
}

export function buildWhatsappUrl(phone: string | null, message: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function getDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function getUtm() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const pick = (key: string) => params.get(key)?.slice(0, 120) || undefined;
  return {
    source_url: window.location.href.slice(0, 500),
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    utm_content: pick("utm_content"),
    utm_term: pick("utm_term"),
    referrer: (document.referrer || undefined)?.slice(0, 500),
    dispositivo: getDevice(),
    timestamp: new Date().toISOString(),
  };
}
