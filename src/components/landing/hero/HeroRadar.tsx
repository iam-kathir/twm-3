"use client";

import React from "react";

interface HeroRadarProps {
  innerRadius: number;
  middleRadius: number;
  outerRadius: number;
}

export function HeroRadar({ innerRadius, middleRadius, outerRadius }: HeroRadarProps) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Ambient Radial Glow */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#6555F5]/10 via-[#3478F6]/10 to-[#16C8E8]/10 blur-[120px] pointer-events-none" />

      {/* Rotating Conic Radar Sweep */}
      <div
        className="absolute w-[480px] h-[480px] sm:w-[560px] sm:h-[560px] rounded-full animate-radar-sweep opacity-30 pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg at 50% 50%, rgba(22, 200, 232, 0.12) 0deg, rgba(52, 120, 246, 0.04) 45deg, transparent 90deg, transparent 360deg)",
        }}
      />

      {/* SVG Concentric Guides & Crosshairs */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="radarGridFade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6555F5" stopOpacity="0.4" />
            <stop offset="60%" stopColor="#3478F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#16C8E8" stopOpacity="0.05" />
          </radialGradient>
        </defs>

        {/* Cardinal Crosshairs */}
        <line
          x1="50%"
          y1="5%"
          x2="50%"
          y2="95%"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />
        <line
          x1="5%"
          y1="50%"
          x2="95%"
          y2="50%"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Concentric Orbital Tracks */}
        {/* Layer 1: Inner Provider Orbit Track */}
        <circle
          cx="50%"
          cy="50%"
          r={innerRadius}
          fill="none"
          stroke="rgba(101, 85, 245, 0.25)"
          strokeWidth="1.2"
          strokeDasharray="3 4"
        />

        {/* Layer 2: Activity & Verification Orbit Track */}
        <circle
          cx="50%"
          cy="50%"
          r={middleRadius}
          fill="none"
          stroke="rgba(52, 120, 246, 0.2)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* Layer 3: Analytics & Achievement Orbit Track */}
        <circle
          cx="50%"
          cy="50%"
          r={outerRadius}
          fill="none"
          stroke="rgba(22, 200, 232, 0.15)"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
      </svg>
    </div>
  );
}
