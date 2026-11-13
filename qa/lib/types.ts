/** Shared types for the in-repository QA registry and result history. */

export const CATEGORIES = [
  "unit",
  "integration",
  "build",
  "http",
  "localization",
  "accessibility",
  "responsive",
  "visual",
  "browser",
  "security",
  "operations",
  "release",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STATUSES = [
  "NOT_RUN",
  "RUNNING",
  "PASS",
  "FAIL",
  "BLOCKED",
  "STALE",
  "REVIEW_REQUIRED",
] as const;
export type Status = (typeof STATUSES)[number];

export const RESULT_STATUSES = ["RUNNING", "PASS", "FAIL", "BLOCKED"] as const;
export type ResultStatus = (typeof RESULT_STATUSES)[number];

export const CRITICALITIES = ["low", "medium", "high", "release"] as const;
export type Criticality = (typeof CRITICALITIES)[number];

export const GATES = ["technical", "owner", "legal"] as const;
export type Gate = (typeof GATES)[number];

export const REVIEWER_ROLES = ["owner", "legal", "developer", "qa", "native-reviewer", "designer"] as const;
export type ReviewerRole = (typeof REVIEWER_ROLES)[number];

export const TEST_TYPES = ["automated", "manual"] as const;
export type TestType = (typeof TEST_TYPES)[number];

export interface SuiteDefinition {
  command: string;
  timeoutMs: number;
  optIn: boolean;
  note: string;
  requiresCommand: string[];
  requiresModule: string[];
  requiresPath: string[];
}

export interface TestDefinition {
  id: string;
  title: string;
  category: Category;
  type: TestType;
  suite: string | null;
  milestones: string[];
  routes: string[];
  locales: string[];
  viewports: string[];
  procedure: string[];
  expected: string;
  evidence: string;
  evidenceRequired: boolean;
  criticality: Criticality;
  gate: Gate;
  releaseRelevant: boolean;
  watch: string[];
}

export interface LoadedRegistry {
  version: number;
  freshnessPolicy: string;
  defaultWatch: string[];
  suites: Record<string, SuiteDefinition>;
  tests: TestDefinition[];
}

export interface AutomatedResultRecord {
  record: "automated";
  recordId: string;
  testId: string;
  suite: string;
  command: string;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  status: ResultStatus;
  sourceRevision: string;
  worktreeDirty: boolean;
  definitionHash: string;
  summary: string;
  logPath: string | null;
  blocker: string | null;
  evidence: string[];
  imported: boolean;
  note: string;
}

export interface ManualResultRecord {
  record: "manual";
  recordId: string;
  testId: string;
  result: "PASS" | "FAIL" | "BLOCKED";
  reviewer: string;
  role: ReviewerRole;
  browser: string;
  device: string;
  os: string;
  evidence: string[];
  notes: string;
  findings: string;
  blocker: string | null;
  recordedAt: string;
  sourceRevision: string;
  worktreeDirty: boolean;
  definitionHash: string;
  supersedes: string | null;
}

export type ResultRecord = AutomatedResultRecord | ManualResultRecord;

export interface Freshness {
  fresh: boolean;
  reason: string;
  watchedChanges: string[];
}

export interface TestState {
  test: TestDefinition;
  status: Status;
  reason: string;
  lastOutcome: Status | null;
  recordedAt: string | null;
  sourceRevision: string | null;
  worktreeDirty: boolean | null;
  automated: AutomatedResultRecord | null;
  manual: ManualResultRecord | null;
  evidence: string[];
  logPath: string | null;
  blocker: string | null;
  freshness: Freshness | null;
}

export interface HistoryContext {
  head: string;
  dirty: boolean;
  /** Uncommitted tracked paths, or null when git cannot report them. */
  dirtyPaths(): string[] | null;
  /** true/false when git can answer, "unknown" when it cannot. */
  isAncestor(revision: string): boolean | "unknown";
  /** Paths changed between revision and HEAD; null when unavailable. */
  changedPaths(revision: string): string[] | null;
}

export interface StatusContext {
  history: HistoryContext;
  definitionHash(test: TestDefinition): string;
  evidenceExists(rootRelativePath: string): boolean;
}
