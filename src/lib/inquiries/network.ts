import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { isIP } from "node:net";

export type NetworkConfig = { mode?: string; proxySecret?: string };
export class NetworkUnavailable extends Error {}

/** Canonical IPv4 or IPv6 /64. IPv4-mapped IPv6 shares the IPv4 bucket. */
export function networkIdentity(ip: string): string {
  const family = isIP(ip);
  if (!family || ip.includes("%")) throw new NetworkUnavailable();
  if (family === 4) return ip;
  let value = ip.toLowerCase();
  if (value.includes(".")) {
    const start = value.lastIndexOf(":") + 1;
    const octets = value.slice(start).split(".").map(Number);
    value = value.slice(0, start) + ((octets[0] << 8) | octets[1]).toString(16) + ":" + ((octets[2] << 8) | octets[3]).toString(16);
  }
  const [left, right] = value.split("::");
  const first = left ? left.split(":") : [];
  const last = right ? right.split(":") : [];
  const parts = value.includes("::") ? [...first, ...Array(8 - first.length - last.length).fill("0"), ...last] : first;
  const words = parts.map((part) => parseInt(part, 16));
  if (words.slice(0, 5).every((word) => word === 0) && words[5] === 0xffff) return `${words[6] >> 8}.${words[6] & 255}.${words[7] >> 8}.${words[7] & 255}`;
  return words.slice(0, 4).map((word) => word.toString(16).padStart(4, "0")).join(":") + "::/64";
}

/** Next Route Handlers do not supply a verified socket peer. Never infer trust
 * from Host, X-Forwarded-For, Forwarded, X-Real-IP or an unsigned custom header. */
export function resolveNetwork(request: Request, config: NetworkConfig, key: string, origin: string): string {
  if (config.mode === "loopback") {
    // Explicit local-only mode: all requests share one network, headers ignored.
    const trusted = new URL(origin);
    const target = new URL(request.url);
    const loopbacks = ["127.0.0.1", "[::1]", "localhost"];
    // Next normalizes loopback host aliases to localhost in its internal URL.
    if (!loopbacks.includes(trusted.hostname) || !loopbacks.includes(target.hostname) || target.protocol !== trusted.protocol || target.port !== trusted.port) throw new NetworkUnavailable();
    return "127.0.0.1";
  }
  if (config.mode !== "signed-proxy" || !config.proxySecret || config.proxySecret.length < 32) throw new NetworkUnavailable();
  const ip = request.headers.get("x-echo-client-ip") ?? "";
  const time = request.headers.get("x-echo-client-time") ?? "";
  const signature = request.headers.get("x-echo-client-signature") ?? "";
  if (ip.length > 45 || !/^\d{13}$/.test(time) || Math.abs(Date.now() - Number(time)) > 30000 || !/^[0-9a-f]{64}$/.test(signature)) throw new NetworkUnavailable();
  const expected = createHmac("sha256", config.proxySecret).update(`${time}\n${ip}\nPOST\n/api/inquiries\n${key}`).digest();
  if (!timingSafeEqual(expected, Buffer.from(signature, "hex"))) throw new NetworkUnavailable();
  return networkIdentity(ip);
}
