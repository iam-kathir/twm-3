# TWM V3.1 — Final Planning Reconciliation

**Document Version:** 1.2 (Final Governance Classification Audit Baseline)  
**Audit Date:** 14 November 2026  
**Audited Repository:** `iam-kathir/twm-3`  
**Branch:** `main` | **HEAD Commit SHA:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Evaluation Scope:** Master Planning Baseline (`docs/twm-planning/`) & Current Repository Implementation  
**Operating Mode:** STRICTLY READ-ONLY ASSESSMENT & RECONCILIATION  

---

## 1. Executive Summary & Planning Inventory

This document establishes the authoritative planning baseline and resolves all documented inconsistencies across the TWM V3.1 project planning suite. It serves as the final planning gate prior to authorizing implementation for **Task Pack TWM-001 (P0 Security Containment)**.

### 1.1 Complete Planning Baseline Inventory

The audit reconciled eleven planning artifacts located in `docs/twm-planning/` alongside the master project specification `TWM_Final_Project_Plan_v3.1.md`:

| Document Name | Version | Role in Planning Baseline | Key Reconciled Contribution |
|---|---|---|---|
| `TWM_Master_Decision_Register_v1.0.md` | v1.0 | Authoritative Governance Baseline | Catalogs locked decisions (GOV, ID, PROV, SCORE, COMP) and source hierarchy. |
| `TWM_Product_Owner_Decision_Pack_v1.0.md` | v1.0 | Pending Policy Register | Formulates the 16 critical unresolved decisions (PO-01..PO-16) requiring PO sign-off. |
| `TWM_Remediation_Implementation_Specification_v1.0.md` | v1.0 | Engineering Blueprint | Defines Work Packages 1 through 7, execution gates, and acceptance tests. |
| `TWM_Repository_Audit_Implementation_Gap_Report_v1.0.md` | v1.0 | Source-Level Gap Analysis | Documents vulnerabilities, trust-boundary flaws, and prototype SQLite constraints. |
| `TWM_UI_UX_Technical_Architecture_Blueprint_v1.0.md` | v1.0 | Design & Interaction Standard | Specifies Obsidian design tokens, orbital mechanics, contrast gates, and workspaces. |
| `TWM-001_P0_Security_Containment_Task_Pack_v1.0.md` | v1.0 | Emergency Containment Plan | Defines surgical fail-closed tasks (TWM-001A through TWM-001H) without schema drift. |
| `TWM_Antirasti_Implementation_Task_Pack_v1.0.md` | v1.0 | Macro Task Ledger | Sequences long-term implementation tickets (TWM-000 through TWM-070). |
| `TWM_V3.1_Architecture_Alignment_Report.md` | v1.0 | 24-Domain Alignment Audit | Evaluates current repository code against all 24 V3.1 architectural domains. |
| `TWM_V3.1_Module_Traceability_Matrix.md` | v1.0 | Module Traceability Matrix | Maps 26 functional modules to code paths, invariants, and remediation actions. |
| `TWM_V3.1_Implementation_Dependency_Roadmap.md` | v1.0 | Phased Implementation Roadmap | Enforces hard predecessor gates across Phases 0 through 6. |
| `TWM_V3.1_Unresolved_Decisions_Register.md` | v1.2 | Decision Integrity Ledger | Rigorously classifies all 16 PO decisions across seven governance dimensions. |

---

## 2. Cross-Document Inconsistency Resolution Matrix

