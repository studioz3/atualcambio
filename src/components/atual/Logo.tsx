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
      className={className}
      width={644}
      height={118}
    />
  );
}
