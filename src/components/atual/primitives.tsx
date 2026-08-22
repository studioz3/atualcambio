import { cva, type VariantProps } from "class-variance-authority";
import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Container — 1280px máx, margens 20/32/48 */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1280px] px-5 md:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  tone = "light",
  className,
  id,
}: {
  children: ReactNode;
  tone?: "light" | "offwhite" | "navy" | "ink";
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "section-y",
        tone === "ink" && "surface-ink",
        tone === "navy" && "surface-navy",
        tone === "offwhite" && "surface-offwhite",
        tone === "light" && "bg-background text-graphite",
        className,
      )}
    >
      <Container>{children}</Container>
    </section>
  );
}

export function Eyebrow({ children, tone = "gold" }: { children: ReactNode; tone?: "gold" | "muted" }) {
  return (
    <p className={cn("eyebrow", tone === "gold" ? "text-gold" : "text-muted-foreground")}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "dark-text",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  tone?: "dark-text" | "light-text";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2
        className={cn("display-h2 mt-4", tone === "light-text" ? "text-white" : "text-navy")}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "body-lg mt-6",
            tone === "light-text" ? "text-white/80" : "text-muted-foreground",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}

/* Botões */
const buttonVariants = cva(
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-sm px-6 text-sm font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-45",
  {
    variants: {
      variant: {
        primary: "bg-gold text-gold-foreground hover:bg-gold-soft",
        secondary: "border border-navy/25 text-navy hover:border-navy hover:bg-navy/5",
        secondaryDark: "border border-white/35 text-white hover:border-gold hover:text-gold",
        text: "min-h-0 px-0 text-navy underline-offset-4 hover:text-gold-soft hover:underline",
        textLight: "min-h-0 px-0 text-white underline-offset-4 hover:text-gold hover:underline",
      },
      size: {
        default: "",
        lg: "min-h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

type ButtonBaseProps = VariantProps<typeof buttonVariants> & {
  className?: string;
  children: ReactNode;
  event?: string;
};

export function ActionButton({
  variant,
  size,
  className,
  children,
  event,
  ...rest
}: ButtonBaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      data-event={event}
      className={cn(buttonVariants({ variant, size }), className)}
      {...rest}
    >
      {children}
    </button>
  );
}

export function ActionLink({
  to,
  href,
  search,
  variant,
  size,
  className,
  children,
  event,
  external,
  onClick,
}: ButtonBaseProps & {
  to?: string;
  href?: string;
  search?: Record<string, string | undefined>;
  external?: boolean;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}) {
  const classes = cn(buttonVariants({ variant, size }), className);
  if (to) {
    return (
      <Link
        to={to}
        {...(search ? { search } : {})}
        data-event={event}
        className={classes}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  return (
    <a
      href={href}
      data-event={event}
      className={classes}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}
