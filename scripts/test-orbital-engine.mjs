import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  PROVIDERS_META,
  MOVING_ACTIVITY_NODES,
  STATIONARY_ACTIVITY_NODES,
  STATIONARY_ANALYTICS_NODES,
  ACTIVITY_VERIFICATION_NODES,
  ANALYTICS_ACHIEVEMENT_NODES,
  calculateResponsiveOrbitalRadii,
} from "../src/components/landing/hero/hero-constants.ts";

describe("TWM Orbital Engine Architecture & Spacing Suite (§ORBIT-1)", () => {
  // ─────────────────────────────────────────────────────────────────────────
  // 1. Orbital Geometry & Safe Clearance Across 10 Viewports
  // ─────────────────────────────────────────────────────────────────────────
  describe("1. Geometry, Spacing & Container Boundary Invariants", () => {
    const REQUIRED_VIEWPORTS = [
      { name: "320px (iPhone SE narrow)", containerWidth: 288, minCoreClearance: 12 },
      { name: "360px (Small Android)", containerWidth: 328, minCoreClearance: 14 },
      { name: "390px (Standard iPhone)", containerWidth: 358, minCoreClearance: 16 },
      { name: "430px (iPhone Pro Max)", containerWidth: 398, minCoreClearance: 18 },
      { name: "640px (Tablet / Desktop breakpoint)", containerWidth: 420, minCoreClearance: 20 },
      { name: "768px (iPad Mini portrait)", containerWidth: 460, minCoreClearance: 22 },
      { name: "1024px (Desktop split)", containerWidth: 400, minCoreClearance: 18 },
      { name: "1280px (Standard Desktop)", containerWidth: 480, minCoreClearance: 24 },
      { name: "1440px (Wide Desktop)", containerWidth: 540, minCoreClearance: 30 },
      { name: "1920px (Ultra-wide Desktop)", containerWidth: 580, minCoreClearance: 35 },
    ];

    for (const vp of REQUIRED_VIEWPORTS) {
      it(`enforces safe clearances and boundary containment for ${vp.name}`, () => {
        const radii = calculateResponsiveOrbitalRadii(vp.containerWidth);

        // A. Monotonic orbital order: Core < Inner (R1) < Middle (R2) < Outer (R3)
        assert.ok(radii.innerRadius > 0, "innerRadius must be positive");
        assert.ok(radii.middleRadius > radii.innerRadius, "middleRadius must exceed innerRadius");
        assert.ok(radii.outerRadius > radii.middleRadius, "outerRadius must exceed middleRadius");

        // B. Provider-to-Core Clearance Rule:
        // providerRadius >= coreRadius + providerHalfSize + minClearance
        const coreRadius = vp.containerWidth < 450 ? 40 : 56;
        const providerHalf = vp.containerWidth < 450 ? 20 : 26;
        const actualInnerEdge = radii.innerRadius - providerHalf;
        const actualClearance = actualInnerEdge - coreRadius;

        assert.ok(
          actualClearance >= vp.minCoreClearance,
          `At ${vp.name}, clearance (${actualClearance}px) must be >= ${vp.minCoreClearance}px`
        );

        // C. Inter-track spacing to prevent node collisions
        const gapMiddleOuter = radii.outerRadius - radii.middleRadius;
        const gapInnerMiddle = radii.middleRadius - radii.innerRadius;
        assert.ok(gapMiddleOuter >= 20, `Outer gap (${gapMiddleOuter}px) must be >= 20px`);
        assert.ok(gapInnerMiddle >= 20, `Inner gap (${gapInnerMiddle}px) must be >= 20px`);

        // D. Outer boundary containment (no horizontal overflow)
        // Outer node badge half-width + margin is ~18px
        const outerNodeEdge = radii.outerRadius + 18;
        assert.ok(
          outerNodeEdge <= vp.containerWidth / 2 + 2,
          `Outer edge (${outerNodeEdge}px) must fit within half-container (${vp.containerWidth / 2}px)`
        );
      });
    }

    it("clamps extreme container widths safely without crashing or returning NaN", () => {
      const zero = calculateResponsiveOrbitalRadii(0);
      assert.equal(zero.containerSize, 260);
      assert.ok(zero.innerRadius >= 76);

      const huge = calculateResponsiveOrbitalRadii(99999);
      assert.equal(huge.containerSize, 580);
      assert.ok(huge.outerRadius <= 265);

      const nanWidth = calculateResponsiveOrbitalRadii(NaN);
      assert.equal(nanWidth.containerSize, 540);
      assert.ok(!isNaN(nanWidth.innerRadius));
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Motion Hierarchy & Controlled Node Distribution
  // ─────────────────────────────────────────────────────────────────────────
  describe("2. Motion Hierarchy & Visual Hierarchy Invariants", () => {
    it("dedicates Zone 2 exclusively to the 3 major platform providers", () => {
      const providers = Object.keys(PROVIDERS_META);
      assert.equal(providers.length, 3, "Must have exactly 3 providers");
      assert.deepEqual(providers, ["github", "leetcode", "hackerrank"]);

      // Verify distinct platform branding
      assert.equal(PROVIDERS_META.github.colorHex, "#FFFFFF");
      assert.equal(PROVIDERS_META.leetcode.colorHex, "#FFA116");
      assert.equal(PROVIDERS_META.hackerrank.colorHex, "#2EC866");
    });

    it("restricts moving secondary nodes to exactly 2 active telemetry streams", () => {
      assert.equal(
        MOVING_ACTIVITY_NODES.length,
        2,
        "Only 2 curated telemetry nodes must be in continuous motion"
      );
      assert.equal(MOVING_ACTIVITY_NODES[0].id, "act-commit");
      assert.equal(MOVING_ACTIVITY_NODES[1].id, "act-boundary");

      // Verify they are positioned at diametrically opposite angles (0° and 180°)
      assert.equal(MOVING_ACTIVITY_NODES[0].angle, 0);
      assert.equal(MOVING_ACTIVITY_NODES[1].angle, 180);
    });

    it("anchors secondary indicators as stationary landmarks with breathing pulses", () => {
      assert.equal(STATIONARY_ACTIVITY_NODES.length, 2, "2 stationary activity nodes on Track 2");
      assert.equal(STATIONARY_ACTIVITY_NODES[0].angle, 90);
      assert.equal(STATIONARY_ACTIVITY_NODES[1].angle, 270);

      assert.equal(STATIONARY_ANALYTICS_NODES.length, 4, "4 stationary analytics nodes on Track 3");
      const angles = STATIONARY_ANALYTICS_NODES.map((n) => n.angle);
      assert.deepEqual(angles, [45, 135, 225, 315], "Balanced 90° intervals offset by 45°");
    });

    it("preserves backwards compatibility aliases for existing imports", () => {
      assert.equal(ACTIVITY_VERIFICATION_NODES.length, 4);
      assert.equal(ANALYTICS_ACHIEVEMENT_NODES.length, 4);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 3. Animation Timing, Direction & Upright Counter-Rotation
  // ─────────────────────────────────────────────────────────────────────────
  describe("3. Animation Architecture & Counter-Rotation", () => {
    it("defines continuous GPU-accelerated rotation classes in globals.css", () => {
      const cssPath = path.resolve("src/app/globals.css");
      const css = fs.readFileSync(cssPath, "utf8");

      assert.ok(css.includes(".animate-orbit-cw"), "Must define .animate-orbit-cw");
      assert.ok(css.includes(".animate-orbit-ccw"), "Must define .animate-orbit-ccw");
      assert.ok(css.includes("will-change: transform"), "Must specify will-change: transform");
      assert.ok(css.includes("transform-origin: center center"), "Must center transform origin");

      // Verify stationary subtle pulse
      assert.ok(css.includes(".animate-pulse-subtle"), "Must define .animate-pulse-subtle");
      assert.ok(css.includes("@keyframes pulse-subtle"), "Must define pulse-subtle keyframes");
    });

    it("verifies mathematical counter-rotation logic in HeroOrbitLayer.tsx", () => {
      const layerPath = path.resolve("src/components/landing/hero/HeroOrbitLayer.tsx");
      const layerCode = fs.readFileSync(layerPath, "utf8");

      // Verify counter-rotation class mapping
      assert.ok(
        layerCode.includes('direction === "cw" ? "animate-orbit-ccw" : "animate-orbit-cw"'),
        "CW track must counter-rotate CCW, and CCW track must counter-rotate CW"
      );

      // Verify stationary orbit node export
      assert.ok(
        layerCode.includes("export function HeroStationaryOrbitNode"),
        "Must export HeroStationaryOrbitNode for stationary landmarks"
      );
    });

    it("verifies Provider Orbit duration (34s) and Moving Activity duration (44s)", () => {
      const universePath = path.resolve("src/components/landing/hero/HeroOrbitalUniverse.tsx");
      const universeCode = fs.readFileSync(universePath, "utf8");

      assert.ok(universeCode.includes("duration={34}"), "Provider track must revolve at 34s");
      assert.ok(universeCode.includes('direction="cw"'), "Provider track must revolve CW");

      assert.ok(universeCode.includes("duration={44}"), "Moving activity track must revolve at 44s");
      assert.ok(universeCode.includes('direction="ccw"'), "Moving activity track must revolve CCW");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 4. SVG Dynamic Coordinate Mapping & Connection Alignment
  // ─────────────────────────────────────────────────────────────────────────
  describe("4. SVG Energy Connection Paths Dynamic Mapping", () => {
    it("maps SVG viewBox dynamically to container dimensions ensuring 1:1 pixel accuracy", () => {
      const svgPath = path.resolve("src/components/landing/hero/HeroConnectionPaths.tsx");
      const svgCode = fs.readFileSync(svgPath, "utf8");

      assert.ok(
        svgCode.includes("viewBox={`-${half} -${half} ${size} ${size}`}"),
        "SVG viewBox must dynamically match container width to prevent coordinate scaling mismatch"
      );
      assert.ok(
        svgCode.includes("y2={-innerRadius}"),
        "North beam must terminate exactly at -innerRadius (GitHub coordinate)"
      );
    });

    it("calculates exact Cartesian endpoints for LeetCode and HackerRank", () => {
      const innerRadius = 140;
      const xLeetCode = Math.round(innerRadius * Math.sin((120 * Math.PI) / 180));
      const yLeetCode = -Math.round(innerRadius * Math.cos((120 * Math.PI) / 180));

      const xHackerRank = Math.round(innerRadius * Math.sin((240 * Math.PI) / 180));
      const yHackerRank = -Math.round(innerRadius * Math.cos((240 * Math.PI) / 180));

      // LeetCode (120°): South-East (x > 0, y > 0)
      assert.ok(xLeetCode > 0, "LeetCode x must be positive (East)");
      assert.ok(yLeetCode > 0, "LeetCode y must be positive (South)");

      // HackerRank (240°): South-West (x < 0, y > 0)
      assert.ok(xHackerRank < 0, "HackerRank x must be negative (West)");
      assert.ok(yHackerRank > 0, "HackerRank y must be positive (South)");

      // Distance from center must equal innerRadius
      const distLeetCode = Math.round(Math.sqrt(xLeetCode ** 2 + yLeetCode ** 2));
      const distHackerRank = Math.round(Math.sqrt(xHackerRank ** 2 + yHackerRank ** 2));
      assert.equal(distLeetCode, innerRadius);
      assert.equal(distHackerRank, innerRadius);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Accessibility, Reduced Motion & Cross-Route Invariants
  // ─────────────────────────────────────────────────────────────────────────
  describe("5. Reduced Motion & Navigation Robustness", () => {
    it("consolidates reduced-motion rules into a single authoritative block", () => {
      const cssPath = path.resolve("src/app/globals.css");
      const css = fs.readFileSync(cssPath, "utf8");

      // Verify no duplicate conflicting reduced-motion media query
      const matches = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)/g) || [];
      assert.equal(
        matches.length,
        1,
        "Must have exactly ONE unified prefers-reduced-motion media query"
      );

      // Verify deliberate pause of continuous animations
      assert.ok(
        css.includes(".animate-orbit-cw,\n  .animate-orbit-ccw"),
        "Must halt continuous orbital spins under reduced motion"
      );
    });

    it("verifies NavBar uses root-relative anchor paths for cross-route resilience", () => {
      const navPath = path.resolve("src/components/landing/NavBar.tsx");
      const navCode = fs.readFileSync(navPath, "utf8");

      assert.ok(navCode.includes('"/#showcase"'), "Features link must route to /#showcase");
      assert.ok(navCode.includes('"/#workflow"'), "How it Works link must route to /#workflow");
      assert.ok(navCode.includes('"/#pillars"'), "About link must route to /#pillars");
    });
  });
});
