import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, type ReactNode } from "react";
import { trackPageView } from "@/lib/analytics";
import { orgSchema, robotsContent } from "@/lib/seo";


import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/atual/Header";
import { Footer } from "@/components/atual/Footer";
import { LeadProvider } from "@/components/atual/LeadProvider";
import { Toaster } from "@/components/ui/sonner";
import { CookieBanner } from "@/components/atual/CookieBanner";

function NotFoundComponent() {
  return (
    <div className="surface-navy flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <p className="eyebrow text-gold">Erro 404</p>
        <h1 className="font-display mt-4 text-4xl font-bold text-white">Página não encontrada</h1>
        <p className="mt-4 text-sm text-white/70">
          O endereço que você acessou não existe ou foi movido.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex min-h-12 items-center rounded-sm bg-gold px-6 text-sm font-semibold text-gold-foreground"
        >
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="surface-navy flex min-h-screen items-center justify-center px-5">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-white">Esta página não carregou</h1>
        <p className="mt-4 text-sm text-white/70">
          Algo saiu do esperado. Você pode tentar novamente ou voltar para a home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-12 items-center rounded-sm bg-gold px-6 text-sm font-semibold text-gold-foreground"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="inline-flex min-h-12 items-center rounded-sm border border-white/35 px-6 text-sm font-semibold text-white"
          >
            Ir para a home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Atual Câmbio | Câmbio digital com especialista quando precisar" },
      {
        name: "description",
        content:
          "Plataforma digital quando você quer autonomia. Especialista quando você precisa de orientação. Remessas, USDT/USDC e câmbio turismo.",
      },
      { name: "robots", content: robotsContent() },
      { name: "author", content: "Atual Câmbio" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Atual Câmbio" },
      { property: "og:locale", content: "pt_BR" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#01183A" },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(orgSchema) },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Syncopate:wght@400;700&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const firstView = useRef(true);

  useEffect(() => {
    // O primeiro page_view é enviado pelo config do gtag; aqui cobrimos a navegação SPA.
    if (firstView.current) {
      firstView.current = false;
      return;
    }
    trackPageView(pathname);
  }, [pathname]);


  if (isAdmin) {
    return (
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster position="top-center" />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <LeadProvider>
        <Header />
        <main className="pt-16 md:pt-20">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
        <CookieBanner />
        <Toaster position="top-center" />
      </LeadProvider>
    </QueryClientProvider>
  );
}
