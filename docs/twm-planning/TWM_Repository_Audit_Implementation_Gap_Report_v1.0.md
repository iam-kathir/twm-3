# TWM Repository Audit & Implementation Gap Report
**Version:** 1.0  
**Audit date:** 14 November 2026  
**Repository:** `iam-kathir/twm-3`  
**Branch:** `main`  
**Audited commit:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Commit message:** `fix(security): enforce session checks on roster import, dispute resolution, and simulation`  
**Method:** Read-only GitHub repository inspection; no code executed and no repository changes made.  
**Status:** Preliminary source audit — implementation and runtime validation still required.

---

## 1. Executive assessment

The current repository has progressed materially beyond the earlier prototype described in the previous reviewer summaries. It contains a substantial Next.js application, GitHub OAuth, institutional email OTP, provider telemetry routes, HMAC profile challenges, dispute handling, weekly boundary logic, SQLite persistence, backup/restore scripts, CI configuration, and automated test scripts.

However, the repository is **not production-ready for the current TWM V3.1 + later owner decisions**. Several critical server-side trust boundaries remain unsafe in the inspected code. In particular, telemetry can be written using client-supplied student identity and metrics; dispute access and mutation do not consistently enforce authenticated ownership or role permissions; and the finalization/quorum implementation does not match the later locked competition governance.

### Overall verdict

**Current disposition: HOLD — security and product-policy blockers.**

This is not a recommendation to rebuild the project. The existing UI, component library, provider-specific code, tests, backup scripts, and deterministic utilities are reusable. The priority is to preserve what is sound, isolate the unsafe trust boundaries, and move persistence/authorization toward the approved architecture after decisions are reconciled.

### High-level scorecard

| Area | Repository evidence | Audit disposition |
|---|---|---|
| Frontend foundation | Next.js App Router, React, TypeScript, Tailwind, Framer Motion | **Present / reusable** |
| GitHub OAuth | OAuth initiation, state cookie, callback, roster matching | **Partial — validation required** |
| Institutional OTP | Hashed OTP, expiry, attempts, delivery abstraction, failure invalidation | **Good foundation / hardening required** |
| Authorization/RBAC | Student session exists; no verified role/grant model in inspected core | **Critical gap** |
| Provider ownership | GitHub roster matching; LeetCode/HR bio challenge endpoint | **Partial / not safely bound to authenticated identity** |
| Telemetry integrity | Client can POST metric values and student ID directly | **Critical gap** |
| Provider compliance | Direct LeetCode GraphQL and HackerRank public profile endpoints | **Production NO-GO pending permission** |
| Data persistence | SQLite `node:sqlite`, inline schema initialization, seed records | **Migration to approved PostgreSQL architecture required** |
| Scoring/competition | Independent GitHub/LeetCode standings and boundary logic | **Conflicts with later Common leaderboard rules** |
| Quorum/finalization | Handle-based participation count; per-platform finalization | **Does not satisfy DEC-06 and later finalization gates** |
| Disputes | CRUD-style route and two-person helper logic | **Critical authorization and policy gap** |
| Operations | Docker, backup/restore scripts, CI, launch checklist | **Useful foundation / operational proof missing** |
| Role workspaces | Student cockpit and a single Admin Hub | **Faculty/Coordinator separation missing** |

---

## 2. Audit scope, method, and limitations

### 2.1 What was inspected
Read-only inspection of the current `main` branch at the exact commit above:
- Repository metadata and recursive Git tree.
- `package.json`, `README.md`, `.env.example`.
- `src/lib/db.ts`, `auth.ts`, `otp.ts`, `baseline.ts`, `leaderboard.ts`, `finalizer.ts`, `rate-limit.ts`, and email provider implementation.
- Auth, roster, dispute, cron, and telemetry route handlers.
- Student dashboard, onboarding, and Admin Hub page source.
- Launch audit script and repository project documents.

### 2.2 What was not done
- No local clone, install, build, lint, or automated test execution.
- No live endpoint calls to GitHub, LeetCode, HackerRank, SMTP, or deployed TWM.
- No database inspection or production environment inspection.
- No review of secrets or private deployment settings.
- No changes to branches, files, issues, settings, or deployments.

