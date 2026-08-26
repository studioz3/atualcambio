import { useEffect, useState } from "react";
import { Calculator, X } from "lucide-react";
import { CurrencyConverter } from "@/components/atual/CurrencyConverter";
import { track } from "@/lib/analytics";

/** Bloco flutuante com a calculadora de câmbio (PTAX). */
export function FloatingConverter() {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="pointer-events-auto flex w-full max-w-[420px] flex-col items-end gap-3">
        {open ? (
          <div className="w-full overflow-hidden rounded-xl border border-line bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 bg-navy px-5 py-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Calculadora
                </p>
                <p className="text-sm font-semibold text-white">Converter moedas (PTAX)</p>
              </div>
              <button
                type="button"
                aria-label="Fechar calculadora"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              <CurrencyConverter className="rounded-none border-0 p-5 shadow-none sm:p-5" />
            </div>
          </div>
        ) : null}

        {open ? null : (
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Fechar calculadora de câmbio" : "Abrir calculadora de câmbio"}
          onClick={() => {
            setOpen((prev) => {
              if (!prev) track("currency_converter_open", { origem: "flutuante" });
              return !prev;
            });
          }}
          className="flex min-h-13 items-center gap-3 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-xl transition-transform hover:scale-[1.03]"
        >
          <Calculator className="size-4" aria-hidden />
          Calculadora de câmbio
        </button>
        )}
      </div>
    </div>
  );
}
