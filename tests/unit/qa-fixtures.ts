/**
 * Deterministic fixtures for the QA system's own tests.
 *
 * These build registries, result records and history contexts in memory so the
 * runner, status and report logic can be exercised without touching a real
 * browser, server or database.
 */
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { definitionHash } from "../../qa/lib/registry.ts";
import type {
  AutomatedResultRecord, HistoryContext, LoadedRegistry, ManualResultRecord,
  StatusContext, TestDefinition,
} from "../../qa/lib/types.ts";

export const REVISION = "0123456789abcdef0123456789abcdef01234567";

export function baseRegistryDocument(): Record<string, unknown> {
  return {
    version: 1,
    freshnessPolicy: "Fixture policy: a result is fresh when its definition is unchanged and no watched path moved.",
    defaultWatch: ["src/**"],
    suites: {
      unit: { command: "unit-command", timeoutMs: 5000, note: "fixture suite" },
      opt: { command: "opt-command", timeoutMs: 5000, optIn: true, note: "opt-in fixture suite" },
      needs: {
        command: "needs-command",
        timeoutMs: 5000,
        requiresCommand: ["definitely-not-a-real-binary"],
        requiresPath: [".next/BUILD_ID"],
      },
    },
    tests: [
      {
        id: "UNIT-ONE", title: "first automated case", category: "unit", type: "automated",
        suite: "unit", milestones: ["M1"], expected: "command exits 0", evidence: "log", criticality: "high",
        releaseRelevant: true,
      },
      {
        id: "UNIT-TWO", title: "second automated case", category: "unit", type: "automated",
        suite: "unit", milestones: ["M1", "M2"], expected: "command exits 0", evidence: "log", criticality: "medium",
        releaseRelevant: true,
      },
      {
        id: "OPT-IN-ONE", title: "opt-in automated case", category: "browser", type: "automated",
        suite: "opt", milestones: ["M2"], expected: "command exits 0", evidence: "run folder", criticality: "low",
      },
      {
        id: "NEEDS-ONE", title: "case with missing prerequisites", category: "browser", type: "automated",
        suite: "needs", milestones: ["M2"], expected: "command exits 0", evidence: "run folder", criticality: "low",
      },
      {
        id: "MANUAL-TECH", title: "manual technical case", category: "visual", type: "manual",
        milestones: ["M1"], procedure: ["look at it"], expected: "it looks right", evidence: "screenshot",
        criticality: "high", releaseRelevant: true, watch: ["src/styles/**"],
      },
      {
        id: "MANUAL-OWNER", title: "manual owner gate", category: "visual", type: "manual",
        milestones: ["M1"], procedure: ["owner reviews"], expected: "owner accepts", evidence: "approval note",
        criticality: "release", releaseRelevant: true, gate: "owner", watch: [],
      },
      {
        id: "MANUAL-LEGAL", title: "manual legal gate", category: "release", type: "manual",
        milestones: ["M3"], procedure: ["legal reviews"], expected: "legal accepts", evidence: "written approval",
        criticality: "release", releaseRelevant: true, gate: "legal", watch: [],
      },
    ],
  };
}

export const registryDocument = baseRegistryDocument;

export function testById(registry: LoadedRegistry, id: string): TestDefinition {
  const test = registry.tests.find((candidate) => candidate.id === id);
  if (!test) throw new Error(`fixture is missing ${id}`);
  return test;
}

export function automatedRecord(
  test: TestDefinition,
  overrides: Partial<AutomatedResultRecord> = {},
): AutomatedResultRecord {
  return {
    record: "automated",
    recordId: `automated-${test.id}`,
    testId: test.id,
    suite: test.suite ?? "unit",
    command: "unit-command",
    startedAt: "2026-11-13T10:00:00.000Z",
    finishedAt: "2026-11-13T10:00:05.000Z",
    durationMs: 5000,
    exitCode: 0,
    signal: null,
    timedOut: false,
    status: "PASS",
    sourceRevision: REVISION,
    worktreeDirty: false,
    definitionHash: definitionHash(test),
    summary: "command exited 0",
    logPath: null,
    blocker: null,
    evidence: [],
    imported: false,
    note: "",
    ...overrides,
  };
}

export function manualRecord(
  test: TestDefinition,
  overrides: Partial<ManualResultRecord> = {},
): ManualResultRecord {
  return {
    record: "manual",
    recordId: `manual-${test.id}`,
    testId: test.id,
    result: "PASS",
    reviewer: "Fixture Reviewer",
    role: "developer",
    browser: "Firefox 141",
    device: "desktop",
    os: "Fedora 42",
    evidence: [],
    notes: "looks correct",
    findings: "",
    blocker: null,
    recordedAt: "2026-11-13T10:00:00.000Z",
    sourceRevision: REVISION,
    worktreeDirty: false,
    definitionHash: definitionHash(test),
    supersedes: null,
    ...overrides,
  };
}

export function fakeHistory(overrides: Partial<HistoryContext> = {}): HistoryContext {
  return {
    head: REVISION,
    dirty: false,
    dirtyPaths: () => [],
    isAncestor: () => true,
    changedPaths: () => [],
    ...overrides,
  };
}

export function statusContext(
  registry: LoadedRegistry,
  options: {
    history?: Partial<HistoryContext>;
    evidence?: string[];
  } = {},
): StatusContext {
  const existing = new Set(options.evidence ?? []);
  return {
    history: fakeHistory(options.history),
    definitionHash,
    evidenceExists: (path) => existing.has(path),
  };
}

/**
 * A disposable repository root. Prefers the approved /tmp/opencode workspace
 * and falls back to the platform temp directory elsewhere.
 */
export function tempRoot(): { root: string; cleanup: () => void } {
  const base = existsSync("/tmp/opencode") ? "/tmp/opencode" : tmpdir();
  const root = mkdtempSync(join(base, "echo-qa-"));
  return { root, cleanup: () => rmSync(root, { recursive: true, force: true }) };
}