Therefore, findings below are **source-level findings**. They identify behavior visible in the inspected code, not a claim that a deployed instance is currently exploitable. Runtime configuration may change exposure, but it does not remove the underlying code defects.

### 2.3 Evidence notation
Each finding identifies the inspected source path and the relevant implementation behavior. The audited commit SHA is the fixed reference point; future commits may change these conclusions.

---

## 3. Repository baseline

### 3.1 Current stack
From `package.json` and `README.md`:
- Next.js `^14.2.18`
- React / React DOM `^18.3.1`
- TypeScript `^5.6.3`
- Tailwind CSS `^3.4.15`
- Framer Motion `^11.11.17`
- Node engine `>=22.5.0`
- Native `node:sqlite` via `DatabaseSync`
- No Prisma dependency or PostgreSQL driver in the inspected package manifest.

### 3.2 Persistence
`src/lib/db.ts` creates `data/twm.sqlite`, enables WAL, initializes tables using inline `CREATE TABLE IF NOT EXISTS`, and applies ad hoc `ALTER TABLE` statements with swallowed errors.

The six visible core tables in the schema block are:
1. `roster_members`
2. `telemetry_observations`
3. `hmac_nonces`
4. `disputes`
5. `weekly_standings`
6. `email_otp_challenges`

No formal versioned migration directory or migration runner was identified in the recursive repository tree. This differs from the approved direction of PostgreSQL plus formal migrations.

### 3.3 Application routes and workspaces
The inspected `src/app` tree shows a Student-facing dashboard/onboarding/settings/privacy/search experience and a large `/admin` page. The repository does not currently expose the planned independent Faculty and Coordinator route groups/workspaces. The Admin Hub combines roster, disputes, logs, and simulator behavior in one client-side page.

### 3.4 Useful assets already present
- Landing page and polished design components.
- Student cockpit/dashboard.
- Provider icons and visual identity.
- Bulk roster import UI.
- Manual sync and dispute modals.
- Deterministic competition ranking helper.
- LeetCode baseline helper.
- OTP/email provider abstraction.
- Backup/restore and launch-audit scripts.
- CI workflow and test scripts.

These are assets to preserve, not reasons to retain unsafe implementation choices.

---

## 4. Critical findings

### CRIT-01 — Telemetry write endpoint trusts client-supplied identity and score inputs
**Files:** `src/app/api/telemetry/sync/route.ts`

The POST handler accepts `platform`, `metricName`, `metricValue`, `displayValue`, optional `studentId`, and optional raw payload directly from the request body. The inspected handler does not call `getCurrentSession()` or validate provider evidence before calling `recordObservation()`.

If `studentId` is omitted, it falls back to the global `getCurrentUserMember()` / demo identity rather than a session-bound actor. A caller can therefore submit an arbitrary student's ID and arbitrary numeric metric value to the database if the endpoint is reachable.

**Impact:** telemetry integrity and competition fairness can be compromised. This invalidates downstream scores, standings, quorum, and audit claims.

**Required correction:**
- Require authenticated session.
- Derive student ID exclusively from the session; ignore/reject client `studentId`.
- Do not accept client-computed metric values as authoritative provider observations.
- Accept a sync command, then fetch through a server-side provider adapter.
- Validate ownership, source, timestamps, coverage, and deduplication before persistence.
- Separate manual sync command endpoint from internal ingestion/persistence service.
- Add regression tests for IDOR and forged metrics.

**Priority:** P0 — block production.

### CRIT-02 — Dispute GET/POST/PATCH do not enforce the intended role and ownership model
**File:** `src/app/api/disputes/route.ts`

Observed behavior:
- GET calls `getAllDisputes()` and returns every dispute without requiring a session.
- POST accepts `studentId`, `studentName`, and `rollNo` from the request body; it does not require a session or derive student identity from one.
- PATCH checks for a session in production, but any authenticated student session can reach the resolution path; no Faculty/Platform Admin role is checked.
- PATCH accepts a client-supplied `reviewer` field and uses it to construct the reviewer name.
- The code's “Co-Admin” label does not establish the approved role model.

