# AGENTS.md — TWM 3.1

Entry point for any agent working in this repo. Read this first, then:

1. `MEMORY.md` — top of *Session log*: what the other agent just did. Also the live task board.
2. `TASKS.md` — the task ledger. Current phase and next task ID.
3. `TWM_Final_Project_Plan_v3.1.md` §20 — only when scoping new work.
4. `.agents/workflows/workflow.md` — working method (finish the task, verify, report).
5. `.agents/skills/` — installed skills (`design-taste-frontend` lives here).

Do not start editing before step 1. Two agents work in this folder at the same time.

## Stack

Next.js 14 App Router · TypeScript (strict) · Tailwind · framer-motion · `node:sqlite`
(no npm driver, no ORM). All UI text is English. No env file is committed.

## Invariants (breaking one is a bug, not a style choice)

- **Zero fabrication.** Never render unverified, unavailable, or mock data as fact. Mock screens say
  `Demo data`. Missing provider data is `UNAVAILABLE`, never `0`. Network failure never becomes
  success. This has already been violated twice (fake bio verification, fake "Providers Live" pill).
- **One palette**, the tokens in `src/app/globals.css`. No literal hex in components except provider
  brand colours, which have `--provider-*` tokens. Tailwind maps them via `*-rgb` triplets.
- **One font source**: `next/font` in `src/app/layout.tsx` sets `--font-sans`/`--font-mono`. Never
  redefine those vars in `:root`.
- **Provider capability is not equal.** HackerRank has no public event timestamps: display only,
  excluded from weekly deltas. Never merge providers into one score.
- **Ranking is deterministic** (§9.6): `1, 2, 2, 4`, ties share a rank, alphabetical secondary sort,
  tie badge in the UI.

## Verification gates — all four, every time

```powershell
npx tsc --noEmit                                  # must exit 0
npm test                                          # node:test suite, must pass
npx next build                                    # must be green (skip while `next dev` runs — see below)
git status --short                                # must be clean before you report done
```

For anything touching a route handler, also hit it live and paste the status codes into `MEMORY.md`.

## Gotchas that have cost real time

- **`next dev` on port 3000 is usually running.** It rewrites `.next/`, which deletes
  `.next/types/**` and makes `tsc` fail with `TS6053` for no reason. Only-TS6053 means the dev
  server, not your code. Also: never run `next build` concurrently with it.
- **Never `git add -A`.** Stage explicit paths. A concurrent process has had its work swept into
  three unrelated commits that way, so history no longer matches the messages.
- **Files move under you.** If a build fails in a file you did not touch, re-check its mtime before
  "fixing" it — the other agent is probably mid-write. Wait, then re-run.
- **`node:sqlite` keeps the event loop alive**, so `npm test` used to hang after passing. Fixed with
  `--test-force-exit`; keep that flag.
- Fonts are fetched at build time by `next/font`, so `next build` needs network.

## Definition of done

1. Code compiles, tests pass, build is green.
2. Anything you claimed was verified — actually ran it.
3. `MEMORY.md` session log has a new top entry: what changed, what you verified (with real output),
   what is left, and any ⚠️ the next agent needs.
4. `TASKS.md` status updated if you closed or discovered a task.
5. Commit with a message that describes only what is in the commit.

## Do not

- Push, force-push, delete data, or add a dependency without asking.
- Add a second colour system, a second font, a UI kit, or a state library.
- Present a plan as done. Half-wired integrations get labelled as such in `MEMORY.md`.
