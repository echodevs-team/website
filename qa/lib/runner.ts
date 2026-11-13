/** Automated suite execution with real commands, persisted records and blockers. */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { isAbsolute, join } from "node:path";
import { definitionHash, groupBySuite } from "./registry.ts";
import type {
  AutomatedResultRecord, HistoryContext, LoadedRegistry, ResultStatus,
  SuiteDefinition, TestDefinition,
} from "./types.ts";

export interface SpawnOutcome {
  status: number | null;
  signal: string | null;
  stdout: string;
  stderr: string;
  error?: { code?: string; message?: string };
}

export type SpawnCommand = (command: string, options: { cwd: string; timeout: number }) => SpawnOutcome;

export interface PrerequisiteProbe {
  command(name: string): boolean;
  module(name: string): boolean;
  path(relativePath: string): boolean;
}

export const defaultSpawn: SpawnCommand = (command, options) => {
  const result = spawnSync(command, {
    cwd: options.cwd,
    shell: true,
    encoding: "utf8",
    timeout: options.timeout,
    maxBuffer: 64 * 1024 * 1024,
  });
  return {
    status: result.status,
    signal: result.signal,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    error: result.error ? { code: (result.error as NodeJS.ErrnoException).code, message: result.error.message } : undefined,
  };
};

export function defaultProbe(root: string): PrerequisiteProbe {
  return {
    command(name) {
      if (!/^[A-Za-z0-9._-]+$/u.test(name)) return false;
      return spawnSync("sh", ["-c", `command -v ${name}`], { cwd: root, encoding: "utf8" }).status === 0;
    },
    module(name) {
      if (!/^[A-Za-z_][A-Za-z0-9_.]*$/u.test(name)) return false;
      return spawnSync("python3", ["-c", `import ${name}`], { cwd: root, encoding: "utf8" }).status === 0;
    },
    path(relativePath) {
      if (!relativePath || isAbsolute(relativePath) || relativePath.split("/").includes("..")) return false;
      return existsSync(join(root, relativePath));
    },
  };
}

