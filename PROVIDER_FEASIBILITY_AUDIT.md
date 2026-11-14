# TWM 3.1 — Provider Feasibility & Go-to-Market Reality Audit

**Date:** 2026-11-14 (probes run live, ~12:00 UTC / 17:30 IST)
**Author:** OpenCode (CLI deep auditor)
**Scope:** Can the plan's provider promises actually be delivered? If not, what do we ship instead?
**Method:** Live HTTP probes against every provider from this machine + the running app (`localhost:3000`) + SQLite inspection. Nothing below is inferred from documentation alone.

---

## 1. Executive verdict (CEO view)

**The engineering is real. The data underneath it is not.**

TWM's hard parts are already built and correct-ish: Sunday 23:59:59 IST boundary engine, deterministic `1,2,2,4` ranking, 70% quorum labelling, disputes with separation-of-duties, SQLite WAL, backups, Docker, CI. That is the expensive, defensible part — and it is done.

What is **not** done is the thing marketing would put on the landing page: a real, verified data pipeline. Three concrete blockers found today:

| # | Blocker | Severity | Evidence |
|---|---------|----------|----------|
| 1 | **HackerRank adapter is dead.** The endpoint it depends on returns 404 for every real user. | 🔴 Launch blocker for HR | `GET /api/telemetry/hackerrank?username=abhinav_kumar` → `{"status":"NOT_FOUND"}` for a real, existing account |
| 2 | **Leaderboard numbers are client-posted.** A browser (or `curl`) can write any `metricValue` into SQLite with no server-side re-verification. | 🔴 Brand-killer | `POST /api/telemetry/sync` accepts `metricValue` from the body |
| 3 | **No provider can produce a timestamped weekly delta except GitHub.** LeetCode gives cumulative totals only; HackerRank gives cumulative badges only. | 🟠 Product truth problem | LeetCode GraphQL `acSubmissionNum` is cumulative; HR `/badges` has no timestamps |

**Strategic conclusion:** the plan *is* achievable — but not as "three equal verified providers". It becomes achievable the moment we **add Codeforces as the anchor provider** (it is the only source that publishes per-submission timestamps, officially, free, no key) and **downgrade HackerRank honestly** instead of pretending it verifies.

Recommendation: **2-week hardening sprint → 10–15 student pilot in one section → only then write marketing copy.** Do not launch public claims before the pilot produces one real, audited Sunday boundary.

---

## 2. Live provider evidence (re-runnable)

| Provider | Endpoint tested | HTTP | Latency | Verdict |
|---|---|---|---|---|
| GitHub | `api.github.com/users/octocat` | 200 | 707 ms | ✅ Works. 60 req/hr unauthenticated, 5,000 with token (measured: `rate.core.limit` = 60 vs 5000) |
| GitHub | `/users/{u}/events/public` | 200 | — | ✅ Works, but only last 90 days / max 300 events |
| LeetCode | `leetcode.com/graphql` (`matchedUser`, `submitStatsGlobal`) | 200 | 1,448 ms | ✅ Works unauthenticated. Returns cumulative counts only |
| LeetCode | `profile.aboutMe` (ownership challenge) | 200 | ~1.2 s | ✅ Field exists — HMAC bio verification is viable here |
| LeetCode | `/api/submissions/` | **403** | — | ❌ Needs session cookie. No per-submission history available |
| HackerRank | `/rest/hackers/{u}/profile` | **404** | 0.7 s | ❌ **Dead.** Tested 3 real handles + 3 attempts each |
| HackerRank | `/rest/hackers/{u}/badges` | 200 | ~0.7 s | ✅ Works. Contains `solved`, `stars`, `current_points`, `hacker_rank` per domain |
| HackerRank | `/profile/{u}` (HTML) | **500** | 0.9 s | ❌ Bot-gated from a server. Not usable |
| Codeforces | `api/user.status` | 200 | 635 ms | ✅ **Official API. Per-submission `creationTimeSeconds` + `verdict` + problem tags** |
| Codeforces | `api/user.info`, `api/user.rating` | 200 | 1.1 s / 2.4 s | ✅ Works. Rating, rank, max rating |
| CodeChef | `codechef.com/users/{u}` (HTML) | 200 | ~5 s, 204 KB | ⚠️ Parseable (`rating-number`, `problems-solved` markers present) but undocumented, no API, ToS grey |
| GeeksforGeeks | `geeksforgeeks.org/user/{u}/` | 200/empty | 5.9 s | ❌ Bot-blocked. Body came back empty. Not viable without a headless browser farm |

