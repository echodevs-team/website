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
  env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
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

  for (const [locale, dir, heading] of [["fa", "rtl", "اکو دوز"], ["en", "ltr", "Echo Devs"], ["ar", "rtl", "إيكو ديفز"]]) {
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
    for (const path of ["services", "work", "about", "contact", "privacy"]) {
      assert.ok(!html.includes(`href="/${locale}/${path}"`), "Unbuilt pages must not be fake links");
    }
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${dir}"`));
    assert.match(html, new RegExp(`<h1[^>]*>${heading}</h1>`), `Localized rendered heading ${locale}`);
    assert.match(html, /<meta name="robots" content="noindex, nofollow"/);
    for (const target of ["fa", "en", "ar"]) assert.ok(html.includes(`href="/${target}"`));
    assert.ok(!html.includes("contact@echodevs.com"));
    console.log(`PASS /${locale}: 200, ${dir}, localized copy, noindex, locale links, Header, pre-body theme modes`);
  }

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

  const explicit = await request("/en", { headers: { cookie: "echo_locale=fa", "accept-language": "ar" } });
  assert.equal(explicit.status, 200);
  assert.match(await explicit.text(), /<html[^>]*lang="en"[^>]*dir="ltr"/);

  for (const [locale, message] of [["fa", "صفحه پیدا نشد"], ["en", "Page not found"], ["ar", "الصفحة غير موجودة"]]) {
    const response = await request(`/${locale}/missing/nested`);
    assert.equal(response.status, 404, `${locale} nested 404`);
    const html = await response.text();
    assert.match(html, new RegExp(`<h1[^>]*>${message}</h1>`), `${locale} rendered not-found`);
    assert.match(html, new RegExp(`<html[^>]*lang="${locale}"[^>]*dir="${locale === "en" ? "ltr" : "rtl"}"`));
  }
  const spoofed = await request("/en/missing", { headers: { "x-echo-locale": "ar" } });
  assert.equal(spoofed.status, 404);
  assert.match(await spoofed.text(), /<html[^>]*lang="en"[^>]*dir="ltr"/);
  for (const path of ["/fr", "/fr/missing", "/design/reference/code.html", "/code.html",
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
