import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { ServicesPage } from "@/components/marketing/services-page";
import { servicesContent } from "@/content/services";
import { isLocale } from "@/i18n/config";
import { PREVIEW_ROBOTS } from "@/lib/seo/policy";
import { localizedAlternates } from "@/lib/seo/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return { robots: PREVIEW_ROBOTS };
  const t = servicesContent[locale];
  return { title: t.title, description: t.description, alternates: localizedAlternates(locale, "/services") };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <><Header locale={locale} path="/services" /><ServicesPage locale={locale} /></>;
}