**In-app confirmation (not just curl):**

```
GET localhost:3000/api/telemetry/hackerrank?username=abhinav_kumar
  → {"status":"NOT_FOUND","error":"HackerRank user 'abhinav_kumar' was not found."}   ← real account

GET localhost:3000/api/telemetry/leetcode?username=neal_wu
  → {"status":"SNAPSHOT_VERIFIED","metrics":{"totalSolved":253,...}}                  ← correct

GET localhost:3000/api/telemetry/github?username=octocat
  → {"status":"SUPPORTED_LIVE","telemetry":{"observedActiveDays":0,
     "observationCoveragePercent":94.2}}                                             ← 94.2 is a hardcoded constant
```

---

## 3. Per-provider truth table

| Provider | Read public profile | Weekly delta with timestamps | Ownership proof | Contractual risk | Honest capability label |
|---|---|---|---|---|---|
| **GitHub** | ✅ | ✅ (event stream, UTC, 90-day window) | ✅ OAuth (best) | Low — official API | `SUPPORTED_LIVE` |
| **Codeforces** | ✅ | ✅ **Best** — official per-submission UTC timestamps | ⚠️ No bio field; use handle+public proof link | Low — official API, 1 req / 2 s | `SUPPORTED_LIVE` |
| **LeetCode** | ✅ | ⚠️ Only via **our own Sunday snapshots** (cumulative diff) | ✅ `aboutMe` bio challenge | Medium — GraphQL is undocumented; `/api/submissions` 403s | `SUPPORTED_SNAPSHOT` |
| **HackerRank** | ⚠️ badges only | ❌ Never | ❌ No readable bio endpoint | Medium-high — internal REST endpoints | `LIMITED_CAPABILITY` → **`UNVERIFIED_DISPLAY`** |
| **CodeChef** | ⚠️ HTML scrape | ❌ No timestamps reliably | ❌ | High — scrapes against ToS | `DISABLED_POLICY` until partner approval |
| **GeeksforGeeks** | ❌ | ❌ | ❌ | High | `DISABLED_POLICY` |

**Read this next sentence carefully:** the plan's own §5.6 already says HackerRank must be excluded from weekly deltas. The code honours that. What the code *does not* honour is that HackerRank also has **no ownership verification** any more — so "verified" in the HR card is currently a false claim, not a capability downgrade.

---

## 4. The five defects that must close before any launch

### D1 — HackerRank adapter (P0, ~0.5 day) 🔴
`/api/telemetry/hackerrank/route.ts:45` calls `/rest/hackers/{u}/profile`, which is gone. Every HR connection dies as `NOT_FOUND`.

**Fix:** delete the profile call. `/rest/hackers/{u}/badges` returns 200 for real users and 404 for fake ones — that alone is a working existence check *and* a richer payload than we used (`solved: 6 of 64`, `current_points`, `hacker_rank` per domain). Derive display name from the handle.

**Fix in the same pass:** `/api/auth/hmac-challenge/route.ts:130` also calls the dead profile endpoint to read a bio. HackerRank has no readable bio → **remove HR from the challenge provider list**, return `PROVIDER_UNSUPPORTED_VERIFICATION`, and mark HR connections `UNVERIFIED_DISPLAY` in the UI. Honest beats broken.

Side benefit for marketing: `"43 problems solved in the Java domain · 3★ Python · rank 996,238"` is a *better* line than "5 stars".

### D2 — Client-posted metrics (P0, ~2–3 days) 🔴
`/api/telemetry/sync/route.ts` trusts `metricValue` from the request body. It also hardcodes `scheduledBoundaryAt: "2026-10-25T23:59:59.000Z"` — a date now 20 days in the past — and `boundaryGapSeconds: 0`.

That means:
- A student can `POST {"platform":"github","metricName":"active_days","metricValue":7}` and own the leaderboard.
- The stored boundary is wrong for every observation written since 25 Oct (verified in `telemetry_observations`: all 41 rows carry `scheduled_boundary_at = 2026-10-25`).
- The invariant "verified observations only" is enforced nowhere on the write path.

