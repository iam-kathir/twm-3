# TWM Remediation & Implementation Specification
**Version:** 1.0  
**Prepared:** 14 November 2026  
**Project:** TWM V3.1 — GitHub-first class pilot  
**Repository baseline:** `iam-kathir/twm-3`  
**Audited commit:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Status:** Implementation planning artifact — NOT authorization to modify the repository

---

## 1. Purpose

This document converts the Repository Audit & Implementation Gap Report v1.0 into an actionable, ordered implementation specification for Antirasti.

It defines:
- remediation work packages,
- file/module responsibilities,
- dependency order,
- security and data-integrity acceptance tests,
- rollout gates,
- items that must remain disabled until Product Owner decisions or provider evidence exist.

It is not a request to rewrite TWM from scratch. Preserve reusable UI, utilities, tests, and operational scripts where they can be made compliant. Do not treat a file-level recommendation as permission to edit the repository, deploy, rotate credentials, or change external accounts. Those actions require separate authorization.

## 2. Source baseline and constraints

### 2.1 Source hierarchy
1. Explicitly locked Product Owner decisions.
2. Latest approved TWM V3.1 requirements and explicit later amendments.
3. Master Decision Register v1.0.
4. UI/UX & Technical Architecture Blueprint v1.0.
5. Repository Audit & Implementation Gap Report v1.0.
6. Claude and Argon reviews as advisory evidence, not approvals.
7. This implementation specification as proposed execution detail.

### 2.2 Baseline repository facts
The source audit was performed against `main` at commit `6cb7c876173796f37e1e427960249089069ef6a5`. It identified a Next.js 14 / React 18 / TypeScript application using native `node:sqlite`, inline schema creation, and a Student workspace plus a large Admin Hub.

The audit was source-level only. No build, tests, runtime, deployment, or live provider calls were executed. Antirasti must re-check the repository HEAD and inspect the current code before acting. If the branch has moved, first produce a change-aware delta audit; do not blindly apply this specification to stale line numbers or assumptions.

### 2.3 Non-negotiable constraints
- No rebuild from scratch without explicit Product Owner approval.
- No unauthorized scraping, CAPTCHA/WAF bypass, anti-bot circumvention, or provider access-control bypass.
- No LeetCode or HackerRank production collection until written permission and reliable coverage are evidenced.
- No client-supplied student identity, reviewer identity, role, cohort authority, or authoritative metric values.
- No missing-data-to-zero conversion.
- No manual screenshot-submission fallback.
- Core platform must function with AI disabled.
- No production deployment, migration execution, credential rotation, DNS/domain changes, or account setting changes without explicit authorization.
- Keep provider passwords out of TWM.
- Every policy-dependent implementation must reference an approved decision and policy version.

## 3. Execution strategy

### Recommended order
1. **Gate 0 — Refresh baseline and freeze unsafe paths**
2. **Work Package 1 — Authentication and authorization trust boundaries**
3. **Work Package 2 — Telemetry ingestion integrity**
4. **Work Package 3 — Provider ownership and compliance isolation**
5. **Work Package 4 — Finalization, quorum, and scoring policy closure**
6. **Work Package 5 — PostgreSQL and formal migration architecture**
7. **Work Package 6 — Role workspaces, consent, and operational UX**
8. **Work Package 7 — Production hardening and pilot acceptance**

Do not parallelize tasks that depend on unresolved product policy. Independent test design, UI component inventory, and provider documentation research can proceed in parallel.

### Priority definitions
- **P0:** production-blocking security/data-integrity defect.
- **P1:** required architecture or product-policy alignment before competition features.
- **P2:** workspace, usability, reporting, and operational completion.
- **P3:** production hardening, pilot validation, and optional expansion.

---

## 4. Gate 0 — refresh baseline and freeze unsafe paths

**Objective:** make sure implementation starts from the current repository state and prevent known unsafe endpoints from being used as trusted production paths.

