import { createHmac, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { Pool, type PoolClient } from "pg";
import { createInquiryPool } from "../../src/lib/db/client";
import { handleInquiry, type InquiryConfig } from "../../src/lib/inquiries/handler";
import { POST } from "../../src/app/api/inquiries/route";

const fixture = { fullName: "نام آزمایشی العربية", email: "synthetic@example.invalid", phone: "+۴۴ ۲۰ ۷۹۴۶ ۰۰۱۸", service: "not_sure", description: "A synthetic inquiry for disposable PostgreSQL testing only.", locale: "fa", sourcePage: "/fa" };
let owner: Pool;
let app: Pool;
let config: InquiryConfig;
function request(body: unknown = fixture, key: string = randomUUID(), headers: Record<string, string> = {}) {
  return new Request("http://127.0.0.1:3000/api/inquiries", { method: "POST", headers: {
    origin: "http://127.0.0.1:3000", "content-type": "application/json", "idempotency-key": key, ...headers,
  }, body: JSON.stringify(body) });
}
const count = async () => Number((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count);
const proxySecret = "synthetic-proxy-test-secret-not-for-production";
function proxyRequest(ip: string, key = randomUUID()) {
  const time = String(Date.now());
  const signature = createHmac("sha256", proxySecret).update(`${time}\n${ip}\nPOST\n/api/inquiries\n${key}`).digest("hex");
  return request(fixture, key, { "x-echo-client-ip": ip, "x-echo-client-time": time, "x-echo-client-signature": signature });
}

beforeAll(async () => {
  if (process.env.ECHO_DISPOSABLE_DB !== "echo_test") throw new Error("Use the isolated integration runner");
  for (const key of ["DATABASE_URL", "TEST_OWNER_DATABASE_URL"]) {
    const url = new URL(process.env[key]!);
    if (url.pathname !== "/echo_test" || !url.searchParams.get("host")?.includes("/.local/test-pg-")) throw new Error("Not a disposable test database");
  }
  owner = new Pool({ connectionString: process.env.TEST_OWNER_DATABASE_URL, max: 2 });
  app = createInquiryPool(process.env.DATABASE_URL!);
  expect((await owner.query("SELECT current_database() AS name")).rows[0].name).toBe("echo_test");
  config = { enabled: true, origin: "http://127.0.0.1:3000", secret: process.env.INQUIRY_DIGEST_SECRET!, pool: () => app, network: { mode: "loopback" } };
});
beforeEach(async () => {
  await owner.query("DROP TRIGGER IF EXISTS test_commit_failure ON inquiries; DROP FUNCTION IF EXISTS test_commit_failure(); TRUNCATE inquiries CASCADE; TRUNCATE inquiry_rate_limit; TRUNCATE inquiry_network_limit;");
});
afterAll(async () => { await app?.end(); await owner?.end(); });

describe("real PostgreSQL migration, API and least-privilege persistence", () => {
  it("upgrades a version-001 fixture with existing data without rewriting migration history", async () => {
    const response = await handleInquiry(request(), config);
    const { reference } = await response.json();
    // Downgrade only this disposable fixture to simulate a P2-A database.
    await owner.query("DROP TABLE inquiry_network_limit; DELETE FROM schema_migrations WHERE version='002_network_limits.sql'");
    const env = { ...process.env, MIGRATION_DATABASE_URL: process.env.TEST_OWNER_DATABASE_URL };
    execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, stdio: "pipe" });
    // Recreated tables need their capability grants re-applied, just as the
    // local startup/runbook does after owner-reviewed migrations.
    execFileSync(process.execPath, ["scripts/provision-inquiry-roles.mjs"], { env, stdio: "pipe" });
    await owner.query("GRANT SELECT, INSERT, UPDATE, DELETE ON inquiry_network_limit TO echo_app");
    expect((await owner.query("SELECT id FROM inquiries WHERE id=$1", [reference])).rows[0].id).toBe(reference);
    expect((await owner.query("SELECT count(*) FROM schema_migrations")).rows[0].count).toBe("2");
    expect((await handleInquiry(request(), config)).status).toBe(201);
  });
  it("repeats versioned migrations without resetting data and detects modified history", async () => {
    expect((await handleInquiry(request(), config)).status).toBe(201);
    const env = { ...process.env, MIGRATION_DATABASE_URL: process.env.TEST_OWNER_DATABASE_URL };
    execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, stdio: "pipe" });
    execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, stdio: "pipe" });
    expect(await count()).toBe(1);
    const rows = await owner.query("SELECT * FROM schema_migrations");
    expect(rows.rowCount).toBe(2);
    await owner.query("UPDATE schema_migrations SET checksum='synthetic-mismatch'");
    expect(() => execFileSync(process.execPath, ["scripts/migrate.mjs"], { env, stdio: "pipe" })).toThrow();
    for (const row of rows.rows) await owner.query("UPDATE schema_migrations SET checksum=$1 WHERE version=$2", [row.checksum, row.version]);
    expect((await owner.query("SELECT indexname FROM pg_indexes WHERE tablename='inquiries'")).rows.map((r) => r.indexname)).toEqual(expect.arrayContaining(["inquiries_created_at_idx", "inquiries_status_idx"]));
  });
  it("commits normalized Unicode data, returns opaque reference only and allows owner readback", async () => {
    const response = await POST(request());
    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    const result = await response.json();
    expect(Object.keys(result).sort()).toEqual(["reference", "replayed"]);
    expect(result.reference).toMatch(/^[a-f0-9-]{36}$/);
    const row = (await owner.query("SELECT * FROM inquiries WHERE id=$1", [result.reference])).rows[0];
    expect(row.full_name).toBe(fixture.fullName);
    expect(row.phone).toBe("+442079460018");
    expect(row.email).toBe(fixture.email);
    expect(row.status).toBe("new");
    expect(row.created_at).toBeInstanceOf(Date);
    expect((await owner.query("SHOW fsync")).rows[0].fsync).toBe("on");
    expect((await app.query("SHOW synchronous_commit")).rows[0].synchronous_commit).toBe("on");
  });
  it("denies app access to stored PII, updates, deletion and DDL", async () => {
    await handleInquiry(request(), config);
    for (const sql of ["SELECT full_name,email,description FROM inquiries", "UPDATE inquiries SET status='closed'", "DELETE FROM inquiries", "CREATE TABLE forbidden(id int)", "SELECT * FROM schema_migrations"]) {
      await expect(app.query(sql)).rejects.toMatchObject({ code: "42501" });
    }
    expect((await app.query("SELECT rolcreatedb,rolcreaterole,rolsuper FROM pg_roles WHERE rolname=current_user")).rows[0]).toEqual({ rolcreatedb: false, rolcreaterole: false, rolsuper: false });
  });
  it("enforces contact/enum/length/source constraints independently in PostgreSQL", async () => {
    const response = await handleInquiry(request(), config);
    const { reference } = await response.json();
    for (const sql of ["email=NULL,phone=NULL", "service='fake'", "locale='xx'", "source_page='/en'", "full_name='x'", "description='short'", "phone='09123456789'"]) {
      await expect(owner.query(`UPDATE inquiries SET ${sql} WHERE id=$1`, [reference])).rejects.toMatchObject({ code: "23514" });
    }
    await owner.query("DELETE FROM inquiries WHERE id=$1", [reference]);
    expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("0");
  });
  it("authenticates app credentials and cleans expired metadata without deleting inquiries", async () => {
    const badUrl = new URL(process.env.DATABASE_URL!);
    badUrl.password = "synthetic-wrong-password";
    const invalid = createInquiryPool(badUrl.toString());
    try { await expect(invalid.query("SELECT 1")).rejects.toMatchObject({ code: "28P01" }); }
    finally { await invalid.end(); }
    const key = randomUUID();
    expect((await handleInquiry(request(fixture, key), config)).status).toBe(201);
    await owner.query("UPDATE inquiry_submissions SET expires_at=clock_timestamp() WHERE key=$1", [key]);
    execFileSync(process.execPath, ["scripts/cleanup-submissions.mjs"], { env: process.env, stdio: "pipe" });
    expect(await count()).toBe(1);
    expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("0");
  });
  it("serializes concurrent identical submissions, rejects changed payload and bounds key expiry", async () => {
    const key = randomUUID();
    const responses = await Promise.all(Array.from({ length: 5 }, () => handleInquiry(request(fixture, key), config)));
    expect(responses.map((r) => r.status).sort()).toEqual([200, 200, 200, 200, 201]);
    const bodies = await Promise.all(responses.map((r) => r.json()));
    expect(new Set(bodies.map((b) => b.reference)).size).toBe(1);
    expect(await count()).toBe(1);
    await owner.query("TRUNCATE inquiry_network_limit");
    expect((await handleInquiry(request({ ...fixture, fullName: "Changed synthetic name" }, key), config)).status).toBe(409);
    expect(await count()).toBe(1);
    await owner.query("UPDATE inquiry_submissions SET expires_at=clock_timestamp() WHERE key=$1", [key]);
    const repeated = await handleInquiry(request(fixture, key), config);
    expect(repeated.status).toBe(201);
    expect((await repeated.json()).reference).not.toBe(bodies[0].reference);
    expect(await count()).toBe(2);
  });
  it("stores SQL-looking text literally without executing it", async () => {
    const description = "Synthetic SQL text: '); DROP TABLE inquiries; -- not executable";
    const response = await handleInquiry(request({ ...fixture, description }), config);
    expect(response.status).toBe(201);
    expect((await owner.query("SELECT description FROM inquiries")).rows[0].description).toBe(description);
  });
  it("rejects invalid, oversized, unknown, compressed and malformed requests with zero inquiry rows", async () => {
    for (const data of [{ ...fixture, email: "bad" }, { ...fixture, phone: "" , email: "" }, { ...fixture, unknown: "data" }, { ...fixture, description: "x".repeat(5001) }]) expect((await handleInquiry(request(data), config)).status).toBe(400);
    expect((await handleInquiry(request({ ...fixture, description: "x".repeat(33000) }), config)).status).toBe(413);
    expect((await handleInquiry(request(fixture, randomUUID(), { "content-length": "40000" }), config)).status).toBe(413);
    expect((await handleInquiry(request(fixture, randomUUID(), { "content-type": "text/plain" }), config)).status).toBe(415);
    expect((await handleInquiry(request(fixture, randomUUID(), { "content-encoding": "gzip" }), config)).status).toBe(415);
    const malformed = request();
    const raw = new Request(malformed.url, { method: "POST", headers: malformed.headers, body: "{not-json" });
    expect((await handleInquiry(raw, config)).status).toBe(400);
    expect((await handleInquiry(request(fixture, "bad-key"), config)).status).toBe(400);
    expect(await count()).toBe(0);
  });
  it("caps a streamed body without Content-Length", async () => {
    const normal = request();
    const raw = new Request(normal.url, { method: "POST", headers: normal.headers,
      body: new ReadableStream({ start(controller) { controller.enqueue(new Uint8Array(20000)); controller.enqueue(new Uint8Array(20000)); controller.close(); } }), duplex: "half" } as RequestInit);
    expect((await handleInquiry(raw, config)).status).toBe(413);
    expect(await count()).toBe(0);
  });
  it("bounds a stalled request body and cancels the reader", async () => {
    const normal = request();
    let canceled = false;
    const raw = new Request(normal.url, { method: "POST", headers: normal.headers,
      body: new ReadableStream({ cancel() { canceled = true; } }), duplex: "half" } as RequestInit);
    const response = await handleInquiry(raw, config);
    expect(response.status).toBe(408);
    expect(canceled).toBe(true);
    expect(await count()).toBe(0);
  });
  it("rejects missing/foreign Origin and fails closed when disabled or misconfigured", async () => {
    expect((await handleInquiry(request(fixture, randomUUID(), { origin: "https://foreign.invalid" }), config)).status).toBe(403);
    const missing = request(); missing.headers.delete("origin");
    expect((await handleInquiry(missing, config)).status).toBe(403);
    for (const origin of ["null", "http://127.0.0.1:3000/", "http://127.0.0.1:3000, https://foreign.invalid"]) expect((await handleInquiry(request(fixture, randomUUID(), { origin }), config)).status).toBe(403);
    expect((await handleInquiry(request(fixture, randomUUID(), { "sec-fetch-site": "cross-site" }), config)).status).toBe(403);
    expect((await handleInquiry(request(), { ...config, enabled: false })).status).toBe(503);
    expect((await handleInquiry(request(), { ...config, secret: undefined })).status).toBe(503);
    expect(await count()).toBe(0);
  });
  it("rolls back both rows on an actual deferred COMMIT failure and returns no internals", async () => {
    await owner.query(`CREATE FUNCTION test_commit_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'synthetic-secret-detail'; END $$;
      CREATE CONSTRAINT TRIGGER test_commit_failure AFTER INSERT ON inquiries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION test_commit_failure();`);
    const log = vi.spyOn(console, "error");
    const response = await handleInquiry(request(), config);
    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "unavailable" });
    expect(log).not.toHaveBeenCalled(); log.mockRestore();
    expect(await count()).toBe(0);
    expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("0");
  });
  it("returns a safe connection failure, never success", async () => {
    const broken = createInquiryPool(process.env.DATABASE_URL!.replace(/host=[^&]+/, "host=%2Fnonexistent-echo-test-socket"));
    try {
      const response = await handleInquiry(request(), { ...config, pool: () => broken });
      expect(response.status).toBe(503);
      expect(await response.json()).toEqual({ error: "unavailable" });
      expect(await count()).toBe(0);
    } finally { await broken.end(); }
  });
  it("handles lost COMMIT acknowledgement with same-key retry, without a second inquiry", async () => {
    const key = randomUUID();
    const proxy = { query: app.query.bind(app), connect: async () => {
      const client = await app.connect();
      return { query: async (sql: string, params?: unknown[]) => {
        const result = await client.query(sql, params);
        if (sql === "COMMIT") throw new Error("synthetic lost acknowledgement");
        return result;
      }, release: (destroy: boolean) => client.release(destroy) } as unknown as PoolClient;
    } } as unknown as Pool;
    expect((await handleInquiry(request(fixture, key), { ...config, pool: () => proxy })).status).toBe(503);
    expect(await count()).toBe(1);
    expect((await handleInquiry(request(fixture, key), config)).status).toBe(200);
    expect(await count()).toBe(1);
  });
  it("uses a bounded shared global attempt bucket, including replays", async () => {
    const key = randomUUID();
    expect((await handleInquiry(request(fixture, key), config)).status).toBe(201);
    await owner.query("UPDATE inquiry_rate_limit SET attempts=30");
    const limited = await handleInquiry(request(fixture, key), config);
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("600");
    expect(await count()).toBe(1);
    await owner.query("UPDATE inquiry_rate_limit SET window_start=clock_timestamp()-interval '11 minutes'");
    expect((await handleInquiry(request(fixture, key), config)).status).toBe(200);
    expect((await owner.query("SELECT count(*) FROM inquiry_rate_limit")).rows[0].count).toBe("1");
  });
  it("atomically enforces five attempts per network under concurrency", async () => {
    const responses = await Promise.all(Array.from({ length: 8 }, (_, i) => handleInquiry(request(fixture, randomUUID(), {
      "x-forwarded-for": `192.0.2.${i + 1}`, "x-real-ip": `203.0.113.${i + 1}`, forwarded: `for=192.0.2.${i + 1}`,
    }), config)));
    expect(responses.filter((r) => r.status === 201)).toHaveLength(5);
    expect(responses.filter((r) => r.status === 429)).toHaveLength(3);
    expect(await count()).toBe(5);
    const buckets = (await owner.query("SELECT * FROM inquiry_network_limit")).rows;
    expect(buckets).toHaveLength(1); expect(buckets[0].attempts).toBe(6);
    expect(buckets[0].key).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(buckets)).not.toContain("127.0.0.1");
  });
  it("groups IPv6 privacy addresses by /64 and mapped IPv4 with IPv4", async () => {
    const trusted = { ...config, network: { mode: "signed-proxy", proxySecret } };
    for (let i = 0; i < 5; i++) expect((await handleInquiry(proxyRequest(`2001:db8:1:2::${i + 1}`), trusted)).status).toBe(201);
    expect((await handleInquiry(proxyRequest("2001:DB8:1:2:abcd::999"), trusted)).status).toBe(429);
    expect((await handleInquiry(proxyRequest("2001:db8:1:3::1"), trusted)).status).toBe(201);
    for (let i = 0; i < 5; i++) expect((await handleInquiry(proxyRequest("192.0.2.1"), trusted)).status).toBe(201);
    expect((await handleInquiry(proxyRequest("::ffff:c000:201"), trusted)).status).toBe(429);
    expect((await owner.query("SELECT count(*) FROM inquiry_network_limit")).rows[0].count).toBe("3");
  });
  it("fails closed on forged/missing proxy authentication and forged Origin before storage", async () => {
    const trusted = { ...config, network: { mode: "signed-proxy", proxySecret } };
    const forged = request(fixture, randomUUID(), { "x-echo-client-ip": "192.0.2.1", "x-forwarded-for": "192.0.2.1" });
    expect((await handleInquiry(forged, trusted)).status).toBe(503);
    const foreign = proxyRequest("192.0.2.1"); foreign.headers.set("origin", "https://foreign.invalid");
    expect((await handleInquiry(foreign, trusted)).status).toBe(403);
    expect((await handleInquiry(request(), { ...config, network: undefined })).status).toBe(503);
    expect((await handleInquiry(request({ ...fixture, website: "bot" }), config)).status).toBe(400);
    expect(await count()).toBe(0);
    expect((await owner.query("SELECT count(*) FROM inquiry_rate_limit")).rows[0].count).toBe("0");
  });
  it("expires network quota exactly at the boundary and cleans ephemeral state without inquiries", async () => {
    for (let i = 0; i < 5; i++) expect((await handleInquiry(request(), config)).status).toBe(201);
    const limited = await handleInquiry(request(), config);
    expect(limited.status).toBe(429); expect(limited.headers.get("retry-after")).toBe("600");
    await owner.query("UPDATE inquiry_network_limit SET expires_at=clock_timestamp()");
    expect((await handleInquiry(request(), config)).status).toBe(201);
    expect((await owner.query("SELECT attempts FROM inquiry_network_limit")).rows[0].attempts).toBe(1);
    await owner.query("UPDATE inquiry_submissions SET expires_at=clock_timestamp(); UPDATE inquiry_network_limit SET expires_at=clock_timestamp()");
    execFileSync(process.execPath, ["scripts/cleanup-submissions.mjs"], { env: process.env, stdio: "pipe" });
    expect((await owner.query("SELECT count(*) FROM inquiry_network_limit")).rows[0].count).toBe("0");
    expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("0");
    expect(await count()).toBe(6);
  });
  it("caps network bucket cardinality with the global limit and fails closed if abuse storage fails", async () => {
    const trusted = { ...config, network: { mode: "signed-proxy", proxySecret } };
    for (let i = 1; i <= 30; i++) expect((await handleInquiry(proxyRequest(`192.0.2.${i}`), trusted)).status).toBe(201);
    expect((await handleInquiry(proxyRequest("192.0.2.31"), trusted)).status).toBe(429);
    expect((await owner.query("SELECT count(*) FROM inquiry_network_limit")).rows[0].count).toBe("30");
    await owner.query("TRUNCATE inquiry_rate_limit; REVOKE INSERT ON inquiry_network_limit FROM echo_app");
    try { expect((await handleInquiry(proxyRequest("192.0.2.32"), trusted)).status).toBe(503); }
    finally { await owner.query("GRANT INSERT ON inquiry_network_limit TO echo_app"); }
    expect(await count()).toBe(30);
  });
});