**Fix (the whole point of the product):** the sync endpoint becomes *"re-run the adapter for this student"* — it takes `{ platform }`, re-fetches from the provider **server-side**, computes the metric, and writes what it saw. No client-supplied numbers, ever. Compute `scheduledBoundaryAt` from the next Sunday 23:59:59 IST at write time (`finalizer` already knows how). This turns D2 from a vulnerability into the moat: *the server saw it, at this time, and can prove it.*

### D3 — Fabricated and demo-flavoured UI copy (P0, ~4 hours) 🔴
| Location | Claim | Reality |
|---|---|---|
| `api/telemetry/github/route.ts:236` | `observationCoveragePercent: 94.2 // Audited observation reliability` | Hardcoded constant. Rendered on the leaderboard as "Coverage". Violates §1.2 |
| `AppContext.tsx:559` | Toast: "**All 3 Telemetry Feeds Synced** … HackerRank X stars **verified**" | Fires regardless of provider failure. HR is returning `isVerified:false` today |
| `AppContext.tsx:467-469` | Falls back to `iam-kathir` / `neal_wu` / `alice` | Syncs the wrong person's data when a handle is missing |
| `PlatformMatrix.tsx:24` | "Retrieval Coverage · Audited · Min 90% required" | No coverage audit exists |
| Landing `StatsBar` | Cohort counts | Now live via `/api/stats/public` ✅ (already fixed) |

**Fix:** coverage = `daysWithAnyObservation / 7` computed from real buckets or the field is removed. Toast reports per-provider status (`GitHub ✓ · LeetCode ✓ · Codeforces ✓ · HackerRank unavailable`). No handle → no sync, show "Connect a handle first". Delete the `94.2`.

### D4 — Real credentials (P0, user action, ~1 hour) 🟠
`/api/health` right now: `githubOAuth:false`, `emailDelivery:false`, `emailProvider:"mock"`, `sessionSecured:false`.

- **`GITHUB_TOKEN`** → 60 → 5,000 req/hr. A 60-student class needs 120 calls per full sync; unauthenticated that is gone in 30 minutes. This is a one-line env var and the single highest ROI action on this list.
- **GitHub OAuth app** → the only real ownership proof for GitHub. No OAuth, no verified identity.
- **Resend or SendGrid** → college email OTP is built but cannot send. Login is therefore not launchable.
- **`TWM_SESSION_SECRET` + `TWM_HMAC_SECRET`** → both fail-closed in production, so the app will refuse to start today.

### D5 — Roster handles are placeholders (P0, data) 🟠
`roster_members` contains `aarav-dev`, `rohan-code`, `priya-n`, `aarav_algo`. These are seed values, not real accounts. All 41 observations belong to `usr-aarav`, and the GitHub ones are `0` active days — because the handle does not exist.

So the current board is **demo data wearing a verified badge**. Either label the whole board `Demo data` until real handles are imported (the `Demo data` chip exists in the header — keep it), or import the real section roster.

---

## 5. "If the providers can't be accessed, find a way"

This is the answer the plan needs, in priority order.

### Way 1 — Codeforces becomes the anchor ✅ (build it)
Codeforces is the **only** provider in this space that gives us exactly what §9.1 and §9.7 demand, for free, with an official contract:

```
GET https://codeforces.com/api/user.status?handle=tourist&from=1&count=100
→ creationTimeSeconds (UTC epoch, per submission)
→ verdict: "OK" | "WRONG_ANSWER" | ...
→ problem.tags, problem.rating
```

Weekly delta becomes **objective, not inferred**: count distinct problems with `verdict == OK` and `creationTimeSeconds` in `[last Sunday 23:59:59.1 IST, this Sunday 23:59:59 IST]`. No snapshot diffing, no cumulative arithmetic, no scraping, no ToS risk. It also fits the audience: Codeforces is *the* CP platform for Indian B.Tech CSE cohorts.

Cost: ~3–5 days (adapter + capability registry row + leaderboard tab + daily cache).

