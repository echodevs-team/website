import type { ComponentPropsWithoutRef } from "react";
import { Container } from "./container";

/** Content slot only: no invented contacts, claims or dead navigation. */
export function Footer({ className = "", children, ...props }: ComponentPropsWithoutRef<"footer">) {
  return <footer {...props} className={`ui-footer ${className}`}><Container>{children}</Container></footer>;
}
