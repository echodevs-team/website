/** Evidence path validation: repository-relative, safe, inside allowed roots. */
import { existsSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { QaError } from "./registry.ts";

export const EVIDENCE_PREFIXES = ["test-results/", "qa/evidence/"] as const;

function isInside(root: string, target: string): boolean {
  const rel = relative(root, target);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function realPathInside(root: string, target: string): boolean {
  let current = target;
  while (!existsSync(current)) {
    const parent = dirname(current);
    if (parent === current) return false;
    current = parent;
  }
  try {
    return isInside(realpathSync(root), realpathSync(current));
  } catch {
    return false;
  }
}

/**
 * Validate a manually recorded evidence path. Relatives must stay under
 * test-results/ or qa/evidence/ and must not escape the repository via `..`
 * or a symlink.
 */
export function normalizeEvidencePath(root: string, input: string): string {
  if (typeof input !== "string") throw new QaError("evidence path must be a string");
  const raw = input.trim().replace(/\\/gu, "/");
  if (!raw) throw new QaError("evidence path must not be empty");
  if (raw.includes("\0")) throw new QaError("evidence path contains a NUL byte");
  if (isAbsolute(raw) || /^[A-Za-z]:/u.test(raw)) throw new QaError(`evidence path must be repository-relative: ${raw}`);
  const normalized = raw.replace(/^\.\//u, "");
  const segments = normalized.split("/");
  if (segments.includes("..")) throw new QaError(`evidence path must not traverse upwards: ${raw}`);
  if (!EVIDENCE_PREFIXES.some((prefix) => normalized.startsWith(prefix))) {
    throw new QaError(`evidence path must start with ${EVIDENCE_PREFIXES.join(" or ")}: ${raw}`);
  }
  if (EVIDENCE_PREFIXES.some((prefix) => normalized.replace(/\/+$/u, "") === prefix.replace(/\/+$/u, ""))) {
    throw new QaError(`evidence path must name a file or run folder, not the evidence root: ${raw}`);
  }
  const rootPath = resolve(root);
  const target = resolve(rootPath, normalized);
  if (!isInside(rootPath, target) || target === rootPath) throw new QaError(`evidence path escapes the repository: ${raw}`);
  if (!realPathInside(rootPath, target)) throw new QaError(`evidence path resolves outside the repository: ${raw}`);
  if (!existsSync(target) && !realPathInside(rootPath, dirname(target))) {
    throw new QaError(`evidence path parent is unsafe: ${raw}`);
  }
  return normalized.split(sep).join("/");
}

export function evidenceExists(root: string, normalized: string): boolean {
  const target = resolve(root, normalized);
  return existsSync(target) && realPathInside(resolve(root), target);
}
