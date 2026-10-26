# AGENTS.md — TWM 3.1 Master Entry Point & Invariants

Entry point for any agent (Antigravity IDE, agy CLI subagent, or opencode CLI subagent) working in this repo. Read this first, then:

1. [`MEMORY.md`](MEMORY.md) — Top of *Session log*: what the other agents just did. Also the live architecture state and task board.
2. [`TASKS.md`](TASKS.md) — The task ledger. Current phase status and next task ID.
3. `TWM_Final_Project_Plan_v3.1.md` §20 — Only when scoping new work or validating rule compliance.
4. `.agents/workflows/workflow.md` — Working method: Opus 5.5 protocol (finish the task, verify, report).
5. `.agents/skills/` & Global Skills — Installed design systems (`impeccable`, `awesome-design-md`, `img2threejs`, `design-taste-frontend`).

Do not start editing before step 1. Three agents work in this repository simultaneously in parallel under Antigravity orchestration.

---

## 👥 Tri-Agent Parallel Collaboration Model

The repository operates under a 3-agent autonomous engineering model managed by Antigravity:

- **Antigravity (IDE Lead & Orchestrator):** Leads architecture, multi-file code generation, UI animations, database migrations, and master ledger coordination. Directly allocates and supervises tasks for the other two agents in `TASKS.md` and `MEMORY.md`.
- **`agy` (Antigravity CLI Subagent):** High-velocity interactive terminal agent inside the shell. Handles live endpoint testing, CLI slash commands, background daemon supervision, and immediate validation cycles.
- **OpenCode (CLI Deep Auditor & Quality Subagent):** Launched via `C:\Users\kathi\opencode-fresh.cmd` (auto-injects `HF_TOKEN`, `GITHUB_TOKEN`). Specializes in deep code audits, contrast/WCAG compliance sweeps (e.g., QP backlog), and static analysis.
- **Parallel Coordination Rules:**
  1. **Strict Task Segregation:** Always check `TASKS.md` and `MEMORY.md` before picking up a task. Never work on the same task ID or edit the same file concurrently.
  2. **Explicit Staging Only:** **Never run `git add -A`**. Stage only the explicit file paths you modified.
  3. **Shared Skills Junctions:** All skills are linked across Claude, Codex, OpenCode, Antigravity, and the workspace via NTFS Directory Junctions (`mklink /J`), avoiding Windows `EPERM` symlink limitations.
  4. **Single Source of Truth:** Update `MEMORY.md` session log after completing every work unit.

---

## 🛠️ Stack

Next.js 14 App Router · TypeScript (strict) · Tailwind CSS (obsidian tokens) · framer-motion · `node:sqlite` (WAL mode, zero npm ORM). All UI text is English. No env file is committed.

---

## 🔒 Invariants (Breaking One is a Bug, Not a Style Choice)

- **Zero fabrication (§1.2 & §5.7).** Never render unverified, unavailable, or mock data as fact. Mock screens say `Demo data`. Missing provider data is `UNAVAILABLE` or `Pending`, never `0`. Network failure never becomes success.
- **Quorum Participation Rule (§3.3).** The cohort denominator is the authoritative enrolled roster in SQLite. If $\ge 70\%$ are verified & opted-in: labelled **"Representative Class Leaderboard"**. If $< 70\%$: labelled **"Participating Members Leaderboard"**.
- **Sunday Boundary Rule (§9.1 & §9.7).** Weekly competition closes strictly at Sunday 23:59:59 IST (`Asia/Kolkata` / UTC+5:30). Only observations at or before the boundary count. `boundary_gap <= 3h`.
- **Ranking is deterministic (§9.6).** Standard competition ranking `1, 2, 2, 4`, ties share a rank with tie badge, alphabetical secondary sort.
- **Provider capability disparity.** HackerRank has no public event timestamps: display-only badge evidence, excluded from weekly competition deltas. Never merge providers into one opaque score.
- **One palette.** Tokens in `src/app/globals.css` (canvas `#07090E`, surface `#0E121A`, accent `#10B981` with Hyper-Mint `#34D399`). No literal hex in components except provider brand colours (`--provider-*`).
- **One font source.** `next/font` in `src/app/layout.tsx` sets `--font-sans`/`--font-mono`. Never redefine those vars in `:root`.

---

## ✅ Verification gates — all five, every time

```powershell
npx tsc --noEmit                                  # must exit 0
npm run lint                                      # ESLint 8 + Next Core Web Vitals, must exit 0
npm test                                          # dual node:test suite (foundation + OTP tests), must pass
npx next build                                    # must be green (skip while next dev runs — see below)
git status --short                                # must be clean before you report done
```

For anything touching a route handler, hit it live (`http://localhost:3000/...`) and paste the status code and verification output into `MEMORY.md`.

---

## ⚠️ Gotchas that have cost real time

- **`next dev` on port 3000 is usually running.** It rewrites `.next/`, which deletes `.next/types/**` and makes `tsc` fail with `TS6053` for no reason. Only-TS6053 means the dev server, not your code. Also: never run `next build` concurrently with `next dev`.
- **Never `git add -A`.** Stage explicit paths. A concurrent process has had its work swept into unrelated commits that way.
- **Files move under you.** If a build fails in a file you did not touch, re-check its mtime before "fixing" it — the other agent is probably mid-write. Wait, then re-run.
- **`node:sqlite` keeps the event loop alive**, so `npm test` used to hang after passing. Fixed with `--test-force-exit` in `package.json`; keep that flag.
- **Fonts are fetched at build time** by `next/font`, so `next build` needs network.
- **Solid coloured fills pair with `text-canvas`, never `text-white`.** On `bg-emerald-500`, canvas text is 7.8:1 (white would be 2.54:1, a hard AA fail). On `bg-rose-500`, `text-canvas` is 5.3:1 (DisputeModal.tsx:175, verified AA passing). Also: `text-muted-soft`/`text-muted-dark` (3.67 / 2.53:1) fail AA below ~18px — use `text-muted` (6.5:1) for small text. Full audit numbers in `MEMORY.md`, backlog in `TASKS.md` (QP-1…QP-6).

---

## 🏁 Definition of Done

1. Code compiles without type errors, linter passes with 0 errors/warnings (`npm run lint`), all `node:test` suites pass (`npm test`), build is green.
2. Anything you claimed was verified — actually ran it and logged real output.
3. `MEMORY.md` session log has a new top entry: what changed, what was verified (with real terminal output), what is left, and any ⚠️ the next agent needs.
4. `TASKS.md` status updated if you closed or discovered a task.
5. Commit with a message describing only what is in the commit.

---

## 🚫 Do not

- Push, force-push, delete data, or add an npm dependency without asking.
- Add a second colour system, a second font, a UI kit, or an external state library.
- Present a plan as done. Half-wired integrations get labelled as such in `MEMORY.md`.

