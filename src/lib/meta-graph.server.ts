/**
 * Cliente da Graph API da Meta — server-only.
 * Versão fixa, appsecret_proof em toda chamada, leitura dos headers de uso,
 * classificação de erro e backoff com jitter.
 */

export const GRAPH_VERSION = "v26.0";
export const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

/** Remove tokens de qualquer texto antes de logar/gravar. */
export function sanitize(text: string) {
  return String(text)
    .replace(/(access_token|input_token|appsecret_proof)=[^&"\s]+/gi, "$1=***")
    .replace(/\b(EAA|IGQ)[A-Za-z0-9_-]{10,}/g, "***");
}

export class GraphError extends Error {
  code: number | null;
  subcode: number | null;
  httpStatus: number;
  constructor(message: string, opts: { code?: number | null; subcode?: number | null; httpStatus?: number }) {
    super(sanitize(message));
    this.name = "GraphError";
    this.code = opts.code ?? null;
    this.subcode = opts.subcode ?? null;
    this.httpStatus = opts.httpStatus ?? 0;
  }
}

/** Rate limit estourado: para TODAS as chamadas daquele token. */
export class RateLimitAbort extends Error {
  usagePct: number;
  constructor(usagePct: number) {
    super(`Limite de uso da API atingido (${usagePct}%). Sincronização interrompida.`);
    this.name = "RateLimitAbort";
    this.usagePct = usagePct;
  }
}

/** Token inválido / permissão ausente → precisa reautorizar. */
export class AuthError extends Error {
  code: number | null;
  constructor(message: string, code: number | null) {
    super(sanitize(message));
    this.name = "AuthError";
    this.code = code;
  }
}

const RETRYABLE_CODES = new Set([1, 2, 4, 17, 32, 341, 368, 613, 80001, 80002]);
const NEVER_RETRY_CODES = new Set([10, 100, 102, 190]);

function isNeverRetry(code: number | null) {
  if (code == null) return false;
  if (NEVER_RETRY_CODES.has(code)) return true;
  return code >= 200 && code <= 299;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function hmacHex(key: string, message: string) {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

type UsageInfo = { pct: number; regainMinutes: number | null };

function readUsage(response: Response): UsageInfo {
  let pct = 0;
  let regainMinutes: number | null = null;

  const consider = (obj: any) => {
    if (!obj || typeof obj !== "object") return;
    for (const key of ["call_count", "total_time", "total_cputime"]) {
      const value = Number(obj[key]);
      if (Number.isFinite(value)) pct = Math.max(pct, value);
    }
    const regain = Number(obj["estimated_time_to_regain_access"]);
    if (Number.isFinite(regain) && regain > 0) {
      regainMinutes = Math.max(regainMinutes ?? 0, regain);
    }
  };

  const appUsage = response.headers.get("x-app-usage");
  if (appUsage) {
    try {
      consider(JSON.parse(appUsage));
    } catch {
      /* header malformado é ignorado */
    }
  }

  const bucUsage = response.headers.get("x-business-use-case-usage");
  if (bucUsage) {
    try {
      const parsed = JSON.parse(bucUsage) as Record<string, any[]>;
      for (const entries of Object.values(parsed)) {
        for (const entry of entries ?? []) consider(entry);
      }
    } catch {
      /* header malformado é ignorado */
    }
  }

  return { pct, regainMinutes };
}

export type GraphClient = {
  get: (path: string, params?: Record<string, string | number | undefined>) => Promise<any>;
  getUrl: (url: string) => Promise<any>;
  usagePct: () => number;
};

export function createGraphClient(accessToken: string, appSecret: string): GraphClient {
  let usagePct = 0;
  let proof: string | null = null;

  async function ensureProof() {
    if (!proof) proof = await hmacHex(appSecret, accessToken);
    return proof;
  }

  async function request(url: URL): Promise<any> {
    url.searchParams.set("access_token", accessToken);
    url.searchParams.set("appsecret_proof", await ensureProof());

    let attempt = 0;
    for (;;) {
      if (usagePct >= 95) throw new RateLimitAbort(usagePct);
      if (usagePct >= 80) await sleep(5000);

      let response: Response;
      try {
        response = await fetch(url.toString(), { headers: { accept: "application/json" } });
      } catch (networkError) {
        if (attempt >= 4) throw new GraphError(`Falha de rede: ${String(networkError)}`, {});
        await sleep(backoff(attempt++));
        continue;
      }

      const usage = readUsage(response);
      usagePct = Math.max(usagePct, usage.pct);

      const text = await response.text();
      let payload: any = null;
      try {
        payload = text ? JSON.parse(text) : null;
      } catch {
        payload = null;
      }

      if (response.ok && payload && !payload.error) {
        if (usagePct >= 95) throw new RateLimitAbort(usagePct);
        return payload;
      }

      const err = payload?.error ?? {};
      const code: number | null = Number.isFinite(Number(err.code)) ? Number(err.code) : null;
      const subcode: number | null = Number.isFinite(Number(err.error_subcode))
        ? Number(err.error_subcode)
        : null;
      const message: string = err.message ?? `HTTP ${response.status}`;

      if (code === 190 || code === 102 || code === 10) {
        throw new AuthError(message, code);
      }
      if (code === 4 || code === 17 || code === 32 || code === 613 || code === 80001 || code === 80002) {
        if (usage.regainMinutes != null) {
          // O tempo devolvido pela Meta é autoritativo, mas não seguramos o worker
          // por minutos: abortamos o run e o próximo agendamento retoma.
          throw new RateLimitAbort(Math.max(usagePct, 95));
        }
      }

      const retryable = (code != null && RETRYABLE_CODES.has(code)) || response.status >= 500;
      if (!retryable || isNeverRetry(code) || attempt >= 4) {
        throw new GraphError(message, { code, subcode, httpStatus: response.status });
      }
      await sleep(backoff(attempt++));
    }
  }

  function backoff(attempt: number) {
    const base = Math.min(2000 * 2 ** attempt, 15 * 60_000);
    return base + Math.random() * Math.min(base, 2000);
  }

  return {
    get: (path, params = {}) => {
      const url = new URL(`${GRAPH_BASE}/${path.replace(/^\//, "")}`);
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
      }
      return request(url);
    },
    getUrl: (raw) => request(new URL(raw)),
    usagePct: () => usagePct,
  };
}
