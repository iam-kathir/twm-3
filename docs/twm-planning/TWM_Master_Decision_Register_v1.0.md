# TWM Master Decision Register v1.0

**Product:** TWM — Track. Win. Maintain.  
**Baseline:** TWM V3.1 + later explicitly approved policy updates + Claude review + Argon review  
**Prepared:** 14 November 2026  
**Status:** Consolidation draft for Product Owner review

> This register consolidates decisions and evidence. It does not approve reviewer proposals on the Product Owner's behalf. Existing locked decisions remain unchanged unless the Product Owner explicitly approves a revision.

## 1. Status vocabulary and authority

| Status | Meaning |
|---|---|
| LOCKED | Explicitly approved decision; preserve unless owner changes it. |
| EXISTING BASELINE | Present in V3.1; check for later superseding decisions. |
| PROPOSED | Reviewer or consolidation recommendation; not approved. |
| UNRESOLVED | Conflicting or incomplete decision. |
| VALIDATION REQUIRED | Must be demonstrated with permitted access or operational evidence. |
| IMPLEMENTATION GAP | Required behavior is not proven to exist in implementation. |
| DEFERRED | Intentionally excluded from current delivery stage. |

**Authority order:** (1) latest explicit Product Owner approval; (2) explicitly locked policy update; (3) V3.1 master plan where not superseded; (4) earlier approved specification when provenance is established; (5) Claude/Argon reviews as evidence and recommendations, not approvals; (6) this document's recommendations.

### Non-negotiable principles
- Missing, stale, failed, inaccessible, or unsupported data is never silently converted to zero.
- A linked provider profile is not automatically ownership-verified.
- Connection, ownership verification, metric capability, and leaderboard eligibility are separate states.
- TWM measures observable provider-reported activity, not intelligence, effort, coding quality, or total productivity.
- No unauthorized scraping, anti-bot bypass, access-control circumvention, or fabricated metrics.
- Consent does not override provider terms or create API permission.
- No repository changes, migrations, deployment, credential setup, or account actions without explicit authorization.
- Core TWM must work with AI disabled.

## 2. Product identity and scope

TWM is a class-focused developer activity monitoring, analytics, and friendly competition platform. Students connect developer profiles; TWM collects permitted observable metrics, maintains provenance and history, presents personal analytics and opt-in peer leaderboards, and provides authorized cohort monitoring and reports.

**In scope:** institutional identity and class membership; GitHub, LeetCode, HackerRank capability evaluation; provider linking and verification; personal dashboard and analytics; platform-specific leaderboards where quality and permission gates pass; consistency and Most Improved where supported; achievements, reports, privacy, disputes, notifications; Student, Coordinator, Faculty, and Platform Admin workspaces.

**Out of scope:** academic ERP, assignments/submissions/grading, in-app coding editor/online judge/code execution, teams and question distribution, plagiarism or AI-code detection, AI-generated skill scores, global competition, private repository collection by default, and a cross-platform overall score in the V3.1 initial release unless later approved scoring decisions explicitly supersede it.

## 3. Decision register

### 3.1 Product, governance, roles

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| GOV-01 | Class-focused activity, analytics and friendly competition; not an academic ERP or judge. | LOCKED / BASELINE | Preserve product boundary. |
| GOV-02 | Students connect personal developer accounts; TWM never collects provider passwords. | LOCKED | Preserve. |
| GOV-03 | Leaderboard participation is opt-in. | LOCKED | Opted-out users are excluded from peer ranking views. |
| GOV-04 | Four workspaces: Student, Coordinator, Faculty, Platform Admin. | LOCKED DIRECTION | Role-specific navigation and server-side access. |
| GOV-05 | Coordinators are students with scoped, time-bounded, revocable grants; not Platform Admin co-admins. | LOCKED | Preserve. |
| GOV-06 | Coordinators triage/recommend; Faculty makes final handle/dispute decisions. | LOCKED — later update | Preserve Coordinator Triage-Only Boundary. |
| GOV-07 | No independent Platform Admin co-admin role. | LOCKED — latest direction | Do not reintroduce co-admin; neutral review safeguards remain necessary. |
| GOV-08 | Platform Admin may also be a competing student. | EXISTING CONTEXT | Self-affecting actions need neutral approval or must be blocked/deferred. Exact firewall is proposed. |
| GOV-09 | Cohort transfers take effect next Monday 00:00 IST; current week remains with prior cohort. | LOCKED — later update | Preserve historical attribution. |
| GOV-10 | Archived cohorts are read-only for students. | LOCKED DEC-05 | Preserve. |

