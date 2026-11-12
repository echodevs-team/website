import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { InquirySubmission } from "../../src/lib/inquiries/client";

const input = { fullName: "Synthetic Client", email: "client@example.invalid", service: "not_sure", description: "Synthetic client-side inquiry for tests only.", locale: "en", sourcePage: "/en" };
const ok = () => Response.json({ reference: randomUUID(), replayed: false }, { status: 201 });
afterEach(() => vi.useRealTimers());
describe("memory-only logical inquiry", () => {
  it("validates locally before fetch and rejects unconfirmed success bodies", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ success: true }));
    const session = new InquirySubmission();
    expect((await session.submit({ ...input, description: "short" }, fetcher)).kind).toBe("invalid");
    expect(fetcher).not.toHaveBeenCalled();
    expect(await session.submit(input, fetcher)).toMatchObject({ kind: "failure", reason: "uncertain", locked: true });
  });
  it("blocks double submit synchronously, retains success and rotates only for explicit new intent", async () => {
    let resolve!: (value: Response) => void;
    const fetcher = vi.fn<typeof fetch>().mockImplementationOnce(() => new Promise((r) => { resolve = r; })).mockResolvedValueOnce(ok());
    const session = new InquirySubmission();
    const first = session.submit(input, fetcher);
    expect((await session.submit(input, fetcher)).kind).toBe("ignored");
    resolve(ok()); expect((await first).kind).toBe("success");
    expect((await session.submit(input, fetcher)).kind).toBe("ignored");
    session.reset(); expect((await session.submit(input, fetcher)).kind).toBe("success");
    const keys = fetcher.mock.calls.map(([, init]) => new Headers(init?.headers).get("idempotency-key"));
    expect(keys[0]).not.toBe(keys[1]);
  });
  it("times out, freezes payload and reuses the same key even if edited data is passed", async () => {
    vi.useFakeTimers();
    const reference = randomUUID();
    const fetcher = vi.fn<typeof fetch>().mockImplementationOnce(() => new Promise(() => {})).mockResolvedValueOnce(Response.json({ reference, replayed: true }));
    const session = new InquirySubmission();
    const first = session.submit(input, fetcher);
    await vi.advanceTimersByTimeAsync(15001);
    expect(await first).toMatchObject({ kind: "failure", reason: "uncertain", locked: true });
    expect(await session.submit({ ...input, fullName: "Changed" }, fetcher)).toEqual({ kind: "success", reference });
    expect(fetcher.mock.calls[0][1]?.body).toBe(fetcher.mock.calls[1][1]?.body);
    expect(fetcher.mock.calls[0][1]?.headers).toEqual(fetcher.mock.calls[1][1]?.headers);
  });
  it("never rotates an uncertain key when a later attempt gets validation rejection", async () => {
    const fetcher = vi.fn<typeof fetch>().mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(Response.json({ error: "validation_failed", fields: { email: "invalid" } }, { status: 400 }));
    const session = new InquirySubmission();
    await session.submit(input, fetcher);
    expect(await session.submit(input, fetcher)).toMatchObject({ kind: "failure", reason: "uncertain", locked: true });
  });
  it("lets confirmed rejection be corrected, handles conflicts without automatic resend", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ error: "validation_failed", fields: { email: "invalid", injected: "invalid" } }, { status: 400 }))
      .mockResolvedValueOnce(Response.json({ error: "submission_conflict" }, { status: 409 }));
    const session = new InquirySubmission();
    expect(await session.submit(input, fetcher)).toEqual({ kind: "invalid", fields: { email: "invalid" } });
    expect(session.locked).toBe(false);
    expect(await session.submit(input, fetcher)).toMatchObject({ kind: "failure", reason: "conflict", locked: true });
    expect(fetcher.mock.calls[0][1]?.headers).not.toEqual(fetcher.mock.calls[1][1]?.headers);
  });
  it("honors bounded Retry-After and refuses automatic retry beyond the safe replay window", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(Response.json({ error: "rate_limited" }, { status: 429, headers: { "retry-after": "600" } }))
      .mockRejectedValueOnce(new Error("network"));
    const session = new InquirySubmission();
    expect(await session.submit(input, fetcher)).toMatchObject({ reason: "limited", seconds: 600 });
    await session.submit(input, fetcher); expect(fetcher).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(600001); await session.submit(input, fetcher);
    await vi.advanceTimersByTimeAsync(23 * 3600000);
    expect(await session.submit(input, fetcher)).toMatchObject({ reason: "expired", locked: true });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
