"use client";

import React from "react";
import { ProviderId } from "./hero-constants";

interface HeroConnectionPathsProps {
  activeProvider: ProviderId | null;
  innerRadius: number;
}

export function HeroConnectionPaths({
  activeProvider,
  innerRadius,
}: HeroConnectionPathsProps) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Violet to Cyan Energy Gradient */}
        <linearGradient id="energyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6555F5" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#3478F6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#16C8E8" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16C8E8" />
          <stop offset="100%" stopColor="#6555F5" />
        </linearGradient>

        {/* Soft Energy Glow Filter */}
        <filter id="energyGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 3 Energy Streams connecting towards Central TWM Core */}
      {/* 1. North Stream (GitHub at 0 deg) */}
      <line
        x1="50%"
        y1="50%"
        x2="50%"
        y2={`calc(50% - ${innerRadius}px)`}
        stroke={activeProvider === "github" ? "url(#activeGrad)" : "url(#energyGrad)"}
        strokeWidth={activeProvider === "github" ? "2.5" : "1.2"}
        strokeDasharray="4 6"
        strokeOpacity={activeProvider === "github" ? 0.95 : 0.4}
        filter={activeProvider === "github" ? "url(#energyGlow)" : undefined}
        className="transition-all duration-300"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="20"
          to="0"
          dur="1.8s"
          repeatCount="indefinite"
        />
      </line>

      {/* 2. South-East Stream (LeetCode at 120 deg) */}
      <line
        x1="50%"
        y1="50%"
        x2={`calc(50% + ${Math.round(innerRadius * Math.sin((120 * Math.PI) / 180))}px)`}
        y2={`calc(50% - ${Math.round(innerRadius * Math.cos((120 * Math.PI) / 180))}px)`}
        stroke={activeProvider === "leetcode" ? "#FFA116" : "url(#energyGrad)"}
        strokeWidth={activeProvider === "leetcode" ? "2.5" : "1.2"}
        strokeDasharray="4 6"
        strokeOpacity={activeProvider === "leetcode" ? 0.95 : 0.4}
        filter={activeProvider === "leetcode" ? "url(#energyGlow)" : undefined}
        className="transition-all duration-300"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="20"
          to="0"
          dur="2.2s"
          repeatCount="indefinite"
        />
      </line>

      {/* 3. South-West Stream (HackerRank at 240 deg) */}
      <line
        x1="50%"
        y1="50%"
        x2={`calc(50% + ${Math.round(innerRadius * Math.sin((240 * Math.PI) / 180))}px)`}
        y2={`calc(50% - ${Math.round(innerRadius * Math.cos((240 * Math.PI) / 180))}px)`}
        stroke={activeProvider === "hackerrank" ? "#2EC866" : "url(#energyGrad)"}
        strokeWidth={activeProvider === "hackerrank" ? "2.5" : "1.2"}
        strokeDasharray="4 6"
        strokeOpacity={activeProvider === "hackerrank" ? 0.95 : 0.4}
        filter={activeProvider === "hackerrank" ? "url(#energyGlow)" : undefined}
        className="transition-all duration-300"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="20"
          to="0"
          dur="2.6s"
          repeatCount="indefinite"
        />
      </line>
    </svg>
  );
}
