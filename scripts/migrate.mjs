import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import pg from "pg";

// Migration credentials are explicit; never fall back to the application's URL.
export async function migrate(connectionString, { verifyOnly = false } = {}) {
  if (!connectionString) throw new Error("Migration database is not configured");
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 3000, statement_timeout: 10000 });
  await client.connect();
  try {
    await client.query(verifyOnly ? "BEGIN READ ONLY" : "BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(734901)");
    if (!verifyOnly) await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      version text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
    const files = (await readdir(new URL("../db/migrations/", import.meta.url))).filter((s) => /^\d{3}_[a-z_]+\.sql$/.test(s)).sort();
    const applied = await client.query("SELECT version FROM schema_migrations");
    if (applied.rows.some((row) => !files.includes(row.version))) throw new Error("Unknown applied migration");
    for (const file of files) {
      const sql = await readFile(new URL(`../db/migrations/${file}`, import.meta.url), "utf8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const existing = await client.query("SELECT checksum FROM schema_migrations WHERE version=$1", [file]);
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== checksum) throw new Error("Applied migration checksum mismatch");
      } else {
        if (verifyOnly) throw new Error("Pending migration");
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations(version,checksum) VALUES($1,$2)", [file, checksum]);
      }
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally { await client.end(); }
}

if (process.argv[1]?.endsWith("/migrate.mjs")) {
  try { await migrate(process.env.MIGRATION_DATABASE_URL, { verifyOnly: process.argv.includes("--verify") }); console.log(process.argv.includes("--verify") ? "Migrations verified" : "Migrations applied"); }
  catch { console.error("Migration failed; no connection details or SQL payload logged"); process.exitCode = 1; }
}
