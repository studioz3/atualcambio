import type { ReactNode, SelectHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const base =
  "min-h-13 w-full rounded-sm border border-line bg-white px-4 text-base text-graphite outline-none transition-colors focus:border-navy disabled:opacity-50";

export function FieldShell({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-graphite" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && !error ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  name,
  error,
  hint,
  className,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  error?: string | undefined;
  hint?: string | undefined;
}) {
  return (
    <FieldShell label={label} htmlFor={name} error={error} hint={hint}>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(base, error && "border-destructive", className)}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  label,
  name,
  options,
  error,
  className,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
  options: string[];
  error?: string | undefined;
}) {
  return (
    <FieldShell label={label} htmlFor={name} error={error}>
      <select
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        className={cn(base, error && "border-destructive", className)}
        {...rest}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </FieldShell>
  );
}
