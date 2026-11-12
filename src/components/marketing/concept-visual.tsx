import type { Concept, HomeContent } from "../../content/home";

const previewCode = { analytics: "SaaS_PREVIEW", chat: "RAG_BOT_PREVIEW", booking: "HEALTH_BOOKING_PREVIEW" } as const;
const telemetry = {
  analytics: ["SERIES: —", "RATE: —"],
  chat: ["CONTEXT: —", "INDEX: —"],
  booking: ["SCHEDULING: —", "MESSAGING: —"],
} as const;
const barHeights = [50, 75, 66, 83, 100, 60] as const;
const barAlphas = [.4, .6, .8, 1, .9, .5] as const;

/** Static illustration shared by the homepage and concept details. */
export function ConceptVisual({ item, t }: { item: Concept; t: HomeContent }) {
  return <div className={`concept-visual ${item.visual}`}>
    <div className="card-top"><span className="concept-badge">{item.badge}</span><code dir="ltr">{previewCode[item.visual]}</code></div>
    {item.visual === "analytics" ? <div className="sample-bars" aria-hidden="true">{barHeights.map((height, i) => <span key={i} style={{ height: `${height}%`, opacity: barAlphas[i] }} />)}</div>
      : item.visual === "chat" ? <div className="sample-chat"><p>{t.chat[0]}</p><p>{t.chat[1]}</p></div>
        : <div className="sample-booking">{t.booking.map((line) => <p key={line}><span>{line}</span><span className="booking-status" aria-hidden="true">PREVIEW</span></p>)}</div>}
    <div className="concept-telemetry" dir="ltr" aria-hidden="true">
      {telemetry[item.visual].map((label) => <span key={label}>{label}</span>)}<span>PREVIEW</span>
    </div>
    <p className="sample-caption">{t.illustration}</p>
  </div>;
}
