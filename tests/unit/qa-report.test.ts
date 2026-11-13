import { describe, expect, it } from "vitest";
import { parseRegistry } from "../../qa/lib/registry.ts";
import { countStatuses, evaluateAll } from "../../qa/lib/status.ts";
import { buildMarkdownReport, buildStatusTable, milestoneSummaries } from "../../qa/lib/report.ts";
import {
  automatedRecord, baseRegistryDocument, fakeHistory, manualRecord, statusContext, testById,
} from "./qa-fixtures.ts";

const registry = parseRegistry(baseRegistryDocument());
const history = fakeHistory();

function report(
  automated: Parameters<typeof evaluateAll>[1] = [],
  manual: Parameters<typeof evaluateAll>[2] = [],
  evidence: string[] = [],
) {
  const states = evaluateAll(registry, automated, manual, statusContext(registry, { evidence }));
  return {
    states,
    markdown: buildMarkdownReport({
      registry,
      states,
      counts: countStatuses(states),
      history,
      generatedAt: "2026-11-13T12:00:00.000Z",
    }),
  };
}

describe("QA report generation", () => {
  it("states its provenance and does not claim release readiness from nothing", () => {
    const { markdown } = report();
    expect(markdown).toContain("# Echo Devs — QA report");
    expect(markdown).toContain("- Generated: 2026-11-13T12:00:00.000Z");
    expect(markdown).toContain("- Source revision:");
    expect(markdown).toContain("Registry version: 1");
    expect(markdown).toContain("It is not owner or legal sign-off");
    expect(markdown).toContain("- Release ready: **NO**");
    expect(markdown).toContain("Last verified revision: none recorded");
    expect(markdown).toContain("NOT_RUN 7");
  });

  it("lists pending manual tests and owner/legal gates explicitly", () => {
    const { markdown } = report();
    expect(markdown).toContain("**MANUAL-OWNER** — NOT_RUN");
    expect(markdown).toContain("**MANUAL-LEGAL** — NOT_RUN");
    expect(markdown).toContain("Outstanding owner/legal gates:");
    expect(markdown).toContain("MANUAL-LEGAL (legal, NOT_RUN)");
    expect(markdown).toContain("| M3 | 0/0 | 0/1 | 1 test(s) | manual/owner pending |");
  });

  it("reports automated verification without turning it into acceptance", () => {
    const automated = ["UNIT-ONE", "UNIT-TWO", "OPT-IN-ONE", "NEEDS-ONE"]
      .map((id) => automatedRecord(testById(registry, id)));
    const { markdown } = report(automated);
    expect(markdown).toContain("| UNIT-ONE | PASS |");
    expect(markdown).toContain("- Automated verification: 2/2 release-relevant automated tests PASS");
    // All release-relevant manual cases are still unverified.
    expect(markdown).toContain("- Release ready: **NO**");
    expect(markdown).toContain("manual/owner pending");
  });

  it("only reports release ready when every release test and gate passed with evidence", () => {
    const automated = ["UNIT-ONE", "UNIT-TWO", "OPT-IN-ONE", "NEEDS-ONE"]
      .map((id) => automatedRecord(testById(registry, id)));
    const manual = [
      manualRecord(testById(registry, "MANUAL-TECH"), { role: "qa", evidence: ["test-results/manual/glass.png"] }),
      manualRecord(testById(registry, "MANUAL-OWNER"), { role: "owner", evidence: ["qa/evidence/MANUAL-OWNER/approval.md"] }),
      manualRecord(testById(registry, "MANUAL-LEGAL"), { role: "legal", evidence: ["qa/evidence/MANUAL-LEGAL/approval.md"] }),
    ];
    const { markdown } = report(automated, manual, [
      "test-results/manual/glass.png",
      "qa/evidence/MANUAL-OWNER/approval.md",
      "qa/evidence/MANUAL-LEGAL/approval.md",
    ]);
    expect(markdown).toContain("- Release ready: **YES**");
    expect(markdown).toContain("Manual acceptance: 3/3 release-relevant manual tests PASS");
    expect(markdown).toContain("Owner/legal sign-off: 2/2 gate tests PASS");
  });

  it("surfaces a stale result instead of a silent PASS", () => {
    const record = automatedRecord(testById(registry, "UNIT-ONE"), { worktreeDirty: true });
    const { markdown, states } = report([record]);
    expect(states.find((state) => state.test.id === "UNIT-ONE")?.status).toBe("STALE");
    expect(markdown).toContain("**UNIT-ONE** — STALE");
    expect(markdown).toContain("from a dirty tree");
  });

  it("includes the freshness policy and a status table", () => {
    const { markdown } = report();
    expect(markdown).toContain("## Freshness policy");
    expect(markdown).toContain("Fixture policy");
    expect(markdown).toContain("```text");
    expect(buildStatusTable(report().states)).toContain("UNIT-TWO");
  });

  it("summarises milestone readiness per milestone", () => {
    const summaries = milestoneSummaries(report().states);
    const m1 = summaries.find((summary) => summary.milestone === "M1");
    expect(m1).toMatchObject({ automatedTotal: 2, manualTotal: 2, ownerGates: 1, state: "automated gaps" });
  });
});
