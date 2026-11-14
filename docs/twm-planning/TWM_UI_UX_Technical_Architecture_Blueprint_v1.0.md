# TWM UI/UX & Technical Architecture Blueprint
**Version:** 1.0  
**Prepared:** 14 November 2026  
**Status:** Planning blueprint — not implementation authorization  
**Depends on:** TWM Master Decision Register v1.0

---

## 1. Purpose and authority

This blueprint translates the current TWM product direction into a screen-level experience and an implementation-oriented technical architecture. It is intended to be the next planning artifact after the Master Decision Register.

It does **not** approve unresolved product decisions, authorize repository changes, or establish provider permissions. Where the current record conflicts or lacks evidence, this blueprint marks the item **UNRESOLVED**, **VALIDATION REQUIRED**, or **PROPOSED**.

### Authority order
1. Explicitly locked Product Owner decisions.
2. Latest approved TWM V3.1 requirements and subsequent explicit owner amendments.
3. Master Decision Register v1.0.
4. Claude and Argon reviews as independent recommendations/evidence, not approvals.
5. This blueprint's proposals, which require owner approval where they affect policy.

### Status vocabulary
- **LOCKED** — explicitly approved and must be preserved.
- **PROPOSED** — recommended design; not yet approved.
- **UNRESOLVED** — competing requirements or missing owner decision.
- **VALIDATION REQUIRED** — requires provider, repository, security, or operational evidence.
- **DEFERRED** — intentionally outside the initial release.
- **IMPLEMENTATION GAP** — required capability not yet verified in the repository.

---

## 2. Product boundary

TWM is a class-focused developer activity monitoring, analytics, and friendly competition platform.

### In scope
- Institutional identity and student onboarding.
- Student-owned provider account connections.
- Consent and privacy controls.
- Provider sync orchestration and provenance-aware telemetry.
- Personal activity analytics and historical views.
- Opt-in peer leaderboards and achievements, subject to approved scoring policy.
- Faculty cohort management, monitoring, review, and reporting.
- Scoped Coordinator assistance under Faculty supervision.
- Disputes, audit trails, and data-quality controls.
- Export and account/data lifecycle controls.

### Out of scope
- Code editor, online judge, assignment submission portal, or code hosting.
- Academic ERP, attendance system, or marks/grading system.
- Plagiarism detection, AI-code detection, or code-quality grading.
- Collection of private repository contents or provider passwords.
- Unauthorized scraping, CAPTCHA/WAF bypass, or circumvention of provider access controls.
- Manual screenshot submission as a routine data-collection mechanism.
- AI dependency for core authentication, syncing, scoring, or reporting.

### Core product principles
1. **Student-owned identity:** TWM identity is distinct from provider identity.
2. **Consent with meaningful controls:** connecting a provider and appearing on peer surfaces are separate concepts.
3. **Evidence before score:** every metric must retain provenance, coverage, and eligibility state.
4. **No silent inference:** missing provider data is not zero activity.
5. **Explainability:** students and Faculty can understand why a metric or score was produced.
6. **Fail closed:** uncertain permission, identity, or data quality must not be presented as verified.
7. **AI optional:** core workflows remain fully usable with AI disabled.

---

## 3. Roles and access model

### 3.1 Roles

| Role | Scope | Primary responsibility |
|---|---|---|
| Student | Own account and own provider data | Connect providers, control consent, view personal analytics, opt in/out, raise disputes |
| Coordinator | Explicitly granted cohort/task scope | Assist with roster review, sync operations, report viewing, and dispute triage |
| Faculty | Assigned cohort(s) | Manage cohorts, review roster corrections, make final cohort-level decisions, approve scoped Coordinator grants |
| Platform Admin | Institution/platform scope | Configure institution, provision Faculty, manage global policies and security settings |

**LOCKED:** Coordinators are student helpers with scoped, time-limited grants; they are not Platform Admin co-admins. Faculty are assigned cohorts. The user is the Platform Admin/product owner.

**UNRESOLVED:** The latest final-approval boundary for disputes and roster changes must be reconciled against DEC-04 and later governance updates. Until reconciled, the safe default is that Coordinators may recommend/triage but cannot commit final decisions; Faculty is the normal final reviewer, with Platform Admin involvement only where the governing policy explicitly permits it.

### 3.2 Permission matrix

| Capability | Student | Coordinator | Faculty | Platform Admin |
|---|---:|---:|---:|---:|
| View own profile/provider status | Yes | Own account only | No, unless assigned operational need | Limited support access, audited |
| View own raw/normalized activity | Yes | No by default | Assigned cohort, policy-limited | Audited support access |
| Connect/disconnect own provider | Yes | Own account only | No | No |
| Change own leaderboard opt-in | Yes | Own account only | No | No |
| View peer leaderboard | If opted-in and eligible | If separately eligible | Assigned cohort | Global aggregate only by default |
| View opted-out student's telemetry | No | No | Yes, if required for quorum/monitoring | Audited, need-to-know |
| Trigger own sync | Yes, subject to rate limit | Own account only | No | Operational controls only |
| Trigger cohort sync | No | Only with active grant | Yes | Yes |
| Request roster correction | Yes | Assist only if granted | Review/decide | Policy override only, audited |
| Finalize roster correction | No | No | Proposed normal authority | Only if policy permits |
| Raise/track dispute | Yes | Triage if granted | Final review under policy | Escalation/security role |
| Finalize score-affecting dispute | No | No | Proposed normal authority | Only if policy explicitly permits |
| Create/revoke Coordinator grant | No | No | Assigned cohort | Platform-wide policy/admin |
| Manage Faculty/cohort ownership | No | No | Assigned cohorts only | Yes |
| Change scoring policy | No | No | No | Yes, versioned and audited |
| View audit records | Own relevant actions | Scoped actions only | Assigned cohort actions | Platform-wide |

