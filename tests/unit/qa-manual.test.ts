import { mkdirSync, symlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseRegistry, QaError } from "../../qa/lib/registry.ts";
import { recordManualResult, manualChecklistLines, type ManualInput } from "../../qa/lib/manual.ts";
import { normalizeEvidencePath } from "../../qa/lib/paths.ts";
import { manualHistory, readManualResults } from "../../qa/lib/results.ts";
import { baseRegistryDocument, fakeHistory, tempRoot, testById } from "./qa-fixtures.ts";

const registry = parseRegistry(baseRegistryDocument());
const manualTech = testById(registry, "MANUAL-TECH");
const manualOwner = testById(registry, "MANUAL-OWNER");

function baseInput(overrides: Partial<ManualInput> = {}): ManualInput {
  return {
    testId: manualTech.id,
    result: "PASS",
    reviewer: "Tester",
    role: "qa",
    evidence: ["test-results/manual/glass.png"],
    ...overrides,
  };
}

function workingRoot(): { root: string; cleanup: () => void } {
  const disposable = tempRoot();
  mkdirSync(join(disposable.root, "test-results", "manual"), { recursive: true });
  writeFileSync(join(disposable.root, "test-results", "manual", "glass.png"), "png", "utf8");
  mkdirSync(join(disposable.root, "qa", "evidence", manualOwner.id), { recursive: true });
  writeFileSync(join(disposable.root, "qa", "evidence", manualOwner.id, "approval.md"), "approved", "utf8");
  return disposable;
}

describe("QA manual recording", () => {
  it("persists an explicit result with reviewer, environment, evidence and revision", () => {
    const disposable = workingRoot();
    try {
      const record = recordManualResult({
        root: disposable.root,
        registry,
        history: fakeHistory(),
        input: baseInput({
          browser: "Firefox 141", device: "desktop", os: "Fedora 42",
          notes: "header legible", evidence: ["test-results/manual/glass.png"],
        }),
        now: () => new Date("2026-11-13T12:30:00.000Z"),
      });
      expect(record.result).toBe("PASS");
      expect(record.reviewer).toBe("Tester");
      expect(record.role).toBe("qa");
      expect(record.recordedAt).toBe("2026-11-13T12:30:00.000Z");
      expect(record.sourceRevision).toBe(fakeHistory().head);
      expect(record.supersedes).toBeNull();
      const stored = readManualResults(disposable.root);
      expect(stored.errors).toEqual([]);
      expect(stored.records).toHaveLength(1);
      expect(stored.records[0]).toEqual(record);
    } finally {
      disposable.cleanup();
    }
  });

  it("keeps a correction/retest history and links the superseded record", () => {
    const disposable = workingRoot();
    try {
      const first = recordManualResult({
        root: disposable.root, registry, history: fakeHistory(),
        input: baseInput({ result: "FAIL", findings: "doubled text visible through the header" }),
        now: () => new Date("2026-11-13T12:00:00.000Z"),
      });
      const second = recordManualResult({
        root: disposable.root, registry, history: fakeHistory(),
        input: baseInput({ result: "PASS", notes: "fixed after re-test" }),
        now: () => new Date("2026-11-13T13:00:00.000Z"),
      });
      const history = manualHistory(readManualResults(disposable.root).records, manualTech.id);
      expect(history.map((record) => record.result)).toEqual(["FAIL", "PASS"]);
      expect(second.supersedes).toBe(first.recordId);
    } finally {
      disposable.cleanup();
    }
  });

  it("requires a reviewer, a known role and a real manual test", () => {
    const disposable = workingRoot();
    try {
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(), input: baseInput({ reviewer: "  " }),
      })).toThrow(/reviewer identity or role is required/u);
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(), input: baseInput({ role: "intern" as ManualInput["role"] }),
      })).toThrow(/role must be one of/u);
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(), input: baseInput({ testId: "NOPE" }),
      })).toThrow(/Unknown test id/u);
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(), input: baseInput({ testId: "UNIT-ONE" }),
      })).toThrow(/automated test/u);
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(), input: baseInput({ result: "MAYBE" as ManualInput["result"] }),
      })).toThrow(/result must be one of/u);
    } finally {
      disposable.cleanup();
    }
  });

  it("requires findings for FAIL and a blocker for BLOCKED", () => {
    const disposable = workingRoot();
    try {
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(), input: baseInput({ result: "FAIL" }),
      })).toThrow(/FAIL result must record notes or findings/u);
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(), input: baseInput({ result: "BLOCKED" }),
      })).toThrow(/BLOCKED result must record the blocker/u);
      const blocked = recordManualResult({
        root: disposable.root, registry, history: fakeHistory(),
        input: baseInput({ result: "BLOCKED", blocker: "no GPU-backed browser in this VM", evidence: [] }),
      });
      expect(blocked.blocker).toContain("no GPU-backed browser");
    } finally {
      disposable.cleanup();
    }
  });

  it("refuses to let a non-owner satisfy an owner gate", () => {
    const disposable = workingRoot();
    try {
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(),
        input: baseInput({ testId: manualOwner.id, role: "developer", evidence: ["qa/evidence/MANUAL-OWNER/approval.md"] }),
      })).toThrow(/owner gate; a developer cannot approve it/u);
      const approved = recordManualResult({
        root: disposable.root, registry, history: fakeHistory(),
        input: baseInput({ testId: manualOwner.id, role: "owner", reviewer: "Owner", evidence: ["qa/evidence/MANUAL-OWNER/approval.md"] }),
      });
      expect(approved.role).toBe("owner");
    } finally {
      disposable.cleanup();
    }
  });

  it("lists pending manual cases for a tester", () => {
    const lines = manualChecklistLines(registry);
    expect(lines).toHaveLength(3);
    expect(lines.join("\n")).toContain("MANUAL-OWNER — manual owner gate (owner gate)");
  });
});

