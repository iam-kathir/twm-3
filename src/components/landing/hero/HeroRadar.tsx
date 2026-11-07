"use client";

import React from "react";

interface HeroRadarProps {
  innerRadius: number;
  middleRadius: number;
  outerRadius: number;
}

/**
 * Concentric orbital guides, cardinal crosshairs & atmospheric radar sweep (§3).
 */
export function HeroRadar({ innerRadius, middleRadius, outerRadius }: HeroRadarProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-visible">
      {/* Ambient Radial Lighting Field behind the Universe */}
      <div className="absolute w-[450px] h-[450px] sm:w-[550px] sm:h-[550px] rounded-full bg-gradient-to-tr from-[#6555F5]/12 via-[#3478F6]/10 to-[#16C8E8]/12 blur-[100px] pointer-events-none" />

      {/* Rotating Conic Radar Sweep */}
      <div
        className="absolute w-[440px] h-[440px] sm:w-[520px] sm:h-[520px] rounded-full animate-radar-sweep opacity-35 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(22, 200, 232, 0.15) 0deg, rgba(101, 85, 245, 0.05) 45deg, transparent 90deg, transparent 360deg)",
        }}
      />

      {/* SVG Concentric Guides & Crosshairs */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Subtle Glow Filter for Track Rings */}
          <filter id="trackGlow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Cardinal Crosshairs */}
        <line
          x1="50%"
          y1="8%"
          x2="50%"
          y2="92%"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <line
          x1="8%"
          y1="50%"
          x2="92%"
          y2="50%"
          stroke="rgba(255, 255, 255, 0.06)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Diagonal Subtle Crosshair Markers */}
        <line
          x1="20%"
          y1="20%"
          x2="80%"
          y2="80%"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="1"
          strokeDasharray="2 8"
        />
        <line
          x1="20%"
          y1="80%"
          x2="80%"
          y2="20%"
          stroke="rgba(255, 255, 255, 0.03)"
          strokeWidth="1"
          strokeDasharray="2 8"
        />

        {/* Concentric Orbital Tracks */}
        {/* Layer 1: Inner Provider Track */}
        <circle
          cx="50%"
          cy="50%"
          r={innerRadius}
          fill="none"
          stroke="rgba(101, 85, 245, 0.3)"
          strokeWidth="1.2"
          strokeDasharray="3 4"
          filter="url(#trackGlow)"
        />

        {/* Layer 2: Activity & Verification Track */}
        <circle
          cx="50%"
          cy="50%"
          r={middleRadius}
          fill="none"
          stroke="rgba(52, 120, 246, 0.22)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Layer 3: Analytics & Achievement Track */}
        <circle
          cx="50%"
          cy="50%"
          r={outerRadius}
          fill="none"
          stroke="rgba(22, 200, 232, 0.18)"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
      </svg>
    </div>
  );
}
