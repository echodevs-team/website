import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseRegistry } from "../../qa/lib/registry.ts";
import { runSelectedSuites, redact, type SpawnOutcome } from "../../qa/lib/runner.ts";
import type { AutomatedResultRecord } from "../../qa/lib/types.ts";
import { baseRegistryDocument, fakeHistory, tempRoot } from "./qa-fixtures.ts";

const registry = parseRegistry(baseRegistryDocument());
const history = fakeHistory();

function probe(overrides: Partial<Record<"command" | "module" | "path", boolean>> = {}) {
  return {
    command: () => overrides.command ?? true,
    module: () => overrides.module ?? true,
    path: () => overrides.path ?? true,
  };
}

const success: SpawnOutcome = { status: 0, signal: null, stdout: "Tests 4 passed", stderr: "" };
const failure: SpawnOutcome = { status: 1, signal: null, stdout: "1 failed", stderr: "assertion error" };

function run(options: {
  ids: string[];
  spawn?: (command: string, settings: { cwd: string; timeout: number }) => SpawnOutcome;
  probe?: ReturnType<typeof probe>;
  allowOptIn?: boolean;
  dryRun?: boolean;
  stdout?: string;
}) {
  const disposable = tempRoot();
  const calls: string[] = [];
  const result = runSelectedSuites({
    root: disposable.root,
    registry,
    tests: options.ids.map((id) => registry.tests.find((test) => test.id === id)!),
    history,
    spawn: (command, settings) => {
      calls.push(command);
      return (options.spawn ?? (() => success))(command, settings);
    },
    probe: options.probe ?? probe(),
    allowOptIn: options.allowOptIn ?? false,
    dryRun: options.dryRun ?? false,
    now: () => new Date("2026-11-13T12:00:00.000Z"),
  });
  return { ...result, calls, root: disposable.root, cleanup: disposable.cleanup };
}

function finalRecords(records: AutomatedResultRecord[]): AutomatedResultRecord[] {
  return records.filter((record) => record.status !== "RUNNING");
}

