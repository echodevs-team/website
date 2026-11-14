import { localeNames, localePath, locales, type Locale } from "../../i18n/config";
import { getMessages } from "../../i18n/messages";
import { Header } from "./header";
import { Container } from "./container";
import { MarketingFooter } from "../marketing/marketing-footer";
import { Link } from "../ui/link";

/**
 * ECHO-506 localized 404 body. It reuses the established header/footer shell,
 * keeps the real HTTP 404 status, and offers only existing destinations — no
 * retry control, fake search or masked redirect.
 */
export function NotFoundPage({ locale }: { locale: Locale }) {
  const { Foundation: t, Header: nav } = getMessages(locale);
  const destinations = [
    [localePath(locale, "/services"), nav.services],
    [localePath(locale, "/work"), nav.work],
    [localePath(locale, "/contact"), nav.contact],
  ] as const;
  return <>
    <Header locale={locale} />
    <main id="main" tabIndex={-1} className="homepage not-found-page">
      <section className="home-section not-found-section" aria-labelledby="not-found-title">
        <Container>
          <div className="home-glass not-found-panel">
            <p className="eyebrow eyebrow-dot"><bdi dir="ltr">404</bdi></p>
            <h1 id="not-found-title">{t.notFound}</h1>
            <p className="not-found-description">{t.notFoundDescription}</p>
            <div className="hero-actions">
              <Link href={localePath(locale)} appearance="primary">{t.notFoundHome}</Link>
            </div>
            <nav className="not-found-recovery" aria-labelledby="not-found-recovery-title">
              <h2 id="not-found-recovery-title">{t.recovery}</h2>
              <ul className="not-found-links">
                {destinations.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}
              </ul>
            </nav>
            <nav className="not-found-languages" aria-label={t.languages}>
              <ul className="language-links">
                {locales.map((target) => <li key={target}>
                  <Link href={localePath(target)} hrefLang={target} lang={target}
                    aria-current={target === locale ? "page" : undefined}><bdi>{localeNames[target]}</bdi></Link>
                </li>)}
              </ul>
            </nav>
          </div>
        </Container>
      </section>
    </main>
    <MarketingFooter locale={locale} />
  </>;
}
