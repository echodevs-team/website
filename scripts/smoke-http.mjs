// Production HTTP verification, not a browser/accessibility screenshot test.
// Owns and stops its loopback-only child server. Never targets a remote origin.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { createServer } from "node:net";
import { runInNewContext } from "node:vm";

const reservation = createServer();
reservation.listen(0, "127.0.0.1");
await once(reservation, "listening");
const { port } = reservation.address();
await new Promise((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
const origin = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", INQUIRIES_ENABLED: "false" },
});
let logs = "";
const exited = once(child, "exit");

async function request(path, options) {
  return fetch(`${origin}${path}`, { ...options, redirect: "manual", signal: AbortSignal.timeout(10_000) });
}

try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Server startup timeout\n${logs}`)), 30_000);
    const onOutput = (data) => {
      logs = (logs + data.toString()).slice(-12_000);
      if (/Ready in/.test(logs)) { clearTimeout(timeout); resolve(); }
    };
    child.stdout.on("data", onOutput);
    child.stderr.on("data", onOutput);
    child.once("error", (error) => { clearTimeout(timeout); reject(error); });
    child.once("exit", (code) => { clearTimeout(timeout); reject(new Error(`Server exited ${code}\n${logs}`)); });
  });

  for (const [locale, dir, heading] of [["fa", "rtl", "ایده‌های شما، تخصص مهندسی ما."], ["en", "ltr", "Your ideas. Our engineering expertise."], ["ar", "rtl", "أفكاركم، وخبرتنا الهندسية."]]) {
    const response = await request(`/${locale}`);
    assert.equal(response.status, 200, locale);
    const html = await response.text();
    const init = /<script id="echo-theme-init">([\s\S]*?)<\/script>/.exec(html);
    assert.ok(init, "Theme initializer is rendered");
    assert.ok(html.indexOf(init[0]) < html.indexOf("</head>"), "Theme initializes in head, before body");
    for (const [saved, dark, expected] of [["light", true, "light"], ["dark", false, "dark"], ["system", true, "dark"], [null, false, "light"]]) {
      const dataset = {};
      const media = Object.assign(new EventTarget(), { matches: dark });
      const window = Object.assign(new EventTarget(), { matchMedia: () => media });
      runInNewContext(init[1], { window, document: { documentElement: { dataset } }, Event,
        localStorage: { getItem: () => saved } });
      assert.equal(dataset.theme, expected, `${locale} production init: ${saved}`);
    }
    assert.match(html, /<header class="site-header"/);
    assert.match(html, /<dialog[^>]*aria-label=/);
    assert.match(html, /aria-haspopup="dialog"/);
    assert.ok(html.includes(`href="/${locale}/services"`), "Services is implemented and discoverable");
    assert.ok(html.includes(`href="/${locale}/work"`), "Work is implemented and discoverable");
    for (const path of ["about", "contact", "privacy"]) {
      assert.ok(!html.includes(`href="/${locale}/${path}"`), "Unbuilt pages must not be fake links");
    }
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${dir}"`));
    assert.match(html, new RegExp(`<h1[^>]*>${heading}</h1>`), `Localized rendered heading ${locale}`);
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    const head = /<head>([\s\S]*?)<\/head>/.exec(html)?.[1] ?? "";
    assert.match(head, /<link rel="icon"[^>]*href="\/favicon\.ico[^"]*"[^>]*type="image\/x-icon"/, "ICO favicon is linked");
    assert.match(head, /<link rel="icon"[^>]*href="\/icon\.svg[^"]*"[^>]*type="image\/svg\+xml"/, "SVG favicon is linked");
    const requiredLabel = { fa: "الزامی", en: "required", ar: "مطلوب" }[locale];
    const rendered = html.replace(/<!--[\s\S]*?-->/g, "");
    assert.equal((rendered.match(/class="ui-field-required-text"/g) ?? []).length, 2, "Localized required indicators");
    assert.ok(rendered.includes(`(${requiredLabel})</span>`), `Localized required indicator ${locale}`);
    assert.equal((html.match(/required=""/g) ?? []).length, 2, "Native required semantics preserved");
    for (const target of ["fa", "en", "ar"]) assert.ok(html.includes(`href="/${target}"`));
    assert.ok(!html.includes("contact@echodevs.com"));
    for (const section of ["hero", "services", "demos", "why-us", "process", "contact"]) {
      assert.match(html, new RegExp(`<section id="${section}"`), `${locale} renders ${section}`);
    }
    const staticBackdrop = /<div[^>]*class="technical-backdrop"[^>]*>/.exec(html)?.[0];
    assert.ok(staticBackdrop, "Server renders the static technical backdrop");
    assert.match(staticBackdrop, /data-backdrop="static"/);
    assert.match(staticBackdrop, /aria-hidden="true"/);
    assert.match(html, /<canvas[^>]*class="technical-canvas"[^>]*aria-hidden="true"/);
    assert.equal((html.match(/data-work-kind="concept"/g) ?? []).length, 3);
    assert.equal((html.match(/class="concept-badge"/g) ?? []).length, 3);
    assert.equal((html.match(/class="concept-card-body"/g) ?? []).length, 3);
    assert.equal((html.match(/class="concept-telemetry"/g) ?? []).length, 3);
    for (const code of ["SaaS_PREVIEW", "RAG_BOT_PREVIEW", "HEALTH_BOOKING_PREVIEW"]) assert.ok(html.includes(code), `Concept preview label ${code}`);
    assert.ok(!/RPS:|TOKENS:|CPU:|HIPAA|SLA|24\/7/.test(html), "Concept visuals do not imply measured production capacity");
    assert.match(html, /<fieldset disabled=""/);
    assert.ok(!html.includes("inquiry-success"));
    console.log(`PASS /${locale}: 200, ${dir}, localized copy, noindex, locale links, Header, pre-body theme modes`);

    const servicesResponse = await request(`/${locale}/services`);
    assert.equal(servicesResponse.status, 200);
    const services = await servicesResponse.text();
    assert.match(services, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${dir}"`));
    const title = { fa: "خدمات متناسب با گام بعدی شما", en: "Services shaped around your next step", ar: "خدمات تناسب خطوتكم التالية" }[locale];
    assert.ok(services.includes(`<h1 id="services-title">${title}</h1>`));
    assert.ok(services.includes(`<title>${title} — Echo Devs</title>`));
    assert.match(services, /<meta name="description" content="[^"]+"/);
    assert.match(services, /<meta name="robots" content="noindex, nofollow"/);
    for (const id of ["websites", "software", "ai"]) {
      assert.ok(services.includes(`<section id="${id}"`));
      assert.ok(html.includes(`href="/${locale}/services#${id}"`));
    }
    for (const target of ["fa", "en", "ar"]) assert.ok(services.includes(`href="/${target}/services"`));
    assert.equal((services.match(/class="services-subservices"/g) ?? []).length, 3);
    assert.ok(services.includes(`href="/${locale}#contact"`));
    assert.ok(!services.includes("<form"));
    console.log(`PASS /${locale}/services: localized route, metadata, three pillars, equivalent locale links, existing inquiry destination`);

    const workResponse = await request(`/${locale}/work`);
    assert.equal(workResponse.status, 200);
    const work = await workResponse.text();
    const workTitle = { fa: "نمونه‌کارها و طرح‌های مفهومی", en: "Work &amp; concepts", ar: "الأعمال والتصورات" }[locale];
    assert.match(work, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${dir}"`));
    assert.ok(work.includes(`<h1 id="work-title">${workTitle}</h1>`));
    assert.ok(work.includes(`<title>${workTitle} — Echo Devs</title>`));
    assert.match(work, /<meta name="description" content="[^"]+"/);
    assert.match(work, /<meta name="robots" content="noindex, nofollow"/);
    for (const kind of ["client", "internal", "concept"]) {
      assert.ok(work.includes(`<section id="${kind}"`));
      assert.ok(work.includes(`href="#${kind}"`));
    }
    assert.equal((work.match(/data-work-kind="concept"/g) ?? []).length, 3);
    assert.ok(!/data-work-kind="(client|internal)"/.test(work));
    for (const target of ["fa", "en", "ar"]) assert.ok(work.includes(`href="/${target}/work"`));
    for (const id of ["contact", "demos"]) assert.ok(work.includes(`href="/${locale}#${id}"`));
    assert.ok(!work.includes(`<form`));
    for (const slug of ["analytics", "chat", "booking"]) {
      const path = `/${locale}/work/${slug}`;
      assert.ok(work.includes(`href="${path}"`), "Listing reaches each concept detail");
      const detailResponse = await request(path);
      assert.equal(detailResponse.status, 200, path);
      const detail = await detailResponse.text();
      assert.match(detail, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${dir}"`));
      const detailTitle = /<h1[^>]*>([^<]+)<\/h1>/.exec(detail)?.[1];
      assert.ok(detailTitle);
      assert.ok(detail.includes(`<title>${detailTitle} — `), "Unique concept metadata");
      assert.match(detail, /<meta name="description" content="[^"]+"/);
      assert.match(detail, /<meta name="robots" content="noindex, nofollow"/);
      for (const target of ["fa", "en", "ar"]) assert.ok(detail.includes(`href="/${target}/work/${slug}"`));
      for (const id of ["work-detail-title", "proposal-title", "workflow-title", "scope-title", "proposed-stack", "related-title"]) assert.ok(detail.includes(`id="${id}"`));
      assert.ok(detail.includes(`href="/${locale}/work"`));
      assert.ok(detail.includes(`href="/${locale}#contact"`));
      assert.ok(detail.includes(`href="/${locale}/services#`));
      for (const match of detail.matchAll(/href="(\/[^"]+)"/g)) {
        const [destination, fragment] = match[1].split("#");
        const linkedResponse = await request(destination);
        assert.equal(linkedResponse.status, 200, match[1]);
        if (fragment) assert.ok((await linkedResponse.text()).includes(`id="${fragment}"`), match[1]);
        else await linkedResponse.body?.cancel();
      }
      assert.ok(detail.includes(`class="concept-visual ${slug}"`));
      assert.ok(detail.includes("<figure") && detail.includes("<figcaption>"));
      assert.match(detail, /data-work-kind="concept"/);
      assert.ok(!/<form|<iframe|mailto:|HIPAA|TOKENS:|RPS:/.test(detail));
      assert.ok(detail.includes('id="echo-theme-init"') && detail.includes('class="site-header"') && detail.includes("<footer"));
      console.log(`PASS ${path}: static concept, localized metadata/dir/sections/visual/shell, equivalent language links, all destinations reachable`);
    }
    console.log(`PASS /${locale}/work: localized metadata/direction, honest groups, three concepts, existing destinations, locale switching`);
  }

  for (const [path, type] of [["/favicon.ico", /^image\/x-icon/], ["/icon.svg", /^image\/svg\+xml/]]) {
    const asset = await request(path);
    assert.equal(asset.status, 200, path);
    assert.match(asset.headers.get("content-type") ?? "", type, path);
    assert.ok((await asset.arrayBuffer()).byteLength > 0, path);
  }
  const iconSource = await (await request("/icon.svg")).text();
  assert.ok(iconSource.includes('viewBox="0 0 32 32"') && iconSource.includes('fill="#ee7758"'), "SVG favicon carries the brand mark");
  console.log("PASS favicon: ICO + SVG linked in every localized document and served with image content types");

  for (const [headers, target] of [
    [{}, "/fa"],
    [{ "accept-language": "en-US,en;q=0.8" }, "/en"],
    [{ "accept-language": "ar-SA,en;q=0.7" }, "/ar"],
    [{ "accept-language": "en", cookie: "echo_locale=ar" }, "/ar"],
    [{ "accept-language": "en", cookie: "echo_locale=invalid" }, "/en"],
  ]) {
    const response = await request("/", { headers });
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location"), origin).pathname, target);
    assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  }
  console.log("PASS negotiated redirects: cookie precedence, browser preference, FA fallback, no-store");

  const inquiryRead = await request("/api/inquiries");
  assert.equal(inquiryRead.status, 405, "No public inquiry read endpoint");
  const inquirySubmit = await request("/api/inquiries", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
  assert.equal(inquirySubmit.status, 503, "API disabled by default in preview");
  assert.deepEqual(await inquirySubmit.json(), { error: "unavailable" });

  const explicit = await request("/en", { headers: { cookie: "echo_locale=fa", "accept-language": "ar" } });
  assert.equal(explicit.status, 200);
  assert.match(await explicit.text(), /<html[^>]*lang="en"[^>]*dir="ltr"/);

  for (const [locale, message] of [["fa", "صفحه پیدا نشد"], ["en", "Page not found"], ["ar", "الصفحة غير موجودة"]]) {
    for (const slug of ["missing", "constructor", "analytics/extra"]) {
      const unknown = await request(`/${locale}/work/${slug}`);
      assert.equal(unknown.status, 404);
      const missing = await unknown.text();
      assert.match(missing, new RegExp(`<h1[^>]*>${message}</h1>`));
      assert.match(missing, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${locale === "en" ? "ltr" : "rtl"}"`));
    }
    const response = await request(`/${locale}/missing/nested`);
    assert.equal(response.status, 404, `${locale} nested 404`);
    const html = await response.text();
    assert.match(html, new RegExp(`<h1[^>]*>${message}</h1>`), `${locale} rendered not-found`);
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${locale === "en" ? "ltr" : "rtl"}"`));
  }
  const spoofed = await request("/en/missing", { headers: { "x-echo-locale": "ar" } });
  assert.equal(spoofed.status, 404);
  assert.match(await spoofed.text(), /<html[^>]*lang="en"[^>]*dir="ltr"/);
  for (const path of ["/fr", "/fr/work", "/fr/work/analytics", "/en/work/missing", "/fr/services", "/en/services/missing", "/fr/missing", "/design/reference/code.html", "/code.html",
    "/design/reference/original/cvecho.zip", "/design/reference/original/screen.png", "/.env.example", "/package.json"]) {
    const response = await request(path);
    assert.equal(response.status, 404, path);
    assert.match(await response.text(), /noindex/);
  }
  console.log("PASS localized/unknown-locale 404s, no cookie override of explicit URLs, references not served");
} catch (error) {
  console.error(logs);
  throw error;
} finally {
  child.kill("SIGTERM");
  const force = setTimeout(() => child.kill("SIGKILL"), 5000);
  await exited;
  clearTimeout(force);
  console.log("Stopped loopback test server");
}
