import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { direction, isLocale, locales } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import "@/styles/globals.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  // 404 metadata may be resolved without the original route params. Do not
  // throw from metadata: validate route existence in the layout/page instead.
  if (!isLocale(locale)) return { title: "404 — Echo Devs", robots: { index: false, follow: false } };
  const t = await getTranslations({ locale, namespace: "Foundation" });
  return { title: `${t("title")} — ${t("preview")}`, robots: { index: false, follow: false } };
}

export default async function LocaleLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} dir={direction(locale)}>
      <body>
        <a className="skip-link" href="#main">{getMessages(locale).Foundation.skip}</a>
        {children}
      </body>
    </html>
  );
}