All permissions must be enforced server-side. Hiding a button is not authorization.

### 3.3 Coordinator grants

**PROPOSED grant model:** explicit, time-limited, cohort-scoped permissions:
- `VIEW_ROSTER`
- `VIEW_STUDENT_ACTIVITY`
- `VIEW_REPORTS`
- `TRIGGER_COHORT_SYNC`
- `ASSIST_ROSTER_REVIEW`
- `ASSIST_DISPUTE_TRIAGE`

Each grant records issuer, recipient, cohort, permission set, start/end time, reason, revocation time, and audit metadata. Grants should expire automatically. A Coordinator cannot approve their own recommendation or act on their own records where a conflict exists.

### 3.4 Self-affecting actions

**PROPOSED safeguard:** any Platform Admin action affecting their own identity, access, score, cohort membership, or dispute must require a neutral reviewer. If no neutral reviewer exists, block or defer the action rather than silently self-approve. Exact workflow requires Product Owner approval.

---

## 4. Information architecture and navigation

### 4.1 Route groups

Use Next.js App Router route groups, subject to repository version validation:

```text
app/
  (public)/
    page.tsx
    privacy/
    terms/
    help/
  (auth)/
    sign-in/
    verify-otp/
    bootstrap/
  (student)/
    dashboard/
    activity/
    analytics/
    leaderboard/
    achievements/
    providers/
    disputes/
    privacy/
    settings/
  (coordinator)/
    overview/
    cohorts/[cohortId]/
    roster/
    sync-operations/
    dispute-triage/
    reports/
  (faculty)/
    overview/
    cohorts/
    cohorts/[cohortId]/
    roster/
    students/[studentId]/
    analytics/
    disputes/
    reports/
    coordinators/
    audit/
  (platform-admin)/
    overview/
    institution/
    faculty/
    cohorts/
    policies/
    provider-health/
    security/
    audit/
```

Route names are a proposed information architecture, not a claim that these routes already exist.

### 4.2 Navigation rules
- Show only navigation items relevant to the authenticated role and active grants.
- Preserve a clear active cohort context for Faculty and Coordinators.
- Keep account/provider settings accessible from the user menu.
- Use breadcrumbs for nested cohort/student pages.
- Never expose hidden routes as a substitute for authorization checks.
- Archived cohorts are read-only for students and must not affect current standings (**LOCKED**).

---

## 5. Screen-by-screen UI/UX specification

Every data-driven screen must implement these states where applicable:
- Loading
- Empty / not connected
- Verified / current
- Stale / provisional
- Partial coverage
- Error / unavailable
- Restricted / opted out
- Archived / read-only

Do not display a zero value when the correct state is unknown or unavailable.

### 5.1 Public and authentication

#### Public landing page
**Purpose:** explain TWM without promising unsupported integrations.
- Product summary: Track. Win. Maintain.
- Explain that students connect their own developer accounts.
- Explain that provider data availability depends on provider support and authorization.
- Links: Privacy, Terms, Help, Contact.
- Avoid claims such as “real-time LeetCode sync” until formally verified.

#### Sign-in
- Institutional email input restricted to approved `@cit.edu.in` domain.
- OTP request with clear expiry/resend state and rate-limit feedback.
- Generic response that does not reveal whether an account exists.
- No session on delivery failure (**DEC-01 LOCKED**).
- Production OTP must use strict SMTP/transactional email API; no console OTP logging.

#### OTP verification
- Six-digit or provider-configured code input; exact length must match implementation.
- Paste support, keyboard navigation, accessible labels.
- Resend cooldown and attempt feedback.
- Expired/invalid code states.
- Server validates OTP, expiry, attempt limit, and delivery status.

#### Platform Admin bootstrap
- One-time bootstrap token, institutional OTP, and second factor (WebAuthn/TOTP) as proposed in the architecture baseline.
- Token is single-use and short-lived (15 minutes proposed).
- Fail closed if root Admin already exists, except a separately approved additional-admin flow.
- Immutable audit event for bootstrap.
- Exact factor combination and recovery procedure require security validation.

### 5.2 Student workspace

#### Student dashboard
**Primary question:** “What is my current activity status, and what needs attention?”
- Greeting and active academic cohort.
- Provider connection cards: GitHub, LeetCode, HackerRank (HackerRank optional).
- Sync freshness and coverage labels.
- Personal weekly activity summary.
- Consistency trend with formula/version disclosure.
- Personal score card only when score policy is approved and data-quality gates pass.
- Leaderboard position only when opted in and eligible.
- Recent verified activity feed with provider attribution.
- Alerts: reconnect required, stale snapshot, dispute update, consent incomplete.
- Never trigger provider sync merely because dashboard loads.

#### Activity timeline
- Chronological events or observations, grouped by provider-native calendar date where that is the source's actual day basis.
- Show source, event/observation timestamp, retrieval timestamp, verification state, and deduplication status.
- Distinguish event-level records from snapshot deltas.
- Filters: provider, date range, event type, verification state.
- If provider timestamps are unavailable, label as observation window rather than inventing event time.

#### Personal analytics
- Weekly and semester trends.
- Separate GitHub, LeetCode, HackerRank, and consistency panels.
- Explain metric definitions and scoring-policy version.
- Coverage indicator alongside every trend.
- No quality or mastery claims from raw activity volume.
- For cumulative provider counters, show “change since last successful observation” rather than asserting day-level activity.

