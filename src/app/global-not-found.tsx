import type { Metadata } from "next";
import { getDocumentLocale } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import { direction, localeNames, localePath, locales } from "@/i18n/config";
import { ThemeInit } from "@/components/layout/theme-init";
import "@/styles/globals.css";

export const metadata: Metadata = { title: "404 — Echo Devs", robots: { index: false, follow: false } };

// Routing-level fallback avoids throwing notFound during document rendering.
export default async function GlobalNotFound() {
  const locale = await getDocumentLocale();
  const t = getMessages(locale).Foundation;
  return (
    <html lang={locale} dir={direction(locale)} suppressHydrationWarning>
      <head><ThemeInit /></head>
      <body><main id="main" tabIndex={-1}>
        <h1>{t.notFound}</h1>
        <nav aria-label={t.languages}>
          <ul className="language-links">
            {locales.map((target) => <li key={target}>
              <a href={localePath(target)} hrefLang={target} lang={target}><bdi>{localeNames[target]}</bdi></a>
            </li>)}
          </ul>
        </nav>
      </main></body>
    </html>
  );
}
