import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes, randomUUID, createHash, createCipheriv, createDecipheriv } from "node:crypto";
import { mkdtemp, readFile, stat, writeFile, chmod, symlink, access } from "node:fs/promises";
import { resolve } from "node:path";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

let owner: Pool;
let directory: string;
let restoreOwner: Pool;
const credentials: Record<string, string> = {};
const backupKey = randomBytes(32).toString("hex");
const reference = randomUUID();
const submission = randomUUID();
const marker = "synthetic-ops-only@example.invalid";
const command = (args: string[], env: Record<string, string> = {}) => spawnSync(process.execPath, ["scripts/inquiry-ops.mjs", ...args], {
  env: { ...process.env, OPERATOR_DATABASE_URL: "", ERASURE_DATABASE_URL: "", BACKUP_DATABASE_URL: "", RESTORE_DATABASE_URL: "", INQUIRY_BACKUP_KEY: backupKey, ...env }, encoding: "utf8", timeout: 15000,
});
const file = (name: string) => resolve(directory, name);
function reader(args: string[]) { return command(args, { OPERATOR_DATABASE_URL: credentials.reader }); }
function eraser(args: string[]) { return command(args, { ERASURE_DATABASE_URL: credentials.eraser }); }
function backup(args: string[]) { return command(args, { BACKUP_DATABASE_URL: credentials.backup }); }
function restore(args: string[]) { return command(args, { RESTORE_DATABASE_URL: credentials.restore }); }
function sanitized(result: ReturnType<typeof command>) {
  expect(result.stdout + result.stderr).not.toContain(marker);
  expect(result.stdout + result.stderr).not.toContain("Synthetic Ops");
  expect(result.stdout + result.stderr).not.toContain("postgresql:");
}

beforeAll(async () => {
  const source = new URL(process.env.TEST_OWNER_DATABASE_URL!);
  if (process.env.ECHO_DISPOSABLE_DB !== "echo_test" || source.pathname !== "/echo_test" || !source.searchParams.get("host")?.includes("/.local/test-pg-")) throw new Error("Disposable test runner required");
  directory = await mkdtemp(resolve(source.searchParams.get("host")!, "../ops-"));
  owner = new Pool({ connectionString: source.toString() });
  await owner.query("CREATE DATABASE echo_ops_restore");
  const target = new URL(source); target.pathname = "/echo_ops_restore";
  execFileSync(process.execPath, ["scripts/migrate.mjs"], { env: { ...process.env, MIGRATION_DATABASE_URL: target.toString() }, stdio: "pipe" });
  execFileSync(process.execPath, ["scripts/provision-inquiry-roles.mjs"], { env: { ...process.env, MIGRATION_DATABASE_URL: target.toString() }, stdio: "pipe" });
  restoreOwner = new Pool({ connectionString: target.toString() });
  for (const capability of ["reader", "eraser", "backup", "restore"]) {
    const role = `echo_test_ops_${capability}`;
    const password = randomBytes(24).toString("hex");
    // Fixed test-only role identifiers and generated hex passwords, no user SQL.
    await owner.query(`CREATE ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD '${password}'; GRANT echo_inquiry_${capability} TO ${role}`);
    const url = new URL(capability === "restore" ? target : source); url.username = role; url.password = password;
    credentials[capability] = url.toString();
  }
});
beforeEach(async () => {
  await owner.query("TRUNCATE inquiries CASCADE; TRUNCATE inquiry_rate_limit; TRUNCATE inquiry_network_limit;");
  await restoreOwner.query("TRUNCATE inquiries CASCADE; TRUNCATE inquiry_rate_limit; TRUNCATE inquiry_network_limit;");
  await owner.query(`INSERT INTO inquiries(id,full_name,email,service,description,locale,source_page)
    VALUES($1,$2,$3,'not_sure',$4,'en','/en')`, [reference, "Synthetic Ops فارسی العربية", marker, "Synthetic Ops only \u001b[31m\u202e description; never customer data."]);
  await owner.query("INSERT INTO inquiry_submissions(key,digest,inquiry_id,expires_at) VALUES($1,$2,$3,clock_timestamp()+interval '24 hours')", [submission, "a".repeat(64), reference]);
});
afterAll(async () => { await restoreOwner?.end(); await owner?.end(); });

