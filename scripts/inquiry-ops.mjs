import { constants } from "node:fs";
import { open, mkdir, realpath, stat } from "node:fs/promises";
import { resolve, dirname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash, createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import pg from "pg";

const root = fileURLToPath(new URL("../", import.meta.url));
const local = resolve(root, ".local");
const maxBytes = 16 * 1024 * 1024;
const rowCap = 1000;
const magic = Buffer.from("ECHO-INQUIRY-BACKUP-1\n");
const tables = {
  inquiries: ["id", "created_at", "updated_at", "full_name", "email", "phone", "service", "budget_range", "timeline", "description", "locale", "source_page", "status"],
  inquiry_submissions: ["key", "digest", "inquiry_id", "expires_at"],
  inquiry_rate_limit: ["key", "window_start", "attempts"],
  inquiry_network_limit: ["key", "window_start", "attempts", "expires_at"],
};
const roles = { list: "reader", show: "reader", delete: "eraser", backup: "backup", restore: "restore" };
const envNames = { reader: "OPERATOR_DATABASE_URL", eraser: "ERASURE_DATABASE_URL", backup: "BACKUP_DATABASE_URL", restore: "RESTORE_DATABASE_URL" };
const uuid = (s) => typeof s === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
const timestamp = (s) => typeof s === "string" && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,6})?Z$/.test(s) && Number.isFinite(Date.parse(s));
const statuses = ["new", "contacted", "qualified", "closed", "spam"];
const timeSql = `to_char(created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`;

function options(args) {
  const output = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!/^--[a-z-]+$/.test(key) || key in output) throw new Error("Invalid arguments");
    output[key] = ["--apply", "--acknowledge-pii"].includes(key) ? true : args[++i];
    if (output[key] === undefined) throw new Error("Missing argument");
  }
  return output;
}
function allowed(opts, keys) {
  if (Object.keys(opts).some((key) => !keys.includes(key))) throw new Error("Unknown option");
}
function safeJson(value) {
  // JSON escapes terminal controls/line breaks. Also neutralize bidi overrides
  // and isolates for inspection, without changing original stored Unicode.
  return JSON.stringify(value, null, 2).replace(/[\u007f-\u009f\u061c\u200e\u200f\u2028-\u202e\u2066-\u2069]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")) + "\n";
}
async function privatePath(path, createParent = false) {
  if (typeof path !== "string") throw new Error("Private file required");
  const absolute = resolve(root, path);
  if (!absolute.startsWith(local + sep)) throw new Error("Use a project-local private file");
  // Check each component before creating the next; never mkdir through a symlink.
  const components = [local, ...dirname(absolute).slice(local.length + 1).split(sep).filter(Boolean)];
  let current = "";
  for (const component of components) {
    current = current ? resolve(current, component) : component;
    if (createParent) await mkdir(current, { mode: 0o700 }).catch((e) => { if (e.code !== "EEXIST") throw e; });
    if (await realpath(current) !== current) throw new Error("Symlink directory refused");
    const info = await stat(current);
    if (info.uid !== process.getuid() || (info.mode & 0o077)) throw new Error("Private directory required");
  }
  return absolute;
}
async function writePrivate(path, value) {
  const target = await privatePath(path, true);
  const file = await open(target, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { await file.writeFile(value); await file.sync(); }
  finally { await file.close(); }
  const parent = await open(dirname(target), constants.O_RDONLY | constants.O_DIRECTORY);
  try { await parent.sync(); } finally { await parent.close(); }
}
async function readPrivate(path) {
  const target = await privatePath(path);
  const file = await open(target, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const info = await file.stat();
    if (!info.isFile() || info.uid !== process.getuid() || (info.mode & 0o077) || info.size > maxBytes + 100) throw new Error("Unsafe file");
    const bytes = await file.readFile();
    if (bytes.length > maxBytes + 100) throw new Error("Oversized file");
    return bytes;
  } finally { await file.close(); }
}
async function connect(role) {
  const configured = process.env[envNames[role]];
  if (!configured) throw new Error("Dedicated credential required");
  const url = new URL(configured);
  const socket = url.searchParams.get("host");
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !socket || !socket.startsWith(local + sep) || !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)) throw new Error("Private local socket required");
  const actual = await realpath(socket);
  if (!actual.startsWith(local + sep) || (await stat(actual)).mode & 0o077) throw new Error("Unsafe socket directory");
  const client = new pg.Client({ connectionString: configured, connectionTimeoutMillis: 3000,
    statement_timeout: 5000, lock_timeout: 2000, idle_in_transaction_session_timeout: 10000 });
  await client.connect();
  try {
    const identity = (await client.query(`SELECT r.rolsuper,r.rolcreatedb,r.rolcreaterole,r.rolbypassrls,
      pg_has_role(current_user,$1,'USAGE') AS authorized,
      pg_get_userbyid(c.relowner)=current_user AS owns_data
      FROM pg_roles r JOIN pg_class c ON c.oid='public.inquiries'::regclass WHERE r.rolname=current_user`, [`echo_inquiry_${role}`])).rows[0];
    if (!identity?.authorized || identity.rolsuper || identity.rolcreatedb || identity.rolcreaterole || identity.rolbypassrls || identity.owns_data) throw new Error("Least-privilege membership required");
    return client;
  } catch (error) { await client.end(); throw error; }
}
async function migrationVersions() {
  const files = (await readdir(new URL("../db/migrations/", import.meta.url))).filter((s) => /^\d{3}_[a-z_]+\.sql$/.test(s)).sort();
  return Promise.all(files.map(async (version) => ({ version, checksum: createHash("sha256").update(await readFile(new URL(`../db/migrations/${version}`, import.meta.url))).digest("hex") })));
}
const canonicalVersions = (rows) => rows.map(({ version, checksum }) => ({ version, checksum })).sort((a, b) => a.version.localeCompare(b.version));
function backupKey() {
  if (!/^[a-f0-9]{64}$/i.test(process.env.INQUIRY_BACKUP_KEY ?? "")) throw new Error("Independent backup key required");
  return Buffer.from(process.env.INQUIRY_BACKUP_KEY, "hex");
}

