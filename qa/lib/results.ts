/** Append-only JSONL result history, readable without a database. */
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type { AutomatedResultRecord, ManualResultRecord, ResultRecord } from "./types.ts";

export interface JsonlRead<T> {
  records: T[];
  errors: string[];
}

export function automatedResultsFile(root: string): string {
  return join(root, "qa", "results", "automated.jsonl");
}

export function manualResultsFile(root: string): string {
  return join(root, "qa", "results", "manual.jsonl");
}

export function readJsonl<T>(file: string): JsonlRead<T> {
  if (!existsSync(file)) return { records: [], errors: [] };
  const records: T[] = [];
  const errors: string[] = [];
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    if (!line.trim()) return;
    try {
      records.push(JSON.parse(line) as T);
    } catch (error) {
      errors.push(`${file}:${index + 1}: ${(error as Error).message}`);
    }
  });
  return { records, errors };
}

const AUTOMATED_STATUSES: readonly string[] = ["RUNNING", "PASS", "FAIL", "BLOCKED"];
const MANUAL_RESULTS: readonly string[] = ["PASS", "FAIL", "BLOCKED"];
const REVIEWER_ROLES: readonly string[] = ["owner", "legal", "developer", "qa", "native-reviewer", "designer"];

function requiredString(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== "string" || value.trim() === "") errors.push(`${field} must be a non-empty string`);
}

function optionalString(value: unknown, field: string, errors: string[]): void {
  if (value !== null && value !== undefined && typeof value !== "string") errors.push(`${field} must be a string or null`);
}

function stringList(value: unknown, field: string, errors: string[]): void {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    errors.push(`${field} must be an array of strings`);
  }
}

function timestamp(value: unknown, field: string, errors: string[]): void {
  requiredString(value, field, errors);
  if (typeof value === "string" && Number.isNaN(Date.parse(value))) {
    errors.push(`${field} must be an ISO-8601 timestamp`);
  }
}

/**
 * Validate a stored automated record before it can influence status.
 *
 * A hand-edited or corrupted line must never be read as a passing result, so an
 * unknown status, a missing revision or a null exit status for a PASS is
 * rejected instead of being coerced.
 */
export function validateAutomatedRecord(value: unknown): string[] {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) return ["record must be an object"];
  const record = value as Record<string, unknown>;
  if (record.record !== "automated") errors.push("record must be 'automated'");
  requiredString(record.recordId, "recordId", errors);
  requiredString(record.testId, "testId", errors);
  requiredString(record.suite, "suite", errors);
  requiredString(record.command, "command", errors);
  timestamp(record.startedAt, "startedAt", errors);
  timestamp(record.finishedAt, "finishedAt", errors);
  requiredString(record.sourceRevision, "sourceRevision", errors);
  if (typeof record.sourceRevision === "string" && !/^[0-9a-f]{7,40}$/u.test(record.sourceRevision)) {
    errors.push("sourceRevision must be a hex git revision");
  }
  if (!AUTOMATED_STATUSES.includes(record.status as string)) {
    errors.push(`status must be one of ${AUTOMATED_STATUSES.join(", ")}`);
  }
  if (typeof record.worktreeDirty !== "boolean") errors.push("worktreeDirty must be a boolean");
  if (typeof record.timedOut !== "boolean") errors.push("timedOut must be a boolean");
  requiredString(record.definitionHash, "definitionHash", errors);
  stringList(record.evidence, "evidence", errors);
  optionalString(record.blocker, "blocker", errors);
  optionalString(record.logPath, "logPath", errors);
  if (typeof record.exitCode !== "number" && record.exitCode !== null) errors.push("exitCode must be a number or null");
  if (record.status === "PASS" && record.exitCode !== 0) errors.push("PASS must record exitCode 0");
  if (record.status === "BLOCKED" && (typeof record.blocker !== "string" || record.blocker.trim() === "")) {
    errors.push("BLOCKED requires a recorded blocker");
  }
  return errors;
}

