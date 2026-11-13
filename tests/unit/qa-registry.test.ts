import { describe, expect, it } from "vitest";
import {
  definitionHash, parseRegistry, selectTests, validateRegistry,
} from "../../qa/lib/registry.ts";
import { globToRegExp, matchesAny } from "../../qa/lib/glob.ts";
import { baseRegistryDocument, testById } from "./qa-fixtures.ts";

function withDocument(patch: (document: Record<string, unknown>) => void): string[] {
  const document = baseRegistryDocument();
  patch(document);
  return validateRegistry(document);
}

describe("QA registry schema", () => {
  it("accepts the shipped registry document and applies documented defaults", () => {
    const registry = parseRegistry(baseRegistryDocument());
    expect(validateRegistry(baseRegistryDocument())).toEqual([]);
    expect(registry.tests).toHaveLength(7);
    const automatic = testById(registry, "UNIT-ONE");
    expect(automatic.gate).toBe("technical");
    expect(automatic.watch).toEqual(["src/**"]);
    expect(automatic.evidenceRequired).toBe(true);
    expect(automatic.releaseRelevant).toBe(true);
    const owner = testById(registry, "MANUAL-OWNER");
    expect(owner.gate).toBe("owner");
    expect(owner.watch).toEqual([]);
  });

  it("rejects duplicate test ids", () => {
    const errors = withDocument((document) => {
      const tests = document.tests as Array<Record<string, unknown>>;
      tests.push({ ...tests[0] });
    });
    expect(errors.some((error) => error.includes("duplicate test id: UNIT-ONE"))).toBe(true);
  });

  it("rejects unknown categories, criticalities and gates", () => {
    const errors = withDocument((document) => {
      const tests = document.tests as Array<Record<string, unknown>>;
      tests[0].category = "vibes";
      tests[1].criticality = "urgent";
      tests[2].gate = "manager";
    });
    expect(errors.some((error) => error.includes("category must be one of"))).toBe(true);
    expect(errors.some((error) => error.includes("criticality must be one of"))).toBe(true);
    expect(errors.some((error) => error.includes("gate must be one of"))).toBe(true);
  });

  it("rejects malformed ids, missing copy and a manual case without a procedure", () => {
    const errors = withDocument((document) => {
      const tests = document.tests as Array<Record<string, unknown>>;
      tests[0].id = "lower-case";
      tests[1].title = "  ";
      tests[2].expected = "";
      tests[3].suite = null;
      const manual = tests[4];
      manual.procedure = [];
      manual.evidence = "";
    });
    expect(errors.some((error) => error.includes("must be an uppercase identifier"))).toBe(true);
    expect(errors.some((error) => error.includes("title is required"))).toBe(true);
    expect(errors.some((error) => error.includes("expected is required"))).toBe(true);
    expect(errors.some((error) => error.includes("procedure is required for manual tests"))).toBe(true);
    expect(errors.some((error) => error.includes("evidence is required"))).toBe(true);
  });

  it("requires automated suites to exist and manual cases to omit one", () => {
    const errors = withDocument((document) => {
      const tests = document.tests as Array<Record<string, unknown>>;
      tests[0].suite = "missing-suite";
      tests[4].suite = "unit";
    });
    expect(errors.some((error) => error.includes("must reference a defined suite"))).toBe(true);
    expect(errors.some((error) => error.includes("must not be set for manual tests"))).toBe(true);
  });

  it("rejects an empty registry, an unknown version and a missing freshness policy", () => {
    expect(validateRegistry({})).not.toEqual([]);
    expect(validateRegistry({ ...baseRegistryDocument(), version: 2 })).toContain("version must be 1");
    expect(validateRegistry({ ...baseRegistryDocument(), freshnessPolicy: " " }))
      .toContain("freshnessPolicy must document the freshness rules");
    expect(validateRegistry({ ...baseRegistryDocument(), tests: [] })).toContain("tests must define at least one test");
  });
});

describe("QA definition hashing", () => {
  it("is stable across key order and changes when the definition changes", () => {
    const registry = parseRegistry(baseRegistryDocument());
    const original = testById(registry, "UNIT-ONE");
    const reordered = Object.fromEntries(Object.entries(original).reverse()) as unknown as typeof original;
    expect(definitionHash(reordered)).toBe(definitionHash(original));
    expect(definitionHash({ ...original, expected: "something else" })).not.toBe(definitionHash(original));
  });
});

describe("QA selection", () => {
  const registry = parseRegistry(baseRegistryDocument());

  it("selects by id, suite, category and milestone", () => {
    expect(selectTests(registry, { only: ["UNIT-ONE"] }).selected.map((test) => test.id)).toEqual(["UNIT-ONE"]);
    expect(selectTests(registry, { only: ["unit"] }).selected.map((test) => test.id)).toEqual(["UNIT-ONE", "UNIT-TWO"]);
    expect(selectTests(registry, { only: ["visual"] }).selected.map((test) => test.id))
      .toEqual(["MANUAL-TECH", "MANUAL-OWNER"]);
    expect(selectTests(registry, { only: ["m2"], includeOptIn: true }).selected.map((test) => test.id).sort())
      .toEqual(["NEEDS-ONE", "OPT-IN-ONE", "UNIT-TWO"]);
  });

  it("reports unknown tokens instead of silently running everything", () => {
    const selection = selectTests(registry, { only: ["NOPE"] });
    expect(selection.selected).toEqual([]);
    expect(selection.unknownTokens).toEqual(["NOPE"]);
  });

  it("skips opt-in suites unless they are explicitly requested", () => {
    const withoutOptIn = selectTests(registry);
    expect(withoutOptIn.selected.map((test) => test.id)).not.toContain("OPT-IN-ONE");
    expect(withoutOptIn.skippedOptIn.map((test) => test.id)).toEqual(["OPT-IN-ONE"]);
    const withOptIn = selectTests(registry, { includeOptIn: true });
    expect(withOptIn.selected.map((test) => test.id)).toContain("OPT-IN-ONE");
  });
});

describe("QA watch globs", () => {
  it("keeps single-star inside one segment and lets double-star cross directories", () => {
    expect(globToRegExp("src/*.ts").test("src/a.ts")).toBe(true);
    expect(globToRegExp("src/*.ts").test("src/deep/a.ts")).toBe(false);
    expect(globToRegExp("src/**").test("src/deep/a.ts")).toBe(true);
    expect(globToRegExp("src/**/*.css").test("src/styles/header.css")).toBe(true);
    expect(globToRegExp("src/**/*.css").test("src/header.css")).toBe(true);
    expect(globToRegExp("src/**/*.css").test("src/header.ts")).toBe(false);
  });

  it("matches a changed path against the watched list", () => {
    expect(matchesAny("src/styles/header.css", ["src/styles/**", "package.json"])).toBe(true);
    expect(matchesAny("package-lock.json", ["src/styles/**", "package.json"])).toBe(false);
    expect(matchesAny("docs/ECHO-VF01.md", ["src/**"])).toBe(false);
  });
});
