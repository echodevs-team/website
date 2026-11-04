export const locales = ["fa", "en", "ar"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fa";
export const localeCookie = "echo_locale";

export const localeNames: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
  ar: "العربية",
};

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function direction(locale: Locale): "rtl" | "ltr" {
  return locale === "en" ? "ltr" : "rtl";
}

// Only app-relative, equivalent paths; never turn an untrusted URL into a link.
export function localePath(locale: Locale, path = "/"): string {
  const decoded = decodeURIComponent(path);
  if (!path.startsWith("/") || decoded.startsWith("//") || /[\\?#\s]/u.test(decoded)
    || /(^|\/)\.{1,2}(\/|$)/u.test(decoded) || /%2f|%5c/iu.test(path)) {
    throw new Error("Expected an app-relative pathname without query or fragment");
  }
  return `/${locale}${path === "/" ? "" : path}`;
}

export function resolveLocale(cookie: string | undefined, acceptLanguage: string | null): Locale {
  if (isLocale(cookie)) return cookie;

  const preferences = (acceptLanguage ?? "").split(",").map((entry, index) => {
    const [language, ...parameters] = entry.trim().toLowerCase().split(";");
    const q = parameters.find((parameter) => parameter.trim().startsWith("q="));
    const quality = q ? Number(q.trim().slice(2)) : 1;
    return { language, quality, index };
  }).filter(({ quality }) => Number.isFinite(quality) && quality > 0 && quality <= 1)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { language } of preferences) {
    const base = language.split("-")[0];
    if (isLocale(base)) return base;
  }
  return defaultLocale;
}