### Tasks
1. Record current branch, HEAD SHA, working tree state, and deployment target.
2. Compare HEAD with audited commit `6cb7c876173796f37e1e427960249089069ef6a5`.
3. Re-open every P0 file listed in the audit; record changed/unchanged status.
4. Identify whether unsafe telemetry, dispute, roster, HMAC, and cron routes are publicly reachable in the deployed environment.
5. If the current deployment is reachable, recommend a safe feature flag/route disablement plan. Do not change deployment settings without authorization.
6. Add an implementation branch and change log only after repository owner approval.

### Deliverables
- Baseline delta report.
- Current route exposure inventory.
- P0 containment proposal.
- Updated file map.

### Acceptance
- Exact HEAD SHA recorded.
- Every P0 finding revalidated against current source.
- No implementation begins from a stale commit.
- No repository or deployment mutation occurs without approval.

---

## 5. Work Package 1 — authentication and authorization trust boundaries (P0)

**Objective:** every protected operation derives the actor from a valid server-side identity and checks role, cohort, ownership, and grant scope.

### 5.1 Session and actor context

**Current audit files:** `src/lib/auth.ts`, `src/app/api/auth/session/route.ts`, protected API routes.

**Target responsibilities**
- Introduce a server-only actor resolver, e.g. `getActorContext()`.
- Return immutable server-derived `userId`, institutional identity, role assignments, active cohort scopes, and session metadata.
- Never accept role, reviewer, student ID, or cohort ownership from request JSON/query parameters.
- Separate authentication (who is the actor?) from authorization (may this actor perform this action?).
- Preserve current authentication only where secure; session storage redesign must follow approved session policy.

**Suggested module boundaries**
```text
src/lib/auth/
  session.ts
  actor-context.ts
  permissions.ts
  authorization.ts
  csrf.ts
```
These are proposed paths. Reconcile with current structure before creating files.

**Acceptance tests**
- Missing, expired, malformed, or revoked session is rejected.
- Client-supplied `userId`, `studentId`, `role`, `reviewer`, and `cohortId` cannot elevate privileges.
- Student A cannot access Student B resources by changing URL/body IDs.
- Server-side role and cohort checks execute on every protected mutation and read.
- Logout/revocation behavior matches the approved session policy.

### 5.2 Dispute API authorization

**Current file:** `src/app/api/disputes/route.ts`.

**Target behavior**
- GET: Student receives only own disputes; Faculty receives assigned-cohort disputes; Coordinator receives only disputes within an active `ASSIST_DISPUTE_TRIAGE` grant; Platform Admin access is limited and audited.
- POST: student identity derives from session. Client may submit dispute target and reason, but not authoritative student identity or reviewer identity.
- PATCH/decision: only the policy-authorized reviewer role may decide. Coordinator can add triage notes/recommendations but cannot finalize.
- Reviewer identity derives from actor context.
- Enforce conflict-of-interest and self-review restrictions.
- Enforce DEC-02: no more than two simultaneously open sync disputes per student per competition week.
- Enforce a mandatory decision reason and immutable audit event.

**Acceptance tests**
1. Anonymous GET/POST/PATCH denied.
2. Student A cannot read Student B disputes.
3. Student cannot resolve a dispute, even with a valid session.
4. Coordinator with triage grant can triage but cannot decide.
5. Coordinator without grant or with expired grant is denied.
6. Faculty outside assigned cohort is denied.
7. Request-supplied `reviewer` is ignored/rejected.
8. Third simultaneously open sync dispute in the same competition week is rejected.
9. A reviewer cannot approve their own disputed action where conflict policy applies.
10. Every final decision records actor, reason, timestamp, target, and prior state.

### 5.3 Roster import authorization

**Current file:** `src/app/api/roster/bulk-import/route.ts`.

**Target behavior**
- Only Faculty with ownership of the target cohort or Platform Admin with institution-wide authority can import.
- Coordinator can assist with roster review only under a specific grant; no final roster commit unless separately approved.
- Student and unauthenticated actors are denied.
- Remove broad non-production authentication bypass from any path that can mutate shared data.
- CSV parser must support quoted commas, escaped quotes, and embedded newlines.
- Use preview → validate → commit flow.
- Store before/after changes and actor in audit.

