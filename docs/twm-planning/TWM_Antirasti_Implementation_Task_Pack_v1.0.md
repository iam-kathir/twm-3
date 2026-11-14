# TWM V3.1 — Antirasti Implementation Task Pack
**Version:** 1.0 | **Prepared:** 14 November 2026  
**Target pilot:** 7 December 2026  
**Repository baseline:** `iam-kathir/twm-3`  
**Audited commit:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Status:** Task specification only — no authorization to modify code, migrate data, or deploy.

## 1. Purpose and working rules

This pack turns the Master Execution Roadmap into reviewable implementation tickets for Antirasti.

**Before starting:** re-check the current repository HEAD. The audit commit above is a reference point, not an assumption that `main` has not changed.

Rules:
- Do not rebuild TWM from scratch.
- Do not silently alter locked Product Owner decisions.
- Do not activate LeetCode/HackerRank production collection without documented permission and reliable coverage.
- Do not accept client-supplied identity, roles, reviewer identity, cohort authority, or authoritative metric values.
- Do not convert missing/partial data into zero activity.
- Do not deploy, run production migrations, change credentials, or alter external accounts without separate approval.
- Every task must end with a commit SHA, tests run, results, risks, and deferred items.

## 2. Task execution order

| Order | Task ID | Task | Priority | Depends on |
|---:|---|---|---|---|
| 0 | TWM-000 | Refresh repository baseline and delta audit | P0 | None |
| 1 | TWM-010 | Define trusted actor/session context | P0 | TWM-000 |
| 2 | TWM-011 | Centralize server-side authorization | P0 | TWM-010 |
| 3 | TWM-012 | Secure dispute API | P0 | TWM-011 |
| 4 | TWM-013 | Secure roster import | P0 | TWM-011 |
| 5 | TWM-014 | Harden cron finalization entrypoint | P0 | TWM-011 |
| 6 | TWM-020 | Remove client-authored telemetry writes | P0 | TWM-010, TWM-011 |
| 7 | TWM-021 | Build canonical telemetry envelope and validation | P0/P1 | TWM-020 |
| 8 | TWM-022 | Secure GitHub OAuth ownership binding | P0/P1 | TWM-010 |
| 9 | TWM-023 | Implement GitHub adapter with honest coverage | P1 | TWM-021, TWM-022 |
| 10 | TWM-024 | Disable unapproved provider collection | P1 | TWM-000 |
| 11 | TWM-030 | Inventory schema and plan PostgreSQL migration | P1 | TWM-000 |
| 12 | TWM-031 | Implement approved PostgreSQL migrations | P1 | TWM-030, owner approval |
| 13 | TWM-032 | Add durable jobs and transactional limits | P1 | TWM-031 |
| 14 | TWM-033 | Implement consent and audit foundations | P1 | TWM-031 |
| 15 | TWM-040 | Implement quorum and finalization state machine | P1, policy-blocked | Owner policy decisions |
| 16 | TWM-050 | Deliver role-specific pilot workspaces | P2 | TWM-011, TWM-031, TWM-033 |
| 17 | TWM-060 | Security, E2E, accessibility and restore validation | P0/P1 | Relevant tasks complete |
| 18 | TWM-070 | Pilot runbook and release candidate | P0 | TWM-060, owner sign-off |

---

## 3. Task specifications

### TWM-000 — Refresh repository baseline and delta audit
**Priority:** P0 | **Owner:** Antirasti | **Estimate:** 0.5–1 day

**Objective:** ensure all subsequent work targets the actual current code.

**Instructions**
1. Record branch, HEAD SHA, working-tree status, and deployment branch.
2. Compare current HEAD with audited commit `6cb7c876173796f37e1e427960249089069ef6a5`.
3. Re-open the P0 files from the repository audit.
4. Mark each finding unchanged, fixed, regressed, or changed.
5. Identify any live route exposure that requires owner-approved containment.

**Acceptance criteria**
- [ ] Exact HEAD SHA and date recorded.
- [ ] P0 findings revalidated against current source.
- [ ] Changed files and new risks listed.
- [ ] No code, configuration, deployment, or database mutation performed.

