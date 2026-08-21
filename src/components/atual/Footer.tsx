import { Link } from "@tanstack/react-router";
import { Container } from "./primitives";
import { Logo } from "./Logo";
import { links } from "@/content/site";

const columns = [
  {
    title: "Soluções",
    items: [
      { label: "Remessas internacionais", to: "/solucoes", hash: "remessas" },
      { label: "USDT / USDC", to: "/solucoes", hash: "stablecoins" },
      { label: "Câmbio turismo", to: "/solucoes", hash: "turismo" },
      { label: "Conta Atual", to: "/solucoes", hash: "conta" },
    ],
  },
  {
    title: "Institucional",
    items: [
      { label: "A Atual", to: "/a-atual" },
      { label: "Para empresas", to: "/empresas" },
      { label: "Segurança e compliance", to: "/a-atual", hash: "seguranca" },
      { label: "Conteúdo", to: "/conteudo" },
    ],
  },
  {
    title: "Atendimento",
    items: [
      { label: "Cotações", to: "/cotacoes" },
      { label: "Falar com especialista", to: "/", hash: "especialista" },
      { label: "Perguntas frequentes", to: "/", hash: "faq" },
    ],
  },
  {
    title: "Legal",
    items: [
      { label: "Privacidade e LGPD", to: "/privacidade" },
      { label: "Termos de Uso", to: "/termos" },
      { label: "Segurança e compliance", to: "/a-atual", hash: "seguranca" },
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
        <div className="relative grid gap-12 py-16 md:grid-cols-[1fr_2fr] md:py-24">
          <div>
            <Logo src="/brand/logo-v2.svg" className="h-6 w-auto" />
            <p className="font-display mt-6 max-w-xs text-lg leading-tight text-white">
              Se você pensa global, você é Atual.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={links.appStore}
                data-event="app_store"
                className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white transition-colors hover:border-gold hover:text-gold"
              >
                App Store
              </a>
              <a
                href={links.googlePlay}
                data-event="google_play"
                className="inline-flex min-h-11 items-center rounded-sm border border-white/25 px-4 text-sm text-white transition-colors hover:border-gold hover:text-gold"
              >
                Google Play
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
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
          <p className="mt-4 text-xs text-white/40">
            © {new Date().getFullYear()} Atual Câmbio. Todos os direitos reservados.
          </p>
        </div>
      </Container>
    </footer>
  );
}