**Acceptance tests**
- Student, Coordinator without proper grant, and anonymous actor cannot commit.
- Faculty cannot import into another Faculty's cohort.
- Platform Admin can act within approved institution scope.
- Malformed rows produce row-level errors without partial silent mutation.
- Repeated import is idempotent or clearly reports duplicates.
- Audit event includes file digest, counts, actor, cohort, and change summary without retaining unnecessary personal data.

### 5.4 Cron and scheduled job authorization

**Current file:** `src/app/api/cron/boundary-finalize/route.ts`.

**Target behavior**
- Missing production scheduler secret must fail closed.
- Validate secret using constant-time comparison or authenticated scheduler identity.
- Require explicit competition period and boundary; no hardcoded week/year and no implicit `now`.
- Finalization must be idempotent and lock-protected.
- Scheduler route only orchestrates a domain service; it must not contain policy logic.

**Acceptance tests**
- Missing secret in production returns configuration failure and performs no work.
- Invalid secret is denied.
- Missing/invalid period and boundary are rejected.
- Duplicate scheduler invocation does not duplicate awards or snapshots.
- A period cannot finalize before its configured boundary or while a required gate is false.

---

## 6. Work Package 2 — telemetry ingestion integrity (P0)

**Objective:** only server-retrieved, validated provider evidence can become canonical telemetry.

### Current audit file
`src/app/api/telemetry/sync/route.ts` and `src/lib/db.ts`.

### Target request flow
```text
Authenticated student requests sync
        |
        v
Server derives student/provider account
        |
        v
Rate limit + active connection/consent checks
        |
        v
Create durable sync job
        |
        v
Worker calls approved provider adapter
        |
        v
Validate ownership, timestamps, pagination, coverage
        |
        v
Normalize + deduplicate
        |
        v
Persist canonical observation/event
        |
        v
Recompute eligible metrics from server-owned evidence
```

### Required changes
- Replace client metric write semantics with a sync-command endpoint.
- Derive `studentId` from authenticated actor context.
- Do not accept client `metricValue`, `displayValue`, provider raw payload, or attribution email as authoritative input.
- Separate public profile preview from authenticated student sync.
- Create internal ingestion service that can only be called by trusted worker/server modules.
- Attach provenance: provider, external account ID, source event ID, observation mode, source timestamp, retrieval timestamp, coverage window, payload version, validation state, eligibility state.
- Deduplicate using stable provider source IDs or a provider-specific deterministic key.
- Unknown or incomplete coverage remains partial/unknown; never invent 94.2% coverage.
- No activity is a valid result only when retrieval coverage supports that conclusion.

### Proposed module boundaries
```text
src/lib/telemetry/
  envelope.ts
  validation.ts
  deduplication.ts
  coverage.ts
  ingestion-service.ts
  eligibility.ts
src/lib/providers/
  contracts.ts
  github/
    adapter.ts
    normalizer.ts
```

### Acceptance tests
1. Client cannot submit an authoritative metric value.
2. Client cannot choose another student's ID.
3. Worker-only ingestion cannot be called by browser clients.
4. Duplicate provider events do not double-count.
5. Missing source timestamp is represented honestly.
6. Snapshot delta is never displayed as an exact day-level event.
7. Partial pagination produces partial coverage.
8. A provider outage does not become zero activity.
9. Provider-native day buckets are not silently labeled as IST days.
10. Every score-eligible observation has ownership, provenance, and validation evidence.

---

## 7. Work Package 3 — provider ownership and compliance isolation (P0/P1)

### 7.1 GitHub

**Current audit files:** `src/app/api/auth/github/route.ts`, `src/app/api/auth/github/callback/route.ts`, `src/app/api/telemetry/github/route.ts`.

**Target behavior**
- Separate GitHub login from GitHub telemetry authorization.
- Use OAuth state validation and PKCE where supported.
- Bind OAuth callback to the initiating TWM session.
- Verify account identity using immutable GitHub external ID.
- Attribution must use server-verified account identity and documented email/commit rules; no caller-supplied verified email.
- Determine exact API fields, scopes, quotas, history, and timestamp semantics.
- Do not claim complete activity from a bounded events endpoint.
- Resolve whether the minimal-scope token is discarded after ownership proof or retained encrypted for documented telemetry needs.