### Way 2 — Make LeetCode's delta self-referential ✅ (already half-built)
LeetCode will never give per-submission timestamps without a session cookie. But we do not need them: `src/lib/baseline.ts` already diffs our own consecutive Sunday snapshots. The rule stays honest as long as the UI says **"delta measured between TWM snapshots"**, not "LeetCode says you solved 12 this week". Cold start is `null` → `Pending`, never `0`. Already correct. Keep it.

### Way 3 — HackerRank badges-only, honestly labelled ✅ (D1)
`/badges` is alive and rich. Ship it as `UNVERIFIED_DISPLAY`: "self-reported public badge evidence, excluded from weekly competition, ownership not machine-verifiable". The plan already permits `UNVERIFIED`. This is a downgrade in wording, not a loss of function.

### Way 4 — Server-side observation crawler (replaces the client trust) ✅ (D2)
One scheduled job (the `boundary-scheduler.mjs` daemon already exists) walks the roster, calls each adapter with a token + cache, writes observations. Browser sync becomes a *trigger*, not a *source*. This is also how we survive rate limits: `GITHUB_TOKEN` + 5-min cache + per-provider backoff + honours `x-ratelimit-reset`.

### Way 5 — "Bring your proof" fallback for closed providers (only if 1–4 fail)
For any provider that blocks us (CodeChef, GFG today): student submits a **public profile URL + timestamped screenshot**; the existing two-person dispute flow (`/api/disputes`, separation-of-duties already enforced) approves it. State explicitly in the UI: `Audited assertion — not machine-verified`. This lets a cohort onboard **today** without a single new provider integration, and the audit trail is already built. Never call it "verified".

### Way 6 — Ask for access (the only real fix for CodeChef/GFG)
CodeChef and GeeksforGeeks both run college partnership programmes. One email from a faculty sponsor asking for sanctioned read access (or a CSV export of a batch) is worth more than 200 lines of scraping code, and it removes the ToS exposure the plan explicitly forbids (§4.1 "scraping that violates provider terms"). Track it as a business task, not an engineering task.

---

## 6. Marketing claims: what we can say on Monday, and what we must delete

**Can say now (verified today):**
- Reads public GitHub, LeetCode (and soon Codeforces) profiles — no passwords, no private code, no surveillance.
- One ruleset, one closing time: **Sunday 23:59:59 IST**, every week, same for everyone.
- Deterministic ranking, ties share a rank, disputes audited by two people.
- Honest capability labels per provider — we show "unavailable" instead of inventing a number.
- Data export, deletion, and a privacy policy that names every field.

**Must delete or rewrite (currently false or unprovable):**
| Claim | Where | Action |
|---|---|---|
| "Retrieval Coverage · Audited · Min 90% required" + `94.2%` | `PlatformMatrix`, GitHub adapter, leaderboard | Remove until a real coverage metric exists |
| "All 3 Telemetry Feeds Synced" toast | `AppContext.tsx:559` | Per-provider status, failures visible |
| "HackerRank … verified" | toast, dashboard, leaderboard | "Display-only badge evidence" |
| "Competition Rules / 3 platforms ranked" | leaderboard tabs | Mark HR tab `Display only — not ranked` |
| Any cohort size number not from `/api/stats/public` | landing | Already fixed (HARDEN-3) — keep it that way |

**Positioning that survives contact with reality (copy deck):**
> *"Your college leaderboard that can't be faked with a screenshot. We read your public GitHub, LeetCode and Codeforces activity, close the week at Sunday 23:59:59 IST, and show exactly what we saw and when. If a platform won't give us timestamps, we say so — we don't invent a number."*

That is a *better* wedge than "all-in-one tracker", because it is the one thing LeetCode's own dashboard and a WhatsApp screenshot cannot do.

---

## 7. Practical roadmap (what to actually do, in order)

