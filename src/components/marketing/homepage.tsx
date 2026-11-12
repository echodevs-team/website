import type { ReactNode } from "react";
import { homeContent, processCodes, serviceIds, type HomeContent } from "../../content/home";
import type { Locale } from "../../i18n/config";
import { getMessages } from "../../i18n/messages";
import { Container } from "../layout/container";
import { Link } from "../ui/link";
import { SectionHeading } from "../ui/section-heading";
import { InquiryForm } from "./inquiry-form";
import { TechnicalBackdrop } from "./technical-backdrop";
import { MarketingFooter } from "./marketing-footer";
import { inquiryCopy } from "../../content/inquiry";
import { ConceptVisual } from "./concept-visual";

const iconPaths = {
  code: "M10 20l4-16m4 4 4 4-4 4M6 16l-4-4 4-4",
  web: "M3 12h18M12 3c6 6 6 12 0 18-6-6-6-12 0-18M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
  chip: "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4",
  ai: "M12 3v18M12 5C6 0 2 8 6 10c-6 3-1 12 6 8M12 5c6-5 10 3 6 5 6 3 1 12-6 8M6 10l6 2 6-2",
  person: "M9 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0M5 21v-3c0-5 14-5 14 0v3M3 3h18",
  trend: "m3 17 6-6 4 4 8-10m-6 0h6v6",
  clock: "M12 7v5l4 2M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18",
  cloud: "M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11H6m3-6 3 3 4-5",
} as const;
export function TechnicalIcon({ name = "code" }: { name?: keyof typeof iconPaths }) {
  return <span className="technical-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={iconPaths[name]} /></svg></span>;
}

function Heading({ id, eyebrow, content, dot = false }: { id: string; eyebrow: string; content: { title: string; description: string }; dot?: boolean }) {
  return <div className="home-heading"><p className={`eyebrow${dot ? " eyebrow-dot" : ""}`}>{eyebrow}</p><SectionHeading id={id} description={content.description}>{content.title}</SectionHeading></div>;
}
function HomeSection({ id, children, band = false }: { id: string; children: ReactNode; band?: boolean }) {
  return <section id={id} aria-labelledby={`${id}-title`} className={`home-section${band ? " home-band" : ""}`}><Container>{children}</Container></section>;
}

function Hero({ t }: { t: HomeContent }) {
  return <section id="hero" aria-labelledby="hero-title" className="home-hero home-section">
    <div className="hero-orbits" aria-hidden="true"><i /><i /><i /></div>
    <Container>
      <div className="hero-composition">
        <div className="hero-copy">
          <p className="home-badge">{t.badge}</p>
          <h1 id="hero-title">{t.title}</h1><p className="hero-lead">{t.lead}</p>
          <div className="hero-actions"><Link href="#contact" appearance="primary">{t.start}<span aria-hidden="true">↗</span></Link><Link href="#demos" appearance="secondary">{t.examples}</Link></div>
        </div>
        <div className="runtime-frame">
          <div className="runtime-top" dir="ltr"><b>ED</b><span>CORE_RUNTIME</span></div>
          <div className="runtime-core"><TechnicalIcon /><h2>{t.engineering.title}</h2><p>{t.engineering.description}</p></div>
          <div className="runtime-bottom" dir="ltr"><span>NEXT.JS // PYTHON // AI</span><span>CONCEPT</span></div>
          <div className="runtime-scan" aria-hidden="true" />
        </div>
      </div>
      <div className="capability-grid">{t.capabilities.map((item, i) => <article className="home-glass capability" key={item.label}>
        <div className="card-top"><span>{item.label}</span><TechnicalIcon name={(["code", "chip", "ai", "cloud"] as const)[i]} /></div>
        <h2><bdi>{item.title}</bdi></h2><p>{item.description}</p>
      </article>)}</div>
    </Container>
  </section>;
}

