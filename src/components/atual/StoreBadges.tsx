import appStoreBadge from "@/assets/badge-app-store.png.asset.json";
import googlePlayBadge from "@/assets/badge-google-play.png.asset.json";
import { links } from "@/content/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function StoreBadges({
  className,
  origem = "site",
  size = "default",
}: {
  className?: string;
  origem?: string;
  size?: "default" | "sm";
}) {
  const height = size === "sm" ? "h-10" : "h-12";

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <a
        href={links.appStore}
        target="_blank"
        rel="noopener noreferrer"
        data-event="app_store_click"
        onClick={() => track("app_store_click", { origem })}
        className="inline-flex transition-opacity hover:opacity-85"
      >
        <img
          src={appStoreBadge.url}
          alt="Baixar na App Store"
          loading="lazy"
          className={cn("w-auto shrink-0 object-contain", height)}
        />
      </a>
      <a
        href={links.googlePlay}
        target="_blank"
        rel="noopener noreferrer"
        data-event="google_play_click"
        onClick={() => track("google_play_click", { origem })}
        className="inline-flex transition-opacity hover:opacity-85"
      >
        <img
          src={googlePlayBadge.url}
          alt="Disponível no Google Play"
          loading="lazy"
          className={cn("w-auto shrink-0 object-contain", height)}
        />
      </a>
    </div>
  );
}
