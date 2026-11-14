import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { PrivacyPage } from "@/components/marketing/privacy-page";
import { privacyContent } from "@/content/privacy";
import { isLocale } from "@/i18n/config";
import { PREVIEW_ROBOTS } from "@/lib/seo/policy";
import { localizedAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { robots: PREVIEW_ROBOTS };
  const t = privacyContent[locale];
  return { title: t.title, description: t.description, alternates: localizedAlternates(locale, "/privacy") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <><Header locale={locale} path="/privacy" /><PrivacyPage locale={locale} /></>;
}
