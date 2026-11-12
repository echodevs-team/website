import { submissionKeySchema, validateInquiry, type InquiryInput, type ValidationFields } from "../validation/inquiry";

export type SubmissionOutcome =
  | { kind: "success"; reference: string }
  | { kind: "invalid"; fields: ValidationFields }
  | { kind: "failure"; reason: "uncertain" | "rejected" | "limited" | "conflict" | "expired"; locked: boolean; seconds: number }
  | { kind: "ignored" };

/** Memory-only logical submission. Never rotate an uncertain key or silently
 * send edited data as a new request. A new key needs confirmed rejection or an
 * explicit new-submission action after success/conflict. */
export class InquirySubmission {
  private attempt?: { key: string; data: InquiryInput; deadline: number; uncertain: boolean };
  private controller?: AbortController;
  busy = false;
  complete = false;
  retryAt = 0;
  get locked() { return !!this.attempt; }
  reset() { if (!this.busy) { this.attempt = undefined; this.complete = false; this.retryAt = 0; } }
  cancel() { this.controller?.abort(); }
  async submit(raw: unknown, fetcher: typeof fetch = fetch): Promise<SubmissionOutcome> {
    if (this.busy || this.complete) return { kind: "ignored" };
    const seconds = Math.ceil((this.retryAt - Date.now()) / 1000);
    if (seconds > 0) return { kind: "failure", reason: "limited", locked: this.locked, seconds };
    if (this.attempt && Date.now() >= this.attempt.deadline) return { kind: "failure", reason: "expired", locked: true, seconds: 0 };
    if (!this.attempt) {
      const validation = validateInquiry(raw);
      if (!validation.data) return { kind: "invalid", fields: validation.fields };
      this.attempt = { key: crypto.randomUUID(), data: validation.data, deadline: Date.now() + 23 * 3600000, uncertain: false };
    }
    const attempt = this.attempt;
    this.busy = true;
    this.controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const result = await Promise.race([
        (async () => {
          const response = await fetcher("/api/inquiries", { method: "POST", credentials: "same-origin", cache: "no-store",
            headers: { "Content-Type": "application/json", "Idempotency-Key": attempt.key },
            body: JSON.stringify(attempt.data), signal: this.controller!.signal });
          const body = await response.json();
          return { response, body };
        })(),
        new Promise<never>((_, reject) => { timer = setTimeout(() => { this.controller?.abort(); reject(new Error("timeout")); }, 15000); }),
      ]);
      const { response, body } = result;
      if ((response.status === 201 && body?.replayed === false || response.status === 200 && body?.replayed === true) && submissionKeySchema.safeParse(body?.reference).success) {
        this.complete = true;
        return { kind: "success", reference: body.reference };
      }
      if (response.status === 409) return { kind: "failure", reason: "conflict", locked: true, seconds: 0 };
      const knownRejection = [400, 403, 413, 415, 429].includes(response.status);
      if (knownRejection && !attempt.uncertain) this.attempt = undefined;
      else attempt.uncertain = true;
      const wait = response.status === 429 ? 600 : response.status === 503 ? 30 : 0;
      const header = response.headers.get("retry-after");
      const delay = header && /^\d+$/.test(header) ? Math.min(600, Math.max(wait ? 1 : 0, Number(header))) : wait;
      this.retryAt = Date.now() + delay * 1000;
      if (response.status === 400 && body?.error === "validation_failed" && !attempt.uncertain) {
        const fields: ValidationFields = {};
        const allowed = ["fullName", "email", "phone", "service", "timeline", "description", "request"] as const;
        for (const field of allowed) if (["invalid", "required"].includes(body?.fields?.[field])) fields[field] = body.fields[field];
        return { kind: "invalid", fields: Object.keys(fields).length ? fields : { request: "invalid" } };
      }
      return { kind: "failure", reason: attempt.uncertain ? "uncertain" : response.status === 429 ? "limited" : "rejected", locked: this.locked, seconds: delay };
    } catch {
      attempt.uncertain = true;
      return { kind: "failure", reason: "uncertain", locked: true, seconds: 0 };
    } finally { clearTimeout(timer); this.busy = false; this.controller = undefined; }
  }
}
