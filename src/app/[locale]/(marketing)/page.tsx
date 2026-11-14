import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Homepage } from "@/components/marketing/homepage";
import { homeContent } from "@/content/home";
import { isLocale } from "@/i18n/config";
import { PREVIEW_ROBOTS } from "@/lib/seo/policy";
import { localizedAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { robots: PREVIEW_ROBOTS };
  // The layout supplies the localized title; the homepage previously had no
  // description at all. Use the localized lead so the route is not the only
  // marketing page without a metadata description.
  return { description: homeContent[locale].lead, alternates: localizedAlternates(locale, "/") };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <><Header locale={locale} /><Homepage locale={locale} /></>;
}
