import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const translateSchema = z.object({
  lang: z.enum(["en", "es"]),
  texts: z.array(z.string().min(1).max(2000)).min(1).max(120),
});

export const translateBatch = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => translateSchema.parse(data))
  .handler(async ({ data }) => {
    const { translateTexts } = await import("./translate.server");
    try {
      const map = await translateTexts(data.lang, data.texts);
      return { ok: true as const, map };
    } catch (error) {
      console.error("translateBatch", error);
      return { ok: false as const, map: {} as Record<string, string> };
    }
  });
