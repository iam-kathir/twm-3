# TWM V3.1 — Product Owner Decision Pack
**Version:** 1.0 | **Prepared:** 14 November 2026  
**Purpose:** Resolve product-policy decisions that block implementation  
**Status:** Decision proposals — nothing in this document is approved until the Product Owner explicitly confirms it.

## 1. How to use this pack

This is not another architecture document. It is a decision register for the few policy choices that implementation must not guess.

For each decision:
- **Current known position** summarizes existing TWM context.
- **Conflict / impact** explains why a choice is required.
- **Options** describe viable directions.
- **Suggested default** is a recommendation, not an approved decision.
- **Decision status** remains OPEN until explicitly confirmed.

Antirasti may prepare evidence and impact analysis. It must not silently choose a policy.

## 2. Decisions that block scoring and leaderboard publication

### PO-01 — Competition model
**Status:** OPEN — critical

**Current known position**
- Earlier V3.1 scope disabled an overall cross-platform leaderboard initially.
- Later planning records define Weekly Common and Semester Common weighted scores.
- Weekly Common weights recorded later: GitHub 40%, LeetCode 40%, Consistency 20%.
- Semester Common weights recorded later: GitHub 40%, LeetCode 40%, Consistency 15%, HackerRank 5%.
- These later formulas conflict with the earlier independent-provider / no-aggregate baseline.

**Options**
- A. Keep provider-specific boards only; no cross-platform Common leaderboard.
- B. Adopt Weekly Common and Semester Common as the official competition model.
- C. Pilot GitHub-only standings first; defer Common scoring until provider permission and policy are settled.

**Suggested default:** C for the first class pilot. It avoids publishing a score whose required LeetCode data source is not currently cleared for production use.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-02 — Consistency formula
**Status:** OPEN — critical

**Conflicting definitions**
- Later planning formula: `min(ActiveDays / 5, 1) × 100`.
- Earlier V3.1 formula: `qualifying_active_days / eligible_observed_days × 100`, with a separate ≥90% date-level retrieval coverage condition for finalized GitHub consistency.
- Coverage is data quality, not activity.

**Options**
- A. Five-active-days target formula.
- B. Observed-days ratio with a coverage gate.
- C. Define provider-specific consistency separately and do not combine until day semantics are proven.

**Suggested default:** C until provider calendar-day semantics and coverage are validated. Do not convert missing observations into inactive days.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-03 — Raw point conversions
**Status:** OPEN — critical

**Unconfirmed earlier proposals**
- GitHub: 3 points per qualifying public commit, capped at 12 commit points/day.
- Collaboration: 4 points per qualifying merged PR, substantive review, or linked issue, capped at 12 collaboration points/week.
- Weekly GitHub target cap: 36.
- LeetCode: Easy 2, Medium 5, Hard 10; weekly target cap 35.

These values appear in reviewer/planning context but are not established here as approved locked rules.

**Options**
- A. Confirm the proposed point values after validation.
- B. Rework the values using a documented calibration dataset and anti-gaming review.
- C. Defer raw scoring; show verified activity counts without points.

**Suggested default:** C for pilot unless the point model has already been approved in the authoritative V3.1 source.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-04 — Missing provider and partial onboarding
**Status:** OPEN — critical

**Problem**
A student may have a connected GitHub account but no permitted/verified LeetCode or HackerRank telemetry. Missing data is not equivalent to zero activity.

**Options**
- A. No aggregate score unless all compulsory providers are valid.
- B. Provider-specific scores only; no aggregate comparison.
- C. GitHub-only pilot score/analytics, with explicit label and no claim of cross-platform comparability.

**Suggested default:** C for pilot. If the product requires LeetCode for Common scoring, keep that leaderboard disabled until a permitted reliable collection method exists and the owner approves the fallback.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-05 — Finalization holds
**Status:** OPEN — critical

**Current recorded gates**
- Monday 00:00–06:00 IST: target reconciliation window.
- 06:00–18:00 IST: review window.
- 18:00 IST: conditional finalization.
- Existing gates: zero stuck compulsory-provider jobs from before close; quorum ≥70%; zero unresolved score-affecting disputes.
- Claude recommended per-student provisional holds to avoid a single student's issue blocking the entire cohort. This is advisory, not approved.

**Options**
- A. Cohort-wide hold if any score-affecting issue remains.
- B. Per-student provisional hold; finalize unaffected students/cohort ranking only under a clearly defined rule.
- C. Hybrid: global data-quality gates plus per-student holds for individual disputes.

