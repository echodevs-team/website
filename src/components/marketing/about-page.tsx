import { aboutContent } from "../../content/about";
import { localePath, type Locale } from "../../i18n/config";
import { Container } from "../layout/container";
import { Link } from "../ui/link";
import { SectionHeading } from "../ui/section-heading";
import { TechnicalIcon } from "./homepage";
import { MarketingFooter } from "./marketing-footer";

const teamIcons = ["person", "web", "code", "ai"] as const;
const capabilityIcons = ["web", "code", "cloud", "ai"] as const;
const collaborationIcons = ["code", "trend", "person"] as const;

/** ECHO-404: team identity and working approach using the approved section,
 * card and typography language. No invented members, metrics or claims. */
export function AboutPage({ locale }: { locale: Locale }) {
  const t = aboutContent[locale];
  const home = localePath(locale);
  const servicesPath = localePath(locale, "/services");
  return <>
    <main id="main" tabIndex={-1} className="homepage about-page">
      <section className="home-section about-intro" aria-labelledby="about-title">
        <Container>
          <div className="home-heading about-intro-heading">
            <p className="eyebrow eyebrow-dot">{t.eyebrow}</p>
            <SectionHeading id="about-title" level={1} description={t.description}>{t.title}</SectionHeading>
            <ul className="about-badges">{t.badges.map((badge) => <li className="home-badge" key={badge}>{badge}</li>)}</ul>
            <div className="hero-actions about-intro-actions">
              <Link href={`${home}#contact`} appearance="primary">{t.actions.primary}<span aria-hidden="true">↗</span></Link>
              <Link href={servicesPath} appearance="secondary">{t.actions.secondary}</Link>
            </div>
          </div>
        </Container>
      </section>

      <section id="about-team" className="home-section home-band" aria-labelledby="about-team-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.team.eyebrow}</p>
            <SectionHeading id="about-team-title" description={t.team.description}>{t.team.title}</SectionHeading>
          </div>
          <div className="about-split">
            <div className="home-glass about-panel">
              <h3>{t.team.pointsTitle}</h3>
              <ul className="about-focus-list">
                {t.team.points.map((point, index) => <li key={point.title}>
                  <TechnicalIcon name={teamIcons[index]} />
                  <div><h4>{point.title}</h4><p>{point.description}</p></div>
                </li>)}
              </ul>
            </div>
            <div className="about-notes">
              <article className="home-glass about-note">
                <h3>{t.team.profilesTitle}</h3><p>{t.team.profilesNote}</p>
              </article>
              <article className="home-glass about-note">
                <h3>{t.team.factsTitle}</h3><p>{t.team.factsNote}</p>
              </article>
            </div>
          </div>
        </Container>
      </section>

      <section id="about-capabilities" className="home-section" aria-labelledby="about-capabilities-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.capabilities.eyebrow}</p>
            <SectionHeading id="about-capabilities-title" description={t.capabilities.description}>{t.capabilities.title}</SectionHeading>
          </div>
          <div className="home-grid four-columns">
            {t.capabilities.items.map((item, index) => <article className="home-glass about-card" key={item.title}>
              <TechnicalIcon name={capabilityIcons[index]} />
              <h3>{item.title}</h3><p>{item.description}</p>
              <div className="about-card-action">
                <Link href={`${servicesPath}#${item.service}`} aria-label={`${t.capabilities.cta} — ${item.title}`}>{t.capabilities.cta}<span aria-hidden="true">↗</span></Link>
              </div>
            </article>)}
          </div>
        </Container>
      </section>

      <section id="about-principles" className="home-section home-band" aria-labelledby="about-principles-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.principles.eyebrow}</p>
            <SectionHeading id="about-principles-title" description={t.principles.description}>{t.principles.title}</SectionHeading>
          </div>
          <div className="home-grid four-columns">
            {t.principles.items.map((item) => <article className="home-glass about-card" key={item.title}>
              <div className="card-top"><code dir="ltr">{item.code}</code></div>
              <h3>{item.title}</h3><p>{item.description}</p>
            </article>)}
          </div>
        </Container>
      </section>

      <section id="about-discovery" className="home-section" aria-labelledby="about-discovery-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.discovery.eyebrow}</p>
            <SectionHeading id="about-discovery-title" description={t.discovery.description}>{t.discovery.title}</SectionHeading>
          </div>
          <div className="about-split about-discovery">
            <div className="home-glass about-panel">
              <ol className="about-question-list">
                {t.discovery.items.map((item) => <li key={item.title}><h3>{item.title}</h3><p>{item.description}</p></li>)}
              </ol>
            </div>
            <div className="about-notes">
              <article className="home-glass about-note about-agreement">
                <h3>{t.discovery.agreementTitle}</h3><p>{t.discovery.agreement}</p>
              </article>
              <p className="inquiry-notice">{t.discovery.note}</p>
            </div>
          </div>
        </Container>
      </section>

      <section id="about-delivery" className="home-section home-band" aria-labelledby="about-delivery-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.delivery.eyebrow}</p>
            <SectionHeading id="about-delivery-title" description={t.delivery.description}>{t.delivery.title}</SectionHeading>
          </div>
          <ol className="home-grid four-columns about-path">
            {t.delivery.steps.map((step, index) => <li className="home-glass process-card" key={step.title}>
              <div className="card-top"><span className="step-number">{new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }).format(index + 1)}</span><code dir="ltr">{step.code}</code></div>
              <h3>{step.title}</h3><p>{step.description}</p>
            </li>)}
          </ol>
          <p className="inquiry-notice about-path-note">{t.delivery.note}</p>
        </Container>
      </section>

      <section id="about-collaboration" className="home-section" aria-labelledby="about-collaboration-title">
        <Container>
          <div className="home-heading">
            <p className="eyebrow">{t.collaboration.eyebrow}</p>
            <SectionHeading id="about-collaboration-title" description={t.collaboration.description}>{t.collaboration.title}</SectionHeading>
          </div>
          <div className="home-grid three-columns">
            {t.collaboration.items.map((item, index) => <article className="home-glass about-card" key={item.title}>
              <TechnicalIcon name={collaborationIcons[index]} />
              <h3>{item.title}</h3><p>{item.description}</p>
            </article>)}
          </div>
        </Container>
      </section>

      <section id="about-next" className="home-section" aria-labelledby="about-next-title">
        <Container>
          <div className="home-glass about-cta">
            <div className="home-heading">
              <p className="eyebrow">{t.next.eyebrow}</p>
              <SectionHeading id="about-next-title" description={t.next.description}>{t.next.title}</SectionHeading>
            </div>
            <div className="hero-actions about-cta-actions">
              <Link href={servicesPath} appearance="primary">{t.next.services}</Link>
              <Link href={localePath(locale, "/work")} appearance="secondary">{t.next.work}</Link>
              <Link href={`${home}#contact`} appearance="secondary">{t.next.contact}<span aria-hidden="true">↗</span></Link>
            </div>
            <p className="inquiry-notice">{t.next.note}</p>
          </div>
        </Container>
      </section>
    </main>
    <MarketingFooter locale={locale} />
  </>;
}
