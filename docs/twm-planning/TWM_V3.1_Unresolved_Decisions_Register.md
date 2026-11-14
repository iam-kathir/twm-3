# TWM V3.1 — Unresolved Decisions & Governance Register

**Version:** 1.2 (Final Governance Classification Audit Baseline)  
**Date:** 14 November 2026  
**Audited Baseline SHA:** `6cb7c876173796f37e1e427960249089069ef6a5`  
**Status:** READ-ONLY GOVERNANCE INTEGRITY REGISTER  

---

## 1. Principles of Decision Integrity

In strict accordance with the TWM Tri-Agent Governance Protocol:
- **Locked decisions** represent approved requirements and must be preserved without exception.
- **Temporary pilot constraints** represent operational boundaries strictly for the initial pilot cohort and must **never** be converted into permanent product architecture.
- **Reviewer recommendations** (from Claude, Argon, or subagents) are advisory and must **never** be treated as approved decisions.
- **Unresolved decisions** require explicit, written confirmation from the Product Owner before dependent code is implemented.
- **Multi-dimensional decisions** must have each dimension explicitly recorded rather than forced into a single misleading status.
- The engineering team must **never silently resolve conflicts** or adopt implementation shortcuts that weaken approved invariants.

---

## 2. Existing Approved & Locked Decisions (Authoritative Baseline)

| Decision ID | Canonical Topic | Approved Policy & Invariant | Primary Source Reference |
|---|---|---|---|
| **DEC-01** | Production Email OTP Delivery | Production OTP requires strict SMTP or transactional email API. Console OTP logging is prohibited in production. Delivery failure creates no session. | `TWM_Master_Decision_Register_v1.0.md` §3.2 |
| **DEC-02** | Dispute Frequency Limitation | Students may have at most two simultaneously open telemetry sync disputes per competition week. | `TWM_Master_Decision_Register_v1.0.md` §3.5 |
| **DEC-03** | Roster Typo Correction | Roster handle corrections are non-blocking; requires Faculty review and an immutable before/after audit log. | `TWM_Master_Decision_Register_v1.0.md` §3.2 |
| **DEC-04** | Administrative Roster Commit | Faculty or Platform Admin final approval is required to modify enrolled class roster records. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **DEC-05** | Historical Cohort Immutability | Archived cohorts are read-only for students; historical standings cannot be retroactively altered. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **DEC-06** | Quorum Participation & Denominator | Quorum denominator is the authoritative enrolled roster in SQLite/PostgreSQL. Quorum threshold is `≥ 70%`. Verified sync counts toward quorum independently of leaderboard opt-in. | `TWM_Master_Decision_Register_v1.0.md` §3.5 |
| **DEC-07** | Five-Stage Onboarding Flow | 1. Confirm identity/roster; 2. GitHub OAuth; 3. LeetCode verification (subject to DEC-08); 4. Optional HackerRank; 5. Privacy review & workspace entry. | `TWM_Master_Decision_Register_v1.0.md` §3.2 |
| **DEC-08** | LeetCode Production Permission Gate | Compulsory LeetCode production enforcement occurs ONLY after Phase 0 proves a permitted, reliable collection method. If proof fails, no fake verification; PO approves fallback. Compulsory intent remains. | `TWM_Master_Decision_Register_v1.0.md` §3.2 |
| **GOV-01** | Product Boundary | Class-focused developer activity monitoring, analytics, and friendly competition. Not an academic ERP, submission portal, or code execution judge. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **GOV-02** | Credential Boundary | Students connect personal developer profiles; TWM never collects or stores provider passwords. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **GOV-03** | Peer Privacy & Opt-In | Leaderboard participation is strictly opt-in. Opted-out students are excluded from peer ranking views. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **GOV-05** | Coordinator Scope Limitation | Coordinators are students with scoped, time-bounded, revocable grants; not Platform Admin co-admins. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **GOV-06** | Coordinator Triage-Only Boundary | Coordinators may triage disputes and make recommendations; Faculty makes final dispute and handle decisions. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **GOV-07** | No Independent Admin Co-Admin | No independent Platform Admin co-admin role; neutral review safeguards required for self-actions. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **GOV-08** | Admin Competing Student Status | Platform Admin may also be an enrolled competing student; self-affecting actions require neutral review. | `TWM_Master_Decision_Register_v1.0.md` §3.1 |
| **COMP-01** | Competition Timezone & Boundary | Competition operates strictly on `Asia/Kolkata` (UTC+05:30); Monday 00:00:00 IST to Sunday 23:59:59 IST. Closing value must satisfy `boundary_gap <= 3h`. | `TWM_Master_Decision_Register_v1.0.md` §3.5 |
| **SCORE-14** | Deterministic Ranking Ties | Competition ranking follows `1, 2, 2, 4` tie policy with rank skipping; alphabetical secondary sort. | `TWM_Master_Decision_Register_v1.0.md` §3.4 |
| **PROV-06** | Anti-Scraping / Compliance Invariant | Strict prohibition against unauthorized scraping, anti-bot bypass, CAPTCHA/WAF evasion, or access-control circumvention. | `TWM_Master_Decision_Register_v1.0.md` §3.3 |
| **INV-01** | Zero Fabrication Invariant | Never render unverified, unavailable, or mock data as fact. Missing data is `UNAVAILABLE` or `Pending`, never `0`. Network failure never becomes success. | V3.1 Plan §1.2 & §5.7 |

