import { Link } from "@tanstack/react-router";
import { Container } from "./primitives";
import { AccreditationSeals } from "./ui-kit";
import { Logo } from "./Logo";
import { links } from "@/content/site";
import { openCookiePreferences } from "@/lib/cookie-consent";
import { track } from "@/lib/analytics";

type FooterLink = { label: string; to: string; hash?: string };

const columns: { title: string; items: FooterLink[] }[] = [
  {
    title: "Institucional",
    items: [
      { label: "Home", to: "/" },
      { label: "Quem somos", to: "/a-atual" },
      { label: "Contato", to: "/", hash: "especialista" },
    ],
  },
  {
    title: "Serviços",
    items: [
      { label: "Câmbio comercial", to: "/empresas" },
      { label: "Câmbio turismo", to: "/solucoes", hash: "turismo" },
      { label: "Comércio exterior", to: "/empresas" },
    ],
  },
  {
    title: "Soluções",
    items: [
      { label: "Consultoria cambial", to: "/", hash: "especialista" },
      { label: "Remessas internacionais", to: "/solucoes", hash: "remessas" },
      { label: "USDT / USDC", to: "/solucoes", hash: "stablecoins" },
      { label: "Conta Atual", to: "/", hash: "conta-atual" },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { label: "Momento Atual", to: "/", hash: "momento-atual" },
      { label: "Notícias", to: "/conteudo" },
      { label: "Newsletter", to: "/conteudo", hash: "newsletter" },
    ],
  },
  {
    title: "Ética e compliance",
    items: [
      { label: "Termos de Uso", to: "/termos" },
      { label: "Política de Privacidade", to: "/privacidade" },
      { label: "Política de Cookies", to: "/cookies" },
      { label: "Código de Conduta", to: "/codigo-de-conduta" },
      { label: "Relatórios de Ouvidoria", to: "/ouvidoria" },
      { label: "Responsabilidade Social", to: "/responsabilidade-social" },
      { label: "Canal de Denúncias", to: "/canal-de-denuncias" },
      { label: "Política de Segurança Cibernética", to: "/seguranca-cibernetica" },
      { label: "PLD/FT", to: "/pld-ft" },
    ],
  },
];

const appLinks = [
  { label: "Google Play", href: links.googlePlay, event: "google_play_click" },
  { label: "App Store", href: links.appStore, event: "app_store_click" },
  { label: "Acessar conta", href: links.account, event: "login_click" },
];

export function Footer() {
  return (
    <footer className="surface-navy relative isolate">
      {/* Supergraphic: símbolo oficial da Atual em grande escala e baixa opacidade */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <img
          src="/brand/simbolo.png"
          alt=""
          loading="lazy"
          className="absolute -right-24 bottom-[-12%] h-[520px] w-auto max-w-none object-contain opacity-[0.05]"
        />
      </div>

      <Container>
        <div className="relative grid gap-14 py-16 md:py-24 lg:grid-cols-[minmax(240px,1fr)_2.6fr]">
          {/* Coluna 1 — marca */}
          <div>
            <Logo className="h-8 w-auto" />
            <p className="display-h4 mt-6 max-w-xs text-white">
              Se você pensa global, você é Atual.
            </p>

            <p className="eyebrow mt-10 text-gold">Conta Atual</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {appLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  data-event={item.event}
                  onClick={() => track(item.event, { origem: "footer" })}
                  className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white transition-colors hover:border-gold hover:text-gold"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {/* Colunas 2 a 6 */}
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="eyebrow text-gold">{col.title}</p>
                <ul className="mt-5 space-y-3">
                  {col.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        {...(item.hash ? { hash: item.hash } : {})}
                        className="text-sm text-white/70 transition-colors hover:text-white"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Atendimento e regulação */}
        <div className="relative grid gap-10 border-t border-white/10 py-12 md:grid-cols-2">
          <div>
            <p className="eyebrow text-gold">Atendimento e Ouvidoria</p>
            <ul className="mt-5 space-y-2 text-sm text-white/70">
              <li>Ouvidoria: 0800 770-5422</li>
              <li>Segunda a sexta, das 9h às 18h</li>
              <li>
                <a
                  href="mailto:contato@atualcambio.com.br"
                  className="transition-colors hover:text-white"
                >
                  contato@atualcambio.com.br
                </a>
              </li>
              <li>
                <Link to="/canal-de-denuncias" className="transition-colors hover:text-white">
                  Canal de Denúncias
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="eyebrow text-gold">Regulação</p>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/70">
              Atual Câmbio — instituição autorizada a operar no mercado de câmbio brasileiro,
              sujeita à regulação e supervisão do Banco Central do Brasil, e associada à ABRACAM.
            </p>
            <AccreditationSeals size="sm" className="mt-7" />
          </div>
        </div>

        {/* Base legal */}
        <div className="relative border-t border-white/10 py-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/45">
            <span>© {new Date().getFullYear()} Atual Câmbio. Todos os direitos reservados.</span>
            <Link to="/privacidade" className="transition-colors hover:text-white">
              Privacidade
            </Link>
            <Link to="/termos" className="transition-colors hover:text-white">
              Termos de Uso
            </Link>
            <Link to="/cookies" className="transition-colors hover:text-white">
              Política de Cookies
            </Link>
            <button
              type="button"
              onClick={openCookiePreferences}
              data-event="cookies_abrir_preferencias"
              className="underline-offset-4 transition-colors hover:text-white hover:underline"
            >
              Preferências de Cookies
            </button>
            <Link to="/ouvidoria" className="transition-colors hover:text-white">
              Ouvidoria
            </Link>
            <Link to="/canal-de-denuncias" className="transition-colors hover:text-white">
              Canal de Denúncias
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
