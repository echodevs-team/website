import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { WorkDetailPage } from "@/components/marketing/work-detail-page";
import { getWorkDetail, workSlugs } from "@/content/work-details";
import { workContent } from "@/content/work";
import { isLocale } from "@/i18n/config";
import { PREVIEW_ROBOTS } from "@/lib/seo/policy";
import { localizedAlternates } from "@/lib/seo/site";

type Params = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
  return workSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = isLocale(locale) ? getWorkDetail(locale, slug) : undefined;
  if (!isLocale(locale) || !item) return { robots: PREVIEW_ROBOTS };
  return {
    title: `${item.title} — ${workContent[locale].groups.concept.badge}`,
    description: item.description,
    alternates: localizedAlternates(locale, `/work/${item.slug}`),
  };
}

export default async function Page({ params }: Params) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const item = getWorkDetail(locale, slug);
  if (!item) notFound();
  setRequestLocale(locale);
  return <><Header locale={locale} path={`/work/${item.slug}`} /><WorkDetailPage locale={locale} item={item} /></>;
}
