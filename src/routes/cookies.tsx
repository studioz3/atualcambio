import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { LegalPage } from "@/components/atual/LegalPage";
import { blocks, intro } from "@/content/legal/cookies";
import { openCookiePreferences } from "@/lib/cookie-consent";

export const Route = createFileRoute("/cookies")({
  head: () =>
    pageHead({
      path: "/cookies",
      title: "Política de Cookies | Atual Câmbio",
      description: "Como a Atual Câmbio usa cookies e tecnologias semelhantes, quais categorias existem e como gerenciar suas preferências conforme a LGPD.",
    }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Privacidade e LGPD"
      title="Política de Cookies"
      intro={intro}
      blocks={blocks}
      footnote={
        <button
          type="button"
          data-event="cookies_gerenciar_pagina"
          onClick={openCookiePreferences}
          className="inline-flex min-h-12 items-center rounded-sm border border-navy/20 px-6 text-sm font-semibold text-navy transition-colors hover:bg-navy/5"
        >
          Gerenciar preferências de cookies
        </button>
      }
    />
  );
}
