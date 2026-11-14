# TWM V3.1 — Implementation Dependency Roadmap

**Version:** 1.0  
**Date:** 14 November 2026  
**Audited Baseline SHA:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Status:** READ-ONLY ARCHITECTURAL DEPENDENCY ROADMAP  

---

## 1. Executive Implementation Strategy

The implementation roadmap is structured into sequenced, dependency-aware phases. Hard prerequisites are enforced to prevent rework:
1. **Security Containment First:** All exposed write paths and unverified integrations are locked fail-closed before expanding capabilities.
2. **Authoritative RBAC Before Workspaces:** Server-side roles, permissions, and session validation must be established before building or splitting role workspaces.
3. **PostgreSQL Migration Before Heavy Schema Expansions:** Complex audit ledgers, consent proofs, and durable queues must be built on the target PostgreSQL schema, not discarded SQLite prototypes.
4. **Scoring Policy Resolution Before Engine Construction:** Common leaderboard formulas must not be coded while Product Owner decisions PO-01 through PO-08 remain open.

---

## 2. Sequenced Implementation Phases

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 0: P0 Security Containment (TWM-001)                                              │
│ • Lock write paths • Fail-closed nonce • Strict cron secret • Isolate LC/HR collection  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Core Authentication & Server-Side RBAC Foundation (WP1)                       │
│ • Database-backed sessions • Server role derivation • Admin/Faculty authority binding   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 2: PostgreSQL & Migration Infrastructure (WP5)                                    │
│ • PostgreSQL schema • Versioned DDL migrations • Backup/restore drill verification     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Canonical Provider Adapters & Telemetry Ingestion (WP2)                        │
│ • Unified adapter envelope • Server-side GitHub worker • DEC-08 LeetCode compliance     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 4: Scoring Engine, Quorum & Finalization Closure (WP4) [BLOCKED ON PO-01..PO-08] │
│ • Quorum gates • Hold policies • Deterministic ranking • Asia/Kolkata boundary ledger   │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 5: Role-Based Workspaces & Governance (WP6)                                       │
│ • /faculty workspace • /coordinator triage cockpit • Platform Admin neutral review     │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Phase 6: Reports, Achievements & Production Deployment (WP7)                            │
│ • Immutable snapshots • Production SMTP/OTP domain • Railway deployment verification   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Detailed Phase Breakdown & Dependency Ledger

### Phase 0: P0 Security Containment (TWM-001)
- **Primary Objective:** Eliminate critical vulnerabilities and data integrity risks on the current codebase without altering the database schema or breaking valid read-only views.
- **Scope:**
  - Batch 1: Fail-closed atomic nonce consumption (`TWM-001E`), demo seeding guard (`TWM-001H`), client telemetry write disablement (`TWM-001B`), strict scheduler-only cron authentication (`TWM-001F`).
  - Batch 2: Roster import lock (`TWM-001D`), dispute API confidentiality and resolution lock (`TWM-001C`), LeetCode/HackerRank hard-disablement (`TWM-001G`), honest UI states.
- **Hard Dependencies:** None. Self-contained in existing routes and SQLite helpers.
- **Parallelizable Tasks:** Batch 1 tasks can be verified in parallel with Batch 2 UI state preparations.
- **External Blockers:** None.
- **Acceptance Gate:** 100% pass on negative persistence mutation test suite (`scripts/test-p0-containment.mjs`); zero mutations on rejected calls.

---

### Phase 1: Core Authentication & Server-Side RBAC Foundation (WP1)
- **Primary Objective:** Establish the authoritative server-side source of truth for identity, sessions, roles, and cohort permissions.
- **Scope:**
  - Create server-side `roles`, `permissions`, and `cohort_memberships` structures.
  - Implement server-side session revocation, token rotation, and tamper-proof actor context.
  - Bind Faculty authority to specific academic cohorts.
  - Replace client-state role toggles with server-evaluated authorization on every API route.
- **Hard Dependencies:** Phase 0 (Containment must be landed first to prevent unauthorized access during auth refactoring).
- **Parallelizable Tasks:** Session token crypto utilities can be developed in parallel with role schema definitions.
- **External Blockers:** None.
- **Acceptance Gate:** Every API route verifies actor identity and cohort capability on the server; spoofed client headers or session tampering yield HTTP 401/403.

---

### Phase 2: PostgreSQL & Migration Infrastructure (WP5)
- **Primary Objective:** Transition persistence from the prototype SQLite file to production-grade PostgreSQL with formal, versioned DDL migrations.
- **Scope:**
  - Establish PostgreSQL client connection pool and transaction runner.
  - Write versioned SQL migration scripts for all core tables, foreign keys, and indexes.
  - Implement durable queue primitives (`FOR UPDATE SKIP LOCKED` or dedicated table).
  - Provide automated database backup, export, and verification scripts.
- **Hard Dependencies:** Phase 1 (Role and session models must be defined before freezing the relational schema).
- **Parallelizable Tasks:** Backup/restore script development can occur in parallel with DDL migration authoring.
- **External Blockers:** Target PostgreSQL provisioning (local Docker for dev/test; Railway PostgreSQL for production).
- **Acceptance Gate:** Clean migrations run up and down; foreign key cascades and concurrent locks pass stress testing.

---