describe("QA evidence path safety", () => {
  it("accepts repository-relative paths under the allowed evidence roots", () => {
    const disposable = workingRoot();
    try {
      expect(normalizeEvidencePath(disposable.root, "test-results/manual/glass.png")).toBe("test-results/manual/glass.png");
      expect(normalizeEvidencePath(disposable.root, "./qa/evidence/MANUAL-OWNER/approval.md"))
        .toBe("qa/evidence/MANUAL-OWNER/approval.md");
    } finally {
      disposable.cleanup();
    }
  });

  it("rejects traversal, absolute paths, foreign roots and empty input", () => {
    const disposable = workingRoot();
    try {
      const reject = (path: string) => {
        expect(() => normalizeEvidencePath(disposable.root, path)).toThrow(QaError);
      };
      reject("../outside.png");
      reject("test-results/../../outside.png");
      reject("/etc/passwd");
      reject("docs/note.png");
      reject("");
      reject("test-results/");
    } finally {
      disposable.cleanup();
    }
  });

  it("rejects an evidence symlink that escapes the repository", () => {
    const disposable = workingRoot();
    try {
      const link = join(disposable.root, "test-results", "escape");
      symlinkSync("/etc", link);
      expect(() => normalizeEvidencePath(disposable.root, "test-results/escape/passwd")).toThrow(/outside the repository/u);
    } finally {
      disposable.cleanup();
    }
  });

  it("rejects an escaping path before the record is persisted", () => {
    const disposable = workingRoot();
    try {
      expect(() => recordManualResult({
        root: disposable.root, registry, history: fakeHistory(),
        input: baseInput({ evidence: ["../../etc/passwd"] }),
      })).toThrow(/traverse upwards/u);
      expect(readManualResults(disposable.root).records).toEqual([]);
    } finally {
      disposable.cleanup();
    }
  });
});