**Evidence:** delta report with file paths and commit references.

### TWM-010 — Define trusted actor/session context
**Priority:** P0 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Objective:** derive the acting user and session exclusively on the server.

**Instructions**
- Inspect current auth/session design before replacing it.
- Create a server-only actor context abstraction.
- Actor context should expose authenticated user ID, session state, role assignments, active cohort scope, and relevant grant scope.
- Reject missing, expired, malformed, or revoked sessions.
- Do not accept user identity or role from request body/query as authority.
- Keep session lifetime/revocation choices configurable only according to approved policy.

**Acceptance criteria**
- [ ] Anonymous request receives no actor context.
- [ ] Expired/revoked session is rejected.
- [ ] Client-supplied `userId`, `studentId`, or `role` cannot change actor identity.
- [ ] Server-only modules cannot be imported into client bundles.
- [ ] Unit tests cover valid, invalid, expired, and revoked sessions.

**Blocked decision:** final session lifetime and refresh/revocation policy if not already approved.

### TWM-011 — Centralize server-side authorization
**Priority:** P0 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Objective:** implement reusable permission checks for every protected read and mutation.

**Instructions**
- Separate authentication from authorization.
- Define permission checks for Student, Coordinator, Faculty, and Platform Admin.
- Enforce cohort assignment and time-limited Coordinator grants server-side.
- Coordinator grants are scoped, revocable, and cannot grant final approval authority.
- Deny by default when role or scope is missing.
- Avoid trusting client-side role switching or hidden UI elements.

**Acceptance criteria**
- [ ] Student A cannot access Student B resources by changing an ID.
- [ ] Faculty cannot access an unassigned cohort.
- [ ] Coordinator without an active matching grant is denied.
- [ ] Expired/revoked grants are denied immediately.
- [ ] Every protected route has an authorization test.
- [ ] Client role state does not affect server authorization.

### TWM-012 — Secure dispute API
**Priority:** P0 | **Owner:** Antirasti | **Estimate:** 1 day

**Current audit reference:** `src/app/api/disputes/route.ts`

**Instructions**
- GET scope: Student sees own disputes; Faculty sees assigned cohorts; Coordinator sees only granted triage scope.
- POST identity comes from actor context.
- PATCH decision authority comes from server-side permission checks.
- Coordinator may triage/recommend but cannot make final decisions.
- Reviewer identity is server-derived.
- Enforce no more than two simultaneously open sync disputes per student per competition week (DEC-02).
- Record reason, actor, timestamp, target, and state transition.

**Acceptance criteria**
- [ ] Anonymous GET/POST/PATCH denied.
- [ ] Student cannot read another student's dispute.
- [ ] Student cannot resolve disputes.
- [ ] Coordinator can triage only with grant and cannot finalize.
- [ ] Faculty outside assigned cohort denied.
- [ ] Request-supplied reviewer is ignored/rejected.
- [ ] Third open sync dispute in same competition week rejected.
- [ ] Decision audit is immutable and complete.

### TWM-013 — Secure roster import
**Priority:** P0 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Current audit reference:** `src/app/api/roster/bulk-import/route.ts`

**Instructions**
- Permit commit only to authorized Faculty for their cohort or Platform Admin within approved scope.
- Coordinator assistance must not become final commit authority unless explicitly approved.
- Remove mutation-capable development bypasses from production paths.
- Implement CSV parsing that handles quoted commas, escaped quotes, and embedded newlines.
- Use preview → validate → commit.
- Audit roster changes.

**Acceptance criteria**
- [ ] Anonymous and Student commit attempts denied.
- [ ] Unauthorized Coordinator denied.
- [ ] Faculty cannot import into another Faculty's cohort.
- [ ] Malformed rows return row-level errors.
- [ ] No silent partial import.
- [ ] Duplicate rows are detected.
- [ ] Audit captures actor, cohort, counts, and change summary.

### TWM-014 — Harden cron finalization entrypoint
**Priority:** P0 | **Owner:** Antirasti | **Estimate:** 0.5–1 day

**Current audit reference:** `src/app/api/cron/boundary-finalize/route.ts`

