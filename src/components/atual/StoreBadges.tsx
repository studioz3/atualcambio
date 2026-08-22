import { links } from "@/content/site";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M16.365 12.63c-.02-2.253 1.84-3.334 1.923-3.386-1.047-1.53-2.676-1.74-3.253-1.764-1.385-.14-2.703.815-3.406.815-.702 0-1.784-.795-2.933-.774-1.509.022-2.9.877-3.676 2.226-1.567 2.716-.4 6.735 1.124 8.938.745 1.078 1.633 2.29 2.8 2.246 1.124-.045 1.548-.726 2.906-.726 1.357 0 1.74.726 2.93.703 1.209-.02 1.974-1.099 2.712-2.182.855-1.252 1.207-2.464 1.226-2.526-.027-.012-2.352-.902-2.353-3.57zM14.13 5.62c.62-.752 1.04-1.797.925-2.838-.895.036-1.978.596-2.62 1.347-.575.666-1.079 1.73-.943 2.752.998.077 2.017-.507 2.638-1.26z" />
    </svg>
  );
}

function PlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M3.6 2.2c-.3.3-.5.75-.5 1.33v16.94c0 .58.2 1.03.5 1.33l.09.08 9.5-9.5v-.22l-9.5-9.5-.09.08z" opacity=".55" />
      <path d="M16.5 15.6l-3.31-3.31v-.22l3.31-3.31.08.05 3.92 2.23c1.12.63 1.12 1.67 0 2.31l-3.92 2.22-.08.03z" />
      <path d="M16.58 15.55L13.19 12.16 3.6 21.8c.37.39.98.44 1.67.05l11.31-6.3" opacity=".85" />
      <path d="M16.58 8.45L5.27 2.15c-.69-.39-1.3-.34-1.67.05l9.59 9.6 3.39-3.35z" opacity=".7" />
    </svg>
  );
}

function BadgeLink({
  href,
  onClick,
  event,
  glyph,
  top,
  bottom,
  size,
}: {
  href: string;
  onClick: () => void;
  event: string;
  glyph: React.ReactNode;
  top: string;
  bottom: string;
  size: "default" | "sm";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-event={event}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-3 rounded-lg border border-current/25 bg-transparent transition-colors hover:border-current/60",
        size === "sm" ? "px-3 py-2" : "px-4 py-2.5",
      )}
    >
      <span className={size === "sm" ? "size-6" : "size-7"}>{glyph}</span>
      <span className="flex flex-col leading-none">
        <span className={cn("font-medium tracking-wide uppercase", size === "sm" ? "text-[9px]" : "text-[10px]")}>
          {top}
        </span>
        <span className={cn("font-semibold", size === "sm" ? "text-sm" : "text-base")}>{bottom}</span>
      </span>
    </a>
  );
}

export function StoreBadges({
  className,
  origem = "site",
  size = "default",
}: {
  className?: string;
  origem?: string;
  size?: "default" | "sm";
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <BadgeLink
        href={links.googlePlay}
        event="google_play_click"
        onClick={() => track("google_play_click", { origem })}
        glyph={<PlayGlyph className="size-full" />}
        top="Disponível no"
        bottom="Google Play"
        size={size}
      />
      <BadgeLink
        href={links.appStore}
        event="app_store_click"
        onClick={() => track("app_store_click", { origem })}
        glyph={<AppleGlyph className="size-full" />}
        top="Disponível na"
        bottom="App Store"
        size={size}
      />
    </div>
  );
}
