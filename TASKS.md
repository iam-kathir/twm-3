# TWM 3.1 — Master Project Task Ledger & Roadmap (`TASKS.md`)

Master task management and project delivery tracker for **TWM 3.0 / 3.1 ("Track. Win. Maintain.")**.
Plan of Record: [`TWM_Final_Project_Plan_v3.1.md`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/TWM_Final_Project_Plan_v3.1.md)
Live Agent Collaboration Ledger: [`MEMORY.md`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/MEMORY.md)

---

## 📌 1. Project Overview & Guiding Invariants

TWM is a class-focused developer telemetry, activity tracking, and friendly competition platform.

### Core Engineering Invariants:
1. **Zero-Fabrication Guarantee (§1.2 & §5.7)**:
   - Never represent unverified or unavailable data as real facts.
   - Demo or mock data must always be explicitly badged (`Demo data · 3 adapters wired` in `AppHeader`).
   - Network errors or missing data must never fail into "verified" states.
2. **Deterministic Ties (§9.6)**:
   - Standard competition ranking scheme: `1, 2, 2, 4`.
   - Secondary sorting is strictly alphabetical by student name without altering shared ranks.
   - Tied scores are clearly badged in the UI with `(Tied)`.
3. **Sunday Boundary Observation Rule (§9.1 & §9.7)**:
   - Weekly competition opens Monday 00:00:00 IST and closes Sunday 23:59:59 IST.
   - Closing values for cumulative metrics use only the latest valid observation taken **at or before Sunday 23:59:59 IST**.
   - Observations after the boundary are never rewound or retroactively assigned.
   - Observations with `boundary_gap > 3 hours` are marked `PROVISIONAL` or `UNAVAILABLE`.
4. **Single Design Token Palette**:
   - Obsidian canvas (`#090A0E`) with Amber accents (`#F59E0B`) in [`src/app/globals.css`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/app/globals.css).
   - Provider brand colors strictly tokenized (`--provider-github`, `--provider-leetcode`, `--provider-leetcode-brand`, `--provider-hackerrank`).
5. **Team Collaboration Protocol (Antigravity + OpenCode)**:
   - Both agents operate concurrently as an autonomous engineering pair.
   - Maintain [`MEMORY.md`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/MEMORY.md) after every completed task.
   - Never execute blanket `git add -A` while concurrent editing is active.

---

## 🚀 2. Roadmap & Milestone Progress

```
[ Phase 0: Scaffolding & Adapters ] ─────────────────────────► COMPLETED (100%)
[ Phase 1: Foundation & "Basement" Architecture ] ──────────► COMPLETED (100%)
[ Phase 2: Live Tournament & Observation Engine ] ──────────► IN PROGRESS (Next Up)
[ Phase 3: Multi-Provider Verification & Audits ] ──────────► QUEUED
[ Phase 4: Deterministic & AI Recaps ] ─────────────────────► QUEUED
```

---

## ✅ Phase 0: Feasibility, UI Scaling & Provider Scaffolding (COMPLETED)

| Task ID | Task Description | Primary Files | Verification Gate | Status |
| :--- | :--- | :--- | :--- | :--- |
| **P0-1** | **Global UI Scale & Readability Overhaul**<br>Scaled root typography, inputs, and container widths (`max-w-6xl`/`7xl`) across all 11 routes. | `src/app/globals.css`<br>`src/app/layout.tsx` | `tsc --noEmit` clean | ✅ **DONE** |
| **P0-2** | **Landing Section Scale & Interactive Console**<br>Redesigned Hero, MotionShowcase, PlatformMatrix, CockpitPreview, and AppScreensGallery. | `src/components/landing/*` | High-DPI browser inspect | ✅ **DONE** |
| **P0-3** | **Asset Optimization & Cleanup**<br>Deleted 5.7MB dead raster assets in `public/` (`logo.svg` base64, `logo.png`, `twm_perfect_landing.png`). | `public/*` | Clean git tree | ✅ **DONE** |
| **P0-4** | **Token Consolidation Sweep**<br>Eliminated residual literal hex classes in admin, cockpit, and hero components; mapped to tokens. | `src/app/admin/page.tsx`<br>`src/app/globals.css` | 0 undeclared hex | ✅ **DONE** |
| **P0-5** | **Phase 0 API Route Handlers (All 3 Providers)**<br>Scaffolded live GitHub REST, LeetCode GraphQL, and HackerRank REST route handlers with error handling. | `src/app/api/telemetry/*` | HTTP 200 live curl | ✅ **DONE** |
| **P0-6** | **BrandLogo UI Elevation & Header Modernization**<br>Replaced bordered icon box with ambient glow mark; modernized header telemetry monitor. | `src/components/ui/BrandLogo.tsx`<br>`AppHeader.tsx` | Visual verification | ✅ **DONE** |

