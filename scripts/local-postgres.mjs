import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdir, mkdtemp, readFile, writeFile, symlink, realpath } from "node:fs/promises";
import { resolve, dirname, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { migrate } from "./migrate.mjs";
import { provisionInquiryRoles } from "./provision-inquiry-roles.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const native = resolve(root, "node_modules/@embedded-postgres/linux-x64");
// Recreate only reviewed, package-local library aliases (npm scripts disabled).
async function binaries() {
  const links = JSON.parse(await readFile(resolve(native, "native/pg-symlinks.json"), "utf8"));
  for (const { source, target } of links) {
    if (!/^native\/lib\/[\w.-]+$/.test(source) || !/^native\/lib\/[\w.-]+$/.test(target)) throw new Error("Unsafe binary alias");
    const sourcePath = await realpath(resolve(native, source));
    if (!sourcePath.startsWith(native + sep)) throw new Error("Unsafe library target");
    await symlink(relative(dirname(resolve(native, target)), sourcePath), resolve(native, target)).catch((e) => { if (e.code !== "EEXIST") throw e; });
  }
}
const quote = (s) => `'${s.replaceAll("'", "''")}'`;
export async function startLocalPostgres({ test = false } = {}) {
  await binaries();
  const base = resolve(root, ".local");
  await mkdir(base, { recursive: true, mode: 0o700 });
  const directory = test ? await mkdtemp(resolve(base, "test-pg-")) : resolve(base, "dev-pg");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const socket = resolve(directory, "socket");
  await mkdir(socket, { recursive: true, mode: 0o700 });
  const data = resolve(directory, "data");
  try { await readFile(resolve(data, "postmaster.pid")); throw new Error("Cluster already running; do not modify it"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  // No TCP listener at all. Unix socket directory is accessible only to worker1.
  try { await readFile(resolve(data, "PG_VERSION")); }
  catch (error) { if (error.code !== "ENOENT") throw error; execFileSync(resolve(native, "native/bin/initdb"), ["-D", data, "-U", "echo_owner", "--encoding=UTF8", "--locale=C", "--auth-local=trust", "--auth-host=reject"], { stdio: "ignore" }); }
  // Only this OS-user-private owner socket uses trust. Application logins must
  // authenticate with SCRAM; there is deliberately no TCP authentication path.
  await writeFile(resolve(data, "pg_hba.conf"), "local all echo_owner trust\nlocal all all scram-sha-256\nhost all all 0.0.0.0/0 reject\nhost all all ::/0 reject\n", { mode: 0o600 });
  execFileSync(resolve(native, "native/bin/pg_ctl"), ["-D", data, "-o", `-h '' -k '${socket}' -c unix_socket_permissions=0700 -c fsync=on -c synchronous_commit=on -c log_statement=none -c log_min_error_statement=panic -c log_error_verbosity=terse -c log_parameter_max_length=0 -c log_parameter_max_length_on_error=0`, "-l", resolve(directory, "postgres.log"), "-w", "start"], { stdio: "ignore" });
  let stopped = false;
  const stop = () => { if (!stopped) { stopped = true; execFileSync(resolve(native, "native/bin/pg_ctl"), ["-D", data, "-m", "fast", "-w", "stop"], { stdio: "ignore" }); } };
  const url = (user, password, db) => `postgresql://${user}:${password}@localhost/${db}?host=${encodeURIComponent(socket)}`;
  const database = test ? "echo_test" : "echo_dev";
  const ownerUrl = url("echo_owner", "", database);
  try {
    const admin = new pg.Client({ connectionString: url("echo_owner", "", "postgres") });
    await admin.connect();
    try {
      if (!(await admin.query("SELECT 1 FROM pg_database WHERE datname=$1", [database])).rowCount) await admin.query(`CREATE DATABASE ${database}`);
      const password = randomBytes(24).toString("hex");
      if (!(await admin.query("SELECT 1 FROM pg_roles WHERE rolname='echo_app'")).rowCount) await admin.query(`CREATE ROLE echo_app LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT PASSWORD ${quote(password)}`);
      else await admin.query(`ALTER ROLE echo_app PASSWORD ${quote(password)}`);
      await migrate(ownerUrl);
      await provisionInquiryRoles(ownerUrl);
      const owner = new pg.Client({ connectionString: ownerUrl });
      await owner.connect();
      try {
        await owner.query(`REVOKE ALL ON DATABASE ${database} FROM PUBLIC; GRANT CONNECT ON DATABASE ${database} TO echo_app;
          REVOKE CREATE ON SCHEMA public FROM PUBLIC; GRANT USAGE ON SCHEMA public TO echo_app;
          REVOKE ALL ON ALL TABLES IN SCHEMA public FROM echo_app;
          GRANT INSERT ON inquiries TO echo_app;
          GRANT SELECT, INSERT, UPDATE, DELETE ON inquiry_submissions TO echo_app;
          GRANT SELECT, INSERT, UPDATE ON inquiry_rate_limit TO echo_app;`);
        await owner.query("GRANT SELECT, INSERT, UPDATE, DELETE ON inquiry_network_limit TO echo_app");
      } finally { await owner.end(); }
      return { directory, stop, ownerUrl, appUrl: url("echo_app", password, database), database };
    } finally { await admin.end(); }
  } catch (error) { stop(); throw error; }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let cluster;
  try {
    if (process.argv[2] !== "dev") throw new Error("Use dev subcommand");
    cluster = await startLocalPostgres();
    const secretPath = resolve(cluster.directory, "digest.key");
    await writeFile(secretPath, randomBytes(32).toString("hex"), { mode: 0o600, flag: "wx" }).catch((e) => { if (e.code !== "EEXIST") throw e; });
    const secret = await readFile(secretPath, "utf8");
    if (!/^[0-9a-f]{64}$/.test(secret)) throw new Error("Invalid local digest key");
    await writeFile(resolve(cluster.directory, "app.env"), `DATABASE_URL=${cluster.appUrl}\nINQUIRIES_ENABLED=false\nINQUIRY_NETWORK_MODE=loopback\nINQUIRY_ORIGIN=http://127.0.0.1:3000\nINQUIRY_DIGEST_SECRET=${secret}\n`, { mode: 0o600 });
    await writeFile(resolve(cluster.directory, "owner.env"), `MIGRATION_DATABASE_URL=${cluster.ownerUrl}\n`, { mode: 0o600 });
    console.log("Local PostgreSQL ready via private Unix socket; inquiry API remains disabled. Ctrl-C stops it.");
    const stop = () => { cluster.stop(); process.exit(0); };
    process.once("SIGINT", stop); process.once("SIGTERM", stop);
    // Keep only this foreground session alive; never create a persistent service.
    await new Promise(() => { setInterval(() => {}, 60000); });
  } catch { cluster?.stop(); console.error("Local PostgreSQL setup failed (details redacted)"); process.exitCode = 1; }
}
