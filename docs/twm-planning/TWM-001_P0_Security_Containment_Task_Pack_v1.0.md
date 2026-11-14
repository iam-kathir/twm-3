# TWM V3.1 — TWM-001 P0 Security Containment Task Pack
**Version:** 1.0 | **Prepared:** 14 November 2026  
**Repository:** `iam-kathir/twm-3`  
**Audit baseline:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Status:** READ-ONLY PLANNING PACK — no code changes authorized

## 1. Purpose

This task pack converts the six critical security findings in the TWM-000 Repository Delta Audit into a controlled containment plan.

**Important:** This document is an implementation plan, not permission to implement it. Antigravity must remain in read-only mode until the Product Owner explicitly authorizes a specific code-change batch.

The current audit identifies these critical exposures:
1. Arbitrary client-authored telemetry injection.
2. Unauthenticated dispute disclosure and insufficient dispute decision authorization.
3. Unauthorized roster modification.
4. HMAC nonce validation that accepts unknown nonces.
5. Cron finalization authentication that fails open when `CRON_SECRET` is absent.
6. Active LeetCode/HackerRank collection routes without verified production permission.

The audit also identifies production demo-data seeding as an important data-integrity risk. It is included as a containment task in this pack.

## 2. Operating rules

- **Current mode: READ-ONLY.** Do not edit, create, delete, format, or commit repository files.
- Do not change environment variables, secrets, provider settings, database contents, deployment settings, or production infrastructure.
- Do not run migrations or destructive tests against any shared or production database.
- Do not disable routes or change feature flags yet. First inspect and propose the safest containment method; execution requires approval.
- Do not assume the audit findings are unchanged. Revalidate each finding against current HEAD.
- Do not add a temporary bypass, fake identity, mock verification, or client-side-only restriction.
- Do not claim a vulnerability is fixed based on UI hiding or a successful build.
- Use test fixtures and isolated local test environments only if later authorized.
- Record exact file paths, commit SHA, evidence, and confidence for every finding.

## 3. Required first action — TWM-001A baseline confirmation

Before preparing any patch:
1. Confirm branch, HEAD SHA, working-tree status, and deployed release reference if available read-only.
2. Compare the current HEAD with audit baseline `6cb7c876173796f37e1e427960249089069ef6a5`.
3. Re-open all affected source files and verify whether each finding remains present.
4. Identify route exposure and any existing feature flags or middleware that may affect reachability.
5. Identify shared helpers, tests, and callers so containment does not break unrelated workflows.
6. Return a proposed patch plan. Do not make changes.

**Deliverable:** updated P0 delta matrix.

**Acceptance:** every finding is marked `OPEN`, `PARTIALLY FIXED`, `FIXED`, `REGRESSED`, or `UNABLE TO VERIFY`, with current source evidence.

## 4. Containment work items

### TWM-001B — Telemetry write-path containment
**Priority:** P0 / critical  
**Audit reference:** `src/app/api/telemetry/sync/route.ts`

**Audit finding:** the route has no authentication check and accepts caller-supplied `studentId`, `metricName`, and numeric `metricValue`, writing client-authored values into telemetry observations.

**Containment objective:** prevent untrusted clients from creating authoritative telemetry or scores.

**Read-only investigation**
- Inspect all callers of `/api/telemetry/sync`.
- Determine whether the endpoint is used by the dashboard, simulations, tests, or scheduled jobs.
- Identify whether any server-owned ingestion path already exists.
- Determine whether the route can be safely gated without breaking unrelated read-only views.

**Proposed implementation direction — not authorized yet**
- Convert the public-facing route into an authenticated sync command, or disable its mutation capability until trusted ingestion exists.
- Derive student identity from a server-authenticated actor context; do not accept a client-selected student ID.
- Do not accept client-supplied metric values or raw provider evidence as authoritative.
- Ensure only a trusted server-side provider ingestion service can persist score-eligible observations.
- Preserve a clear unavailable/disabled response rather than fabricating a successful sync.

**Acceptance tests after authorization**
1. Anonymous caller cannot create telemetry.
2. Student A cannot create telemetry for Student B.
3. Client-supplied `metricValue` cannot be persisted as authoritative evidence.
4. Client cannot select arbitrary student identity or provider account.
5. Trusted ingestion path is separately authenticated/authorized.
6. Rejected attempts create no score-eligible observation.
7. Existing personal dashboard reads do not accidentally trigger a sync or write.

**Required evidence:** route diff, caller inventory, negative API tests, database assertion showing rejected requests create no observations.

### TWM-001C — Dispute API containment
**Priority:** P0 / critical  
**Audit reference:** `src/app/api/disputes/route.ts`

