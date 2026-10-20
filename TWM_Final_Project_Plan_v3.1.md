# TWM — Final Project Plan

**Version:** 3.1 (corrected master baseline)\
**Status:** Final planning baseline — the next action is Phase 0 evidence, not more planning\
**Document purpose:** Product specification, technical architecture, fairness policy, security model, implementation roadmap, and launch checklist\
**Primary audience:** Product owner, designers, frontend/backend developers, testers, and maintainers

------------------------------------------------------------------------

## Document control

| Item | Decision |
|---|---|
| Product | TWM |
| Initial community | One class community; additional classes may be supported later |
| Initial provider scope | GitHub, LeetCode, HackerRank |
| Delivery order | GitHub-first vertical slice and classmate pilot; LeetCode/HackerRank added for the fields that pass Phase 0 |
| Initial competition | Platform-specific leaderboards, with explicit eligibility and data-quality rules |
| Initial AI scope | Weekly Developer Recap, limited Leaderboard Insights, lightweight Semantic Developer Search |
| Overall cross-platform score | Deferred until a defensible scoring method is validated |
| Login | GitHub OAuth plus college-email / roster verification; no passwords collected |
| Delivery approach | One modular application; no unnecessary microservices |
| Timezone | `Asia/Kolkata` for TWM-defined periods; provider-native day buckets are labelled as such |
| Core principle | Never represent unavailable or unverified data as a fact |

### Changes in v3.1

This version keeps the v3 scope and fixes the issues found in the final review:

1. **Weekly snapshot rule rewritten (Sections 9.1, 9.7, 16.3).** The closing value for a cumulative-only metric is now the last valid observation taken at or before Sunday 23:59:59 IST. v3 relied on a 00:15 Monday observation, which a "current total" endpoint can never turn into a finalized Sunday value.
2. **Provider-native day buckets (Section 9.1).** If GitHub's calendar is UTC-bucketed, the metric is labelled as such. It is never shown as an IST day.
3. **Verification challenge wording cleaned up (Section 6.2).** Duplicate rules removed, HMAC check described precisely.
4. **Co-administrator named in Phase 1 (Section 17.5, Section 20).** Not "before launch" in general.
5. **Roadmap restructured as a GitHub-first vertical slice (Section 20).** Classmate pilot at about week 8–10, before LeetCode/HackerRank and AI are built.
6. **Launch checklist, decisions register, and Phase 0 scripts updated (Sections 21, 22, 26).** Includes a new boundary-observation test.
7. **Formatting repaired.** Inline lists and tables converted to standard Markdown. Hosting-specific wording removed from the test scripts because hosting is still undecided.

### How to read this plan

This plan is the current master planning document. It does not claim that third-party provider capabilities have already been proven; those require the Phase 0 evidence record.

This plan separates four kinds of statements:

- **Committed product decisions:** requirements TWM will follow.
- **Proposed defaults:** concrete initial values that can be changed only through a documented decision.
- **Validation gates:** facts that must be demonstrated by testing the actual provider, account, deployment environment, and applicable terms.
- **Launch gates:** minimum conditions that must pass before TWM is publicly launched, even if a provider remains limited or unavailable. A requirement in this document is not proof that a third-party platform exposes the required data.

If provider validation fails, the implementation must downgrade that provider's capability honestly. It must not bypass access controls, violate provider terms, fabricate statistics, or silently exclude the failure from the user interface.

------------------------------------------------------------------------

# 1. Executive summary

TWM is a class-focused, multi-platform developer activity and friendly
competition platform. It helps students connect supported developer
profiles, understand their observed activity, follow their own progress,
and compare eligible statistics with classmates.

The initial provider scope includes **GitHub, LeetCode, and
HackerRank**. Each provider has its own adapter and capability status.
TWM will use only data that it can obtain through a permitted, reliable
method. Provider capabilities may differ: one may support verified live
data, another only periodic cumulative snapshots, and another may
initially support profile linking without competitive metrics.

TWM's core value is not to judge who is the best programmer. It is to
help classmates practise consistently, recognize improvement, and make
developer activity easier to understand.

## Product promise

> Connect your developer profiles. Track your progress. Compare your
> activity. Compete with classmates. Keep improving.

## Product principles

1.  Friendly competition is the main product experience.
2.  All three providers remain in the initial product scope, subject to
    explicit capability gates.
3.  Platform-specific metrics are the source of truth; unlike
    measurements are not added together.
4.  A linked profile is not automatically a verified profile.
5.  Missing, stale, failed, or inaccessible data is not zero and is not
    proof of inactivity.
6.  Every displayed metric has a definition, source, period, and
    freshness indicator.
7.  Personal improvement and consistency matter alongside cumulative
    achievement.
8.  Participation in competitive leaderboards is opt-in.
9.  AI explains or organizes available data; it does not invent facts,
    scores, or rankings.
10. The core product continues to work when AI services are unavailable.
11. Private repository content is not collected by default.
12. TWM is not an academic management system, assignment portal, online
    judge, or surveillance system.

------------------------------------------------------------------------

# 2. Product vision and boundaries

## 2.1 Vision

Create a shared, trustworthy environment in which classmates can
understand their developer activity, compare supported metrics,
recognize progress, and motivate each other to keep learning.

## 2.2 Target users

### Student participant

-   Registers and joins the class community.
-   Connects supported developer profiles.
-   Chooses profile visibility and leaderboard participation.
-   Views personal statistics, history, recaps, and eligible rankings.
-   Can disconnect a provider, correct profile links, opt out, and
    request deletion.

### Class administrator

-   Manages invitations and membership.
-   Configures semester dates and class settings.
-   Reviews sync health and reported issues.
-   Cannot silently alter personal statistics or grant themselves
    ranking advantages.

### Independent co-administrator / reviewer

-   Reviews disputed ownership, data corrections, and
    administrator-affecting changes.
-   Provides oversight when the primary administrator is also a
    participant.
-   All sensitive actions are logged.

### System operator

-   Manages deployment, secrets, job health, backups, and incident
    response.
-   Uses least-privilege operational access.
-   Does not need to inspect private repository content to maintain TWM.

## 2.3 In scope

-   Authentication and class membership.
-   GitHub, LeetCode, and HackerRank provider adapters.
-   Provider linking and ownership verification.
-   Personal developer dashboard and profile.
-   Observed activity and cumulative statistics.
-   Data freshness, coverage, sync status, and provenance.
-   Platform-specific leaderboards.
-   Consistency and Most Improved metrics where data supports them.
-   Weekly Developer Recap.
-   Limited Leaderboard Insights.
-   Lightweight Semantic Developer Search backed by stored
    profile/project tags.
-   Notifications for relevant account and sync events.
-   Privacy controls, opt-out, disconnection, deletion, audit, and
    backups.
-   Responsive desktop and mobile-friendly UI.

## 2.4 Explicitly out of scope

-   Teams and team-management workflows.
-   Questions or weekly question distribution.
-   Assignments, submissions, grading, or faculty evaluation.
-   In-app coding editor or online judge.
-   Code execution or automatic assessment of student code.
-   Plagiarism detection or AI-generated-code detection.
-   AI-generated programming skill scores.
-   Predictive rankings or automated accusations of cheating.
-   DMs, a full social network, or public global competition.
-   Scraping that violates provider terms or bypasses access
    restrictions.
-   A cross-platform overall score in the initial release.
-   A vector database or complex embedding infrastructure unless a
    measured need later justifies it.

------------------------------------------------------------------------

# 3. Product and competition model

## 3.1 Class community

TWM starts with one class community. The data model should not prevent
additional classes in the future, but multi-class administration is not
a launch requirement.

Membership is not equivalent to leaderboard participation. A student may
use their personal dashboard privately and choose not to appear in
competitive rankings.

## 3.2 Competition design

TWM should motivate without shaming. It must avoid language implying
that lower-ranked students are lazy, unskilled, or less capable.

The UI should emphasize:

- Personal progress over time.
- Clear platform-specific achievements.
- Consistency when measurable.
- Improvements that can be fairly compared.
- Data freshness and eligibility.
- Positive milestones beyond first place.

Do not publish a global "best programmer" label.

## 3.3 Participation threshold

Proposed initial rule:

- At least **70% of the eligible class roster** should have verified membership and opted into the relevant competition before the page is described as representative of the class.
- The denominator must come from an explicitly imported/approved class roster or another authoritative membership list. Without a roster, TWM does not know the true class size and must not claim a class-wide participation percentage; show only the number of participating members.
- Below the threshold, label it **"Participating Members Leaderboard"** and display the participant count.
- Do not infer anything about nonparticipants.

The threshold affects the wording of the page, not whether eligible
participants can view their own results.

------------------------------------------------------------------------

# 4. Core user journeys

## 4.1 Registration and onboarding

1.  User registers through the supported authentication method.
2.  TWM verifies the user's email or uses administrator-approved
    membership.
3.  User joins the class through a time-limited invitation code or
    approval.
4.  TWM explains what profile information is collected and what
    classmates may see.
5.  User chooses profile visibility and leaderboard opt-in settings.
6.  User connects provider accounts individually.
7.  Each provider receives its own verification and data-availability
    status.
8.  TWM performs an initial sync where supported.
9.  The dashboard clearly distinguishes verified data, pending data,
    unavailable fields, and errors.