### 3.2 Authentication, onboarding, identity

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| ID-01 | Institutional domain `@cit.edu.in`. | LOCKED | Enforce institutional identity allow-list. |
| ID-02 | Institutional OTP primary identity gate: six digits, keyed HMAC-SHA256 hash, 10-minute TTL, single use, 60-second resend cooldown, max 5 failures, 15-minute IP/email cooldown. | LOCKED | Preserve exact controls. |
| ID-03 | Production OTP uses strict SMTP or transactional email API; no console OTP logging; delivery failure creates no session. | LOCKED DEC-01 | Preserve. |
| ID-04 | Five onboarding actions: confirm identity/roster; GitHub OAuth; LeetCode verification subject to DEC-08; optional HackerRank; privacy review/workspace entry. | LOCKED DEC-07 | Preserve conditional LeetCode gate. |
| ID-05 | GitHub connection compulsory in current onboarding policy. | LOCKED — later onboarding decision | Define operational exception behavior. |
| ID-06 | LeetCode remains intended compulsory, but production enforcement only after permitted and reliable method is proven. | LOCKED DEC-08 | If proof fails, no fake verification; owner approves downgrade/alternative. |
| ID-07 | HackerRank optional; excluded from Weekly Common. | LOCKED | Semester use only if capability and permission pass. |
| ID-08 | Institutional identity separate from provider identity; provider email need not equal college email. | LOCKED PRINCIPLE | Preserve. |
| ID-09 | Provider ownership verified before competitive ranking. | LOCKED PRINCIPLE | Unverified profiles excluded. |
| ID-10 | Roster typo correction is non-blocking; Faculty review and before/after audit. | LOCKED DEC-03 | Preserve. |
| ID-11 | Duplicate provider identity hard-blocks linking. | LOCKED PRINCIPLE | Enforce unique external identity ownership. |
| ID-12 | Session model: signed short-lived access, opaque DB session, refresh rotation/reuse detection, 12-hour default browser session; optional 30-day persistence unchecked. | EXISTING BASELINE | Validate implementation and threat model. |
| ID-13 | Root bootstrap uses hashed single-use 15-minute token, institutional OTP and WebAuthn/TOTP; fail closed if root admin exists except controlled additional-admin flow. | EXISTING BASELINE | Preserve pending implementation review. |

### 3.3 Provider integration

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| PROV-01 | Method A: TWM-owned canonical provider adapter with pluggable upstream transport. | PROPOSED — strongly recommended | Owner approval required. Avoid coupling UI/schema to vendor payloads. |
| PROV-02 | GitHub official API integration. | CONDITIONAL GO / VALIDATION REQUIRED | Validate scopes, fields, rate limits, history, attribution, visibility, timezone. |
| PROV-03 | LeetCode unattended collection. | VALIDATION REQUIRED / DEC-08 | No production collection without permitted, reliable, ownership-verifiable evidence. |
| PROV-04 | HackerRank Community unattended collection. | VALIDATION REQUIRED | Written permission or documented permitted access required. |
| PROV-05 | Third-party API provider/key. | PROPOSED / RESTRICTED | Vendor key is not upstream-provider permission. Use authorized data, fixtures, documented samples, or approved access only. |
| PROV-06 | No scraping, anti-bot bypass, CAPTCHA/WAF evasion, or access-control circumvention. | LOCKED PRINCIPLE | Do not implement. |
| PROV-07 | Capability is field- and metric-specific. | LOCKED V3.1 | Record access method, meaning, permission, ownership, history, timestamps, limits, terms, freshness and ranking eligibility. |
| PROV-08 | Capability states: `SUPPORTED_LIVE`, `SUPPORTED_EVENT`, `SUPPORTED_SNAPSHOT`, `LINKED_UNVERIFIED`, `LIMITED`, `UNAVAILABLE`, `DISABLED_POLICY`. | LOCKED V3.1 BASELINE | Keep one canonical enum. |
| PROV-09 | Snapshot-only cumulative values support change-between-observations, not invented daily activity. | LOCKED PRINCIPLE | Use last valid pre-boundary observation and disclose boundary gap. |
| PROV-10 | Retain or discard GitHub OAuth token after ownership verification. | UNRESOLVED | Validate exact queries/scopes, per-user rate budget, app-token alternatives, encryption, rotation and deletion. |
| PROV-11 | HackerRank cumulative portfolio evidence only when fields are verified and permitted; no Weekly Common. | CONDITIONAL | Preserve optional status. |
| PROV-12 | Codeforces is not current scope. | DEFERRED | No addition without explicit approval and rationale. |

