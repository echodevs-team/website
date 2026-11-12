import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { PrivacyPage } from "@/components/marketing/privacy-page";
import { privacyContent } from "@/content/privacy";
import { isLocale } from "@/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { robots: { index: false, follow: false } };
  const t = privacyContent[locale];
  return { title: `${t.title} — Echo Devs`, description: t.description };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <><Header locale={locale} path="/privacy" /><PrivacyPage locale={locale} /></>;
}
