import type { ComponentPropsWithRef } from "react";

export type ButtonProps = ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary";
} & ({ loading: true; loadingLabel: string } | { loading?: false; loadingLabel?: never });

export function Button({ variant = "primary", type = "button", disabled, loading = false,
  loadingLabel, children, className = "", ...props }: ButtonProps) {
  return <button {...props} type={type} className={`ui-button ${className}`} data-variant={variant}
    disabled={disabled || loading} aria-busy={loading || undefined}
    aria-label={loading ? loadingLabel : props["aria-label"]}>
    {loading ? loadingLabel : children}
  </button>;
}
