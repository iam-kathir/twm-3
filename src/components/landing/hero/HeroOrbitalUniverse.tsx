"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PROVIDERS_META,
  ProviderId,
  MOVING_ACTIVITY_NODES,
  STATIONARY_ACTIVITY_NODES,
  STATIONARY_ANALYTICS_NODES,
  calculateResponsiveOrbitalRadii,
} from "./hero-constants";
import { HeroRadar } from "./HeroRadar";
import { HeroConnectionPaths } from "./HeroConnectionPaths";
import { HeroCore } from "./HeroCore";
import {
  HeroOrbitTrack,
  HeroOrbitNode,
  HeroStationaryOrbitNode,
} from "./HeroOrbitLayer";
import { HeroProviderNode } from "./HeroProviderNode";
import { HeroMicroStats } from "./HeroMicroStats";
import { HeroProviderInfo } from "./HeroProviderInfo";
import { fireMilestoneBurst } from "@/lib/celebrate";
import { toast } from "sonner";

export function HeroOrbitalUniverse() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(null);
  const [radii, setRadii] = useState(() => calculateResponsiveOrbitalRadii(540));

  useEffect(() => {
    if (!containerRef.current) return;

    const updateRadii = (width: number) => {
      if (width <= 0) return;
      setRadii((prev) => {
        const next = calculateResponsiveOrbitalRadii(width);
        if (
          next.innerRadius === prev.innerRadius &&
          next.middleRadius === prev.middleRadius &&
          next.outerRadius === prev.outerRadius
        ) {
          return prev;
        }
        return next;
      });
    };

    updateRadii(containerRef.current.clientWidth);

    let frameId: number | null = null;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = entry.contentRect.width;
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        updateRadii(width);
      });
    });

    observer.observe(containerRef.current);

    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  const { innerRadius, middleRadius, outerRadius, containerSize } = radii;

  const handleProviderSelect = (id: ProviderId) => {
    setActiveProvider((prev) => (prev === id ? null : id));
  };

  const handleCoreClick = () => {
    fireMilestoneBurst(0.65, 0.4);
    toast("Track. Win. Maintain.", {
      description: "Institutional Developer Activity Universe for engineering cohorts.",
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[580px] mx-auto flex items-center justify-center select-none"
    >
      {/* 1. Radar Scanning Effect & Concentric Grid Tracks (Stationary Foundation) */}
      <HeroRadar
        innerRadius={innerRadius}
        middleRadius={middleRadius}
        outerRadius={outerRadius}
      />

      {/* 2. Layer 3: Stationary Secondary Analytics & Governance Landmarks (Outer Track, R3)
          Anchored at 45°, 135°, 225°, and 315° with subtle breathing illumination to prevent crowding */}
      {STATIONARY_ANALYTICS_NODES.map((node) => {
        const Icon = node.icon;
        return (
          <HeroStationaryOrbitNode
            key={node.id}
            angle={node.angle}
            radius={outerRadius}
            pulseDelay={node.pulseDelay}
          >
            <div
              title={`${node.name}: ${node.label}`}
              className="p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface/90 backdrop-blur-md border border-white/10 hover:border-brand-secondary/60 shadow-md transition-all hover:scale-110 cursor-default group"
              style={{
                boxShadow: `0 0 16px ${node.glowColor}`,
              }}
            >
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${node.colorClass} transition-transform group-hover:scale-110`} />
            </div>
          </HeroStationaryOrbitNode>
        );
      })}

      {/* 3. Layer 2: Stationary Secondary Activity Landmarks (Track 2, R2)
          Anchored at 90° and 270° with subtle breathing illumination */}
      {STATIONARY_ACTIVITY_NODES.map((node) => {
        const Icon = node.icon;
        return (
          <HeroStationaryOrbitNode
            key={node.id}
            angle={node.angle}
            radius={middleRadius}
            pulseDelay={node.pulseDelay}
          >
            <div
              title={`${node.name}: ${node.label}`}
              className="p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface/90 backdrop-blur-md border border-white/10 hover:border-brand-highlight/60 shadow-md transition-all hover:scale-110 cursor-default group"
              style={{
                boxShadow: `0 0 16px ${node.glowColor}`,
              }}
            >
              <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${node.colorClass} transition-transform group-hover:scale-110`} />
            </div>
          </HeroStationaryOrbitNode>
        );
      })}

      {/* 4. Layer 2: Moving Activity Orbit (Middle, CCW, 44s)
          Exactly 2 selected active telemetry streams revolving gracefully */}
      <HeroOrbitTrack duration={44} direction="ccw">
        {MOVING_ACTIVITY_NODES.map((node) => {
          const Icon = node.icon;
          return (
            <HeroOrbitNode
              key={node.id}
              angle={node.angle}
              radius={middleRadius}
              duration={44}
              direction="ccw"
            >
              <div
                title={`${node.name}: ${node.label}`}
                className="p-1.5 sm:p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-surface/95 backdrop-blur-md border border-white/15 hover:border-brand-highlight/80 shadow-lg transition-all hover:scale-115 cursor-default group"
                style={{
                  boxShadow: `0 0 18px ${node.glowColor}`,
                }}
              >
                <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${node.colorClass} transition-transform group-hover:scale-110`} />
              </div>
            </HeroOrbitNode>
          );
        })}
      </HeroOrbitTrack>

      {/* 5. Layer 1: Dedicated Provider Orbit (Inner, CW, 34s)
          Spacious orbit corridor with generous clearance from central core.
          Both Connection Beams and Provider Nodes revolve together inside this track
          so beams stay permanently locked to GitHub (0°), LeetCode (120°), and HackerRank (240°). */}
      <HeroOrbitTrack duration={34} direction="cw">
        {/* Animated Energy Connection Paths from Core to Providers (Mapped 1:1 to container size) */}
        <HeroConnectionPaths
          activeProvider={activeProvider}
          innerRadius={innerRadius}
          containerSize={containerSize}
        />

        {/* 5a. GitHub (0 deg / North) */}
        <HeroOrbitNode
          angle={0}
          radius={innerRadius}
          duration={34}
          direction="cw"
        >
          <HeroProviderNode
            provider={PROVIDERS_META.github}
            isActive={activeProvider === "github"}
            isAnyActive={activeProvider !== null}
            onSelect={() => handleProviderSelect("github")}
          />
        </HeroOrbitNode>

        {/* 5b. LeetCode (120 deg / South-East) */}
        <HeroOrbitNode
          angle={120}
          radius={innerRadius}
          duration={34}
          direction="cw"
        >
          <HeroProviderNode
            provider={PROVIDERS_META.leetcode}
            isActive={activeProvider === "leetcode"}
            isAnyActive={activeProvider !== null}
            onSelect={() => handleProviderSelect("leetcode")}
          />
        </HeroOrbitNode>

        {/* 5c. HackerRank (240 deg / South-West) */}
        <HeroOrbitNode
          angle={240}
          radius={innerRadius}
          duration={34}
          direction="cw"
        >
          <HeroProviderNode
            provider={PROVIDERS_META.hackerrank}
            isActive={activeProvider === "hackerrank"}
            isAnyActive={activeProvider !== null}
            onSelect={() => handleProviderSelect("hackerrank")}
          />
        </HeroOrbitNode>
      </HeroOrbitTrack>

      {/* 6. Zone 1: Central Stationary TWM Core */}
      <HeroCore onCoreClick={handleCoreClick} />

      {/* 7. Floating Micro-Stat Preview Cards (Safe Corners) */}
      <HeroMicroStats />

      {/* 8. Contextual Provider Info Drawer (Focus Mode — Does Not Freeze Universe) */}
      <HeroProviderInfo
        provider={activeProvider ? PROVIDERS_META[activeProvider] : null}
        onClose={() => setActiveProvider(null)}
      />
    </div>
  );
}
