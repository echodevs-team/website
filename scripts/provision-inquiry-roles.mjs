import pg from "pg";
import { fileURLToPath } from "node:url";

// Capability groups, not operator identities. Grant membership to approved
// individual logins separately; never grant these groups to echo_app.
export async function provisionInquiryRoles(connectionString) {
  if (!connectionString) throw new Error("Owner configuration required");
  const client = new pg.Client({ connectionString, connectionTimeoutMillis: 3000, statement_timeout: 5000 });
  await client.connect();
  try {
    await client.query("BEGIN; SELECT pg_advisory_xact_lock(734902)");
    for (const role of ["echo_inquiry_reader", "echo_inquiry_eraser", "echo_inquiry_backup", "echo_inquiry_restore"]) {
      const existing = await client.query("SELECT rolcanlogin,rolsuper,rolcreaterole,rolcreatedb,rolbypassrls FROM pg_roles WHERE rolname=$1", [role]);
      if (existing.rowCount) {
        if (Object.values(existing.rows[0]).some(Boolean)) throw new Error("Conflicting capability role");
      } else await client.query(`CREATE ROLE ${role} NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS`);
      await client.query(`GRANT USAGE ON SCHEMA public TO ${role}; REVOKE ALL ON ALL TABLES IN SCHEMA public FROM ${role}`);
    }
    await client.query(`
      GRANT SELECT ON inquiries TO echo_inquiry_reader;
      GRANT SELECT(id), DELETE ON inquiries TO echo_inquiry_eraser;
      GRANT SELECT(inquiry_id,expires_at) ON inquiry_submissions TO echo_inquiry_eraser;
      GRANT SELECT ON inquiries,inquiry_submissions,inquiry_rate_limit,inquiry_network_limit,schema_migrations TO echo_inquiry_backup;
      GRANT SELECT, INSERT, MAINTAIN ON inquiries,inquiry_submissions,inquiry_rate_limit,inquiry_network_limit TO echo_inquiry_restore;
      GRANT SELECT ON schema_migrations TO echo_inquiry_restore;`);
    const db = (await client.query("SELECT current_database() AS name")).rows[0].name;
    // Identifier comes from PostgreSQL, quoted defensively, never from CLI SQL.
    await client.query(`GRANT CONNECT ON DATABASE "${db.replaceAll('"', '""')}" TO echo_inquiry_reader,echo_inquiry_eraser,echo_inquiry_backup,echo_inquiry_restore`);
    await client.query("COMMIT");
  } catch (error) { await client.query("ROLLBACK").catch(() => {}); throw error; }
  finally { await client.end(); }
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { await provisionInquiryRoles(process.env.MIGRATION_DATABASE_URL); console.log("Inquiry capability groups provisioned; no operator login or membership created"); }
  catch { console.error("Capability provisioning failed (details withheld)"); process.exitCode = 1; }
}
