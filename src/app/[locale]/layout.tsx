import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { direction, isLocale, locales } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { PREVIEW_ROBOTS } from "@/lib/seo/policy";
import { SITE_NAME } from "@/lib/seo/site";
import { ThemeInit } from "@/components/layout/theme-init";
import "@/styles/globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  // 404 metadata may be resolved without the original route params. Do not
  // throw from metadata: validate route existence in the layout/page instead.
  if (!isLocale(locale)) return { title: "404 — Echo Devs", robots: PREVIEW_ROBOTS };
  const t = await getTranslations({ locale, namespace: "Foundation" });
  return {
    title: {
      default: `${t("title")} — ${t("preview")}`,
      template: `%s — ${SITE_NAME}`,
    },
    robots: PREVIEW_ROBOTS,
  };
}

export default async function LocaleLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} dir={direction(locale)} suppressHydrationWarning>
      <head><ThemeInit /></head>
      <body>
        <a className="skip-link" href="#main">{getMessages(locale).Foundation.skip}</a>
        {children}
      </body>
    </html>
  );
}
