import "server-only";
import { createHmac, randomUUID } from "node:crypto";
import type { Pool } from "pg";
import type { InquiryInput } from "../validation/inquiry";
import { consumeAttempt } from "./limits";

export class SubmissionConflict extends Error {}
export async function persistInquiry(pool: Pool, input: InquiryInput, key: string, secret: string, network: string) {
  const digest = createHmac("sha256", secret).update(JSON.stringify(input)).digest("hex");
  await consumeAttempt(pool, network, secret);
  const client = await pool.connect();
  let failed = false;
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL synchronous_commit=on");
    // Serialize by submission key, including the missing-row/expired-row case.
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [key]);
    const prior = await client.query(`SELECT inquiry_id,digest,expires_at > clock_timestamp() AS active
      FROM inquiry_submissions WHERE key=$1`, [key]);
    if (prior.rowCount && prior.rows[0].active) {
      if (prior.rows[0].digest !== digest) throw new SubmissionConflict();
      await client.query("COMMIT");
      return { reference: prior.rows[0].inquiry_id as string, replayed: true };
    }
    if (prior.rowCount) await client.query("DELETE FROM inquiry_submissions WHERE key=$1", [key]);
    const reference = randomUUID();
    await client.query(`INSERT INTO inquiries(id,full_name,email,phone,service,budget_range,timeline,description,locale,source_page)
      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [reference, input.fullName, input.email ?? null, input.phone ?? null,
      input.service, input.budgetRange ?? null, input.timeline ?? null, input.description, input.locale, input.sourcePage]);
    await client.query(`INSERT INTO inquiry_submissions(key,digest,inquiry_id,expires_at)
      VALUES($1,$2,$3,clock_timestamp()+interval '24 hours')`, [key, digest, reference]);
    await client.query("COMMIT");
    return { reference, replayed: false };
  } catch (error) {
    failed = true;
    await client.query("ROLLBACK").catch(() => {});
    // Discard on failure, including uncertain COMMIT/connection state.
    throw error;
  } finally {
    client.release(failed);
  }
}