**Suggested default:** C, provided ranking and awards cannot misrepresent unresolved records. Specify whether held students are omitted, shown provisional, or ranked provisionally.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-06 — Zero-score podium eligibility
**Status:** OPEN

**Options**
- A. A zero-score student can receive a podium place if ranked highest among eligible students.
- B. Podium requires a positive finalized score.
- C. No podium if all eligible scores are zero.

**Suggested default:** C, with an explicit published “no qualifying podium” outcome when everyone has zero. Confirm how this interacts with ties and absences.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-07 — Exam and holiday weeks
**Status:** OPEN

**Options**
- A. Competition continues normally.
- B. Week is excluded from season totals and awards.
- C. Week is designated practice-only; no competitive awards.
- D. Owner may mark an institution calendar exception before the week begins.

**Suggested default:** D with an explicit calendar and advance notice. Do not silently alter a week after seeing its scores.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-08 — Ties, rounding, and ranking
**Status:** OPEN

**Known recorded rule:** competition ranking `1, 2, 2, 4`; alphabetical display must not alter rank.

**Choices still required**
- Round component scores or only final score?
- Decimal precision for stored values and displayed values?
- Tie-breakers, if any, or shared ranks only?
- Does podium award multiple students for a tie at rank 3?
- Are historical ranks immutable after finalization, with corrections creating a superseding snapshot?

**Suggested default:** store full precision; round only at the published score boundary; use competition ranking; do not invent tie-breakers. Define award handling for rank-3 ties separately.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

## 3. Decisions that block identity, privacy, and operations

### PO-09 — Provider connection vs leaderboard visibility
**Status:** OPEN — privacy critical

**Known baseline**
- Verified successful sync counts toward quorum independently of leaderboard opt-in (DEC-06).
- Opted-out students are absent from peer-facing views.
- Provider connection and peer visibility should be separate consent concepts.

**Choices**
- Is peer visibility opt-in or opt-out by default?
- Can a student view personal analytics while hidden from peers?
- Does withdrawal take effect immediately for current and historical peer views, or only future views?
- What minimum data remains in audit/history after withdrawal?

**Suggested default:** explicit opt-in for peer visibility; personal analytics remain available; withdrawal removes the student from future peer-facing views. Historical treatment must be stated clearly in the privacy notice.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-10 — Data retention schedule
**Status:** OPEN — critical

**Conflicting proposals in current planning context**

| Data category | Earlier V3.1 proposal | Later planning proposal |
|---|---:|---:|
| Activity history | 5 academic years | Cohort/standing/achievement 7 years |
| Raw provider payloads | 7 days | Raw events/snapshots 2 years |
| Security/admin audit | 2 years | 7 years |
| Backups | 30 days | 90 days |
| Operational logs | Not clearly specified | 90 days |

These are competing proposals, not an approved schedule.

**Choices**
- Approve one schedule or define separate retention by data class.
- Define deletion/anonymization behavior after account closure and cohort departure.
- Define legal/institutional retention requirements before automation.

**Suggested default:** use data minimization and the shortest period that satisfies documented institutional requirements. Do not implement automated deletion until this is approved.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-11 — GitHub token handling
**Status:** OPEN — security critical

**Conflict**
- One reviewer recommends discard token after ownership proof.
- Another recommends retaining a minimal-scope encrypted token for user-specific API budget and GraphQL access.
- Actual required endpoints/scopes and provider terms must be verified first.

**Options**
- A. Discard after ownership proof; use only public unauthenticated data where permitted.
- B. Retain encrypted minimum-scope token for explicitly documented telemetry calls.
- C. Defer automated sync until a compliant data path is proven.

**Suggested default:** select the least-retentive option that supports the approved telemetry design. No token retention without a documented API need, scope review, encryption/key management, and owner approval.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-12 — Faculty and Coordinator decision authority
**Status:** OPEN — governance critical

**Conflict**
- DEC-04 originally says Faculty or Platform Admin final approval/commit.
- Later governance notes narrow final dispute/handle decisions to Faculty, with Coordinator limited to triage/recommendation.
- Platform Admin is the institution-level operator; Coordinator is a scoped student helper.

**Options**
- A. Faculty final decision for assigned cohort; Platform Admin only handles platform/institution exceptions.
- B. Faculty or Platform Admin may make final decisions.
- C. Separate decision authority by action type (roster correction, dispute, provider verification, policy exception).

