# TWM V3.1 — Architecture Alignment Report

**Document Version:** 1.0  
**Audit Date:** 14 November 2026  
**Audited Repository:** `iam-kathir/twm-3`  
**Branch:** `main` | **HEAD Commit SHA:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Evaluation Target:** Approved TWM V3.1 Specifications & Master Planning Baseline  
**Operating Mode:** STRICTLY READ-ONLY ASSESSMENT  

---

## 1. Executive Summary & Repository Verdict

A comprehensive architectural alignment review of the `iam-kathir/twm-3` repository was conducted against the latest approved TWM V3.1 specifications, governance decisions, and remediation blueprints in `docs/twm-planning/`.

### 1.1 Architectural Verdict: `HOLD — ARCHITECTURALLY VIABLE WITH CRITICAL TRUST GAPS`
The existing repository provides a strong, high-quality presentation layer (Next.js 14 App Router, Tailwind CSS with Obsidian design tokens, Framer Motion, accessible component primitives) and sound cryptographic utilities for institutional email OTP (`src/lib/otp.ts`). However, **the application layer currently exhibits fundamental architectural misalignments and security vulnerabilities when measured against approved TWM V3.1 invariants**:

1. **Inverted Server Trust Boundaries (P0 Exposure):**
   - Telemetry sync (`/api/telemetry/sync`) allows unauthenticated clients to inject arbitrary metric names, values, and student identities directly into the persistence layer.
   - Dispute management (`/api/disputes`) leaks student records publicly and allows ordinary authenticated students to resolve disputes with forged reviewer names.
   - Nonce validation (`verifyAndConsumeNonce` in `src/lib/db.ts`) accepts unknown nonces as valid and inserts them into the database.
   - Boundary finalization (`/api/cron/boundary-finalize`) fails open when `CRON_SECRET` is unset and defaults to a hardcoded week 42 at execution-time.
2. **Missing Authoritative Role Model:**
   - Server-side sessions (`StudentSession` in `src/lib/auth.ts`) and database tables (`roster_members` in `src/lib/db.ts`) possess **zero role fields or administrative grant tables**. Roles exist only in client-side React state (`src/context/AppContext.tsx`).
   - The planned four independent workspaces (Student, Coordinator, Faculty, Platform Admin) are collapsed into a single monolithic `/admin` dashboard lacking server-side RBAC.
3. **Provider Feasibility & Compliance Disconnect (DEC-08):**
   - LeetCode and HackerRank collection routes (`src/app/api/telemetry/leetcode/route.ts`, `hackerrank/route.ts`) perform unsanctioned public endpoint scraping with spoofed headers. Profile lookup presence is incorrectly conflated with verified identity (`isVerified: true`).
   - No written provider permission exists for unattended automated production collection.
4. **Prototype Persistence Architecture:**
   - The repository operates on a single local SQLite database (`data/twm.sqlite`) with inline DDL initialization and ad-hoc schema patching. It lacks PostgreSQL, migration versioning, and durable background job execution.

### 1.2 Preservation Value
Rebuilding from scratch is unnecessary and counterproductive. The visual system, client components, deterministic ranking utilities (`computeCompetitionRanks` in `src/lib/leaderboard.ts`), boundary gap calculators (`src/lib/baseline.ts`), and OTP cryptographic primitives (`src/lib/otp.ts`) are modular and directly reusable.

---

## 2. Repository Baseline State

- **Branch:** `main` (synchronized with `origin/main`).
- **HEAD Commit SHA:** `6cb7c876173796f37e1e427960249089069ef6a5` (`fix(security): enforce session checks on roster import, dispute resolution, and simulation`).
- **Working Tree:**
  - Tracked Files: **100% clean** (0 modified, 0 staged, 0 deleted).
  - Untracked Files: `docs/twm-planning/` planning directory.
- **Verification Gates Status:**
  - `npx tsc --noEmit`: 0 errors.
  - `npm run lint`: 0 errors / 0 warnings.
  - `npm test`: 73/73 tests passing across foundation, OTP, orbital, and layout suites.

---

## 3. Comprehensive Structural Review Across 24 V3.1 Functional Domains

