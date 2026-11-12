import pg from "pg";

// Removes replay metadata only, not inquiries. Run with approved scoped credentials.
// A host schedule and inquiry retention policy still require operational approval.
let client;
try {
  if (!process.env.DATABASE_URL) throw new Error("Not configured");
  client = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 3000, statement_timeout: 5000 });
  await client.connect();
  await client.query("BEGIN");
  const result = await client.query("DELETE FROM inquiry_submissions WHERE expires_at <= clock_timestamp()");
  const networks = await client.query("DELETE FROM inquiry_network_limit WHERE expires_at <= clock_timestamp()");
  await client.query("COMMIT");
  console.log(`Expired submission metadata removed: ${result.rowCount}`);
  console.log(`Expired network buckets removed: ${networks.rowCount}`);
} catch { await client?.query("ROLLBACK").catch(() => {}); console.error("Submission cleanup failed (details redacted)"); process.exitCode = 1; }
finally { await client?.end().catch(() => {}); }
