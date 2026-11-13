import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseRegistry } from "../../qa/lib/registry.ts";
import { readAutomatedResults, validateAutomatedRecord, validateManualRecord } from "../../qa/lib/results.ts";
import { countStatuses, evaluateAll, evaluateTest } from "../../qa/lib/status.ts";
import {
  REVISION, automatedRecord, baseRegistryDocument, manualRecord, statusContext, tempRoot, testById,
} from "./qa-fixtures.ts";

const registry = parseRegistry(baseRegistryDocument());
const unitOne = testById(registry, "UNIT-ONE");
const manualTech = testById(registry, "MANUAL-TECH");
const manualOwner = testById(registry, "MANUAL-OWNER");

describe("QA status: missing results", () => {
  it("reports NOT_RUN when nothing was recorded, never PASS", () => {
    const state = evaluateTest(unitOne, undefined, undefined, statusContext(registry));
    expect(state.status).toBe("NOT_RUN");
    expect(state.lastOutcome).toBeNull();
    expect(state.reason).toBe("no result recorded");
  });

  it("does not treat an automated result as manual acceptance", () => {
    const states = evaluateAll(registry, [automatedRecord(unitOne)], [], statusContext(registry));
    expect(states.find((state) => state.test.id === "UNIT-ONE")?.status).toBe("PASS");
    expect(states.find((state) => state.test.id === "MANUAL-TECH")?.status).toBe("NOT_RUN");
  });

  it("counts every status so uncovered tests stay visible", () => {
    const states = evaluateAll(registry, [automatedRecord(unitOne)], [], statusContext(registry));
    const counts = countStatuses(states);
    expect(counts.total).toBe(7);
    expect(counts.byStatus.PASS).toBe(1);
    expect(counts.byStatus.NOT_RUN).toBe(6);
    expect(counts.automated).toBe(4);
    expect(counts.manual).toBe(3);
  });
});

describe("QA status: freshness", () => {
  it("keeps a clean result recorded at HEAD current", () => {
    const state = evaluateTest(unitOne, automatedRecord(unitOne), undefined, statusContext(registry));
    expect(state.status).toBe("PASS");
  });

  it("marks a result STALE when the definition changed", () => {
    const record = automatedRecord(unitOne, { definitionHash: "sha256:changed" });
    const state = evaluateTest(unitOne, record, undefined, statusContext(registry));
    expect(state.status).toBe("STALE");
    expect(state.lastOutcome).toBe("PASS");
    expect(state.reason).toContain("definition changed");
  });

  it("marks a result recorded from a dirty tree STALE", () => {
    const state = evaluateTest(unitOne, automatedRecord(unitOne, { worktreeDirty: true }), undefined, statusContext(registry));
    expect(state.status).toBe("STALE");
    expect(state.reason).toContain("dirty working tree");
  });

  it("keeps an ancestor result current only when watched paths are unchanged", () => {
    const older = "f".repeat(40);
    const record = automatedRecord(unitOne, { sourceRevision: older });
    const clean = statusContext(registry, { history: { changedPaths: () => ["docs/ECHO-VF01.md"] } });
    expect(evaluateTest(unitOne, record, undefined, clean).status).toBe("PASS");

    const moved = statusContext(registry, { history: { changedPaths: () => ["src/content/about.ts"] } });
    const stale = evaluateTest(unitOne, record, undefined, moved);
    expect(stale.status).toBe("STALE");
    expect(stale.reason).toContain("src/content/about.ts");
  });

  it("is STALE when the tested revision is not an ancestor of HEAD", () => {
    const state = evaluateTest(
      unitOne,
      automatedRecord(unitOne, { sourceRevision: "a".repeat(40) }),
      undefined,
      statusContext(registry, { history: { isAncestor: () => false } }),
    );
    expect(state.status).toBe("STALE");
    expect(state.reason).toContain("not an ancestor");
  });

  it("is STALE rather than PASS when git cannot answer", () => {
    const unknownAncestor = evaluateTest(
      unitOne,
      automatedRecord(unitOne, { sourceRevision: "a".repeat(40) }),
      undefined,
      statusContext(registry, { history: { isAncestor: () => "unknown" } }),
    );
    const unknownChanges = evaluateTest(
      unitOne,
      automatedRecord(unitOne, { sourceRevision: "a".repeat(40) }),
      undefined,
      statusContext(registry, { history: { changedPaths: () => null } }),
    );
    expect(unknownAncestor.status).toBe("STALE");
    expect(unknownChanges.status).toBe("STALE");
  });

  it("is STALE when the working tree cannot be inspected", () => {
    const state = evaluateTest(
      unitOne,
      automatedRecord(unitOne),
      undefined,
      statusContext(registry, { history: { dirtyPaths: () => null } }),
    );
    expect(state.status).toBe("STALE");
    expect(state.reason).toContain("cannot be verified");
  });

  it("ignores uncommitted changes outside the watched paths but not inside them", () => {
    const record = automatedRecord(unitOne);
    const unrelated = statusContext(registry, { history: { dirtyPaths: () => ["docs/ECHO-VF01.md"], dirty: true } });
    expect(evaluateTest(unitOne, record, undefined, unrelated).status).toBe("PASS");
    const related = statusContext(registry, { history: { dirtyPaths: () => ["src/content/about.ts"], dirty: true } });
    const stale = evaluateTest(unitOne, record, undefined, related);
    expect(stale.status).toBe("STALE");
    expect(stale.reason).toContain("uncommitted changes in watched paths");
  });

  it("treats an empty watch list as no path dependency", () => {
    const owner = manualRecord(manualOwner, { role: "owner", evidence: ["qa/evidence/MANUAL-OWNER/note.md"] });
    const context = statusContext(registry, {
      evidence: ["qa/evidence/MANUAL-OWNER/note.md"],
      history: { changedPaths: () => ["src/content/about.ts"] },
    });
    expect(evaluateTest(manualOwner, undefined, owner, context).status).toBe("PASS");
  });
});

