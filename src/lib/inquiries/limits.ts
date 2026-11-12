import "server-only";
import { createHmac } from "node:crypto";
import type { Pool } from "pg";

export class SubmissionLimited extends Error {}
export async function consumeAttempt(pool: Pool, identity: string, secret: string) {
  // Global cap limits new bucket cardinality. Rejected attempts are not rolled
  // back with failed writes or key conflicts; all valid retries consume quota.
  const attempt = await pool.query(`INSERT INTO inquiry_rate_limit(key,window_start,attempts)
    VALUES ('global',clock_timestamp(),1)
    ON CONFLICT (key) DO UPDATE SET
      attempts=CASE WHEN inquiry_rate_limit.window_start <= clock_timestamp()-interval '10 minutes' THEN 1 ELSE LEAST(inquiry_rate_limit.attempts+1,31) END,
      window_start=CASE WHEN inquiry_rate_limit.window_start <= clock_timestamp()-interval '10 minutes' THEN clock_timestamp() ELSE inquiry_rate_limit.window_start END
    RETURNING attempts`);
  if (attempt.rows[0].attempts > 30) throw new SubmissionLimited();
  // Bounded opportunistic expiry, plus explicit maintenance command. Raw IPs
  // never leave this function for SQL/logging; use a domain-separated HMAC.
  await pool.query(`DELETE FROM inquiry_network_limit WHERE expires_at <= clock_timestamp()
    AND key IN (SELECT key FROM inquiry_network_limit WHERE expires_at <= clock_timestamp() LIMIT 200)`);
  await pool.query(`DELETE FROM inquiry_submissions WHERE expires_at <= clock_timestamp()
    AND key IN (SELECT key FROM inquiry_submissions WHERE expires_at <= clock_timestamp() LIMIT 200)`);
  const key = createHmac("sha256", secret).update(`inquiry-network-v1\n${identity}`).digest("hex");
  const network = await pool.query(`INSERT INTO inquiry_network_limit(key,window_start,attempts,expires_at)
    VALUES($1,clock_timestamp(),1,clock_timestamp()+interval '10 minutes')
    ON CONFLICT(key) DO UPDATE SET
      attempts=CASE WHEN inquiry_network_limit.expires_at <= clock_timestamp() THEN 1 ELSE LEAST(inquiry_network_limit.attempts+1,6) END,
      window_start=CASE WHEN inquiry_network_limit.expires_at <= clock_timestamp() THEN clock_timestamp() ELSE inquiry_network_limit.window_start END,
      expires_at=CASE WHEN inquiry_network_limit.expires_at <= clock_timestamp() THEN clock_timestamp()+interval '10 minutes' ELSE inquiry_network_limit.expires_at END
    RETURNING attempts`, [key]);
  if (network.rows[0].attempts > 5) throw new SubmissionLimited();
}
