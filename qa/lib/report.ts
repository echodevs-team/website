/** Human-readable status tables and Markdown reports with provenance. */
import { CATEGORIES, type HistoryContext, type LoadedRegistry, type Status, type TestState } from "./types.ts";
import type { StatusCounts } from "./status.ts";

export function shortRevision(revision: string | null): string {
  return revision ? revision.slice(0, 8) : "—";
}

function csv(statuses: Status[]): string {
  return statuses.join(" · ");
}

export function buildStatusTable(states: readonly TestState[]): string {
  const header = ["TEST", "TYPE", "STATUS", "REV", "UPDATED", "NOTE"];
  const rows: string[][] = [];
  for (const category of CATEGORIES) {
    const group = states.filter((state) => state.test.category === category);
    if (group.length === 0) continue;
    rows.push([`— ${category} —`, "", "", "", "", ""]);
    for (const state of group) {
      rows.push([
        state.test.id,
        state.test.type,
        state.status,
        shortRevision(state.sourceRevision),
        state.recordedAt ? state.recordedAt.slice(0, 16).replace("T", " ") : "—",
        state.reason.replace(/\s+/gu, " ").slice(0, 96),
      ]);
    }
  }
  const widths = header.map((_, column) => Math.max(header[column].length, ...rows.map((row) => row[column].length)));
  const line = (row: string[]) => row.map((cell, index) => cell.padEnd(widths[index])).join("  ").trimEnd();
  return [line(header), widths.map((width) => "-".repeat(width)).join("  "), ...rows.map(line)].join("\n");
}

export interface MilestoneSummary {
  milestone: string;
  automatedPass: number;
  automatedTotal: number;
  manualPass: number;
  manualTotal: number;
  ownerGates: number;
  state: string;
}

export function milestoneSummaries(states: readonly TestState[]): MilestoneSummary[] {
  const milestones = [...new Set(states.flatMap((state) => state.test.milestones))].sort();
  return milestones.map((milestone) => {
    const tests = states.filter((state) => state.test.milestones.includes(milestone));
    const automated = tests.filter((state) => state.test.type === "automated");
    const manual = tests.filter((state) => state.test.type === "manual");
    const ownerGates = tests.filter((state) => state.test.gate !== "technical").length;
    const automatedPass = automated.filter((state) => state.status === "PASS").length;
    const manualPass = manual.filter((state) => state.status === "PASS").length;
    let state = "evidence complete (QA only)";
    if (tests.some((test) => test.status === "FAIL")) state = "failing";
    else if (tests.some((test) => test.status === "BLOCKED")) state = "blocked";
    else if (automated.some((test) => test.status !== "PASS")) state = "automated gaps";
    else if (manual.some((test) => test.status !== "PASS")) state = "manual/owner pending";
    return {
      milestone,
      automatedPass,
      automatedTotal: automated.length,
      manualPass,
      manualTotal: manual.length,
      ownerGates,
      state,
    };
  });
}

export interface ReportOptions {
  registry: LoadedRegistry;
  states: readonly TestState[];
  counts: StatusCounts;
  history: HistoryContext;
  generatedAt: string;
  command?: string;
}

