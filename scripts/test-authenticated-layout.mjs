import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

test("TWM Authenticated Application Layout & Architectural Invariant Suite", async (t) => {
  await t.test("1. Reusable Layout System & Primitive Architecture", () => {
    // 1. Verify PageContainer exists and exports correctly
    const pageContainerPath = path.join(ROOT, "src", "components", "layout", "PageContainer.tsx");
    assert.ok(fs.existsSync(pageContainerPath), "PageContainer.tsx must exist");
    const pageContainerContent = fs.readFileSync(pageContainerPath, "utf8");
    assert.match(pageContainerContent, /export function PageContainer/, "PageContainer must be an exported component");
    assert.match(pageContainerContent, /max-w-7xl/, "PageContainer default size must be max-w-7xl");
    assert.match(pageContainerContent, /px-4 sm:px-6 lg:px-8/, "PageContainer must enforce uniform horizontal gutters");

    // 2. Verify PageHeader exists and exports correctly
    const pageHeaderPath = path.join(ROOT, "src", "components", "layout", "PageHeader.tsx");
    assert.ok(fs.existsSync(pageHeaderPath), "PageHeader.tsx must exist");
    const pageHeaderContent = fs.readFileSync(pageHeaderPath, "utf8");
    assert.match(pageHeaderContent, /export function PageHeader/, "PageHeader must be an exported component");
    assert.match(pageHeaderContent, /text-2xl sm:text-3xl lg:text-4xl/, "PageHeader must enforce typography hierarchy");
  });

  await t.test("2. Rebuilt Authenticated Header (AppHeader) Invariants", () => {
    const appHeaderPath = path.join(ROOT, "src", "components", "ui", "AppHeader.tsx");
    assert.ok(fs.existsSync(appHeaderPath), "AppHeader.tsx must exist");
    const headerContent = fs.readFileSync(appHeaderPath, "utf8");

    // Three clearly-defined sections
    assert.match(headerContent, /BrandLogo/, "AppHeader must render BrandLogo in left section");
    assert.match(headerContent, /Demo data · 3 adapters/, "AppHeader must render honest demo badge");
    assert.match(headerContent, /aria-label="Primary Navigation"/, "AppHeader must have an accessible nav region in center section");
    assert.match(headerContent, /openCommandPalette/, "AppHeader must support Cmd+K search trigger in right section");
    assert.match(headerContent, /triggerLiveSync/, "AppHeader must support Live Telemetry Sync trigger");
    assert.match(headerContent, /isProfileOpen/, "AppHeader must provide user profile menu");
    assert.match(headerContent, /isMobileMenuOpen/, "AppHeader must provide full mobile drawer navigation");
    assert.match(headerContent, /layoutId="header-active-nav"/, "AppHeader must feature spring-based active nav indicator");
    assert.match(headerContent, /z-50/, "Dropdown menu must render at z-50 above standard layout");
  });

  await t.test("3. Route-by-Route PageContainer & PageHeader Integration", () => {
    const routes = [
      { name: "Leaderboard", file: "src/app/leaderboard/page.tsx" },
      { name: "Dashboard", file: "src/app/dashboard/page.tsx" },
      { name: "Search / Directory", file: "src/app/search/page.tsx" },
      { name: "Settings", file: "src/app/settings/page.tsx" },
      { name: "Admin Hub", file: "src/app/admin/page.tsx" },
      { name: "Privacy Policy", file: "src/app/privacy/page.tsx" }
    ];

    for (const route of routes) {
      const fullPath = path.join(ROOT, route.file);
      assert.ok(fs.existsSync(fullPath), `${route.name} file must exist`);
      const content = fs.readFileSync(fullPath, "utf8");

      assert.match(content, /import.*PageContainer.*from.*@\/components\/layout\/PageContainer/, `${route.name} must import PageContainer`);
      assert.match(content, /import.*PageHeader.*from.*@\/components\/layout\/PageHeader/, `${route.name} must import PageHeader`);
      assert.match(content, /<PageContainer/, `${route.name} must render PageContainer`);
      assert.match(content, /<\/PageContainer>/, `${route.name} must close PageContainer`);
      assert.match(content, /<PageHeader/, `${route.name} must render PageHeader`);
      assert.doesNotMatch(content, /<main className=".*max-w-6xl/, `${route.name} must not use drifting custom main max-width`);
    }
  });

  await t.test("4. Leaderboard Page Specific Architecture Refinements", () => {
    const lbPath = path.join(ROOT, "src", "app/leaderboard/page.tsx");
    const content = fs.readFileSync(lbPath, "utf8");

    // 1. Separate quorum participation card
    assert.match(content, /Cohort Quorum Gate \(§3\.3\)/, "Leaderboard must feature dedicated Quorum Gate card");
    assert.match(content, /70% Threshold Target/, "Leaderboard must indicate 70% quorum threshold");

    // 2. Platform selector with icons and equal padding
    assert.match(content, /role="tablist"/, "Platform switcher must have ARIA role tablist");
    assert.match(content, /GitHub \(Active Days\)/, "GitHub tab must be present");
    assert.match(content, /LeetCode \(Solved Delta\)/, "LeetCode tab must be present");
    assert.match(content, /HackerRank \(Badges\)/, "HackerRank tab must be present");
    assert.match(content, /layoutId="leaderboard-active-tab"/, "Platform switcher must feature spring layoutId animation");

    // 3. Action toolbar separation
    assert.match(content, /exportLeaderboardCSV/, "Export CSV button must be wired to context handler");
    assert.match(content, /Competition Rules/, "Competition Rules button must be present");

    // 4. Desktop table & Dedicated Mobile cards
    assert.match(content, /hidden md:block.*rounded-2xl border border-border bg-surface/, "Desktop table container must exist");
    assert.match(content, /md:hidden space-y-3/, "Mobile participant cards must exist for < 768px viewports");

    // 5. Section 9.6 ties and zero fabrication
    assert.match(content, /computeCompetitionRanks/, "Must preserve Section 9.6 deterministic ranking calculation");
    assert.match(content, /item\.isTied/, "Must preserve Tied status indicator");
    assert.match(content, /item\.rank === 1/, "Must provide Rank 1 gold badge");
    assert.match(content, /item\.rank === 2/, "Must provide Rank 2 silver badge");
    assert.match(content, /item\.rank === 3/, "Must provide Rank 3 bronze badge");

    // 6. Section 5.6 HackerRank capability gating
    assert.match(content, /Section 5\.6 Capability Gating Enforced/, "HackerRank must disclose capability gating");
    assert.match(content, /Excluded from Weekly Delta/, "HackerRank must be excluded from weekly deltas");
  });

  await t.test("5. ToastContainer & Overflow Prevention Invariants", () => {
    const toastPath = path.join(ROOT, "src", "components", "ui", "ToastContainer.tsx");
    const content = fs.readFileSync(toastPath, "utf8");
    assert.match(content, /left-4 right-4 sm:left-auto sm:right-5/, "ToastContainer must not bleed negative coordinates on mobile");
  });
});
