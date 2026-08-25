import { createHash } from "crypto";

export type TargetLang = "en" | "es";

const LANG_NAME: Record<TargetLang, string> = {
  en: "English (US)",
  es: "Spanish (Latin America)",
};

export function hashText(text: string) {
  return createHash("sha1").update(text).digest("hex");
}

type CacheRow = { hash: string; lang: string; target: string };

export async function translateTexts(lang: TargetLang, texts: string[]) {
  const unique = Array.from(new Set(texts.map((t) => t.trim()).filter(Boolean)));
  const result: Record<string, string> = {};
  if (unique.length === 0) return result;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const byHash = new Map<string, string>();
  for (const t of unique) byHash.set(hashText(t), t);

  const { data: cached } = await supabaseAdmin
    .from("translation_cache")
    .select("hash, lang, target")
    .eq("lang", lang)
    .in("hash", Array.from(byHash.keys()));

  const missing: string[] = [];
  const cachedHashes = new Set<string>();
  for (const row of ((cached ?? []) as CacheRow[])) {
    const source = byHash.get(row.hash);
    if (source) {
      result[source] = row.target;
      cachedHashes.add(row.hash);
    }
  }
  for (const [hash, source] of byHash) {
    if (!cachedHashes.has(hash)) missing.push(source);
  }
  if (missing.length === 0) return result;

  const translated = await callGateway(lang, missing);

  const rows = Object.entries(translated).map(([source, target]) => ({
    hash: hashText(source),
    lang,
    source,
    target,
  }));
  if (rows.length > 0) {
    await supabaseAdmin.from("translation_cache").upsert(rows, { onConflict: "hash,lang" });
  }

  return { ...result, ...translated };
}

async function callGateway(lang: TargetLang, texts: string[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI gateway não configurado");

  const payload = texts.reduce<Record<string, string>>((acc, text, i) => {
    acc[String(i)] = text;
    return acc;
  }, {});

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        {
          role: "system",
          content:
            `You are a professional financial translator for a Brazilian foreign-exchange institution (Atual Câmbio). ` +
            `Translate each value from Brazilian Portuguese into ${LANG_NAME[lang]}. ` +
            `Rules: keep the meaning, tone and formality; keep brand names (Atual Câmbio, Conta Atual, Momento Atual, Cripto Wine, Vida Atual, USDT, USDC, PIX, PTAX, ABRACAM, Banco Central) untranslated; ` +
            `keep numbers, currency codes, e-mails, URLs and punctuation as-is; do not add explanations. ` +
            `Return ONLY a JSON object with exactly the same keys, whose values are the translations.`,
        },
        { role: "user", content: JSON.stringify(payload) },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Falha na tradução (${response.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content) as Record<string, unknown>;
  } catch {
    return {};
  }

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(parsed)) {
    const index = Number(key);
    const source = texts[index];
    if (source && typeof value === "string" && value.trim()) out[source] = value;
  }
  return out;
}
