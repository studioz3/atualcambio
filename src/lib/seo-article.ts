/**
 * Metadados e JSON-LD dos conteúdos editoriais (Momento Atual, Cripto Wine, Vida Atual).
 * Garante URLs absolutas para og:image / twitter:image e Article + BreadcrumbList.
 */

import { ORG_ID, absoluteUrl } from "@/config/site";
import { breadcrumbSchema, pageHead } from "@/lib/seo";
import type { Article } from "@/content/editorial";

/** Slug da página de autor a partir do nome exibido na assinatura. */
export function authorSlug(name: string): string {
  return (name || "Redação Atual")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function articleHead(input: {
  editoriaPath: string;
  editoriaName: string;
  article: Article;
}) {
  const { article, editoriaPath, editoriaName } = input;
  const path = `${editoriaPath}/${article.slug}`;
  const url = absoluteUrl(path);
  const image = article.imagem_social ?? article.imagem_principal ?? null;
  const absoluteImage = image ? absoluteUrl(image) : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: (article.titulo ?? "").slice(0, 110),
    description: article.meta_description,
    ...(absoluteImage ? { image: [absoluteImage] } : {}),
    datePublished: article.data,
    dateModified: article.updated_at ?? article.data,
    author: {
      "@type": "Person",
      name: article.autor,
      url: absoluteUrl(`/autores/${authorSlug(article.autor)}`),
    },
    publisher: { "@id": ORG_ID },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    inLanguage: "pt-BR",
    articleSection: editoriaName,
  };

  return pageHead({
    path,
    title: article.seo_title || article.titulo,
    description: article.meta_description,
    image: absoluteImage,
    type: "article",
    jsonLd: [
      articleSchema,
      breadcrumbSchema([
        { name: "Conteúdo", path: "/conteudo" },
        { name: editoriaName, path: editoriaPath },
        { name: article.titulo },
      ]),
    ],
  });
}