function Services({ t, locale }: { t: HomeContent; locale: Locale }) {
  return <HomeSection id="services" band><Heading id="services-title" eyebrow={t.servicesEyebrow} content={t.servicesHeading} dot />
    <div className="home-grid three-columns">{t.services.map((item, i) => <article className="home-glass service-card" key={item.title}>
      <div className="card-top"><span className="home-badge">{item.pillar}</span><TechnicalIcon name={(["web", "chip", "ai"] as const)[i]} /></div>
      <h3>{item.title}</h3><p>{item.description}</p>
      <div className="service-areas"><h4>{t.areas}</h4><ul>{item.areas.map((area) => <li key={area}>{area}</li>)}</ul></div>
      <div className="service-actions"><Link href="#contact" appearance="primary">{t.request}</Link>
        <details id={`service-${serviceIds[i]}`}><summary>{t.details}</summary><p>{item.detail}</p><Link href={`/${locale}/services#${serviceIds[i]}`}>{t.details} — {item.title}</Link></details></div>
    </article>)}</div>
  </HomeSection>;
}

function Concepts({ t }: { t: HomeContent }) {
  return <HomeSection id="demos"><Heading id="demos-title" eyebrow={t.conceptsEyebrow} content={t.conceptsHeading} dot />
    <div className="home-grid three-columns">{t.concepts.map((item) => <article className="home-glass concept-card" key={item.visual} data-work-kind={item.kind}>
      <div className="concept-card-body"><ConceptVisual item={item} t={t} /><h3>{item.title}</h3><p>{item.description}</p>
        <ul className="stack-tags" dir="ltr">{item.stack.map((tag) => <li key={tag}>{tag}</li>)}</ul></div>
      <div className="concept-action"><Link href="#contact" appearance="primary">{t.similar}</Link></div>
    </article>)}</div>
  </HomeSection>;
}

function BenefitsAndProcess({ t, locale }: { t: HomeContent; locale: Locale }) {
  return <>
    <HomeSection id="why-us" band><Heading id="why-us-title" eyebrow={t.benefitsEyebrow} content={t.benefitsHeading} />
      <div className="home-grid four-columns">{t.benefits.map((item, i) => <article className="home-glass benefit-card" key={item.title}>
        <TechnicalIcon name={(["person", "trend", "code", "clock"] as const)[i]} /><h3>{item.title}</h3><p>{item.description}</p>
        <span className="technical-caption" dir="ltr">{["Clear Decisions", "Product Thinking", "Maintainable Code", "Visible Milestones"][i]}</span>
      </article>)}</div>
    </HomeSection>
    <HomeSection id="process"><Heading id="process-title" eyebrow={t.processEyebrow} content={t.processHeading} />
      <ol className="home-grid process-grid">{t.steps.map((item, i) => <li className="home-glass process-card" key={item.title}>
        <div className="card-top"><span className="step-number">{new Intl.NumberFormat(locale, { minimumIntegerDigits: 2 }).format(i + 1)}</span><code dir="ltr">{processCodes[i]}</code></div>
        <h3>{item.title}</h3><p>{item.description}</p>
      </li>)}</ol>
    </HomeSection>
  </>;
}

export function Homepage({ locale }: { locale: Locale }) {
  const t = homeContent[locale];
  const nav = getMessages(locale).Header;
  const links = [["hero", nav.home], ["services", nav.services], ["demos", nav.work], ["why-us", t.benefitsLabel], ["process", t.processLabel], ["contact", nav.contact]];
  return <>
    <main id="main" tabIndex={-1} className="homepage">
      <TechnicalBackdrop />
      <Hero t={t} /><Services t={t} locale={locale} /><Concepts t={t} /><BenefitsAndProcess t={t} locale={locale} />
      <HomeSection id="contact"><div className="home-glass inquiry-composition">
        <div className="inquiry-copy"><p className="home-badge">{nav.contact}</p><Heading id="contact-title" eyebrow={inquiryCopy[locale].formLabel} content={{ title: t.inquiry.title, description: t.inquiry.description }} />
          <p className="inquiry-notice">{inquiryCopy[locale].note}</p><p className="contacts-pending">{t.contactsPending}</p></div>
        <InquiryForm content={{ fields: t.fields }} locale={locale} copy={inquiryCopy[locale]} />
      </div></HomeSection>
    </main>
    <nav className="section-rail" aria-label={t.navigation}>{links.map(([id, label]) => <a key={id} href={`#${id}`} aria-label={label}><span aria-hidden="true" /><span className="rail-label">{label}</span></a>)}</nav>
    <MarketingFooter locale={locale} onHome />
  </>;
}