| Phase | Work | Effort | Owner | Gate |
|---|---|---|---|---|
| **0. Unblock** | `GITHUB_TOKEN`, GitHub OAuth app, Resend key, both secrets; fix D1 (HR badges-only); delete `94.2`; fix toast | 1.5 days | Antigravity + user (credentials) | `/api/health` shows all features true |
| **1. Trust** | D2 server-side observation write path; correct `scheduledBoundaryAt`; label seed data `Demo data` | 3 days | Antigravity / agy | Cannot forge a metric via `curl` (add a test asserting it) |
| **2. Anchor** | Codeforces adapter + capability registry + leaderboard tab + 1 req/2 s throttle + cache | 3–5 days | Antigravity | Live delta for 3 real CF handles, boundary-correct |
| **3. Pilot** | Import one real section (30–60 students), real handles, run 2 full Sunday boundaries | 2 weeks elapsed | Faculty + you | One audited standings week, zero disputes unresolved |
| **4. Publish** | Rewrite landing copy to the honest ladder; publish capability matrix; publish the pilot's real numbers | 2 days | Marketing | Every claim links to a live endpoint |
| **5. Expand** | CodeChef/GFG partnership ask; optional multi-section/faculty dashboard | ongoing | Business | Sanctioned access in writing |

**Deployment reality check:** the Sunday finalizer needs a long-running process (`boundary-scheduler.mjs`). Serverless hosting (Vercel hobby) will not run it. Docker on a VPS — already configured — is the correct target. SQLite + WAL is fine for one college; revisit only when a second institution onboards.

---

## 8. Answers to the five questions the plan leaves open

1. **"Can we verify all three providers?"** No. GitHub: yes (OAuth). LeetCode: ownership yes (bio challenge), data yes (cumulative). HackerRank: neither, today. Codeforces: data yes, ownership partial.
2. **"Can we rank every provider weekly?"** Only GitHub and Codeforces have native timestamps. LeetCode ranks on our snapshot diff. **HackerRank must not appear in a ranked table.**
3. **"What if a provider blocks us?"** Four-step ladder: server-side cache + token → downgrade to snapshot/display-only → "bring your proof" audited assertion → sanctioned partnership request. None of these steps requires fabricating data.
4. **"Is the leaderboard trustworthy?"** Not yet — the write path accepts client numbers (D2). After D2 it is the strongest claim we have, and should be the headline.
5. **"Can one section of 60 run on this?"** Yes, with `GITHUB_TOKEN` (60 → 5,000 req/hr) and Codeforces' 2-second throttle (~2 min for a full class sweep). Without a token, no — 60 req/hr dies in 30 minutes.

---

## 9. Decision sheet (needs a yes/no)

1. **Add Codeforces as the 4th provider and make it the ranked anchor?** (recommended: yes)
2. **Downgrade HackerRank to `UNVERIFIED_DISPLAY` and remove it from ownership challenges?** (recommended: yes)
3. **Rewrite `/api/telemetry/sync` to server-side fetch-only (client numbers rejected)?** (recommended: yes — this is the product)
4. **Keep the board labelled `Demo data` until the real section roster is imported?** (recommended: yes)
5. **Authorise the credential work now:** GitHub OAuth app, `GITHUB_TOKEN`, Resend key, `TWM_SESSION_SECRET`, `TWM_HMAC_SECRET`? (blocking everything)

---

## Appendix — re-run this audit

```powershell
# HackerRank (expect 404 on profile, 200 on badges)
curl.exe -s -o NUL -w "%{http_code}`n" "https://www.hackerrank.com/rest/hackers/abhinav_kumar/profile"
curl.exe -s "https://www.hackerrank.com/rest/hackers/abhinav_kumar/badges"

# Codeforces official API (expect status OK + creationTimeSeconds)
curl.exe -s "https://codeforces.com/api/user.status?handle=tourist&from=1&count=1"

# LeetCode cumulative (expect acSubmissionNum)
#   body: {"query":"query($u:String!){matchedUser(username:$u){submitStatsGlobal{acSubmissionNum{difficulty count}}}}","variables":{"u":"neal_wu"}}
curl.exe -s -X POST "https://leetcode.com/graphql" -H "Content-Type: application/json" -H "Referer: https://leetcode.com" --data-binary "@body.json"

# GitHub budget (expect 60 unauth / 5000 with token)
curl.exe -s "https://api.github.com/rate_limit"

# In-app smoke
curl.exe -s "http://localhost:3000/api/telemetry/hackerrank?username=abhinav_kumar"
curl.exe -s "http://localhost:3000/api/telemetry/leetcode?username=neal_wu"
curl.exe -s "http://localhost:3000/api/telemetry/github?username=octocat"
```