**Impact:** private dispute data may be exposed; one student may lodge a dispute on behalf of another; ordinary students may resolve disputes; reviewer attribution can be spoofed.

**Required correction:**
- GET: student sees only own disputes; Faculty sees assigned-cohort disputes; Coordinator sees only triage scope under an active grant; Admin access is audited.
- POST: require session and derive student ID from session.
- PATCH: server-side role and cohort/grant checks; reviewer identity must come from the session, never the request body.
- Enforce separation of duties and conflict checks.
- Add per-student weekly open-sync-dispute limit (DEC-02) at the service/database layer.
- Record immutable decision audit events and reason.

**Priority:** P0 — block production.

### CRIT-03 — Bulk roster import has authentication but not authorization
**File:** `src/app/api/roster/bulk-import/route.ts`

The route rejects unauthenticated requests in production, but it does not check whether the authenticated session is Faculty or Platform Admin, nor whether the actor owns the target cohort. In non-production environments, it explicitly allows the import without a session.

The current TWM model requires Faculty cohort ownership and Platform Admin institutional authority. A generic student session is not sufficient permission to mutate the roster.

**Impact:** any authenticated student in production may be able to import roster records; local/staging environments can be modified without authentication.

**Required correction:**
- Require explicit `FACULTY` or `PLATFORM_ADMIN` capability.
- Check cohort ownership and import scope server-side.
- Remove broad `NODE_ENV !== production` authorization bypass; use an explicit isolated demo fixture mode that cannot write to production-like data.
- Add preview/validation and immutable before/after audit records.
- Enforce institutional domain and roster identity rules consistently.

**Priority:** P0 — block production.

### CRIT-04 — HMAC profile challenge is not bound to the authenticated student
**File:** `src/app/api/auth/hmac-challenge/route.ts`

The endpoint accepts `userId`, provider, and handle from the request body, with no session check in the inspected handler. The onboarding page also hardcodes a LeetCode handle (`aarav_coder`) when creating the challenge.

The endpoint fetches LeetCode/HackerRank public bio text and checks for a challenge string. This can prove that a profile bio contains a token, but the inspected flow does not securely bind that proof to the currently authenticated student's identity or persist a verified provider-account relationship through an authoritative server-side operation.

Additionally, `verifyAndConsumeNonce()` in `src/lib/db.ts` returns `{ valid: true }` for a nonce not found in the nonce table after inserting a consumed placeholder. That behavior is not fail-closed for an unknown nonce.

**Impact:** account ownership state can be misattributed; onboarding may verify a hardcoded or caller-selected handle rather than the student's intended account.

**Required correction:**
- Require session and derive student ID from it.
- Create a server-side pending provider connection bound to session, provider, handle, and challenge nonce.
- Reject unknown/missing nonce records; no permissive unknown-nonce acceptance.
- Persist successful ownership verification with immutable provider external ID and timestamp.
- Never treat ownership proof as proof that activity data access is authorized or reliable.
- Disable LeetCode/HackerRank production verification until provider permission is established.

**Priority:** P0 for identity correctness; provider use remains separately blocked by compliance review.

### CRIT-05 — Cron finalization can run without a configured secret
**File:** `src/app/api/cron/boundary-finalize/route.ts`

The authorization check is conditional on `CRON_SECRET` being present. If the environment variable is absent, the handler does not reject the request and proceeds. This is the opposite of fail-closed behavior.

The route also defaults to week 42 / year 2026, and calls `executeWeeklyFinalization()` without passing an explicit boundary timestamp.

**Impact:** unauthorized callers may trigger finalization when the secret is missing; incorrect or stale week parameters may be finalized.

**Required correction:**
- If `CRON_SECRET` is missing in production, return a configuration failure and do not execute.
- Use constant-time secret comparison or signed scheduler identity.
- Validate period and boundary against the competition calendar.
- Make finalization idempotent and lock-protected.
- Require all approved reconciliation, quorum, and dispute gates before publishing/finalizing.
- Remove hardcoded default competition week/year in production paths.

**Priority:** P0 — block production.

### CRIT-06 — GitHub telemetry reports a hardcoded coverage percentage and trusts a query email
**File:** `src/app/api/telemetry/github/route.ts`

