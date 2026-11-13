/** Status calculation: conservative freshness, gates and manual evidence rules. */
import { matchesAny } from "./glob.ts";
import type {
  AutomatedResultRecord, Freshness, HistoryContext, LoadedRegistry,
  ManualResultRecord, Status, StatusContext, TestDefinition, TestState,
} from "./types.ts";

export function evaluateFreshness(
  test: TestDefinition,
  record: AutomatedResultRecord | ManualResultRecord,
  context: StatusContext,
): Freshness {
  const currentHash = context.definitionHash(test);
  if (record.definitionHash !== currentHash) {
    return { fresh: false, reason: "test definition changed since this result", watchedChanges: [] };
  }
  if (!record.sourceRevision) {
    return { fresh: false, reason: "result does not record a source revision", watchedChanges: [] };
  }
  if (record.worktreeDirty) {
    return { fresh: false, reason: "recorded from a dirty working tree; rerun from a clean commit", watchedChanges: [] };
  }
  const dirtyPaths = context.history.dirtyPaths();
  if (dirtyPaths === null) {
    return { fresh: false, reason: "working-tree state cannot be verified", watchedChanges: [] };
  }
  const dirtyWatched = dirtyPaths.filter((path) => matchesAny(path, test.watch));
  if (dirtyWatched.length > 0) {
    return {
      fresh: false,
      reason: `uncommitted changes in watched paths: ${dirtyWatched.slice(0, 5).join(", ")}`,
      watchedChanges: dirtyWatched.slice(0, 5),
    };
  }
  if (record.sourceRevision === context.history.head) {
    return { fresh: true, reason: "result matches HEAD", watchedChanges: [] };
  }
  const ancestor = context.history.isAncestor(record.sourceRevision);
  if (ancestor === "unknown") {
    return { fresh: false, reason: "cannot verify that the tested revision is an ancestor of HEAD", watchedChanges: [] };
  }
  if (!ancestor) {
    return { fresh: false, reason: "tested revision is not an ancestor of HEAD", watchedChanges: [] };
  }
  const changed = context.history.changedPaths(record.sourceRevision);
  if (changed === null) {
    return { fresh: false, reason: "changes since the tested revision cannot be verified", watchedChanges: [] };
  }
  const watched = changed.filter((path) => matchesAny(path, test.watch));
  if (watched.length > 0) {
    return {
      fresh: false,
      reason: `watched paths changed after the result: ${watched.slice(0, 5).join(", ")}`,
      watchedChanges: watched.slice(0, 5),
    };
  }
  return { fresh: true, reason: "no watched paths changed since this result", watchedChanges: [] };
}

function gateSatisfied(test: TestDefinition, role: ManualResultRecord["role"]): boolean {
  if (test.gate === "technical") return true;
  return test.gate === role;
}

function missingEvidence(test: TestDefinition, record: ManualResultRecord, context: StatusContext): string[] {
  if (!test.evidenceRequired) return [];
  if (record.evidence.length === 0) return ["no evidence paths recorded"];
  return record.evidence.filter((path) => !context.evidenceExists(path));
}

export function evaluateTest(
  test: TestDefinition,
  automated: AutomatedResultRecord | undefined,
  manual: ManualResultRecord | undefined,
  context: StatusContext,
): TestState {
  const record = test.type === "manual" ? manual : automated;
  const base: TestState = {
    test,
    status: "NOT_RUN",
    reason: "no result recorded",
    lastOutcome: null,
    recordedAt: null,
    sourceRevision: null,
    worktreeDirty: null,
    automated: automated ?? null,
    manual: manual ?? null,
    evidence: [],
    logPath: null,
    blocker: null,
    freshness: null,
  };
  if (!record) return base;

  const freshness = evaluateFreshness(test, record, context);
  const recordedAt = record.record === "automated" ? record.finishedAt : record.recordedAt;
  const common = {
    recordedAt,
    sourceRevision: record.sourceRevision,
    worktreeDirty: record.worktreeDirty,
    evidence: record.record === "manual" ? [...record.evidence] : [...record.evidence],
    logPath: record.record === "automated" ? record.logPath : null,
    blocker: record.record === "automated" ? record.blocker : record.blocker,
    freshness,
  };

  if (record.record === "automated" && record.status === "RUNNING") {
    return { ...base, ...common, status: "RUNNING", reason: "execution in progress or interrupted before a final record" };
  }
  if (record.record === "automated" && record.status === "BLOCKED") {
    return { ...base, ...common, status: "BLOCKED", reason: record.blocker ?? "blocked without a recorded reason", blocker: record.blocker ?? "blocked without a recorded reason" };
  }
  if (record.record === "manual" && record.result === "BLOCKED") {
    return { ...base, ...common, status: "BLOCKED", reason: record.blocker ?? "blocked without a recorded reason", blocker: record.blocker ?? "blocked without a recorded reason" };
  }

  let outcome: Status;
  let reason: string;
  if (record.record === "manual") {
    if (record.result === "FAIL") {
      outcome = "FAIL";
      reason = record.findings || record.notes || "manual result recorded as FAIL";
    } else if (!gateSatisfied(test, record.role)) {
      outcome = "REVIEW_REQUIRED";
      reason = `${test.gate} gate requires a ${test.gate} reviewer; recorded role was ${record.role}`;
    } else {
      const missing = missingEvidence(test, record, context);
      if (missing.length > 0) {
        outcome = "REVIEW_REQUIRED";
        reason = `required evidence missing: ${missing.join("; ")}`;
      } else {
        outcome = "PASS";
        reason = `recorded by ${record.reviewer} (${record.role})`;
      }
    }
  } else {
    outcome = record.status;
    reason = record.status === "PASS" ? "command exited 0" : record.summary || "command failed";
  }

  if (!freshness.fresh) {
    return { ...base, ...common, status: "STALE", lastOutcome: outcome, reason: freshness.reason };
  }
  return { ...base, ...common, status: outcome, lastOutcome: outcome, reason };
}

export function evaluateAll(
  registry: LoadedRegistry,
  automated: readonly AutomatedResultRecord[],
  manual: readonly ManualResultRecord[],
  context: StatusContext,
): TestState[] {
  const automatedLatest = new Map<string, AutomatedResultRecord>();
  for (const record of automated) {
    const current = automatedLatest.get(record.testId);
    if (!current || `${record.finishedAt}` >= `${current.finishedAt}`) automatedLatest.set(record.testId, record);
  }
  const manualLatest = new Map<string, ManualResultRecord>();
  for (const record of manual) {
    const current = manualLatest.get(record.testId);
    if (!current || `${record.recordedAt}` >= `${current.recordedAt}`) manualLatest.set(record.testId, record);
  }
  return registry.tests.map((test) => evaluateTest(test, automatedLatest.get(test.id), manualLatest.get(test.id), context));
}

export interface StatusCounts {
  total: number;
  byStatus: Record<Status, number>;
  automated: number;
  manual: number;
}

export function countStatuses(states: readonly TestState[]): StatusCounts {
  const byStatus: Record<Status, number> = {
    NOT_RUN: 0, RUNNING: 0, PASS: 0, FAIL: 0, BLOCKED: 0, STALE: 0, REVIEW_REQUIRED: 0,
  };
  for (const state of states) byStatus[state.status] += 1;
  return {
    total: states.length,
    byStatus,
    automated: states.filter((state) => state.test.type === "automated").length,
    manual: states.filter((state) => state.test.type === "manual").length,
  };
}

export function isHistoryContext(value: HistoryContext): boolean {
  return typeof value.head === "string" && typeof value.isAncestor === "function";
}
