/** Git helpers used for conservative QA freshness decisions. */
import { spawnSync } from "node:child_process";
import type { HistoryContext } from "./types.ts";

export interface GitRun {
  ok: boolean;
  code: number | null;
  stdout: string;
  stderr: string;
}

export type GitExecutor = (args: string[], cwd: string) => GitRun;

export function execGit(args: string[], cwd: string): GitRun {
  const result = spawnSync("git", args, { cwd, encoding: "utf8" });
  return {
    ok: result.status === 0,
    code: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function looksLikeRevision(revision: string): boolean {
  return /^[0-9a-f]{7,40}$/u.test(revision);
}

/** Build a history context; injectable so freshness rules are unit-testable. */
export function readHistoryContext(root: string, exec: GitExecutor = execGit): HistoryContext {
  const headRun = exec(["rev-parse", "HEAD"], root);
  if (!headRun.ok) throw new Error("Not a git checkout: cannot verify QA freshness");
  const head = headRun.stdout.trim();
  if (!looksLikeRevision(head)) throw new Error("git rev-parse HEAD returned an unexpected revision");

  const statusRun = exec(["status", "--porcelain", "--untracked-files=no"], root);
  const dirtyPaths: string[] | null = statusRun.ok
    ? statusRun.stdout
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => {
        const path = line.slice(3).trim();
        const renamed = path.split(" -> ");
        return (renamed.at(-1) ?? path).replace(/^"|"$/gu, "");
      })
    : null;

  const changedCache = new Map<string, string[] | null>();
  const ancestorCache = new Map<string, boolean | "unknown">();

  return {
    head,
    dirty: dirtyPaths === null ? true : dirtyPaths.length > 0,
    dirtyPaths: () => dirtyPaths,
    isAncestor(revision: string): boolean | "unknown" {
      if (!looksLikeRevision(revision)) return "unknown";
      if (revision === head) return true;
      const cached = ancestorCache.get(revision);
      if (cached !== undefined) return cached;
      const run = exec(["merge-base", "--is-ancestor", revision, head], root);
      const answer: boolean | "unknown" = run.code === 0 ? true : run.code === 1 ? false : "unknown";
      ancestorCache.set(revision, answer);
      return answer;
    },
    changedPaths(revision: string): string[] | null {
      if (!looksLikeRevision(revision)) return null;
      if (revision === head) return [];
      const cached = changedCache.get(revision);
      if (cached !== undefined) return cached;
      const run = exec(["diff", "--name-only", `${revision}..${head}`], root);
      const answer = run.ok ? run.stdout.split("\n").map((line) => line.trim()).filter(Boolean) : null;
      changedCache.set(revision, answer);
      return answer;
    },
  };
}