**Audit findings**
- `GET /api/disputes` is unauthenticated and can expose dispute records.
- `POST` accepts caller-supplied `studentId`/`rollNo` without binding them to the authenticated student.
- `PATCH` accepts caller-supplied reviewer identity.
- Any ordinary authenticated student may potentially resolve disputes because final-decision role authorization is missing.

**Containment objective:** protect dispute confidentiality and prevent unauthorized dispute creation or resolution.

**Read-only investigation**
- Inspect GET/POST/PATCH behavior and all consumers.
- Identify current session helper and whether any authoritative role model exists.
- Identify dispute status transitions and audit fields.
- Confirm whether Faculty/Platform Admin roles exist server-side or only in client state.

**Proposed implementation direction — not authorized yet**
- Deny anonymous access to all dispute operations.
- Scope Student reads and creations to the authenticated student's own identity.
- Derive reviewer identity from the server session, never request body.
- Until a trusted server-side role model exists, fail closed on final decisions; do not treat a generic student session as Faculty/Admin.
- Preserve Coordinator triage-only boundary once scoped grants are implemented; Coordinator must not finalize.
- Preserve DEC-02: at most two simultaneously open sync disputes per student per competition week, enforced transactionally when the persistence layer supports it.

**Acceptance tests after authorization**
1. Anonymous GET/POST/PATCH denied.
2. Student A cannot list or retrieve Student B disputes.
3. POST ignores/rejects mismatched client `studentId` and `rollNo`.
4. Client-supplied `reviewer` is ignored/rejected.
5. Ordinary Student cannot resolve a dispute.
6. Coordinator cannot finalize; triage requires an active scoped grant.
7. Faculty decision requires an authorized cohort scope.
8. Third simultaneously open sync dispute in the same competition week is rejected.
9. Every final decision records server-derived actor, timestamp, reason, and state transition.

**Required evidence:** endpoint tests for each role and unauthenticated state; data-scope assertions; audit-event verification.

### TWM-001D — Roster import containment
**Priority:** P0 / critical  
**Audit reference:** `src/app/api/roster/bulk-import/route.ts`

**Audit findings**
- Production check accepts any authenticated student session rather than a Faculty/Admin capability.
- Development mode bypasses authentication.
- No cohort ownership validation.
- CSV parsing uses naive string splitting.

**Containment objective:** prevent unauthorized or malformed roster changes.

**Read-only investigation**
- Inspect all roster import routes, UI callers, and role/session sources.
- Determine whether any trusted server-side Faculty/Admin role assignment exists.
- Identify import transaction boundaries and current audit records.

**Proposed implementation direction — not authorized yet**
- Fail closed for all actors until a trusted server-side authorization source is available.
- Permit commit only to Faculty authorized for the target cohort or Platform Admin within approved scope.
- Do not use client-side role toggles as authorization.
- Remove mutation-capable development bypass from any shared environment.
- Plan a robust CSV parser and preview → validate → commit workflow as a follow-up; do not mix parser refactoring into the smallest emergency containment patch unless required to prevent data corruption.

**Acceptance tests after authorization**
1. Anonymous and Student commit attempts denied.
2. Coordinator without explicit roster-assistance permission cannot commit.
3. Faculty cannot import into another Faculty's cohort.
4. Platform Admin scope is enforced server-side.
5. Development mode does not create a production-like authorization bypass.
6. Denied or invalid import makes no roster changes.
7. Every committed import records actor, cohort, counts, and change summary.

**Required evidence:** role/scope tests, negative mutation tests, before/after database comparison.

### TWM-001E — HMAC challenge and nonce fail-closed containment
**Priority:** P0 / critical  
**Audit references:** `src/app/api/auth/hmac-challenge/route.ts`, `src/lib/db.ts`, `src/app/onboarding/page.tsx`

**Audit findings**
- Challenge endpoint has no session check and accepts caller-supplied `userId`.
- `verifyAndConsumeNonce()` inserts unknown nonces as consumed and returns `{ valid: true }`.
- Onboarding hardcodes `handle: "aarav_coder"`.
- Ownership proof is not persisted to an authoritative student-provider binding.

**Containment objective:** prevent false provider ownership verification.

**Read-only investigation**
- Trace challenge creation, nonce persistence, verification, consumption, and onboarding state transitions.
- Find every caller of `verifyAndConsumeNonce()`.
- Determine whether LeetCode/HackerRank ownership checks depend on this helper.
- Check whether any existing provider account table can store verified ownership.

