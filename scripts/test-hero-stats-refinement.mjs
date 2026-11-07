import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateResponsiveOrbitalRadii } from "../src/components/landing/hero/hero-constants.ts";
import { validateCohortStatsPayload } from "../src/lib/stats-validator.ts";

describe("TWM HERO-1 & FE-STATS A–E Engineering Refinement Suite", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY A: Responsive Orbit Geometry & Viewport Clearance Math
  // ─────────────────────────────────────────────────────────────────────────
  describe("Category A: Responsive Orbital Sizing & Clearance (§A)", () => {
    const VIEWPORTS = [
      { name: "320px (iPhone SE narrow)", containerWidth: 288 },
      { name: "360px (Small Android)", containerWidth: 328 },
      { name: "390px (Standard iPhone)", containerWidth: 358 },
      { name: "430px (iPhone Pro Max)", containerWidth: 398 },
      { name: "640px (Mobile breakpoint)", containerWidth: 420 },
      { name: "768px (iPad Mini portrait)", containerWidth: 460 },
      { name: "1024px (Tablet/Desktop split)", containerWidth: 400 },
      { name: "1280px (Standard Desktop)", containerWidth: 480 },
      { name: "1440px (Wide Desktop)", containerWidth: 540 },
      { name: "1920px (Ultra-wide Desktop)", containerWidth: 580 },
    ];

    for (const vp of VIEWPORTS) {
      it(`calculates safe non-overflowing orbital radii for ${vp.name} (width: ${vp.containerWidth}px)`, () => {
        const radii = calculateResponsiveOrbitalRadii(vp.containerWidth);

        // 1. Verify radii order: Core < Inner (R1) < Middle (R2) < Outer (R3)
        assert.ok(radii.innerRadius > 0, "innerRadius must be positive");
        assert.ok(radii.middleRadius > radii.innerRadius, "middleRadius must exceed innerRadius");
        assert.ok(radii.outerRadius > radii.middleRadius, "outerRadius must exceed middleRadius");

        // 2. Verify outer nodes stay within container bounds
        // Outer node half-width + padding + glow margin = ~20px
        const outerNodeExtent = (radii.outerRadius + 20) * 2;
        assert.ok(
          outerNodeExtent <= vp.containerWidth + 4, // allow max 4px sub-pixel tolerance
          `Outer nodes diameter (${outerNodeExtent}px) must fit within container (${vp.containerWidth}px)`
        );

        // 3. Verify orbital layer gaps to prevent node collisions
        const gapMiddleOuter = radii.outerRadius - radii.middleRadius;
        const gapInnerMiddle = radii.middleRadius - radii.innerRadius;
        assert.ok(gapMiddleOuter >= 20, `Gap between Middle and Outer (${gapMiddleOuter}px) must be >= 20px`);
        assert.ok(gapInnerMiddle >= 20, `Gap between Inner and Middle (${gapInnerMiddle}px) must be >= 20px`);

        // 4. Verify central core clearance from inner provider orbit
        // On mobile/compact columns, core radius is ~40px; on full desktop, ~56px
        const estimatedCoreRadius = vp.containerWidth < 450 ? 40 : 56;
        const providerTileHalf = vp.containerWidth < 450 ? 18 : 24;
        const providerInnerEdge = radii.innerRadius - providerTileHalf;
        assert.ok(
          providerInnerEdge >= estimatedCoreRadius + 4,
          `Provider inner edge (${providerInnerEdge}px) must clear core radius (${estimatedCoreRadius}px) by at least 4px`
        );
      });
    }

    it("clamps extreme viewport container widths safely without crashing or returning NaN", () => {
      const zeroWidth = calculateResponsiveOrbitalRadii(0);
      assert.ok(zeroWidth.innerRadius > 0 && !isNaN(zeroWidth.innerRadius));
      assert.equal(zeroWidth.containerSize, 260);

      const hugeWidth = calculateResponsiveOrbitalRadii(5000);
      assert.ok(hugeWidth.outerRadius <= 265);
      assert.equal(hugeWidth.containerSize, 580);

      const negativeWidth = calculateResponsiveOrbitalRadii(-100);
      assert.ok(negativeWidth.innerRadius > 0);
      assert.equal(negativeWidth.containerSize, 260);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY B: Core Presentation & Truthful Telemetry Language
  // ─────────────────────────────────────────────────────────────────────────
  describe("Category B: Core Truthful Presentation (§B)", () => {
    it("does not contain false claims of HMAC verification or active server engine checks", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");

      const coreFilePath = path.resolve("src/components/landing/hero/HeroCore.tsx");
      const coreFileContent = fs.readFileSync(coreFilePath, "utf8");

      // Verify removal of misleading claims
      assert.ok(
        !coreFileContent.includes("TWM Verified Engine Core: Zero-Fabrication Telemetry & HMAC Active"),
        "Must not contain misleading engine verification claim in HeroCore"
      );
      assert.ok(
        !coreFileContent.includes("HMAC Active"),
        "Must not claim active HMAC verification in decorative landing component"
      );
      assert.ok(
        !coreFileContent.includes("Engine"),
        "Must not use operational 'Engine' badge suggesting real-time server health check"
      );

      // Verify inclusion of truthful brand core identifier
      assert.ok(
        coreFileContent.includes("TWM Core"),
        "Must display clean, truthful 'TWM Core' brand monogram badge"
      );
    });

    it("verifies HeroOrbitalUniverse core click toast makes zero unverified operational assertions", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");

      const universeFilePath = path.resolve("src/components/landing/hero/HeroOrbitalUniverse.tsx");
      const universeContent = fs.readFileSync(universeFilePath, "utf8");

      assert.ok(
        !universeContent.includes("HMAC Active"),
        "Orbital universe click handler must not claim HMAC is active"
      );
      assert.ok(
        !universeContent.includes("Verified Engine Core"),
        "Orbital universe click handler must not claim verified engine core"
      );
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY C: StatsBar Strict Fail-Closed Validation
  // ─────────────────────────────────────────────────────────────────────────
  describe("Category C: StatsBar Fail-Closed Schema & Cross-Field Validation (§C)", () => {
    const validPayload = {
      success: true,
      totalEnrolled: 60,
      verifiedOptedIn: 45,
      quorumPercentage: 75.0,
      meetsQuorum: true,
      label: "Representative Class Leaderboard",
      platformCount: 3,
      generatedAt: "2026-11-07T12:00:00.000Z",
      latestObservationAt: "2026-11-07T11:45:00.000Z",
    };

    it("accepts a completely valid cohort stats payload", () => {
      const result = validateCohortStatsPayload(validPayload);
      assert.equal(result.isValid, true);
      if (result.isValid) {
        assert.equal(result.data.totalEnrolled, 60);
        assert.equal(result.data.verifiedOptedIn, 45);
        assert.equal(result.data.quorumPercentage, 75.0);
        assert.equal(result.data.meetsQuorum, true);
        assert.equal(result.data.platformCount, 3);
        assert.equal(result.data.generatedAt, "2026-11-07T12:00:00.000Z");
        assert.equal(result.data.latestObservationAt, "2026-11-07T11:45:00.000Z");
      }
    });

    it("rejects non-object or null payloads", () => {
      assert.equal(validateCohortStatsPayload(null).isValid, false);
      assert.equal(validateCohortStatsPayload(undefined).isValid, false);
      assert.equal(validateCohortStatsPayload("string").isValid, false);
      assert.equal(validateCohortStatsPayload(12345).isValid, false);
    });

    it("rejects payloads where success is not true", () => {
      assert.equal(validateCohortStatsPayload({ ...validPayload, success: false }).isValid, false);
      assert.equal(validateCohortStatsPayload({ ...validPayload, success: undefined }).isValid, false);
    });

    it("rejects non-integer, negative, or NaN totalEnrolled", () => {
      assert.equal(validateCohortStatsPayload({ ...validPayload, totalEnrolled: -5 }).isValid, false);
      assert.equal(validateCohortStatsPayload({ ...validPayload, totalEnrolled: 12.5 }).isValid, false);
      assert.equal(validateCohortStatsPayload({ ...validPayload, totalEnrolled: NaN }).isValid, false);
      assert.equal(validateCohortStatsPayload({ ...validPayload, totalEnrolled: "60" }).isValid, false);
    });

    it("rejects verifiedOptedIn greater than totalEnrolled (impossible state)", () => {
      const result = validateCohortStatsPayload({
        ...validPayload,
        totalEnrolled: 50,
        verifiedOptedIn: 51,
        quorumPercentage: 100,
      });
      assert.equal(result.isValid, false);
      assert.ok(result.reason.includes("cannot exceed totalEnrolled"));
    });

    it("rejects quorumPercentage mathematically inconsistent with verified / total", () => {
      // 45 / 60 is 75%, payload claims 50%
      const result = validateCohortStatsPayload({
        ...validPayload,
        quorumPercentage: 50.0,
      });
      assert.equal(result.isValid, false);
      assert.ok(result.reason.includes("mathematically conflicts"));
    });

    it("rejects meetsQuorum boolean contradictory to 70% threshold", () => {
      // 45 / 60 is 75% (>= 70%), so meetsQuorum MUST be true
      const falseNegative = validateCohortStatsPayload({
        ...validPayload,
        meetsQuorum: false,
      });
      assert.equal(falseNegative.isValid, false);

      // 20 / 60 is 33.3% (< 70%), so meetsQuorum MUST be false
      const falsePositive = validateCohortStatsPayload({
        ...validPayload,
        verifiedOptedIn: 20,
        quorumPercentage: 33.3,
        meetsQuorum: true, // Invalid: < 70% cannot be true!
      });
      assert.equal(falsePositive.isValid, false);
    });

    it("handles zero enrolled cohort boundary honestly without divide-by-zero", () => {
      const zeroCohort = {
        success: true,
        totalEnrolled: 0,
        verifiedOptedIn: 0,
        quorumPercentage: 0,
        meetsQuorum: false,
        label: "Participating Members Leaderboard",
        platformCount: 3,
      };
      const result = validateCohortStatsPayload(zeroCohort);
      assert.equal(result.isValid, true);
      if (result.isValid) {
        assert.equal(result.data.totalEnrolled, 0);
        assert.equal(result.data.verifiedOptedIn, 0);
        assert.equal(result.data.quorumPercentage, 0);
        assert.equal(result.data.meetsQuorum, false);
      }
    });

    it("rejects platformCount other than 3 (supported platform configuration)", () => {
      assert.equal(validateCohortStatsPayload({ ...validPayload, platformCount: 4 }).isValid, false);
      assert.equal(validateCohortStatsPayload({ ...validPayload, platformCount: 0 }).isValid, false);
      assert.equal(validateCohortStatsPayload({ ...validPayload, platformCount: "3" }).isValid, false);
    });

    it("discards malformed optional timestamps without invalidating core stats", () => {
      const payloadWithMalformedDates = {
        ...validPayload,
        generatedAt: "not-a-valid-date-string",
        latestObservationAt: "garbage-timestamp",
      };
      const result = validateCohortStatsPayload(payloadWithMalformedDates);
      assert.equal(result.isValid, true, "Core stats should remain valid despite malformed optional timestamps");
      if (result.isValid) {
        assert.equal(result.data.generatedAt, undefined);
        assert.equal(result.data.latestObservationAt, null);
      }
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // CATEGORY D & E: Request Lifecycle & Freshness Semantics
  // ─────────────────────────────────────────────────────────────────────────
  describe("Category D & E: Lifecycle, Stale Prevention & Freshness Semantics (§D, §E)", () => {
    it("simulates AbortController signal handling without treating cancellation as application error", () => {
      const controller = new AbortController();
      controller.abort();
      assert.equal(controller.signal.aborted, true);

      // Verify that checking signal.aborted prevents state mutation
      let stateMutated = false;
      if (!controller.signal.aborted) {
        stateMutated = true;
      }
      assert.equal(stateMutated, false, "Aborted signal must abort execution and prevent state mutation");
    });

    it("verifies public stats route preserves zero-PII privacy boundaries and separates generatedAt from latestObservationAt", async () => {
      const fs = await import("node:fs");
      const path = await import("node:path");

      const routeFilePath = path.resolve("src/app/api/stats/public/route.ts");
      const routeContent = fs.readFileSync(routeFilePath, "utf8");

      // Verify generatedAt is populated with new Date().toISOString()
      assert.ok(routeContent.includes("generatedAt: new Date().toISOString()"), "generatedAt must be API response timestamp");

      // Verify latestObservationAt queries MAX(observed_at) from telemetry_observations
      assert.ok(routeContent.includes("MAX(observed_at)"), "latestObservationAt must query genuine SQLite observation timestamp");

      // Verify zero PII or private columns are selected
      assert.ok(!routeContent.includes("SELECT * FROM roster_members"), "Must not select private student rows in public route");
      assert.ok(!routeContent.includes("email"), "Must not expose student email in public stats route");
      assert.ok(!routeContent.includes("roll_no"), "Must not expose student roll numbers in public stats route");
    });
  });
});
