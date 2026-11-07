"use client";

import React, { useState, useEffect } from "react";
import {
  PROVIDERS_META,
  ProviderId,
  ACTIVITY_VERIFICATION_NODES,
  ANALYTICS_ACHIEVEMENT_NODES,
} from "./hero-constants";
import { HeroRadar } from "./HeroRadar";
import { HeroConnectionPaths } from "./HeroConnectionPaths";
import { HeroCore } from "./HeroCore";
import { HeroOrbitNode } from "./HeroOrbitLayer";
import { HeroProviderNode } from "./HeroProviderNode";
import { HeroMicroStats } from "./HeroMicroStats";
import { HeroProviderInfo } from "./HeroProviderInfo";
import { fireMilestoneBurst } from "@/lib/celebrate";
import { toast } from "sonner";

export function HeroOrbitalUniverse() {
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Responsive radii: compact on mobile, expansive on desktop
  const innerRadius = isMobile ? 95 : 135;
  const middleRadius = isMobile ? 145 : 205;
  const outerRadius = isMobile ? 190 : 275;

  const handleProviderSelect = (id: ProviderId) => {
    setActiveProvider((prev) => (prev === id ? null : id));
  };

  const handleCoreClick = () => {
    fireMilestoneBurst(0.65, 0.4);
    toast.success("TWM Verified Engine Core: Zero-Fabrication Telemetry & HMAC Active");
  };

  return (
    <div className="relative w-full aspect-square max-w-[420px] sm:max-w-[500px] lg:max-w-[580px] mx-auto flex items-center justify-center select-none">
      {/* 1. Radar Scanning Effect & Concentric Grid Tracks */}
      <HeroRadar
        innerRadius={innerRadius}
        middleRadius={middleRadius}
        outerRadius={outerRadius}
      />

      {/* 2. Animated Energy Connection Paths */}
      <HeroConnectionPaths
        activeProvider={activeProvider}
        innerRadius={innerRadius}
      />

      {/* 3. Layer 3: Analytics & Achievement Orbit (Outer, CW, 38s) */}
      {ANALYTICS_ACHIEVEMENT_NODES.map((node) => {
        const Icon = node.icon;
        return (
          <HeroOrbitNode
            key={node.id}
            initialAngle={node.initialAngle}
            radius={outerRadius}
            duration={38}
            direction="cw"
            isPaused={activeProvider !== null}
          >
            <div
              title={`${node.name}: ${node.label}`}
              className="p-2 sm:p-2.5 rounded-xl bg-surface/85 backdrop-blur-md border border-white/10 hover:border-brand-secondary/50 shadow-md transition-transform hover:scale-115 cursor-default group"
              style={{
                boxShadow: `0 0 14px ${node.glowColor}`,
              }}
            >
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${node.colorClass} transition-transform group-hover:scale-110`} />
            </div>
          </HeroOrbitNode>
        );
      })}

      {/* 4. Layer 2: Activity & Verification Orbit (Middle, CCW, 30s) */}
      {ACTIVITY_VERIFICATION_NODES.map((node) => {
        const Icon = node.icon;
        return (
          <HeroOrbitNode
            key={node.id}
            initialAngle={node.initialAngle}
            radius={middleRadius}
            duration={30}
            direction="ccw"
            isPaused={activeProvider !== null}
          >
            <div
              title={`${node.name}: ${node.label}`}
              className="p-2 sm:p-2.5 rounded-xl bg-surface/90 backdrop-blur-md border border-white/10 hover:border-brand-highlight/50 shadow-md transition-transform hover:scale-115 cursor-default group"
              style={{
                boxShadow: `0 0 14px ${node.glowColor}`,
              }}
            >
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${node.colorClass} transition-transform group-hover:scale-110`} />
            </div>
          </HeroOrbitNode>
        );
      })}

      {/* 5. Layer 1: Inner Provider Orbit (Inner, CW, 24s) */}
      {/* 5a. GitHub (0 deg) */}
      <HeroOrbitNode
        initialAngle={0}
        radius={innerRadius}
        duration={24}
        direction="cw"
        isPaused={activeProvider !== null}
      >
        <HeroProviderNode
          provider={PROVIDERS_META.github}
          isActive={activeProvider === "github"}
          isAnyActive={activeProvider !== null}
          onSelect={() => handleProviderSelect("github")}
        />
      </HeroOrbitNode>

      {/* 5b. LeetCode (120 deg) */}
      <HeroOrbitNode
        initialAngle={120}
        radius={innerRadius}
        duration={24}
        direction="cw"
        isPaused={activeProvider !== null}
      >
        <HeroProviderNode
          provider={PROVIDERS_META.leetcode}
          isActive={activeProvider === "leetcode"}
          isAnyActive={activeProvider !== null}
          onSelect={() => handleProviderSelect("leetcode")}
        />
      </HeroOrbitNode>

      {/* 5c. HackerRank (240 deg) */}
      <HeroOrbitNode
        initialAngle={240}
        radius={innerRadius}
        duration={24}
        direction="cw"
        isPaused={activeProvider !== null}
      >
        <HeroProviderNode
          provider={PROVIDERS_META.hackerrank}
          isActive={activeProvider === "hackerrank"}
          isAnyActive={activeProvider !== null}
          onSelect={() => handleProviderSelect("hackerrank")}
        />
      </HeroOrbitNode>

      {/* 6. Central TWM Core */}
      <HeroCore onCoreClick={handleCoreClick} />

      {/* 7. Floating Micro-Stat Preview Cards */}
      <HeroMicroStats />

      {/* 8. Contextual Provider Info Panel (Focus Mode) */}
      <HeroProviderInfo
        provider={activeProvider ? PROVIDERS_META[activeProvider] : null}
        onClose={() => setActiveProvider(null)}
      />
    </div>
  );
}