describe("QA status: automated outcomes", () => {
  it("shows FAIL for a failed command", () => {
    const state = evaluateTest(
      unitOne,
      automatedRecord(unitOne, { status: "FAIL", exitCode: 1, summary: "1 failed" }),
      undefined,
      statusContext(registry),
    );
    expect(state.status).toBe("FAIL");
    expect(state.reason).toContain("1 failed");
  });

  it("shows BLOCKED with the recorded blocker", () => {
    const state = evaluateTest(
      unitOne,
      automatedRecord(unitOne, { status: "BLOCKED", exitCode: null, blocker: "required command is unavailable: xvfb-run" }),
      undefined,
      statusContext(registry),
    );
    expect(state.status).toBe("BLOCKED");
    expect(state.blocker).toContain("xvfb-run");
  });

  it("shows RUNNING for an interrupted run that only wrote its start record", () => {
    const state = evaluateTest(
      unitOne,
      automatedRecord(unitOne, { status: "RUNNING", exitCode: null, finishedAt: "2026-11-13T10:00:00.000Z" }),
      undefined,
      statusContext(registry),
    );
    expect(state.status).toBe("RUNNING");
  });
});

describe("QA status: manual outcomes and gates", () => {
  it("records a technical manual PASS only with its required evidence", () => {
    const withoutEvidence = manualRecord(manualTech, { evidence: [] });
    const missing = evaluateTest(manualTech, undefined, withoutEvidence, statusContext(registry));
    expect(missing.status).toBe("REVIEW_REQUIRED");
    expect(missing.reason).toContain("no evidence paths recorded");
    const unverified = evaluateTest(
      manualTech, undefined, manualRecord(manualTech, { evidence: ["test-results/manual/glass.png"] }),
      statusContext(registry),
    );
    expect(unverified.status).toBe("REVIEW_REQUIRED");
    const present = evaluateTest(
      manualTech, undefined, manualRecord(manualTech, { evidence: ["test-results/manual/glass.png"] }),
      statusContext(registry, { evidence: ["test-results/manual/glass.png"] }),
    );
    expect(present.status).toBe("PASS");
  });

  it("flags a referenced evidence path that does not exist", () => {
    const record = manualRecord(manualTech, { evidence: ["test-results/manual/missing.png"] });
    const state = evaluateTest(manualTech, undefined, record, statusContext(registry));
    expect(state.status).toBe("REVIEW_REQUIRED");
    expect(state.reason).toContain("missing.png");
  });

  it("refuses to satisfy an owner gate with a developer role", () => {
    const record = manualRecord(manualOwner, {
      role: "developer",
      evidence: ["qa/evidence/MANUAL-OWNER/note.md"],
    });
    const state = evaluateTest(
      manualOwner, undefined, record,
      statusContext(registry, { evidence: ["qa/evidence/MANUAL-OWNER/note.md"] }),
    );
    expect(state.status).toBe("REVIEW_REQUIRED");
    expect(state.reason).toContain("owner gate requires a owner reviewer");
  });

  it("records a manual FAIL with its findings and a BLOCKED with its blocker", () => {
    const failed = evaluateTest(
      manualTech, undefined,
      manualRecord(manualTech, { result: "FAIL", findings: "header text overlaps in dark theme", evidence: ["test-results/x.png"] }),
      statusContext(registry, { evidence: ["test-results/x.png"] }),
    );
    expect(failed.status).toBe("FAIL");
    expect(failed.reason).toContain("overlaps");
    const blocked = evaluateTest(
      manualTech, undefined,
      manualRecord(manualTech, { result: "BLOCKED", blocker: "no Firefox available", evidence: [] }),
      statusContext(registry),
    );
    expect(blocked.status).toBe("BLOCKED");
    expect(blocked.blocker).toContain("no Firefox");
  });

  it("does not let a stale manual PASS count as current", () => {
    const record = manualRecord(manualTech, {
      evidence: ["test-results/manual/glass.png"],
      sourceRevision: "f".repeat(40),
    });
    const state = evaluateTest(
      manualTech, undefined, record,
      statusContext(registry, {
        evidence: ["test-results/manual/glass.png"],
        history: { changedPaths: () => ["src/styles/header.css"] },
      }),
    );
    expect(state.status).toBe("STALE");
    expect(state.lastOutcome).toBe("PASS");
  });
});

