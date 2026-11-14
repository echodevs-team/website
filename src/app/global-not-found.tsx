import type { Metadata } from "next";
import { getDocumentLocale } from "@/i18n/server";
import { getMessages } from "@/i18n/messages";
import { direction } from "@/i18n/config";
import { NotFoundPage } from "@/components/layout/not-found-page";
import { ThemeInit } from "@/components/layout/theme-init";
import "@/styles/globals.css";

// Next emits the built-in 404 `noindex` directive; adding a second static
// robots object here produced duplicate <meta name="robots"> tags. Keep only
// the localized document title from this file.
export const metadata: Metadata = { title: "404 — Echo Devs" };

// Routing-level fallback avoids throwing notFound during document rendering.
export default async function GlobalNotFound() {
  const locale = await getDocumentLocale();
  const t = getMessages(locale).Foundation;
  return (
    <html lang={locale} dir={direction(locale)} suppressHydrationWarning>
      <head><ThemeInit /></head>
      <body>
        <a className="skip-link" href="#main">{t.skip}</a>
        <NotFoundPage locale={locale} />
      </body>
    </html>
  );
}