---

## ✅ Phase 1: Foundation & "Basement" Architecture (COMPLETED)

| Task ID | Task Description | Primary Files | Verification Gate | Status |
| :--- | :--- | :--- | :--- | :--- |
| **P1-1** | **Deterministic Competition Ranking Engine**<br>Implemented Section 9.6 tie-break logic (`1, 2, 2, 4`), alphabetical secondary sort, and tied status flags. | [`src/lib/leaderboard.ts`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/lib/leaderboard.ts) | Unit tests in `test-foundation.mjs` | ✅ **DONE** |
| **P1-2** | **Dynamic Leaderboard Binding & HackerRank Tab**<br>Bound `currentUser` live synced telemetry; added HackerRank tab with Section 5.6 Capability Gating notice. | [`src/app/leaderboard/page.tsx`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/app/leaderboard/page.tsx) | `tsc --noEmit` clean | ✅ **DONE** |
| **P1-3** | **Native SQLite WAL Observation & Roster Store**<br>Zero-npm SQLite database (`data/twm.sqlite`) with tables for `roster_members`, `telemetry_observations`, `hmac_nonces`, and `disputes`. | [`src/lib/db.ts`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/lib/db.ts)<br>[`src/types/sqlite.d.ts`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/types/sqlite.d.ts) | Auto-seeded 7 students | ✅ **DONE** |
| **P1-4** | **Sliding-Window Rate Limiter**<br>In-memory sliding-window limiter protecting `/api/telemetry/*` and `/api/auth/*` from quota exhaustion (429 with `Retry-After`). | [`src/lib/rate-limit.ts`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/lib/rate-limit.ts) | Verified via automated test | ✅ **DONE** |
| **P1-5** | **HMAC Nonce Replay Protection**<br>Single-use nonce registry for `/api/auth/hmac-challenge`. Verified repeat verify returns `400 NONCE_ALREADY_USED`. | [`src/app/api/auth/hmac-challenge/route.ts`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/app/api/auth/hmac-challenge/route.ts) | Live test 400 rejection | ✅ **DONE** |
| **P1-6** | **Roster & Telemetry Observation REST APIs**<br>`GET /api/roster` serving roster with observation counts; `POST /api/telemetry/sync` persisting observation snapshots. | [`src/app/api/roster/route.ts`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/app/api/roster/route.ts)<br>[`src/app/api/telemetry/sync/route.ts`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/app/api/telemetry/sync/route.ts) | HTTP 200 live test | ✅ **DONE** |
| **P1-7** | **Multi-Provider Live Sync SQLite Dispatch**<br>Wired `triggerLiveSync()` in `AppContext.tsx` to automatically push GitHub and LeetCode observations to `/api/telemetry/sync`. | [`src/context/AppContext.tsx`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/src/context/AppContext.tsx) | Live sync test verified | ✅ **DONE** |
| **P1-8** | **Automated Unit & Integration Test Suite**<br>Native `node:test` test suite running in 32ms (`npm test`). Covers §9.6 ties, rate limiting, and SQLite nonces. | [`scripts/test-foundation.mjs`](file:///d:/Track.%20Win.%20Maintain/TWM%203.O/scripts/test-foundation.mjs) | `npm test` (6/6 passing) | ✅ **DONE** |
| **P1-9** | **Brand Token Unification**<br>Reconciled official LeetCode brand orange (`--provider-leetcode-brand: #FFA116`) with dark UI contrast accent (`#FBBF24`). | `src/app/globals.css`<br>`tailwind.config.js` | 100% token consistency | ✅ **DONE** |

---

## 🎯 Phase 2: Live Tournament & Observation Engine (IN PROGRESS)

| Task ID | Task Description | Scope & Requirements | Target Files | Owner / Status |
| :--- | :--- | :--- | :--- | :--- |
| **P2-1** | **Sunday Boundary Finalizer Engine (§9.1, §9.7)** | Compute weekly deltas strictly from observations at or before Sunday 23:59:59 IST. Verify `boundary_gap <= 3h`. Compute §9.6 ranks and persist to `weekly_standings`. | [`src/lib/finalizer.ts`](src/lib/finalizer.ts)<br>[`src/app/api/cron/boundary-finalize/route.ts`](src/app/api/cron/boundary-finalize/route.ts) | ✅ **DONE** |
| **P2-2** | **Persistent Disputes & Two-Person Audit System (§10.1)** | Wire dispute submission and faculty/co-admin resolution to SQLite `disputes` table with audit logging and resolution notes. | [`src/app/api/disputes/route.ts`](src/app/api/disputes/route.ts)<br>[`src/app/admin/page.tsx`](src/app/admin/page.tsx) | ✅ **DONE** |
| **P2-3** | **Live Roster & 70% Quorum Management Console (§3.3)** | Upgrade `/admin` roster tab to load live from `/api/roster`. Add classmate registration form and dynamic quorum calculation. | [`src/app/admin/page.tsx`](src/app/admin/page.tsx)<br>[`src/app/api/roster/route.ts`](src/app/api/roster/route.ts)<br>[`src/lib/db.ts`](src/lib/db.ts) | ✅ **DONE** |
| **P2-4** | **Scheduled Cron Background Worker Script** | Background script / scheduled runner to automatically poll providers every 3 hours and execute pre-boundary snapshot at Sunday 23:45 IST. | [`scripts/boundary-scheduler.mjs`](scripts/boundary-scheduler.mjs) | ✅ **DONE** |


---

## 🔮 Phase 3: Multi-Provider Verification & Audits (QUEUED)

| Task ID | Task Description | Scope & Requirements |
| :--- | :--- | :--- |
| **P3-1** | **GitHub Commit Verification & Author Matching** | Verify commits in tracked repositories match student's verified email / PGP signature to prevent false-attribution. |
| **P3-2** | **LeetCode GraphQL Historical Baseline Tracking** | Compare consecutive Sunday baseline snapshots to detect problem category deltas (easy, medium, hard). |
| **P3-3** | **HackerRank Audit & Badge Verification Evidence** | Display immutable badge timestamp metadata or explicit "Timestamp unavailable - display only" disclosure. |

---

## 🤖 Phase 4: Deterministic & AI Recaps (QUEUED)

| Task ID | Task Description | Scope & Requirements |
| :--- | :--- | :--- |
| **P4-1** | **Deterministic Weekly Recap Generator** | Rule-based summary of individual and class milestones (consistency streaks, active days delta). |
| **P4-2** | **AI-Powered Natural Language Performance Summarizer** | Grounded LLM recap quoting verified telemetry without hallucinations or unverified praise. |
| **P4-3** | **Semantic Classmate Search** | Search classmates by technology stack, verified badges, and active tracks. |

---

## 🛠️ Commands & Verification Reference

```powershell
# 1. Run Automated Foundation Test Suite (Runs in ~32ms)
npm test

# 2. Type Safety Gate
npx tsc --noEmit

# 3. Start Local Development Server (Port 3000)
npm run dev

# 4. Production Build Verification
npx next build

# 5. Query Local SQLite Roster API
node -e "fetch('http://localhost:3000/api/roster').then(r => r.json()).then(console.log)"
```