**Suggested default:** C with a permission matrix. Keep Coordinator non-final. Avoid broad Platform Admin access to student-level decisions unless required and audited.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-13 — Platform Admin self-affecting actions
**Status:** OPEN

**Question**
When the Platform Admin changes their own role, cohort, score, dispute, or access, who provides neutral review?

**Options**
- A. Independent Faculty/authorized reviewer.
- B. Two-person approval for sensitive actions.
- C. Block/defer the action if no neutral reviewer exists.

**Suggested default:** C as fail-safe, with an auditable two-person exception process only if the institution approves it.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-14 — Session lifetime and revocation
**Status:** OPEN

**Prior architecture proposal (not yet owner-approved)**
- 15-minute signed access token.
- Opaque DB-backed session with refresh rotation and reuse detection.
- Default 12-hour browser session; optional 30-day persistent session unchecked by default.

**Choices**
- Approve session duration and persistent-session behavior.
- Require re-authentication for sensitive actions?
- Define account/session revocation after role removal or cohort changes.

**Suggested default:** short-lived access with server-side revocable session; persistent session off by default; re-authenticate for sensitive account/security changes.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

## 4. Provider and onboarding gates

### PO-15 — LeetCode production permission and fallback
**Status:** OPEN — provider gate

**Known context**
- No official public developer API/OAuth path has been established in the current review.
- Unofficial retrieval methods must not be used in production without explicit provider authorization.
- DEC-08: compulsory LeetCode production enforcement only after Phase 0 proves a permitted reliable method.

**Options**
- A. Keep compulsory intent; block production onboarding until permitted reliable method exists.
- B. Make LeetCode optional for pilot; no aggregate score depending on it.
- C. Replace LeetCode with another provider only after a separate product decision and cohort validation.

**Suggested default:** B for the GitHub-first pilot, without silently changing the long-term compulsory intent. Record the temporary pilot exception explicitly.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

### PO-16 — Email/OTP production readiness
**Status:** OPEN if not already approved

**Known locked rule DEC-01**
- Production requires strict SMTP/transactional email API.
- No console OTP logging in production.
- Delivery failure must not create a session.

**Choices**
- Confirm provider, verified sender/domain, rate limits, recovery path, and operational owner.
- Resend was previously recommended, but setup was deferred until a verified domain exists.

**Suggested default:** keep production onboarding disabled until a verified transactional delivery path is tested end-to-end. Never use console OTP as a production fallback.

**Owner decision:** ____________________  
**Effective version/date:** ____________________

## 5. Pilot-specific recommendation

To protect the 7 December target without weakening the product's trust model:

1. Pilot secure institutional login and role access.
2. Pilot GitHub account binding and permitted public telemetry only.
3. Show personal activity, provenance, coverage, sync state, and privacy controls.
4. Keep LeetCode/HackerRank production collection disabled until permission and reliability gates pass.
5. Keep cross-platform Common leaderboard, podium, and awards disabled unless PO-01 through PO-08 are explicitly resolved and tested.
6. Do not implement automated retention deletion until PO-10 is approved.
7. Do not launch if P0 security or data-integrity findings remain.

This is a recommended pilot boundary, not an automatic change to the approved product scope.

## 6. Decision order — fastest safe sequence

| Order | Decisions | Why first |
|---:|---|---|
| 1 | PO-01, PO-04, PO-15 | Establish what the pilot can legitimately score and which providers are in scope |
| 2 | PO-02, PO-03, PO-05, PO-06, PO-07, PO-08 | Close scoring and finalization policy |
| 3 | PO-09, PO-10 | Privacy, consent, retention and data lifecycle |
| 4 | PO-11, PO-14 | Token and session security architecture |
| 5 | PO-12, PO-13 | Governance and neutral review |
| 6 | PO-16 | Operational onboarding readiness |

## 7. Decision record template

For every approved decision, record:
- Decision ID:
- Final choice:
- Rationale:
- Scope affected:
- Effective date:
- Policy version:
- Approver:
- Revisit trigger:
- Implementation tasks unblocked:

**No decision is approved by silence, document generation, reviewer recommendation, or implementation convenience.**

## 8. Approval summary

| Decision group | Count | Current status |
|---|---:|---|
| Competition/scoring | 8 | Open |
| Privacy/identity/governance | 6 | Open |
| Provider/onboarding | 2 | Open or confirmation required |
| **Total** | **16** | **Awaiting Product Owner decisions** |

**Final status:** Ready for Product Owner review. This pack records questions and recommendations; it does not amend locked TWM V3.1 requirements.
