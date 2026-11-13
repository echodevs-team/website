/** Registry loading, validation, identity hashing and selection. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  CATEGORIES, CRITICALITIES, GATES, TEST_TYPES,
  type Category, type Criticality, type Gate, type LoadedRegistry,
  type SuiteDefinition, type TestDefinition, type TestType,
} from "./types.ts";

export class QaError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringArray(value: unknown, path: string, errors: string[]): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    errors.push(`${path} must be an array of non-empty strings`);
    return [];
  }
  return value.map((item) => (item as string).trim());
}

function optionalString(value: unknown, path: string, errors: string[]): string {
  if (value === undefined) return "";
  if (typeof value !== "string") {
    errors.push(`${path} must be a string`);
    return "";
  }
  return value;
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], path: string, errors: string[]): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    errors.push(`${path} must be one of ${allowed.join(", ")}`);
    return allowed[0];
  }
  return value as T;
}

function normalizeSuite(raw: unknown, name: string, errors: string[]): SuiteDefinition {
  if (!isRecord(raw)) {
    errors.push(`suites.${name} must be an object`);
    return { command: "", timeoutMs: 0, optIn: false, note: "", requiresCommand: [], requiresModule: [], requiresPath: [] };
  }
  if (typeof raw.command !== "string" || raw.command.trim() === "") {
    errors.push(`suites.${name}.command must be a non-empty string`);
  }
  if (typeof raw.timeoutMs !== "number" || !Number.isFinite(raw.timeoutMs) || raw.timeoutMs <= 0) {
    errors.push(`suites.${name}.timeoutMs must be a positive number`);
  }
  if (raw.optIn !== undefined && typeof raw.optIn !== "boolean") {
    errors.push(`suites.${name}.optIn must be a boolean`);
  }
  const requiresModule = stringArray(raw.requiresModule, `suites.${name}.requiresModule`, errors);
  for (const moduleName of requiresModule) {
    if (!/^[A-Za-z_][A-Za-z0-9_.]*$/u.test(moduleName)) {
      errors.push(`suites.${name}.requiresModule contains an invalid module name: ${moduleName}`);
    }
  }
  return {
    command: typeof raw.command === "string" ? raw.command.trim() : "",
    timeoutMs: typeof raw.timeoutMs === "number" ? raw.timeoutMs : 0,
    optIn: raw.optIn === true,
    note: optionalString(raw.note, `suites.${name}.note`, errors),
    requiresCommand: stringArray(raw.requiresCommand, `suites.${name}.requiresCommand`, errors),
    requiresModule,
    requiresPath: stringArray(raw.requiresPath, `suites.${name}.requiresPath`, errors),
  };
}

function normalizeTest(raw: unknown, index: number, suites: Record<string, SuiteDefinition>, defaultWatch: string[], errors: string[]): TestDefinition {
  const path = `tests[${index}]`;
  if (!isRecord(raw)) {
    errors.push(`${path} must be an object`);
    return {
      id: "", title: "", category: "unit", type: "automated", suite: null, milestones: [],
      routes: [], locales: [], viewports: [], procedure: [], expected: "", evidence: "",
      evidenceRequired: true, criticality: "medium", gate: "technical", releaseRelevant: false, watch: defaultWatch,
    };
  }
  const id = typeof raw.id === "string" ? raw.id.trim() : "";
  if (!/^[A-Z][A-Z0-9-]{2,}$/u.test(id)) errors.push(`${path}.id must be an uppercase identifier such as UNIT-SUITE`);
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  if (!title) errors.push(`${path}.title is required`);
  const category = oneOf<Category>(raw.category, CATEGORIES, `${path}.category`, errors);
  const type = oneOf<TestType>(raw.type, TEST_TYPES, `${path}.type`, errors);
  const suite = raw.suite === undefined || raw.suite === null ? null : String(raw.suite);
  if (type === "automated" && (!suite || !suites[suite])) errors.push(`${path}.suite must reference a defined suite for automated tests`);
  if (type === "manual" && suite) errors.push(`${path}.suite must not be set for manual tests`);
  const procedure = stringArray(raw.procedure, `${path}.procedure`, errors);
  if (type === "manual" && procedure.length === 0) errors.push(`${path}.procedure is required for manual tests`);
  const expected = typeof raw.expected === "string" ? raw.expected.trim() : "";
  if (!expected) errors.push(`${path}.expected is required`);
  const evidence = typeof raw.evidence === "string" ? raw.evidence.trim() : "";
  if (!evidence) errors.push(`${path}.evidence is required`);
  if (raw.evidenceRequired !== undefined && typeof raw.evidenceRequired !== "boolean") {
    errors.push(`${path}.evidenceRequired must be a boolean`);
  }
  const releaseRelevant = raw.releaseRelevant === true;
  const watch = raw.watch === undefined ? defaultWatch : stringArray(raw.watch, `${path}.watch`, errors);
  return {
    id,
    title,
    category,
    type,
    suite,
    milestones: stringArray(raw.milestones, `${path}.milestones`, errors),
    routes: stringArray(raw.routes, `${path}.routes`, errors),
    locales: stringArray(raw.locales, `${path}.locales`, errors),
    viewports: stringArray(raw.viewports, `${path}.viewports`, errors),
    procedure,
    expected,
    evidence,
    evidenceRequired: raw.evidenceRequired !== false,
    criticality: oneOf<Criticality>(raw.criticality, CRITICALITIES, `${path}.criticality`, errors),
    gate: raw.gate === undefined ? "technical" : oneOf<Gate>(raw.gate, GATES, `${path}.gate`, errors),
    releaseRelevant,
    watch,
  };
}

/** Validate a parsed registry document and return human-readable problems. */
export function validateRegistry(value: unknown): string[] {
  const errors: string[] = [];
  if (!isRecord(value)) return ["registry must be an object"];
  if (value.version !== 1) errors.push("version must be 1");
  if (typeof value.freshnessPolicy !== "string" || value.freshnessPolicy.trim() === "") {
    errors.push("freshnessPolicy must document the freshness rules");
  }
  const defaultWatch = stringArray(value.defaultWatch, "defaultWatch", errors);
  if (defaultWatch.length === 0) errors.push("defaultWatch must list at least one path glob");
  const suites: Record<string, SuiteDefinition> = {};
  if (!isRecord(value.suites) || Object.keys(value.suites).length === 0) {
    errors.push("suites must define at least one suite");
  } else {
    for (const [name, raw] of Object.entries(value.suites)) {
      if (!/^[a-z][a-z0-9-]*$/u.test(name)) errors.push(`suite name is invalid: ${name}`);
      suites[name] = normalizeSuite(raw, name, errors);
    }
  }
  if (!Array.isArray(value.tests) || value.tests.length === 0) {
    errors.push("tests must define at least one test");
    return errors;
  }
  const normalized = value.tests.map((raw, index) => normalizeTest(raw, index, suites, defaultWatch, errors));
  const seen = new Set<string>();
  for (const test of normalized) {
    if (seen.has(test.id)) errors.push(`duplicate test id: ${test.id}`);
    seen.add(test.id);
  }
  return errors;
}