The endpoint accepts `verifiedEmail` or `email` as query parameters and uses that value in commit-author matching. If absent, it looks up a roster email by username. It returns `observationCoveragePercent: 94.2` as a literal rather than calculating coverage from evidence.

It also fetches only one page of up to 100 public events and does not establish complete coverage for the requested window. The event payload's commit list is not a complete, durable Git history feed.

**Impact:** attribution and coverage can be overstated. A caller-controlled email can influence author-match results, and a hardcoded 94.2% is a fabricated precision claim.

**Required correction:**
- Derive verified email from authenticated, verified identity state; never accept it as a query override.
- Remove hardcoded coverage. Calculate from explicit provider coverage evidence or mark coverage unknown/partial.
- Treat public events as bounded evidence, not complete history.
- Record pagination limits, source timestamps, retrieval timestamps, and gaps.
- Do not mark a student as author-verified based only on actor login or display-name match without an approved attribution rule.

**Priority:** P0 for score/competition use; endpoint may remain a non-authoritative public preview only after disclosure and rate limiting.

---

## 5. High-priority findings

### HIGH-01 — Quorum calculation does not implement DEC-06
**File:** `src/lib/db.ts` (`getRosterQuorumStats()`)

The function counts students with any non-empty provider handle as `verifiedOptedIn`. It does not check:
- provider ownership verification,
- successful sync in the competition period,
- data-quality status,
- leaderboard opt-in state.

DEC-06 requires quorum to include verified successful syncs independently of leaderboard opt-in, including verified connected students who opted out and verified zero-activity students. The current function uses handle presence and labels it as verification/opt-in.

**Required correction:** implement separate fields for roster eligibility, provider ownership, successful sync, telemetry validity, and peer visibility. Quorum must be calculated from the locked rule, not handle presence.

### HIGH-02 — Finalizer is per-provider and does not enforce the later common-score gates
**Files:** `src/lib/finalizer.ts`, `src/app/api/cron/boundary-finalize/route.ts`

The finalizer explicitly allows only GitHub or LeetCode as independent platforms and rejects aggregate/cross-platform scores. It persists platform-specific standings. It calculates quorum after ranking and reports `meetsQuorum`, but the inspected code does not block persistence when quorum is below 70%, nor does it check unresolved score-affecting disputes or stuck compulsory-provider jobs.

This reflects an earlier V3.1 product rule, but conflicts with the later Weekly Common / Semester Common scoring baseline and Monday 00:00–06:00 / 06:00–18:00 / conditional 18:00 IST workflow.

**Required correction:** do not patch the finalizer until the Product Owner resolves the leaderboard-scope conflict. Then implement the approved state machine and gates as a versioned deterministic service.

### HIGH-03 — Finalizer's boundary default is not a safe production boundary
**File:** `src/lib/finalizer.ts`

When `boundaryDateIso` is omitted, it uses `new Date().toISOString()` as the boundary. The cron route does not pass a boundary timestamp. That means the finalizer can evaluate observations against the execution time rather than the actual competition close boundary.

**Required correction:** require an explicit validated period boundary; no implicit `now` fallback in production.

### HIGH-04 — Demo roster and demo observations are seeded into an empty database
**File:** `src/lib/db.ts` (`getDb()`, `seedInitialRosterIfEmpty()`)

`getDb()` always calls `seedInitialRosterIfEmpty()`. The seed function inserts fictional sample students, handles, and sample observations when the roster is empty. The sample records use VIT student domains and B.Tech CSE cohort labels.

**Impact:** an empty production database could silently populate with demo identities and activity. This can contaminate roster counts, telemetry, and competition results.

**Required correction:** remove unconditional seed behavior. Use explicit test-only fixtures, guarded by a dedicated non-production flag and isolated database path. Production startup must never seed demo students.

### HIGH-05 — Institutional domain template does not match the locked institution
**File:** `.env.example`

The template lists `karunya.edu,vitstudent.ac.in,srmist.edu.in,nitt.edu,iitm.ac.in`; it does not include the locked `cit.edu.in` domain. This is a configuration-template mismatch. The runtime domain list is environment-driven, so actual deployment configuration must also be checked.