**Adapter contract direction:** normalized envelopes should include provider, external account ID, metric/field, source timestamp, retrieval timestamp, observation mode, coverage window, provenance, validation result, and capability/eligibility state. Exact TypeScript interface belongs in the architecture specification.

### 3.4 Scoring and competition

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| SCORE-01 | Weekly Common weights: GitHub 40%, LeetCode 40%, Consistency 20%. | EXISTING LATER BASELINE | Preserve pending V3.1 scope reconciliation. |
| SCORE-02 | Semester Common weights: GitHub 40%, LeetCode 40%, Consistency 15%, HackerRank 5%. | EXISTING LATER BASELINE | Validate HR scale and non-dilution rule. |
| SCORE-03 | GitHub weekly target cap 36 raw points; LeetCode cap 35. | EXISTING BASELINE; raw units claimed by Argon | Verify exact raw conversion against authoritative earlier specification. |
| SCORE-04 | Argon's claimed GitHub units: 3 per qualifying public commit, max 12 commit points/day; collaboration action 4 each, max 12/week. | RECONCILIATION REQUIRED | Do not mark locked until source is verified. |
| SCORE-05 | Argon's claimed LeetCode units: Easy=2, Medium=5, Hard=10. | RECONCILIATION REQUIRED | Verify source and timestamp attribution capability. |
| SCORE-06 | HackerRank: 8 per verified domain badge star; 25 per verified skill certificate; semester cap 120. | EXISTING BASELINE / VALIDATION REQUIRED | Validate duplicate handling and source fields. |
| SCORE-07 | Weekly Common: `round(4*S_GH + 4*S_LC + 2*S_Cons)`. | EXISTING BASELINE | Document normalization and rounding. |
| SCORE-08 | Semester: `Score_2P = round(((.40*S_GH + .40*S_LC + .15*S_Cons)/.95)*10)`; `Score_3P = round((.40*S_GH + .40*S_LC + .15*S_Cons + .05*S_HR)*10)`; HR participants get `max(Score_2P, Score_3P)`, HR skippers get `Score_2P`. | EXISTING BASELINE / RECONCILIATION REQUIRED | Reconcile against V3.1 initial-release restriction. |
| SCORE-09 | Consistency `min(ActiveDays/5,1)*100`. | UNRESOLVED | Conflicts with V3.1 active-days/eligible-observed-days formula and 90% retrieval coverage gate. |
| SCORE-10 | GitHub consistency requires ≥90% date-level retrieval coverage for finalized result. | EXISTING V3.1 BASELINE | Coverage is data quality, not activity. |
| SCORE-11 | Provider-native day buckets must not be relabelled IST days. | LOCKED V3.1 | Label provider boundary or exclude if unusable. |
| SCORE-12 | Exam/holiday weeks zero weight / optional practice. | PROPOSED | Owner approval and calendar semantics required. |
| SCORE-13 | Weekly Top 3 only on Weekly Common. | LOCKED | Preserve. |
| SCORE-14 | Competition ranking ties: 1,2,2,4; alphabetical display does not change rank. | LOCKED V3.1 | Preserve. |
| SCORE-15 | Require score > 0 for podium eligibility. | PROPOSED | Not approved; define all-zero pool behavior if adopted. |
| SCORE-16 | Most Improved: rolling four-week baseline, at least three valid prior weeks, current week excluded; baseline zero means absolute delta only. | LOCKED V3.1 BASELINE | Preserve. |
| SCORE-17 | Overall cross-platform leaderboard disabled in V3.1 initial release. | LOCKED V3.1 BASELINE | Later Common formulas appear to conflict; owner must confirm supersession. |
| SCORE-18 | Missing/unsupported/stale data never becomes zero. | LOCKED PRINCIPLE | Preserve everywhere. |
| SCORE-19 | Private anonymous GitHub contribution counts excluded from competitive scoring. | LOCKED — later update | Public verifiable activity only. |
| SCORE-20 | GitHub SHA deduplication, authorship verification and under-five-minute micro-commit burst filtering. | LOCKED — later update | Define event edge cases and test vectors. |

