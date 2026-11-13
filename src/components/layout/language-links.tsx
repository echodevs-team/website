"use client";

import { localeNames, locales, type Locale } from "../../i18n/config";
import { localeSwitchHref, rememberLocale } from "../../i18n/preference";
import { Link } from "../ui/link";

const localeCodes: Record<Locale, string> = { fa: "FA", en: "EN", ar: "AR" };

/** Shared language switch. Links remain ordinary navigations; the click handler
 * only remembers the choice and carries a safe in-page fragment across. Without
 * JavaScript the server-rendered hrefs still switch to the equivalent route. */
export function LanguageLinks({ locale, path = "/", label, display = "names" }: {
  locale: Locale;
  path?: string;
  label: string;
  display?: "names" | "codes";
}) {
  return (
    <nav aria-label={label} className="language-switch">
      <ul className="language-links">
        {locales.map((target) => (
          <li key={target}>
            <Link href={localeSwitchHref(target, path)} hrefLang={target} lang={target}
              aria-current={target === locale ? "page" : undefined}
              aria-label={display === "codes" ? localeNames[target] : undefined}
              title={display === "codes" ? localeNames[target] : undefined}
              onClick={(event) => {
                rememberLocale(target);
                const href = localeSwitchHref(target, path, window.location.hash);
                if (href !== localeSwitchHref(target, path)) event.currentTarget.setAttribute("href", href);
              }}
              onAuxClick={() => rememberLocale(target)}>
              <bdi>{display === "codes" ? localeCodes[target] : localeNames[target]}</bdi>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