describe("QA result record validation", () => {
  it("rejects an unknown automated status instead of coercing it to PASS", () => {
    const record = automatedRecord(unitOne);
    const corrupted = { ...record, status: "SUCCESS" };
    expect(validateAutomatedRecord(record)).toEqual([]);
    expect(validateAutomatedRecord(corrupted).join(" ")).toContain("status must be one of");
  });

  it("rejects a PASS without exit code 0, a BLOCKED without a blocker and a bad revision", () => {
    const record = automatedRecord(unitOne);
    expect(validateAutomatedRecord({ ...record, exitCode: 3 }).join(" ")).toContain("PASS must record exitCode 0");
    expect(validateAutomatedRecord({ ...record, status: "BLOCKED", exitCode: null }).join(" ")).toContain("BLOCKED requires");
    expect(validateAutomatedRecord({ ...record, sourceRevision: "not-a-revision" }).join(" ")).toContain("hex git revision");
    expect(validateAutomatedRecord({ ...record, sourceRevision: "" }).join(" ")).toContain("sourceRevision");
  });

  it("rejects malformed manual records", () => {
    const record = manualRecord(manualTech);
    expect(validateManualRecord(record)).toEqual([]);
    expect(validateManualRecord({ ...record, result: "MAYBE" }).join(" ")).toContain("result must be one of");
    expect(validateManualRecord({ ...record, role: "intern" }).join(" ")).toContain("role must be one of");
    expect(validateManualRecord({ ...record, reviewer: "" }).join(" ")).toContain("reviewer");
    expect(validateManualRecord({ ...record, result: "FAIL", notes: "", findings: "" }).join(" ")).toContain("FAIL requires");
    expect(validateManualRecord({ ...record, evidence: "test-results/x.png" }).join(" ")).toContain("array of strings");
  });

  it("drops corrupted lines with a warning instead of reading them as results", () => {
    const disposable = tempRoot();
    try {
      const directory = join(disposable.root, "qa", "results");
      mkdirSync(directory, { recursive: true });
      const good = automatedRecord(unitOne);
      writeFileSync(join(directory, "automated.jsonl"), [
        JSON.stringify(good),
        JSON.stringify({ ...good, recordId: "changed", status: "OK" }),
        "{not json",
      ].join("\n") + "\n", "utf8");
      const read = readAutomatedResults(disposable.root);
      expect(read.records).toHaveLength(1);
      expect(read.errors).toHaveLength(2);
      expect(read.errors.join("\n")).toContain("ignored invalid record");
    } finally {
      disposable.cleanup();
    }
  });
});

describe("QA status: revision reporting", () => {
  it("keeps the recorded revision visible for every state", () => {
    const record = automatedRecord(unitOne);
    const state = evaluateTest(unitOne, record, undefined, statusContext(registry));
    expect(state.sourceRevision).toBe(REVISION);
    expect(state.recordedAt).toBe(record.finishedAt);
  });
});
