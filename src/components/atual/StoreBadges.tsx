import { links } from "@/content/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import googlePlayBadge from "@/assets/badge-google-play-v2.png.asset.json";
import appStoreBadge from "@/assets/badge-app-store-v2.png.asset.json";

export function StoreBadges({
  className,
  origem = "site",
  size = "default",
  tone = "light",
}: {
  className?: string;
  origem?: string;
  size?: "default" | "sm";
  /** "light" = arte branca (fundos escuros) | "dark" = arte escura (fundos claros) */
  tone?: "light" | "dark";
}) {
  const heightClass = size === "sm" ? "h-9" : "h-11";
  const imgClass = cn("w-auto object-contain shrink-0", heightClass, tone === "dark" && "invert");

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href={links.googlePlay}
        target="_blank"
        rel="noopener noreferrer"
        data-event="google_play_click"
        onClick={() => track("google_play_click", { origem })}
        className="inline-flex items-center transition-opacity hover:opacity-80"
      >
        <img src={googlePlayBadge.url} alt="Baixe o app Atual Câmbio no Google Play" className={imgClass} />
      </a>
      <a
        href={links.appStore}
        target="_blank"
        rel="noopener noreferrer"
        data-event="app_store_click"
        onClick={() => track("app_store_click", { origem })}
        className="inline-flex items-center transition-opacity hover:opacity-80"
      >
        <img src={appStoreBadge.url} alt="Baixe o app Atual Câmbio na App Store" className={imgClass} />
      </a>
    </div>
  );
}