#### Leaderboard
- Weekly Common and Semester Common surfaces only if the owner resolves the conflict with V3.1's initial disabled overall cross-platform leaderboard.
- Explicit opt-in state and privacy explanation.
- Students who opt out are absent from peer-facing rankings.
- Faculty quorum calculations may still include verified connected opted-out students, as locked in DEC-06.
- Provisional/final status, last reconciliation, score policy version, tie ranking.
- Rank sequence uses competition ranking: 1, 2, 2, 4.
- Do not expose raw private or unnecessary personal telemetry.
- Podium awards only after qualifying finalization; rules for zero-score eligibility remain unresolved.

#### Achievements
- Weekly Top 3 podium awards only for Weekly Common (**LOCKED**).
- Most Improved only if its baseline and eligibility rules are approved.
- Archived cohort achievements remain read-only and do not affect current standings (**LOCKED**).
- Each achievement includes period, policy version, award reason, and finalization status.

#### Provider connections
- Provider card shows connection state, verified account identity, last successful sync, scopes/permissions, and reconnect/disconnect controls.
- GitHub OAuth is compulsory in onboarding (**DEC-07 LOCKED**).
- LeetCode is intended to be compulsory, but production enforcement is conditional on Phase 0 proving a permitted reliable method (**DEC-08 LOCKED**).
- HackerRank is optional.
- Never request provider passwords.
- Clearly distinguish “account ownership verified” from “activity data available.”

#### Privacy and consent
- Separate consent for provider connection/data processing from peer leaderboard visibility.
- Show exactly which data categories are collected and why.
- Record consent version, timestamp, actor, and withdrawal.
- Explain that opting out of peer views does not necessarily remove telemetry needed for data-quality quorum, subject to the approved policy.
- Provide data export and account/deletion request path.
- Avoid dark patterns and preselected optional sharing.

#### Disputes
- Student can open a dispute against a specific observation, sync result, or score component.
- Require a concise reason and optional evidence attachment only if policy allows.
- Show status, reviewer role, timestamps, decision reason, and audit history.
- DEC-02: max two simultaneously open sync disputes per student per competition week; enforce server-side.
- DEC-02: one manual sync per student per 15 minutes; enforce server-side.
- Exact dispute deadlines and appeal process remain to be confirmed from authoritative requirements.

#### Settings
- Institutional profile fields and correction-request flow.
- Provider connection preferences.
- Notification preferences.
- Session/security settings.
- Data export and account lifecycle.
- Roster typo correction is non-blocking and audited (**DEC-03 LOCKED**).

### 5.3 Coordinator workspace

#### Coordinator overview
- Assigned cohorts and active grants.
- Pending tasks: roster assistance, sync failures, dispute triage.
- Grant expiry and scope visible at all times.
- No global student search unless specifically granted.

#### Cohort roster
- Only permitted fields for the active grant.
- Search/filter within authorized cohort.
- No bulk export unless a separate permission explicitly permits it.
- Student detail access is logged.

#### Sync operations
- Cohort sync trigger only with `TRIGGER_COHORT_SYNC`.
- Display queued/running/succeeded/failed/partial states.
- Never expose provider secrets or raw credentials.
- Rate limits and provider concurrency controls enforced server-side.
- No ability to alter scores or fabricate successful sync state.

#### Dispute triage
- View only assigned cohort disputes with `ASSIST_DISPUTE_TRIAGE`.
- Add triage notes and recommendation.
- Cannot make final score-affecting decision.
- Self-review and conflict-of-interest checks required.

#### Reports
- View/download only within grant scope.
- Export actions logged.
- Minimize personally identifying fields.

### 5.4 Faculty workspace

#### Faculty overview
- Assigned cohorts, active competition period, sync/data-quality status.
- Cohort quorum and provider coverage.
- Pending roster corrections, disputes, and Coordinator grants.
- Clear distinction between operational alerts and performance metrics.

#### Cohort management
- Create/edit assigned cohorts within permitted institutional policy.
- Manage cohort dates, academic period, membership, and archive state.
- Validate student membership uniqueness and effective dates.
- Archived cohort is read-only for student history.

#### Roster and import
- CSV/template import with preview, validation, duplicate detection, and row-level errors.
- No silent overwrite of verified identity.
- Roster typo correction queue with before/after values and audit trail.
- Coordinator may assist only with an explicit grant.

#### Student detail
- Cohort-relevant activity and data coverage.
- Provider connection/verification state.
- Opt-in status as necessary for peer visibility administration.
- Disputes and relevant audit trail.
- Avoid exposing secrets, private repository contents, or unrelated personal data.

#### Analytics
- Cohort-level trends and distributions.
- Coverage and missingness must accompany score charts.
- Separate activity volume from normalized score.
- Provide downloadable report with generation time, filters, policy version, and data-quality notes.

#### Disputes
- Faculty review queue with evidence/provenance.
- Final decision reason mandatory.
- Conflict-of-interest guard.
- Decision must create immutable audit event and trigger recalculation where appropriate.
- Exact final authority must be reconciled with DEC-04.

#### Coordinator management
- Create scoped, time-limited grants.
- Select only necessary permissions.
- Set expiry and reason.
- Revoke immediately.
- View grant usage/audit trail.

#### Reports
- Cohort snapshot, activity trends, provider coverage, leaderboard outcomes, award register, disputes, and roster changes.
- Export format and data minimization policy require approval.
- Reports must be reproducible from a defined period and policy version.

### 5.5 Platform Admin workspace

#### Admin overview
- Platform health, email delivery, provider health, worker queue, failed jobs, security alerts.
- No unnecessary student-level browsing on the landing screen.
- Critical operational alerts prioritized.

#### Institution settings
- Approved email domains (`@cit.edu.in` locked).
- Contact address `twm.platform@gmail.com`.
- Email provider configuration status.
- Institution metadata and academic calendar.