**Required correction:** update example/config validation to the approved institutional domain and fail startup if production domains are missing or unexpected.

### HIGH-06 — LeetCode and HackerRank routes perform direct public endpoint collection
**Files:** `src/app/api/telemetry/leetcode/route.ts`, `src/app/api/telemetry/hackerrank/route.ts`

The LeetCode route calls `https://leetcode.com/graphql` directly with browser-like headers. The HackerRank route calls public `/rest/hackers/...` profile and badges endpoints. These are not evidence of an official authorized integration. The LeetCode route marks a found profile `isVerified: true`, although profile existence is not account ownership verification.

**Required correction:** keep both production adapters disabled pending written provider authorization and a reliability/coverage assessment. Do not infer permission from endpoint reachability or a successful response.

### HIGH-07 — No formal role/grant model is visible in the inspected persistence/auth core
**Files:** `src/lib/db.ts`, `src/lib/auth.ts`, route tree

The session payload is a `StudentSession` with student profile fields and an identity display tier. The inspected core schema does not show role assignments, cohort-scoped Faculty ownership, or time-limited Coordinator grants.

**Required correction:** add the approved institutional role and scope model before opening Faculty/Coordinator/Admin actions. Do not encode authority in display names, UI tabs, or client state.

### HIGH-08 — Rate limiter is in-memory and process-local
**File:** `src/lib/rate-limit.ts`

The limiter stores timestamps in a JavaScript `Map`. It will not coordinate across multiple server instances/processes and resets on restart. This is insufficient as the only production enforcement for OTP, manual sync, or dispute caps.

**Required correction:** use a durable shared limiter or transactional database enforcement for policy-critical limits. In-memory throttling may remain as a secondary abuse-control layer.

### HIGH-09 — Session design is stateless and has a 7-day lifetime
**File:** `src/lib/auth.ts`

The session is a signed stateless HMAC token stored in a cookie with a 7-day TTL. The approved architecture direction proposed a DB-backed opaque session, rotation/reuse detection, family revocation, and a 12-hour default browser session. These values are not yet owner-finalized, but the current implementation lacks a server-side session record for immediate revocation and lifecycle tracking.

**Required correction:** reconcile session policy, then implement server-side revocation and refresh/session lifecycle if approved. At minimum, test logout, account disable, token rotation, and secret rotation behavior.

### HIGH-10 — GitHub token and OAuth scopes do not yet implement the provider adapter design
**Files:** `src/app/api/auth/github/route.ts`, `src/app/api/auth/github/callback/route.ts`

The OAuth request uses `read:user user:email`. The callback fetches profile and verified emails, then issues a TWM session. The access token is not visibly persisted in the inspected callback, and the GitHub telemetry endpoint uses a global `GITHUB_TOKEN` environment variable if configured. This is not the planned per-student adapter/token model.

**Required correction:** validate required API capabilities and scopes; decide the locked token-retention question; use per-user least-privilege credentials only if needed and authorized; separate GitHub login from GitHub telemetry authorization.

### HIGH-11 — Admin UI contains hardcoded audit history and cohort assumptions
**File:** `src/app/admin/page.tsx`

The page initializes `INITIAL_LOGS` with fixed historical actions, names, and cohort details. It also defaults the cohort label and enrollment form to B.Tech CSE 2026 Section A. These values are presentation fixtures, not a live audit system.

**Required correction:** replace with server-backed audit events and institution/cohort configuration; label demo fixtures clearly and never present them as production audit evidence.

---

## 6. Medium-priority findings

### MED-01 — CSV parsing is not robust
**File:** `src/app/api/roster/bulk-import/route.ts`

The parser splits rows and columns on commas and strips quote characters. It does not correctly handle quoted commas, escaped quotes, embedded newlines, or robust malformed-row reporting.

**Correction:** use a tested CSV parser, strict schema validation, row-level preview, and import limits.

### MED-02 — `AppContext` is a client-side cockpit state store, not an authorization boundary
**File:** `src/context/AppContext.tsx`

The UI relies on shared client state and role switching patterns (also referenced by the Admin Hub). Client-side role changes or hidden UI controls must never be treated as access control.

**Correction:** keep client context for display only; server derives role, cohort, and grants on every protected operation.