### 3.5 Quorum, finalization, disputes, awards

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| COMP-01 | Competition timezone `Asia/Kolkata`; Monday 00:00:00 to Sunday 23:59:59 IST. | LOCKED V3.1 | Preserve. |
| COMP-02 | Monday 00:00–06:00 reconciliation; 06:00–18:00 provisional review/dispute; 18:00 conditional finalization. | LOCKED — later update | Preserve. |
| COMP-03 | Quorum threshold ≥70%. | LOCKED | Preserve. |
| COMP-04 | Quorum includes active students with verified compulsory providers and valid period snapshot, regardless of leaderboard opt-in, including verified zero-activity students. | LOCKED — later update | Preserve; note dependency on DEC-08/LeetCode. |
| COMP-05 | Opted-out students count toward telemetry quorum but are absent from peer ranking and podium pool. | LOCKED — later update | Preserve; Faculty access follows assigned permissions. |
| COMP-06 | Finalization requires zero stuck/unresolved compulsory-provider syncs, quorum ≥70%, and zero unresolved score-affecting disputes. | LOCKED — later update | Preserve unless owner approves refinement. |
| COMP-07 | Failed gate at 18:00 leaves period `PROVISIONAL_REVIEW` / `RECONCILIATION_EXTENDED`; failed quorum after sync completion closes `CLOSED_BELOW_QUORUM`. | LOCKED — later update | Preserve. |
| COMP-08 | One unresolved student dispute/stuck sync can block whole cohort. | KNOWN DESIGN RISK | Claude and Argon identify cohort-wide veto. |
| COMP-09 | Individual provisional holds; publish rest of cohort; podium delay only if top-3 outcome may change. | PROPOSED | Owner approval; requires deterministic reach/tie algorithm and deadline. |
| COMP-10 | 18:00 is conditional, not unconditional timer. | LOCKED | Preserve. |
| COMP-11 | Two-phase award acknowledgement; podium minted only after finalization. | LOCKED BASELINE | Preserve. |
| COMP-12 | Weekly Top 3 exclusively Weekly Common. | LOCKED | Preserve. |
| COMP-13 | Quorum is telemetry coverage, not coding participation. | LOCKED PRINCIPLE | UI reports them separately. |

### 3.6 Privacy and role safeguards

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| PRIV-01 | Leaderboard opt-in separate from provider connection and personal analytics. | LOCKED | Preserve. |
| PRIV-02 | Versioned, auditable consent/notice evidence. | PROPOSED ADDITION | Add consent ledger after privacy review. |
| PRIV-03 | Consent withdrawal disconnects provider, stops future sync and triggers token/data deletion under policy. | EXISTING BASELINE | Define deletion propagation and backup expiry. |
| PRIV-04 | Coordinator grants are scoped/time-limited; self-triage prohibited. | LOCKED | Preserve. |
| PRIV-05 | Coordinator cannot final-approve/commit; Faculty-only final decision. | LOCKED — later update | Preserve. |
| PRIV-06 | Remove `IMPORT_ROSTER` from Coordinator grants. | PROPOSED | Argon recommendation; owner confirmation. |
| PRIV-07 | Hide register number from Coordinator views. | PROPOSED | Argon recommendation; owner confirmation. |
| PRIV-08 | Restrict Coordinator access to opted-out peer scores/activity; allow sync coverage only where appropriate. | PROPOSED | Reconcile with existing grants and privacy notice. |
| PRIV-09 | Platform Admin's own handle changes/disputes/roster edits require assigned Faculty approval; hide opted-out peer scores in own competing cohort. | PROPOSED | Recommended fairness firewall; owner approval. |
| PRIV-10 | Without neutral reviewer, self-affecting action is blocked/deferred. | RECOMMENDED SAFEGUARD | Fits no-co-admin direction; approve exact workflow. |
| PRIV-11 | Consent, audit, security, deletion records have distinct retention/access controls. | RECOMMENDED | Specify in data dictionary and privacy schedule. |