**Proposed implementation direction — not authorized yet**
- Disable the affected ownership-verification flow until the challenge is bound to an authenticated actor and pending provider connection.
- Unknown, expired, consumed, mismatched, or replayed nonce must fail closed.
- Remove hardcoded demo provider handles from any production-capable onboarding flow.
- Do not mark a provider verified merely because a public profile exists.
- Do not use this containment task to enable unofficial provider collection.

**Acceptance tests after authorization**
1. Anonymous caller cannot create a challenge for an arbitrary user.
2. Client cannot choose another student's identity.
3. Unknown nonce is invalid and does not create a valid verification result.
4. Expired, consumed, mismatched, and replayed nonce is rejected.
5. Challenge is bound to actor, provider, pending connection, and external account.
6. Demo handle cannot be persisted as a real user's verified provider account.
7. Provider ownership verification and permission to collect telemetry remain separate states.

**Required evidence:** unit tests for nonce lifecycle, route authorization tests, onboarding regression test.

### TWM-001F — Cron finalization fail-closed containment
**Priority:** P0 / critical  
**Audit reference:** `src/app/api/cron/boundary-finalize/route.ts`

**Audit findings**
- If `CRON_SECRET` is unset, authorization condition fails open.
- Route does not pass an explicit competition period boundary.
- Week number defaults to hardcoded `42`.
- Recorded quorum, stuck-job, and unresolved-dispute gates are not enforced in the route/domain finalization path identified by the audit.

**Containment objective:** prevent unauthorized or incorrectly timed finalization.

**Read-only investigation**
- Inspect all scheduler entrypoints and scripts.
- Trace `executeWeeklyFinalization()` and all callers.
- Identify how period/year/week and Asia/Kolkata boundary are represented.
- Identify whether finalization can create persistent standings or awards.

**Proposed implementation direction — not authorized yet**
- Missing or invalid production scheduler authentication must stop execution before any state mutation.
- Require an explicit competition period and boundary; no implicit `now` or hardcoded week fallback.
- Until all finalization gates and policy semantics are implemented and approved, disable the finalization mutation path rather than publish provisional standings as final.
- Make repeated authorized invocation idempotent.

**Acceptance tests after authorization**
1. Missing `CRON_SECRET` in production performs no work.
2. Invalid secret is denied.
3. Missing/invalid period or boundary is rejected.
4. No default week/year or execution-time boundary is used.
5. Invocation before the permitted boundary cannot finalize.
6. Required data-quality gates block finalization.
7. Duplicate invocation does not duplicate standings or awards.
8. Scheduler route cannot be invoked by an ordinary user session.

**Required evidence:** route tests, finalizer unit/integration tests, persistence assertions for denied invocations.

### TWM-001G — LeetCode/HackerRank production collection isolation
**Priority:** P0 / critical compliance gate  
**Audit references:** `src/app/api/telemetry/leetcode/route.ts`, `src/app/api/telemetry/hackerrank/route.ts`, onboarding/provider UI and any scheduled callers.

**Audit finding:** active routes call LeetCode GraphQL and HackerRank REST using public profile retrieval patterns, while written production authorization and reliable coverage have not been established. Profile existence is incorrectly represented as ownership verification in at least one path.

**Containment objective:** prevent unapproved provider collection and false verification claims.

**Read-only investigation**
- Search all route, cron, worker, UI, and server imports that can invoke LeetCode/HackerRank retrieval.
- Identify whether requests can run automatically on page load, sync action, cron, or tests.
- Identify all places that set `isVerified` or equivalent from profile existence.
- Locate configuration flags, if any, and confirm their defaults without changing them.

**Proposed implementation direction — not authorized yet**
- Disable production collection by default until written provider permission and reliable data coverage are documented and approved.
- Ensure no background job or alternate route bypasses the gate.
- Represent provider state honestly as unavailable, unverified, or disabled.
- Keep LeetCode compulsory-intent/fallback decision subject to DEC-08 and Product Owner approval.
- HackerRank remains optional and excluded from Weekly Common.
- No scraping, CAPTCHA/WAF bypass, anti-bot circumvention, or access-control bypass.

**Acceptance tests after authorization**
1. Production LeetCode collection is blocked by default.
2. Production HackerRank collection is blocked by default.
3. No scheduled/background path bypasses provider gates.
4. Profile existence alone never sets ownership verified.
5. UI does not display disabled/unverified providers as connected and verified.
6. Provider gate cannot be enabled without owner-controlled approval/configuration and documented permission evidence.

**Required evidence:** route/import inventory, provider-gate tests, UI state tests, configuration review.

