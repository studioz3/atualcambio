import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { IS_INDEXABLE, SITE_URL } from "@/config/site";

/**
 * robots.txt dinâmico — enquanto o site for MVP (VITE_IS_INDEXABLE != "true"),
 * bloqueia toda a indexação para não competir com o site antigo.
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => {
        const body = IS_INDEXABLE
          ? [
              "User-agent: *",
              "Allow: /",
              "Disallow: /admin",
              "",
              `Sitemap: ${SITE_URL}/sitemap.xml`,
              "",
            ].join("\n")
          : ["User-agent: *", "Disallow: /", ""].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=300",
          },
        });
      },
    },
  },
});