**Acceptance**
- OAuth state mismatch/replay rejected.
- Callback cannot attach a GitHub account to a different TWM user.
- Username changes do not change provider account identity.
- Unverified email cannot influence author attribution.
- Coverage is evidence-based and never hardcoded.
- Token scopes and retention match approved policy.

### 7.2 LeetCode

**Current audit files:** `src/app/api/auth/hmac-challenge/route.ts`, `src/app/api/telemetry/leetcode/route.ts`, onboarding page.

**Target disposition**
- Keep production adapter disabled until explicit provider permission and reliable data access are evidenced.
- Do not treat profile existence as ownership verification.
- HMAC challenge, if retained for a permitted use, must be bound to authenticated actor, pending connection, nonce, provider, and external account.
- Unknown, expired, consumed, or replayed nonce must fail closed.
- Do not hardcode a username in onboarding.
- DEC-08 remains: compulsory LeetCode production enforcement only after Phase 0 proves a permitted reliable method.

**Acceptance**
- No production LeetCode fetch path is active without approved permission flag/evidence.
- Challenge cannot be created or consumed for another user.
- Unknown nonce is rejected.
- Ownership proof and data-fetch permission are separate states.
- If Phase 0 fails, onboarding follows an explicitly approved fallback; no silent fake verification.

### 7.3 HackerRank

**Current audit file:** `src/app/api/telemetry/hackerrank/route.ts`.

**Target disposition**
- Optional provider.
- Keep production collection disabled pending written authorization and data completeness proof.
- Do not include in Weekly Common.
- Do not claim that public profile/badge retrieval is complete activity history.

**Acceptance**
- Adapter is disabled by default.
- Enabling requires explicit owner-controlled feature/config gate plus recorded provider approval.
- No HackerRank score contribution until approved Semester Common rules and reliable fields exist.

### 7.4 Codeforces
- Not in current cohort baseline.
- Do not add as a replacement or scope expansion without Product Owner approval.

---

## 8. Work Package 4 — competition policy, quorum, and finalization (P1)

**This work package is policy-blocked.** Do not implement new Common scoring or awards until the Product Owner resolves the conflicts listed below.

### 8.1 Required owner decisions
1. Independent provider standings versus Weekly Common/Semester Common.
2. Consistency formula: five active days versus observed eligible days and coverage.
3. Authoritative GitHub and LeetCode raw point conversions.
4. Missing provider, partial onboarding, outage, and zero-activity semantics.
5. Per-student provisional hold versus cohort-wide hold.
6. Zero-score podium eligibility.
7. Exam/holiday week behavior.
8. Tie, rounding, and score version rules.

### 8.2 Required domain model
- Versioned `ScoringPolicy`.
- `MetricSnapshot` with input provenance and period.
- `ScoreSnapshot` with component values, formula version, status, and reproducibility metadata.
- `LeaderboardSnapshot` with competition period, policy version, state, and rank.
- Separate `ProviderConnectionState`, `OwnershipState`, `SyncSuccessState`, `CoverageState`, and `PeerVisibilityState`.

### 8.3 Quorum implementation
DEC-06 locked behavior:
- Quorum is based on verified successful sync, independent of leaderboard opt-in.
- Verified connected opted-out students remain in the quorum population.
- Verified zero-activity students count as successfully synced.
- Opted-out students do not appear in peer-facing rankings.

Do not use non-empty provider handle as a substitute for verified successful sync.

### 8.4 Finalization lifecycle
The current recorded target workflow:
- Monday 00:00–06:00 IST: reconciliation target window.
- 06:00–18:00 IST: review window.
- 18:00 IST: conditional finalization, not unconditional timer execution.

Existing recorded gates:
- Zero stuck compulsory-provider jobs from before close.
- Quorum at least 70%.
- Zero unresolved score-affecting disputes.

