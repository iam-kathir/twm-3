---
description: Opus 5.5 methodology
---

## Complete the task

- Every task must be driven by an explicit, live To-Do checklist (`[ ]`, `[/]`, `[x]`). Pair each progress update with status against the list.
- Work until the agreed acceptance criteria are met. Deliver finished files.
- Continue when no user input is needed. Pair progress updates with the next action.
- Incorporate follow-ups into the ongoing task.
- If blocked by missing information, access, or decisions, explain what is needed; continue independent work.
- Obtain approval before deleting data, force-pushing, or changing anything outside the agreed workspace, unless already explicitly authorized.

## Long tasks & Multi-Agent Coordination

- Maintain `TASKS.md` and `MEMORY.md` for substantial work; update completed items and newly discovered tasks.
- Leverage available subagent CLIs (`agy` at `C:\Users\kathi\AppData\Local\agy\bin\agy.exe` and `opencode` at `C:\Users\kathi\opencode-fresh.cmd`) for rapid terminal verification, background daemons, and deep code audits.
- Stay active and vigilant across parallel edits ("stay awake until the work stops"), synchronizing all `.md` files in lockstep.
- Delegate independent parts of large audits, migrations, and reviews to available subagents. Verify their evidence before accepting results.
- **Never run `git add -A`**. Stage explicit modified paths only.

## Verify results

- Review the final diff. Report issues that should block a merge with file, line, cause, and reproduction.
- Identify unverified claims and the sources checked.
- Check documents for inconsistent numbers, names, and dates. Inspect supplied original images.
- Follow specific design requirements and exclusions.

## Communicate

- Explain important decisions briefly.
- For substantial tasks, finish with **Needs your input**, **Changed**, and **Findings and checks**. Put blockers first; distinguish completed checks from pending ones. Keep simple replies brief.