#### Faculty and cohort provisioning
- Provision Faculty and assign cohort ownership.
- Manage global cohort constraints.
- Changes audited and reversible where safe.

#### Scoring policy
- Versioned policy editor with draft → validation → approval → effective date lifecycle.
- Immutable historical policy versions.
- Test vectors and preview before activation.
- Policy changes never rewrite finalized historical scores silently.

#### Provider health
- Adapter status, rate-limit state, last success, error categories, coverage metrics.
- No display of tokens or sensitive payloads.
- Provider permission status documented separately from technical availability.

#### Security and audit
- Admin action audit, session revocation, access review, secret/key rotation status.
- Sensitive actions require re-authentication.
- Self-affecting action firewall proposed; exact neutral-review workflow unresolved.

---

## 6. UX system and visual language

### 6.1 Visual direction
Premium SaaS dark Obsidian interface.

| Token | Value | Use |
|---|---|---|
| Background | `#07090E` | App canvas |
| Surface 1 | `#0D111A` | Cards/panels |
| Surface 2 | `#131926` | Elevated surfaces |
| Violet | `#8B5CF6` | Primary accent |
| Blue | `#3B82F6` | Interactive/analytics |
| Cyan | `#06B6D4` | Secondary accent |
| Verified | Emerald | Verified state |
| Provisional | Amber | Incomplete/stale state |
| Danger | Red | Blocking/error state |
| Neutral | Slate | Informational state |

Typography: Sora for interface headings/body and JetBrains Mono for identifiers, metrics, and technical values.

### 6.2 Component patterns
- Provider connection card.
- Metric card with definition tooltip and coverage label.
- Data freshness/provenance badge.
- Score breakdown drawer.
- Activity timeline row.
- Leaderboard row with privacy-safe identity.
- Empty-state panel with a meaningful next action.
- Review queue item with status and audit history.
- Confirmation dialog for destructive or irreversible actions.
- Toasts for transient feedback; persistent alerts for unresolved operational issues.

### 6.3 Accessibility and responsive behavior
- WCAG 2.2 AA target (VALIDATION REQUIRED).
- Keyboard-operable navigation and controls.
- Visible focus states and semantic labels.
- Do not rely on color alone for verified/provisional/error.
- Respect OS reduced-motion preference.
- Responsive layouts: desktop-first Faculty/Admin tables; mobile-first Student dashboard and provider connection flows.
- Tables need a usable mobile alternative; avoid horizontal overflow as the only interaction.

---

## 7. Canonical data flow

```text
Provider / Institutional Identity
            |
            v
     Provider Adapter
            |
            v
  Raw Observation / Event
            |
            v
 Validation + Ownership + Deduplication
            |
            v
 Canonical Telemetry Envelope
            |
            v
 Coverage / Eligibility Evaluation
            |
            v
 Deterministic Metric & Score Engine
            |
            v
 Versioned Aggregates / Leaderboard
            |
            v
 Student / Coordinator / Faculty UI
```

Every transition should be observable, idempotent, and auditable. A failed stage must not be silently treated as zero activity.

### 7.1 Canonical telemetry envelope

**PROPOSED logical shape:**

```ts
type TelemetryEnvelope = {
  id: string;
  institutionId: string;
  studentId: string;
  provider: "github" | "leetcode" | "hackerrank";
  providerAccountId: string;
  observationMode: "event" | "snapshot" | "snapshot_delta";
  sourceEventId?: string;
  sourceTimestamp?: string;
  observedAt: string;
  retrievedAt: string;
  coverageStart?: string;
  coverageEnd?: string;
  providerTimezoneBasis?: string;
  payloadVersion: string;
  normalizedType: string;
  normalizedValue: Record<string, unknown>;
  ownershipState: "verified" | "unverified" | "revoked";
  validationState: "valid" | "partial" | "invalid";
  eligibilityState: "eligible" | "ineligible" | "pending";
  exclusionReason?: string;
  deduplicationKey: string;
};
```

Do not store arbitrary provider payload indefinitely by default. Define field allowlists and retention for raw observations after the privacy/retention policy is approved.

### 7.2 Provider adapter contract

```ts
interface ProviderAdapter {
  provider: "github" | "leetcode" | "hackerrank";

  beginAuthorization?(input: AuthorizationInput): Promise<AuthorizationStart>;
  completeAuthorization?(input: AuthorizationCallback): Promise<VerifiedAccount>;
  verifyOwnership(input: OwnershipInput): Promise<OwnershipResult>;

  fetchObservations(input: FetchInput): Promise<FetchResult>;
  normalize(input: ProviderObservation): TelemetryEnvelope[];

  getCapabilities(): ProviderCapabilities;
  healthCheck(): Promise<ProviderHealth>;
}
```

Adapter contract requirements:
- Capability declaration: ownership verification, event history, snapshots, pagination, timestamps, rate limits, webhooks.
- Provider-specific errors mapped to canonical error categories.
- Explicit `coverageStart` and `coverageEnd`.
- Cursor-based pagination where supported.
- No assumption that an endpoint returns complete history.
- No adapter may claim “verified” unless ownership evidence passes.
- No provider integration may enter production without permission review and reliability validation.

### 7.3 Provider status

| Provider | Product role | Current disposition |
|---|---|---|
| GitHub | Core provider | Conditional GO; validate OAuth scopes, attribution, API limits, history, timestamps, and token policy |
| LeetCode | Intended core provider | Production NO-GO until permitted, reliable method is proven; compulsory onboarding enforcement conditional under DEC-08 |
| HackerRank | Optional provider | NO-GO pending written permission/official data access; not part of Weekly Common |
| Codeforces | Not in current cohort baseline | Do not add without Product Owner approval; classmates' current platform usage does not justify scope expansion |