Finalization must be a deterministic state machine, idempotent, auditable, and tied to an explicit competition period. The exact relationship between per-student holds and cohort-level gates requires owner approval.

### Acceptance tests
- Quorum counts verified synced opted-out students.
- Quorum excludes unverified handles and failed syncs.
- Verified zero activity is counted distinctly from missing data.
- Below-threshold quorum blocks finalization.
- Stuck compulsory-provider jobs block finalization.
- Unresolved score-affecting disputes follow approved hold policy.
- Finalization cannot run before allowed window.
- Duplicate run does not duplicate awards.
- Competition ranking follows 1,2,2,4.
- Historical finalized score is immutable; correction creates audited superseding snapshot.

---

## 9. Work Package 5 — PostgreSQL and migration architecture (P1)

**Objective:** replace ad hoc SQLite schema evolution with approved PostgreSQL persistence and formal migrations without losing required history.

### Current audit baseline
`src/lib/db.ts` uses native `node:sqlite`, inline table creation, ad hoc ALTER statements, and demo seed logic.

### Required planning before migration
1. Inventory every current table, index, constraint, query, transaction, and seed path.
2. Map current data to approved conceptual entities.
3. Approve retention schedule before defining expiry jobs.
4. Decide whether historical demo/test records are discarded or preserved in a clearly isolated test dataset.
5. Define migration and rollback strategy.
6. Choose ORM/query layer only after repository and deployment validation; do not assume Prisma is required.

### Proposed target entities
`Institution`, `User`, `RoleAssignment`, `StudentProfile`, `Cohort`, `CohortMembership`, `CoordinatorGrant`, `ProviderAccount`, `ProviderCredential`, `ConsentRecord`, `SyncJob`, `SyncAttempt`, `RawObservation`, `TelemetryEvent`, `CoverageWindow`, `MetricSnapshot`, `ScoreSnapshot`, `LeaderboardSnapshot`, `Achievement`, `Dispute`, `AuditEvent`, `Notification`, `Session`, `OtpChallenge`.

### Mandatory integrity requirements
- Unique provider account by provider + immutable external account ID.
- Unique normalized event deduplication key.
- Foreign keys for membership, grant, score, dispute, and provider account relations.
- Effective-dated cohort membership.
- Transactional enforcement for dispute cap and policy-critical rate limits.
- Immutable finalized score snapshots.
- UTC storage; Asia/Kolkata presentation.
- No production demo seeding.

### Acceptance tests
- Migrations run from an empty database.
- Migrations upgrade a representative prior schema/data fixture.
- Rollback or forward-recovery procedure is documented and tested.
- Foreign-key and unique constraints prevent duplicate identities/events.
- No sample roster appears in production initialization.
- Backup restore reproduces the migrated schema and expected records.

---

## 10. Work Package 6 — role workspaces, consent, and UX (P2)

### 10.1 Student workspace
Required screens:
- Dashboard
- Activity timeline
- Analytics
- Leaderboard (only after policy approval)
- Achievements
- Provider connections
- Disputes
- Privacy/consent
- Settings and data export

Each data-driven screen supports loading, empty, verified/current, stale/provisional, partial coverage, error/unavailable, restricted/opted-out, and archived/read-only states where applicable.

### 10.2 Coordinator workspace
- Overview of assigned cohorts and active grants.
- Scoped roster view.
- Sync operations only with `TRIGGER_COHORT_SYNC`.
- Dispute triage only with `ASSIST_DISPUTE_TRIAGE`.
- Reports only within grant scope.
- Visible grant expiry and revocation state.
- No final dispute or roster decision.

### 10.3 Faculty workspace
- Assigned cohort overview.
- Cohort management and roster import.
- Student detail and cohort analytics.
- Roster correction review.
- Dispute decision queue.
- Coordinator grant management.
- Reports and audit views within assigned scope.

### 10.4 Platform Admin workspace
- Institution configuration.
- Faculty provisioning and cohort ownership.
- Scoring policy versioning.
- Provider health.
- Security and audit.
- No unnecessary unrestricted student browsing.