**Instructions**
- Fail closed if production scheduler secret is missing or invalid.
- Require explicit competition period and boundary.
- Remove default week/year and implicit current-time boundary.
- Make repeated invocation idempotent.
- Keep policy logic in a domain service, not route handler.

**Acceptance criteria**
- [ ] Missing production secret performs no work.
- [ ] Invalid secret denied.
- [ ] Missing/invalid period or boundary rejected.
- [ ] Duplicate invocation creates no duplicate finalization or awards.
- [ ] Premature invocation cannot finalize a period.

### TWM-020 — Remove client-authored telemetry writes
**Priority:** P0 | **Owner:** Antirasti | **Estimate:** 1 day

**Current audit reference:** `src/app/api/telemetry/sync/route.ts`

**Objective:** convert the endpoint into a sync command, not a metric-ingestion API.

**Instructions**
- Derive student identity from actor context.
- Accept only a sync request and permitted user-selected options.
- Do not accept client `metricValue`, raw provider payload, authoritative provider username, or another student's ID.
- Create a server-owned sync job.
- Only trusted provider adapters/workers can persist telemetry.

**Acceptance criteria**
- [ ] Client cannot write arbitrary metric values.
- [ ] Client cannot sync on behalf of another student.
- [ ] Browser cannot call internal ingestion service.
- [ ] Sync command is authenticated, authorized, and rate-limited.
- [ ] Job status is visible without exposing secrets.

### TWM-021 — Canonical telemetry envelope and validation
**Priority:** P0/P1 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Objective:** standardize evidence and preserve provenance.

**Required envelope fields**
- provider and immutable external account ID;
- source event ID or deterministic deduplication key;
- source timestamp and retrieval timestamp;
- observation mode (event, snapshot, aggregate);
- coverage start/end and coverage status;
- payload/schema version;
- validation and eligibility state.

**Instructions**
- Separate raw source evidence from normalized metrics.
- Deduplicate before score aggregation.
- Preserve partial/unknown coverage.
- Never infer exact event dates from snapshot deltas.
- Do not label provider-native date buckets as IST unless source semantics prove it.

**Acceptance criteria**
- [ ] Duplicate evidence does not double-count.
- [ ] Missing source timestamp remains unknown.
- [ ] Partial pagination marks partial coverage.
- [ ] Provider outage is not zero activity.
- [ ] Every score-eligible observation has provenance and validation.
- [ ] Coverage is calculated from evidence, never hardcoded.

### TWM-022 — Secure GitHub OAuth ownership binding
**Priority:** P0/P1 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Current audit references:** GitHub OAuth route and callback.

**Instructions**
- Separate institutional TWM authentication from GitHub provider connection.
- Bind OAuth state/callback to the initiating TWM session.
- Validate state and use PKCE where supported.
- Verify immutable GitHub account ID.
- Never use caller-supplied email as verified attribution.
- Decide token discard versus encrypted retention only after documenting exact API requirements and owner approval.

**Acceptance criteria**
- [ ] State mismatch/replay rejected.
- [ ] Callback cannot attach account to another TWM user.
- [ ] Username change does not alter immutable provider identity.
- [ ] Email supplied by client cannot affect attribution.
- [ ] Token scopes and retention documented and approved.

### TWM-023 — GitHub adapter with honest coverage
**Priority:** P1 | **Owner:** Antirasti | **Estimate:** 2–3 days

**Instructions**
- Implement provider adapter behind a stable contract.
- Document endpoints, scopes, pagination, rate limits, history limits, attribution semantics, and timestamp semantics.
- Fetch only approved public activity.
- Do not claim complete history from a bounded events endpoint.
- Persist retrieval metadata and provider errors.
- Keep sync independent of dashboard page loads.

**Acceptance criteria**
- [ ] Adapter contract tests pass.
- [ ] Pagination and rate-limit behavior tested.
- [ ] Deduplication tested.
- [ ] Partial history is labelled partial.
- [ ] Provider failure leaves previous evidence intact and marks data stale/unavailable.
- [ ] No private repository content is ingested.

### TWM-024 — Disable unapproved provider collection
**Priority:** P1 | **Owner:** Antirasti | **Estimate:** 0.5 day