### MED-03 — Provider identity, verification, and data availability are conflated in UI
**Files:** `src/app/dashboard/page.tsx`, `src/app/onboarding/page.tsx`

The dashboard infers an overall “Verified” state from provider connection booleans and a LeetCode HMAC flag. The LeetCode public profile route separately marks a found profile as verified. These states need to be split into account ownership, provider permission, successful data retrieval, coverage, and score eligibility.

**Correction:** use explicit state enums and show “ownership verified” separately from “telemetry available/eligible.”

### MED-04 — Privacy defaults are preselected in onboarding
**File:** `src/app/onboarding/page.tsx`

The inspected component initializes `optInLeaderboard`, `publicProfile`, and `weeklyRecap` to `true`. If these controls represent optional peer visibility or processing consent, default-on behavior conflicts with the planned meaningful opt-in model.

**Correction:** optional peer visibility should default off unless the Product Owner approves otherwise; persist consent with version and timestamp. The UI should not imply that a local state toggle has been recorded until the server confirms it.

### MED-05 — Provider fetch routes expose public lookups without student context
**Files:** GitHub, LeetCode, HackerRank telemetry routes

The routes accept a username query parameter and fetch public provider data. This may be acceptable for a clearly labeled preview tool, but it is not equivalent to an authenticated student sync or a canonical telemetry ingestion pipeline.

**Correction:** separate public preview endpoints from authenticated provider sync. Do not feed preview responses directly into scoring.

### MED-06 — Launch audit checklist tests earlier product invariants
**File:** `scripts/audit-launch-checklist.mjs`

The checklist asserts three independent provider tracks and no merged score, while the later product baseline records Weekly Common and Semester Common formulas. The checklist also validates quorum arithmetic based on the current handle-based helper. A passing checklist would not establish compliance with the newer TWM decision register.

**Correction:** version the launch gates against the current approved policy. Retire or mark stale checks that assert superseded product requirements.

### MED-07 — README and seed data describe a different institutional cohort
**Files:** `README.md`, `src/lib/db.ts`

The README describes B.Tech CSE cohorts and the seed data uses VIT-style records/domains. The current pilot target is CIT and the current user context is M.Sc Data Science. Treat these as demo remnants and replace them with institution-neutral configuration.

---

## 7. Product-policy mismatches

These are not ordinary bugs; they require owner decisions or authoritative policy reconciliation before implementation.

| Topic | Current repository behavior | Current TWM direction | Status |
|---|---|---|---|
| Leaderboard model | Separate GitHub and LeetCode standings; aggregate score rejected | Weekly Common / Semester Common formulas later recorded | **UNRESOLVED conflict** |
| Consistency | GitHub active days divided by 7; UTC day buckets | Conflicting five-day vs observed-days/coverage formula | **UNRESOLVED** |
| Quorum | Non-empty provider handles | Verified successful sync, independent of leaderboard opt-in | **Mismatch — fix after policy mapping** |
| Finalization | Sunday boundary finalizer; 3-hour freshness; no full later gate state machine | Monday reconciliation/review and conditional Monday 18:00 finalization | **Mismatch** |
| LeetCode | Public GraphQL + HMAC bio proof; profile existence marked verified | Production use only after permitted reliable method is proven | **Production blocked** |
| HackerRank | Public profile/badge endpoint; display-only | Optional, pending written permission | **Production blocked** |
| Roles | Student session plus single Admin Hub | Student, Coordinator, Faculty, Platform Admin with grants | **Major gap** |
| Storage | SQLite single-file DB | PostgreSQL preferred, formal migrations | **Architecture migration required** |
| Session | 7-day stateless signed cookie | Proposed DB-backed revocable session | **Validation/approval required** |
| Consent | UI booleans default true; no consent ledger visible in inspected schema | Versioned consent ledger; peer visibility separate | **Major gap** |
| Retention | Raw payload stored in SQLite; no approved unified retention schedule found in inspected schema | Conflicting V3.1 and later retention proposals | **Owner decision required** |

---

## 8. Reusable components and assets

Do not discard these without a reason:

