"use client";

import React from "react";

interface AnimatedShinyTextProps {
  children: React.ReactNode;
  className?: string;
  shimmerWidth?: number;
}

export function AnimatedShinyText({
  children,
  className = "",
  shimmerWidth = 100,
}: AnimatedShinyTextProps) {
  return (
    <span
      style={
        {
          "--shimmer-width": `${shimmerWidth}px`,
        } as React.CSSProperties
      }
      className={`inline-flex animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shimmer-width)_100%] bg-gradient-to-r from-transparent via-emerald-300 via-50% to-transparent ${className}`}
    >
      {children}
    </span>
  );
}