**Instructions**
- Disable LeetCode and HackerRank production collection by default.
- Profile existence must not imply account ownership verification.
- HMAC challenge unknown, expired, consumed, or replayed nonce must fail closed.
- Keep Codeforces out of scope unless Product Owner approves.

**Acceptance criteria**
- [ ] LeetCode production adapter cannot run without approved permission gate.
- [ ] HackerRank production adapter cannot run without approved permission gate.
- [ ] UI clearly distinguishes unavailable/unverified from verified.
- [ ] No scraping or anti-bot bypass is introduced.

### TWM-030 — Inventory schema and plan PostgreSQL migration
**Priority:** P1 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Instructions**
- Inventory all SQLite tables, indexes, constraints, queries, transactions, and seed logic.
- Map existing records to target entities.
- Identify data that can be discarded versus must be preserved.
- Reconcile retention proposals before expiry jobs.
- Propose migration tool/query layer based on repository fit; do not assume an ORM.
- Document migration, rollback/forward recovery, and backup restore plan.

**Acceptance criteria**
- [ ] Schema inventory complete.
- [ ] Source-to-target mapping complete.
- [ ] Data-loss risks documented.
- [ ] Retention conflict surfaced for owner decision.
- [ ] Migration plan reviewed before implementation.

### TWM-031 — Implement approved PostgreSQL migrations
**Priority:** P1 | **Owner:** Antirasti | **Estimate:** 2–4 days

**Blocked by:** approved schema, data mapping, and migration strategy.

**Acceptance criteria**
- [ ] Empty database migration succeeds.
- [ ] Representative legacy fixture migrates correctly.
- [ ] Constraints prevent duplicate provider accounts/events.
- [ ] Production initialization never seeds demo users.
- [ ] Rollback or forward-recovery is tested.
- [ ] Backup restore reproduces expected records.

### TWM-032 — Durable jobs and transactional limits
**Priority:** P1 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Instructions**
- Implement durable sync jobs, attempts, leases, bounded retries, and idempotency.
- Enforce DEC-02 manual sync limit server-side: one manual sync per student per 15 minutes.
- Enforce maximum two open sync disputes per student per competition week transactionally.
- Add per-provider and per-user concurrency controls.
- Do not add Redis unless measured requirements justify it.

**Acceptance criteria**
- [ ] Job survives process restart.
- [ ] Duplicate job request is idempotent.
- [ ] Retry exhaustion is visible and recoverable.
- [ ] Concurrent requests cannot bypass rate limits.
- [ ] Stuck jobs are detectable.

### TWM-033 — Consent and audit foundations
**Priority:** P1 | **Owner:** Antirasti | **Estimate:** 1–2 days

**Instructions**
- Separate provider connection consent from peer leaderboard visibility.
- Record consent type, policy version, timestamp, actor, and withdrawal.
- Record security-sensitive actions and administrative decisions.
- Avoid logging tokens, OTPs, or unnecessary personal data.
- Implement only owner-approved retention behavior.

**Acceptance criteria**
- [ ] Consent change is persisted and auditable.
- [ ] Opt-out removes user from peer-facing views.
- [ ] Opted-out verified sync still counts toward DEC-06 quorum.
- [ ] Audit events cannot be edited through normal application paths.
- [ ] No expiry job runs against an unapproved retention schedule.

### TWM-040 — Quorum and finalization state machine
**Priority:** P1 — **BLOCKED by Product Owner policy decisions**

**Do not implement scoring or award behavior until these are resolved:** Common versus independent leaderboards; consistency formula; raw point conversions; missing-provider treatment; per-student versus cohort holds; zero-score podium; exam/holiday weeks; rounding/ties; retention and policy version.

**Acceptance criteria after policy approval**
- [ ] Versioned scoring policy is stored.
- [ ] Verified synced opted-out students count toward quorum.
- [ ] Unverified handles and failed syncs do not count.
- [ ] Verified zero activity is distinct from missing data.
- [ ] Stuck compulsory-provider jobs and unresolved disputes follow approved gate rules.
- [ ] Finalization is idempotent and auditable.
- [ ] Ranking tie behavior is deterministic.
- [ ] Historical finalization is immutable; corrections create superseding records.