A technical endpoint or third-party wrapper does not establish permission to use it.

---

## 8. Proposed logical data model

This is a conceptual model, not a migration specification. Names and relationships must be reconciled with the repository and approved retention policy before implementation.

| Entity | Purpose | Important fields / relationships |
|---|---|---|
| `Institution` | Institution configuration | id, name, allowedDomains, timezone |
| `User` | TWM identity | id, institutionalEmail, status, createdAt |
| `RoleAssignment` | Role and scope | userId, role, cohortId nullable, effective dates |
| `StudentProfile` | Student-specific identity | userId, roster identifiers, correction status |
| `FacultyProfile` | Faculty identity | userId |
| `Cohort` | Class/academic group | id, name, academicPeriod, status |
| `CohortMembership` | Student membership history | cohortId, studentId, start/end dates, state |
| `CoordinatorGrant` | Scoped temporary permissions | coordinatorId, facultyId, cohortId, permissions, expiry, revokedAt |
| `ProviderAccount` | Connected provider identity | studentId, provider, externalAccountId, username, status |
| `ProviderCredential` | Encrypted minimal token/credential | providerAccountId, ciphertext, keyVersion, scopes, expiry |
| `ConsentRecord` | Consent ledger | studentId, consentType, version, grantedAt, withdrawnAt |
| `SyncJob` | Durable sync work | providerAccountId, status, cursor, attempts, lease, scheduledAt |
| `SyncAttempt` | Individual attempt history | jobId, startedAt, finishedAt, result, errorCode |
| `RawObservation` | Retained source observation | provider, source id, timestamps, payload reference, retentionUntil |
| `TelemetryEvent` | Canonical normalized activity | envelope fields, deduplicationKey, eligibility |
| `CoverageWindow` | Data completeness evidence | providerAccountId, start/end, coverage %, gaps |
| `MetricSnapshot` | Computed metric values | studentId, period, metric, value, policyVersion |
| `ScoreSnapshot` | Reproducible score | studentId, period, components, total, policyVersion, state |
| `LeaderboardSnapshot` | Final/provisional ranking | cohortId, period, rank, scoreSnapshotId, state |
| `Achievement` | Award record | studentId, type, period, policyVersion, finalizedAt |
| `Dispute` | Student challenge | studentId, targetRef, reason, state, reviewer, decision |
| `AuditEvent` | Immutable audit trail | actor, action, target, before/after, timestamp, requestId |
| `Notification` | User notification ledger | recipient, type, payload, delivery state |
| `Session` | Server-side session | userId, token hash, expiry, revokedAt |
| `OtpChallenge` | OTP lifecycle | email, code hash, expiry, attempts, delivery state |

### 8.1 Data integrity requirements
- Unique provider account identity per provider and external account ID.
- Unique deduplication key per normalized source event/observation.
- Referential integrity for cohort membership, grants, scores, and disputes.
- Effective-dated membership to preserve historical cohort context.
- Score snapshots immutable after finalization; corrections create a superseding version with audit trail.
- Store timestamps in UTC; render institution-local time using `Asia/Kolkata`.
- Provider-native date buckets remain labeled as provider-native; do not relabel as IST days without evidence.

### 8.2 Retention — unresolved
Two conflicting retention proposals exist in the current project record:
- Earlier V3.1 proposal: activity for five academic years, raw payloads seven days, security/admin audit two years, backups 30 days.
- Later proposal: cohort membership/standings/achievements seven years, raw events/snapshots two years, security/admin audit seven years, operational logs 90 days, backups 90 days.

**UNRESOLVED:** Do not implement retention jobs until a single approved schedule defines data categories, legal/academic rationale, deletion behavior, backup expiry, and student deletion exceptions.

---

## 9. Sync and job orchestration

### 9.1 Job lifecycle
`QUEUED → LEASED → RUNNING → SUCCEEDED | PARTIAL | RETRYABLE_FAILED | TERMINAL_FAILED | CANCELLED`

Requirements:
- Durable database-backed queue is the initial preferred direction.
- Use `SELECT ... FOR UPDATE SKIP LOCKED` or equivalent safe claiming strategy, subject to database validation.
- Leases prevent permanently stuck jobs.
- Idempotency keys prevent duplicate processing.
- Bounded retries with exponential backoff and jitter.
- Provider-specific rate limits and per-user concurrency.
- Persist cursors and coverage windows.
- Separate user-triggered sync from scheduled sync.
- Dashboard reads must not enqueue sync jobs.
- Monitor queue age, retry count, failure rate, and provider throttling.

### 9.2 Locked rate controls
- One manual sync per student per 15 minutes (**DEC-02 LOCKED**).
- Maximum two simultaneously open sync disputes per student per competition week (**DEC-02 LOCKED**).
- Server-side enforcement; client-side cooldown is only UX feedback.

### 9.3 Sync outcome semantics
- `SUCCEEDED`: requested scope completed and validated.
- `PARTIAL`: some data retrieved, but coverage gaps remain.
- `RETRYABLE_FAILED`: transient provider/network/rate-limit error.
- `TERMINAL_FAILED`: permission, identity, unsupported capability, or unrecoverable error.
- `CANCELLED`: intentionally stopped.
- “No activity” is a validated result only when the provider query coverage is sufficient to support it.

---

## 10. Identity, authentication, and security architecture

### 10.1 Identity separation
- Institutional identity authenticates the person to TWM.
- Provider identity proves control of a developer account.
- Store immutable provider external IDs; usernames are mutable display attributes.
- Account ownership proof must be distinct from data-fetch capability.

