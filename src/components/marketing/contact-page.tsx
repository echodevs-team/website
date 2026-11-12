import { contactContent } from "../../content/contact";
import { homeContent } from "../../content/home";
import { inquiryCopy } from "../../content/inquiry";
import { localePath, type Locale } from "../../i18n/config";
import { Container } from "../layout/container";
import { Link } from "../ui/link";
import { SectionHeading } from "../ui/section-heading";
import { InquiryForm } from "./inquiry-form";
import { MarketingFooter } from "./marketing-footer";
import { TechnicalIcon } from "./homepage";

const guidanceIcons = ["person", "web", "code", "cloud", "clock"] as const;

/** ECHO-405: Contact reuses the approved composition and the single inquiry
 * form. No direct channel is published until the owner verifies one. */
export function ContactPage({ locale }: { locale: Locale }) {
  const t = contactContent[locale];
  const home = homeContent[locale];
  const servicesPath = localePath(locale, "/services");
  return <>
    <main id="main" tabIndex={-1} className="homepage contact-page">
      <section id="contact-intro" className="home-section contact-intro" aria-labelledby="contact-title">
        <Container>
          <div className="home-heading contact-intro-heading">
            <p className="eyebrow eyebrow-dot">{t.eyebrow}</p>
            <SectionHeading id="contact-title" level={1} description={t.description}>{t.title}</SectionHeading>
            <ul className="contact-badges">{t.badges.map((badge) => <li className="home-badge" key={badge}>{badge}</li>)}</ul>
            <div className="hero-actions contact-intro-actions">
              <Link href="#contact-inquiry" appearance="primary">{t.form.title}<span aria-hidden="true">↓</span></Link>
              <Link href={servicesPath} appearance="secondary">{t.explore.links[0].title}</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="contact-inquiry" className="home-section home-band" aria-labelledby="contact-inquiry-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.form.eyebrow}</p>
            <SectionHeading id="contact-inquiry-title" description={t.form.description}>{t.form.title}</SectionHeading>
          </div>
          <div className="contact-split">
            <div className="home-glass contact-guidance">
              <p className="eyebrow">{t.guidance.eyebrow}</p>
              <h3>{t.guidance.title}</h3>
              <p>{t.guidance.description}</p>
              <ul className="contact-guidance-list">
                {t.guidance.items.map((item, index) => <li key={item.title}>
                  <TechnicalIcon name={guidanceIcons[index]} />
                  <div><h4>{item.title}</h4><p>{item.description}</p></div>
                </li>)}
              </ul>
              <div className="contact-channels">
                <h4>{t.guidance.channelsTitle}</h4>
                <p>{t.guidance.channelsNote}</p>
              </div>
            </div>
            <div className="home-glass contact-form-panel">
              <InquiryForm
                content={{ fields: home.fields }}
                locale={locale}
                copy={inquiryCopy[locale]}
                label={t.form.ariaLabel}
                sourcePage={`/${locale}/contact`}
              />
              <p className="contact-form-note">{t.form.note}</p>
            </div>
          </div>
        </Container>
      </section>

      <section id="contact-next" className="home-section" aria-labelledby="contact-next-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.next.eyebrow}</p>
            <SectionHeading id="contact-next-title" description={t.next.description}>{t.next.title}</SectionHeading>
          </div>
          <ol className="home-grid three-columns contact-steps">
            {t.next.steps.map((step, index) => <li className="home-glass contact-step" key={step.title}>
              <div className="card-top"><span className="step-number">{new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }).format(index + 1)}</span></div>
              <h3>{step.title}</h3><p>{step.description}</p>
            </li>)}
          </ol>
          <p className="inquiry-notice contact-next-note">{t.next.note}</p>

          <div className="home-glass contact-explore" aria-labelledby="contact-explore-title">
            <h2 id="contact-explore-title">{t.explore.title}</h2>
            <p>{t.explore.description}</p>
            <div className="home-grid three-columns contact-explore-links">
              {t.explore.links.map((link) => <article className="contact-explore-card" key={link.key}>
                <h3>{link.title}</h3><p>{link.description}</p>
                <Link href={localePath(locale, `/${link.key}`)} aria-label={`${t.explore.cta} — ${link.title}`}>{t.explore.cta}<span aria-hidden="true">↗</span></Link>
              </article>)}
            </div>
          </div>
        </Container>
      </section>
    </main>
    <MarketingFooter locale={locale} />
  </>;
}
