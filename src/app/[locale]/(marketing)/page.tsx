import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageLinks } from "@/components/layout/language-links";
import { isLocale } from "@/i18n/config";

export default async function FoundationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Foundation" });
  return (
    <main id="main" tabIndex={-1}>
      <p>{t("preview")}</p>
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p>{t("description")}</p>
      <LanguageLinks locale={locale} />
    </main>
  );
}