### 10.2 Authentication baseline
- Institutional domain `@cit.edu.in` (**LOCKED**).
- OTP delivery failure must not create a session (**DEC-01 LOCKED**).
- Production email delivery requires strict SMTP/transactional API; no production console OTP logging.
- Proposed session design: short-lived signed access token plus opaque DB-backed session, refresh rotation/reuse detection, family revocation; default browser session 12 hours; optional 30-day session unchecked by default. These session values require security approval/validation.
- CSRF protection for state-changing cookie-authenticated operations.
- OAuth state and PKCE where supported.
- Re-authentication for sensitive actions.

### 10.3 Provider credential protection
- Least privilege.
- Encrypt tokens at rest using authenticated encryption (AES-256-GCM proposed).
- Unique nonce/IV per encryption.
- Store key version and support rotation.
- Never log tokens or authorization codes.
- Define revocation and deletion on disconnect.
- **UNRESOLVED:** GitHub token retention after ownership verification. Claude recommends discard after proof; Argon recommends retaining minimal-scope token for user-specific rate budget and GraphQL viewer queries. Validate actual API needs and scopes before deciding.

### 10.4 Security controls
- Server-side RBAC and cohort ownership checks.
- Input validation and output encoding.
- Secure, HttpOnly, SameSite cookies.
- HTTPS only.
- Rate limits for OTP, sync, disputes, and sensitive endpoints.
- Audit privileged access and exports.
- Secret management outside source control.
- Dependency and vulnerability scanning.
- Backup restore drills.
- No sensitive data in application logs.
- Security review before production launch.

---

## 11. API boundary and service modules

Modular monolith is the initial architecture direction. Avoid premature microservices.

### 11.1 Suggested modules
- `auth`
- `identity`
- `users`
- `institutions`
- `cohorts`
- `memberships`
- `roles-and-grants`
- `providers`
- `consent`
- `sync`
- `telemetry`
- `coverage`
- `metrics`
- `scoring`
- `leaderboards`
- `achievements`
- `disputes`
- `reports`
- `notifications`
- `audit`
- `admin`
- `security`

### 11.2 API design rules
- Derive actor identity and role from server-validated session; never trust client-supplied `userId`, role, reviewer, or cohort ownership.
- Use resource-oriented routes and consistent response envelopes.
- Validate query/body schemas at boundaries.
- Apply authorization at service/action level, not only middleware.
- Use idempotency keys for job creation and sensitive mutations.
- Return explicit states (`partial`, `stale`, `provisional`, `restricted`) rather than overloading HTTP success/failure.
- Paginate large activity and audit collections.
- Version externally consumed contracts.
- Avoid returning raw provider payloads to browser clients.

### 11.3 Example API surface (proposed)
```text
POST   /api/auth/otp/request
POST   /api/auth/otp/verify
POST   /api/auth/logout
GET    /api/me
GET    /api/me/providers
POST   /api/providers/github/connect
GET    /api/providers/github/callback
DELETE /api/providers/:provider/connection
POST   /api/me/sync
GET    /api/me/activity
GET    /api/me/analytics
GET    /api/leaderboards/weekly
GET    /api/leaderboards/semester
POST   /api/me/leaderboard-consent
POST   /api/me/disputes
GET    /api/me/disputes
GET    /api/faculty/cohorts
GET    /api/faculty/cohorts/:cohortId/roster
POST   /api/faculty/cohorts/:cohortId/sync
GET    /api/faculty/disputes
POST   /api/faculty/disputes/:disputeId/decision
POST   /api/faculty/cohorts/:cohortId/coordinator-grants
DELETE /api/coordinator-grants/:grantId
GET    /api/admin/provider-health
GET    /api/admin/audit
POST   /api/admin/scoring-policies
```
This is a conceptual route inventory; it must be reconciled with existing repository routes and naming conventions before implementation.

---

## 12. Deterministic scoring and competition engine

### 12.1 Current scoring baseline (not fully reconciled)
The later project baseline records:
- Weekly Common: GitHub 40%, LeetCode 40%, Consistency 20%.
- Semester Common: GitHub 40%, LeetCode 40%, Consistency 15%, HackerRank 5%.
- `S_GH` and `S_LC` each normalized to `[0,100]`.
- Weekly GitHub target cap `T_week_GH = 36`.
- Weekly LeetCode target cap `T_week_LC = 35`.
- `S_Cons = min(ActiveDays / 5, 1) × 100` in one later formula.
- Weekly Common: `round(4*S_GH + 4*S_LC + 2*S_Cons)`.
- Semester two-provider and three-provider formulas as documented in the Master Decision Register.

### 12.2 Conflicts requiring owner decision
- V3.1 initially disabled overall cross-platform leaderboard; later formulas introduce Weekly/Semester Common leaderboards.
- V3.1 consistency formula used qualifying active days divided by eligible observed days, with at least 90% date-level retrieval coverage for finalized GitHub consistency; later formula uses five active days.
- Raw point conversions (GitHub commit/collaboration points and LeetCode difficulty points) need authoritative source confirmation.
- Missing provider data, partial onboarding, provider outage, and zero-activity semantics need a single policy.
- Zero-score podium eligibility and exam/holiday week handling are proposals, not approved rules.
- Rounding, tie, and score version behavior must be specified in test vectors.

### 12.3 Required scoring engine properties
- Pure deterministic functions with no provider/network calls.
- Versioned policy configuration.
- Input validation and explicit missing-data states.
- Reproducible score snapshots.
- Unit tests for boundaries, caps, rounding, ties, missing providers, and partial coverage.
- Explainable component breakdown for every displayed score.
- Finalized historical score is immutable; correction creates a new audited version.