The reconciliation review identified nine material inconsistencies across the planning documents and existing codebase. Each inconsistency is resolved below in strict adherence to the governing principle: **Approved locked decisions must never be silently altered, and temporary operational constraints must never be converted into permanent product policy.**

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                               INCONSISTENCY RESOLUTION OVERVIEW                                  │
├─────────────────────────┬───────────────────────────────┬────────────────────────────────────────┤
│ Inconsistency Domain    │ Conflicting Baseline Elements │ Reconciled Invariant Resolution        │
├─────────────────────────┼───────────────────────────────┼────────────────────────────────────────┤
│ 1. Competition Model    │ Common 40/40/20 vs Single     │ Unresolved (PO-01); Pilot: GitHub-only │
│ 2. Consistency Metric   │ ActiveDays/5 vs Ratio+Gate    │ Unresolved (PO-02); Engine held.       │
│ 3. Finalization Holds   │ Cohort-wide vs Per-Student    │ Unresolved (PO-05); P0 prevents unsafe.│
│ 4. Roster Authorization │ isDev bypass vs Strict RBAC   │ Locked: Fail-closed (403) containment. │
│ 5. Provider Scraping    │ Live scraping vs DEC-08/PROV  │ Locked: Hard-isolate to UNAVAILABLE.   │
│ 6. HMAC Nonce Lifecycle │ Upsert-on-miss vs Replay Gate │ Locked: Atomic fail-closed rejection.  │
│ 7. Scheduler Security   │ Fails open vs CRON_SECRET     │ Locked: Require secret + boundary gate.│
│ 8. Demo-Data Seeding    │ Unconditional vs Clean DB     │ Locked: Restrict to non-production.    │
│ 9. Role Workspaces      │ Monolith /admin vs 4 Spaces   │ Phased: Containment first; 4 spaces P5.│
└─────────────────────────┴───────────────────────────────┴────────────────────────────────────────┘
```

### Detailed Resolution Ledger

#### Conflict 1: Competition Model & Scoring Strategy (PO-01)
- **Conflict:** Earlier V3.1 text disabled cross-platform composite scores initially. Later planning documents (`TWM_Remediation_Implementation_Specification_v1.0.md` and `TWM_Master_Decision_Register_v1.0.md` §3.4) recorded formulas for Weekly Common (GitHub 40%, LeetCode 40%, Consistency 20%) and Semester Common (GitHub 40%, LeetCode 40%, Consistency 15%, HackerRank 5%).
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **UNRESOLVED / AWAITING PRODUCT OWNER APPROVAL (PO-01)**. The long-term competition model is not decided. Composite scoring is **not** approved and must not be coded into the core engine.
  - **Temporary Pilot Operating Constraint:** To ensure a safe, compliant first class pilot without dependency on unverified scraping, the pilot operates under a **temporary GitHub-only independent standings constraint**. This operational restriction does not represent permanent product policy.

#### Conflict 2: Consistency Metric Formula (PO-02)
- **Conflict:** Later planning drafts defined consistency as `min(ActiveDays / 5, 1) × 100`. Earlier V3.1 specifications defined it as `qualifying_active_days / eligible_observed_days × 100`, combined with an explicit data-quality gate requiring `≥ 90%` date-level retrieval coverage for finalized GitHub consistency.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **UNRESOLVED / AWAITING PRODUCT OWNER APPROVAL (PO-02)**. Retrieval coverage is an indicator of pipeline health, not student activity.
  - **Temporary Pilot Operating Constraint:** Composite consistency scoring is held. The pilot displays provider-specific activity counts without combined weighting.

#### Conflict 3: Competition Finalization Holds Policy (PO-05)
- **Conflict:** Planning records contain conflicting positions: an earlier draft holding the entire cohort period upon any open dispute vs an advisory reviewer proposal (Claude & Argon) recommending per-student provisional finalization with a Tuesday 18:00 IST cutoff.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **UNRESOLVED / AWAITING PRODUCT OWNER APPROVAL (PO-05)**. Neither cohort-wide hold nor per-student provisional hold is approved as permanent policy. Both remain documented as viable alternative options for Product Owner review:
    - *Option A (Cohort-wide hold):* Entire cohort finalization paused if any unresolved score-affecting dispute exists for the period.
    - *Option B (Per-student provisional hold):* Non-disputed students finalize at Sunday 23:59:59 IST; disputed students receive provisional status until Tuesday 18:00 IST resolution deadline.
    - *Option C (Hybrid model):* Standings finalized provisionally; awards minted only after all disputes in Top 10 are resolved.
  - **Phase 0 Containment Rule:** Phase 0 does not enforce a permanent hold policy. It ensures that `/api/cron/boundary-finalize` fails closed against unauthorized, unauthenticated, or malformed calls, preventing accidental or premature mutations.

#### Conflict 4: Roster Import Authorization
- **Conflict:** In `src/app/api/roster/bulk-import/route.ts`, an `isDev` flag bypasses all authentication in non-production environments, while production mode accepts any authenticated student session because `session` is truthy.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **APPROVED AND LOCKED (DEC-04, GOV-04)**. Roster modifications require authoritative Faculty cohort ownership or Platform Admin authority.
  - **Temporary Pilot Operating Constraint:** In Phase 0 (TWM-001D), the endpoint fails closed with `403 FORBIDDEN` for all callers until server-side RBAC and cohort grant structures are deployed in Phase 1. The `isDev` bypass is eliminated immediately.

#### Conflict 5: Provider Telemetry Collection & Scraping Constraints
- **Conflict:** The active routes `src/app/api/telemetry/leetcode/route.ts` and `hackerrank/route.ts` scrape public GraphQL and REST endpoints using simulated browser headers. Furthermore, finding a public profile sets `isVerified: true` and `status: "SNAPSHOT_VERIFIED"`.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **APPROVED AND LOCKED (DEC-08, PROV-06, INV-01)**. Unsanctioned public scraping is strictly prohibited. Profile lookup presence must never be conflated with identity ownership verification.
  - **Temporary Pilot Operating Constraint:** Both routes are hard-isolated in Phase 0 (TWM-001G) to return honest `UNAVAILABLE` and `isVerified: false` states.

#### Conflict 6: HMAC Nonce Verification Lifecycle
- **Conflict:** In `src/lib/db.ts` (`verifyAndConsumeNonce`), when a nonce is not found in `hmac_nonces`, the function automatically inserts it as consumed and returns `{ valid: true }`.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **APPROVED AND LOCKED (ID-09, §6.2)**. Nonce verification must be single-use, atomic, and replay-resistant.
  - **Phase 0 Containment Rule:** Refactor to fail closed (`{ valid: false, reason: "NONCE_NOT_FOUND" }`) with conditional atomic SQL consumption.

#### Conflict 7: Scheduler & Cron Finalization Security
- **Conflict:** In `src/app/api/cron/boundary-finalize/route.ts`, if `process.env.CRON_SECRET` is unset, the condition `if (cronSecret && authHeader !== ...)` evaluates to falsy, failing open and allowing unauthenticated callers to execute finalization. Additionally, week fallback defaults to hardcoded `42`.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **APPROVED AND LOCKED (COMP-01, COMP-06)**. Scheduler invocations require strict authentication and explicit period parameters.
  - **Phase 0 Containment Rule:** Require `CRON_SECRET` in environment; enforce timing-safe token comparison; require explicit ISO week, year, and boundary parameters.

#### Conflict 8: Production Demo-Data Seeding
- **Conflict:** `src/lib/db.ts` unconditionally calls `seedInitialRosterIfEmpty(db)` on startup if `roster_members` contains zero rows, populating the database with fictional VIT students and synthetic observations.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **APPROVED AND LOCKED (ARCH-02, §5.7, INV-01)**. Production databases must never contain demo, synthetic, or unverified student identities.
  - **Phase 0 Containment Rule:** Wrap seeding function in `process.env.NODE_ENV !== "production"` guard.

#### Conflict 9: Role Workspaces Architecture
- **Conflict:** The UI contains a single monolithic `/admin` dashboard that relies on client-side state toggles (`AppContext.tsx`) to switch between Student, Coordinator, Faculty, and Admin personas.
- **Reconciliation Resolution:**
  - **Permanent Product Policy Status:** **APPROVED AND LOCKED (GOV-04, GOV-05, GOV-06)**. Four distinct workspaces (`/dashboard`, `/coordinator`, `/faculty`, `/admin`) with server-enforced boundaries.
  - **Phased Implementation Rule:** Phase 0 locks administrative mutation endpoints fail-closed; formal workspace splitting is executed in **Phase 5 (Work Package 6)** after server-side RBAC and PostgreSQL persistence are established.

---

## 3. Phase 0 vs Phase 4 Strict Demarcation

A primary invariant of this reconciliation is the strict separation between Phase 0 (Containment) and Phase 4 (Finalization Engine). Phase 0 must never claim or attempt to implement the full Phase 4 competition architecture.

```
┌───────────────────────────────────────────────┐     ┌───────────────────────────────────────────────┐
│         PHASE 0: P0 SECURITY CONTAINMENT      │     │      PHASE 4: COMPETITION FINALIZATION        │
├───────────────────────────────────────────────┤     ├───────────────────────────────────────────────┤
│ Scope: Surgical, Fail-Closed Security Locks   │     │ Scope: Full Deterministic Engine & Governance │
│                                               │     │                                               │
│ • Disable client telemetry writes (403).      │     │ • Full V3.1 finalization state machine.       │
│ • Secure dispute confidentiality & lock (403).│     │ • Enforce ≥ 70% quorum against enrolled roster│
│ • Lock roster import fail-closed (403).       │     │ • Zero stuck compulsory provider jobs gate.   │
│ • Strict atomic nonce verification.           │     │ • PO-approved finalization hold policy (PO-05)│
│ • Strict CRON_SECRET authentication on cron.  │     │ • Sunday 23:59:59 IST hard boundary ledger.   │
│ • Prevent unsafe, unauthenticated finalization│     │ • PO-approved competition scoring (PO-01..04).│
│ • Isolate LeetCode/HackerRank routes.         │     │ • Deterministic standard ranking (1, 2, 2, 4).│
│ • Guard demo seeding in production.           │     │ • Idempotent weekly standings calculation.    │
│ • Assert ZERO mutations on rejected requests. │     │ • Two-phase award & podium acknowledgement.   │
│                                               │     │                                               │
│ Status: Self-contained (Ready for Approval).  │     │ Status: POLICY-BLOCKED on PO-01..PO-08.       │
└───────────────────────────────────────────────┘     └───────────────────────────────────────────────┘
```

---

## 4. Preservation of Unresolved Product Owner Decisions (7-Column Governance Table)

Every decision from PO-01 through PO-16 has been audited against the Master Decision Register and classified across seven explicit governance dimensions, using only the five allowed status categories:
1. **Approved and Locked**
2. **Temporary Pilot Constraint**
3. **Proposed Recommendation**
4. **Awaiting Product Owner Approval**
5. **Blocked by External Provider Confirmation**

| Decision ID & Topic | Authoritative Decision Status | Approved Policy | Temporary Pilot Restriction | Unresolved Question | External Dependency | Implementation Restriction |
|---|---|---|---|---|---|---|
| **PO-01**<br>Competition Model | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | None approved for composite scoring. Baseline is provider-specific boards. | Pilot operates with GitHub-only independent standings. | Long-term model: provider-specific boards only vs Weekly/Semester Common composites. | Blocked on DEC-08 LeetCode clearance. | Do NOT implement composite scoring or merge metrics into single score. |
| **PO-02**<br>Consistency Metric Formula | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | None approved. | Composite consistency engine paused; provider days shown separately. | Formula choice: `min(ActiveDays/5, 1)*100` vs ratio with `≥90%` coverage gate. | None. | Do NOT code composite consistency or treat missing observations as inactive days. |
| **PO-03**<br>Raw Point Conversions | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | None approved. | Display verified activity counts without arbitrary point weighting. | Confirm proposed units (commits=3, PRs=4, LC=2/5/10) vs recalibrate vs raw counts. | None. | Do NOT apply arbitrary point multipliers or weighting formulas. |
| **PO-04**<br>Missing Provider Handling | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | Zero Fabrication Invariant (INV-01): Missing data is `UNAVAILABLE`, never `0`. | Missing provider rendered as honest `UNAVAILABLE`; excluded from peer rankings. | Scoring policy for partially onboarded students when compulsory provider is unavailable. | Dependent on DEC-08. | Do NOT convert missing or inaccessible provider data into zero activity. |
| **PO-05**<br>Finalization Holds Policy | **Awaiting Product Owner Approval**<br>*(Proposed Recommendation)*<br>*(Temporary Pilot Constraint)* | None approved as permanent policy. | Phase 0 finalizer containment prevents unsafe, unauthenticated, or malformed calls. | Permanent hold policy: Cohort-wide hold vs per-student provisional hold vs hybrid model. | None. | Do NOT silently encode cohort-wide or per-student holds as permanent policy in Phase 0. |
| **PO-06**<br>Zero-Score Podium Eligibility | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | None approved. | Podium award minting held pending PO policy confirmation. | Can a participant receive a podium award if score is 0? (Allow vs Require > 0 vs No podium). | None. | Do NOT mint podium awards for zero scores during pilot. |
| **PO-07**<br>Exam & Holiday Policies | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | None approved. | Operate standard weekly competition calendar until institutional list approved. | Handling of breaks/exams: Continue vs Exclude week vs Practice-only vs Calendar exceptions. | CIT academic calendar. | Do NOT alter weekly calendar boundaries without documented approval. |
| **PO-08**<br>Rounding & Precision | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | None approved. | Store full floating precision; round only at published presentation boundaries. | Round components vs round final published score only vs full precision storage. | None. | Do NOT truncate or round internal calculation values before presentation. |
| **PO-09**<br>Leaderboard Privacy Defaults | **Approved and Locked** *(Opt-in)*<br>**Awaiting Product Owner Approval** *(Defaults & Details)* | Leaderboard participation is strictly opt-in (GOV-03). Opted-out excluded from peer views. | Strict explicit opt-in; opted-out students hidden from peer views. | Exact privacy defaults on new enrollment and student personal analytics visibility details. | None. | Do NOT expose opted-out students on public or peer leaderboards. |
| **PO-10**<br>Data Retention Schedule | **Awaiting Product Owner Approval**<br>*(Temporary Pilot Constraint)* | None approved. | Paused purges as a temporary data-preservation safeguard; retain all audit logs. | Official retention schedule: activity history (5 vs 7 yrs), raw payloads, audit logs. | Institutional compliance & DPDP. | Do NOT execute automated data purge jobs during pilot. |
| **PO-11**<br>GitHub Token Handling | **Awaiting Product Owner Approval**<br>*(Proposed Recommendation)*<br>*(Temporary Pilot Constraint)* | None approved. | OAuth token persistence in database is disabled; minimal read-only scope used. | Discard token after proof (Proposed) vs store AES-256 encrypted token vs GitHub App token. | GitHub API rate limits. | Do NOT persist unencrypted OAuth access tokens in database. |
| **PO-12**<br>Decision Authority Matrix | **Approved and Locked** *(Governance)*<br>**Awaiting Product Owner Approval** *(Action Matrix)* | Coordinators triage only (GOV-05, GOV-06); Faculty has final authority; no Admin co-admin (GOV-07). | Administrative mutations fail closed (403) in Phase 0 pending Phase 1 RBAC. | Detailed action-level Faculty vs Platform Admin authority matrix across student operations. | None. | Coordinators must NOT possess commit or final decision authority. |
| **PO-13**<br>Admin Self-Review Firewall | **Approved and Locked** *(Neutral Review)*<br>**Awaiting Product Owner Approval** *(Policy)*<br>*(Temporary Pilot Constraint)* | Platform Admin who is also an enrolled student requires neutral review (GOV-08). | Hard-block self-affecting administrative actions as temporary security safeguard. | Permanent neutral-review mechanism: Assigned Faculty review vs two-person admin review. | None. | Platform Admins must NOT approve their own roster records or disputes. |
| **PO-14**<br>Session Lifetime & Rotation | **Awaiting Product Owner Approval**<br>*(Proposed Recommendation)*<br>*(Temporary Pilot Constraint)* | None approved. (Baseline was 12-hr session with refresh rotation). | Current prototype session helper used during Phase 0 containment. | Session duration (12-hr vs 30-day) and refresh triggers. 7-day HMAC proposal is unapproved. | None. | Do NOT treat client-supplied session fields as authoritative. |
| **PO-15**<br>LeetCode Pilot Fallback & DEC-08 | **Approved and Locked** *(Compulsory & DEC-08)*<br>**Blocked by External Provider Confirmation**<br>**Awaiting Product Owner Approval** *(Fallback)* | Compulsory LeetCode intent remains. Enforcement requires proven permitted method (DEC-08). | Automated collection hard-isolated to `UNAVAILABLE` in Phase 0; unverified accounts excluded. | PO choice of fallback if official access cannot be obtained before pilot. Not silently optional. | LeetCode official API or written permission. | Do NOT execute unauthorized public scraping (PROV-06) or fake verification (INV-01). |
| **PO-16**<br>Production Email Delivery | **Approved and Locked** *(DEC-01 Delivery)*<br>**Blocked by External Provider Confirmation**<br>**Awaiting Product Owner Approval** *(Provider)* | Production OTP requires strict SMTP/API; no console logging; delivery failure creates no session. | In-memory mock email provider used in development and test environments. | Choice of production provider: institutional SMTP relay vs Resend with verified domain. | CIT IT department sending domain (`cit.edu.in`) or relay. | Console OTP logging forbidden in production; unverified domains must not be used. |

---

## 5. Architectural Traceability & Verification Gates

The repository baseline was verified against the five required engineering verification gates:

```powershell
npx tsc --noEmit                                  # Gate 1: TypeScript compilation (Exit 0)
npm run lint                                      # Gate 2: ESLint & Next.js Core Web Vitals (Exit 0)
npm test                                          # Gate 3: Node.js test runner (73/73 passing)
npx next build                                    # Gate 4: Next.js production build (Valid)
git status --short                                # Gate 5: Git working-tree hygiene (Clean)
```

### Verification Evidence
1. **TypeScript (`npx tsc --noEmit`):** Exited with code 0. Zero type errors.
2. **ESLint (`npm run lint`):** Exited with code 0. Zero warnings, zero errors.
3. **Test Runner (`npm test`):** 73 of 73 tests passing across 19 suites in 235ms.
   - Foundation & Launch Audit: 10/10 launch gates passing (`scripts/test-foundation.mjs`).
   - OTP Verification & Hardening: 7/7 suites passing (`scripts/test-otp-verification.mjs`).
   - Hero Stats Refinement: Verified (`scripts/test-hero-stats-refinement.mjs`).
   - Orbital Motion Engine: 5/5 suites passing (`scripts/test-orbital-engine.mjs`).
   - Authenticated Layout: 5/5 suites passing (`scripts/test-authenticated-layout.mjs`).
4. **Git Hygiene:** Clean working tree on `main` at `6cb7c87`. Only untracked planning documents exist in `docs/twm-planning/`.

---

## 6. Planning Reconciliation Sign-Off

The planning documentation is fully reconciled, consistent, and architecturally aligned. The separation between Phase 0 and Phase 4 is explicitly demarcated, and all policy dependencies are cataloged without converting temporary pilot constraints into permanent decisions.

**Next Milestone:** Authorization of Task Pack **TWM-001 (P0 Security Containment)**.
