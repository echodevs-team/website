// Prove that the same lint/typecheck commands used in CI fail for real defects.
// Copy only known source/config files, never .env, Git state or reference assets.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cp, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporary = await mkdtemp(join(tmpdir(), "echo-ci-negative-"));
const inputs = [
  "package.json", "tsconfig.json", "next-env.d.ts", "next.config.ts",
  "eslint.config.mjs", "postcss.config.mjs", "vitest.config.ts", "src", "tests",
];

function expectFailure(command, diagnostic) {
  const result = spawnSync("npm", ["run", command], {
    cwd: temporary,
    encoding: "utf8",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
    timeout: 120_000,
    maxBuffer: 1024 * 1024,
  });
  if (result.error) throw result.error;
  assert.equal(result.signal, null, `${command} must not pass by being killed`);
  assert.ok(Number.isInteger(result.status) && result.status !== 0, `${command} unexpectedly passed`);
  assert.match(result.stdout + result.stderr, diagnostic, `${command} failed for the wrong reason`);
  console.log(`PASS negative ${command}: exit ${result.status}, expected ${diagnostic.source}`);
}

try {
  for (const input of inputs) {
    await cp(join(root, input), join(temporary, input), { recursive: true, errorOnExist: true, force: false });
  }
  // Dependencies are shared for reads only; source and generated .next stay in
  // the disposable copy. Cleanup unlinks this link, never its target.
  await symlink(join(root, "node_modules"), join(temporary, "node_modules"), "dir");

  const lintFixture = join(temporary, "src", "ci-lint-fixture.ts");
  await writeFile(lintFixture, "export const ciLintFailure: any = 1;\n", { flag: "wx" });
  expectFailure("lint", /@typescript-eslint\/no-explicit-any/);
  await rm(lintFixture);

  await writeFile(join(temporary, "src", "ci-type-fixture.ts"), "export const ciTypeFailure: string = 42;\n", { flag: "wx" });
  expectFailure("typecheck", /TS2322/);
} finally {
  // This directory is exclusively the mkdtemp result created by this script.
  await rm(temporary, { recursive: true, force: true });
  console.log("Removed disposable negative-check copy; project source was not edited");
}
