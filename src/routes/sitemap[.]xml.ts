import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/config/site";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

/** Rotas públicas indexáveis (sem admin, sem rotas utilitárias, sem erro). */
const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/solucoes", changefreq: "monthly", priority: "0.8" },
  { path: "/remessas-internacionais", changefreq: "monthly", priority: "0.9" },
  { path: "/cambio-turismo", changefreq: "monthly", priority: "0.9" },
  { path: "/stablecoins", changefreq: "monthly", priority: "0.9" },
  { path: "/conta-atual", changefreq: "monthly", priority: "0.8" },
  { path: "/empresas", changefreq: "monthly", priority: "0.9" },
  { path: "/cotacoes", changefreq: "daily", priority: "0.8" },
  { path: "/unidades/sao-jose-dos-campos", changefreq: "monthly", priority: "0.8" },
  { path: "/quem-somos", changefreq: "yearly", priority: "0.6" },
  { path: "/a-atual", changefreq: "yearly", priority: "0.5" },
  { path: "/seguranca", changefreq: "yearly", priority: "0.5" },
  { path: "/contato", changefreq: "yearly", priority: "0.7" },
  { path: "/fale-com-especialista", changefreq: "monthly", priority: "0.7" },
  { path: "/conteudo", changefreq: "weekly", priority: "0.7" },
  { path: "/momento-atual", changefreq: "weekly", priority: "0.8" },
  { path: "/momento-atual/episodios", changefreq: "weekly", priority: "0.6" },
  { path: "/cripto-wine", changefreq: "weekly", priority: "0.6" },
  { path: "/vida-atual", changefreq: "weekly", priority: "0.6" },
  { path: "/newsletter", changefreq: "yearly", priority: "0.4" },
  { path: "/autores/redacao-atual", changefreq: "monthly", priority: "0.4" },
  { path: "/termos", changefreq: "yearly", priority: "0.3" },
  { path: "/privacidade", changefreq: "yearly", priority: "0.3" },
  { path: "/cookies", changefreq: "yearly", priority: "0.3" },
  { path: "/codigo-de-conduta", changefreq: "yearly", priority: "0.3" },
  { path: "/ouvidoria", changefreq: "yearly", priority: "0.3" },
  { path: "/responsabilidade-social", changefreq: "yearly", priority: "0.3" },
  { path: "/canal-de-denuncias", changefreq: "yearly", priority: "0.3" },
  { path: "/seguranca-cibernetica", changefreq: "yearly", priority: "0.3" },
  { path: "/pld-ft", changefreq: "yearly", priority: "0.3" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [...staticEntries];

        // Conteúdo editorial publicado — mesma fonte e filtros das rotas de artigo.
        try {
          const { publicClient } = await import("@/lib/cms.server");
          const { data: rows } = await publicClient()
            .from("editorial_content")
            .select("slug, editoria, updated_at, published_at")
            .eq("status", "publicado")
            .is("deleted_at", null)
            .order("published_at", { ascending: false })
            .limit(1000);

          for (const row of (rows ?? []) as {
            slug: string;
            editoria: string;
            updated_at: string | null;
            published_at: string | null;
          }[]) {
            if (!row.slug || !row.editoria) continue;
            const stamp = row.updated_at ?? row.published_at;
            entries.push({
              path: `/${row.editoria}/${row.slug}`,
              ...(stamp ? { lastmod: new Date(stamp).toISOString().slice(0, 10) } : {}),
              changefreq: "monthly",
              priority: "0.7",
            });
          }
        } catch {
          // Sem conteúdo dinâmico disponível, o sitemap estático ainda é servido.
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${SITE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