### 3.7 Infrastructure, security, operations

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| ARCH-01 | Next.js App Router, TypeScript, modular monolith. | EXISTING BASELINE | Validate repo versions/runtime. |
| ARCH-02 | PostgreSQL production database. | EXISTING BASELINE | SQLite prototype is not production target. |
| ARCH-03 | Formal schema migrations. | REQUIRED | No runtime inline schema creation as production migration strategy. |
| ARCH-04 | Durable jobs, idempotency, bounded retries, leases, provider-specific limits. | REQUIRED BASELINE | PostgreSQL `FOR UPDATE SKIP LOCKED` is a candidate, not locked. |
| ARCH-05 | Web, worker, PostgreSQL, scheduled trigger as logical services. | PROPOSED | Validate Railway constraints. |
| ARCH-06 | Railway initial hosting direction. | EXISTING BASELINE | Validate backups, workers, cron, egress and restore. |
| ARCH-07 | Domain purchase deferred. | LOCKED | Do not assume Resend can send institutional OTP without verified domain. |
| ARCH-08 | Resend recommended after domain verification. | PROPOSED / DEFERRED | Keep EmailProvider abstraction. |
| ARCH-09 | Gmail SMTP temporary bridge. | PROPOSED / VALIDATION REQUIRED | Argon's daily sending range is unverified; test policy, app password, deliverability and CIT acceptance. |
| ARCH-10 | Retained provider tokens encrypted AES-256-GCM, unique IV and key rotation. | EXISTING SECURITY BASELINE | Apply only to tokens actually required. |
| ARCH-11 | Server derives user, role, cohort and reviewer identity. | LOCKED SECURITY PRINCIPLE | Never trust client-supplied authorization identity. |
| ARCH-12 | Server-side authorization on every protected API/action. | REQUIRED | Middleware is not sole security boundary. |
| ARCH-13 | Independent encrypted backups and restore drills. | REQUIRED | Define target, RPO/RTO, retention and tests. |
| ARCH-14 | AI deferred; core works with AI disabled. | DEFERRED / LOCKED DIRECTION | AI cannot block sync/scoring/dashboard. |
| ARCH-15 | PostgreSQL queue without Redis initially. | PROPOSED | Choose simplest durable queue if tests pass. |
| ARCH-16 | In-app notification ledger. | PROPOSED | Define event taxonomy, preferences and retention. |

### 3.8 UI/UX

| ID | Decision | Status | Consolidated position |
|---|---|---|---|
| UX-01 | Premium dark Obsidian visual direction. | EXISTING DESIGN | `#07090E` background, `#0D111A` / `#131926` surfaces, violet/blue/cyan accents, semantic status colors. |
| UX-02 | Four role workspaces and route groups: public, auth, student, coordinator, faculty, platform-admin. | BLUEPRINT DIRECTION | Preserve and reconcile with repo. |
| UX-03 | Student five pillars: Overview, Analytics, Leaderboard, Achievements, Settings/Profile. | EXISTING BLUEPRINT | Preserve navigation structure. |
| UX-04 | Faculty and Platform Admin require field-level workflow specifications. | BLUEPRINT GAP | Argon's high-level map is not complete enough for implementation. |
| UX-05 | Data-driven pages represent loading, empty, stale/provisional, error/unavailable, restricted/opted-out, verified states. | RECOMMENDED STANDARD | Adopt as design-system acceptance requirement. |
| UX-06 | Metric/provenance drawer explains formula, source, observation time, coverage and eligibility. | EXISTING BLUEPRINT DIRECTION | Standardize. |
| UX-07 | Responsive desktop/mobile, accessibility and reduced-motion support. | REQUIRED | Include keyboard, contrast, screen-reader and touch tests. |
| UX-08 | Review broad peer search for opted-out profile leakage. | PROPOSED | Audit existing `/search` visibility. |

## 4. Critical conflicts requiring explicit resolution

### CONFLICT-01 — Common scoring versus V3.1 overall-score restriction
V3.1 says platform-specific metrics are the source of truth, unlike measurements are not added together, and the overall cross-platform score is disabled initially. Later policy defines Weekly Common and Semester Common composites.
**Decision required:** confirm whether the later Common formulas explicitly supersede the V3.1 restriction or are a later phase.
**Recommendation:** preserve later formulas only if their approval is authoritative; record the supersession and effective version.

### CONFLICT-02 — LeetCode compulsory onboarding versus capability-gated fallback
DEC-07 includes LeetCode subject to DEC-08; DEC-08 requires permitted reliable method before production enforcement. V3.1 permits GitHub-first release with LC limited/unavailable.
**Decision required:** when LC cannot be validated, decide whether to block onboarding, Common competition, or only LC-specific rankings.
**Recommendation:** keep personal dashboard usable; never fake verification or eligibility.

