import "server-only";
import { Pool } from "pg";

let pool: Pool | undefined;
export function createInquiryPool(connectionString: string) {
  const instance = new Pool({ connectionString, max: 4, connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 10000, statement_timeout: 3000, lock_timeout: 2000,
    idle_in_transaction_session_timeout: 5000, query_timeout: 5000, allowExitOnIdle: true });
  // Idle connection failures must not crash Node or print connection details.
  instance.on("error", () => {});
  return instance;
}
export function getInquiryPool() {
  if (!process.env.DATABASE_URL) throw new Error("Storage unavailable");
  pool ??= createInquiryPool(process.env.DATABASE_URL);
  return pool;
}