export function parseRegistry(value: unknown): LoadedRegistry {
  const errors = validateRegistry(value);
  if (errors.length > 0) throw new QaError(`Invalid QA registry:\n- ${errors.join("\n- ")}`);
  const document = value as {
    version: number;
    freshnessPolicy: string;
    defaultWatch: string[];
    suites: Record<string, SuiteDefinition>;
    tests: unknown[];
  };
  const suites: Record<string, SuiteDefinition> = {};
  for (const [name, raw] of Object.entries(document.suites)) {
    suites[name] = normalizeSuite(raw, name, []);
  }
  const tests = (document.tests as unknown[]).map((raw, index) => normalizeTest(raw, index, suites, document.defaultWatch, []));
  return {
    version: document.version,
    freshnessPolicy: document.freshnessPolicy,
    defaultWatch: document.defaultWatch,
    suites,
    tests,
  };
}

export function loadRegistry(root: string): LoadedRegistry {
  const file = join(root, "qa", "registry.json");
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch (error) {
    throw new QaError(`Cannot read ${file}: ${(error as Error).message}`);
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new QaError(`Cannot parse ${file}: ${(error as Error).message}`);
  }
  return parseRegistry(parsed);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Hash a test definition so edited cases cannot inherit old results. */
export function definitionHash(test: TestDefinition): string {
  return `sha256:${createHash("sha256").update(stableStringify(test)).digest("hex")}`;
}

export interface Selection {
  selected: TestDefinition[];
  skippedOptIn: TestDefinition[];
  unknownTokens: string[];
}

/**
 * Select tests by id, suite, category or milestone. Without `only`, every
 * non-opt-in test is selected; opt-in suites need `includeOptIn`.
 */
export function selectTests(
  registry: LoadedRegistry,
  options: { only?: string[]; includeOptIn?: boolean } = {},
): Selection {
  const tokens = (options.only ?? []).map((token) => token.trim()).filter(Boolean);
  const unknownTokens: string[] = [];
  let candidates = registry.tests;
  if (tokens.length > 0) {
    const matched = new Set<string>();
    for (const token of tokens) {
      const lower = token.toLowerCase();
      const hits = registry.tests.filter((test) =>
        test.id.toLowerCase() === lower ||
        (test.suite !== null && test.suite.toLowerCase() === lower) ||
        test.category.toLowerCase() === lower ||
        test.milestones.some((milestone) => milestone.toLowerCase() === lower),
      );
      if (hits.length === 0) unknownTokens.push(token);
      for (const hit of hits) matched.add(hit.id);
    }
    candidates = registry.tests.filter((test) => matched.has(test.id));
  }
  const selected: TestDefinition[] = [];
  const skippedOptIn: TestDefinition[] = [];
  for (const test of candidates) {
    const optIn = test.type === "automated" && test.suite !== null && registry.suites[test.suite]?.optIn === true;
    if (optIn && !options.includeOptIn) skippedOptIn.push(test);
    else selected.push(test);
  }
  return { selected, skippedOptIn, unknownTokens };
}

/** Shared suites must run once even when several tests map to them. */
export function groupBySuite(registry: LoadedRegistry, tests: TestDefinition[]): Array<{ suite: string; suiteDefinition: SuiteDefinition; tests: TestDefinition[] }> {
  const groups = new Map<string, TestDefinition[]>();
  for (const test of tests) {
    if (test.type !== "automated" || !test.suite) continue;
    const list = groups.get(test.suite) ?? [];
    list.push(test);
    groups.set(test.suite, list);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([suite, suiteTests]) => ({ suite, suiteDefinition: registry.suites[suite], tests: suiteTests }));
}