### CONFLICT-03 — Consistency formula
V3.1 uses `qualifying_active_days / eligible_observed_days × 100` plus ≥90% retrieval coverage. Later/Argon uses `min(ActiveDays/5,1) × 100`.
**Decision required:** choose one scoring formula and keep retrieval coverage separate.
**Recommendation:** failed/unobserved days are not inactive; define active-day evidence per provider.

### CONFLICT-04 — Cohort-wide finalization veto
Locked gates require zero unresolved score-affecting disputes and zero stuck compulsory syncs cohort-wide. Argon/Claude propose individual provisional holds.
**Decision required:** approve or reject individual holds and podium delay.
**Recommendation:** if adopted, specify deterministic ranking, ties, maximum hold deadline and audit behavior.

### CONFLICT-05 — Independent co-admin versus no co-admin
V3.1 recommends an independent co-admin; later governance says no independent Platform Admin co-admin.
**Decision required:** confirm neutral-review workflow for Platform Admin's own student record.
**Recommendation:** assigned Faculty reviews self-affecting actions; if no neutral reviewer exists, block/defer. This does not create a co-admin role.

### CONFLICT-06 — GitHub token retention
Claude recommends discard after ownership proof; Argon recommends retaining minimal-scope token for user-specific queries/rate budget.
**Decision required:** decide after validating API operations, scopes, rate limits, app alternatives, encryption, revocation and consent.
**Recommendation:** minimize scopes and retention; do not decide from theoretical rate limits.

### CONFLICT-07 — OTP email bridge
Resend depends on verified sending domain; domain purchase is deferred. Argon proposes Gmail SMTP or institutional subdomain.
**Decision required:** select tested route accepted by CIT.
**Recommendation:** ask CIT IT about institutional relay/subdomain first; test Gmail only as candidate. No production OTP console logging.

### CONFLICT-08 — Raw scoring-unit provenance
Argon says raw units existed in earlier spec but were omitted from V3.1 summary. The accessible V3.1 master-plan text does not itself establish the exact values as locked.
**Decision required:** verify authoritative earlier source or explicitly reapprove raw units.
**Recommendation:** do not implement until each unit, cap, duplicate rule, attribution rule and test vector is canonical.

## 5. Claude and Argon review disposition

**Useful findings to carry forward (not automatic approvals):**
1. Run provider feasibility spikes in parallel with blueprint/schema work, using only permitted samples, fixtures, documentation or authorized access.
2. Use a TWM-owned adapter boundary.
3. Preserve provenance and explicit missing/stale/unavailable states.
4. Investigate cohort-wide finalization veto.
5. Add explicit consent evidence to data model.
6. Reconcile Coordinator visibility and Platform Admin conflict safeguards.
7. Validate GitHub token necessity rather than assuming retain/discard.
8. Verify email delivery and backup/restore before launch.
9. Reconcile Argon's endpoint-count inconsistency: it claims 17 endpoints but enumerates 21 paths.

**Not approved by this register:** individual provisional finalization; Tuesday 18:00 podium deadline; positive-score podium floor; exam/holiday zero-weight weeks; Coordinator removal of `IMPORT_ROSTER`; hiding register numbers; exact Admin firewall; Gmail SMTP bridge; GitHub token retention; raw scoring units before source verification.

**Evidence limitations:** Claude reports no repo access and no live LC/HR requests. Argon reports inspecting a repository archive, but this register has not independently verified it. Third-party endpoint claims do not establish provider permission. Snapshot cadence does not guarantee complete event history; list depth, pagination, burst volume, timestamp semantics and provider stability require tests. This document is not legal advice or provider authorization.

## 6. Canonical workspace and route blueprint

Proposed routes based on existing TWM direction and reviews; reconcile with repository before implementation.

| Workspace | Routes |
|---|---|
| Public/Auth | `/`, `/privacy`, `/login`, `/login/verify`, `/login/not-enrolled`, `/onboarding` |
| Student | `/dashboard`, `/analytics`, `/analytics/github`, `/analytics/leetcode`, `/analytics/hackerrank`, `/leaderboard`, `/achievements`, `/settings` |
| Coordinator | `/coordinator`, `/coordinator/roster`, `/coordinator/students/[studentId]`, `/coordinator/triage`, `/coordinator/reports` |
| Faculty | `/faculty`, `/faculty/classes`, `/faculty/classes/[classId]`, `/faculty/classes/[classId]/roster`, `/faculty/classes/[classId]/import`, `/faculty/classes/[classId]/students/[studentId]`, `/faculty/analytics`, `/faculty/disputes`, `/faculty/reports`, `/faculty/coordinators`, `/faculty/audit` |
| Platform Admin | `/platform-admin`, `/platform-admin/faculty`, `/platform-admin/cohorts`, `/platform-admin/policies`, `/platform-admin/audit` |

