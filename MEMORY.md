# MEMORY — TWM 3.1 working notes

Running log of decisions and changes. Newest session at the top of *Session log*.
Plan of record: `TWM_Final_Project_Plan_v3.1.md` (read its Section 20 roadmap before scoping work).

---

## What this project is

TWM ("Track. Win. Maintain.") — a class-scoped developer activity + friendly competition app.
Next.js 14 App Router, TypeScript, Tailwind, framer-motion, lucide. No backend yet.

**Current state:** clickable UI prototype. Every screen renders hardcoded data from
`src/context/AppContext.tsx` or page-local arrays. No `app/api/`, no DB, no OAuth, no provider
adapters. The plan's Phase 0 (provider evidence) has not started.

---

## Ground rules for this repo

- The plan's core principle: **never represent unavailable or unverified data as a fact.**
  Demo data must be visibly labelled. Do not add fake success states, fake domains, or fake
  "live" indicators.
- One palette: the amber `--*` tokens in `src/app/globals.css`. Do not add a second colour system
  (a Tailwind `brand.*` palette was deleted for exactly this reason).
- One font source: `next/font` in `src/app/layout.tsx` sets `--font-sans` / `--font-mono` on
  `<html>`. Never redefine those vars in `:root` — it silently wins or loses by source order.
- `AppProvider` and `MotionProvider` wrap `{children}` in the root layout. Anything using
  `useApp()` must stay under it, and the root layout stays a Server Component.

---

## Session log

### 2026-10-20 — UI review + hardening pass

**Review verdict:** 6.4/10 as a UI prototype (≈4/10 as shippable frontend). Full scorecard was
produced in chat; the drivers were accessibility (3.5) and token discipline (4.0).

Changed:

1. **Reduced motion actually works.** Added `src/components/ui/MotionProvider.tsx`
   (`MotionConfig reducedMotion="user"`). The CSS block in `globals.css` only killed CSS
   animations; all 50 `motion.*` animations are JS-driven and ignored it.
2. **Hero discipline** (`src/components/landing/HeroSection.tsx`): `pt-32 md:pt-40` → `pt-24`;
   removed the "Real Telemetry / 100% Opt-In / Deterministic Ranks" strip (duplicated the next
   section); replaced the fake `https://twm.class/dashboard` + pulsing "Live Observation" with
   `Dashboard preview` / `Illustrative data`.
3. **Fake success removed.** The class-code form used to `setTimeout(() => setStatus("valid"))`
   and claim "Valid class!" for any input. It now navigates to `/onboarding?class=<code>`.
4. **A11y:** `aria-pressed` + `role="group"` on the leaderboard platform toggles, `aria-expanded`
   on the rules disclosure, `type="button"` on all bare buttons, `scope="col"` on table headers,
   and a global `:focus-visible` outline in `globals.css` (`!important`, because components set
   `focus:outline-none` on inputs).
5. **Deleted the dead Tailwind palette** (`brand.cyan/blue/purple/...`, `shadow.glow*`,
   `surface.*`) from `tailwind.config.js` — verified zero usages. One palette now.
6. **Fonts:** Inter → **Sora** + JetBrains Mono. `Geist` is not exported by this Next 14.2 font
   build (TS2305), so Sora was the fallback choice.

Bugs found while doing the above:

- **The project did not build.** `/settings` called `useApp()` with no `AppProvider` mounted →
  `Error: useApp must be used within an AppProvider` during prerender. Provider is now mounted in
  the root layout; `ToastContainer`, `CommandPalette`, `ManualSyncModal`, `DisputeModal` went from
  dead code to live. Page bundles shrank as a side effect (dashboard 6.4 kB → 3.5 kB).
- **A concurrent editor was modifying files during the session**, inserting a duplicate
  `import { AppProvider }`. If you see unexplained diffs, check for another agent/IDE process.
- Build output: 10 static routes, 87 kB shared JS, largest route 150 kB first load.

7. **Git initialised** (`main`, baseline commit `5f04da5`) + `.gitignore`. Note: the baseline was
   taken *after* the fixes above, so items 1-6 are not independently reviewable in history.
8. **Hex → token sweep:** see commit `refactor: route component colours through CSS variables`.
   810 of 831 hex class literals now go through tokens; **zero visual change** (exact-value
   mapping only). Tokens are exposed two ways in `globals.css`: hex vars for CSS, `*-rgb`
   triplets for Tailwind, so opacity modifiers like `bg-canvas/90` still work.
   Remaining 21 literals are provider brand colours: LeetCode `#FFA116`, HackerRank `#00EA64`,
   plus one-off `#2E3440` / `#0B0D13` / `#A0A6B5`.
   Gates after the sweep: `tsc --noEmit` clean, `next build` green.
   ⚠️ Two LeetCode oranges now coexist: `--provider-leetcode: #FBBF24` (desaturated for the dark
   UI) vs the literal `#FFA116` (real brand). Pick one deliberately.

---

## Known debt (ranked)

1. **No backend at all.** Next real work is one GitHub API route + one adapter, not more UI.
2. **App screens present invented numbers without a demo badge** (roster 42/60, audit logs,
   disputes). Violates the core principle above. Cheapest fix: one `Demo data` chip per screen.
3. **Layout repetition:** 7 landing sections, all centred on `max-w-4xl`. No asymmetry or bento.
   Would need a real composition pass, not a tweak.
4. **Dead assets in `public/`:** `logo.svg` (2.4 MB), `logo.png` (1.8 MB),
   `logo-horizontal.png` (257 KB), `twm_perfect_landing.png` (761 KB),
   `twm_streamlined_motion.png` (503 KB) — none referenced. ~5.8 MB in git history forever.
5. **Two stray greys** outside the token set: `#8D94A5` (de-facto body grey, not in tokens) and
   `#636A7E` (placeholder/labels). Consolidate before they multiply.
6. **No tests.** `npx tsc --noEmit` and `npx next build` are the only gates. Both are green.
7. `logo.svg` being 2.4 MB suggests an embedded raster; if it ever gets used, convert it.

---

## Commands

```powershell
npm run dev            # next dev -p 3000
npx tsc --noEmit       # type gate
npx next build         # build gate (fonts are fetched here)
```