describe("QA automated runner", () => {
  it("records PASS only after the real command exits 0, and runs a shared suite once", () => {
    const runResult = run({ ids: ["UNIT-ONE", "UNIT-TWO"] });
    try {
      expect(runResult.calls).toEqual(["unit-command"]);
      expect(runResult.exitCode).toBe(0);
      expect(runResult.executions).toHaveLength(1);
      const finals = finalRecords(runResult.records);
      expect(finals.map((record) => record.testId).sort()).toEqual(["UNIT-ONE", "UNIT-TWO"]);
      for (const record of finals) {
        expect(record.status).toBe("PASS");
        expect(record.exitCode).toBe(0);
        expect(record.sourceRevision).toBe(history.head);
        expect(record.worktreeDirty).toBe(false);
        expect(record.definitionHash).toMatch(/^sha256:[0-9a-f]{64}$/u);
        expect(record.logPath).toMatch(/^qa\/\.out\/logs\//u);
        expect(readFileSync(join(runResult.root, record.logPath!), "utf8")).toContain("Tests 4 passed");
      }
      // A RUNNING record is emitted first so an interrupted run is visible.
      expect(runResult.records[0].status).toBe("RUNNING");
    } finally {
      runResult.cleanup();
    }
  });

  it("records FAIL and a non-zero exit code when the command fails", () => {
    const runResult = run({ ids: ["UNIT-ONE"], spawn: () => failure });
    try {
      const [record] = finalRecords(runResult.records);
      expect(record.status).toBe("FAIL");
      expect(record.exitCode).toBe(1);
      expect(record.summary).toContain("assertion error");
      expect(runResult.exitCode).toBe(1);
    } finally {
      runResult.cleanup();
    }
  });

  it("records FAIL with the signal when execution is interrupted", () => {
    const runResult = run({
      ids: ["UNIT-ONE"],
      spawn: () => ({ status: null, signal: "SIGINT", stdout: "partial", stderr: "" }),
    });
    try {
      const [record] = finalRecords(runResult.records);
      expect(record.status).toBe("FAIL");
      expect(record.signal).toBe("SIGINT");
      expect(record.timedOut).toBe(false);
      expect(runResult.exitCode).toBe(1);
    } finally {
      runResult.cleanup();
    }
  });

  it("records FAIL, not PASS, when a command times out", () => {
    const runResult = run({
      ids: ["UNIT-ONE"],
      spawn: () => ({ status: null, signal: "SIGTERM", stdout: "", stderr: "", error: { code: "ETIMEDOUT", message: "timed out" } }),
    });
    try {
      const [record] = finalRecords(runResult.records);
      expect(record.status).toBe("FAIL");
      expect(record.timedOut).toBe(true);
      expect(record.summary).toContain("timed out after 5000 ms");
    } finally {
      runResult.cleanup();
    }
  });

  it("marks a suite BLOCKED without executing it when prerequisites are missing", () => {
    const runResult = run({ ids: ["NEEDS-ONE"], probe: probe({ command: false }) });
    try {
      expect(runResult.calls).toEqual([]);
      const [record] = finalRecords(runResult.records);
      expect(record.status).toBe("BLOCKED");
      expect(record.blocker).toContain("definitely-not-a-real-binary");
      expect(runResult.exitCode).toBe(2);
    } finally {
      runResult.cleanup();
    }
  });

  it("blocks on a missing required path and a missing Python module", () => {
    const document = baseRegistryDocument();
    (document.suites as Record<string, Record<string, unknown>>).unit.requiresModule = ["module_that_is_not_installed"];
    const withModule = parseRegistry(document);
    const missingPath = run({ ids: ["NEEDS-ONE"], probe: probe({ path: false }) });
    const missingModule = (() => {
      const disposable = tempRoot();
      const calls: string[] = [];
      const result = runSelectedSuites({
        root: disposable.root,
        registry: withModule,
        tests: [withModule.tests.find((test) => test.id === "UNIT-ONE")!],
        history,
        spawn: (command) => { calls.push(command); return success; },
        probe: { command: () => true, module: () => false, path: () => true },
      });
      return { ...result, calls, cleanup: disposable.cleanup };
    })();
    try {
      expect(finalRecords(missingPath.records)[0].blocker).toContain(".next/BUILD_ID");
      expect(missingModule.calls).toEqual([]);
      expect(finalRecords(missingModule.records)[0].blocker).toContain("module_that_is_not_installed");
    } finally {
      missingPath.cleanup();
      missingModule.cleanup();
    }
  });

  it("refuses an opt-in suite unless opt-in was requested, and never runs it silently", () => {
    const runResult = run({ ids: ["OPT-IN-ONE"] });
    try {
      expect(runResult.calls).toEqual([]);
      const [record] = finalRecords(runResult.records);
      expect(record.status).toBe("BLOCKED");
      expect(record.blocker).toContain("--include-opt-in");
    } finally {
      runResult.cleanup();
    }
  });

  it("does not execute or record anything during a dry run", () => {
    const runResult = run({ ids: ["UNIT-ONE"], dryRun: true });
    try {
      expect(runResult.calls).toEqual([]);
      expect(runResult.records).toEqual([]);
      expect(runResult.executions[0].status).toBe("PASS");
      expect(runResult.executions[0].summary).toContain("dry run");
    } finally {
      runResult.cleanup();
    }
  });

  it("never writes a password from command output into a summary or log", () => {
    const runResult = run({
      ids: ["UNIT-ONE"],
      spawn: () => ({
        status: 0,
        signal: null,
        stdout: "connecting postgres://app:sup3rs3cret@127.0.0.1/dev\nPGPASSWORD=sup3rs3cret ok\nTests passed",
        stderr: "PASSWORD=sup3rs3cret",
      }),
    });
    try {
      const [record] = finalRecords(runResult.records);
      const log = readFileSync(join(runResult.root, record.logPath!), "utf8");
      for (const text of [record.summary, log]) {
        expect(text).not.toContain("sup3rs3cret");
        expect(text).toContain("[redacted]");
      }
    } finally {
      runResult.cleanup();
    }
  });

  it("redacts credentials without touching ordinary words", () => {
    expect(redact("token=abc123 done")).toBe("token=[redacted] done");
    expect(redact("no secrets here")).toBe("no secrets here");
  });
});
