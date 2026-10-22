# TWM — Track. Win. Maintain.

An institutional-grade, class-scoped developer activity and friendly competition platform for
engineering cohorts (B.Tech CSE). Verified telemetry from GitHub, LeetCode and HackerRank is
normalised into one SQLite database, scored against a fair weekly competition window, and rendered
as a cohort leaderboard with auditable, disputeable observations.

---

## Quick start (local)

```bash
npm install
cp .env.example .env.local     # fill in secrets (see "Configuration")
npm run dev                    # http://localhost:3000
```

Requires **Node.js 22+** (uses the built-in `node:sqlite` module — no ORM, no native build step).
Developed and verified on Node 24.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Next.js dev server on port 3000 |
| `npm run build` | Production build (`output: "standalone"`) |
| `npm start` | Serve the production build |
| `npm test` | `node:test` foundation suite (`scripts/test-foundation.mjs`) |
| `npm run simulate` | Simulate a 7-day tournament week against a throwaway DB |
| `npm run lint` | Next.js ESLint |

---

## Configuration

Copy `.env.example` → `.env.local`. Nothing in `.env.local` is committed.

| Variable | Purpose |
|---|---|
| `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` | GitHub OAuth App for cohort sign-in |
| `TWM_SESSION_SECRET` | 64-char hex secret used to sign tamper-proof sessions |
| `COLLEGE_EMAIL_DOMAINS` | Comma-separated institutional domains allowed to enroll |
| `CRON_SECRET` / `ADMIN_TOKEN` | Bearer auth for the Sunday boundary finalizer and admin routes |
| `NEXT_PUBLIC_APP_URL` | Public base URL (defaults to the request origin) |

The GitHub OAuth callback must point at `http://localhost:3000/api/auth/github/callback`
(or your production equivalent).

---

## Architecture

```
src/app/                 Next.js App Router routes (pages + route handlers)
  api/auth/              GitHub OAuth + session + HMAC challenge
  api/telemetry/         GitHub / LeetCode / HackerRank ingestion + sync
  api/cron/              Sunday boundary finalizer
  api/roster/            Roster enrolment, bulk import, quorum
  api/disputes/          Two-person dispute / audit workflow
  api/search/            Semantic classmate search
  api/recap, api/ai/     Rule-based + AI weekly recaps
  api/simulation/        Tournament-week simulator
src/lib/                 db.ts (node:sqlite, WAL), leaderboard.ts, finalizer.ts,
                         rate-limit.ts, auth.ts, search.ts, simulation.ts, recap.ts
src/components/          UI (landing, dashboard, admin, shared ui primitives)
src/context/             AppContext — client state for the cockpit
scripts/                 test-foundation.mjs, boundary-scheduler.mjs,
                         backup-db.mjs, restore-db.mjs, simulate-tournament-week.mjs
data/                    SQLite database + WAL + backups (git-ignored, mount as a volume)
```

**Storage.** `node:sqlite` in WAL mode, single file at `data/twm.sqlite`. No ORM, no external
database service. Backups via `npm run` scripts `backup-db.mjs` / `restore-db.mjs`.

**Live endpoints**

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth/hmac-challenge` | POST | One-time HMAC nonce for telemetry ingestion |
| `/api/auth/session` | GET/POST | Session issue / read |
| `/api/telemetry/github` | POST | Commit + activity ingestion |
| `/api/telemetry/leetcode` | POST | Solved-problem ingestion |
| `/api/telemetry/hackerrank` | POST | Badge evidence ingestion |
| `/api/telemetry/sync` | POST | Multi-provider sync |
| `/api/cron/boundary-finalize` | GET/POST | Weekly boundary finalization (Bearer `CRON_SECRET`) |
| `/api/roster`, `/api/roster/bulk-import` | GET/POST | Roster management + CSV import |
| `/api/disputes` | GET/POST | Disputes + two-person audit |
| `/api/search` | GET | Semantic classmate search |
| `/api/recap`, `/api/ai/recap` | GET | Weekly recap generation |

---

## Product invariants (breaking one is a bug, not a style choice)

1. **Zero fabrication.** Unverified, unavailable or mock data is never rendered as fact. Missing
   provider data reads `UNAVAILABLE` or `Pending` — never `0`. Network failure never becomes
   success. Demo screens are badged `Demo data`.
2. **Deterministic ranking.** Standard competition ranking: `1, 2, 2, 4`. Ties share a rank and
   get a tie badge; secondary sort is strictly alphabetical.
3. **Sunday boundary rule.** The weekly window opens Monday 00:00:00 IST and closes Sunday
   23:59:59 IST (`Asia/Kolkata`). Only observations at or before the boundary count; observations
   more than 3 hours stale are marked `Provisional`.
4. **Quorum participation.** The denominator is the authoritative enrolled roster in SQLite. At
   ≥ 70 % verified and opted-in the leaderboard is labelled **"Representative Class Leaderboard"**,
   otherwise **"Participating Members Leaderboard"**.
5. **Provider capability disparity.** HackerRank exposes no public event timestamps, so its badge
   evidence is display-only and excluded from weekly competition deltas. Providers are never merged
   into one opaque score.
6. **One palette, one font.** Tokens live in `src/app/globals.css`; fonts are set once via
   `next/font` in `src/app/layout.tsx`.

---

## Deployment

```bash
docker compose up --build
```

The image is a multi-stage Next.js standalone build running as a non-root user, with the SQLite
database and backups on a named volume (`twm-data`). The compose file also runs the 3-hour
boundary scheduler daemon against the same volume.

---

## Project documents

| File | What it is |
|---|---|
| [`TWM_Final_Project_Plan_v3.1.md`](TWM_Final_Project_Plan_v3.1.md) | Plan of record |
| [`AGENTS.md`](AGENTS.md) | Architecture invariants + working agreement |
| [`MEMORY.md`](MEMORY.md) | Living engineering ledger (decisions, session log) |
| [`TASKS.md`](TASKS.md) | Task ledger and roadmap |
| [`.agents/workflows/workflow.md`](.agents/workflows/workflow.md) | Working method |

## License

Private — all rights reserved.
