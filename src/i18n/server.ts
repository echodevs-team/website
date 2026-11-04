import { headers } from "next/headers";
import { cache } from "react";
import { defaultLocale, isLocale } from "./config";

// Only the proxy's overwritten request header controls the root document.
export const getDocumentLocale = cache(async () => {
  const candidate = (await headers()).get("x-echo-locale") ?? undefined;
  return isLocale(candidate) ? candidate : defaultLocale;
});