### 3.1 Product Vision and Scope
- **Approved V3.1 Rule:** Class-focused developer activity, analytics, and friendly competition. TWM is **not** an academic ERP, homework submission portal, online coding judge, or code execution engine. Core TWM must function with AI disabled.
- **Repository Status:** **Implemented and Aligned**.
- **Evidence:** The application strictly focuses on telemetry tracking, leaderboard presentation, and activity metrics. No online judge, compiler, or AI scoring dependencies exist in `package.json` or `src/`.

### 3.2 Student Onboarding and Authentication
- **Approved V3.1 Rule:** Institutional email allowlist (`@cit.edu.in` / approved college domains), 6-digit cryptographic HMAC-SHA256 OTP, 10-minute TTL, single-use, 60-second cooldown, max 5 attempts (DEC-01, DEC-02).
- **Repository Status:** **Partially Implemented & Mostly Aligned**.
- **Evidence:** `src/lib/otp.ts` implements secure OTP generation, HMAC hashing, domain normalization (`@cit.edu.in`, `@vitstudent.ac.in`), attempt tracking, and timing-safe comparisons.
- **Gaps:** Production transactional email delivery is mocked (`src/lib/email/provider.ts`); domain verification and SMTP configuration are deferred.

### 3.3 GitHub OAuth and Account Ownership Verification
- **Approved V3.1 Rule:** GitHub OAuth initiates state/nonce validation, matches verified GitHub login against class roster, and proves account ownership.
- **Repository Status:** **Partially Implemented**.
- **Evidence:** `src/app/api/auth/github/route.ts` and `src/app/api/auth/github/callback/route.ts` implement OAuth redirect with CSRF cookie verification (`twm_oauth_csrf`) and roster username matching.
- **Gaps:** Token handling policy (retaining minimal encrypted token vs discarding after proof) remains unresolved (PO-11). Roster lookup assumes exact case match without handling GitHub handle renames or historical audit tracking.

### 3.4 LeetCode and HackerRank Integration Constraints
- **Approved V3.1 Rule:** Unattended automated collection requires written provider permission or official API access. Profile presence must never be conflated with ownership verification (DEC-08). HackerRank is optional and excluded from Weekly Common scoring (§5.6).
- **Repository Status:** **Implemented but Inconsistent with V3.1**.
- **Evidence:** `src/app/api/telemetry/leetcode/route.ts` and `src/app/api/telemetry/hackerrank/route.ts` execute direct web queries against public endpoints with browser User-Agents. Merely finding a profile sets `isVerified: true` and `status: "SNAPSHOT_VERIFIED"`.
- **Gaps:** Violates DEC-08 and scraping prohibitions. Must be hard-isolated to honest unavailable states until official permissions are established.

### 3.5 Provider Adapter Architecture
- **Approved V3.1 Rule:** Canonical provider adapter boundary with standardized envelope (`provider`, `externalAccountId`, `metric`, `observedAt`, `boundaryGapSeconds`, `coveragePass`, `provenance`, `capabilityState`).
- **Repository Status:** **Missing / Implementation Gap**.
- **Evidence:** Telemetry routes handle raw JSON formats independently without passing through a unified provider adapter interface. Data shapes are directly coupled to UI components.

### 3.6 Telemetry Ingestion and Verification
- **Approved V3.1 Rule:** Telemetry observations must be collected exclusively via authorized server-side workers. Untrusted clients must never author or inject scores (§5.7).
- **Repository Status:** **Critically Inconsistent / Open Vulnerability**.
- **Evidence:** `src/app/api/telemetry/sync/route.ts` accepts client-supplied `studentId`, `metricName`, and numeric `metricValue`, writing directly to `telemetry_observations`.

### 3.7 Activity Normalization and Provenance
- **Approved V3.1 Rule:** Raw event payloads preserved; UTC storage; Asia/Kolkata presentation; boundary freshness gap recorded.
- **Repository Status:** **Partially Implemented**.
- **Evidence:** `telemetry_observations` table stores `observed_at`, `scheduled_boundary_at`, `boundary_gap_seconds`, and `raw_payload`. `src/lib/baseline.ts` correctly evaluates observation freshness against Sunday 23:59:59 IST.

### 3.8 Scoring Engine
- **Approved V3.1 Rule:** Platform-specific metrics are authoritative; unlike measurements are not summed without approved weights; missing data is never converted to 0.
- **Repository Status:** **Blocked by Unresolved Product Decisions (PO-01, PO-03)**.
- **Evidence:** `src/lib/leaderboard.ts` and `src/lib/finalizer.ts` maintain independent GitHub and LeetCode tracks. Proposed Weekly Common formulas (GitHub 40%, LeetCode 40%, Consistency 20%) conflict with earlier independent-only rules and remain unapproved.

