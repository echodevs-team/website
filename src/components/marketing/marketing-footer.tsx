import { homeContent, serviceIds } from "../../content/home";
import { servicesContent } from "../../content/services";
import { chromeContent } from "../../content/chrome";
import { localePath, type Locale } from "../../i18n/config";
import { getMessages } from "../../i18n/messages";
import { BrandMark } from "../layout/brand-mark";
import { Footer } from "../layout/footer";
import { Link } from "../ui/link";

/** Reference three-column footer. Composition is preserved; unverified availability,
 * contact channels, cloud guarantees and legal ownership are replaced with neutral facts. */
export function MarketingFooter({ locale, onHome = false }: { locale: Locale; onHome?: boolean }) {
  const t = homeContent[locale];
  const chrome = chromeContent[locale];
  const services = servicesContent[locale];
  const { Foundation: foundation, Header: nav } = getMessages(locale);
  const home = onHome ? "" : localePath(locale);
  const servicesPath = localePath(locale, "/services");
  return <Footer className="home-footer"><div className="footer-columns">
    <div className="footer-intro">
      <p className="footer-brand"><BrandMark /><bdi lang="en">Echo Devs</bdi><span className="brand-chip" lang="fa" dir="rtl">اکو دوز</span></p>
      <p className="footer-description">{t.footer}</p>
      <div className="footer-badges">
        <span className="footer-badge"><span className="footer-dot" aria-hidden="true" />{chrome.footer.intake}</span>
        <span className="footer-badge footer-badge-neutral">{chrome.footer.architecture}</span>
      </div>
    </div>
    <nav className="footer-links" aria-labelledby="footer-services-title">
      <h2 id="footer-services-title">{chrome.footer.servicesHeading}</h2>
      <ul>
        {serviceIds.map((id) => <li key={id}><Link href={`${servicesPath}#${id}`}>{services.pillars[id].title}</Link></li>)}
        <li><Link href={localePath(locale, "/work")}>{chrome.footer.demos}</Link></li>
      </ul>
    </nav>
    <div className="footer-contact">
      <h2>{chrome.footer.contactHeading}</h2>
      <p>{t.contactsPending}</p>
      <Link href={localePath(locale, "/contact")} className="footer-contact-link">{t.start}<span aria-hidden="true">↗</span></Link>
    </div>
  </div><div className="footer-bottom">
    <p><bdi lang="en">Echo Devs</bdi> · {foundation.preview}</p>
    <div className="footer-bottom-links">
      <Link href={localePath(locale, "/about")}>{nav.about}</Link>
      <Link href={`${home}#hero`}>{t.backTop} ↑</Link>
    </div>
  </div></Footer>;
}