### TWM-050 — Role-specific pilot workspaces
**Priority:** P2 | **Owner:** Antirasti | **Estimate:** 3–5 days

**Student minimum**
- Dashboard, GitHub connection, sync status, activity/provenance, privacy, disputes, settings.

**Faculty minimum**
- Assigned cohort, roster review/import, student activity, dispute decisions, reports.

**Coordinator minimum**
- Granted cohort scope, permitted activity view, triage, grant expiry/revocation state.

**Platform Admin minimum**
- Institution setup, Faculty/cohort ownership, security/policy configuration, audit.

**Acceptance criteria**
- [ ] Every role sees only authorized data.
- [ ] UI state distinguishes verified, stale, partial, unavailable, restricted, and empty.
- [ ] Opted-out users are absent from peer-facing views.
- [ ] No fixture or hardcoded audit data is presented as live data.
- [ ] Keyboard and responsive behavior are tested.

### TWM-060 — Security, E2E, accessibility and restore validation
**Priority:** P0/P1 | **Owner:** Antirasti + independent reviewer

**Required checks**
- Authentication, IDOR, privilege escalation, CSRF, OAuth state/replay.
- Session expiry/revocation and durable rate-limit bypass.
- Provider attribution, pagination, deduplication, partial coverage.
- Consent, audit, export/deletion according to approved policy.
- Build, typecheck, lint, unit, integration, and E2E.
- Accessibility and keyboard navigation.
- Backup restore and staging rehearsal.

**Acceptance criteria**
- [ ] All P0 findings closed.
- [ ] No unresolved critical/high security issue.
- [ ] Pilot-critical tests pass with recorded output.
- [ ] Restore rehearsal succeeds.
- [ ] Independent review evidence attached.

### TWM-070 — Pilot runbook and release candidate
**Priority:** P0 | **Owner:** Product Owner + Antirasti

**Deliverables**
- Release candidate commit SHA.
- Environment/configuration checklist.
- Pilot cohort and roster verification.
- Student onboarding rehearsal.
- OTP/email test evidence.
- Support and incident triage runbook.
- Provider outage procedure.
- Rollback plan and data lifecycle statement.
- Signed go/no-go decision.

**Acceptance criteria**
- [ ] Product Owner explicitly approves.
- [ ] No unapproved provider or leaderboard feature is enabled.
- [ ] Rollback is rehearsed or operationally validated.
- [ ] Support owner and escalation path are known.
- [ ] Release candidate matches reviewed source.

---

## 4. Policy blockers — do not let implementation guess

| Decision | Required before |
|---|---|
| Weekly Common/Semester Common vs independent provider boards | TWM-040 |
| Consistency formula | TWM-040 |
| Raw GitHub/LeetCode point conversions | TWM-040 |
| Missing provider/partial onboarding treatment | TWM-040 |
| Per-student vs cohort-wide hold | TWM-040 |
| Zero-score podium and exam-week behavior | TWM-040 |
| Tie and rounding policy | TWM-040 |
| Retention schedule | TWM-031 expiry design / TWM-033 |
| GitHub token discard vs encrypted retention | TWM-022 |
| LeetCode production permission/fallback | TWM-024 / onboarding |
| Session lifetime and revocation | TWM-010 |
| Faculty-only vs earlier DEC-04 decision authority | TWM-012 |

Antirasti may prepare decision options and impact analysis. It must not silently select one.

## 5. Definition of complete for every task

A task is complete only when all are present:
1. Commit SHA and changed-file list.
2. Short description of behavior changed.
3. Acceptance tests added/updated.
4. Exact commands run and pass/fail output.
5. Security and data-integrity notes.
6. Migration/rollback notes where relevant.
7. Known limitations and deferred items.
8. Product Owner review for policy-sensitive work.

## 6. First instruction to Antirasti

Start with **TWM-000 only**. Return the repository delta audit and updated P0 findings. Do not start implementation until the current baseline is confirmed and the Product Owner authorizes the first code-change task.

**Final status:** Ready to hand to Antirasti as an implementation task specification. Not permission to change code or production systems.