Do not make all provider connections mandatory for account creation. A
student can onboard and use TWM even if one provider is unavailable.

## 4.2 Connecting a provider

1.  Explain requested permissions and their purpose.
2.  Start a provider-supported authorization or verification flow.
3.  Validate provider identity and callback state where OAuth is used.
4.  Verify profile ownership.
5.  Store credentials securely only when required.
6.  Fetch permitted profile and statistic fields.
7.  Save source, timestamp, capability status, and validation outcome.
8.  Show the student exactly what was connected and what data TWM can
    access.
9.  If ownership cannot be established, mark the account unverified and
    exclude it from competitive rankings.

## 4.3 Viewing a leaderboard

1.  User selects a platform and metric.
2.  TWM displays the period, definition, update time, coverage,
    eligibility, and tie policy.
3.  Only verified and eligible participants are ranked.
4.  Provisional data is clearly labelled.
5.  Users can open the calculation explanation.
6.  Users can report an incorrect profile link or metric.
7.  Corrections are audited and do not silently rewrite historical
    records.

## 4.4 Disconnecting or deleting

1.  User disconnects a provider or requests account deletion.
2.  TWM stops future collection from the disconnected provider.
3.  Revoke provider authorization where supported and delete stored
    tokens.
4.  Remove or anonymize derived data according to the deletion policy.
5.  Show completion status without promising deletion from external
    providers.
6.  Preserve only narrowly necessary security audit information for a
    documented retention period.

------------------------------------------------------------------------

# 5. Provider feasibility and capability gates

## 5.1 Non-negotiable policy

The three providers remain part of the intended initial product
experience, but **competitive features are enabled per provider only
after their data-access path passes validation**. The product goal is
not permission to assume APIs exist. The launch decision is
evidence-based, not all-or-nothing: TWM may launch with GitHub if GitHub
passes the launch gate, while LeetCode and/or HackerRank remain visible
as limited, linked-only, or disabled capabilities. This is not a silent
scope change; it is the predefined fallback launch.

Each provider field must be recorded in a capability registry with:

- Provider and field name.
- Data type and meaning.
- Access method and applicable permission.
- Whether ownership is verified.
- Historical depth.
- Update frequency and rate limits.
- Whether the value is live, event-based, cumulative, or snapshot-only.
- Last successful test.
- Terms/policy review status.
- Hosting compatibility.
- Failure mode and fallback.
- Whether it may be used in a leaderboard.

## 5.2 Capability states

| State | Meaning | Permitted use |
|---|---|---|
| `SUPPORTED_LIVE` | Field can be retrieved reliably through an approved method | Eligible for metrics using that field |
| `SUPPORTED_EVENT` | Timestamped events are available with sufficient history | Period activity if timestamp and coverage rules pass |
| `SUPPORTED_SNAPSHOT` | Cumulative values can be sampled over time | Cumulative rankings; deltas only when measurement windows are trustworthy |
| `LINKED_UNVERIFIED` | Profile URL is recorded but ownership is unproven | Display only as unverified; no rankings |
| `LIMITED` | Only some fields or periods are available | Use only supported fields and label limitations |
| `UNAVAILABLE` | No acceptable retrieval method currently exists | No automated metric or ranking |
| `DISABLED_POLICY` | Access is disabled due to provider terms, policy, or security concerns | No collection until re-approved |

## 5.3 Phase 0 test matrix

Run these tests for every provider and every intended leaderboard field:

1.  Can the field be retrieved through a permitted method?
2.  Is the field definition documented and understood?
3.  Can TWM verify the linked account belongs to the student?
4.  Is the data public, authorized, private, or scope-dependent?
5.  Does the provider expose timestamps or only cumulative totals?
6.  How much history is available?
7.  What are the rate limits, pagination rules, and cache restrictions?
8.  Does repeated sync return stable and consistent values?
9.  What happens when the profile is private, deleted, renamed, or
    rate-limited?
10. Does the selected hosting provider permit the necessary outbound
    access?
11. Can the data be retained and displayed under applicable terms?
12. Can a failed or partial response be distinguished from a genuine
    zero?
13. Is the retrieval path documented well enough to maintain?
14. Is the field sufficiently fair to use in a competition?

A field is approved only after the test results and source documentation
are recorded. A manual experiment alone does not establish ongoing
production reliability.

## 5.4 GitHub

Preferred approach: official GitHub authorization and documented APIs.

-   Use OAuth or the supported GitHub App flow for identity
    verification.
-   Start with least-privileged scopes.
-   Use public profile and permitted contribution data first.
-   Test contribution-calendar access and its exact scope requirements.
    Specifically determine the timezone/day-bucketing semantics returned
    by the API versus the GitHub UI, and whether the field respects the
    user's private-contribution display settings. Do not assume calendar
    days align with Asia/Kolkata.
-   Do not collect private repository content by default.
-   Request broader permission only when necessary, with clear consent
    and an explicit benefit.
-   Do not rely solely on the Events API for long-term history where its
    retention window is insufficient.
-   Store observed events only when the source actually supplies them
    and the terms permit retention.
-   Treat contribution counts as activity signals, not proof of quality.

### GitHub acceptance tests

-   OAuth state and callback validation.
-   Account identity matches the connected provider profile.
-   Pagination and rate limits handled.
-   Renamed or inaccessible accounts handled.
-   No duplicate event inflation.
-   Contribution-day results match the provider's returned data for test
    accounts.
-   Permission denial does not break the rest of TWM.
-   Private data is never collected unless explicitly authorized and
    required.

## 5.5 LeetCode

Do not assume there is a stable, official public API that exposes all
desired personal statistics or full submission history.

Phase 0 must establish:

- Which fields are available by an allowed method.
- Whether public profile statistics are retrievable reliably.
- Whether timestamps and historical submissions are available.
- Whether ownership can be verified using an allowed profile field or provider-supported authorization.
- Whether automated retrieval and caching comply with the platform's terms.
- Whether production hosting can reach the service consistently.

If only cumulative totals are available, store timestamped snapshots and
describe changes as **"change since last verified snapshot."** Do not
label the change as a specific day's or week's activity unless the data
proves that period attribution.

If no safe ownership-verification method exists, the profile remains
unverified and is excluded from competitive rankings.

## 5.6 HackerRank

Do not assume enterprise APIs are available to ordinary community users
or expose personal leaderboard statistics.

Phase 0 must establish:

- Supported personal/community profile fields.
- Permitted retrieval mechanism.
- Ownership-verification options.
- Historical depth and timestamps.
- Rate limits and policy restrictions.
- Reliability from the proposed deployment environment.

If the available access is limited to a public profile with no reliable
verification or history, TWM may show a manually linked profile as
unverified but must not use it for a competitive metric.

## 5.7 Provider failure policy

Failure of one provider must not break another provider's dashboard or
rankings. Each adapter has independent sync status, retries, capability
configuration, and observability.

Never bypass authentication, anti-bot systems, rate limits, or access
restrictions to force a provider into the release.

## 5.8 Minimum launch and fallback release

The product goal remains one TWM release designed for all three
providers. The actual launch gate is capability-based:

-   **Minimum viable launch:** GitHub passes ownership verification,
    permitted data access, data-quality, security, and leaderboard
    tests.
-   LeetCode and HackerRank may ship in the same UI as `LIMITED`,
    `LINKED_UNVERIFIED`, or `UNAVAILABLE` if their Phase 0 tests do not
    pass. They must not contribute to rankings until the relevant fields
    and ownership checks pass.
-   If GitHub fails its own launch gate, do not launch competitive
    rankings. Continue development or run a private prototype with
    clearly labelled mock/test data.
-   A provider shown as "connected" must not imply its statistics are
    available. Connection, ownership verification, and metric capability
    are separate states.
-   The release notes must list each provider's tested capabilities and
    known limitations.
-   Do not block the whole product waiting for a provider whose approved
    capabilities cannot be validated, but do not simulate unavailable
    integrations.

This is the explicit fallback plan; it preserves the intended
three-provider product without making an unsupported promise that all
three will be ranking-ready on launch day.

------------------------------------------------------------------------

# 6. Account ownership and verification

## 6.1 GitHub

Use provider-supported OAuth or another documented identity mechanism.
Validate the authorization callback, state, returned identity, and
connection ownership.

## 6.2 LeetCode and HackerRank

Preferred verification order:

1. Provider-supported OAuth or identity verification, if available.
2. A random challenge in a provider-controlled profile field, if that field is editable by the user and readable through a permitted method.
3. Another documented provider-approved proof-of-control method.
4. Otherwise, leave the profile unverified.

A challenge must:

