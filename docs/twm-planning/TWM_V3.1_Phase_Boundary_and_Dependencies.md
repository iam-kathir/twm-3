# TWM V3.1 — Phase Boundary and Dependencies Specification

**Document Version:** 1.2 (Final Governance Classification Audit Baseline)  
**Audit Date:** 14 November 2026  
**Audited Repository:** `iam-kathir/twm-3`  
**Branch:** `main` | **HEAD Commit SHA:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Evaluation Scope:** End-to-End Phased Implementation Roadmap (Phases 0 through 6)  
**Status:** READ-ONLY ARCHITECTURAL SPECIFICATION  

---

## 1. Executive Implementation Lifecycle Overview

The implementation lifecycle for TWM V3.1 is structured into seven strictly sequenced, dependency-gated phases. This architecture prevents rework, guarantees that security boundaries precede capability expansion, and prevents premature implementation of policy-blocked features.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 0: P0 Security Containment (Task Pack TWM-001)                                   │
│ • Lock write paths • Fail-closed nonces • Strict cron auth • Isolate LC/HR collection  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ [GATE 0: All negative mutation tests pass]
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Core Authentication & Server-Side RBAC Foundation (Work Package 1)            │
│ • Database-backed sessions • Server role derivation • Admin/Faculty authority binding  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ [GATE 1: Server derives all identities/roles]
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 2: PostgreSQL & Migration Infrastructure (Work Package 5)                         │
│ • PostgreSQL schema • Versioned DDL migrations • Backup/restore drill verification     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ [GATE 2: PostgreSQL migrations pass up/down]
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Canonical Provider Adapters & Telemetry Ingestion (Work Packages 2 & 3)        │
│ • Unified adapter envelope • Server-side GitHub worker • DEC-08 LeetCode compliance    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ [GATE 3: Zero client telemetry writes; PO-01..08]
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Scoring Engine, Quorum & Finalization Closure (WP 4) [POLICY-BLOCKED]         │
│ • Quorum gates • PO-05 Hold policy • Deterministic ranking • Asia/Kolkata boundary     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ [GATE 4: Finalizer produces idempotent snapshots]
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Role-Based Workspaces & Governance (Work Package 6)                           │
│ • /faculty workspace • /coordinator triage cockpit • Platform Admin neutral review    │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │ [GATE 5: Strict workspace route boundaries]
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 6: Reports, Achievements & Production Deployment (Work Package 7)                │
│ • Immutable snapshots • Production SMTP/OTP domain • Railway deployment verification  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase Boundary Definitions & Ingress / Egress Invariants

### 2.1 Phase 0: P0 Security Containment (TWM-001)
- **Objective:** Eliminate critical vulnerabilities and data-integrity risks on the current codebase without altering the database schema or breaking valid read-only views.
- **Ingress Criteria:**
  - Git repository clean on branch `main` at `6cb7c876173796f37e1e427960249089069ef6a5`.
  - All 73 foundation, OTP, orbital, and layout tests passing.
  - Explicit Product Owner authorization to apply Task Pack TWM-001.
- **Egress Criteria (Gate 0 Sign-Off):**
  - All critical exposed endpoints (`/api/telemetry/sync`, `/api/roster/bulk-import`, `PATCH /api/disputes`) return `403 FORBIDDEN`.
  - Unknown/replayed nonces fail closed (`{ valid: false }`).
  - `/api/cron/boundary-finalize` enforces `CRON_SECRET` and rejects calls without explicit period parameters, preventing unsafe or premature finalization.
  - LeetCode and HackerRank routes return honest `UNAVAILABLE` and `isVerified: false`.
  - Production database initialization seeds zero demo rows.
  - Negative persistence test suite (`scripts/test-p0-containment.mjs`) passes 100% (asserting zero mutations on rejected calls).

### 2.2 Phase 1: Core Authentication & Server-Side RBAC Foundation (WP1)
- **Objective:** Establish the authoritative server-side source of truth for identity, sessions, roles, and cohort permissions.
- **Ingress Criteria:**
  - Gate 0 successfully closed.
  - Server-side role and session design approved.
- **Egress Criteria (Gate 1 Sign-Off):**
  - `StudentSession` derives role directly from the server database, never client request body or cookies.
  - Roster management and dispute adjudication require verified Faculty or Admin session capability.
  - Client state role toggles in `AppContext.tsx` completely decoupled from backend route authorization.

### 2.3 Phase 2: PostgreSQL & Migration Infrastructure (WP5)
- **Objective:** Transition persistence from the prototype SQLite file to production-grade PostgreSQL with formal, versioned DDL migrations.
- **Ingress Criteria:**
  - Gate 1 successfully closed.
  - PostgreSQL instance provisioned (Docker for local test; Railway for production).
- **Egress Criteria (Gate 2 Sign-Off):**
  - Versioned migration scripts run cleanly forward and backward (`up` and `down`).
  - Database connection pool configured with transaction runner.
  - Automated database backup and restore drill verified.

