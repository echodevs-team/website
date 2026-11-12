import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { Homepage } from "@/components/marketing/homepage";
import { isLocale } from "@/i18n/config";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  return <><Header locale={locale} /><Homepage locale={locale} /></>;
}
