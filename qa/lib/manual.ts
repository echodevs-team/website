/** Manual test recording: explicit human results with evidence and history. */
import { appendJsonl, latestManual, manualResultsFile, readManualResults } from "./results.ts";
import { QaError, definitionHash } from "./registry.ts";
import { normalizeEvidencePath } from "./paths.ts";
import { REVIEWER_ROLES, type HistoryContext, type LoadedRegistry, type ManualResultRecord, type ReviewerRole } from "./types.ts";

export interface ManualInput {
  testId: string;
  result: "PASS" | "FAIL" | "BLOCKED";
  reviewer: string;
  role: ReviewerRole;
  browser?: string;
  device?: string;
  os?: string;
  evidence?: string[];
  notes?: string;
  findings?: string;
  blocker?: string;
}

export interface RecordManualOptions {
  root: string;
  registry: LoadedRegistry;
  history: HistoryContext;
  input: ManualInput;
  now?: () => Date;
  append?: (file: string, record: ManualResultRecord) => void;
}

const RESULTS = ["PASS", "FAIL", "BLOCKED"] as const;

export function recordManualResult(options: RecordManualOptions): ManualResultRecord {
  const { root, registry, history, input, now = () => new Date(), append = appendJsonl } = options;
  const test = registry.tests.find((candidate) => candidate.id === input.testId);
  if (!test) throw new QaError(`Unknown test id: ${input.testId}`);
  if (test.type !== "manual") throw new QaError(`${test.id} is an automated test; run it with npm run qa:run`);
  if (!RESULTS.includes(input.result)) throw new QaError(`result must be one of ${RESULTS.join(", ")}`);
  const reviewer = (input.reviewer ?? "").trim();
  if (!reviewer) throw new QaError("reviewer identity or role is required; a manual result is never anonymous");
  if (!REVIEWER_ROLES.includes(input.role)) throw new QaError(`role must be one of ${REVIEWER_ROLES.join(", ")}`);
  if (input.result === "BLOCKED" && !(input.blocker ?? "").trim()) {
    throw new QaError("a BLOCKED result must record the blocker");
  }
  if (input.result === "FAIL" && !(`${input.notes ?? ""}${input.findings ?? ""}`.trim())) {
    throw new QaError("a FAIL result must record notes or findings");
  }
  if (input.result === "PASS" && test.gate !== "technical" && input.role !== test.gate) {
    throw new QaError(
      `${test.id} has a ${test.gate} gate; a ${input.role} cannot approve it. ` +
      `Use --role ${test.gate} only when that person has actually reviewed the evidence.`,
    );
  }
  const evidence = [...new Set((input.evidence ?? []).map((path) => normalizeEvidencePath(root, path)))];
  const previous = latestManual(readManualResults(root).records).get(test.id);
  const record: ManualResultRecord = {
    record: "manual",
    recordId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    testId: test.id,
    result: input.result,
    reviewer,
    role: input.role,
    browser: (input.browser ?? "").trim(),
    device: (input.device ?? "").trim(),
    os: (input.os ?? "").trim(),
    evidence,
    notes: (input.notes ?? "").trim(),
    findings: (input.findings ?? "").trim(),
    blocker: (input.blocker ?? "").trim() || null,
    recordedAt: now().toISOString(),
    sourceRevision: history.head,
    worktreeDirty: history.dirty,
    definitionHash: definitionHash(test),
    supersedes: previous?.recordId ?? null,
  };
  append(manualResultsFile(root), record);
  return record;
}

export function manualChecklistLines(registry: LoadedRegistry): string[] {
  return registry.tests
    .filter((test) => test.type === "manual")
    .map((test) => `${test.id} — ${test.title} (${test.gate} gate)`);
}