### 2.4 Phase 3: Canonical Provider Adapters & Telemetry Ingestion (WP2 & WP3)
- **Objective:** Implement the TWM-owned canonical adapter boundary and secure, server-owned telemetry collection.
- **Ingress Criteria:**
  - Gate 2 successfully closed.
  - Official GitHub application credentials provisioned.
- **Egress Criteria (Gate 3 Sign-Off):**
  - `ProviderTelemetryEnvelope` implemented and strictly validated.
  - Server-side GitHub worker collects observations within rate limits.
  - LeetCode automated collection remains hard-disabled unless DEC-08 requirements are formally approved.
  - HackerRank is restricted to optional portfolio evidence and excluded from competition deltas.

### 2.5 Phase 4: Scoring Engine, Quorum & Finalization Closure (WP4)
- **Objective:** Implement the deterministic competition scoring engine, Sunday 23:59:59 IST boundary reconciler, and finalization state machine.
- **Ingress Criteria:**
  - Gate 3 successfully closed.
  - **CRITICAL POLICY GATE:** Explicit Product Owner approval of decisions **PO-01 through PO-08** (including selection between cohort-wide vs per-student provisional finalization hold policy under PO-05).
- **Egress Criteria (Gate 4 Sign-Off):**
  - Finalizer verifies `≥ 70%` quorum against enrolled class roster.
  - Finalizer checks for zero stuck compulsory-provider jobs.
  - Finalizer enforces Product Owner-approved finalization hold policy (PO-05).
  - Deterministic ranking (`1, 2, 2, 4`) produces identical, idempotent snapshots upon repeated invocation.

### 2.6 Phase 5: Role-Based Workspaces & Governance (WP6)
- **Objective:** Deliver dedicated, secure workspace route groups for each user role.
- **Ingress Criteria:**
  - Gate 1 (RBAC) and Gate 4 (Scoring) successfully closed.
  - Product Owner approval of **PO-09** (Privacy defaults) and **PO-12** (Decision authority matrix).
- **Egress Criteria (Gate 5 Sign-Off):**
  - Monolithic `/admin` split into `/dashboard` (Student), `/coordinator` (Coordinator), `/faculty` (Faculty), and `/admin` (Platform Admin).
  - Coordinator workspace enforces triage-only capability (no final approvals or roster imports).
  - Platform Admin workspace enforces self-affecting action firewall (**PO-13**).
  - Student leaderboard opt-in privacy filter enforced server-side.

### 2.7 Phase 6: Reports, Achievements & Production Deployment (WP7)
- **Objective:** Enable historical performance reports, immutable achievement ledgers, transactional notifications, and production deployment.
- **Ingress Criteria:**
  - Gate 4 and Gate 5 successfully closed.
  - Verified institutional domain (`cit.edu.in`) configured for production SMTP (**PO-16**).
- **Egress Criteria (Gate 6 Sign-Off):**
  - Weekly and semester reports export clean CSV and PDF records.
  - Two-phase achievement and podium award acknowledgement ledger deployed.
  - End-to-end production smoke test passes: onboarding, OTP delivery, GitHub sync, Sunday boundary finalization.

---

## 3. Comprehensive Phased Dependency Matrix

| Phase | Task ID | Work Unit Description | Hard Predecessors | External / Policy Dependencies | Can Run in Parallel With |
|---|---|---|---|---|---|
| **P0** | **TWM-001A** | Baseline Confirmation & Pre-flight | None | None | None |
| **P0** | **TWM-001B** | Telemetry Write-Path Containment | TWM-001A | None | TWM-001C, TWM-001D |
| **P0** | **TWM-001C** | Dispute Confidentiality & Lock | TWM-001A | None | TWM-001B, TWM-001E |
| **P0** | **TWM-001D** | Roster Import Containment | TWM-001A | None | TWM-001B, TWM-001F |
| **P0** | **TWM-001E** | Nonce Fail-Closed Containment | TWM-001A | None | TWM-001C, TWM-001G |
| **P0** | **TWM-001F** | Cron Finalization Containment | TWM-001A | None | TWM-001D, TWM-001H |
| **P0** | **TWM-001G** | Provider Scraping Isolation | TWM-001A | DEC-08 (LC Policy) | TWM-001E, TWM-001H |
| **P0** | **TWM-001H** | Demo Seeding Containment | TWM-001A | None | TWM-001F, TWM-001G |
| **P1** | **TWM-010** | Server Actor & Session Context | Gate 0 | None | TWM-011 design |
| **P1** | **TWM-011** | Server RBAC & Permission Layer | TWM-010 | PO-12 (Authority Matrix) | Session crypto utilities |
| **P2** | **TWM-030** | PostgreSQL Schema Design | TWM-011 | Target PostgreSQL instance | Backup script authoring |
| **P2** | **TWM-031** | Versioned DDL Migrations | TWM-030 | PO Approval of Schema | Migration test harness |
| **P3** | **TWM-020** | Canonical Adapter Envelope | TWM-031 | None | TWM-022 OAuth |
| **P3** | **TWM-021** | Server-Side GitHub Ingestion | TWM-020 | GitHub App Credentials | HackerRank adapter |
| **P4** | **TWM-040** | Competition Finalizer Engine | TWM-021, Gate 2 | **PO-01 through PO-08 Decisions** | Ranking math tests |
| **P5** | **TWM-050** | Role Workspaces Split | TWM-011, TWM-040| **PO-09, PO-12, PO-13 Decisions** | Faculty & Coord UI |
| **P6** | **TWM-060** | Reports & Achievements Ledger | TWM-040, TWM-050| None | Export generator |
| **P6** | **TWM-070** | Production Deployment & Pilot | TWM-060 | **Verified Domain / SMTP (PO-16)** | Runbook documentation |

