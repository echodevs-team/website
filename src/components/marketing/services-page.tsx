import { homeContent, serviceIds } from "../../content/home";
import { servicesContent } from "../../content/services";
import { localePath, type Locale } from "../../i18n/config";
import { Container } from "../layout/container";
import { Link } from "../ui/link";
import { SectionHeading } from "../ui/section-heading";
import { TechnicalIcon } from "./homepage";
import { MarketingFooter } from "./marketing-footer";

export function ServicesPage({ locale }: { locale: Locale }) {
  const t = servicesContent[locale];
  const home = homeContent[locale];
  const contact = `${localePath(locale)}#contact`;
  return <>
    <main id="main" tabIndex={-1} className="homepage services-page">
      <section className="home-section" aria-labelledby="services-title">
        <Container>
          <div className="home-heading services-intro">
            <p className="eyebrow">{home.servicesEyebrow}</p>
            <SectionHeading id="services-title" level={1} description={t.description}>{t.title}</SectionHeading>
          </div>
          <nav aria-label={t.navigation} className="services-jump-links">
            {serviceIds.map((id) => <Link key={id} href={`#${id}`} appearance="secondary">{t.pillars[id].title}</Link>)}
          </nav>
          <p className="inquiry-notice">{t.agreement}</p>
        </Container>
      </section>
      {serviceIds.map((id, i) => {
        const pillar = t.pillars[id];
        return <section id={id} key={id} aria-labelledby={`${id}-title`} className={`home-section${i % 2 === 0 ? " home-band" : ""}`}>
          <Container>
            <div className="home-heading">
              <div className="card-top"><p className="home-badge">{home.services[i].pillar}</p><TechnicalIcon name={(["web", "chip", "ai"] as const)[i]} /></div>
              <SectionHeading id={`${id}-title`} description={pillar.outcome}>{pillar.title}</SectionHeading>
            </div>
            <div className="services-detail-grid">
              <div className="home-glass services-detail-card">
                <h3>{t.scope}</h3>
                <ul className="services-subservices">{pillar.services.map((service) => <li key={service.title}><h4>{service.title}</h4><p>{service.scope}</p></li>)}</ul>
              </div>
              <div className="home-glass services-detail-card">
                <h3>{t.deliverables}</h3><ul>{pillar.deliverables.map((item) => <li key={item}>{item}</li>)}</ul>
                <h3>{t.example}</h3><p>{pillar.example}</p>
                <h3>{t.boundaries}</h3><p>{pillar.boundaries}</p>
                <div className="service-actions"><Link href={contact} appearance="primary" aria-label={`${t.cta} — ${pillar.title}`}>{t.cta}</Link></div>
              </div>
            </div>
          </Container>
        </section>;
      })}
    </main>
    <MarketingFooter locale={locale} />
  </>;
}
