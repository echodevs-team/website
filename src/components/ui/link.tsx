import type { ComponentPropsWithoutRef } from "react";

export type LinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
  appearance?: "text" | "primary" | "secondary";
};

/** Native navigation; no disabled/loading fake-link semantics. */
export function Link({ appearance = "text", className = "", rel, target, ...props }: LinkProps) {
  return <a {...props} target={target} rel={target === "_blank" ? `${rel ?? ""} noopener noreferrer`.trim() : rel}
    className={`${appearance === "text" ? "ui-link" : "ui-link-button"} ${className}`}
    data-variant={appearance === "text" ? undefined : appearance} />;
}