**Page-state contract:** loading; empty/not connected; verified zero; stale/provisional; error/provider unavailable; restricted/opted out/permission denied; partial data; disconnected/reauthorization required. Verified zero must be distinct from missing data.

## 7. Architecture direction

### Application shape
- Modular monolith initially; Next.js App Router and TypeScript subject to repository/version validation.
- PostgreSQL production DB with formal migrations.
- Background worker and durable job queue.
- Provider adapters isolated from UI and scoring.
- Server-side authorization on every protected read/write.
- No unnecessary microservices or vector DB in initial build.

### Provider data flow
`Provider source → provider adapter → normalized envelope → validation/provenance → immutable observation/snapshot → deterministic metric engine → eligibility → leaderboard/report UI`

UI must not consume third-party payload shapes directly.

### Job requirements
Durable job records; idempotency keys; lease ownership/expiry; bounded exponential retry with jitter; dead-letter/error state; provider/per-user rate limits; per-user/provider concurrency; cancellation/timeouts; queue observability; authorized manual retry. PostgreSQL `FOR UPDATE SKIP LOCKED` is a candidate, not a locked implementation.

### Security
HTTPS; secure HttpOnly SameSite cookies; CSRF; OAuth state and redirect allow-list; least privilege; AES-256-GCM for retained tokens; server-derived identity/role/cohort/reviewer; input validation/output encoding; rate limits; audit records; no secrets in logs; encrypted backups and restore tests. AI gets minimum necessary validated aggregates only.

## 8. Conceptual data model inventory

Not a finalized ERD or migration specification.

| Domain | Candidate entities |
|---|---|
| Identity/access | `users`, `institutional_identities`, `roster_identities`, `cohorts`, `cohort_memberships`, `faculty_assignments`, `coordinator_grants`, `auth_sessions`, `otp_challenges`, `invitation_codes` |
| Provider | `provider_connections`, `provider_connection_versions`, `provider_handle_history`, `provider_verification_challenges`, `provider_capabilities`, `provider_observations`, `provider_activity_events`, `provider_snapshots`, `provider_sync_jobs`, `provider_sync_attempts` |
| Competition | `academic_periods`, `cohort_periods`, `period_quorum_snapshots`, `scoring_config_versions`, `metric_definitions`, `leaderboard_results`, `leaderboard_result_inputs`, `eligibility_decisions`, `achievements`, `achievement_awards` |
| Governance/privacy | `consent_records`, `disputes`, `roster_correction_requests`, `deletion_requests`, `audit_logs`, `security_events`, `user_notifications`, `institution_settings` |

**Schema rule:** immutable source observations and finalized result inputs must be reproducible. Mutable derived values must be recalculable from retained permitted evidence. Retention/deletion applies deliberately; not every table should be immutable by default.

## 9. Implementation roadmap — proposed sequence

### Phase 0 — Evidence and decision lock
Reconcile canonical decisions; validate provider terms/access; test GitHub scopes/fields/rate limits/attribution/timezone/history; test LC/HR only through permitted samples, authorized access or vendor fixtures; lock metric definitions and raw units; define email route, hosting, backup, RPO/RTO; run isolated non-production adapter spike in parallel where permitted.
**Exit:** every launch metric has approved source, permission status, ownership proof, timestamp/history semantics and deterministic calculation—or is explicitly limited/disabled.

### Phase 1 — Platform foundation
PostgreSQL schema/migrations; identity, sessions, OTP and RBAC; cohort/roster; consent/audit; durable jobs; secrets/encryption.

### Phase 2 — Design system and application shells
Obsidian design system; public/auth shells; all four workspaces; responsive navigation; accessibility; shared metric/provenance components and page states.

### Phase 3 — Membership and governance workflows
Roster import dry-run/commit; membership/transfers; Faculty assignments; Coordinator grants/triage; disputes, roster corrections, neutral review; privacy and deletion.

### Phase 4 — Provider adapters and telemetry
GitHub adapter first; capability registry; normalization, snapshots/events/provenance; rate limits, retries, freshness; LC/HR only after permitted gates pass.

