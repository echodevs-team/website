import { getWorkItems, workContent, workDisplayOrder } from "../../content/work";
import { workDetailContent } from "../../content/work-details";
import { localePath, type Locale } from "../../i18n/config";
import { Container } from "../layout/container";
import { Link } from "../ui/link";
import { SectionHeading } from "../ui/section-heading";
import { MarketingFooter } from "./marketing-footer";

export function WorkPage({ locale }: { locale: Locale }) {
  const t = workContent[locale];
  const items = getWorkItems(locale);
  return <>
    <main id="main" tabIndex={-1} className="homepage work-page">
      <section className="home-section" aria-labelledby="work-title">
        <Container>
          <div className="home-heading work-intro"><SectionHeading id="work-title" level={1} description={t.description}>{t.title}</SectionHeading></div>
          <nav className="work-jump-links" aria-label={t.navigation}>
            {workDisplayOrder.map((kind) => <Link key={kind} href={`#${kind}`} appearance="secondary">{t.groups[kind].title}</Link>)}
          </nav>
        </Container>
      </section>
      {workDisplayOrder.map((kind) => {
        const group = t.groups[kind];
        const records = items.filter((item) => item.kind === kind);
        const populated = records.length > 0;
        return <section key={kind} id={kind} className={`home-section${populated ? (kind === "concept" ? " home-band" : "") : " work-empty"}`} aria-labelledby={`${kind}-title`}>
          <Container>
            <div className={populated ? "home-heading" : "home-heading work-empty-heading"}><SectionHeading id={`${kind}-title`} description={group.description}>{group.title}</SectionHeading></div>
            {populated && <>
              <p className="inquiry-notice">{t.stackNote}</p>
              <ul className="home-grid three-columns work-list">{records.map((item) => <li key={item.id}>
                <article className="home-glass work-card" aria-labelledby={`work-${item.id}`} data-work-kind={item.kind}>
                  <p className="home-badge">{group.badge}</p>
                  <h3 id={`work-${item.id}`}>{item.title}</h3><p>{item.description}</p>
                  <p id={`stack-${item.id}`}>{t.proposedStack}</p>
                  <ul className="stack-tags" dir="ltr" aria-labelledby={`stack-${item.id}`}>{item.stack.map((tag) => <li key={tag}><bdi>{tag}</bdi></li>)}</ul>
                  <div className="concept-action"><Link href={localePath(locale, `/work/${item.id}`)} appearance="secondary" aria-label={`${workDetailContent[locale].details} — ${item.title}`}>{workDetailContent[locale].details}</Link></div>
                  <div className="concept-action"><Link href={`${localePath(locale)}#contact`} appearance="primary" aria-label={`${t.cta} — ${item.title}`}>{t.cta}</Link></div>
                </article>
              </li>)}</ul>
              <div className="work-preview-link"><Link href={`${localePath(locale)}#demos`} appearance="secondary">{t.preview}</Link></div>
            </>}
          </Container>
        </section>;
      })}
    </main>
    <MarketingFooter locale={locale} />
  </>;
}