### 3.9 Weekly and Semester Competitions
- **Approved V3.1 Rule:** Monday 00:00:00 IST to Sunday 23:59:59 IST. Observations must satisfy `boundary_gap <= 3h`.
- **Repository Status:** **Implemented and Aligned in Domain Logic**.
- **Evidence:** `src/lib/baseline.ts` (`getCurrentSundayClosingBoundaryIST`, `evaluateObservationBoundaryEligibility`) correctly computes UTC reference `18:29:59.999Z` (23:59:59 IST) and enforces the 3-hour freshness window.

### 3.10 Common Leaderboard and Provider-Specific Metrics
- **Approved V3.1 Rule:** If Common leaderboard is enabled, requires verified compulsory providers; missing provider renders aggregate score unavailable, never 0.
- **Repository Status:** **Partially Implemented**.
- **Evidence:** Independent leaderboards return honest `NO_PRIOR_SUNDAY_BASELINE` with null deltas. UI handles null deltas without crashing.

### 3.11 Consistency and Data-Quality Calculations
- **Approved V3.1 Rule:** Consistency measures active participation across eligible days. Retrieval coverage (≥90% date-level retrieval) is data quality, not activity.
- **Repository Status:** **Blocked by Unresolved Decision (PO-02)**.
- **Evidence:** Repository contains conflicting definitions between 5-active-days ratio (`ActiveDays / 5`) and eligible-observed-days ratio.

### 3.12 Quorum and Finalization Workflow
- **Approved V3.1 Rule:** Quorum denominator is authoritative enrolled roster; threshold ≥70% (DEC-06). Quorum measures telemetry coverage, not coding activity. Finalization held on open score disputes.
- **Repository Status:** **Partially Implemented & Open to Bypass**.
- **Evidence:** `src/lib/db.ts` (`getRosterQuorumStats`) calculates quorum percentage against total roster. However, `/api/cron/boundary-finalize` fails open when `CRON_SECRET` is unset, ignores active disputes, and defaults to week 42.

### 3.13 Achievements and Podium Awards
- **Approved V3.1 Rule:** Weekly Top 3 on Common leaderboard; two-phase award acknowledgement; awards minted only after boundary finalization.
- **Repository Status:** **Partially Implemented in Client State**.
- **Evidence:** Podium and badge components exist in UI (`src/components/dashboard/WeeklyPodium.tsx`), but award persistence and immutable ledger are not implemented in the backend.

### 3.14 Student Privacy and Leaderboard Opt-In
- **Approved V3.1 Rule:** Leaderboard participation is opt-in (GOV-03). Opted-out students count toward telemetry quorum but are strictly excluded from peer rankings.
- **Repository Status:** **Partially Implemented in Client Logic**.
- **Evidence:** `src/app/privacy/page.tsx` provides toggle controls; however, server-side filtering on `/api/leaderboard` is missing—all roster members are returned to clients.

### 3.15 Faculty Workspace
- **Approved V3.1 Rule:** Cohort-scoped management, roster correction review, dispute resolution, audit review.
- **Repository Status:** **Missing Server-Side Boundary**.
- **Evidence:** No `/faculty` route group exists. Faculty controls are bundled into `/admin` without cohort scoping or backend permission checks.

### 3.16 Coordinator Workspace and Scoped Permissions
- **Approved V3.1 Rule:** Student coordinators have scoped, time-bounded, revocable grants; triage and recommendation only; no final approval or roster import (GOV-05, GOV-06).
- **Repository Status:** **Missing**.
- **Evidence:** No `/coordinator` route group or grant tables exist.

### 3.17 Platform Admin Workspace
- **Approved V3.1 Rule:** Institutional operator; manages system exceptions, cron status, and audit logs. Self-affecting actions require neutral review (GOV-07, GOV-08).
- **Repository Status:** **Partially Implemented as Monolith**.
- **Evidence:** `src/app/admin/page.tsx` exists as a large combined client dashboard, but lacks server authorization.

### 3.18 Disputes and Manual Sync Workflows
- **Approved V3.1 Rule:** Maximum 2 open sync disputes per student per week (DEC-02). Faculty-only resolution.
- **Repository Status:** **Critically Inconsistent / Vulnerable**.
- **Evidence:** `/api/disputes` exposes all dispute records unauthenticated on `GET`, accepts arbitrary `studentId` on `POST`, and allows any student to resolve disputes on `PATCH`.

