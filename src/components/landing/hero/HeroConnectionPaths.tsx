"use client";

import React from "react";
import { ProviderId } from "./hero-constants";

interface HeroConnectionPathsProps {
  activeProvider: ProviderId | null;
  innerRadius: number;
}

/**
 * Animated SVG energy streams connecting Central TWM Core to the 3 Provider nodes (§3, §5).
 * Rendered within the revolving Inner Orbit Layer so connection beams stay permanently locked
 * to GitHub (0°), LeetCode (120°), and HackerRank (240°) as they orbit the core.
 */
export function HeroConnectionPaths({
  activeProvider,
  innerRadius,
}: HeroConnectionPathsProps) {
  // Trigonometric coordinates for provider endpoints relative to center (0, 0)
  const xLeetCode = Math.round(innerRadius * Math.sin((120 * Math.PI) / 180));
  const yLeetCode = -Math.round(innerRadius * Math.cos((120 * Math.PI) / 180));

  const xHackerRank = Math.round(innerRadius * Math.sin((240 * Math.PI) / 180));
  const yHackerRank = -Math.round(innerRadius * Math.cos((240 * Math.PI) / 180));

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      viewBox="-300 -300 600 600"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Violet to Cyan Energy Gradient */}
        <linearGradient id="twmEnergyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6555F5" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#3478F6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#16C8E8" stopOpacity="0.85" />
        </linearGradient>

        <linearGradient id="githubBeam" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6555F5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="leetcodeBeam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6555F5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFA116" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="hackerrankBeam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6555F5" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#2EC866" stopOpacity="0.9" />
        </linearGradient>

        {/* Soft Energy Glow Filter */}
        <filter id="energyGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* ─────────────────────────────────────────────────────────────
          1. North Beam: GitHub (0 deg)
         ───────────────────────────────────────────────────────────── */}
      <g>
        {/* Core background aura line */}
        <line
          x1="0"
          y1="0"
          x2="0"
          y2={-innerRadius}
          stroke={activeProvider === "github" ? "url(#githubBeam)" : "url(#twmEnergyGrad)"}
          strokeWidth={activeProvider === "github" ? "3" : "1.5"}
          strokeDasharray="4 6"
          strokeOpacity={activeProvider === "github" ? 0.95 : 0.45}
          filter={activeProvider === "github" ? "url(#energyGlow)" : undefined}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="20"
            to="0"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </line>
        {/* Travelling energy particle */}
        <circle r={activeProvider === "github" ? "3.5" : "2"} fill="#16C8E8">
          <animateMotion
            path={`M 0 0 L 0 ${-innerRadius}`}
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* ─────────────────────────────────────────────────────────────
          2. South-East Beam: LeetCode (120 deg)
         ───────────────────────────────────────────────────────────── */}
      <g>
        <line
          x1="0"
          y1="0"
          x2={xLeetCode}
          y2={yLeetCode}
          stroke={activeProvider === "leetcode" ? "url(#leetcodeBeam)" : "url(#twmEnergyGrad)"}
          strokeWidth={activeProvider === "leetcode" ? "3" : "1.5"}
          strokeDasharray="4 6"
          strokeOpacity={activeProvider === "leetcode" ? 0.95 : 0.45}
          filter={activeProvider === "leetcode" ? "url(#energyGlow)" : undefined}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="20"
            to="0"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </line>
        {/* Travelling energy particle */}
        <circle r={activeProvider === "leetcode" ? "3.5" : "2"} fill="#FFA116">
          <animateMotion
            path={`M 0 0 L ${xLeetCode} ${yLeetCode}`}
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
      </g>

      {/* ─────────────────────────────────────────────────────────────
          3. South-West Beam: HackerRank (240 deg)
         ───────────────────────────────────────────────────────────── */}
      <g>
        <line
          x1="0"
          y1="0"
          x2={xHackerRank}
          y2={yHackerRank}
          stroke={activeProvider === "hackerrank" ? "url(#hackerrankBeam)" : "url(#twmEnergyGrad)"}
          strokeWidth={activeProvider === "hackerrank" ? "3" : "1.5"}
          strokeDasharray="4 6"
          strokeOpacity={activeProvider === "hackerrank" ? 0.95 : 0.45}
          filter={activeProvider === "hackerrank" ? "url(#energyGlow)" : undefined}
        >
          <animate
            attributeName="stroke-dashoffset"
            from="20"
            to="0"
            dur="2s"
            repeatCount="indefinite"
          />
        </line>
        {/* Travelling energy particle */}
        <circle r={activeProvider === "hackerrank" ? "3.5" : "2"} fill="#2EC866">
          <animateMotion
            path={`M 0 0 L ${xHackerRank} ${yHackerRank}`}
            dur="2.4s"
            repeatCount="indefinite"
          />
        </circle>
      </g>
    </svg>
  );
}
