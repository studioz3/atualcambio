/**
 * Níveis gerenciais do painel Atual (client-safe).
 * admin      → acesso total
 * consultor  → time comercial: apenas leads
 * marketing  → métricas, conteúdo, redes sociais e newsletter
 */
export type AppRole = "admin" | "consultor" | "marketing";

export const LEADS_ROLES: AppRole[] = ["admin", "consultor"];
export const CONTENT_ROLES: AppRole[] = ["admin", "marketing"];
export const ADMIN_ROLES: AppRole[] = ["admin"];

export const roleLabels: Record<AppRole, string> = {
  admin: "Administrador",
  consultor: "Comercial",
  marketing: "Marketing",
};

export function hasAnyRole(roles: string[] | undefined, allowed: readonly string[]) {
  return (roles ?? []).some((r) => allowed.includes(r));
}

export function labelRoles(roles: string[] | undefined) {
  return (roles ?? []).map((r) => roleLabels[r as AppRole] ?? r).join(", ");
}