### Reuse candidates
- Landing page, design tokens, provider icon components, layout primitives.
- Student dashboard visual structure, subject to state and data-source corrections.
- OTP hashing, expiry, attempt counting, challenge consumption, and email provider abstraction.
- GitHub OAuth state-cookie pattern, subject to state validation and identity-binding tests.
- Competition ranking utility (`computeCompetitionRanks`) for the 1,2,2,4 ranking policy.
- LeetCode cumulative baseline concept, subject to authorized source and valid snapshot capture.
- Backup and restore scripts, subject to PostgreSQL migration and operational validation.
- CI workflow and existing automated test scripts, subject to test coverage and current policy.
- Launch checklist as a framework, after its assertions are updated to current approved decisions.

### Do not treat as production-safe yet
- `/api/telemetry/sync` persistence path.
- `/api/disputes` access and mutation behavior.
- `/api/roster/bulk-import` authorization.
- `/api/auth/hmac-challenge` identity binding and unknown nonce handling.
- Cron finalization authorization and gate semantics.
- Public LeetCode/HackerRank data retrieval.
- Demo-seeded database and hardcoded audit fixtures.
- Client-side role switching as a permission mechanism.

---

## 9. Recommended remediation sequence

### P0 — close trust-boundary defects first
1. Disable or isolate telemetry write endpoint until it derives actor from a verified session and fetches source data server-side.
2. Restrict disputes by session ownership, role, cohort, and grant; remove client reviewer identity.
3. Enforce Faculty/Platform Admin authorization for roster mutation.
4. Make cron secret configuration fail closed and require explicit period boundary.
5. Bind provider ownership challenge to authenticated user; reject unknown nonce.
6. Remove hardcoded coverage and caller-supplied verified email from GitHub attribution.
7. Prevent demo seed data from running in production.

### P1 — align domain model and competition policy
1. Add institutional roles, cohort ownership, membership history, and Coordinator grants.
2. Implement consent ledger and peer visibility as separate state.
3. Reconcile Weekly Common vs independent-provider leaderboard policy.
4. Implement DEC-06 quorum using verified sync and data-quality state.
5. Implement approved Monday reconciliation/finalization state machine.
6. Replace in-memory policy-critical rate limits with durable enforcement.
7. Decide retention and build deletion/expiry jobs only after approval.

### P2 — persistence and architecture
1. Approve PostgreSQL schema and formal migration plan.
2. Introduce canonical telemetry envelope and provider adapter contract.
3. Separate sync command, provider retrieval, normalization, coverage, and persistence.
4. Build durable worker queue and idempotent jobs.
5. Introduce server-side session lifecycle if the DB-backed session design is approved.
6. Add versioned deterministic scoring policy and test fixtures.

### P3 — role workspaces and production hardening
1. Separate Student, Coordinator, Faculty, and Platform Admin navigation/workspaces.
2. Add data coverage/provenance states to all data-driven screens.
3. Replace hardcoded audit history and cohort labels.
4. Update launch checklist to the current policy.
5. Run full build, lint, tests, security tests, accessibility checks, and backup restore drills.
6. Perform a controlled pilot with production integrations enabled only after provider permission gates pass.

---

## 10. Required acceptance tests before production

### Authorization and identity
- Unauthenticated user cannot read or mutate protected data.
- Student A cannot read or write Student B's telemetry or disputes.
- Student cannot import or mutate cohort roster.
- Coordinator without an active grant is denied.
- Expired/revoked Coordinator grant is denied immediately.
- Coordinator cannot approve/finalize disputes.
- Client-supplied `studentId`, `reviewer`, role, and cohort are ignored/rejected.
- Provider challenge cannot be verified for an account not bound to the authenticated user.
- Unknown/replayed/expired nonce is rejected.

### Telemetry integrity
- Client cannot submit authoritative metric values.
- All persisted observations have provider provenance and retrieval timestamps.
- Duplicate provider events are deduplicated.
- Partial coverage remains partial/provisional.
- Missing data is not zero.
- GitHub coverage is calculated from evidence, never hardcoded.
- Provider-native UTC dates are not labeled IST activity days.

