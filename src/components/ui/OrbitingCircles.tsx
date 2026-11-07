"use client";

import React from "react";

interface OrbitingCirclesProps {
  className?: string;
  children?: React.ReactNode;
  reverse?: boolean;
  duration?: number;
  delay?: number;
  radius?: number;
  path?: boolean;
}

export function OrbitingCircles({
  className = "",
  children,
  reverse = false,
  duration = 20,
  delay = 0,
  radius = 50,
  path = true,
}: OrbitingCirclesProps) {
  return (
    <>
      {path && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          className="pointer-events-none absolute inset-0 size-full"
        >
          <circle
            className="stroke-white/[0.08] stroke-1"
            cx="50%"
            cy="50%"
            r={radius}
            fill="none"
            strokeDasharray="4 4"
          />
        </svg>
      )}

      <div
        style={
          {
            "--duration": `${duration}s`,
            "--radius": `${radius}px`,
            "--delay": `-${delay}s`,
          } as React.CSSProperties
        }
        className={`absolute flex size-full transform-gpu animate-orbit items-center justify-center rounded-full [animation-delay:var(--delay)] ${
          reverse ? "[animation-direction:reverse]" : ""
        } ${className}`}
      >
        {children}
      </div>
    </>
  );
}