### 12.4 Data-quality gates
Current Monday workflow:
- Monday 00:00–06:00 IST: target reconciliation window, not unconditional finalization.
- 06:00–18:00 IST: review window.
- 18:00 IST: conditional finalization only if gates pass.
- Gates include zero stuck compulsory-provider jobs from before close, quorum at least 70%, and zero unresolved score-affecting disputes.
- Quorum includes verified connected students who opted out and verified zero-activity students; opted-out users remain absent from peer views.
- Weekly Top 3 awards only after finalization.

**UNRESOLVED:** whether any one student's unresolved issue should hold only that student's score/award or the whole cohort. Claude/Argon recommend per-student provisional holds to avoid cohort-wide veto; this is a recommendation requiring owner approval.

---

## 13. Reporting, notifications, and audit

### 13.1 Reports
Every report should include:
- Cohort and period.
- Generation timestamp and timezone.
- Filters and included population.
- Provider coverage and missingness.
- Scoring-policy version.
- Provisional/final status.
- Definitions and caveats.
- Export actor and audit reference.

### 13.2 Notifications
**PROPOSED notification events:**
- OTP delivery and security events.
- Provider connection/revocation.
- Sync success requiring attention, partial sync, or terminal failure.
- Dispute state change.
- Roster correction state change.
- Coordinator grant issued/expiring/revoked.
- Leaderboard finalization and achievement issuance.
- Security/session revocation.

Notification channels and user preference defaults require approval. Email delivery must use the approved email provider abstraction; do not rely on an unverified Gmail SMTP bridge for production.

### 13.3 Audit
Audit at minimum:
- Authentication/security events.
- Provider connection/disconnection and consent changes.
- Roster before/after correction.
- Coordinator grant lifecycle and use.
- Sync triggers and privileged sync operations.
- Dispute decisions.
- Score policy changes and finalization.
- Report exports and sensitive record access.
- Admin configuration changes.

Audit records should be append-only at the application level and protected from ordinary mutation. Retention remains unresolved.

---

## 14. Deployment and operations

### 14.1 Initial deployment direction
- Railway is the initial hosting direction (**planning baseline**, validate production suitability).
- PostgreSQL is the preferred production database.
- Next.js App Router / TypeScript modular monolith, subject to actual repository version audit.
- Durable worker process for scheduled and queued sync jobs.
- Separate development, staging, and production environments.
- No secrets in repository or build artifacts.

### 14.2 Operational requirements
- Structured logs with request/job correlation IDs.
- Metrics: job queue depth/age, sync success/partial/failure, provider latency, rate-limit events, OTP delivery failures, API latency, database health.
- Alerting for stuck jobs, provider-wide failures, email delivery failures, and backup failures.
- Health/readiness endpoints.
- Database migration backup and rollback plan.
- Restore test before production launch.
- Documented incident response and provider outage behavior.

### 14.3 Cost and scale posture
Start with a modular monolith and database-backed queue. Do not add Redis, vector databases, or microservices without measured need. Capacity planning must use expected cohort size, provider quotas, sync cadence, and retention volume rather than guessed traffic assumptions.

---

## 15. Delivery phases and acceptance gates

### Phase 0 — feasibility and decision closure
**Goal:** prevent architecture being built around unsupported provider assumptions.
- Validate GitHub API fields/scopes, rate limits, attribution, history, timestamps, and token retention.
- Obtain written LeetCode permission or document a permitted reliable route; otherwise keep production integration blocked and seek owner decision on onboarding fallback.
- Obtain written HackerRank permission/official access; otherwise keep optional integration disabled.
- Resolve scoring conflicts and retention schedule.
- Approve consent ledger and Coordinator privacy boundary.
- Validate email provider and domain constraints.
- Reconcile current repository facts through read-only audit.

**Exit gate:** written evidence and explicit owner decisions for every production dependency.

### Phase 1 — foundation
- Institutional auth and OTP.
- User/role/cohort model.
- RBAC and audit foundation.
- Consent ledger.
- Provider account abstraction.
- Core design system and route shells.

**Exit gate:** security-tested auth, role isolation, and audit coverage.

### Phase 2 — GitHub-first provider foundation
- GitHub OAuth and ownership proof.
- Adapter and canonical telemetry.
- Durable sync queue.
- Coverage and provenance.
- Student provider/activity UI.

**Exit gate:** verified, reproducible GitHub observations under approved scopes and quotas.

### Phase 3 — personal analytics
- Deterministic metrics.
- Coverage-aware analytics.
- Personal history and exports.
- Sync/dispute workflows.

**Exit gate:** metric definitions and test vectors approved; no fabricated zeroes.

### Phase 4 — cohort and Faculty operations
- Cohort management and roster import.
- Faculty dashboards and reports.
- Coordinator grants and scoped workspace.
- Review queues and audit.

**Exit gate:** RBAC tests pass for every role and grant boundary.

### Phase 5 — competition (conditional)
- Finalized scoring policy.
- Leaderboard opt-in.
- Provisional/final lifecycle.
- Quorum and data-quality gates.
- Achievements and award acknowledgement.

**Exit gate:** unresolved scoring and governance decisions closed; replayable test fixtures pass.

### Phase 6 — optional provider expansion
- LeetCode/HackerRank only after written permission and reliability proof.
- No automatic substitution with unofficial scraping.

**Exit gate:** legal/terms review, security review, completeness/coverage validation, and owner approval.

### Phase 7 — production hardening and pilot
- Load/security testing.
- Backup restore drill.
- Monitoring and incident runbooks.
- Accessibility review.
- Pilot cohort acceptance and rollback plan.

**Exit gate:** production acceptance checklist signed by Product Owner and responsible operators.

---

## 16. Testing strategy

