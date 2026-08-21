import { cn } from "@/lib/utils";

export function Logo({
  className = "h-7 w-auto",
  src = "/brand/logo-simple.svg",
}: {
  className?: string;
  src?: string;
}) {
  return (
    <img
      src={src}
      alt="Atual Câmbio"
      className={cn("block w-auto max-w-full shrink-0 object-contain object-left", className)}
      style={{ aspectRatio: "644 / 118" }}
      loading="eager"
      decoding="async"
    />
  );
}