export function buildMarkdownReport(options: ReportOptions): string {
  const { registry, states, counts, history, generatedAt, command = "npm run qa:report" } = options;
  const releaseRelevant = states.filter((state) => state.test.releaseRelevant);
  const automatedRelease = releaseRelevant.filter((state) => state.test.type === "automated");
  // An empty set proves nothing: only real passing tests can count as verified.
  const automatedComplete = automatedRelease.length > 0 && automatedRelease.every((state) => state.status === "PASS");
  const newestFreshPass = states
    .filter((state) => state.test.type === "automated" && state.status === "PASS")
    .sort((left, right) => `${right.recordedAt}`.localeCompare(`${left.recordedAt}`))[0];
  const blocked = states.filter((state) => state.status === "BLOCKED");
  const failed = states.filter((state) => state.status === "FAIL");
  const stale = states.filter((state) => state.status === "STALE");
  const review = states.filter((state) => state.status === "REVIEW_REQUIRED");
  const pending = states.filter((state) => state.status === "NOT_RUN" || state.status === "RUNNING");
  const ownerGates = states.filter((state) => state.test.gate !== "technical");
  const ownerPending = ownerGates.filter((state) => state.status !== "PASS");

  const lines: string[] = [];
  lines.push("# Echo Devs — QA report", "");
  lines.push(`- Generated: ${generatedAt}`);
  lines.push(`- Command: \`${command}\``);
  lines.push(`- Source revision: \`${history.head}\`${history.dirty ? " (dirty working tree)" : " (clean)"}`);
  lines.push(`- Registry version: ${registry.version}`);
  lines.push("- This report is generated from committed definitions and recorded results. It is not owner or legal sign-off.", "");
  lines.push("## Coverage", "");
  lines.push(`- Tests: ${counts.total} (${counts.automated} automated, ${counts.manual} manual)`);
  lines.push(`- PASS ${counts.byStatus.PASS} · FAIL ${counts.byStatus.FAIL} · BLOCKED ${counts.byStatus.BLOCKED} · STALE ${counts.byStatus.STALE} · REVIEW_REQUIRED ${counts.byStatus.REVIEW_REQUIRED} · NOT_RUN ${counts.byStatus.NOT_RUN} · RUNNING ${counts.byStatus.RUNNING}`);
  lines.push(`- Last verified revision: ${automatedComplete ? `\`${history.head}\` (all release-relevant automated tests PASS)` : newestFreshPass ? `not at HEAD; most recent fresh automated PASS: \`${newestFreshPass.sourceRevision}\`` : "none recorded"}`, "");
  lines.push("## Automated verification", "");
  const automated = states.filter((state) => state.test.type === "automated");
  lines.push("| Test | Status | Revision | Recorded | Evidence |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const state of automated) {
    const evidence = state.logPath ?? (state.evidence.length > 0 ? state.evidence.join("<br>") : "—");
    lines.push(`| ${state.test.id} | ${state.status} | ${shortRevision(state.sourceRevision)} | ${state.recordedAt ?? "—"} | ${evidence} |`);
  }
  lines.push("", "## Manual verification", "");
  const manual = states.filter((state) => state.test.type === "manual");
  lines.push("| Test | Status | Reviewer | Gate | Recorded | Evidence |");
  lines.push("| --- | --- | --- | --- | --- | --- |");
  for (const state of manual) {
    lines.push(`| ${state.test.id} | ${state.status} | ${state.manual ? `${state.manual.reviewer} (${state.manual.role})` : "—"} | ${state.test.gate} | ${state.recordedAt ?? "—"} | ${state.evidence.length > 0 ? state.evidence.join("<br>") : "—"} |`);
  }
  lines.push("", "## Pending, failing and blocked", "");
  if (pending.length === 0 && failed.length === 0 && blocked.length === 0 && stale.length === 0 && review.length === 0) {
    lines.push("Nothing pending, failing, blocked or stale.");
  } else {
    for (const state of [...failed, ...blocked, ...review, ...stale, ...pending]) {
      const detail = state.blocker ?? state.reason;
      lines.push(`- **${state.test.id}** — ${state.status}: ${detail}`);
    }
  }
  lines.push("", "## Milestone readiness", "");
  lines.push("QA can prove automated verification and recorded manual outcomes; it does not declare implementation or business acceptance.", "");
  lines.push("| Milestone | Automated PASS | Manual PASS | Owner/legal gates | QA state |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const milestone of milestoneSummaries(states)) {
    lines.push(`| ${milestone.milestone} | ${milestone.automatedPass}/${milestone.automatedTotal} | ${milestone.manualPass}/${milestone.manualTotal} | ${milestone.ownerGates} test(s) | ${milestone.state} |`);
  }
  lines.push("", "## Release gates", "");
  const releaseMissing = releaseRelevant.filter((state) => state.status !== "PASS");
  const releaseReady = releaseMissing.length === 0 && ownerPending.length === 0;
  lines.push(`- Release ready: **${releaseReady ? "YES" : "NO"}**`);
  lines.push("- Implementation complete: not inferred by QA; see `ROADMAP.md`.");
  lines.push(`- Automated verification: ${automatedRelease.length === 0 ? "no release-relevant automated tests defined" : `${automatedRelease.filter((state) => state.status === "PASS").length}/${automatedRelease.length} release-relevant automated tests PASS at a current revision`}.`);
  lines.push(`- Manual acceptance: ${releaseRelevant.filter((state) => state.test.type === "manual" && state.status === "PASS").length}/${releaseRelevant.filter((state) => state.test.type === "manual").length} release-relevant manual tests PASS.`);
  lines.push(`- Owner/legal sign-off: ${ownerGates.filter((state) => state.status === "PASS").length}/${ownerGates.length} gate tests PASS.`);
  if (releaseMissing.length > 0) {
    lines.push(`- Outstanding release tests: ${releaseMissing.map((state) => `${state.test.id} (${state.status})`).join(", ")}.`);
  }
  if (ownerPending.length > 0) {
    lines.push(`- Outstanding owner/legal gates: ${ownerPending.map((state) => `${state.test.id} (${state.test.gate}, ${state.status})`).join(", ")}.`);
  }
  lines.push("", "## Evidence index", "");
  if (states.every((state) => !state.sourceRevision)) {
    lines.push("No results recorded yet.");
  } else {
    for (const state of states.filter((test) => test.sourceRevision)) {
      const references = [...state.evidence, ...(state.logPath ? [state.logPath] : [])];
      lines.push(`- ${state.test.id} (${state.status}) — source \`${state.sourceRevision}\`${state.worktreeDirty ? " from a dirty tree" : ""}; ${references.length > 0 ? references.join(", ") : "no evidence path recorded"}.`);
    }
  }
  lines.push("", "## Status table", "", "```text", buildStatusTable(states), "```", "");
  lines.push("## Freshness policy", "", registry.freshnessPolicy, "");
  return lines.join("\n");
}

export function statusSummaryLine(counts: StatusCounts): string {
  return `PASS ${counts.byStatus.PASS} | FAIL ${counts.byStatus.FAIL} | BLOCKED ${counts.byStatus.BLOCKED} | STALE ${counts.byStatus.STALE} | REVIEW_REQUIRED ${counts.byStatus.REVIEW_REQUIRED} | NOT_RUN ${counts.byStatus.NOT_RUN} | RUNNING ${counts.byStatus.RUNNING}`;
}

export function groupStatuses(states: readonly TestState[]): string {
  return csv(states.map((state) => state.status));
}
