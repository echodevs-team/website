import { homeContent } from "../../content/home";
import { servicesContent } from "../../content/services";
import { workContent } from "../../content/work";
import { getWorkDetail, workDetailContent } from "../../content/work-details";
import { localePath, type Locale } from "../../i18n/config";
import { Container } from "../layout/container";
import { Link } from "../ui/link";
import { SectionHeading } from "../ui/section-heading";
import { ConceptVisual } from "./concept-visual";
import { MarketingFooter } from "./marketing-footer";

export function WorkDetailPage({ locale, item }: { locale: Locale; item: NonNullable<ReturnType<typeof getWorkDetail>> }) {
  const t = workDetailContent[locale];
  const work = workContent[locale];
  return <>
    <main id="main" tabIndex={-1} className="homepage work-page work-detail-page" data-work-kind={item.kind}>
      <section className="home-section" aria-labelledby="work-detail-title"><Container>
        <Link href={localePath(locale, "/work")} appearance="secondary">{t.back}</Link>
        <div className="home-heading work-intro work-detail-intro">
          <p className="home-badge">{work.groups.concept.badge}</p>
          <SectionHeading id="work-detail-title" level={1} description={item.description}>{item.title}</SectionHeading>
        </div>
        <p className="inquiry-notice">{t.notice}</p>
        <Link href={`${localePath(locale)}#contact`} appearance="primary">{work.cta}</Link>
      </Container></section>
      <section className="home-section home-band" aria-labelledby="proposal-title"><Container>
        <div className="services-detail-grid">
          <div className="home-glass services-detail-card"><h2 id="proposal-title">{t.problem}</h2><p>{item.problem}</p><h2>{t.solution}</h2><p>{item.solution}</p></div>
          <div className="home-glass services-detail-card"><h2>{t.capabilities}</h2><ul>{item.capabilities.map((line) => <li key={line}>{line}</li>)}</ul></div>
        </div>
      </Container></section>
      <section className="home-section" aria-labelledby="workflow-title"><Container>
        <div className="home-heading"><SectionHeading id="workflow-title">{t.workflow}</SectionHeading></div>
        <ol className="home-grid three-columns work-workflow">{item.workflow.map((line) => <li className="home-glass services-detail-card" key={line}>{line}</li>)}</ol>
        <figure className="home-glass services-detail-card work-detail-visual">
          <ConceptVisual item={item} t={homeContent[locale]} />
          <figcaption><strong>{t.visual}</strong><p>{t.visualNote}</p></figcaption>
        </figure>
      </Container></section>
      <section className="home-section home-band" aria-labelledby="scope-title"><Container>
        <div className="services-detail-grid">
          <div className="home-glass services-detail-card"><h2 id="scope-title">{t.limitations}</h2><p>{item.limitations}</p><h2>{t.contribution}</h2><p>{t.contributionNote}</p></div>
          <div className="home-glass services-detail-card"><h2 id="proposed-stack">{work.proposedStack}</h2><p>{work.stackNote}</p>
            <ul className="stack-tags" dir="ltr" aria-labelledby="proposed-stack">{item.stack.map((tag) => <li key={tag}><bdi>{tag}</bdi></li>)}</ul>
          </div>
        </div>
      </Container></section>
      <section className="home-section" aria-labelledby="related-title"><Container>
        <div className="home-heading"><SectionHeading id="related-title">{t.services}</SectionHeading></div>
        <ul className="work-jump-links work-list">{item.services.map((id) => <li key={id}><Link href={`${localePath(locale, "/services")}#${id}`} appearance="secondary">{servicesContent[locale].pillars[id].title}</Link></li>)}</ul>
        <div className="work-jump-links work-preview-link"><Link href={`${localePath(locale)}#contact`} appearance="primary">{work.cta}</Link><Link href={localePath(locale, "/work")} appearance="secondary">{t.back}</Link></div>
      </Container></section>
    </main>
    <MarketingFooter locale={locale} />
  </>;
}