### Phase 3: Canonical Provider Adapters & Telemetry Ingestion (WP2)
- **Primary Objective:** Implement the TWM-owned canonical adapter boundary and secure, server-owned telemetry collection.
- **Scope:**
  - Define canonical `ProviderTelemetryEnvelope` interface.
  - Implement server-side GitHub provider ingestion worker using official GitHub API/GraphQL with rate budget management.
  - Enforce DEC-08: Keep LeetCode automated collection disabled until official permission/API is documented; preserve honest display-only state.
  - Enforce HackerRank capability gating: display-only portfolio evidence; exclude from weekly competition deltas.
- **Hard Dependencies:** Phase 2 (Telemetry observations and raw payloads require PostgreSQL transaction support).
- **Parallelizable Tasks:** GitHub adapter implementation can proceed in parallel with HackerRank badge parser verification.
- **External Blockers:** GitHub API rate limits and application OAuth credentials; LeetCode permission review (DEC-08).
- **Acceptance Gate:** Zero client-side telemetry writes; 100% of observations generated by server workers with cryptographic provenance certificates.

---

### Phase 4: Scoring Engine, Quorum & Finalization Closure (WP4)
- **Primary Objective:** Implement the deterministic competition scoring engine, Sunday 23:59:59 IST boundary reconciler, and finalization state machine.
- **Scope:**
  - Calculate weekly deltas against verified Sunday 23:59:59 IST baselines (`boundary_gap <= 3h`).
  - Implement quorum check against authoritative roster denominator (`>= 70%` threshold; dynamic labeling).
  - Finalization state machine: enforce zero stuck jobs, active dispute holds, and idempotent standing generation.
- **Hard Dependencies:**
  - Phase 3 (Ingestion data must be populated by canonical adapters).
  - **CRITICAL POLICY DEPENDENCY:** Product Owner approval of decisions **PO-01 through PO-08** (Competition model, consistency formula, raw point conversions, finalization holds).
- **Parallelizable Tasks:** Ranking math (`1, 2, 2, 4`) is already verified in `src/lib/leaderboard.ts` and can be tested against mock datasets in parallel.
- **External Blockers:** Product Owner formal decision sign-off on PO-01..PO-08.
- **Acceptance Gate:** Complete finalization run generates immutable snapshots without duplicating standings or awards upon repeated invocation.

---

### Phase 5: Role-Based Workspaces & Governance (WP6)
- **Primary Objective:** Deliver dedicated, secure workspace route groups for each user role.
- **Scope:**
  - Split monolith into `/dashboard` (Student), `/coordinator` (Coordinator), `/faculty` (Faculty), and `/admin` (Platform Admin).
  - Implement Coordinator triage-only cockpit: scoped time-limited grants, non-final review notes.
  - Implement Faculty cohort cockpit: final dispute approval, handle correction review, roster imports.
  - Implement Platform Admin cockpit: system exception handling, audit log review, self-affecting action firewall (PO-12, PO-13).
  - Implement student leaderboard opt-in privacy filter (PRIV-01).
- **Hard Dependencies:** Phase 1 (RBAC) and Phase 4 (Scoring and dispute outcomes).
- **Parallelizable Tasks:** UI layout components for Faculty and Coordinator can be authored in parallel.
- **External Blockers:** Product Owner approval of PO-09 (Privacy defaults) and PO-12 (Decision authority matrix).
- **Acceptance Gate:** Cross-role access attempts blocked by middleware and server actions; Coordinator cannot execute final approvals; opted-out students hidden from peer views.

---

### Phase 6: Reports, Achievements & Production Deployment (WP7)
- **Primary Objective:** Enable historical performance reports, immutable achievement ledgers, transactional notifications, and production deployment.
- **Scope:**
  - Implement weekly and semester historical report generation with CSV/PDF exports.
  - Implement two-phase achievement and podium award acknowledgement ledger.
  - Provision production institutional email delivery (SMTP / Resend with verified domain) (DEC-01, PO-16).
  - Finalize Railway deployment manifests, environment secret audits, and operational runbooks.
- **Hard Dependencies:** Phase 4 (Scoring) and Phase 5 (Workspaces).
- **Parallelizable Tasks:** PDF export generation can be developed in parallel with SMTP driver integration.
- **External Blockers:** Verified institutional domain (`cit.edu.in`) for transactional email delivery.
- **Acceptance Gate:** End-to-end smoke test on production environment: student onboarding, OTP delivery, GitHub sync, Sunday finalization, and report generation.

---

## 4. Implementation Dependency Matrix

| Phase | Work Unit | Hard Predecessors | External / Policy Blockers | Parallel With |
|---|---|---|---|---|
| **Phase 0** | TWM-001 P0 Containment | Baseline Repo `6cb7c87` | Product Owner Authorization | Batch 1 & 2 sub-tasks |
| **Phase 1** | Server-Side RBAC & Sessions | Phase 0 Landed | None | Session crypto & DDL design |
| **Phase 2** | PostgreSQL & Migrations | Phase 1 RBAC model | PostgreSQL instance | Backup scripts & DDL scripts |
| **Phase 3** | Canonical Adapters & GitHub Ingestion | Phase 2 PostgreSQL | GitHub OAuth credentials, DEC-08 (LC) | GitHub & HackerRank adapters |
| **Phase 4** | Scoring & Finalization Engine | Phase 3 Telemetry | **PO-01 through PO-08 Decisions** | Ranking tests & hold logic |
| **Phase 5** | Role Workspaces & Privacy | Phase 1 RBAC, Phase 4 Scoring | **PO-09, PO-12 Decisions** | Faculty & Coordinator UIs |
| **Phase 6** | Reports, Email OTP & Production | Phase 4 Scoring, Phase 5 Workspaces | **Verified Domain for SMTP (PO-16)** | Reports & Deployment manifests |
