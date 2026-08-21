import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CONSENT_OPEN_EVENT,
  cookieCategories,
  readConsent,
  writeConsent,
} from "@/lib/cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    if (consent) {
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    } else {
      setVisible(true);
    }

    const onOpen = () => {
      const current = readConsent();
      if (current) {
        setAnalytics(current.analytics);
        setMarketing(current.marketing);
      }
      setVisible(true);
      setPanelOpen(true);
    };
    window.addEventListener(CONSENT_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, onOpen);
  }, []);

  const save = useCallback((value: { analytics: boolean; marketing: boolean }) => {
    writeConsent(value);
    setAnalytics(value.analytics);
    setMarketing(value.marketing);
    setPanelOpen(false);
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 md:px-8 md:pb-8"
    >
      <div className="surface-navy mx-auto w-full max-w-[1000px] rounded-[16px] border border-white/12 p-6 shadow-2xl md:p-8">
        <p className="eyebrow text-gold">Privacidade e cookies</p>
        <h2 className="font-display mt-3 text-lg font-bold text-white md:text-xl">
          Usamos cookies para operar o site com segurança
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-white/75">
          Utilizamos cookies necessários para o funcionamento e a segurança da plataforma e, mediante
          seu consentimento, cookies de desempenho e de comunicação. Você pode ajustar suas
          preferências a qualquer momento. Saiba mais na{" "}
          <Link to="/cookies" className="text-gold underline underline-offset-4">
            Política de Cookies
          </Link>{" "}
          e na{" "}
          <Link to="/privacidade" className="text-gold underline underline-offset-4">
            Política de Privacidade
          </Link>
          .
        </p>

        {panelOpen ? (
          <ul className="mt-6 space-y-4 border-t border-white/12 pt-6">
            {cookieCategories.map((category) => {
              const checked =
                category.id === "necessarios"
                  ? true
                  : category.id === "analytics"
                    ? analytics
                    : marketing;
              return (
                <li key={category.id} className="flex items-start gap-4">
                  <input
                    id={`cookie-${category.id}`}
                    type="checkbox"
                    checked={checked}
                    disabled={category.required}
                    onChange={(event) =>
                      category.id === "analytics"
                        ? setAnalytics(event.target.checked)
                        : setMarketing(event.target.checked)
                    }
                    className="mt-1 size-4 shrink-0 accent-gold disabled:opacity-60"
                  />
                  <label htmlFor={`cookie-${category.id}`} className="cursor-pointer">
                    <span className="text-sm font-semibold text-white">
                      {category.title}
                      {category.required ? " (sempre ativos)" : ""}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-white/65">
                      {category.description}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            data-event="cookies_aceitar_todos"
            onClick={() => save({ analytics: true, marketing: true })}
            className="inline-flex min-h-12 items-center rounded-sm bg-gold px-6 text-sm font-semibold text-navy transition-opacity hover:opacity-90"
          >
            Aceitar todos
          </button>
          <button
            type="button"
            data-event="cookies_recusar_opcionais"
            onClick={() => save({ analytics: false, marketing: false })}
            className="inline-flex min-h-12 items-center rounded-sm border border-white/35 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Recusar opcionais
          </button>
          {panelOpen ? (
            <button
              type="button"
              data-event="cookies_salvar_preferencias"
              onClick={() => save({ analytics, marketing })}
              className="inline-flex min-h-12 items-center rounded-sm border border-gold/60 px-6 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
            >
              Salvar preferências
            </button>
          ) : (
            <button
              type="button"
              data-event="cookies_abrir_preferencias"
              onClick={() => setPanelOpen(true)}
              className="inline-flex min-h-12 items-center rounded-sm px-6 text-sm font-semibold text-white/80 underline underline-offset-4 transition-colors hover:text-white"
            >
              Gerenciar preferências
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