---

## 3. Comprehensive Governance Audit of PO-01 through PO-16

Every decision is audited across seven standardized dimensions to guarantee complete separation of approved baseline policies, temporary operational constraints, proposed reviewer recommendations, open questions, external dependencies, and implementation restrictions.

The five allowed status categories are:
1. **Approved and Locked**
2. **Temporary Pilot Constraint**
3. **Proposed Recommendation**
4. **Awaiting Product Owner Approval**
5. **Blocked by External Provider Confirmation**

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       PO-01 THROUGH PO-16 COMPREHENSIVE GOVERNANCE MATRIX                                              │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

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

## 4. Reviewer Recommendations Awaiting Product Owner Confirmation

The following proposals originate from external reviewer reports (Claude and Argon) and are strictly **advisory recommendations**:
1. **Per-Student Provisional Finalization with Tuesday 18:00 Deadline:** Proposed by Claude/Argon to prevent a single dispute from blocking an entire cohort. *Status: Proposed Recommendation under PO-05.*
2. **Immediate Discard of GitHub OAuth Tokens:** Proposed by Claude to minimize token exposure. *Status: Proposed Recommendation under PO-11.*
3. **Seven-Day HMAC Session Lifetime:** Proposed as a convenient session duration. *Status: Unapproved Proposed Recommendation under PO-14.*
4. **Redaction of Student Register Numbers from Coordinator Views:** Proposed by Argon for student privacy. *Status: Proposed Recommendation under PO-12.*
5. **Use of Gmail SMTP as Temporary OTP Bridge:** Proposed by Argon. *Status: Rejected proposal due to account suspension and deliverability risks.*

---

## 5. Decisions Requiring External Provider Confirmation

1. **LeetCode Official Data Access (DEC-08 / PO-15):**
   - *Requirement:* Official partner API, institutional licensing, or written permission for automated class telemetry collection.
   - *Status:* Unconfirmed. Public scraping is prohibited by PROV-06. Production collection remains **hard-disabled**.
2. **HackerRank Commercial Terms:**
   - *Requirement:* Confirmation that public badge inspection complies with HackerRank Terms of Service for educational institutions.
   - *Status:* Unconfirmed. Route remains **hard-disabled** and excluded from weekly scoring.
3. **GitHub API Rate Budgets:**
   - *Requirement:* Validation of whether public unauthenticated GraphQL queries or a single GitHub App installation can support regular sync for 100+ students without hitting hourly limits.
   - *Status:* Validation required during Phase 3 provider adapter testing.
4. **Institutional Domain Verification (`cit.edu.in` / PO-16):**
   - *Requirement:* IT administrator cooperation to configure SPF/DKIM records or provide an internal SMTP relay.
   - *Status:* Awaiting college IT department confirmation.

---

## 6. Governance Conclusion

Until the Product Owner confirms decisions **PO-01 through PO-16**, the engineering implementation adheres to the **safest locked subset**:
- **Phase 0 Security Containment can proceed immediately upon explicit Product Owner authorization**, as it resolves confirmed vulnerabilities and introduces zero architectural rework.
- **Scoring, competition composite formulas, and role workspaces remain held** at their architectural boundaries until formal decisions are signed off.