### Phase 5 — Deterministic competition engine
Metric definitions/versioned scoring; period boundaries; quorum; eligibility; leaderboards/ties; finalization/awards; dispute and correction replay tests.

### Phase 6 — Full workspace integration
Student analytics/achievements; Coordinator overview/roster/triage/reports; Faculty command center/roster/import/drilldown/analytics/disputes/grants/audit; Platform Admin trust center/faculty/cohorts/policies/audit; notifications and exports.

### Phase 7 — Security, QA, operations and pilot
Threat model and auth tests; unit/integration/E2E; provider outage/stale-data; backup/restore; deletion/consent; accessibility/responsive; Railway staging and production readiness; pilot monitoring and rollback.

Parallel Phase 0/1 work is limited to permitted feasibility research and adapter-contract prototyping; it must not become unauthorized production scraping or lock schema around unverified payloads.

## 10. Production-pilot acceptance criteria

**Product/fairness:** every score has versioned formula and trace; missing data never zero; ranked participants meet ownership/eligibility; opted-out users absent from peer views; quorum exact; ties visible; disputes audited/reproducible; IST finalization tested.

**Security/privacy:** server-side authorization on every API/action; no client-supplied identity trusted; secrets encrypted/not logged; disconnect stops sync and revokes/deletes credentials where supported; consent version auditable; deletion and backup expiry tested; admin self-approval blocked where required.

**Reliability:** idempotent bounded jobs; provider isolation; stale labels; rate limits; worker restart recovery; restore drill; monitoring and incident response.

**UI/UX:** all workspaces functional; all relevant page states implemented; responsive layouts; keyboard/contrast/reduced-motion/accessibility; score/provenance explanation wherever metric displayed.

## 11. Repository audit status

Argon reports inspecting archive `twm-3`, commit `fc36b8fbaf4f57883c3ecd4c38cac730a449b470`, and reports Next.js 14, React 18, TypeScript, Tailwind, SQLite, six tables, mock leaderboard data, incomplete workspaces, and API authorization gaps.

These are **reviewer-reported findings**, not independently verified facts in this register. Argon says it found 17 API endpoints but enumerates 21 paths; reconcile that discrepancy. A separate read-only repository inspection is required before creating an implementation-gap matrix.

Repository reference: `https://github.com/iam-kathir/twm-3` (`main`). No repository changes are authorized by this register.

## 12. Product Owner decisions still required

1. **Common scoring vs V3.1:** Does later Weekly/Semester Common supersede V3.1's initial-release restriction on overall cross-platform scoring?
2. **LeetCode fallback:** If no permitted reliable integration is proven, what is blocked: onboarding, Common leaderboard, or only LC-specific ranking?
3. **Consistency:** Five-active-days target or V3.1 active-days/eligible-observed-days rate? Keep retrieval coverage separate either way.
4. **Finalization:** Retain cohort-wide veto or approve individual provisional holds and separate podium hold?
5. **Neutral review:** Approve assigned Faculty review for Admin's own student-affecting actions, with block/defer if no neutral reviewer?
6. **Coordinator privacy:** Remove roster import, hide register number, restrict opted-out peer activity?
7. **Podium/academic weeks:** Positive-score podium floor? Exam/holiday weeks as zero-weight optional practice?
8. **GitHub token:** Retain encrypted minimum-scope token or discard after ownership proof, based on actual tests?
9. **Email:** Institutional relay/subdomain, verified transactional provider after domain setup, or tested temporary SMTP bridge?
10. **Raw scoring units:** Confirm Argon's recovered raw-point table against authoritative earlier specification or explicitly reapprove it.

## 13. Immediate next actions

1. Treat this as working consolidation, not implementation authorization.
2. Resolve the ten Product Owner decisions.
3. Produce complete screen-by-screen UI/UX specification for all four workspaces.
4. Produce canonical RBAC/permission and workflow matrices.
5. Produce detailed PostgreSQL ERD/data dictionary and provider adapter contract.
6. Produce versioned scoring specification with test vectors.
7. Independently inspect current repository read-only and map requirements to implemented/partial/missing/unverified.
8. Only then prepare implementation tickets and authorize implementation.

## 14. Change log

| Version | Date | Change |
|---|---|---|
| 1.0 | 14 Nov 2026 | Consolidated V3.1 baseline, later locked policy update, Claude and Argon reviews, conflicts, proposed architecture, roadmap and owner decisions. |

**End — TWM Master Decision Register v1.0**