---

## 4. Policy & External Blocker Ledger (5-Way Classification)

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                              GOVERNANCE BLOCKER LEDGER                                                 │
├──────────────┬──────────────────────────────┬──────────────────────────────────────────┬───────────────────────────────┤
│ Blocker ID   │ Impacted Implementation      │ Multi-Dimensional Classification         │ Resolution Requirement        │
├──────────────┼──────────────────────────────┼──────────────────────────────────────────┼───────────────────────────────┤
│ **PO-01**    │ Phase 4 Competition Model    │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Model          │
│ **PO-02**    │ Phase 4 Consistency Metric   │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Formula        │
│ **PO-03**    │ Phase 4 Point Conversions    │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Points         │
│ **PO-04**    │ Phase 4 Missing Provider     │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Missing Provider│
│ **PO-05**    │ Phase 4 Finalization Holds   │ Awaiting PO Approval (Proposed / Pilot)  │ PO Decision on Hold Policy    │
│ **PO-06**    │ Phase 4 Zero-Score Podium    │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Zero Podium    │
│ **PO-07**    │ Phase 4 Exam/Holiday Policy  │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Calendar Breaks│
│ **PO-08**    │ Phase 4 Rounding & Precision │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Rounding       │
│ **PO-09**    │ Phase 5 Privacy Defaults     │ Approved (GOV-03) / Awaiting PO Approval │ Confirm UI Defaults & Views   │
│ **PO-10**    │ Phase 6 Retention Schedule   │ Awaiting PO Approval (Pilot Constraint)  │ PO Decision on Purge Schedule │
│ **PO-11**    │ Phase 3 GitHub Token Policy  │ Awaiting PO Approval (Proposed Rec)      │ Confirm Token Storage Policy  │
│ **PO-12**    │ Phase 1/5 Authority Matrix   │ Approved (GOV-06) / Awaiting PO Approval │ Confirm Action Matrix         │
│ **PO-13**    │ Phase 5 Admin Self-Review    │ Approved (GOV-08) / Awaiting PO (Pilot)  │ Confirm Neutral Review Policy │
│ **PO-14**    │ Phase 1 Session Lifetime     │ Awaiting PO Approval (Proposed Rec)      │ Confirm Session Duration      │
│ **PO-15**    │ Phase 3 LeetCode Fallback    │ Locked (DEC-08) / Blocked External / PO  │ Official API or Approved Fallback│
│ **PO-16**    │ Phase 6 Production Email     │ Locked (DEC-01) / Blocked External / PO  │ CIT Sending Domain & Relay    │
└──────────────┴──────────────────────────────┴──────────────────────────────────────────┴───────────────────────────────┘
```

---

## 5. Phase-by-Phase Verification & Rollback Protocols

### 5.1 Verification Protocol (Executed at Every Gate)
Every phase transition requires clean execution and logging of the five mandatory verification gates:
```powershell
npx tsc --noEmit                                  # Must exit 0 with zero errors
npm run lint                                      # Must exit 0 with zero warnings/errors
npm test                                          # Must pass all registered test suites
npx next build                                    # Must produce a valid production build
git status --short                                # Working tree must be 100% clean
```

### 5.2 Dedicated Negative Mutation Test Protocol
For Phase 0 containment, `scripts/test-p0-containment.mjs` must be executed against an isolated SQLite test database:
```powershell
node --test scripts/test-p0-containment.mjs
```
The test suite asserts that every blocked, unauthenticated, or malformed request returns an explicit `401` or `403` status code, and leaves the database tables in their exact pre-test state (`changes === 0`).

### 5.3 Rollback Strategy
1. **Isolated Commits:** Every task must be committed as an independent, atomic commit.
2. **Clean Revertibility:** If any patch causes regression, `git revert <commit_sha>` must be executed immediately without affecting other tasks.
3. **Zero Schema Migrations in Phase 0:** Containment does not touch database schemas, ensuring that code reversions are 100% risk-free from data corruption.

---

## 6. Phase Roadmap Sign-Off

The phased implementation boundaries and dependency chains are fully specified, verified, and established as the governing implementation roadmap for TWM V3.1.
