import { cn } from "@/lib/utils";
import atualMarca from "@/assets/atual-marca.png.asset.json";

export function Logo({
  className = "h-7 w-auto",
  src = atualMarca.url,
}: {
  className?: string;
  src?: string;
}) {
  return (
    <img
      src={src}
      alt="Atual Câmbio"
      className={cn("block w-auto max-w-full shrink-0 object-contain object-left", className)}
      loading="eager"
      decoding="async"
    />
  );
}
