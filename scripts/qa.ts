#!/usr/bin/env node
/**
 * Repository-native QA CLI.
 *
 *   npm run qa:validate
 *   npm run qa:run -- [--only unit|UNIT-SUITE|ECHO-504] [--include-opt-in] [--dry-run]
 *   npm run qa:status [--milestone ECHO-505]
 *   npm run qa:report [--stdout]
 *   npm run qa:manual -- --list | --show ID | --history ID | --id ID --result PASS ...
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";
import { definitionHash, loadRegistry, QaError, selectTests, validateRegistry } from "../qa/lib/registry.ts";
import { readHistoryContext } from "../qa/lib/git.ts";
import { evaluateAll, countStatuses } from "../qa/lib/status.ts";
import {
  appendJsonl, automatedResultsFile, manualHistory,
  readAutomatedResults, readManualResults,
} from "../qa/lib/results.ts";
import { runSelectedSuites } from "../qa/lib/runner.ts";
import { recordManualResult, type ManualInput } from "../qa/lib/manual.ts";
import { evidenceExists } from "../qa/lib/paths.ts";
import { buildMarkdownReport, buildStatusTable, statusSummaryLine } from "../qa/lib/report.ts";
import { REVIEWER_ROLES, type HistoryContext, type LoadedRegistry, type StatusContext, type TestState } from "../qa/lib/types.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface ParsedArguments {
  command: string;
  flags: Map<string, string[]>;
  positionals: string[];
}

function parseArguments(argv: string[]): ParsedArguments {
  const [command = "help", ...rest] = argv;
  const flags = new Map<string, string[]>();
  const positionals: string[] = [];
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index];
    if (token.startsWith("--")) {
      const [rawName, inline] = token.slice(2).split("=", 2);
      const name = rawName.trim();
      if (!name) throw new QaError("empty option name");
      let value = inline;
      if (value === undefined) {
        const next = rest[index + 1];
        if (next !== undefined && !next.startsWith("--")) {
          value = next;
          index += 1;
        } else {
          value = "true";
        }
      }
      flags.set(name, [...(flags.get(name) ?? []), value]);
    } else {
      positionals.push(token);
    }
  }
  return { command, flags, positionals };
}

function flag(args: ParsedArguments, name: string): string | null {
  return args.flags.get(name)?.at(-1) ?? null;
}

function has(args: ParsedArguments, name: string): boolean {
  return args.flags.has(name);
}

function listFlag(args: ParsedArguments, name: string): string[] {
  return (args.flags.get(name) ?? []).flatMap((value) => value.split(",")).map((value) => value.trim()).filter(Boolean);
}

function usage(): string {
  return [
    "Echo Devs QA",
    "",
    "npm run qa:validate",
    "npm run qa:run -- [--only unit|UNIT-SUITE|ECHO-505,...] [--include-opt-in] [--dry-run] [--json]",
    "npm run qa:status [--milestone ECHO-505] [--json]",
    "npm run qa:report [--stdout]",
    "npm run qa:manual -- --list",
    "npm run qa:manual -- --show MANUAL-FIREFOX-GLASS",
    "npm run qa:manual -- --id MANUAL-FIREFOX-GLASS --result PASS --reviewer \"Name\" --role owner \\",
    "  --browser \"Firefox 141\" --os \"Fedora 42\" --evidence test-results/manual/firefox/contact.png --notes \"...\"",
    "npm run qa:manual -- --history MANUAL-FIREFOX-GLASS",
    "",
    "Opt-in suites (browser screenshots, PostgreSQL) never run without --include-opt-in.",
  ].join("\n");
}

function context(registry: LoadedRegistry, history: HistoryContext): StatusContext {
  return {
    history,
    definitionHash,
    evidenceExists: (path) => evidenceExists(ROOT, path),
  };
}

function statesFor(registry: LoadedRegistry, history: HistoryContext): TestState[] {
  const automated = readAutomatedResults(ROOT);
  const manual = readManualResults(ROOT);
  const errors = [...automated.errors, ...manual.errors];
  if (errors.length > 0) {
    console.error(`Warning: ${errors.length} malformed result line(s); they were ignored.`);
    for (const error of errors.slice(0, 3)) console.error(`  ${error}`);
  }
  return evaluateAll(registry, automated.records, manual.records, context(registry, history));
}

function commandValidate(): number {
  const file = join(ROOT, "qa", "registry.json");
  const document: unknown = JSON.parse(readFileSync(file, "utf8"));
  const errors = validateRegistry(document);
  if (errors.length > 0) {
    console.error(`Registry invalid:\n- ${errors.join("\n- ")}`);
    return 2;
  }
  const registry = loadRegistry(ROOT);
  const ids = new Set(registry.tests.map((test) => test.id));
  console.log(`Registry OK: ${registry.tests.length} tests (${registry.tests.filter((test) => test.type === "manual").length} manual), ${Object.keys(registry.suites).length} suites, ${ids.size} unique ids.`);
  return 0;
}

function commandRun(args: ParsedArguments): number {
  const registry = loadRegistry(ROOT);
  const history = readHistoryContext(ROOT);
  const selection = selectTests(registry, {
    only: listFlag(args, "only"),
    includeOptIn: has(args, "include-opt-in"),
  });
  if (selection.unknownTokens.length > 0) {
    console.error(`Unknown selection: ${selection.unknownTokens.join(", ")}. Use an id, suite, category or milestone.`);
    return 2;
  }
  const automated = selection.selected.filter((test) => test.type === "automated");
  if (automated.length === 0) {
    console.error("No automated tests selected. Manual cases are recorded with npm run qa:manual.");
    return 2;
  }
  if (selection.skippedOptIn.length > 0) {
    console.log(`Skipped opt-in tests (use --include-opt-in): ${selection.skippedOptIn.map((test) => test.id).join(", ")}`);
  }
  const dryRun = has(args, "dry-run");
  const result = runSelectedSuites({
    root: ROOT,
    registry,
    tests: automated,
    history,
    allowOptIn: has(args, "include-opt-in"),
    dryRun,
    onRecord: (record) => {
      if (!dryRun) appendJsonl(automatedResultsFile(ROOT), record);
    },
    onSuiteStart: (suite, command) => {
      console.log(`\n▶ ${suite}: ${command}`);
    },
  });
  for (const execution of result.executions) {
    const detail = execution.blocker ?? `${execution.exitCode ?? "—"} in ${(execution.durationMs / 1000).toFixed(1)}s`;
    console.log(`${execution.status.padEnd(7)} ${execution.suite.padEnd(16)} ${detail}`);
  }
  if (dryRun) {
    console.log("\nDry run: no commands executed and no results recorded.");
    return 0;
  }
  const states = statesFor(registry, history);
  const counts = countStatuses(states);
  console.log(`\n${statusSummaryLine(counts)}`);
  console.log(`Automated run recorded against ${history.head}${history.dirty ? " (dirty working tree)" : ""}.`);
  if (has(args, "json")) console.log(JSON.stringify({ executions: result.executions, records: result.records }, null, 2));
  return result.exitCode;
}

function commandStatus(args: ParsedArguments): number {
  const registry = loadRegistry(ROOT);
  const history = readHistoryContext(ROOT);
  let states = statesFor(registry, history);
  const milestone = flag(args, "milestone");
  if (milestone) {
    states = states.filter((state) => state.test.milestones.some((item) => item.toLowerCase() === milestone.toLowerCase()));
    if (states.length === 0) {
      console.error(`No tests linked to milestone ${milestone}.`);
      return 2;
    }
  }
  const counts = countStatuses(states);
  if (has(args, "json")) {
    console.log(JSON.stringify({ head: history.head, dirty: history.dirty, counts, tests: states.map((state) => ({ id: state.test.id, type: state.test.type, status: state.status, reason: state.reason, revision: state.sourceRevision, recordedAt: state.recordedAt })) }, null, 2));
    return 0;
  }
  console.log(`HEAD ${history.head}${history.dirty ? " (dirty)" : ""} · ${states.length} tests`);
  console.log(statusSummaryLine(counts));
  console.log("");
  console.log(buildStatusTable(states));
  return 0;
}

function commandReport(args: ParsedArguments): number {
  const registry = loadRegistry(ROOT);
  const history = readHistoryContext(ROOT);
  const states = statesFor(registry, history);
  const counts = countStatuses(states);
  const generatedAt = new Date().toISOString();
  const markdown = buildMarkdownReport({ registry, states, counts, history, generatedAt });
  const output = join(ROOT, "qa", ".out", "qa-report.md");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${markdown}\n`, "utf8");
  if (has(args, "stdout")) console.log(markdown);
  console.log(`Report written to ${output}`);
  console.log(`${statusSummaryLine(counts)}`);
  console.log("Generated reports are ignored by git; results and definitions are version-controlled.");
  return 0;
}

async function promptManual(registry: LoadedRegistry, history: HistoryContext): Promise<number> {
  if (!process.stdin.isTTY) {
    console.error("No interactive terminal. Use --list, --show ID, or --id ID --result PASS --reviewer NAME --role ROLE.");
    return 2;
  }
  const states = statesFor(registry, history);
  const pending = states.filter((state) => state.test.type === "manual" && state.status !== "PASS");
  if (pending.length === 0) {
    console.log("No pending manual cases.");
    return 0;
  }
  pending.forEach((state, index) => {
    console.log(`${index + 1}. ${state.test.id} — ${state.test.title} [${state.status}] (${state.test.gate} gate)`);
  });
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const choice = Number(await readline.question("\nSelect a case number: "));
    const selected = pending[choice - 1];
    if (!selected) {
      console.error("Invalid selection.");
      return 2;
    }
    const test = selected.test;
    console.log(`\n${test.id} — ${test.title}\n\nProcedure:`);
    test.procedure.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
    console.log(`\nExpected: ${test.expected}\nEvidence: ${test.evidence}\n`);
    const result = (await readline.question("Result (PASS/FAIL/BLOCKED): ")).trim().toUpperCase();
    if (!["PASS", "FAIL", "BLOCKED"].includes(result)) {
      console.error("Result must be PASS, FAIL or BLOCKED.");
      return 2;
    }
    const reviewer = (await readline.question("Reviewer name: ")).trim();
    const role = (await readline.question(`Role (${REVIEWER_ROLES.join("/")}): `)).trim().toLowerCase();
    const browser = (await readline.question("Browser/version (optional): ")).trim();
    const device = (await readline.question("Device (optional): ")).trim();
    const os = (await readline.question("OS (optional): ")).trim();
    const evidence = (await readline.question("Evidence paths under test-results/ or qa/evidence/ (comma-separated): ")).trim();
    const notes = (await readline.question("Notes (optional): ")).trim();
    const findings = (await readline.question("Findings (required for FAIL): ")).trim();
    const blocker = result === "BLOCKED" ? (await readline.question("Blocker: ")).trim() : "";
    const input: ManualInput = {
      testId: test.id,
      result: result as ManualInput["result"],
      reviewer,
      role: role as ManualInput["role"],
      browser, device, os,
      evidence: evidence.split(",").map((item) => item.trim()).filter(Boolean),
      notes, findings, blocker,
    };
    const record = recordManualResult({ root: ROOT, registry, history, input });
    console.log(`\nRecorded ${record.result} for ${record.testId} at ${record.recordedAt} (source ${record.sourceRevision.slice(0, 8)}).`);
    return 0;
  } finally {
    readline.close();
  }
}

async function commandManual(args: ParsedArguments): Promise<number> {
  const registry = loadRegistry(ROOT);
  const history = readHistoryContext(ROOT);
  if (has(args, "list")) {
    const states = statesFor(registry, history).filter((state) => state.test.type === "manual" && state.status !== "PASS");
    console.log("Pending manual cases:");
    for (const state of states) console.log(`- ${state.test.id} [${state.status}] ${state.test.title} (${state.test.gate} gate) — ${state.reason}`);
    console.log("\nShow a procedure: npm run qa:manual -- --show MANUAL-FIREFOX-GLASS");
    console.log("Record a result: npm run qa:manual -- --id MANUAL-FIREFOX-GLASS --result PASS --reviewer \"Name\" --role owner --browser \"Firefox 141\" --os \"Fedora 42\" --evidence test-results/manual/firefox/contact.png");
    return 0;
  }
  const show = flag(args, "show");
  if (show) {
    const test = registry.tests.find((candidate) => candidate.id.toLowerCase() === show.toLowerCase());
    if (!test || test.type !== "manual") {
      console.error(`Unknown manual test: ${show}`);
      return 2;
    }
    console.log(`${test.id} — ${test.title}`);
    console.log(`Gate: ${test.gate} · Milestones: ${test.milestones.join(", ") || "—"}`);
    console.log("\nProcedure:");
    test.procedure.forEach((step, index) => console.log(`  ${index + 1}. ${step}`));
    console.log(`\nExpected: ${test.expected}`);
    console.log(`Required evidence: ${test.evidence}`);
    return 0;
  }
  const historyId = flag(args, "history");
  if (historyId) {
    const records = manualHistory(readManualResults(ROOT).records, historyId);
    if (records.length === 0) {
      console.log(`No manual results recorded for ${historyId}.`);
      return 0;
    }
    for (const record of records) {
      console.log(`${record.recordedAt} · ${record.result} · ${record.reviewer} (${record.role}) · source ${record.sourceRevision.slice(0, 8)}${record.worktreeDirty ? " dirty" : ""}`);
      if (record.browser || record.os) console.log(`  browser: ${record.browser || "—"} · os: ${record.os || "—"} · device: ${record.device || "—"}`);
      if (record.evidence.length > 0) console.log(`  evidence: ${record.evidence.join(", ")}`);
      if (record.notes) console.log(`  notes: ${record.notes}`);
      if (record.findings) console.log(`  findings: ${record.findings}`);
      if (record.blocker) console.log(`  blocker: ${record.blocker}`);
      if (record.supersedes) console.log(`  supersedes: ${record.supersedes}`);
    }
    return 0;
  }

  const id = flag(args, "id");
  const result = flag(args, "result")?.toUpperCase();
  if (!id || !result) return promptManual(registry, history);
  const input: ManualInput = {
    testId: id,
    result: result as ManualInput["result"],
    reviewer: flag(args, "reviewer")?.trim() ?? "",
    role: (flag(args, "role")?.trim().toLowerCase() ?? "") as ManualInput["role"],
    browser: flag(args, "browser") ?? "",
    device: flag(args, "device") ?? "",
    os: flag(args, "os") ?? "",
    evidence: listFlag(args, "evidence"),
    notes: flag(args, "notes") ?? "",
    findings: flag(args, "findings") ?? "",
    blocker: flag(args, "blocker") ?? "",
  };
  const record = recordManualResult({ root: ROOT, registry, history, input });
  console.log(`Recorded ${record.result} for ${record.testId} at ${record.recordedAt} (source ${record.sourceRevision.slice(0, 8)}${record.worktreeDirty ? ", dirty tree" : ""}).`);
  if (record.evidence.length === 0 && registry.tests.find((test) => test.id === record.testId)?.evidenceRequired) {
    console.log("Warning: this case requires evidence; status will remain REVIEW_REQUIRED until a path is recorded.");
  }
  return 0;
}

async function main(): Promise<number> {
  const args = parseArguments(process.argv.slice(2));
  switch (args.command) {
    case "run": return commandRun(args);
    case "status": return commandStatus(args);
    case "report": return commandReport(args);
    case "manual": return commandManual(args);
    case "validate": return commandValidate();
    case "help":
    case "--help":
    case "-h":
      console.log(usage());
      return 0;
    default:
      console.error(`Unknown command: ${args.command}\n\n${usage()}`);
      return 2;
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    if (error instanceof QaError) console.error(`QA error: ${error.message}`);
    else console.error(error instanceof Error ? error.stack ?? error.message : String(error));
    process.exitCode = 2;
  });
