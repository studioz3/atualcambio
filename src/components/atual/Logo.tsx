export function Logo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <img
      src="/brand/logo-v2.svg"
      alt="Atual Câmbio"
      className={className}
      width={1143}
      height={142}
    />
  );
}