describe("authorized local operator workflow", () => {
  it("writes private authorized detail, escapes terminal/bidi controls, never logs customer data", async () => {
    const path = file("detail.json");
    const result = reader(["show", "--id", reference, "--acknowledge-pii", "--out", path]);
    expect(result.status).toBe(0); sanitized(result);
    const text = await readFile(path, "utf8");
    expect(JSON.parse(text).inquiry.email).toBe(marker);
    expect(text).not.toContain("\u001b"); expect(text).not.toContain("\u202e");
    expect(text).toContain("\\u001b"); expect(text).toContain("\\u202e");
    expect((await stat(path)).mode & 0o777).toBe(0o600);
    expect(reader(["show", "--id", reference, "--acknowledge-pii", "--out", path]).status).toBe(1); // no overwrite
  });
  it("rejects missing, application, wrong-password and owner credentials", () => {
    const args = ["show", "--id", reference, "--acknowledge-pii", "--out", file("denied.json")];
    const bad = new URL(credentials.reader); bad.password = "synthetic-invalid";
    for (const url of [undefined, process.env.DATABASE_URL, process.env.TEST_OWNER_DATABASE_URL, bad.toString()]) {
      const result = command(args, url ? { OPERATOR_DATABASE_URL: url } : {});
      expect(result.status).toBe(1); sanitized(result);
    }
  });
  it("enforces explicit output acknowledgement, path confinement, private directories and no symlinks", async () => {
    expect(reader(["show", "--id", reference, "--out", file("no-ack.json")]).status).toBe(1);
    expect(reader(["show", "--id", reference, "--acknowledge-pii", "--out", "public/forbidden.json"]).status).toBe(1);
    const shared = file("shared");
    await import("node:fs/promises").then(({ mkdir }) => mkdir(shared, { mode: 0o755 }));
    await chmod(shared, 0o755);
    expect(reader(["show", "--id", reference, "--acknowledge-pii", "--out", resolve(shared, "data.json")]).status).toBe(1);
    const alias = file("alias"); await symlink(shared, alias);
    expect(reader(["show", "--id", reference, "--acknowledge-pii", "--out", resolve(alias, "nested", "data.json")]).status).toBe(1);
    await expect(access(resolve(shared, "nested"))).rejects.toThrow();
  });
  it("uses bounded keyset pagination with microsecond timestamps, status/locale/since filters", async () => {
    await owner.query("DELETE FROM inquiries");
    for (let i = 0; i < 5; i++) await owner.query(`INSERT INTO inquiries(id,created_at,full_name,email,service,description,locale,source_page,status)
      VALUES($1,$2,'Synthetic Ops',$3,'website','Synthetic pagination data only',$4,$5,$6)`, [randomUUID(), `2026-11-07T00:00:00.00000${i + 1}Z`, marker, i === 4 ? "fa" : "en", i === 4 ? "/fa" : "/en", i === 0 ? "closed" : "new"]);
    let cursor: string | null = null; const ids: string[] = [];
    for (let page = 0; page < 2; page++) {
      const path = file(`page-${page}.json`);
      const result = reader(["list", "--status", "new", "--locale", "en", "--limit", "2", "--since", "2026-11-07T00:00:00Z", ...(cursor ? ["--cursor", cursor] : []), "--acknowledge-pii", "--out", path]);
      expect(result.status).toBe(0); sanitized(result);
      const data = JSON.parse(await readFile(path, "utf8")); cursor = data.nextCursor;
      ids.push(...data.inquiries.map((row: { id: string }) => row.id));
      expect(data.inquiries.length).toBeLessThanOrEqual(2);
      expect(JSON.stringify(data)).not.toContain(marker);
    }
    expect(new Set(ids).size).toBe(3); expect(ids).toHaveLength(3); expect(cursor).toBeNull();
    for (const options of [["--limit", "51"], ["--limit", "0"], ["--limit", "1;DROP"], ["--status", "fake"], ["--locale", "xx"], ["--cursor", "not-json"], ["--since", "tomorrow"], ["--unknown", "1"]]) expect(reader(["list", ...options, "--acknowledge-pii", "--out", file("invalid.json")]).status).toBe(1);
  });
  it("dry-runs deletion, refuses active retries/unconfirmed apply, and cascades only eligible references", async () => {
    const preview = eraser(["delete", "--id", reference]); expect(preview.status).toBe(0);
    expect(preview.stdout).toContain("1 active replay block"); sanitized(preview);
    expect(eraser(["delete", "--id", reference, "--apply", "--confirm-id", reference]).status).toBe(1);
    await owner.query("UPDATE inquiry_submissions SET expires_at=clock_timestamp()-interval '1 second'");
    expect(eraser(["delete", "--id", reference]).status).toBe(0);
    expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("1");
    expect(eraser(["delete", "--id", reference, "--apply", "--confirm-id", randomUUID()]).status).toBe(1);
    const result = eraser(["delete", "--id", reference, "--apply", "--confirm-id", reference]);
    expect(result.status).toBe(0); sanitized(result);
    expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("0");
    expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("0");
    expect(eraser(["delete", "--id", reference, "--apply", "--confirm-id", reference]).status).toBe(0); // repeat no-op
    expect(reader(["delete", "--id", reference, "--apply", "--confirm-id", reference]).status).toBe(1);
  });
  it("gives readback no write/DDL, erasure no PII read, and app no operator capabilities", async () => {
    for (const [url, queries] of [
      [credentials.reader, ["DELETE FROM inquiries", "UPDATE inquiries SET status='closed'", "CREATE TABLE forbidden_ops(id int)", "SELECT * FROM inquiry_submissions"]],
      [credentials.eraser, ["SELECT full_name,email,description FROM inquiries", "UPDATE inquiries SET status='closed'"]],
      [process.env.DATABASE_URL!, ["SELECT * FROM inquiries", "SELECT * FROM schema_migrations"]],
    ] as const) {
      const client = new Pool({ connectionString: url });
      try { for (const query of queries) await expect(client.query(query)).rejects.toMatchObject({ code: "42501" }); }
      finally { await client.end(); }
    }
  });
  it("preserves inquiry rows when cleaning only expired temporary state", async () => {
    await owner.query("UPDATE inquiry_submissions SET expires_at=clock_timestamp()");
    await owner.query("INSERT INTO inquiry_network_limit VALUES($1,clock_timestamp(),1,clock_timestamp())", ["b".repeat(64)]);
    execFileSync(process.execPath, ["scripts/cleanup-submissions.mjs"], { env: process.env, stdio: "pipe" });
    expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("0");
    expect((await owner.query("SELECT count(*) FROM inquiry_network_limit")).rows[0].count).toBe("0");
    expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("1");
  });
  it("rolls back temporary cleanup on permission failure, then safely reruns", async () => {
    await owner.query("UPDATE inquiry_submissions SET expires_at=clock_timestamp()");
    await owner.query("INSERT INTO inquiry_network_limit VALUES($1,clock_timestamp(),1,clock_timestamp())", ["c".repeat(64)]);
    await owner.query("REVOKE DELETE ON inquiry_network_limit FROM echo_app");
    try {
      expect(() => execFileSync(process.execPath, ["scripts/cleanup-submissions.mjs"], { env: process.env, stdio: "pipe" })).toThrow();
      expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("1");
      expect((await owner.query("SELECT count(*) FROM inquiry_network_limit")).rows[0].count).toBe("1");
    } finally { await owner.query("GRANT DELETE ON inquiry_network_limit TO echo_app"); }
    execFileSync(process.execPath, ["scripts/cleanup-submissions.mjs"], { env: process.env, stdio: "pipe" });
    expect((await owner.query("SELECT count(*) FROM inquiry_submissions")).rows[0].count).toBe("0");
    expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("1");
  });
  it("encrypts and restores a compatible snapshot into an empty isolated target with Unicode intact", async () => {
    const path = file("snapshot.enc");
    const saved = backup(["backup", "--out", path]); expect(saved.status).toBe(0); sanitized(saved);
    const bytes = await readFile(path); expect(bytes.includes(Buffer.from(marker))).toBe(false);
    expect((await stat(path)).mode & 0o777).toBe(0o600);
    const result = restore(["restore", "--in", path, "--confirm-empty", "echo_ops_restore"]);
    expect(result.status).toBe(0); sanitized(result);
    const from = (await owner.query("SELECT row_to_json(i) AS data FROM inquiries i")).rows;
    const to = (await restoreOwner.query("SELECT row_to_json(i) AS data FROM inquiries i")).rows;
    expect(to).toEqual(from);
    expect((await restoreOwner.query("SELECT key,digest,inquiry_id FROM inquiry_submissions")).rows[0]).toEqual({ key: submission, digest: "a".repeat(64), inquiry_id: reference });
    expect(restore(["restore", "--in", path, "--confirm-empty", "echo_ops_restore"]).status).toBe(1); // no overwrite
  });
  it("refuses corrupted/wrong-key snapshots, missing confirmation, changed migrations and unsafe inputs", async () => {
    const path = file("validation.enc"); expect(backup(["backup", "--out", path]).status).toBe(0);
    expect(restore(["restore", "--in", path]).status).toBe(1);
    expect(restore(["restore", "--in", path, "--confirm-empty", "echo_test"]).status).toBe(1);
    expect(command(["restore", "--in", path, "--confirm-empty", "echo_ops_restore"], { RESTORE_DATABASE_URL: credentials.restore, INQUIRY_BACKUP_KEY: randomBytes(32).toString("hex") }).status).toBe(1);
    const corrupted = await readFile(path); corrupted[corrupted.length - 1] ^= 1;
    await writeFile(file("corrupted.enc"), corrupted, { mode: 0o600 });
    expect(restore(["restore", "--in", file("corrupted.enc"), "--confirm-empty", "echo_ops_restore"]).status).toBe(1);
    const migration = (await restoreOwner.query("SELECT checksum FROM schema_migrations WHERE version='002_network_limits.sql'")).rows[0].checksum;
    await restoreOwner.query("UPDATE schema_migrations SET checksum='synthetic-mismatch' WHERE version='002_network_limits.sql'");
    expect(restore(["restore", "--in", path, "--confirm-empty", "echo_ops_restore"]).status).toBe(1);
    await restoreOwner.query("UPDATE schema_migrations SET checksum=$1 WHERE version='002_network_limits.sql'", [migration]);
    expect((await restoreOwner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("0");
    expect(backup(["backup", "--out", path]).status).toBe(1);
    expect(command(["backup", "--out", file("reader-backup.enc")], { BACKUP_DATABASE_URL: credentials.reader }).status).toBe(1);
    expect(command(["restore", "--in", path, "--confirm-empty", "echo_ops_restore"], { RESTORE_DATABASE_URL: credentials.backup }).status).toBe(1);
  });
  it("rolls back the full restore when a later row violates a database constraint", async () => {
    const path = file("constraint-source.enc"); expect(backup(["backup", "--out", path]).status).toBe(0);
    const bytes = await readFile(path); const magic = Buffer.from("ECHO-INQUIRY-BACKUP-1\n");
    const decipher = createDecipheriv("aes-256-gcm", Buffer.from(backupKey, "hex"), bytes.subarray(magic.length, magic.length + 12));
    decipher.setAAD(magic); decipher.setAuthTag(bytes.subarray(magic.length + 12, magic.length + 28));
    const archive = JSON.parse(Buffer.concat([decipher.update(bytes.subarray(magic.length + 28)), decipher.final()]).toString("utf8"));
    archive.tables.inquiry_submissions[0].inquiry_id = randomUUID();
    const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", Buffer.from(backupKey, "hex"), iv); cipher.setAAD(magic);
    const ciphertext = Buffer.concat([cipher.update(JSON.stringify(archive)), cipher.final()]);
    const modified = file("constraint-modified.enc");
    await writeFile(modified, Buffer.concat([magic, iv, cipher.getAuthTag(), ciphertext]), { mode: 0o600 });
    const result = restore(["restore", "--in", modified, "--confirm-empty", "echo_ops_restore"]);
    expect(result.status).toBe(1); sanitized(result);
    expect(result.stderr).not.toContain("foreign key");
    expect((await restoreOwner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("0");
  });
  it("verifies migration compatibility without applying changes and refuses unknown history", async () => {
    const env = { ...process.env, MIGRATION_DATABASE_URL: process.env.TEST_OWNER_DATABASE_URL };
    expect(execFileSync(process.execPath, ["scripts/migrate.mjs", "--verify"], { env, encoding: "utf8" })).toContain("verified");
    await owner.query("INSERT INTO schema_migrations(version,checksum) VALUES('999_unknown.sql','synthetic')");
    try {
      for (const args of [["scripts/migrate.mjs", "--verify"], ["scripts/migrate.mjs"]]) expect(() => execFileSync(process.execPath, args, { env, stdio: "pipe" })).toThrow();
    } finally { await owner.query("DELETE FROM schema_migrations WHERE version='999_unknown.sql'"); }
    expect((await owner.query("SELECT count(*) FROM inquiries")).rows[0].count).toBe("1");
  });
  it("bounds backup size by row count and refuses export beyond the local snapshot budget", async () => {
    await owner.query(`INSERT INTO inquiries(id,full_name,email,service,description,locale,source_page)
      SELECT gen_random_uuid(),'Synthetic Ops',$1,'website','Synthetic row budget testing only','en','/en' FROM generate_series(1,1000)`, [marker]);
    const result = backup(["backup", "--out", file("oversized.enc")]);
    expect(result.status).toBe(1); sanitized(result);
    await expect(access(file("oversized.enc"))).rejects.toThrow();
  });
  it("generates private non-overwritten backup keys, and redacts database failure errors", async () => {
    const key = file("key.env"); expect(command(["keygen", "--out", key]).status).toBe(0);
    const before = createHash("sha256").update(await readFile(key)).digest("hex");
    expect(command(["keygen", "--out", key]).status).toBe(1);
    expect(createHash("sha256").update(await readFile(key)).digest("hex")).toBe(before);
    const missing = new URL(credentials.reader); missing.searchParams.set("host", resolve(directory, "missing-socket"));
    const result = command(["list", "--acknowledge-pii", "--out", file("unavailable.json")], { OPERATOR_DATABASE_URL: missing.toString() });
    expect(result.status).toBe(1); sanitized(result);
    expect(result.stderr).not.toContain("ENOENT"); expect(result.stderr).not.toContain("SELECT");
    const unavailable = new URL(credentials.reader); unavailable.port = "5433";
    const failedConnection = command(["list", "--acknowledge-pii", "--out", file("connection-failure.json")], { OPERATOR_DATABASE_URL: unavailable.toString() });
    expect(failedConnection.status).toBe(1); sanitized(failedConnection);
    expect(failedConnection.stderr).not.toContain("ECONN"); expect(failedConnection.stderr).not.toContain("ENOENT");
  });
});
