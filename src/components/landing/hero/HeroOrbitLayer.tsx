"use client";

import React from "react";

export interface HeroOrbitNodeProps {
  initialAngle: number; // degrees (0 - 360)
  radius: number; // pixels
  duration: number; // seconds
  direction?: "cw" | "ccw";
  isPaused?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function HeroOrbitNode({
  initialAngle,
  radius,
  duration,
  direction = "cw",
  isPaused = false,
  children,
  className = "",
}: HeroOrbitNodeProps) {
  const animClass =
    direction === "ccw" ? "animate-orbit-universe-ccw" : "animate-orbit-universe-cw";

  return (
    <div
      style={
        {
          "--initial-angle": `${initialAngle}deg`,
          "--radius": `${radius}px`,
          "--duration": `${duration}s`,
          animationPlayState: isPaused ? "paused" : "running",
        } as React.CSSProperties
      }
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${animClass} ${className}`}
    >
      <div className="pointer-events-auto">{children}</div>
    </div>
  );
}