export function redact(text: string): string {
  return text
    .replace(/(postgres(?:ql)?:\/\/)[^\s"'`]+/giu, "$1[redacted]")
    .replace(/((?:password|passwd|secret|token|api[_-]?key|pgpassword)\s*[=:]\s*)[^\s"'`]+/giu, "$1[redacted]")
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/gu, "[redacted private key]");
}

export function summarizeOutput(stdout: string, stderr: string, timeoutMs = 0): string {
  const lines = `${stdout}\n${stderr}`.split("\n").map((line) => line.trimEnd()).filter(Boolean);
  const useful = lines.filter((line) =>
    /(pass|fail|error|warn|✓|✗|Build|Compiled|Tests|Test Files|PASS|FAIL|blocked)/iu.test(line),
  );
  const selected = (useful.length > 0 ? useful : lines).slice(-25).join("\n");
  const prefix = timeoutMs > 0 ? `[timed out after ${timeoutMs} ms]\n` : "";
  return redact(`${prefix}${selected}`).slice(-4000);
}

export function suiteBlocker(suite: SuiteDefinition, probe: PrerequisiteProbe): string | null {
  for (const command of suite.requiresCommand) {
    if (!probe.command(command)) return `required command is unavailable: ${command}`;
  }
  for (const moduleName of suite.requiresModule) {
    if (!probe.module(moduleName)) return `required Python module is unavailable: ${moduleName}`;
  }
  for (const relativePath of suite.requiresPath) {
    if (!probe.path(relativePath)) return `required path is unavailable: ${relativePath}`;
  }
  return null;
}

export interface RunnerOptions {
  root: string;
  registry: LoadedRegistry;
  tests: TestDefinition[];
  history: HistoryContext;
  allowOptIn?: boolean;
  dryRun?: boolean;
  now?: () => Date;
  spawn?: SpawnCommand;
  probe?: PrerequisiteProbe;
  onRecord?: (record: AutomatedResultRecord) => void;
  onSuiteStart?: (suite: string, command: string, tests: TestDefinition[]) => void;
  logDirectory?: string;
}

export interface SuiteExecution {
  suite: string;
  command: string;
  status: ResultStatus;
  blocker: string | null;
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  durationMs: number;
  summary: string;
  logPath: string | null;
  testIds: string[];
}

export interface RunnerResult {
  executions: SuiteExecution[];
  records: AutomatedResultRecord[];
  exitCode: number;
}

function timestampCompact(date: Date): string {
  return date.toISOString().replace(/[-:]/gu, "").replace(/\.\d{3}/u, "");
}

function makeRecord(options: {
  test: TestDefinition;
  suite: SuiteDefinition;
  suiteName: string;
  status: ResultStatus;
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  exitCode: number | null;
  signal: string | null;
  timedOut: boolean;
  summary: string;
  logPath: string | null;
  blocker: string | null;
  history: HistoryContext;
  worktreeDirty: boolean;
}): AutomatedResultRecord {
  return {
    record: "automated",
    recordId: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
    testId: options.test.id,
    suite: options.suiteName,
    command: options.suite.command,
    startedAt: options.startedAt,
    finishedAt: options.finishedAt,
    durationMs: options.durationMs,
    exitCode: options.exitCode,
    signal: options.signal,
    timedOut: options.timedOut,
    status: options.status,
    sourceRevision: options.history.head,
    worktreeDirty: options.worktreeDirty,
    definitionHash: definitionHash(options.test),
    summary: options.summary,
    logPath: options.logPath,
    blocker: options.blocker,
    evidence: [],
    imported: false,
    note: "",
  };
}

/**
 * Execute each selected suite once, in stable order, and return per-test
 * records. Opt-in suites are refused unless `allowOptIn` is explicitly set.
 */
export function runSelectedSuites(options: RunnerOptions): RunnerResult {
  const {
    root, registry, tests, history,
    allowOptIn = false,
    dryRun = false,
    now = () => new Date(),
    spawn = defaultSpawn,
    probe = defaultProbe(root),
    onRecord,
    onSuiteStart,
    logDirectory = join(root, "qa", ".out", "logs"),
  } = options;

  const groups = groupBySuite(registry, tests);
  const executions: SuiteExecution[] = [];
  const records: AutomatedResultRecord[] = [];
  const emit = (record: AutomatedResultRecord) => {
    records.push(record);
    onRecord?.(record);
  };

  for (const group of groups) {
    const { suite, suiteDefinition } = group;
    const suiteTests = [...group.tests].sort((left, right) => left.id.localeCompare(right.id));
    onSuiteStart?.(suite, suiteDefinition.command, suiteTests);

    const blockedReason = suiteDefinition.optIn && !allowOptIn
      ? "opt-in suite requires --include-opt-in"
      : suiteBlocker(suiteDefinition, probe);

    if (dryRun) {
      executions.push({
        suite, command: suiteDefinition.command,
        status: blockedReason ? "BLOCKED" : "PASS",
        blocker: blockedReason, exitCode: null, signal: null, timedOut: false,
        durationMs: 0, summary: blockedReason ?? "dry run: would execute", logPath: null,
        testIds: suiteTests.map((test) => test.id),
      });
      continue;
    }

    const started = now();
    const startedAt = started.toISOString();

    if (blockedReason) {
      for (const test of suiteTests) {
        emit(makeRecord({
          test, suite: suiteDefinition, suiteName: suite, status: "BLOCKED",
          startedAt, finishedAt: startedAt, durationMs: 0, exitCode: null, signal: null,
          timedOut: false, summary: blockedReason, logPath: null, blocker: blockedReason,
          history, worktreeDirty: history.dirty,
        }));
      }
      executions.push({
        suite, command: suiteDefinition.command, status: "BLOCKED", blocker: blockedReason,
        exitCode: null, signal: null, timedOut: false, durationMs: 0, summary: blockedReason,
        logPath: null, testIds: suiteTests.map((test) => test.id),
      });
      continue;
    }

    for (const test of suiteTests) {
      emit(makeRecord({
        test, suite: suiteDefinition, suiteName: suite, status: "RUNNING",
        startedAt, finishedAt: startedAt, durationMs: 0, exitCode: null, signal: null,
        timedOut: false, summary: "started", logPath: null, blocker: null,
        history, worktreeDirty: history.dirty,
      }));
    }

    const outcome = spawn(suiteDefinition.command, { cwd: root, timeout: suiteDefinition.timeoutMs });
    const finished = now();
    const timedOut = outcome.error?.code === "ETIMEDOUT";
    const interrupted = outcome.signal !== null && !timedOut;
    const status: ResultStatus = outcome.status === 0 && !timedOut && !interrupted ? "PASS" : "FAIL";
    const durationMs = Math.max(0, finished.getTime() - started.getTime());
    const logText = redact(`$ ${suiteDefinition.command}\n${outcome.stdout}\n${outcome.stderr}`.trim());
    let logPath: string | null = null;
    try {
      mkdirSync(logDirectory, { recursive: true });
      logPath = join("qa", ".out", "logs", `${timestampCompact(started)}-${suite}.log`);
      writeFileSync(join(root, logPath), `${logText}\n`, "utf8");
    } catch {
      logPath = null;
    }
    const summary = summarizeOutput(outcome.stdout, outcome.stderr, timedOut ? suiteDefinition.timeoutMs : 0);

    for (const test of suiteTests) {
      emit(makeRecord({
        test, suite: suiteDefinition, suiteName: suite, status,
        startedAt, finishedAt: finished.toISOString(), durationMs,
        exitCode: outcome.status, signal: outcome.signal ?? null, timedOut,
        summary, logPath, blocker: null, history, worktreeDirty: history.dirty,
      }));
    }
    executions.push({
      suite, command: suiteDefinition.command, status,
      blocker: null, exitCode: outcome.status, signal: outcome.signal ?? null,
      timedOut, durationMs, summary, logPath, testIds: suiteTests.map((test) => test.id),
    });
  }

  const exitCode = executions.some((execution) => execution.status === "FAIL")
    ? 1
    : executions.some((execution) => execution.status === "BLOCKED") ? 2 : 0;
  return { executions, records, exitCode };
}
