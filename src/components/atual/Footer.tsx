import { Link } from "@tanstack/react-router";
import { Container } from "./primitives";
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
      { label: "Conta Atual", to: "/solucoes", hash: "conta" },
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

export function Footer() {
  return (
    <footer className="surface-navy relative overflow-hidden">
      <img
        src="/brand/simbolo.png"
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute -right-16 -bottom-24 w-[420px] opacity-[0.06]"
      />
      <Container>
        <div className="relative grid gap-12 py-16 md:grid-cols-[1fr_2.4fr] md:py-24">
          <div>
            <Logo className="h-7 w-auto" />
            <p className="font-display mt-6 max-w-xs text-lg leading-tight text-white">
              Se você pensa global, você é Atual.
            </p>

            <p className="eyebrow mt-10 text-gold">Conta Atual</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={links.googlePlay}
                data-event="google_play_click"
                onClick={() => track("google_play_click", { origem: "footer" })}
                className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white transition-colors hover:border-gold hover:text-gold"
              >
                Google Play
              </a>
              <a
                href={links.appStore}
                data-event="app_store_click"
                onClick={() => track("app_store_click", { origem: "footer" })}
                className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white transition-colors hover:border-gold hover:text-gold"
              >
                App Store
              </a>
              <a
                href={links.account}
                data-event="login_click"
                onClick={() => track("login_click", { origem: "footer" })}
                className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white transition-colors hover:border-gold hover:text-gold"
              >
                Acessar conta
              </a>
            </div>
            <p className="mt-3 text-xs text-white/40">[AGUARDANDO ONZ] deeplinks do aplicativo.</p>

            <p className="eyebrow mt-10 text-gold">Atendimento e Ouvidoria</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              <li>Ouvidoria: 0800 770-5422</li>
              <li>Segunda a sexta, das 9h às 18h</li>
              <li>contato@atualcambio.com.br</li>
            </ul>
          </div>

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

        <div className="relative border-t border-white/10 py-8">
          <p className="max-w-3xl text-xs leading-relaxed text-white/55">
            Atual Câmbio — instituição autorizada a operar no mercado de câmbio brasileiro, sujeita à
            regulação e supervisão do Banco Central do Brasil.{" "}
            <span className="text-white/40">
              [AGUARDANDO VALIDAÇÃO] razão social, CNPJ, endereços e textos regulatórios completos.
            </span>
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/40">
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
              Canal de denúncias
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
