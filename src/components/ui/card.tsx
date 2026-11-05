import type { ComponentPropsWithoutRef } from "react";

/** Noninteractive: use a named Link inside, not a clickable card around controls. */
export function Card({ className = "", ...props }: ComponentPropsWithoutRef<"article">) {
  return <article {...props} className={`ui-card ${className}`} />;
}