### 10.5 Consent ledger
- Provider connection consent and peer leaderboard visibility must be separate.
- Record consent type, policy/version, timestamp, actor, withdrawal, and source.
- Optional peer visibility defaults must follow the approved privacy policy; do not assume default-on.
- Withdrawal must affect future peer views according to the approved policy and preserve required audit history.

### Acceptance tests
- Student cannot access role workspaces by changing a URL.
- Coordinator permissions are cohort-scoped, time-limited, and immediately revocable.
- Faculty sees only assigned cohorts unless Platform Admin scope applies.
- Opt-out removes student from peer-facing views but does not improperly remove verified sync from DEC-06 quorum.
- Every consent change is persisted and auditable.
- UI never labels a provider as verified merely because a profile exists.

---

## 11. Work Package 7 — production hardening and pilot acceptance (P3)

### Required work
- Build, typecheck, lint, unit/integration/E2E test suite.
- Security review: IDOR, privilege escalation, CSRF, OAuth state, session replay, rate-limit bypass.
- Accessibility review (target WCAG 2.2 AA).
- Structured logs and metrics with correlation IDs.
- Queue health, provider error, OTP delivery, and database health alerts.
- Backup and restore drill.
- Incident response and provider outage runbooks.
- Staging environment with production-like configuration but test data.
- Controlled pilot plan with explicit cohort, support owner, rollback criteria, and data deletion/retention plan.
- Feature flags for optional provider integrations and competition publication.

### Production acceptance gate
Production launch is blocked until:
- All P0 security findings are fixed and independently tested.
- Product policy conflicts affecting scores/awards are resolved.
- Provider permissions are documented.
- Data retention and consent are approved.
- PostgreSQL migration and restore are validated.
- RBAC tests pass for all roles and grants.
- No known critical/high vulnerability remains without explicit risk acceptance.
- Product Owner signs off on pilot scope and rollback plan.

---

## 12. Exact file/module responsibility map

| Existing file/path | Required responsibility after remediation | Priority |
|---|---|---|
| `src/lib/auth.ts` | Keep or refactor session validation; expose server-only actor context | P0 |
| `src/app/api/disputes/route.ts` | Authenticated, role-scoped dispute reads/creation/decisions | P0 |
| `src/app/api/roster/bulk-import/route.ts` | Faculty/Admin-authorized preview and commit import | P0 |
| `src/app/api/cron/boundary-finalize/route.ts` | Fail-closed scheduler entrypoint; explicit period | P0 |
| `src/app/api/telemetry/sync/route.ts` | Authenticated sync command only; no client metric writes | P0 |
| `src/app/api/telemetry/github/route.ts` | Replace or isolate preview; server-side adapter ingestion | P0/P1 |
| `src/app/api/auth/hmac-challenge/route.ts` | Session-bound challenge or disabled pending provider permission | P0 |
| `src/app/api/telemetry/leetcode/route.ts` | Disabled production adapter pending permission | P1 |
| `src/app/api/telemetry/hackerrank/route.ts` | Disabled production adapter pending permission | P1 |
| `src/lib/db.ts` | Transitional repository only; remove production seeding; migrate persistence | P0/P1 |
| `src/lib/finalizer.ts` | Rebuild only after approved scoring/finalization policy | P1 |
| `src/lib/leaderboard.ts` | Preserve ranking utility; add policy-driven score input only after approval | P1 |
| `src/lib/rate-limit.ts` | Retain as secondary limiter; durable policy enforcement required | P1 |
| `src/app/onboarding/page.tsx` | Remove hardcoded provider identity; consent and provider state UX | P1/P2 |
| `src/app/dashboard/page.tsx` | Render provenance/coverage states, not inferred verification | P2 |
| `src/app/admin/page.tsx` | Split into role-specific workspaces; remove hardcoded audit fixtures | P2 |
| `.env.example` | Align template with approved institution and required secrets | P1 |
| `scripts/audit-launch-checklist.mjs` | Replace stale assertions with current approved acceptance gates | P3 |
| `README.md` | Update architecture, setup, scope, and operational claims after implementation | P3 |