export function validateManualRecord(value: unknown): string[] {
  const errors: string[] = [];
  if (typeof value !== "object" || value === null) return ["record must be an object"];
  const record = value as Record<string, unknown>;
  if (record.record !== "manual") errors.push("record must be 'manual'");
  requiredString(record.recordId, "recordId", errors);
  requiredString(record.testId, "testId", errors);
  if (!MANUAL_RESULTS.includes(record.result as string)) {
    errors.push(`result must be one of ${MANUAL_RESULTS.join(", ")}`);
  }
  requiredString(record.reviewer, "reviewer", errors);
  if (!REVIEWER_ROLES.includes(record.role as string)) {
    errors.push(`role must be one of ${REVIEWER_ROLES.join(", ")}`);
  }
  timestamp(record.recordedAt, "recordedAt", errors);
  requiredString(record.sourceRevision, "sourceRevision", errors);
  if (typeof record.worktreeDirty !== "boolean") errors.push("worktreeDirty must be a boolean");
  requiredString(record.definitionHash, "definitionHash", errors);
  stringList(record.evidence, "evidence", errors);
  optionalString(record.blocker, "blocker", errors);
  if (typeof record.findings !== "string") errors.push("findings must be a string");
  if (record.result === "BLOCKED" && (typeof record.blocker !== "string" || record.blocker.trim() === "")) {
    errors.push("BLOCKED requires a recorded blocker");
  }
  if (record.result === "FAIL" && `${record.notes ?? ""}${record.findings ?? ""}`.trim() === "") {
    errors.push("FAIL requires notes or findings");
  }
  return errors;
}

function readValid<T>(file: string, validate: (value: unknown) => string[]): JsonlRead<T> {
  const parsed = readJsonl<T>(file);
  const records: T[] = [];
  parsed.records.forEach((record, index) => {
    const problems = validate(record);
    if (problems.length > 0) {
      parsed.errors.push(`${file}:record ${index + 1}: ignored invalid record — ${problems.join("; ")}`);
      return;
    }
    records.push(record);
  });
  return { records, errors: parsed.errors };
}

export function readAutomatedResults(root: string): JsonlRead<AutomatedResultRecord> {
  return readValid<AutomatedResultRecord>(automatedResultsFile(root), validateAutomatedRecord);
}

export function readManualResults(root: string): JsonlRead<ManualResultRecord> {
  return readValid<ManualResultRecord>(manualResultsFile(root), validateManualRecord);
}

export function appendJsonl<T>(file: string, record: T): void {
  mkdirSync(dirname(file), { recursive: true });
  appendFileSync(file, `${JSON.stringify(record)}\n`, "utf8");
}

export function ensureJsonlFile(file: string): void {
  mkdirSync(dirname(file), { recursive: true });
  if (!existsSync(file)) writeFileSync(file, "", "utf8");
}

/** Latest automated result per test, by completion time then file order. */
export function latestAutomated(records: readonly AutomatedResultRecord[]): Map<string, AutomatedResultRecord> {
  const latest = new Map<string, AutomatedResultRecord>();
  const keys = new Map<string, string>();
  records.forEach((record, index) => {
    const key = `${record.finishedAt}|${String(index).padStart(8, "0")}`;
    if (key >= (keys.get(record.testId) ?? "")) {
      latest.set(record.testId, record);
      keys.set(record.testId, key);
    }
  });
  return latest;
}

/** Latest manual result per test, by recording time then file order. */
export function latestManual(records: readonly ManualResultRecord[]): Map<string, ManualResultRecord> {
  const latest = new Map<string, ManualResultRecord>();
  const keys = new Map<string, string>();
  records.forEach((record, index) => {
    const key = `${record.recordedAt}|${String(index).padStart(8, "0")}`;
    if (key >= (keys.get(record.testId) ?? "")) {
      latest.set(record.testId, record);
      keys.set(record.testId, key);
    }
  });
  return latest;
}

export function manualHistory(records: readonly ManualResultRecord[], testId: string): ManualResultRecord[] {
  return records.filter((record) => record.testId === testId);
}

export function automatedHistory(records: readonly AutomatedResultRecord[], testId: string): AutomatedResultRecord[] {
  return records.filter((record) => record.testId === testId);
}

export function isAutomatedRecord(value: unknown): value is AutomatedResultRecord {
  return typeof value === "object" && value !== null && (value as { record?: unknown }).record === "automated";
}

export function isManualRecord(value: unknown): value is ManualResultRecord {
  return typeof value === "object" && value !== null && (value as { record?: unknown }).record === "manual";
}

export function describeResult(record: ResultRecord): string {
  if (record.record === "automated") {
    return `${record.status} at ${record.sourceRevision.slice(0, 8)}${record.worktreeDirty ? " (dirty)" : ""}`;
  }
  return `${record.result} by ${record.reviewer} at ${record.sourceRevision.slice(0, 8)}${record.worktreeDirty ? " (dirty)" : ""}`;
}
