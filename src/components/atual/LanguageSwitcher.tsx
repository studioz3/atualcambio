import { useEffect, useRef, useState } from "react";
import { Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslate, type SiteLang } from "./TranslateProvider";

const OPTIONS: Array<{ id: SiteLang; label: string; short: string }> = [
  { id: "pt", label: "Português", short: "PT" },
  { id: "en", label: "English", short: "EN" },
  { id: "es", label: "Español", short: "ES" },
];

export function LanguageSwitcher({ className }: { className?: string }) {
  const { lang, setLang, translating } = useTranslate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = OPTIONS.find((o) => o.id === lang) ?? OPTIONS[0]!;

  return (
    <div ref={ref} className={cn("relative", className)} data-no-translate>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Selecionar idioma"
        aria-expanded={open}
        className="flex min-h-11 items-center gap-1.5 rounded-sm px-2 text-sm text-white/85 transition-colors hover:text-gold"
      >
        {translating ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Globe className="size-4" aria-hidden />
        )}
        <span className="font-medium">{current.short}</span>
      </button>

      {open ? (
        <div className="absolute top-full right-0 z-50 mt-1 w-40 rounded-md border border-white/10 bg-navy-deep p-1 shadow-[0_12px_40px_rgba(1,24,58,0.45)]">
          {OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setLang(option.id);
                setOpen(false);
              }}
              className={cn(
                "block w-full rounded-sm px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/5 hover:text-gold",
                option.id === lang ? "text-gold" : "text-white/80",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
