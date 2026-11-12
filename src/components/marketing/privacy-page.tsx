import { privacyContent, type PrivacyCard, type PrivacySection } from "../../content/privacy";
import { localePath, type Locale } from "../../i18n/config";
import { Container } from "../layout/container";
import { Link } from "../ui/link";
import { SectionHeading } from "../ui/section-heading";
import { MarketingFooter } from "./marketing-footer";
import { TechnicalIcon } from "./homepage";

function Cards({ cards }: { cards: readonly PrivacyCard[] }) {
  return <div className={`home-grid privacy-grid ${cards.length === 4 ? "four-columns" : "three-columns"}`}>
    {cards.map((card) => <article className="home-glass privacy-card" key={card.title}>
      <TechnicalIcon name={card.icon} />
      <h3>{card.title}</h3><p>{card.body}</p>
    </article>)}
  </div>;
}

function Section({ id, band = false, content }: { id: string; band?: boolean; content: PrivacySection }) {
  return <section id={id} className={`home-section${band ? " home-band" : ""}`} aria-labelledby={`${id}-title`}>
    <Container>
      <div className="home-heading">
        <p className="eyebrow">{content.eyebrow}</p>
        <SectionHeading id={`${id}-title`} description={content.description}>{content.title}</SectionHeading>
      </div>
      <Cards cards={content.cards} />
    </Container>
  </section>;
}

/** ECHO-406: a technical disclosure grounded in the implemented inquiry flow.
 * It deliberately records unapproved policy decisions instead of inventing a
 * legal entity, contact, retention period or compliance claim. */
export function PrivacyPage({ locale }: { locale: Locale }) {
  const t = privacyContent[locale];
  return <>
    <main id="main" tabIndex={-1} className="homepage privacy-page">
      <section id="privacy-intro" className="home-section privacy-intro" aria-labelledby="privacy-title">
        <Container>
          <div className="home-heading privacy-intro-heading">
            <p className="eyebrow eyebrow-dot">{t.eyebrow}</p>
            <SectionHeading id="privacy-title" level={1} description={t.description}>{t.title}</SectionHeading>
            <ul className="privacy-badges">{t.badges.map((badge) => <li className="home-badge" key={badge}>{badge}</li>)}</ul>
          </div>
          <div className="home-glass privacy-notice">
            <h2>{t.notice.title}</h2>
            <p>{t.notice.body}</p>
          </div>
        </Container>
      </section>

      <Section id="privacy-data" content={t.data} band />
      <Section id="privacy-storage" content={t.storage} />
      <Section id="privacy-temporary" content={t.temporary} band />
      <Section id="privacy-retention" content={t.retention} />
      <Section id="privacy-third-parties" content={t.thirdParties} band />

      <section id="privacy-updates" className="home-section" aria-labelledby="privacy-updates-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.updates.eyebrow}</p>
            <SectionHeading id="privacy-updates-title" description={t.updates.description}>{t.updates.title}</SectionHeading>
          </div>
          <div className="home-glass privacy-updates">
            <p>{t.updates.body}</p>
            <div className="privacy-links">
              {t.updates.links.map((link, index) => <Link key={link.key}
                href={localePath(locale, `/${link.key}`)}
                appearance={index === 0 ? "primary" : "secondary"}>{link.label}<span aria-hidden="true">↗</span></Link>)}
            </div>
          </div>
        </Container>
      </section>
    </main>
    <MarketingFooter locale={locale} />
  </>;
}
