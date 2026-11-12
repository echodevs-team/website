import "server-only";
import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { submissionKeySchema, validateInquiry } from "../validation/inquiry";
import { persistInquiry, SubmissionConflict } from "./store";
import { SubmissionLimited } from "./limits";
import { resolveNetwork, type NetworkConfig } from "./network";

const maximumBodyBytes = 32768;
class BodyFailure extends Error { constructor(public status: number, public code: string) { super(code); } }
async function readJson(request: Request) {
  const length = request.headers.get("content-length");
  if (length && (!/^\d+$/.test(length) || Number(length) > maximumBodyBytes)) throw new BodyFailure(413, "too_large");
  if (!request.body) throw new BodyFailure(400, "invalid_json");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  const deadline = Date.now() + 5000;
  try {
    while (true) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      const result = await Promise.race([reader.read(), new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new BodyFailure(408, "request_timeout")), Math.max(1, deadline - Date.now()));
      })]).finally(() => clearTimeout(timer));
      if (result.done) break;
      size += result.value.byteLength;
      if (size > maximumBodyBytes) throw new BodyFailure(413, "too_large");
      chunks.push(result.value);
    }
    try { return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))); }
    catch { throw new BodyFailure(400, "invalid_json"); }
  } finally { void reader.cancel().catch(() => {}); }
}

export type InquiryConfig = { enabled: boolean; origin?: string; secret?: string; pool: () => Pool; network?: NetworkConfig };
export async function handleInquiry(request: Request, config: InquiryConfig) {
  const requestId = randomUUID();
  const respond = (status: number, body: object, extra: Record<string, string> = {}) => Response.json(body, {
    status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "X-Request-ID": requestId, ...extra },
  });
  if (!config.enabled) return respond(503, { error: "unavailable" });
  try {
    if (!config.origin || new URL(config.origin).origin !== config.origin || !["http:", "https:"].includes(new URL(config.origin).protocol) || !config.secret || config.secret.length < 32) throw new Error("Configuration unavailable");
    if (request.headers.get("origin") !== config.origin || request.headers.get("sec-fetch-site") === "cross-site") return respond(403, { error: "origin_refused" });
    if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get("content-type") ?? "") || request.headers.has("content-encoding")) return respond(415, { error: "unsupported_media_type" });
    const key = submissionKeySchema.safeParse(request.headers.get("idempotency-key"));
    if (!key.success) return respond(400, { error: "invalid_submission_key" });
    const validation = validateInquiry(await readJson(request));
    if (!validation.data) return respond(400, { error: "validation_failed", fields: validation.fields });
    const network = resolveNetwork(request, config.network ?? {}, key.data, config.origin);
    const saved = await persistInquiry(config.pool(), validation.data, key.data, config.secret, network);
    return respond(saved.replayed ? 200 : 201, saved);
  } catch (error) {
    if (error instanceof BodyFailure) return respond(error.status, { error: error.code });
    if (error instanceof SubmissionConflict) return respond(409, { error: "submission_conflict" });
    if (error instanceof SubmissionLimited) return respond(429, { error: "rate_limited" }, { "Retry-After": "600" });
    // No exception/payload/connection-string logging or echoing.
    return respond(503, { error: "unavailable" }, { "Retry-After": "30" });
  }
}
