import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";
import { once } from "node:events";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { expect, it } from "vitest";

it.runIf(process.env.ECHO_TEST_HTTP === "true")("persists through the actual Next production HTTP route without public readback", async () => {
  if (process.env.ECHO_DISPOSABLE_DB !== "echo_test") throw new Error("Disposable test runner required");
  const reservation = createServer();
  reservation.listen(0, "127.0.0.1");
  await once(reservation, "listening");
  const port = (reservation.address() as { port: number }).port;
  await new Promise<void>((resolve, reject) => reservation.close((e) => e ? reject(e) : resolve()));
  const origin = `http://127.0.0.1:${port}`;
  const owner = new Pool({ connectionString: process.env.TEST_OWNER_DATABASE_URL });
  let child: ChildProcess | undefined;
  let exited: Promise<unknown> | undefined;
  try {
    await owner.query("TRUNCATE inquiries CASCADE; TRUNCATE inquiry_rate_limit; TRUNCATE inquiry_network_limit;");
    child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
      env: { ...process.env, NODE_ENV: "production", INQUIRY_ORIGIN: origin, NEXT_TELEMETRY_DISABLED: "1" }, stdio: ["ignore", "pipe", "pipe"],
    });
    exited = once(child, "exit");
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("HTTP startup timeout")), 15000);
      let output = "";
      const ready = (data: Buffer) => { output = (output + data.toString()).slice(-2000); if (output.includes("Ready in")) { clearTimeout(timeout); resolve(); } };
      child!.stdout!.on("data", ready); child!.stderr!.on("data", ready);
      child!.once("error", () => { clearTimeout(timeout); reject(new Error("HTTP server failed")); });
      child!.once("exit", () => { clearTimeout(timeout); reject(new Error("HTTP server exited")); });
    });
    const body = { fullName: "Synthetic HTTP Test", email: "http@example.invalid", service: "website", description: "Disposable inquiry through real HTTP routing.", locale: "en", sourcePage: "/en" };
    const key = randomUUID();
    const send = (data = body) => fetch(`${origin}/api/inquiries`, { method: "POST", headers: { origin, "content-type": "application/json", "idempotency-key": key }, body: JSON.stringify(data), signal: AbortSignal.timeout(10000) });
    const first = await send(); expect(first.status).toBe(201);
    const saved = await first.json();
    expect((await owner.query("SELECT full_name FROM inquiries WHERE id=$1", [saved.reference])).rows[0].full_name).toBe(body.fullName);
    const retry = await send(); expect(retry.status).toBe(200);
    expect((await retry.json()).reference).toBe(saved.reference);
    expect((await send({ ...body, description: "short" })).status).toBe(400);
    expect((await send({ ...body, fullName: "Changed test" })).status).toBe(409);
    for (const path of ["/api/inquiries", `/api/inquiries/${saved.reference}`]) {
      const response = await fetch(origin + path, { signal: AbortSignal.timeout(10000) });
      expect([404, 405]).toContain(response.status);
      expect(await response.text()).not.toContain(body.email);
    }
    await owner.query("REVOKE INSERT ON inquiries FROM echo_app");
    const failure = await fetch(`${origin}/api/inquiries`, { method: "POST", headers: { origin, "content-type": "application/json", "idempotency-key": randomUUID() }, body: JSON.stringify(body), signal: AbortSignal.timeout(10000) });
    expect(failure.status).toBe(503); expect(await failure.json()).toEqual({ error: "unavailable" });
    expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("1");
  } finally {
    await owner.query("GRANT INSERT ON inquiries TO echo_app").catch(() => {});
    child?.kill("SIGTERM"); if (exited) await exited;
    await owner.end();
  }
});
