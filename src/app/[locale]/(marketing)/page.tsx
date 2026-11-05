import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Header } from "@/components/layout/header";
import { SectionHeading } from "@/components/ui/section-heading";
import { isLocale } from "@/i18n/config";

export default async function FoundationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Foundation" });
  return (
    <><Header locale={locale} /><main id="main" tabIndex={-1}>
      <p>{t("preview")}</p>
      <SectionHeading id="foundation-title" level={1} description={t("description")}>
        {t("title")}
      </SectionHeading>
    </main></>
  );
}