async function execute(command, opts) {
  if (command === "keygen") {
    allowed(opts, ["--out"]);
    await writePrivate(opts["--out"], `INQUIRY_BACKUP_KEY=${randomBytes(32).toString("hex")}\n`);
    return "Private backup key created (contents withheld)";
  }
  if (!Object.hasOwn(roles, command)) throw new Error("Unknown command");
  const common = command === "list" || command === "show" ? ["--out", "--acknowledge-pii"] : [];
  allowed(opts, [...common, ...({ list: ["--limit", "--status", "--locale", "--cursor", "--since"], show: ["--id"], delete: ["--id", "--apply", "--confirm-id"], backup: ["--out"], restore: ["--in", "--confirm-empty"] })[command]]);
  if (common.length && (!opts["--out"] || !opts["--acknowledge-pii"])) throw new Error("Explicit private PII output required");
  if (command === "show" || command === "delete") if (!uuid(opts["--id"])) throw new Error("Valid reference required");
  const client = await connect(roles[command]);
  try {
    if (command === "list") {
      const limit = opts["--limit"] ?? "20";
      const status = opts["--status"] ?? "new";
      if (!/^\d{1,2}$/.test(limit) || Number(limit) < 1 || Number(limit) > 50 || ![...statuses, "all"].includes(status)) throw new Error("Invalid bounds/filter");
      if (opts["--locale"] && !["fa", "en", "ar"].includes(opts["--locale"])) throw new Error("Invalid locale");
      const params = []; const conditions = [];
      const parameter = (value) => { params.push(value); return `$${params.length}`; };
      if (status !== "all") conditions.push(`status=${parameter(status)}`);
      if (opts["--locale"]) conditions.push(`locale=${parameter(opts["--locale"])}`);
      if (opts["--since"]) {
        if (!timestamp(opts["--since"])) throw new Error("Invalid timestamp");
        conditions.push(`created_at >= ${parameter(opts["--since"])}::timestamptz`);
      }
      if (opts["--cursor"]) {
        if (opts["--cursor"].length > 200) throw new Error("Invalid cursor");
        const cursor = JSON.parse(Buffer.from(opts["--cursor"], "base64url").toString("utf8"));
        if (!Array.isArray(cursor) || cursor.length !== 2 || !timestamp(cursor[0]) || !uuid(cursor[1])) throw new Error("Invalid cursor");
        conditions.push(`(created_at,id) < (${parameter(cursor[0])}::timestamptz,${parameter(cursor[1])}::uuid)`);
      }
      const result = await client.query(`SELECT id,${timeSql} AS created_at,status,service,locale FROM inquiries
        ${conditions.length ? "WHERE " + conditions.join(" AND ") : ""} ORDER BY created_at DESC,id DESC LIMIT ${parameter(Number(limit) + 1)}`, params);
      const rows = result.rows.slice(0, Number(limit));
      const last = rows.at(-1);
      const nextCursor = result.rows.length > Number(limit) ? Buffer.from(JSON.stringify([last.created_at, last.id])).toString("base64url") : null;
      await writePrivate(opts["--out"], safeJson({ inquiries: rows, nextCursor }));
      return "Private inquiry list written (contents withheld)";
    }
    if (command === "show") {
      const result = await client.query("SELECT * FROM inquiries WHERE id=$1", [opts["--id"]]);
      await writePrivate(opts["--out"], safeJson({ inquiry: result.rows[0] ?? null }));
      return "Private inquiry detail written (contents withheld)";
    }
    if (command === "delete") {
      if (opts["--apply"] && opts["--confirm-id"] !== opts["--id"]) throw new Error("Exact reference confirmation required");
      await client.query("BEGIN");
      // Brief table lock avoids granting UPDATE just to acquire a row lock.
      await client.query("LOCK TABLE inquiries IN SHARE ROW EXCLUSIVE MODE");
      const found = await client.query("SELECT id FROM inquiries WHERE id=$1", [opts["--id"]]);
      const active = await client.query("SELECT 1 FROM inquiry_submissions WHERE inquiry_id=$1 AND expires_at > clock_timestamp() LIMIT 1", [opts["--id"]]);
      if (!opts["--apply"]) {
        await client.query("ROLLBACK");
        return `Deletion dry run: ${found.rowCount} record(s), ${active.rowCount} active replay block(s); no data changed`;
      }
      if (active.rowCount) throw new Error("Active replay window; deletion refused");
      const deleted = await client.query("DELETE FROM inquiries WHERE id=$1", [opts["--id"]]);
      await client.query("COMMIT");
      return `Deleted ${deleted.rowCount} inquiry record(s); dependent replay metadata cascaded`;
    }
    if (command === "backup") {
      const key = backupKey();
      await client.query("BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY");
      const versions = canonicalVersions((await client.query("SELECT version,checksum FROM schema_migrations")).rows);
      if (JSON.stringify(versions) !== JSON.stringify(await migrationVersions())) throw new Error("Migration mismatch");
      const archive = { version: 1, createdAt: new Date().toISOString(), migrations: versions, tables: {} };
      for (const table of Object.keys(tables)) {
        // PostgreSQL JSON preserves timestamp microseconds, unlike JS Date decoding.
        const rows = (await client.query(`SELECT row_to_json(t) AS item FROM (SELECT * FROM ${table} LIMIT ${rowCap + 1}) t`)).rows.map((r) => r.item);
        if (rows.length > rowCap) throw new Error("Local backup row cap exceeded");
        archive.tables[table] = rows;
      }
      const plaintext = Buffer.from(JSON.stringify(archive));
      if (plaintext.length > maxBytes) throw new Error("Local backup size cap exceeded");
      await client.query("COMMIT");
      const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key, iv);
      cipher.setAAD(magic);
      const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
      await writePrivate(opts["--out"], Buffer.concat([magic, iv, cipher.getAuthTag(), ciphertext]));
      return "Encrypted inquiry snapshot written (key and contents withheld)";
    }
    if (command === "restore") {
      const key = backupKey();
      const encrypted = await readPrivate(opts["--in"]);
      if (!encrypted.subarray(0, magic.length).equals(magic)) throw new Error("Invalid archive");
      const start = magic.length;
      const decipher = createDecipheriv("aes-256-gcm", key, encrypted.subarray(start, start + 12));
      decipher.setAAD(magic); decipher.setAuthTag(encrypted.subarray(start + 12, start + 28));
      const archive = JSON.parse(Buffer.concat([decipher.update(encrypted.subarray(start + 28)), decipher.final()]).toString("utf8"));
      if (archive.version !== 1 || JSON.stringify(canonicalVersions(archive.migrations)) !== JSON.stringify(await migrationVersions()) || Object.keys(archive.tables).sort().join() !== Object.keys(tables).sort().join()) throw new Error("Archive schema mismatch");
      await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
      await client.query("LOCK TABLE inquiries,inquiry_submissions,inquiry_rate_limit,inquiry_network_limit IN EXCLUSIVE MODE");
      const database = (await client.query("SELECT current_database() AS name")).rows[0].name;
      if (!opts["--confirm-empty"] || opts["--confirm-empty"] !== database) throw new Error("Exact empty target confirmation required");
      // MAINTAIN permits locking without granting DELETE/TRUNCATE/DDL.
      const versions = canonicalVersions((await client.query("SELECT version,checksum FROM schema_migrations")).rows);
      if (JSON.stringify(versions) !== JSON.stringify(archive.migrations)) throw new Error("Target migrations differ");
      for (const table of Object.keys(tables)) if ((await client.query(`SELECT 1 FROM ${table} LIMIT 1`)).rowCount) throw new Error("Restore refuses nonempty target");
      for (const [table, columns] of Object.entries(tables)) {
        const rows = archive.tables[table];
        if (!Array.isArray(rows) || rows.length > rowCap) throw new Error("Invalid archive rows");
        for (const row of rows) {
          if (Object.keys(row).sort().join() !== [...columns].sort().join()) throw new Error("Unknown archive field");
          await client.query(`INSERT INTO ${table}(${columns.join(",")}) VALUES(${columns.map((_, i) => `$${i + 1}`).join(",")})`, columns.map((name) => row[name]));
        }
      }
      await client.query("COMMIT");
      return "Inquiry snapshot restored into confirmed empty target";
    }
  } catch (error) { await client.query("ROLLBACK").catch(() => {}); throw error; }
  finally { await client.end(); }
}

try {
  const result = await execute(process.argv[2], options(process.argv.slice(3)));
  console.log(result);
} catch {
  // Do not echo arguments, paths, SQL errors, credentials or customer payloads.
  console.error("Inquiry operation refused or unavailable. Check authorization, private files, bounds, replay window and runbook; details withheld.");
  process.exitCode = 1;
}