### 16.1 Automated tests
- Unit: scoring, normalization, eligibility, coverage, deduplication, permissions.
- Integration: OAuth callbacks, OTP delivery failure, job leases, provider pagination, DB transactions.
- Contract: adapter capability and normalized envelope conformance.
- End-to-end: student onboarding, provider connect, sync, opt-out, dispute, Faculty review, grant expiry.
- Security: IDOR, privilege escalation, CSRF, session reuse, OAuth state, rate-limit bypass.
- Accessibility: keyboard, focus, contrast, screen reader semantics.
- Recovery: worker crash/retry, database restore, provider outage.

### 16.2 Required test scenarios
1. Student A cannot access Student B's activity or disputes.
2. Coordinator cannot access a cohort without an active grant.
3. Expired/revoked grant immediately blocks access.
4. Coordinator cannot finalize a dispute or approve own recommendation.
5. Opted-out student is absent from peer leaderboard but included in quorum if DEC-06 conditions hold.
6. Verified zero-activity student is not confused with missing data.
7. Partial provider coverage produces provisional/partial state, not a false zero.
8. Duplicate provider events do not inflate metrics.
9. Provider-native date buckets are not silently converted to IST activity days.
10. OTP delivery failure creates no authenticated session.
11. Manual sync within 15 minutes is rejected server-side.
12. Third open sync dispute in the same competition week is rejected server-side.
13. Finalized score can be reproduced from immutable input/policy versions.
14. Score correction creates an auditable superseding version.
15. Archived cohort history is read-only and excluded from current standings.

---

## 17. Repository audit and implementation-gap protocol

Reviewer reports about the `twm-3` repository are not equivalent to an independent repository audit. Before implementation:
- Obtain the exact repository snapshot/commit or authorized read-only connector access.
- Record commit SHA and audit date.
- Inventory routes, components, API handlers, database schema, migrations, auth, dependencies, tests, environment variables, and deployment configuration.
- Reconcile actual framework/runtime versions.
- Identify mock data, client-trusted identity, unprotected endpoints, inline schema creation, and SQLite/PostgreSQL mismatch claims.
- Map every required screen and service module to existing code.
- Classify each item as present, partial, missing, unsafe, or unverified.
- Produce a migration plan before changing persistence.
- Do not claim a file or endpoint exists based only on a reviewer summary.

No repository changes are authorized by this blueprint.

---

## 18. Product Owner decisions still required

These decisions block final implementation specifications:

1. **Leaderboard scope:** approve or reject Weekly Common and Semester Common in light of V3.1's initial disabled cross-platform leaderboard.
2. **LeetCode onboarding fallback:** if Phase 0 cannot prove permitted reliable access, should onboarding downgrade, pause, or use another owner-approved approach?
3. **Consistency formula:** five-active-days formula or observed-days/coverage formula?
4. **Raw scoring units:** confirm authoritative GitHub and LeetCode point conversions and caps.
5. **Missing data:** define behavior for provider outages, incomplete onboarding, partial coverage, and verified zero activity.
6. **Finalization hold:** cohort-wide hold or per-student provisional hold for unresolved score-affecting issues?
7. **Podium eligibility:** can a zero-score student receive a weekly podium award?
8. **Exam/holiday weeks:** normal scoring, adjusted weights, pause, or optional practice?
9. **Retention:** select and justify one schedule across activity, raw payloads, audit, logs, and backups.
10. **GitHub token policy:** discard after ownership proof or retain minimal encrypted token for documented API needs?
11. **Decision authority:** reconcile DEC-04 final approval language with later Faculty-only governance.
12. **Self-affecting Admin action:** approve neutral reviewer workflow or block/defer policy.
13. **Email delivery:** confirm production email provider/domain setup and sender verification.
14. **Session policy:** approve session duration, refresh rotation, and recovery controls.
15. **Report/export policy:** approve formats, fields, and access/retention rules.

---

## 19. Immediate next actions

1. Treat the Master Decision Register v1.0 as the decision index; update it when an owner decision is made.
2. Close Phase 0 provider and policy questions before building score-dependent functionality.
3. Perform a read-only repository audit against the exact current commit.
4. Approve the screen inventory and role/permission matrix.
5. Approve retention, consent, and audit policy before writing migrations.
6. Build the GitHub-first foundation only after the Phase 0 gate passes.
7. Keep LeetCode/HackerRank production integrations disabled unless permission and reliable coverage are evidenced.
8. Do not begin destructive schema changes, deployment, or credential setup without explicit authorization.

---

## Appendix A — terminology

| Term | Meaning |
|---|---|
| Provider account | External developer-platform account linked by a student |
| Ownership verification | Evidence that the student controls the external account |
| Observation | Data returned by a provider at a retrieval time |
| Event | Provider record with its own source event identity/time |
| Snapshot delta | Difference between two observations; not necessarily day-attributed |
| Coverage window | Time interval for which retrieval completeness is evidenced |
| Provisional | Not yet eligible for final publication due to a defined gate |
| Finalized | Passed approved data-quality and governance gates |
| Peer visibility | Whether a student's data appears in student-facing shared surfaces |
| Quorum | Data-quality population used to decide whether a competition period can finalize |

## Appendix B — explicit non-assumptions

This blueprint does not assume:
- LeetCode or HackerRank grants a public API or permits automated collection.
- A third-party wrapper is authorized or complete.
- Provider-native daily buckets are IST days.
- Snapshot deltas establish exact event dates.
- A successful OAuth flow proves activity-data access.
- A connected account necessarily has activity during the period.
- A missing record means zero activity.
- The existing repository matches either reviewer report.
- Proposed retention, scoring, session, or self-review rules are already approved.
