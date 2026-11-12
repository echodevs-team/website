// @vitest-environment jsdom
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Homepage } from "../../src/components/marketing/homepage";
import { Header } from "../../src/components/layout/header";
import { homeContent, serviceIds } from "../../src/content/home";
import { locales } from "../../src/i18n/config";

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof value;
}

describe("faithful homepage structure and safety", () => {
  it.each(locales)("renders the complete localized homepage in %s", (locale) => {
    const t = homeContent[locale];
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<><Header locale={locale} /><Homepage locale={locale} /></>);
    expect([...host.querySelectorAll("main > section")].map((s) => s.id)).toEqual(["hero", "services", "demos", "why-us", "process", "contact"]);
    expect(host.querySelectorAll("h1")).toHaveLength(1);
    expect(host.querySelector("h1")?.textContent).toBe(t.title);
    for (const section of host.querySelectorAll("section")) {
      const heading = host.querySelector(`[id="${section.getAttribute("aria-labelledby")}"]`);
      expect(heading?.textContent).toBeTruthy();
    }
    expect(host.querySelectorAll(".capability")).toHaveLength(4);
    expect(host.querySelectorAll(".service-card")).toHaveLength(3);
    expect(host.querySelectorAll(".service-areas li")).toHaveLength(12);
    for (const id of serviceIds) expect(host.querySelector(`#service-${id} summary`)?.textContent).toBe(t.details);
    expect(host.querySelectorAll('[data-work-kind="concept"]')).toHaveLength(3);
    expect(host.querySelectorAll(".concept-badge")).toHaveLength(3);
    expect(new Set(t.concepts.map((c) => c.badge)).size).toBe(3);
    for (const [i, item] of t.concepts.entries()) expect(host.querySelectorAll(".concept-badge")[i].textContent).toBe(item.badge);
    expect(host.querySelectorAll(".concept-telemetry")).toHaveLength(3);
    for (const card of host.querySelectorAll(".concept-card")) {
      expect(card.querySelector(".concept-card-body")).not.toBeNull();
      expect(card.lastElementChild?.classList.contains("concept-action")).toBe(true);
    }
    for (const code of ["SaaS_PREVIEW", "RAG_BOT_PREVIEW", "HEALTH_BOOKING_PREVIEW"]) expect(host.textContent).toContain(code);
    expect(host.querySelector(".concept-visual")?.textContent).not.toMatch(/RPS:|TOKENS:|CPU:|HIPAA|SLA|24\/7|\d+%/);
    expect(host.querySelectorAll(".eyebrow-dot")).toHaveLength(2);
    expect(host.querySelectorAll(".benefit-card")).toHaveLength(4);
    expect(host.querySelectorAll(".process-grid > li")).toHaveLength(6);
    for (const item of [...t.services, ...t.concepts, ...t.benefits, ...t.steps]) expect(host.textContent).toContain(item.title);
    const ids = [...host.querySelectorAll("[id]")].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const a of host.querySelectorAll<HTMLAnchorElement>("a")) {
      const href = a.getAttribute("href")!;
      expect(href).toMatch(/^(#|\/(fa|en|ar)(\/(about|contact|privacy|services|work)|#|$))/);
      if (href.includes("#") && !href.includes("/services")) expect(host.querySelector(`[id="${href.split("#")[1]}"]`)).not.toBeNull();
    }
    expect(host.querySelector("footer")).not.toBeNull();
    expect(host.querySelector(".runtime-frame svg")).not.toBeNull();
    expect(host.querySelector(".hero-actions a")?.getAttribute("href")).toBe("#contact");
    expect(host.querySelectorAll(".hero-actions a")[1].getAttribute("href")).toBe("#demos");
  });
  it.each(locales)("renders one progressive inquiry form without native unsafe submission in %s", (locale) => {
    const host = document.createElement("div");
    host.innerHTML = renderToStaticMarkup(<Homepage locale={locale} />);
    const form = host.querySelector("form")!;
    expect(host.querySelectorAll("form")).toHaveLength(1);
    expect(form.getAttribute("action")).toBeNull();
    expect(form.getAttribute("onsubmit")).toBeNull();
    expect(form.querySelectorAll('[name]')).toHaveLength(7);
    for (const control of form.querySelectorAll("input, select, textarea, button")) {
      expect(control.matches(":disabled")).toBe(true);
      if (control.tagName !== "BUTTON") expect(form.querySelector(`label[for="${control.id}"]`)).not.toBeNull();
    }
    expect(form.querySelector("button")?.type).toBe("submit");
    expect(form.querySelector("noscript")).not.toBeNull();
    expect(host.querySelector("#inquiry-success")).toBeNull();
    expect(host.innerHTML).not.toMatch(/mailto:|https:\/\/|HIPAA|SLA|24\/7|contact@|RPS:|TOKENS:/);
  });
  it("keeps complete typed locale content parity", () => {
    expect(shape(homeContent.fa)).toEqual(shape(homeContent.en));
    expect(shape(homeContent.ar)).toEqual(shape(homeContent.en));
    for (const t of Object.values(homeContent)) {
      expect(t.services).toHaveLength(3);
      expect(t.steps).toHaveLength(6);
      expect(t.concepts.every((c) => c.kind === "concept")).toBe(true);
    }
  });
});
