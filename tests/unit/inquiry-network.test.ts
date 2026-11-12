import { createHmac, randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { networkIdentity, resolveNetwork } from "../../src/lib/inquiries/network";

const secret = "synthetic-proxy-secret-for-tests-only";
const origin = "http://127.0.0.1:3000";
describe("trusted network resolution", () => {
  it.each([
    ["192.0.2.1", "192.0.2.1"], ["::ffff:192.0.2.1", "192.0.2.1"], ["0:0:0:0:0:ffff:c000:201", "192.0.2.1"],
    ["2001:db8:abcd:12::1", "2001:0db8:abcd:0012::/64"], ["2001:DB8:ABCD:12:1234:5678:9abc:def0", "2001:0db8:abcd:0012::/64"],
    ["::1", "0000:0000:0000:0000::/64"],
  ])("canonicalizes %s", (ip, expected) => expect(networkIdentity(ip)).toBe(expected));
  it.each(["192.0.2.1, 192.0.2.2", "192.000.2.1", "[::1]", "fe80::1%eth0", "example.invalid", "", "256.1.1.1"])("rejects ambiguous or invalid addresses %s", (ip) => expect(() => networkIdentity(ip)).toThrow());
  it("ignores forged forwarding headers in explicit loopback-only mode", () => {
    const req = new Request(origin + "/api/inquiries", { headers: { "x-forwarded-for": "192.0.2.99", "x-real-ip": "203.0.113.1", forwarded: "for=192.0.2.12", "x-echo-client-ip": "192.0.2.45" } });
    expect(resolveNetwork(req, { mode: "loopback" }, randomUUID(), origin)).toBe("127.0.0.1");
    expect(resolveNetwork(new Request("http://localhost:3000/api/inquiries"), { mode: "loopback" }, randomUUID(), origin)).toBe("127.0.0.1");
    expect(() => resolveNetwork(new Request("http://foreign.invalid:3000/api/inquiries"), { mode: "loopback" }, randomUUID(), origin)).toThrow();
    expect(() => resolveNetwork(req, { mode: "loopback" }, randomUUID(), "https://example.invalid")).toThrow();
    expect(() => resolveNetwork(req, {}, randomUUID(), origin)).toThrow();
  });
  it("accepts only a fresh, key-bound authenticated proxy envelope", () => {
    const key = randomUUID(); const time = String(Date.now()); const ip = "2001:db8::123";
    const signature = createHmac("sha256", secret).update(`${time}\n${ip}\nPOST\n/api/inquiries\n${key}`).digest("hex");
    const req = new Request(origin + "/api/inquiries", { headers: { "x-echo-client-ip": ip, "x-echo-client-time": time, "x-echo-client-signature": signature } });
    const config = { mode: "signed-proxy", proxySecret: secret };
    expect(resolveNetwork(req, config, key, origin)).toBe("2001:0db8:0000:0000::/64");
    expect(() => resolveNetwork(req, config, randomUUID(), origin)).toThrow();
    req.headers.set("x-echo-client-ip", "192.0.2.1");
    expect(() => resolveNetwork(req, config, key, origin)).toThrow();
    req.headers.set("x-echo-client-ip", ip); req.headers.set("x-echo-client-time", String(Date.now() - 31000));
    expect(() => resolveNetwork(req, config, key, origin)).toThrow();
    expect(() => resolveNetwork(req, { ...config, proxySecret: undefined }, key, origin)).toThrow();
  });
  it("bounds valid signed past/future timestamps and rejects malformed signatures without trusting forwarding headers", () => {
    vi.useFakeTimers(); vi.setSystemTime(new Date("2026-11-07T12:00:00Z"));
    try {
      const key = randomUUID(); const ip = "192.0.2.1";
      for (const offset of [-30001, -30000, 30000, 30001]) {
        const time = String(Date.now() + offset);
        const signature = createHmac("sha256", secret).update(`${time}\n${ip}\nPOST\n/api/inquiries\n${key}`).digest("hex");
        const req = new Request(origin + "/api/inquiries", { headers: { "x-echo-client-ip": ip, "x-echo-client-time": time, "x-echo-client-signature": signature, "x-forwarded-for": "203.0.113.1" } });
        if (Math.abs(offset) <= 30000) expect(resolveNetwork(req, { mode: "signed-proxy", proxySecret: secret }, key, origin)).toBe(ip);
        else expect(() => resolveNetwork(req, { mode: "signed-proxy", proxySecret: secret }, key, origin)).toThrow();
        req.headers.set("x-echo-client-signature", "0".repeat(63));
        expect(() => resolveNetwork(req, { mode: "signed-proxy", proxySecret: secret }, key, origin)).toThrow();
      }
    } finally { vi.useRealTimers(); }
  });
});
