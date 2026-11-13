import { getMessages } from "../../i18n/messages";
import { localeNames, localePath, locales, type Locale } from "../../i18n/config";
import { Link } from "../ui/link";
import { ThemeControl } from "../ui/theme-control";
import { Container } from "./container";
import { MobileNav } from "./mobile-nav";
import { LanguageLinks } from "./language-links";
import { homeContent } from "../../content/home";
import { chromeContent } from "../../content/chrome";
import { BrandMark } from "./brand-mark";

/** Reference header composition over the existing locale/theme infrastructure.
 * Six destinations resolve to implemented pages or real homepage sections. */
export function Header({ locale, path = "/" }: { locale: Locale; path?: string }) {
  const { Header: t, Theme: theme, Foundation: foundation } = getMessages(locale);
  const home = homeContent[locale];
  const chrome = chromeContent[locale];
  const homePath = localePath(locale);
  const navigation = <>
    <nav aria-label={t.primary} className="primary-navigation">
      <ul className="primary-links">
        <li><Link href={`${homePath}#hero`} aria-current={path === "/" ? "page" : undefined}>{t.home}</Link></li>
        <li><Link href={localePath(locale, "/services")} aria-current={path === "/services" ? "page" : undefined}>{t.services}</Link></li>
        <li><Link href={localePath(locale, "/work")} aria-current={path === "/work" || path.startsWith("/work/") ? "page" : undefined}>{t.work}</Link></li>
        <li><Link href={localePath(locale, "/about")} aria-current={path === "/about" ? "page" : undefined}>{t.about}</Link></li>
        <li><Link href={`${homePath}#process`}>{home.processLabel}</Link></li>
        <li><Link href={localePath(locale, "/contact")} aria-current={path === "/contact" ? "page" : undefined}>{t.contact}</Link></li>
      </ul>
    </nav>
    <div className="header-settings">
      <LanguageLinks locale={locale} path={path} label={foundation.languages} display="codes" />
      <ThemeControl labels={theme} />
      <Link href={localePath(locale, "/contact")} appearance="primary" className="header-cta">{home.start}</Link>
    </div>
  </>;
  return <header className="site-header">
    <Container className="header-row">
      <Link href={`${homePath}#hero`} className="header-brand" aria-label={`${foundation.title} — ${t.home}`}>
        <BrandMark />
        <span className="header-brand-text">
          <span className="header-wordmark"><bdi lang="en">Echo Devs</bdi><span className="brand-chip" lang="fa" dir="rtl">اکو دوز</span></span>
          <span className="header-subtitle">{chrome.tagline}</span>
        </span>
      </Link>
      <div className="desktop-navigation">{navigation}</div>
      <MobileNav labels={{ open: t.open, close: t.close, title: t.primary }}>{navigation}</MobileNav>
    </Container>
    <noscript><Container className="no-script-navigation">
      <nav aria-label={t.primary}><ul className="primary-links">
        {([[`${homePath}#hero`, t.home], [localePath(locale, "/services"), t.services], [localePath(locale, "/work"), t.work], [localePath(locale, "/about"), t.about], [`${homePath}#process`, home.processLabel], [localePath(locale, "/contact"), t.contact]] as const).map(([href, label]) =>
          <li key={href}><Link href={href}>{label}</Link></li>)}
      </ul></nav>
      <nav aria-label={foundation.languages}><ul className="language-links">
        {locales.map((target) => <li key={target}><Link href={localePath(target, path)}
          hrefLang={target} lang={target}><bdi>{localeNames[target]}</bdi></Link></li>)}
      </ul></nav>
    </Container></noscript>
  </header>;
}
