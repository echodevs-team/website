import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { rm, readFile } from "node:fs/promises";
import { once } from "node:events";
import { startLocalPostgres } from "./local-postgres.mjs";

// Never uses externally supplied dev/production DB settings or resets a shared DB.
let cluster;
let child;
let interrupted = false;
const cancel = () => { interrupted = true; child?.kill("SIGTERM"); };
process.once("SIGINT", cancel); process.once("SIGTERM", cancel);
try {
  cluster = await startLocalPostgres({ test: true });
  if (interrupted) throw new Error("Canceled");
  child = spawn(process.execPath, ["node_modules/vitest/vitest.mjs", "run", "--config", "vitest.integration.config.ts",
    ...(process.argv.includes("--operations") ? ["tests/integration/inquiry-operations.test.ts"] : [])], {
    stdio: "inherit", env: { ...process.env, DATABASE_URL: cluster.appUrl, TEST_OWNER_DATABASE_URL: cluster.ownerUrl,
      INQUIRIES_ENABLED: "true", INQUIRY_NETWORK_MODE: "loopback", INQUIRY_ORIGIN: "http://127.0.0.1:3000", INQUIRY_DIGEST_SECRET: randomBytes(32).toString("hex"),
      ECHO_DISPOSABLE_DB: cluster.database, ECHO_TEST_HTTP: process.argv.includes("--http") ? "true" : "false" },
  });
  const [code] = await once(child, "exit");
  process.exitCode = code ?? 1;
} catch { console.error("Disposable PostgreSQL verification failed (connection details redacted)"); process.exitCode = 1; }
finally {
  process.removeListener("SIGINT", cancel); process.removeListener("SIGTERM", cancel);
  if (cluster) {
    cluster.stop();
    const logs = await readFile(`${cluster.directory}/postgres.log`, "utf8");
    if (logs.includes("synthetic@example.invalid") || logs.includes("http@example.invalid") || logs.includes("synthetic-ops-only@example.invalid") || logs.includes("نام آزمایشی")) {
      console.error("Test database logging privacy check failed (contents withheld)"); process.exitCode = 1;
    } else console.log("PASS database log privacy check");
    // Only remove the unique cluster directory that this invocation created.
    if (!cluster.directory.includes("/.local/test-pg-")) throw new Error("Unsafe cleanup path");
    await rm(cluster.directory, { recursive: true });
  }
}