### Competition
- Quorum includes verified successful syncs irrespective of peer opt-in, per DEC-06.
- Verified zero activity is distinguishable from missing provider data.
- Finalization fails if any approved gate fails.
- Finalization is idempotent and bound to an explicit competition period.
- Scores reproduce from immutable input and policy versions.
- Provisional students and disputes follow the approved hold policy.
- Weekly Top 3 awards are only created after approved Weekly Common finalization.

### Operations
- Production startup fails safely when required secrets/configuration are absent.
- No demo roster is seeded in production.
- Multi-instance rate limits are consistent.
- Backup restore is tested against the target production database.
- CI runs typecheck, lint, unit/integration tests, and build.
- Logs do not contain OTPs, OAuth tokens, provider tokens, or sensitive raw payloads.

---

## 11. Product Owner decisions that block implementation

1. Resolve independent-provider standings versus Weekly Common / Semester Common.
2. Confirm the consistency formula and data-coverage gate.
3. Confirm raw GitHub and LeetCode point conversions.
4. Confirm per-student provisional hold versus cohort-wide finalization hold.
5. Approve zero-score podium and exam/holiday week policy.
6. Approve retention schedule.
7. Resolve GitHub token discard-versus-retain policy.
8. Confirm Faculty-only dispute/roster final authority versus DEC-04 wording.
9. Approve Admin self-affecting action neutral-review workflow.
10. Confirm LeetCode onboarding fallback if Phase 0 permission/reliability gate fails.
11. Confirm email provider/domain and production sender verification.
12. Approve session lifetime and revocation model.

---

## 12. Final conclusion

The repository is a meaningful engineering foundation, not a blank prototype. The visual layer and several supporting utilities are reusable. But the current server-side trust boundaries and competition workflow are not aligned with the approved TWM direction.

**Recommendation:** do not start a broad redesign and do not add more features yet. First close P0 security/data-integrity findings, then resolve the competition and provider policy conflicts, then migrate the persistence model and implement the role/grant architecture. Keep the audit tied to commit `6cb7c876173796f37e1e427960249089069ef6a5`; re-audit after any material code changes.

---

## Appendix A — key inspected files

| File | Why it matters |
|---|---|
| `package.json` | Framework/runtime/dependency baseline |
| `README.md` | Declared architecture and operational claims |
| `.env.example` | Required production configuration and institutional domain template |
| `src/lib/db.ts` | SQLite schema, seed data, quorum, observations, disputes |
| `src/lib/auth.ts` | Session model, cookie, identity tier |
| `src/lib/otp.ts` | OTP generation, hashing, rate limiting, delivery |
| `src/lib/baseline.ts` | LeetCode snapshot baseline and boundary rules |
| `src/lib/leaderboard.ts` | Competition ranking |
| `src/lib/finalizer.ts` | Weekly standings finalization |
| `src/lib/rate-limit.ts` | Process-local rate limiting |
| `src/app/api/telemetry/sync/route.ts` | Client-to-database telemetry write path |
| `src/app/api/disputes/route.ts` | Dispute read/create/resolve authorization |
| `src/app/api/roster/bulk-import/route.ts` | Roster mutation authorization |
| `src/app/api/auth/hmac-challenge/route.ts` | LeetCode/HackerRank ownership challenge |
| `src/app/api/cron/boundary-finalize/route.ts` | Scheduled finalization authorization |
| `src/app/api/telemetry/github/route.ts` | GitHub attribution and coverage claims |
| `src/app/api/telemetry/leetcode/route.ts` | LeetCode public GraphQL retrieval |
| `src/app/api/telemetry/hackerrank/route.ts` | HackerRank public profile retrieval |
| `src/app/admin/page.tsx` | Single Admin Hub and hardcoded UI audit fixtures |
| `src/app/dashboard/page.tsx` | Student cockpit and verification display |
| `src/app/onboarding/page.tsx` | OTP, privacy defaults, provider challenge flow |
| `scripts/audit-launch-checklist.mjs` | Automated acceptance checks and policy assumptions |

## Appendix B — source-of-truth caution

The repository README, V3.1 plan, test scripts, and code comments describe the earlier V3.1 design. The current Product Owner direction includes later amendments captured in the Master Decision Register. Code that matches an older document is not automatically correct for the current product. Resolve the policy first, then update code and tests together.
