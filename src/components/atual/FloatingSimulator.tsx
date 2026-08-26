import { useEffect, useState } from "react";
import { Calculator, X } from "lucide-react";

import { HeroSimulator } from "@/components/atual/HeroSimulator";
import { track } from "@/lib/analytics";

/** Simulador de câmbio flutuante: fixo na viewport, com fechar e estado minimizado. */
export function FloatingSimulator({
  defaultOpen = true,
  onConvert,
}: {
  defaultOpen?: boolean;
  onConvert?: () => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          track("currency_converter_open", { origem: "flutuante" });
        }}
        className="fixed bottom-5 right-5 z-50 inline-flex min-h-12 items-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-gold-foreground shadow-2xl transition-colors hover:bg-gold-soft"
      >
        <Calculator className="h-4 w-4" aria-hidden />
        Simulador de câmbio
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(92vw,380px)]">
      <div className="relative max-h-[85svh] overflow-y-auto rounded-2xl shadow-2xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Fechar simulador"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/15 text-gold-foreground transition-colors hover:bg-black/30"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <HeroSimulator className="max-w-none" onConvert={onConvert} />
      </div>
    </div>
  );
}