### TWM-001H — Production demo-data seeding containment
**Priority:** P1 / pilot-blocking data-integrity risk  
**Audit reference:** `src/lib/db.ts`, especially `getDb()` and `seedInitialRosterIfEmpty()`.

**Audit finding:** database initialization unconditionally seeds fictional roster records when the roster table is empty, including VIT-branded sample students.

**Containment objective:** ensure a clean production database never receives demo identities or observations.

**Read-only investigation**
- Trace every call to `getDb()` and seed function.
- Identify all demo users, sample observations, fixtures, and environment conditions.
- Determine whether the current local database contains only test/demo data or any real user data.
- Do not inspect or expose personal data unnecessarily.

**Proposed implementation direction — not authorized yet**
- Ensure production startup never seeds sample users or telemetry.
- Move demo fixtures to an explicit isolated development/test seed command.
- Do not delete existing database rows as part of containment.
- Require an explicit environment guard and test proving production initialization remains empty.

**Acceptance tests after authorization**
1. Production-mode initialization of an empty database creates no demo users or observations.
2. Development/test seed is explicit and isolated.
3. Existing records are not deleted or overwritten.
4. Build/startup does not implicitly populate a production roster.
5. No sample institutional identity/domain is used as a real user.

**Required evidence:** isolated environment test, startup-path trace, database row assertions.

## 5. Recommended order after authorization

| Sequence | Task | Why |
|---:|---|---|
| 1 | TWM-001B telemetry write-path | Prevents arbitrary score/metric injection |
| 2 | TWM-001C dispute API | Prevents data leakage and unauthorized decisions |
| 3 | TWM-001D roster import | Protects cohort membership and quorum integrity |
| 4 | TWM-001F cron/finalizer | Prevents unauthorized or incorrect finalization |
| 5 | TWM-001E HMAC/nonce | Prevents false ownership verification |
| 6 | TWM-001G provider isolation | Prevents unapproved collection |
| 7 | TWM-001H demo seeding | Prevents fictional records in production |

**Dependency note:** the final implementation order may change after Antigravity inspects shared dependencies. Emergency containment can be split into small, independently reviewable commits. Do not build a full RBAC system as an unreviewed side effect of these containment patches.

## 6. Cross-cutting requirements

Every authorized containment patch must:
- Derive actor identity on the server.
- Deny by default when authentication, role, or scope is unknown.
- Avoid accepting client-supplied authoritative identity or evidence.
- Preserve valid personal read-only workflows where safe.
- Return explicit unavailable/forbidden responses instead of fake success.
- Log security events without logging OTPs, access tokens, provider tokens, or unnecessary personal data.
- Be covered by negative tests, not only happy-path tests.
- Avoid introducing new provider integrations or expanding product scope.
- Preserve locked TWM decisions and mark unresolved policy dependencies.

## 7. Required Antigravity report before any code changes

Antigravity must now return a read-only implementation readiness report containing:

1. Current HEAD SHA and working-tree status.
2. Revalidated status of TWM-001B through TWM-001H.
3. Exact files, routes, helpers, and callers affected by each task.
4. Shared dependencies and possible regressions.
5. Proposed smallest patch for each containment item.
6. Tests that will be added and how they will be run safely.
7. Whether any task requires an approved role/session model first.
8. Recommended commit boundaries and rollback strategy.
9. Any task that cannot be safely contained without architecture work.

**Do not implement anything during this report.**

## 8. Product Owner authorization gate

The current authorization state is:

<badge color="danger">READ-ONLY — NO CODE CHANGES AUTHORIZED</badge>

The following require separate explicit approval:
- Editing or creating repository files.
- Running write-capable tests or scripts.
- Changing environment variables or secrets.
- Modifying SQLite/PostgreSQL data or schema.
- Disabling live routes through deployment/configuration changes.
- Deploying or changing provider settings.

The Product Owner may authorize one task or one bounded batch at a time. Silence, a generated document, or a recommendation is not authorization.

## 9. Definition of done

TWM-001 is complete only when, after explicit authorization:
- All critical exposed write paths are denied to unauthorized clients.
- Dispute confidentiality and decision authority are server-enforced.
- Roster mutation is role/cohort-authorized.
- Cron fails closed and cannot finalize outside approved boundaries.
- Unknown/replayed HMAC nonces fail closed.
- Unapproved provider collection is disabled across all invocation paths.
- Production startup cannot seed demo data.
- Negative tests prove denied actions do not mutate persistent state.
- Commit SHAs, test evidence, and remaining risks are reviewed by the Product Owner.

**Final status:** Prepared for Antigravity read-only review. Implementation remains blocked pending explicit Product Owner approval.