### 3.19 Reports and Historical Records
- **Approved V3.1 Rule:** Historical weekly standings are immutable; corrections create audited superseding snapshots.
- **Repository Status:** **Partially Implemented**.
- **Evidence:** `weekly_standings` table records finalized snapshots, but superseding snapshot lineage is missing.

### 3.20 Notifications and Email OTP
- **Approved V3.1 Rule:** Transactional email delivery; resend cooldown; no console OTP logging in production (DEC-01).
- **Repository Status:** **Implemented in Mock Mode**.
- **Evidence:** `src/lib/email/provider.ts` provides clean provider abstraction (`EmailProvider`). In development/test, it routes to an in-memory queue. Production SMTP configuration remains to be provisioned.

### 3.21 Security, Audit Logging, and Retention
- **Approved V3.1 Rule:** Server derives all identities; audit log immutable; retention schedules enforced (PO-10).
- **Repository Status:** **Partially Implemented**.
- **Evidence:** `src/app/admin/page.tsx` renders audit logs, but log entries are stored in client state rather than a server audit table.

### 3.22 Background Jobs and Synchronization
- **Approved V3.1 Rule:** Durable job execution, idempotency, lease locks, provider-specific rate limit respect.
- **Repository Status:** **Partially Implemented as Standalone Scripts**.
- **Evidence:** `scripts/boundary-scheduler.mjs` runs as a continuous Node.js daemon. However, there is no transactional in-database queue.

### 3.23 Database and Deployment Architecture
- **Approved V3.1 Rule:** PostgreSQL production target with formal schema migrations; independent web/worker services.
- **Repository Status:** **Implemented as Prototype (SQLite)**.
- **Evidence:** Uses `node:sqlite` with inline DDL. Migration to PostgreSQL is a planned requirement (Work Package 5).

### 3.24 UI/UX Requirements
- **Approved V3.1 Rule:** Obsidian dark theme (`#07090E`), Electric Blue functional accents, Violet brand identity, Cyan telemetry, responsive, accessible, reduced motion support.
- **Repository Status:** **Implemented and Aligned**.
- **Evidence:** `src/app/globals.css`, `tailwind.config.js`, and component suites adhere strictly to approved color tokens, contrast ratios, and layout invariants.

---

## 4. TWM-001 Compatibility Review

The proposed TWM-001 P0 Security Containment plan was evaluated against the full V3.1 architecture.

### 4.1 Compatibility Findings
- **Zero Architectural Conflict:** Containment tasks (TWM-001B through TWM-001H) do **not** conflict with long-term V3.1 architecture. They enforce fail-closed boundaries on exposed write paths.
- **Fail-Closed Bridge Necessity:** Because authoritative server-side role models and grant tables do not yet exist, mutation endpoints (`POST /api/roster/bulk-import` and `PATCH /api/disputes`) must return `403 FORBIDDEN` for all actors during containment. This prevents privilege escalation while awaiting the full RBAC schema.
- **Provider Disconnect Safety:** Hard-disabling LeetCode and HackerRank collection in production strictly fulfills DEC-08 and eliminates scraping risks without breaking personal dashboard reads.
- **Scheduler Boundary Integrity:** Enforcing strict `CRON_SECRET` authentication on `/api/cron/boundary-finalize` protects competition finalization without interfering with future manual faculty controls.

---

## 5. Strategic Recommendation & Authorization Checkpoint

### 5.1 Recommendation: `READY FOR TWM-001 IMPLEMENTATION`
The repository is **fully prepared and verified** to begin Task Pack **TWM-001 (P0 Security Containment)**. The proposed patches are minimal, fail-closed, atomic, and testable against isolated temporary databases.

### 5.2 Prerequisites Checklist
- [x] Baseline git status clean on branch `main` (`6cb7c87`).
- [x] All 73 foundation, layout, and OTP tests passing.
- [x] Authoritative database schema verified against `src/lib/db.ts`.
- [x] Fail-closed role strategy confirmed (no reliance on unverified `session.role`).
- [x] Strict scheduler-only authentication decoupled from UI finalization.
- [x] Negative persistence mutation test suite designed.

**Awaiting explicit Product Owner authorization to begin implementation.**
