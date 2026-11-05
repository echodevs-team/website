import { getTranslations } from "next-intl/server";
import { localeNames, localePath, locales, type Locale } from "@/i18n/config";
import { Link } from "@/components/ui/link";

// Native links keep locale document attributes fresh without client state.
export async function LanguageLinks({ locale, path = "/" }: { locale: Locale; path?: string }) {
  const t = await getTranslations({ locale, namespace: "Foundation" });
  return (
    <nav aria-label={t("languages")}>
      <ul className="language-links">
        {locales.map((target) => (
          <li key={target}>
            <Link href={localePath(target, path)} hrefLang={target} lang={target}
              aria-current={target === locale ? "page" : undefined}>
              <bdi>{localeNames[target]}</bdi>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
