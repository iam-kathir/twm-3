# TWM V3.1 — Module Traceability Matrix

**Version:** 1.0  
**Date:** 14 November 2026  
**Audited Baseline SHA:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Status:** READ-ONLY ARCHITECTURAL TRACEABILITY  

---

## 1. Classification Vocabulary

- **Implemented and Aligned:** Component exists, functions correctly, and satisfies all approved V3.1 invariants.
- **Partially Implemented:** Functional logic exists but lacks edge-case handling, full integration, or secondary validations.
- **Implemented but Inconsistent with V3.1:** Code exists but directly violates an approved V3.1 security, data integrity, or governance rule.
- **Missing:** Required capability is completely absent from the codebase.
- **Blocked by Unresolved Decision:** Cannot be implemented without a formal Product Owner policy decision (e.g., PO-01..PO-16).
- **Blocked by Provider Feasibility:** Cannot be implemented due to third-party provider access restrictions or missing written authorization.

---

## 2. Comprehensive Module Traceability Matrix

| Module ID | Domain & Feature | V3.1 Invariant Ref | Current Repository Paths | Classification | Concrete Evidence & Code References | Remediation Target / Architectural Action |
|---|---|---|---|---|---|---|
| **MOD-01** | Public Landing & Visual Universe | UX-01, §2.1 | `src/components/landing/*`, `src/app/globals.css` | **Implemented and Aligned** | GPU-accelerated orbital rotation, responsive CSS clamping, dark obsidian tokens (`#07090E`). Verified in `test-orbital-engine.mjs`. | Maintain visual stability; preserve backwards compatibility. |
| **MOD-02** | Institutional Email Allowlist | ID-01, §6.1 | `src/lib/otp.ts:60-95` | **Implemented and Aligned** | Normalizes and validates institutional domains (`@cit.edu.in`, `@vitstudent.ac.in`). Rejects arbitrary domains. | Add configurable institutional domain table during PostgreSQL migration. |
| **MOD-03** | Email OTP Cryptography & Challenge Pipeline | ID-02, DEC-01, §17.4 | `src/lib/otp.ts:25-240`, `src/lib/db.ts:134-149` | **Implemented and Aligned** | 6-digit numeric OTP, HMAC-SHA256 hash with unique salt, 10m TTL, timing-safe equality, max 5 attempts, cooldown enforcement. | Connect production SMTP/transactional email provider when verified domain is provisioned. |
| **MOD-04** | Email Delivery Abstraction | ID-03, ARCH-08 | `src/lib/email/provider.ts` | **Partially Implemented** | `EmailProvider` interface cleanly decouples delivery. In-memory queue used for tests/dev. | Implement production SMTP/Resend driver; fail closed if delivery fails. |
| **MOD-05** | Stateless HMAC Session Management | ID-12, ARCH-11 | `src/lib/auth.ts:20-115` | **Partially Implemented** | Tamper-proof `<base64url>.<hmac>` token layout, 7-day TTL, constant-time signature verification. | Transition to server-revocable DB session table with refresh token rotation. |
| **MOD-06** | Server-Side RBAC & Workspaces | GOV-04, ARCH-12 | `src/lib/auth.ts`, `src/context/AppContext.tsx` | **Missing** | `StudentSession` has no `role` field; `roster_members` table has no role column. Roles exist only in React client state. | Create `roles` and `cohort_grants` tables in DB; derive role strictly on server on every request. |
| **MOD-07** | Roster Import & Quorum Baseline | §3.2, §3.3, DEC-06 | `src/app/api/roster/bulk-import/route.ts` | **Implemented but Inconsistent with V3.1** | `isDev` bypasses auth; in production, any student session can modify roster without admin role or cohort scope check. | Containment: fail closed with 403. Post-containment: require Faculty role and cohort ownership. |
| **MOD-08** | GitHub OAuth & Account Verification | PROV-02, ID-04 | `src/app/api/auth/github/*` | **Partially Implemented** | CSRF state check via cookie; binds GitHub login to roster. | Resolve token retention policy (PO-11); handle GitHub username change history. |
| **MOD-09** | LeetCode Unattended Collection | PROV-03, DEC-08 | `src/app/api/telemetry/leetcode/route.ts` | **Blocked by Provider Feasibility / Inconsistent** | Direct scraping of `leetcode.com/graphql` with fake User-Agent; profile lookup sets `isVerified: true`. | Hard-isolate route to return `UNAVAILABLE` and `isVerified: false` pending written provider approval. |
| **MOD-10** | HackerRank Telemetry Isolation | PROV-04, §5.6 | `src/app/api/telemetry/hackerrank/route.ts` | **Implemented but Inconsistent with V3.1** | Direct scraping of HackerRank REST; profile lookup sets `isVerified: true`. | Hard-isolate route to return `UNAVAILABLE`; enforce exclusion from weekly competition. |
| **MOD-11** | HMAC Bio-Challenge Ownership Proof | ID-09, §6.2 | `src/app/api/auth/hmac-challenge/route.ts`, `src/lib/db.ts:482` | **Implemented but Inconsistent with V3.1** | `verifyAndConsumeNonce()` inserts missing nonces and returns `valid: true`; onboarding hardcodes `"aarav_coder"`. | Containment: atomic conditional update; reject missing nonces; disable unverified bio verification flow. |
| **MOD-12** | Telemetry Write Path & Ingestion | §5.7, PROV-08 | `src/app/api/telemetry/sync/route.ts` | **Implemented but Inconsistent with V3.1** | Unauthenticated route accepts client-supplied `studentId`, `metricName`, and numeric `metricValue`. | Containment: fail closed with 403. Require server-owned provider worker ingestion. |
| **MOD-13** | Sunday 23:59:59 IST Hard Boundary | §9.1, §9.7, COMP-01 | `src/lib/baseline.ts:15-85` | **Implemented and Aligned** | Evaluates observations against exact UTC conversion `18:29:59.999Z` (23:59:59 IST) and enforces `boundary_gap <= 3h`. | Verified in `test-foundation.mjs`. Preserve exact boundary evaluation logic. |
| **MOD-14** | LeetCode Baseline Cold-Start | §9.7, §16.3 | `src/lib/baseline.ts:90-145` | **Implemented and Aligned** | Missing baseline returns honest `NO_PRIOR_SUNDAY_BASELINE` with null delta; never fabricated 0. | Verified in `test-foundation.mjs`. Preserve exact baseline comparison engine. |
| **MOD-15** | Deterministic Ranking Engine | §9.6, SCORE-14 | `src/lib/leaderboard.ts:10-75` | **Implemented and Aligned** | Standard competition ranking (1, 2, 2, 4), alphabetical tie secondary sort, rank skipping. | Verified in `test-foundation.mjs`. Preserve ranking determinism. |
| **MOD-16** | Cross-Platform Common Scoring | SCORE-01..08 | `src/lib/finalizer.ts`, `src/lib/leaderboard.ts` | **Blocked by Unresolved Decision (PO-01, PO-03)** | Formulas for Weekly Common (40/40/20) and Semester Common conflict with earlier independent-provider baseline. | Keep Common leaderboard disabled until PO resolves PO-01..PO-04. |
| **MOD-17** | Consistency Metric Engine | SCORE-09, PO-02 | `src/lib/baseline.ts` | **Blocked by Unresolved Decision (PO-02)** | Conflicting definitions between 5-active-days target (`ActiveDays/5`) and eligible-observed-days ratio. | Resolve PO-02 before implementing consistency scoring in finalizer. |
| **MOD-18** | Weekly Boundary Finalization Cron | COMP-02, COMP-06 | `src/app/api/cron/boundary-finalize/route.ts` | **Implemented but Inconsistent with V3.1** | Fails open when `CRON_SECRET` is unset; defaults to hardcoded week 42; lacks dispute and quorum gates. | Containment: strict scheduler auth, Asia/Kolkata boundary gate, dispute gate, idempotency check. |
| **MOD-19** | Dispute Creation & Confidentiality | §10.1, DEC-02 | `src/app/api/disputes/route.ts:9-80` | **Implemented but Inconsistent with V3.1** | `GET` leaks all disputes unauthenticated; `POST` accepts arbitrary client `studentId` without session binding. | Scope `GET` to authenticated student; force `POST` studentId to session; limit to 2 active disputes. |
| **MOD-20** | Dispute Adjudication & Two-Person Review | GOV-06, §10.1 | `src/app/api/disputes/route.ts:85-140` | **Implemented but Inconsistent with V3.1** | Accepts client-supplied `reviewer` body string; ordinary student session can resolve disputes. | Containment: fail closed with 403. Require authoritative Faculty role and cohort scope post-containment. |
| **MOD-21** | Student Privacy & Opt-In Filtering | PRIV-01, GOV-03 | `src/app/privacy/page.tsx`, `src/app/api/leaderboard` | **Partially Implemented** | UI toggle exists in local storage / client state, but server API returns all students without opt-in filtering. | Enforce server-side opt-in filtering on all public leaderboard endpoints. |
| **MOD-22** | Faculty Workspace | GOV-04, UX-02 | `src/app/admin/page.tsx` | **Missing** | No dedicated `/faculty` workspace; faculty actions are mixed into monolithic `/admin` page. | Construct dedicated `/faculty` route group with cohort-specific access controls. |
| **MOD-23** | Coordinator Scoped Grants Workspace | GOV-05, PRIV-04 | None | **Missing** | No coordinator views, time-limited grant ledger, or triage boundaries implemented. | Construct `/coordinator` workspace with time-bounded, non-final triage capabilities. |
| **MOD-24** | Platform Admin Workspace & Neutral Review | GOV-07, GOV-08 | `src/app/admin/page.tsx` | **Partially Implemented** | Monolithic client page without server authorization or self-affecting action firewalls. | Rebuild `/admin` route group with server-side authorization and independent audit logging. |
| **MOD-25** | Database Persistence & Migrations | ARCH-02, ARCH-03 | `src/lib/db.ts` | **Implemented as Prototype (SQLite)** | Uses `node:sqlite` with inline `CREATE TABLE IF NOT EXISTS`; no formal versioned migrations. | Work Package 5: Migrate schema to PostgreSQL with versioned DDL migration scripts. |
| **MOD-26** | Production Demo Data Protection | ARCH-02, §5.7 | `src/lib/db.ts:37, 162-289` | **Implemented but Inconsistent with V3.1** | Startup unconditionally seeds fictional VIT students and sample observations on empty database. | Containment: wrap `seedInitialRosterIfEmpty()` in `NODE_ENV === "production"` guard. |

---

## 3. Traceability Summary

- **Total Functional Modules Assessed:** 26
- **Implemented and Aligned:** 5 (19.2%)
- **Partially Implemented:** 6 (23.1%)
- **Implemented but Inconsistent with V3.1 (Security/Policy Gaps):** 9 (34.6%)
- **Missing (Workspaces / RBAC / Adapter Layer):** 3 (11.5%)
- **Blocked by Unresolved Policy / Provider Feasibility:** 3 (11.5%)

**Finding:** The 9 "Implemented but Inconsistent" modules represent the exact target scope of **TWM-001 (P0 Security Containment)** and **Work Package 1 (Remediation Specification)**. Remediating them via fail-closed containment immediately elevates the system's security posture to a solid, auditable foundation.
