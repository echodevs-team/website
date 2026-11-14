"""Read-only Markdown scheduling checks; never a test-result/status engine."""
from pathlib import Path
import re


def parse(root):
    tasks = {}
    files = [root / "README.md", *sorted(root.glob("[ABCDEFH]-*.md"))]
    assert len(files) == 8, "expected seven lanes plus guide"
    for path in files:
        for line in path.read_text().splitlines():
            cells = [cell.strip() for cell in line.strip().strip("|").split("|")]
            if not cells or not re.fullmatch(r"[A-H]\d+[a-z]?", cells[0]):
                continue
            assert len(cells) == 7, (path, line)
            task, scope, deps, hours, state, evidence, unlocks = cells
            assert task not in tasks, f"duplicate {task}"
            assert state in {"TODO", "BLOCKED", "NEEDS_REVALIDATION", "DONE", "IN_PROGRESS", "IN_REVIEW"}, task
            assert scope and evidence, task
            match = re.fullmatch(r"(\d+)–(\d+)", hours)
            assert match, (task, hours)
            low, high = map(int, match.groups())
            assert low <= high and (state != "DONE" or high == 0), task
            split = lambda value: [] if value == "—" else value.split(", ")
            tasks[task] = (split(deps), low, high, state, split(unlocks))
    return tasks


def validate(tasks):
    for task, (deps, _, _, _, unlocks) in tasks.items():
        assert len(deps) == len(set(deps)), task
        for dep in deps:
            assert dep in tasks and dep != task, (task, dep)
        expected = {other for other, row in tasks.items() if task in row[0]}
        assert set(unlocks) == expected, (task, "unlocks mismatch", expected, unlocks)
    visiting, visited = set(), set()

    def walk(task):
        assert task not in visiting, f"cycle at {task}"
        if task in visited:
            return
        visiting.add(task)
        for dep in tasks[task][0]:
            walk(dep)
        visiting.remove(task)
        visited.add(task)

    for task in tasks:
        walk(task)


def main():
    root = Path(__file__).resolve().parent
    tasks = parse(root)
    validate(tasks)
    now = (root / "NOW.md").read_text()
    for task in re.findall(r"\b[A-H]\d+[a-z]?\b", now):
        assert task in tasks, f"unknown NOW task {task}"
    for path in root.glob("*.md"):
        for link in re.findall(r"\]\(([^)]+)\)", path.read_text()):
            if "://" not in link and not link.startswith("#"):
                assert (path.parent / link.split("#")[0]).exists(), (path, link)
    print(f"OK: {len(tasks)} tasks; unique IDs, dependencies, reverse edges, DAG, estimates and local Markdown links")
    for lane in "ABCDEFHG":
        rows = [row for task, row in tasks.items() if task.startswith(lane)]
        print(f"{lane}: {sum(row[1] for row in rows)}–{sum(row[2] for row in rows)} remaining hours")
    print(f"Total: {sum(r[1] for r in tasks.values())}–{sum(r[2] for r in tasks.values())} hours")

    def descendants(task):
        found = set(tasks[task][4])
        for child in tasks[task][4]:
            found |= descendants(child)
        return found

    def longest(task):
        children = tasks[task][4]
        return tasks[task][2] + max((longest(c) for c in children), default=0)

    for task, row in tasks.items():
        if row[3] != "DONE" and all(tasks[d][3] == "DONE" for d in row[0]):
            print(f"Dependency root {task}: {len(descendants(task))} transitive unlocks; longest high-estimate chain {longest(task)}h (not calendar/READY)")


if __name__ == "__main__":
    main()