- Be random, high-entropy, and single-use.
- Expire after 15 minutes.
- Be bound to the user, the provider, and the intended provider account (use the provider's immutable account ID where available).
- Be stored only as a keyed HMAC of the expected value, including the user/provider/account binding. To verify, regenerate the expected value on the server and look for it in the fetched public profile field using a constant-time comparison. Do not try to recover a challenge from a one-way hash.
- Be rate-limited against brute force and guessing.
- Be invalidated after success, expiry, or account change.
- Be removable from the profile after verification; tell the user they may delete it.

A screenshot, typed username, or pasted profile URL is not conclusive ownership proof.

## 6.3 Ownership state machine

`NOT_LINKED → PENDING_VERIFICATION → VERIFIED`

Failure paths:

- `PENDING_VERIFICATION → EXPIRED` - `PENDING_VERIFICATION → FAILED` - `VERIFIED → REVERIFICATION_REQUIRED` when the provider account ID changes, authorization is revoked, a provider reports a material identity change, or a verified connection is manually disputed. Do not require arbitrary periodic re-verification unless provider behavior or risk justifies it.
- Any state → `DISCONNECTED`

Where available, persist the provider's immutable account ID as the
identity key; treat usernames and profile URLs as mutable display
attributes.

Only `VERIFIED` profiles can contribute to competitive rankings.

## 6.4 Disputes

A user can report a wrong profile association. Freeze the disputed
account's leaderboard eligibility until reviewed. The independent
co-administrator reviews the evidence; all changes are logged. Never
reveal another user's private tokens or authorization data.

------------------------------------------------------------------------

# 7. Data quality, provenance, and coverage

## 7.1 Data is not binary

A metric needs more than a numeric value. It also needs:

- Provider.
- Metric definition and version.
- Source field or event.
- Observed timestamp.
- Provider event timestamp, if present.
- Retrieval timestamp.
- Data mode: event, live, cumulative, or snapshot.
- Coverage window.
- Validation status.
- Confidence/limitation label.
- Eligibility state.

## 7.2 Required status values

Use explicit statuses such as:

- `NOT_CONNECTED` - `PENDING_VERIFICATION` - `CONNECTED` - `SYNCING` - `SYNCED` - `PARTIALLY_AVAILABLE` - `STALE` - `FAILED` - `REAUTH_REQUIRED` - `UNVERIFIED` - `DISCONNECTED` - `UNAVAILABLE`

## 7.3 Missing versus zero

-   A successfully retrieved numeric zero is `0`.
-   A missing field is `NULL` with a reason.
-   A failed sync is a failure status, not a zero.
-   An unsupported metric is unavailable, not zero.
-   No observed activity is not proof of no coding activity outside the
    provider's observable data.

## 7.4 Coverage rules

For a period metric, define eligible days and successfully observed
days.

`coverage_ratio = successfully_observed_eligible_days / eligible_days`

Proposed default for finalized GitHub consistency:

- At least 90% date-level coverage for the period.
- No unresolved gap that makes the metric's interpretation materially misleading.
- Coverage metadata must be shown.
- Below threshold, show a provisional personal view but exclude the result from the finalized ranking.

Coverage measures successful retrieval of the provider's supported data
and its expected date buckets. It is not a measure of how much real
coding activity TWM could see. It cannot detect local/unpushed work,
wrong Git email attribution, or contributions omitted by the provider's
visibility settings. The UI and documentation must call this **data
retrieval coverage**, not coding-activity coverage.

For snapshot-only providers, a coverage ratio does not create missing
timestamps. Use a separate `period_attribution_status` and only rank
deltas when the baseline/end-window rules are satisfied.

## 7.5 Freshness

Display last successful sync per provider. Define a metric-specific
freshness threshold during Phase 0 based on provider limits and update
behavior. Stale data remains visible with a stale label but is not
silently presented as current.

------------------------------------------------------------------------

# 8. Activity definitions and anti-gaming policy

## 8.1 What TWM measures

TWM measures **observable activity reported by connected platforms**,
not total effort, intelligence, coding quality, or real-world
productivity.

## 8.2 GitHub activity

Initial metric candidates:

- Observed contribution days.
- Supported contribution counts where meaning and coverage are documented.
- Repository/project metadata for discovery, not quality scoring.

Rules:

1. For consistency, a qualifying day contributes at most one active day. This is intentionally a low-bar consistency signal: a single small contribution can qualify as an active day, and TWM cannot reliably prove effort or quality from a daily aggregate. The UI must say so plainly; TWM must not market this as proof of meaningful work.
2. Raw commit count is not the primary consistency metric.
3. Do not score code quality from volume.
4. Do not claim that every contribution is human-authored.
5. Do not automatically accuse users of manipulation based on spikes.
6. Where trustworthy event-level details exist, obvious duplicates and known bot-attributed events may be excluded according to a versioned policy.
7. Where only a daily aggregate is available, TWM cannot reliably identify empty commits, tutorial forks, bot events, or shared lab work. Do not pretend otherwise. Mitigations are limited to reducing volume incentives, separating active-day consistency from counts, using supported event details only where legitimately available, offering private dispute/reporting, and relying on transparent community rules. If the class wants a stronger activity definition later, introduce a separate metric based on verified distinct contribution types only after those event types are available consistently to all participants.
8. Never collect private repository contents by default.
9. Shared or group repository activity must not be interpreted as individual mastery.
10. Any manual correction must include a reason, actor, timestamp, and audit record.

## 8.3 LeetCode and HackerRank activity

-   Use only fields approved during Phase 0.
-   Cumulative solved totals can be displayed as cumulative achievement
    if their semantics are documented.
-   Snapshot differences must be described as changes between snapshots
    unless the source supplies trustworthy event timestamps.
-   A solved count is not proof of mastery or original work.
-   Do not infer a student's skill from rank alone.
-   Avoid combining fundamentally different provider statistics.

## 8.4 Suspicious activity

TWM may flag unusual patterns for review only if the source data
supports the flag. It must not automatically disqualify, shame, or
publicly accuse a student. A flag should be private, reviewable, and
reversible.

------------------------------------------------------------------------

# 9. Competition periods and leaderboard rules

## 9.1 Timezone and week boundaries

Competition timezone for TWM-defined periods: `Asia/Kolkata` (IST, UTC+05:30).

**Provider-native date buckets must not be assumed to use this timezone.** Phase 0 must test GitHub contribution-calendar semantics, including API/UI differences and private-contribution display settings.

Decision rule for provider-native day buckets:

- If the provider's daily buckets can be mapped accurately to IST days, use IST.
- If they cannot (for example, GitHub supplies only UTC-bucketed days), label every affected metric in the UI as "GitHub calendar days (UTC)" or the provider's actual boundary, and compute that metric's weeks with the provider's boundaries. State the boundary in the leaderboard header and tooltip.
- Never relabel a provider bucket as an IST day. Never show a provider-bucketed metric and an IST-bucketed metric side by side without a visible boundary label.
- If neither option is honest and usable, exclude the metric from weekly rankings.

Competition week:

- Opens Monday at 00:00:00 IST and closes Sunday at 23:59:59 IST.
- Closing values for cumulative (snapshot-only) metrics follow the boundary observation rule in Section 9.7: the last valid observation taken **at or before** the boundary. An observation taken after the boundary is never used as a closing value.
- A finalization job runs Monday at 00:30 IST from already-stored observations. It does not collect new boundary data.
- If no trustworthy pre-boundary observation exists, mark the weekly delta `UNAVAILABLE_FOR_PERIOD_ATTRIBUTION` or `PROVISIONAL`. Do not choose whichever observation produces a convenient result.

Use a consistent timezone-aware period utility. Do not rely on a server's default timezone.

## 9.2 Leaderboard eligibility

A participant is eligible for a given metric only when:

- The class membership is active.
- The user opted into leaderboard participation.
- The relevant provider account is verified.
- The metric is supported by an approved capability.
- Data coverage and freshness rules pass.
- The period is comparable and finalized, where applicable.
- No unresolved ownership dispute affects the account.

Eligibility is metric-specific. A user may be eligible for GitHub but
not LeetCode.

## 9.3 Platform-specific leaderboards

Initial release candidates:

- GitHub contribution activity / active days.
- GitHub consistency, if date-level coverage passes.
- LeetCode cumulative solved count, only if verified and reliably accessible.
- HackerRank supported cumulative metric(s), only if verified and reliably accessible.
- Most Improved for each metric only when comparable periods exist.

Do not create a leaderboard merely because a provider has some number
available. Each metric needs a documented meaning and fairness review.

## 9.4 Consistency

Initial formula:

`consistency_rate = qualifying_active_days / eligible_observed_days × 100`

Rules:

- An active day must be supported by the metric's definition.
- A day with unavailable data is not an inactive day.
- Require at least 90% coverage for a finalized GitHub consistency result.
- Snapshot-only platforms are not eligible for daily consistency unless they provide reliable daily activity data.
- Show the period and coverage alongside the percentage.

## 9.5 Most Improved

Compare the current completed period with a **rolling four-week
baseline** of the same metric, excluding the current period, using only
comparable completed periods with sufficient data quality. For a weekly
metric, use the mean of up to four valid prior weeks and require at
least three valid baseline weeks for a finalized improvement result.

For count metrics:

- `baseline = mean(valid comparable values from the prior four completed weeks)`.
- `delta = current_period_value - baseline`.
- Display the absolute delta and baseline values; do not rely on a percentage alone.
- Percentage change may be shown only when the baseline is greater than zero.
- If the baseline is zero, show the absolute increase and suppress percentage growth.
- If the baseline/current period is missing, incomplete, or non-comparable, show `INSUFFICIENT_BASELINE`.
- Never compare a partial week with a full week without a documented normalization policy.
- For capped metrics such as active days out of seven, explain saturation: someone already at 7/7 cannot improve on that metric. Show sustained consistency rather than labelling them as not improving.
- Display the baseline window and the number of valid weeks used. This reduces, but does not eliminate, strategic sandbagging; TWM must not claim it prevents manipulation.

## 9.6 Tie policy

Use deterministic ties:

1. Equal metric values share the same rank.
2. Use competition ranking: `1, 2, 2, 4`.
3. Do not use username, signup time, or hidden data as an undisclosed tie-breaker.
4. If a secondary display sort is needed, sort alphabetically without changing rank.
5. State the tie policy in the UI.

## 9.7 Snapshot-only weekly rules (boundary observation rule)

This section applies to any metric where the provider exposes only a current cumulative total. That is the expected case for LeetCode and HackerRank unless Phase 0 proves otherwise.

1. **Observation schedule.** One global schedule for all participants. Proposed: an observation every 3 hours, plus a dedicated pre-close observation at Sunday 23:45 IST. The final cadence is set in Phase 0 from rate limits and terms.
2. **Boundary value.** For each week, the boundary value is the latest valid observation with `observed_at` at or before Sunday 23:59:59 IST. A current-total endpoint cannot be rewound, so an observation taken after the boundary is never used as the closing value.
3. **Weekly delta.** `delta = boundary_value(this week) − boundary_value(previous week)`. Label it "week ending <observed_at, IST>" and show the boundary gap.
4. **Stored fields.** Store `scheduled_boundary_at`, `observed_at`, and `boundary_gap`. Never pretend the observation happened at the scheduled time.
5. **Finalization.** A weekly delta is finalized only when both boundary observations exist, are valid, and each has `boundary_gap` within the configured maximum (proposed starting value: 3 hours). Otherwise mark it `PROVISIONAL` or `UNAVAILABLE_FOR_PERIOD_ATTRIBUTION`.
6. **Acknowledged trade-off.** Activity between the last pre-boundary observation and midnight falls into the next week's delta. Because all participants share the same schedule, the effect is comparable across people. Say so in the explanation UI. A user-triggered sync made before the boundary may serve as the boundary observation.
7. **Provider history.** If Phase 0 shows the provider can return a value as of a past timestamp, prefer that and record it as provider-supplied history.
8. **Cold start.** A newly connected account shows cumulative profile stats if available, but gets no period-improvement rank until two comparable boundary observations exist.
9. **No invented detail.** Never infer which day or submission within the interval produced a change. Describe it as "change between observations".

## 9.8 Overall leaderboard

**Disabled in the initial release.**

Do not combine raw GitHub, LeetCode, and HackerRank values. Do not replace missing metrics with zero. Reconsider only after a pilot produces enough evidence to define:

- A transparent objective.
- Comparable normalization.
- Platform eligibility.
- Missing-provider behavior.
- Weighting rationale.
- Sensitivity and fairness tests.
- Versioning and effective dates.
- A dispute and correction policy.

For a class of approximately 60, a complex weighted formula is not
automatically justified by data.

------------------------------------------------------------------------

# 10. AI scope and architecture

## 10.1 Initial AI features

### Feature A — Weekly Developer Recap

-   Uses verified, stored metrics and period comparisons.
-   Summarizes observed activity and change.
-   Suggests a small, non-judgmental next focus.
-   Clearly mentions incomplete or stale provider data.
-   Does not claim to know effort, mastery, or activity outside
    observable sources.
-   Generates after the period is finalized or when the user requests a
    refresh.
-   Cache results by user, period, data version, prompt version, and
    model version.

### Feature B — Limited Leaderboard Insights

-   Backend computes every score and rank deterministically.
-   AI receives only the relevant, validated aggregate facts.
-   AI can summarize verified movements and trends.
-   AI must not invent causal explanations.
-   If the data cannot explain a rank change, say that the available
    data does not establish a cause.
-   Prefer deterministic templates for common explanations; call AI only
    when it adds clear value.

### Feature C — Lightweight Semantic Developer Search

-   User asks natural-language questions about technical interests.
-   TWM searches stored, permitted profile/project metadata.
-   AI may convert a query into a validated set of tags or search
    filters.
-   PostgreSQL full-text search, structured tags, and ordinary filters
    are the initial implementation.
-   No separate vector database or embedding pipeline in the initial
    release.
-   Reconsider semantic embeddings only after search quality is measured
    and keyword/tag search is demonstrably insufficient.

## 10.2 Required internal capability: Developer Intelligence

Semantic search depends on profile intelligence. It is a shared data
pipeline, not necessarily a separate user-facing feature.

Pipeline:

1. Collect permitted profile bios, repository descriptions, README text, and approved public metadata.
2. Enforce size limits and strip irrelevant markup.
3. Treat all retrieved content as untrusted data.
4. Extract a controlled schema of technologies, topics, project summaries, and evidence.
5. Validate the model output against a strict schema and allowed taxonomy.
6. Store source references, extraction timestamp, model/prompt version, and confidence/verification labels.
7. Index structured tags and searchable text in PostgreSQL.
8. Refresh only when source content changes or the user requests it.
9. Delete or recompute derived data when the source is disconnected or deleted, according to the retention policy.

The pipeline cannot solve data-access limitations. It can analyze only
content TWM is permitted to retrieve.

## 10.3 Facts versus inferences

Store extracted data with evidence type:

- `EXPLICIT_SOURCE`: directly stated in a profile or project source; it is source-backed, not a certification of skill.
- `SUPPORTED_INFERENCE`: inferred from clear project evidence; show as inferred, not verified.
- `SELF_DECLARED`: entered or edited by the user; useful for discovery but must not be presented as independently verified.
- `UNCONFIRMED`: uncertain; do not use as a verified filter or ranking fact.

Example: a README explicitly describing a project as a Flask application
may support a Flask tag. A repository containing one `.py` file does not
prove that the student is skilled in Python.

Show source context or evidence when practical. Let users correct their
own profile tags.

## 10.4 AI safety

-   Repository text and READMEs are untrusted input and may contain
    prompt-injection instructions.
-   Never let model output trigger privileged actions, change
    permissions, or execute code.
-   Use strict output schemas, length limits, allow-listed tags, and
    validation.
-   Do not send secrets, OAuth tokens, private repository contents, or
    unnecessary personal data to a model.
-   Use minimum necessary data and a configurable provider adapter.
-   Store model/prompt versions for reproducibility.
-   Do not make high-stakes decisions about students.
-   AI outage must not break dashboards or rankings.

## 10.5 NVIDIA API usage

The NVIDIA provider must be configurable:

- Model ID and endpoint come from server-side configuration.
- Keys stay in backend secrets.
- Model calls have timeouts, bounded retries, rate limits, and error handling.
- Cache outputs and avoid regenerating unchanged content.
- Use a replaceable interface so another model/provider can be used later.
- Verify the exact endpoint's current terms, rate limits, and production permissions before deployment.
- Do not describe access as unlimited unless the provider's applicable agreement explicitly guarantees it.
- If AI is disabled, use deterministic templates and keyword/tag search.

## 10.6 AI cost and request controls

-   Never call AI on every dashboard page load.
-   Do not repeatedly process unchanged repository content.
-   Set per-user and system-wide request budgets.
-   Use background jobs for recaps and profile enrichment.
-   Do not block provider sync waiting for an AI response.
-   Record usage, latency, error rate, cache hit rate, and estimated
    cost where available.
-   Allow the operator to disable AI without deploying a new frontend.

------------------------------------------------------------------------

# 11. Functional requirements

## 11.1 Authentication and membership

-   Use GitHub OAuth as the preferred login for the initial
    implementation, combined with college-email verification and/or an
    approved roster match. Do not collect GitHub passwords. If GitHub
    OAuth is unavailable for a user, define a deliberate fallback before
    implementation rather than silently adding a password system.
-   Email verification or approved membership process.
-   Invitation codes with expiry, use limits, and revocation.
-   Role-based permissions.
-   Session management and secure password recovery if password login is
    used.
-   No reliance on an easily leaked shared code as the only membership
    safeguard.

## 11.2 Profile management

-   Display name and username.
-   Connected provider identities and verification states.
-   Visibility controls.
-   Leaderboard opt-in.
-   Editable AI-derived interest tags.
-   Provider disconnect and data-deletion requests.
-   Clear source and last-updated labels.

## 11.3 Personal dashboard

-   Provider cards with status and freshness.
-   Supported cumulative statistics.
-   Supported period activity.
-   Personal history and trends.
-   Eligibility status and explanation.
-   Weekly recap when available.
-   Empty, loading, partial-data, stale, and error states.

## 11.4 Leaderboards

-   Provider and metric selector.
-   Period selector where the metric supports it.
-   Explicit metric definition and unit.
-   Last updated time.
-   Coverage and provisional/finalized status.
-   Eligibility explanation.
-   Deterministic rank and tie handling.
-   Opt-out respected immediately for future rankings.
-   No unsupported overall cross-platform score.

## 11.5 Developer search

-   Search by source-backed, inferred, and self-declared technology
    tags, with clear evidence labels and filters. Never call a
    user-editable tag independently verified.
-   Filter by connected platform and documented interest.
-   Natural-language query interpretation is optional and bounded.
-   Search results use only permitted, visible profile data.
-   No private repository content appears in results by default.
-   User can correct or remove AI-derived tags.

## 11.6 Notifications

Initial notifications:

- Provider connection verified or failed.
- Reauthorization required.
- Sync failure that requires user action.
- Weekly recap ready.
- Optional milestone notifications.

No noisy notifications for every commit or every rank movement by
default. Users control notification preferences.

## 11.7 Admin

-   Invite, approve, suspend, and remove members.
-   Set semester dates and community settings.
-   Inspect provider sync health without exposing credentials.
-   Review reported profile ownership disputes.
-   Record corrections with reasons.
-   View audit logs.
-   No hidden ability to change personal activity or ranking values
    without a recorded, reviewable correction.

------------------------------------------------------------------------

# 12. UX and design requirements

## 12.1 Design direction

-   Modern, polished developer-focused SaaS UI.
-   Clear hierarchy and readable statistics.
-   Strong dark-mode support; light mode may be included.
-   Responsive layouts for laptop and mobile.
-   Restrained motion for transitions and data visualization.
-   Avoid visual clutter and meaningless gamification.

## 12.2 Required states

Every data-bearing component must handle:

- Loading.
- Empty.
- Not connected.
- Pending verification.
- Partial data.
- Stale data.
- Sync failure.
- Unavailable provider.
- Opted out.
- Ineligible.
- Provisional metric.
- Finalized metric.

## 12.3 Transparency UI

Every leaderboard should explain:

- What is measured.
- Which provider field or derived metric is used.
- Which dates are included.
- When data was last updated.
- What coverage is available.
- Why a participant is eligible or ineligible.
- How ties are handled.
- Whether results are provisional or finalized.

------------------------------------------------------------------------

# 13. Recommended architecture

## 13.1 Architecture style

Use a modular monolith rather than a distributed microservice system.
Keep one codebase with clear modules and a separate worker process if
required. This is easier to maintain for a small team and a class-sized
deployment.

## 13.2 Stack

| Layer | Initial choice |
|---|---|
| Frontend | Next.js, React, TypeScript |
| UI | Tailwind CSS and a consistent component system |
| Charts | Recharts or another lightweight chart library |
| Motion | Framer Motion selectively |
| Backend | NestJS, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Background jobs | Evaluate a PostgreSQL-backed queue such as pg-boss first; validate its behavior with the selected PostgreSQL host, especially connection limits, worker availability, sleep/scale-to-zero, and scheduled-job reliability. Consider BullMQ/Redis only if a measured requirement justifies the added service. |
| AI | Configurable NVIDIA endpoint adapter, with non-AI fallback |
| Deployment | Choose after testing persistent workers, outbound access, secrets, DB connections, and costs |
| Observability | Structured logs, error tracking, job health, metrics |

Do not choose a host only because it makes the frontend easy to deploy.
Verify worker lifecycle, scheduled jobs, connection pooling, outbound
network behavior, backups, and production terms.

## 13.3 Logical components

1.  Web UI.
2.  Authentication and membership module.
3.  Provider connection module.
4.  Provider adapters.
5.  Synchronization worker.
6.  Normalization and data-quality module.
7.  Activity snapshot/event store.
8.  Metric and leaderboard engine.
9.  Developer Intelligence pipeline.
10. AI provider adapter.
11. Notification module.
12. Admin and audit module.

## 13.4 Data flow

`Provider → Authorized Adapter → Raw/Normalized Observation → Validation → PostgreSQL → Metric Engine → Dashboard/Leaderboard`

For AI enrichment:

`Permitted Profile Content → Sanitization → AI Extraction → Schema Validation → Evidence/Tag Storage → PostgreSQL Search Index`

For recaps:

`Finalized Period Metrics → Recap Job → AI or Deterministic Template → Validated Cached Result → Dashboard`

AI never replaces provider retrieval, data validation, or deterministic
scoring.

## 13.5 Provider adapter contract

Each adapter should expose equivalent internal operations, while clearly
indicating unsupported methods. Conceptually:

-   `beginConnection()`
-   `completeConnection()`
-   `verifyOwnership()`
-   `getCapabilities()`
-   `fetchProfile()`
-   `fetchSupportedStatistics()`
-   `fetchSupportedEvents()` if available
-   `fetchCumulativeSnapshot()` if available
-   `disconnect()`
-   `normalizeObservation()`

Unsupported operations return a typed capability result rather than a
fabricated empty array.

------------------------------------------------------------------------

# 14. Database model

Use PostgreSQL with explicit foreign keys, unique constraints,
timestamps, and appropriate indexes. Exact physical schema should follow
the validated provider fields.

## 14.1 Core entities

### `User`

Identity, authentication reference, account status, timestamps.

### `UserProfile`

Display name, visibility settings, leaderboard opt-in, profile
preferences.

### `ClassSpace`

Class identity, timezone, membership rules, semester configuration.

### `ClassMembership`

User, class, role, membership state, join/leave timestamps.

### `InvitationCode`

Hashed code, expiry, maximum uses, current uses, creator, revoked
status.

### `ProviderConnection`

User, provider, provider account ID, verification state, authorization
reference, scopes, connection timestamps.

### `ProviderCapability`

Provider, field, capability state, access method, validation evidence,
last tested time, policy status.

### `SyncState`

Connection, last attempt, last success, next scheduled run, failure
count, current status, error category.

### `ActivityEvent`

Provider, user, external event ID, event timestamp, observed timestamp,
normalized event type, permitted metadata, deduplication key.

### `ProviderProfileSnapshot`

Provider, user, snapshot timestamp, cumulative statistics, schema
version, data provenance, validation state.

### `DailyActivitySummary`

User, provider, date, supported activity count, active-day status,
coverage status, metric version.

### `PeriodActivitySummary`

User, provider, metric, period start/end, value, coverage, finalization
status, metric version.

### `LeaderboardDefinition`

Provider, metric, unit, eligibility policy, tie policy, metric version,
active state.

### `LeaderboardPeriod`

Definition, start/end, timezone, state, snapshot deadlines, finalization
timestamp.

### `LeaderboardResult`

Period, user, value, rank, eligibility reason, data version, calculation
timestamp.

### `ScoringPolicy`

Versioned metric definitions and rule configuration. No initial overall
score policy is enabled.

### `DeveloperInterestTag`

User, tag, evidence type, source reference, confidence/validation state,
extraction version, updated timestamp.

### `ProjectMetadata`

Provider, repository/project reference, allowed metadata, source hash,
last inspected timestamp, visibility.

### `AIEnrichment`

User or project, output schema version, model/prompt version, content
hash, result status, timestamp.

### `WeeklyRecap`

User, period, input data version, generated content, model/prompt
version, status, created timestamp.

### `Notification`

User, type, content reference, read status, timestamp.

### `NotificationPreference`

User, notification type, enabled state.

### `AuditLog`

Actor, action, target type/ID, reason, timestamp, safe metadata.

### `BackgroundJob`

Job type, idempotency key, payload reference, state, attempts, next
retry, error category, timestamps.

### `DataDeletionRequest`

User, request type, state, requested/processed timestamps, completion
summary.

## 14.2 Data model exclusions

Do not create tables for teams, questions, assignments, submissions,
academic grades, code execution, or AI skill scores in the initial
release.

## 14.3 Storage rules

-   Do not store raw private repository content by default.
-   Do not store third-party passwords.
-   Store OAuth tokens only if necessary, encrypted at rest, with
    restricted access.
-   Avoid storing complete API responses when a normalized subset is
    enough.
-   Keep source timestamps and retrieval timestamps separate.
-   Deduplicate provider events with stable keys where available.
-   Keep schema versions for normalized records and AI outputs.
-   Design deletion and anonymization paths before launch.

------------------------------------------------------------------------

# 15. API design domains

Exact route names may change, but APIs should be grouped by
responsibility.

## 15.1 Authentication and membership

-   Registration/login/session endpoints.
-   Email verification.
-   Join class and accept invitation.
-   Membership status and preferences.

## 15.2 Provider connections

-   Start connection.
-   Complete OAuth or verification.
-   Read connection status and capabilities.
-   Request sync.
-   Disconnect provider.

## 15.3 Activity and statistics

-   Personal provider summary.
-   Historical snapshots.
-   Period summaries.
-   Coverage and freshness status.

## 15.4 Leaderboards

-   List supported metrics.
-   Read leaderboard by provider, metric, and period.
-   Read eligibility explanation.
-   Read calculation definition.
-   Report a disputed result.

## 15.5 Developer intelligence

-   Read and correct interest tags.
-   Search visible developer profiles.
-   Read project metadata.
-   Request safe re-enrichment.

## 15.6 Admin

-   Membership and invitation management.
-   Provider capability status.
-   Sync health.
-   Semester settings.
-   Audit history.
-   Dispute resolution.

## 15.7 API rules

-   Validate all inputs.
-   Enforce authorization at the backend, not only in the UI.
-   Rate-limit expensive endpoints.
-   Use pagination.
-   Return typed errors and data statuses.
-   Do not expose tokens, private provider responses, or internal stack
    traces.
-   Use idempotency keys for operations that may be retried.

------------------------------------------------------------------------

# 16. Synchronization and background processing

## 16.1 Job types

-   Initial provider sync.
-   Periodic provider sync.
-   Retry after transient failure.
-   Snapshot finalization.
-   Metric recomputation.
-   Leaderboard calculation.
-   Profile metadata refresh.
-   AI tag extraction.
-   Weekly recap generation.
-   Notification delivery.
-   Data deletion processing.

## 16.2 Job requirements

-   Durable storage.
-   Idempotent handlers.
-   Bounded exponential backoff with jitter.
-   Maximum retry count and dead-letter/error state.
-   Provider-specific rate limiting.
-   Per-user/provider concurrency limits.
-   Timeouts and cancellation.
-   Metrics for queue depth, latency, failure rate, and retry count.
-   Manual retry from an authorized admin interface.
-   No infinite retry loops.

## 16.3 Sync cadence

The exact cadence must respect provider limits and terms, and is validated in Phase 0. Proposed starting point:

- **GitHub:** periodic sync every 6 hours (configurable), plus rate-limited user-triggered sync.
- **Cumulative-only providers:** an observation every 3 hours on one global schedule, a pre-close observation at Sunday 23:45 IST, and rate-limited user-triggered sync.
- **Monday 00:30 IST:** weekly finalization job, computed from stored observations.
- **Retries:** bounded exponential backoff with jitter. A retried observation taken after the boundary is never used as a boundary value.
- **AI enrichment:** only when relevant content changes or on explicit refresh.
- **Provider failure:** never blocks other providers' jobs.

Configure cadence centrally so it can be adjusted without code changes.

------------------------------------------------------------------------

# 17. Security, privacy, and governance

## 17.1 Security controls

-   HTTPS everywhere.
-   Secure, HttpOnly, SameSite cookies where applicable.
-   CSRF protection for cookie-based state-changing requests.
-   OAuth state validation and strict redirect allow-lists.
-   Server-side secret storage.
-   Encryption for stored provider tokens.
-   Least-privilege scopes.
-   Input validation and output encoding.
-   Authorization checks on every protected endpoint.
-   Rate limiting and abuse controls.
-   Dependency and secret scanning.
-   Database backups and tested restore procedures.
-   Structured security logging without tokens or unnecessary personal
    data.
-   Admin action audit trail.
-   Incident response and key-rotation procedures.

## 17.2 Visibility

Provide separate controls for:

- Profile visibility.
- Provider-link visibility.
- Developer-interest tag visibility.
- Leaderboard participation.
- Notification preferences.

A student can opt out of leaderboards without losing access to personal
statistics.

## 17.3 Retention defaults

Proposed initial policy, to be reviewed before launch:

- Active provider snapshots and activity summaries: retain for up to the configured course-history window, with **five academic years as the proposed default** to support an integrated five-year programme, provided provider terms and user consent allow it. Allow users to delete their data sooner.
- Raw provider payloads: avoid storing them unless necessary; if temporarily stored for debugging, delete within 7 days.
- AI-derived profile tags and recaps: delete or regenerate when source data is removed, disconnected, or materially changed.
- Security/admin audit records: retain for **two years as the proposed default**, subject to applicable law, provider terms, and data minimization. Restrict access and avoid storing sensitive payloads in logs.
- Backups: expire within 30 days, with deletion propagation documented.
- At the end of the course-history window, delete or anonymize old activity records unless the user has a valid, disclosed reason to retain them.

The final retention policy must account for provider terms, applicable
law, operational needs, and user expectations. Do not promise immediate
physical deletion from backups if the actual backup cycle does not
support it.

## 17.4 Deletion versus historical leaderboard records

Privacy and valid deletion requests take precedence over preserving
identifiable leaderboard history.

On deletion:

- Remove or anonymize identifiable user records.
- Delete provider tokens and derived profile data.
- Recalculate or anonymize affected historical rankings as defined by policy.
- Retain only minimal security records where necessary and permitted.
- Do not keep identifiable personal activity indefinitely solely to preserve historical rank.

## 17.5 Admin conflict of interest

Because the product owner may also compete:

- Name an independent co-administrator during Phase 1, and in any case before any competitive ranking is visible to classmates. If no independent reviewer is available, disable self-affecting manual corrections and pause disputed decisions until a neutral reviewer is appointed.
- Use an independent co-administrator for disputes and corrections.
- Log changes to membership, metric definitions, eligibility, and leaderboard corrections.
- Require a reason for manual correction.
- Apply competition-policy changes prospectively.
- Do not allow silent edits to the owner's own results.
- Make the correction process visible and reviewable.
- A database owner can technically alter data, so ordinary audit logs are not tamper-proof against a privileged operator. Mitigate this with append-only observation records at the application layer, recomputation of derived metrics from stored observations, restricted production DB access, backups, and periodic export of signed/checksummed audit summaries to a separately controlled location. Document this as tamper-evident operational control, not an absolute guarantee.

## 17.6 Compliance gate

Before launch, review:

- Provider API terms and data-retention requirements.
- Privacy notice and consent.
- College email/domain restrictions if used.
- Applicable Indian privacy and data-protection requirements.
- Hosting and AI-provider terms.
- Age and consent requirements relevant to the actual participants.

This plan is not a substitute for legal advice.

------------------------------------------------------------------------

# 18. Testing strategy

## 18.1 Unit tests

-   Metric calculations.
-   Coverage calculations.
-   Eligibility rules.
-   Tie handling.
-   Period and timezone boundaries.
-   Most Improved baseline behavior.
-   Snapshot delta attribution.
-   Capability-state transitions.
-   Ownership challenge expiry.
-   Output schema validation.
-   Deletion and anonymization logic.

## 18.2 Integration tests

-   Provider authorization and callback flows.
-   Provider adapters against controlled fixtures and test accounts.
-   Pagination and rate-limit responses.
-   Database transactions and uniqueness constraints.
-   Durable job retry and idempotency.
-   AI provider timeout and malformed response.
-   Search index updates.
-   Account disconnection and token deletion.

## 18.3 End-to-end tests

1.  Register, verify membership, and opt in.
2.  Connect a supported provider and verify ownership.
3.  Observe initial sync and dashboard rendering.
4.  View a platform-specific leaderboard.
5.  Trigger a provider failure and verify that data is not converted to
    zero.
6.  Test an unverified profile and confirm ranking exclusion.
7.  Complete a week and finalize supported metrics.
8.  Generate a recap and verify it cites only supplied facts.
9.  Search for a technical interest and inspect evidence.
10. Opt out and confirm exclusion from competitive rankings.
11. Disconnect a provider and verify future collection stops.
12. Delete an account and verify the retention/deletion workflow.
13. Review admin correction audit records.

## 18.4 Fairness tests

-   Two users with identical values receive the same rank.
-   Missing provider data never becomes a competitive zero.
-   A newly connected account cannot receive an unsupported weekly
    delta.
-   Partial coverage cannot enter a finalized consistency ranking.
-   A post-boundary observation is never used as a closing value, and no late observation can silently move activity to another period.
-   A score correction is auditable.
-   Opted-out users do not appear in future leaderboards.
-   AI-generated prose cannot change deterministic values.

## 18.5 Security tests

-   Broken access control between users.
-   OAuth CSRF/state handling.
-   Expired or replayed verification challenge.
-   Rate-limit bypass attempts.
-   Secret leakage in logs.
-   Prompt injection in profile text and README content.
-   Malformed AI JSON.
-   Unauthorized admin actions.
-   Cross-user profile-data exposure.
-   Deletion propagation through derived records and search indexes.

------------------------------------------------------------------------

# 19. Non-functional requirements

## 19.1 Reliability

-   A provider outage must not take down the full application.
-   Dashboard reads should remain available when AI is offline.
-   Background jobs must be retryable and idempotent.
-   Failed syncs must be visible and recoverable.

## 19.2 Performance targets

Proposed initial targets for a class-sized pilot:

- Typical dashboard API response: p95 under 500 ms, excluding provider calls.
- Typical leaderboard read: p95 under 500 ms.
- Search response: p95 under 700 ms.
- AI recap generation is asynchronous and may take longer; the UI should show a pending state.
- Provider calls never run synchronously on ordinary dashboard page loads.

Measure targets in the deployed environment and adjust based on observed
performance.

## 19.3 Accessibility and usability

-   Responsive layouts.
-   Keyboard-accessible controls.
-   Clear contrast and visible focus states.
-   Accessible labels and errors.
-   Avoid color-only status communication.
-   Explain metrics in plain English.
-   Make partial-data and error states understandable.

## 19.4 Observability

Track:

- Provider sync success and failure.
- Data freshness.
- Capability status.
- Job queue depth and retries.
- API latency and error rate.
- Database connection health.
- AI latency, errors, cache hit rate, and usage where available.
- Security and admin events.

Do not log secrets or unnecessary raw profile content.

## 19.5 Backup and recovery

-   Automated database backups.
-   Documented restore process.
-   Periodic restore test.
-   Recovery objectives appropriate to a student project.
-   Recompute derived metrics from stored source observations when
    possible.
-   Never assume a backup exists without testing restoration.

------------------------------------------------------------------------

# 20. Implementation roadmap and estimates

The estimates below assume one developer with classes, labs, and exam commitments. They are planning ranges, not guarantees. Provider access uncertainty can extend Phase 0 and integration work. Do not compress validation, security, or fairness work to meet a calendar date.

**Indicative total:** approximately 16–20 calendar weeks for the full scope at part-time student pace.

**Delivery order:** GitHub first. A private classmate pilot runs at roughly **week 8–10**, before LeetCode, HackerRank, and AI are built. Real feedback on the GitHub experience shapes the remaining phases. Do not promise a fixed date before the Phase 0 report.

## Phase 0 — Feasibility and decision lock (about 2 weeks)

Deliverables:

- Provider/field capability matrix.
- Approved access methods.
- Ownership verification results.
- History and timestamp behaviour, including GitHub day-bucket semantics.
- Boundary observation and cadence test results (Section 26.6).
- Hosting and background-worker compatibility test.
- Terms/policy review.
- Metric definitions and capability gates.
- Final go/no-go record.

Exit criteria:

- Every proposed leaderboard metric is backed by a tested field and method.
- Unsupported fields are explicitly disabled or downgraded.
- No provider is represented as fully supported without evidence.
- A separate **Phase 0 Results Report** of 1–2 pages records test account, date, environment, method, field-by-field outcome, terms/policy references, evidence, limitations, and go/no-go decision.
- The report is approved before implementation scope is treated as locked.

## Phase 1 — Foundation (about 2 weeks)

Deliverables:

- Repository setup, environments, database, migrations.
- GitHub OAuth login, college-email verification, and class roster import.
- Class membership, invitation lifecycle, and roles.
- Profile visibility and leaderboard opt-in.
- Audit logging and secret handling.
- **Independent co-administrator named** (Section 17.5).

Exit criteria:

- Secure onboarding and role checks pass tests.
- A co-administrator is named, or self-affecting manual corrections are disabled.

## Phase 2 — GitHub vertical slice (about 4–5 weeks)

Deliverables:

- Provider adapter interface and the GitHub adapter.
- Verified GitHub connection, initial sync, and durable background jobs.
- Snapshot/event storage, deduplication, and data-retrieval coverage tracking.
- Personal dashboard with GitHub card, status, freshness, and partial/error states.
- GitHub leaderboards (active days and consistency, per Phase 0 results), eligibility rules, ties, provisional/finalized states, and calculation explanations.
- Fairness and authorization tests for this slice.

Exit criteria:

- GitHub metrics sync without duplicate inflation; missing data stays explicit.
- Fairness tests pass; no overall score is enabled.

**Pilot checkpoint A (about week 8–10).** Private pilot with a few classmates. Review data accuracy, the low-bar active-day definition, and onboarding. Decide what changes before Phase 3.

## Phase 3 — LeetCode and HackerRank (about 3–4 weeks)

Deliverables:

- LeetCode and HackerRank adapters for the fields that passed Phase 0.
- Ownership verification for each provider that supports it.
- Global observation schedule and boundary observation rule (Section 9.7).
- Provider cards, capability labels, and cumulative-only leaderboards.
- Providers that failed Phase 0 shown honestly as `LIMITED`, `LINKED_UNVERIFIED`, or `UNAVAILABLE`.

Exit criteria:

- Each provider works independently for every approved field, with clear failure states.
- Weekly deltas are finalized only under the boundary observation rule.

## Phase 4 — Competition completion (about 2 weeks)

Deliverables:

- Most Improved with the rolling four-week baseline.
- Weekly period finalization and historical period views.
- Eligibility and calculation explanation screens.
- Dispute/report flow connected to the co-administrator process.

Exit criteria:

- All fairness tests pass; rankings are explainable and reproducible.

## Phase 5 — Focused AI and developer search (about 2–3 weeks)

Deliverables:

- Developer Intelligence extraction pipeline.
- Controlled tags and project summaries.
- PostgreSQL-backed developer search.
- Weekly recaps and limited leaderboard insights.
- AI fallback, cache, schema validation, and usage controls.

Exit criteria:

- AI cannot change rankings or expose unsupported facts; core features work with AI disabled.

## Phase 6 — Hardening and full pilot (about 2 weeks)

Deliverables:

- End-to-end, security, and fairness tests.
- Privacy and deletion verification.
- Backup restore test.
- Admin oversight review.
- Pilot with the wider class; bug and adoption review.

Exit criteria:

- No unresolved critical security or data-integrity defects.
- Data limitations and participation are visible.
- Provider and AI access terms are confirmed for the deployment model.

## Phase 7 — Launch and iteration

Deliverables:

- Production monitoring.
- User onboarding guide.
- Support/dispute process.
- Pilot feedback backlog.
- Post-launch review of data quality, adoption, and performance.

------------------------------------------------------------------------

------------------------------------------------------------------------

# 21. Launch acceptance checklist

## Product

-   [ ] Product boundaries are reflected in the UI and schema.
-   [ ] The three providers have independent capability states.
-   [ ] The overall cross-platform score is disabled.
-   [ ] Participation opt-in works.
-   [ ] Low adoption is clearly labelled.

## Data

-   [ ] Every metric has a definition and source.
-   [ ] Missing is distinct from zero.
-   [ ] Data freshness and coverage are visible.
-   [ ] Snapshot-only metrics are not mislabelled as event-based.
-   [ ] Event deduplication is tested.
-   [ ] Cold-start behavior is tested.

## Verification and fairness

-   [ ] Provider ownership is verified before ranking.
-   [ ] Unsupported verification methods are not accepted as proof.
-   [ ] Ties are deterministic.
-   [ ] Weekly boundary cases are tested: the closing value is the last observation at or before the boundary, and no post-boundary observation is used.
-   [ ] Provider-native day buckets (for example GitHub UTC days) are labelled correctly and never shown as IST days.
-   [ ] Most Improved handles zero and missing baselines.
-   [ ] Corrections are auditable.

## AI

-   [ ] AI receives only necessary, permitted data.
-   [ ] Outputs are schema-validated.
-   [ ] Prompt injection is tested.
-   [ ] Model output cannot change ranks.
-   [ ] AI can be disabled without breaking the application.
-   [ ] API terms and production access are checked.
-   [ ] Results are cached and usage is bounded.

## Privacy and operations

-   [ ] Visibility and opt-out controls work.
-   [ ] Disconnect stops future collection.
-   [ ] Deletion propagates to derived data and search indexes.
-   [ ] Token storage and logging are secure.
-   [ ] Backups restore successfully.
-   [ ] Admin conflicts are covered by independent review, and the co-administrator is named.
-   [ ] The participation percentage uses an imported class roster as its denominator.
-   [ ] Login works through GitHub OAuth and no passwords are collected.
-   [ ] Monitoring and incident response are documented.

------------------------------------------------------------------------

# 22. Decisions register

| Decision | Initial status |
|---|---|
| GitHub, LeetCode, HackerRank are in the intended initial product experience | Committed as product goal; each provider's competitive capability is conditional on Phase 0 |
| Provider capabilities must pass Phase 0 | Committed |
| No scraping or access-control bypass | Committed |
| Unverified profiles cannot enter competitive rankings | Committed |
| Missing data is not zero | Committed |
| Timezone is `Asia/Kolkata` | Committed |
| Weekly period is Monday–Sunday | Committed |
| GitHub finalized consistency requires at least 90% successful retrieval coverage for expected provider data; this is not proof of complete real-world activity | Proposed initial default |
| Cumulative-only weekly closing value is the last valid observation at or before Sunday 23:59:59 IST | Committed |
| Global observation schedule: every 3 hours plus Sunday 23:45 IST; weekly finalization Monday 00:30 IST | Proposed initial default; validate in Phase 0 |
| Maximum boundary gap for a finalized weekly delta is 3 hours | Proposed initial default |
| Verification challenge expires after 15 minutes | Proposed initial default, if this method is supported |
| Leaderboard participation is opt-in | Committed |
| Low adoption threshold is 70% | Proposed initial default |
| Overall cross-platform score is deferred | Committed |
| Weekly Developer Recap is in initial AI scope | Committed |
| Leaderboard Insights are limited to evidence-backed explanations | Committed |
| Semantic search uses PostgreSQL tags/full-text first | Committed |
| AI can be disabled without breaking core features | Committed |
| Five-year activity history, two-year audit history, and 30-day backup expiry in Section 17 are initial proposals | Must be reviewed before launch |
| Exact provider fields and sync cadence | Must be validated in Phase 0 |
| Hosting provider and queue technology | Choose after compatibility tests |
| Semester dates | Admin-configured before semester competition opens |
| Provider-native day buckets (for example GitHub UTC days) are labelled as such, never relabelled as IST | Committed |
| GitHub OAuth is the login method; college email or roster match confirms membership | Committed |
| Class roster is imported so participation percentages have a real denominator | Committed |
| Independent co-administrator is named in Phase 1 | Committed |
| Delivery is GitHub-first with a classmate pilot at about week 8–10 | Committed |

Any change to a committed decision must be recorded with a rationale,
affected requirements, migration impact, and approval. Do not silently
reintroduce an excluded feature.

------------------------------------------------------------------------

# 23. Key risks and mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Provider does not expose intended fields | Core metrics unavailable | Phase 0 capability gate; downgrade honestly |
| Ownership cannot be verified | Leaderboard manipulation | Exclude unverified accounts |
| Provider rate limits or blocks deployment | Stale data | Test hosting early; bounded sync cadence; visible failure state |
| Snapshot timing is insufficient | Wrong weekly rankings | Cold-start and period-attribution rules |
| Users optimize for raw volume | Gaming and unhealthy competition | Prefer active days and transparent metric-specific rankings |
| Low adoption | Unrepresentative rankings | Participation threshold and explicit participant count |
| AI hallucination | Misleading summaries | Evidence-bound input, schema validation, deterministic metrics |
| AI endpoint becomes unavailable | Feature degradation | Cache and non-AI fallback |
| API terms change | Compliance or service failure | Configurable adapters and periodic policy review |
| Admin conflict of interest | Loss of trust | Independent co-admin and audit trail |
| Deletion conflicts with history | Privacy breach | Remove/anonymize identifiable history |
| Infrastructure complexity | Slow delivery and outages | Modular monolith, minimal durable queue, no premature microservices |

------------------------------------------------------------------------

# 24. Product success metrics

TWM should evaluate whether it is useful and trustworthy, not only
whether users visit the leaderboard.

## Adoption

-   Percentage of class members who register.
-   Percentage of registered members who verify membership.
-   Percentage of participants who connect at least one provider.
-   Percentage of participants opting into rankings.

## Data quality

-   Sync success rate by provider.
-   Median age of last successful sync.
-   Percentage of leaderboard entries with valid coverage.
-   Duplicate observation rate.
-   Number of incorrect profile links reported.
-   Time to resolve a data dispute.

## Engagement

-   Weekly active participants.
-   Percentage returning to view personal progress.
-   Weekly recap view rate.
-   Search usage and successful discovery sessions.
-   User-reported motivation and fairness.

## Trust and safety

-   Number of privacy complaints.
-   Number of ranking corrections.
-   Number of unverified accounts blocked from rankings.
-   Deletion completion time.
-   Critical security issues.
-   AI factual error reports.

Do not optimize solely for higher commit counts, more API calls, or more
AI-generated content.

------------------------------------------------------------------------

# 25. Release and rollback strategy

-   Use feature flags for each provider, metric, and AI capability.
-   A provider can be disabled without disabling other providers.
-   A metric can be hidden if its source quality becomes unreliable.
-   A policy or scoring change must have a version and effective date.
-   Do not retroactively alter finalized rankings without a recorded
    correction.
-   Keep database migrations backward-compatible where practical.
-   Maintain a rollback plan for failed deployments.
-   If a provider changes its terms or access method, pause the affected
    collection until reviewed.
-   If AI is down, show cached content with its timestamp or a
    deterministic fallback.

------------------------------------------------------------------------

# 26. Phase 0 field-by-field validation checklist

This checklist is an execution document, not a claim that the tests have
already passed. Run it using test accounts and the intended deployment
environment. Record screenshots/log snippets or sanitized responses as
evidence; never store secrets in the report.

## 26.1 Test record template

For each test, record:

- Test ID.
- Provider and field.
- Date/time and timezone.
- Test account and whether it is controlled by the tester.
- Environment: local development and intended hosted environment.
- Method/API/endpoint and applicable permissions.
- Expected result.
- Actual result.
- HTTP/status code and sanitized error category.
- Rate-limit behavior.
- Historical depth and timestamp semantics.
- Ownership-verification outcome.
- Terms/policy review reference.
- Pass/fail/limited status.
- Impact on product and ranking eligibility.

## 26.2 GitHub test script

1.  Create or use a test GitHub account controlled by the project owner.
2.  Test OAuth authorization with minimum scopes and verify callback
    `state`.
3.  Store and compare the immutable GitHub account ID; confirm username
    changes do not create a new identity.
4.  Query the documented contribution-calendar field using the intended
    GraphQL method and permissions.
5.  Record the returned date buckets and compare them with the account's
    visible contribution calendar for known test activity.
6.  Specifically test events near 00:00–05:30 IST and compare the
    provider-returned bucket with the expected IST day. Do not assume
    equivalence.
7.  Test the same account with private-contribution display settings
    changed, if the platform exposes such a setting and test setup
    permits it. Determine whether returned counts change.
8.  Test an account with no contributions and distinguish a valid zero
    from missing data.
9.  Test rate-limit responses, pagination, timeout, unauthorized
    response, and temporary provider failure.
10. Repeat sync and verify there is no duplicate inflation.
11. Verify no private repository content is collected by default.
12. Verify disconnected/revoked authorization stops future collection.
13. Repeat the connection/sync tests from the intended hosted environment.
14. Record which fields are safe for cumulative, daily, weekly, and
    consistency metrics.

**GitHub acceptance:** OAuth identity is reliable; access is permitted;
field semantics are documented; failure states are distinguishable;
hosted sync works; and the proposed metric is not mislabelled. If the
calendar is provider-bucketed rather than IST-bucketed, use
provider-native period semantics or exclude it from IST-weekly scoring.

## 26.3 LeetCode test script

1.  Identify the exact intended profile fields and their meaning.
2.  Verify that the retrieval method is permitted by current
    terms/policy.
3.  Test public and unavailable/private profile cases.
4.  Determine whether values are cumulative, event-based, or
    timestamped.
5.  Test repeat observations and whether the values remain stable when
    no activity occurs.
6.  Determine whether a valid ownership challenge can be published in a
    profile field and read back through the same permitted method.
7.  If not, test whether a provider-supported alternative exists;
    otherwise mark ownership verification unavailable.
8.  Test request failures, throttling, network access, and the intended
    hosted environment.
9.  Document whether a snapshot delta can legitimately be attributed to
    a TWM week.
10. Disable ranking eligibility for fields that fail any necessary test.

For every cumulative-only field, also run the boundary observation test in Section 26.6.

## 26.4 HackerRank test script

1.  Identify which personal/community profile fields are accessible
    under the intended account and permitted method.
2.  Confirm that any API documentation used actually applies to ordinary
    community profiles, not only enterprise accounts.
3.  Test public, unavailable, renamed, and inaccessible profile cases.
4.  Determine whether timestamps/history are available or only
    cumulative totals.
5.  Test repeat snapshots, rate limits, and error handling.
6.  Test ownership verification through a supported method.
7.  Test from the intended hosted environment.
8.  Record the applicable terms/policy review.
9.  Disable ranking eligibility for any field that lacks reliable
    access, ownership proof, or period attribution.

For every cumulative-only field, also run the boundary observation test in Section 26.6.

## 26.5 Hosting and background worker tests

1.  Deploy a minimal worker and schedule a harmless test job.
2.  Verify the worker remains available for the required schedule.
3.  Test what happens during deploy/restart, sleep, or scale-to-zero.
4.  Verify jobs survive worker restarts and execute at most once
    logically through idempotency.
5.  Test PostgreSQL connection limits and pooling under repeated jobs.
6.  Verify outbound access to each provider.
7.  Test secret injection and confirm keys never appear in logs.
8.  Test retry/backoff and terminal failure visibility.
9.  Test backup restoration.
10. Record hosting costs and operational constraints.

## 26.6 Boundary observation and cadence test (cumulative-only fields)

1. Record observations every 3 hours for at least two full competition weeks, or use a test account whose totals you change in a controlled way.
2. Include a pre-close observation at Sunday 23:45 IST.
3. Confirm each observation returns a stable value when no activity occurred.
4. Make a controlled change just before and just after Sunday 23:59:59 IST. Confirm the boundary rule attributes each change to the correct week and that no post-boundary observation is used as a closing value.
5. Measure the actual boundary gaps and the rate-limit headroom. Record the minimum safe observation interval.
6. Check whether the provider can return a value as of a past timestamp. If it can, record how.
7. Record whether this schedule complies with the provider's terms.
8. Record the outcome: finalizable weekly delta, provisional only, or not attributable.

## 26.7 Go/no-go decision template

For every provider/metric, choose exactly one:

- `GO — RANKING READY`
- `GO — PROFILE/DISPLAY ONLY`
- `LIMITED — SNAPSHOT ONLY`
- `NO-GO — UNVERIFIED OWNERSHIP`
- `NO-GO — ACCESS/POLICY`
- `NO-GO — PERIOD ATTRIBUTION`
- `NO-GO — HOSTING/RELIABILITY`

The Phase 0 report must state the minimum launch decision:

- If GitHub passes all minimum gates, a GitHub-first launch is permitted.
- LeetCode/HackerRank ranking features are enabled only for fields that pass their gates.
- If GitHub fails, do not launch live competitive rankings.
- No mock or test data may be presented as live user data.

------------------------------------------------------------------------

# 27. Final engineering rule

TWM is successful when it makes developer progress more visible
**without pretending that incomplete data is complete, that activity
equals skill, or that AI-generated language is evidence**.

Build in this order:

1.  Prove the data-access and ownership path.
2.  Build secure identity and provider connections.
3.  Normalize and validate observations.
4.  Make dashboards and platform-specific metrics reliable.
5.  Add transparent leaderboards and fairness rules.
6.  Add focused AI features on top of verified data.
7.  Pilot, measure trust and adoption, and iterate.

The ambition remains three connected platforms in one product. The
implementation earns each platform's ranking features through evidence
rather than assumptions.

**End of TWM Final Project Plan — Version 3.1**