All file paths must be revalidated against current HEAD before implementation. This table is a responsibility map, not a line-by-line patch plan.

---

## 13. Dependency map

```text
Gate 0: current HEAD + delta audit
          |
          v
P0: actor/session + authorization foundation
          |
          +------> dispute authorization
          |
          +------> roster authorization
          |
          +------> cron fail-closed controls
          |
          v
P0: trusted provider sync + canonical telemetry
          |
          +------> GitHub adapter validation
          |
          +------> provider ownership binding
          |
          v
P1: PostgreSQL schema + migrations
          |
          v
P1: consent + role/grant model + coverage/quorum
          |
          v
Owner decision closure: scoring + finalization + retention
          |
          v
P1: deterministic competition engine
          |
          v
P2: complete role workspaces + reports
          |
          v
P3: security/ops/accessibility/pilot acceptance
```

**Important:** the exact order of the P0 database-backed authorization and PostgreSQL migration work must be chosen after assessing how much can safely be patched in the current SQLite code. Do not create a temporary authorization system that must immediately be discarded. A short-lived containment fix may be justified for exposed endpoints, but production launch must use the approved persistence and role architecture.

---

## 14. Implementation delivery protocol for Antirasti

For each work package, Antirasti should provide:

1. **Pre-change summary:** current files, exact planned changes, assumptions, and risks.
2. **Decision references:** which locked decisions and approved policy versions govern the work.
3. **Change set:** small, reviewable commits grouped by coherent objective.
4. **Tests:** added/updated tests and exact commands/results.
5. **Security notes:** trust boundaries changed and abuse cases tested.
6. **Migration notes:** schema impact, backfill, rollback/forward recovery.
7. **Evidence:** relevant diffs, test output, and screenshots for UI work.
8. **Post-change summary:** completed, deferred, blocked, and follow-up items.

No work package should be marked complete based only on “code written.” Completion requires acceptance tests to pass and evidence to be reviewed.

### Change control
- Do not silently change locked decisions.
- If implementation reveals a policy conflict, stop that dependent task and raise a decision request.
- If a provider capability is uncertain, mark it VALIDATION REQUIRED.
- If the repository has changed, update the audit before modifying affected files.
- No secrets or production credentials in prompts, commits, logs, or generated reports.

---

## 15. Product Owner decision gates

The following are not implementation details that Antirasti can decide independently:

1. Weekly Common/Semester Common versus independent provider leaderboards.
2. Consistency formula.
3. Raw GitHub and LeetCode point conversion rules.
4. Missing provider and partial onboarding treatment.
5. Cohort-wide versus per-student finalization holds.
6. Zero-score podium eligibility.
7. Exam/holiday week policy.
8. Unified retention schedule.
9. GitHub token discard versus encrypted retention.
10. Faculty-only versus DEC-04 final decision authority.
11. Platform Admin self-affecting action review.
12. LeetCode onboarding fallback if Phase 0 fails.
13. Production email provider/domain setup.
14. Session lifetime/revocation policy.
15. Report/export fields and retention.

Antirasti may prepare options and impact analysis, but must not select a policy silently.

---

## 16. Definition of done

TWM is ready for a controlled class pilot only when all of the following are true:

- Current repository baseline is recorded and audited.
- No P0 security/data-integrity finding remains.
- Student, Coordinator, Faculty, and Platform Admin permissions are server-enforced.
- Provider identity, authorization, telemetry availability, and coverage are distinct states.
- GitHub telemetry is attributable, deduplicated, and coverage-aware.
- LeetCode/HackerRank remain disabled unless permission and reliability gates pass.
- Consent and privacy choices are persisted and auditable.
- Competition formulas and finalization rules are approved, versioned, and tested—or competition publication remains disabled.
- PostgreSQL schema/migrations and backup restore are verified.
- All required screens expose correct loading/empty/stale/partial/error/restricted states.
- CI, security, accessibility, and operational checks pass.
- Pilot scope, support, rollback, and data lifecycle are approved by the Product Owner.

**Final status:** This specification is ready for Product Owner review. It is not an implementation authorization.
