import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, ChevronDown } from "lucide-react";
import { Container, ActionLink, ActionButton } from "./primitives";
import { Logo } from "./Logo";
import { nav, links } from "@/content/site";
import { cn } from "@/lib/utils";
import { useLead } from "./LeadProvider";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const { openLead } = useLead();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "surface-navy fixed inset-x-0 top-0 z-50 transition-all duration-200",
        scrolled ? "border-b border-white/10 shadow-[0_1px_20px_rgba(1,24,58,0.25)]" : "",
      )}
    >
      <Container>
        <div
          className={cn(
            "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 transition-all duration-200",
            scrolled ? "h-16" : "h-20",
          )}
        >
          <div className="flex min-w-0 items-center gap-8">
            <Link to="/" aria-label="Atual Câmbio — página inicial" className="shrink-0">
              <Logo className={cn("w-auto transition-all", scrolled ? "h-5" : "h-6")} />
            </Link>

            <nav className="hidden items-center gap-6 lg:flex" aria-label="Principal">
              {nav.map((item) =>
                "items" in item && item.items ? (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => setOpenMenu(item.label)}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <Link
                      to={item.to}
                      className="flex items-center gap-1 py-2 text-sm text-white/85 transition-colors hover:text-gold"
                    >
                      {item.label}
                      <ChevronDown className="size-3.5" aria-hidden />
                    </Link>
                    {openMenu === item.label ? (
                      <div className="absolute top-full left-0 w-64 rounded-md border border-white/10 bg-navy p-2 shadow-[0_12px_40px_rgba(1,24,58,0.45)]">
                        {item.items.map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            hash={sub.hash}
                            className="block rounded-sm px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-gold"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="py-2 text-sm text-white/85 transition-colors hover:text-gold"
                    activeProps={{ className: "text-gold" }}
                  >
                    {item.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <ActionLink
              href={links.account}
              variant="textLight"
              event="login_click"
              className="px-3 text-sm"
            >
              Acessar
            </ActionLink>
            <ActionButton
              onClick={() => openLead({ intent: "conta", context: "Abrir Conta Atual" })}
              event="open_account_click"
              className="hidden sm:inline-flex"
            >
              Abrir Conta Atual
            </ActionButton>
            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid size-11 place-items-center rounded-sm text-white lg:hidden"
            >
              {open ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>

        </div>
      </Container>

      {open ? (
        <div className="border-t border-white/10 bg-navy lg:hidden">
          <Container>
            <nav className="flex flex-col py-4" aria-label="Menu mobile">
              {nav.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="min-h-12 border-b border-white/8 py-3 text-base text-white/90"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 pt-5 pb-6">
                <ActionButton
                  onClick={() => {
                    setOpen(false);
                    openLead({ context: "Abrir Conta Atual" });
                  }}
                  event="open_account"
                >
                  Abrir Conta Atual
                </ActionButton>
                <ActionLink href={links.account} variant="secondaryDark" event="account_login">
                  Acessar conta
                </ActionLink>
              </div>
            </nav>
          </Container>
        </div>
      ) : null}
      <span className="sr-only">
        <X aria-hidden />
      </span>
    </header>
  );
}
