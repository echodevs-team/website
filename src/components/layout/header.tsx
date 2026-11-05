import { getMessages } from "../../i18n/messages";
import { localeNames, localePath, locales, type Locale } from "../../i18n/config";
import { Link } from "../ui/link";
import { ThemeSelect } from "../ui/theme-select";
import { Container } from "./container";
import { MobileNav } from "./mobile-nav";

/** Unbuilt pages are text, never links to 404s or pretend lead intake. */
export function Header({ locale, path = "/" }: { locale: Locale; path?: string }) {
  const { Header: t, Theme: theme, Foundation: foundation } = getMessages(locale);
  const navigation = <>
    <nav aria-label={t.primary}>
      <ul className="primary-links">
        <li><Link href={localePath(locale)} aria-current={path === "/" ? "page" : undefined}>{t.home}</Link></li>
        {(["services", "work", "about", "contact", "privacy"] as const).map((key) =>
          <li key={key}><span className="planned-nav">{t[key]} <small>({t.planned})</small></span></li>)}
      </ul>
    </nav>
    <div className="header-settings">
      <nav aria-label={foundation.languages}>
        <ul className="language-links">
          {locales.map((target) => <li key={target}>
            <Link href={localePath(target, path)} hrefLang={target} lang={target}
              aria-current={target === locale ? "page" : undefined}><bdi>{localeNames[target]}</bdi></Link>
          </li>)}
        </ul>
      </nav>
      <ThemeSelect labels={theme} />
    </div>
  </>;
  return <header className="site-header">
    <Container className="header-row">
      <Link href={localePath(locale)} className="header-brand" aria-label={`${foundation.title} — ${t.home}`}>
        <span className="brand-accent" aria-hidden="true" /><bdi lang="en">Echo Devs</bdi>
      </Link>
      <div className="desktop-navigation">{navigation}</div>
      <MobileNav labels={{ open: t.open, close: t.close, title: t.primary }}>{navigation}</MobileNav>
    </Container>
    <noscript><Container className="no-script-navigation">
      <nav aria-label={foundation.languages}><ul className="language-links">
        {locales.map((target) => <li key={target}><Link href={localePath(target, path)}
          hrefLang={target} lang={target}><bdi>{localeNames[target]}</bdi></Link></li>)}
      </ul></nav>
    </Container></noscript>
  </header>;
}
