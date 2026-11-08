"use client";

import React from "react";

export interface HeroOrbitTrackProps {
  duration: number; // seconds for full 360deg revolution
  direction?: "cw" | "ccw";
  isPaused?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Continuous rotating orbital layer container (§1).
 * Hardware-accelerated GPU transform rotation around the central core.
 */
export function HeroOrbitTrack({
  duration,
  direction = "cw",
  isPaused = false,
  children,
  className = "",
}: HeroOrbitTrackProps) {
  const animClass = direction === "ccw" ? "animate-orbit-ccw" : "animate-orbit-cw";

  return (
    <div
      style={
        {
          "--duration": `${duration}s`,
          animationPlayState: isPaused ? "paused" : "running",
        } as React.CSSProperties
      }
      className={`absolute inset-0 flex items-center justify-center pointer-events-none ${animClass} ${className}`}
    >
      {children}
    </div>
  );
}

export interface HeroOrbitNodeProps {
  angle?: number; // polar angle in degrees (0 = North / 12 o'clock, clockwise)
  initialAngle?: number; // alias for compatibility
  radius: number; // orbit radius in pixels from center
  duration: number; // seconds (matches parent layer duration for exact counter-rotation)
  direction?: "cw" | "ccw"; // direction of parent layer
  isPaused?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Orbit node positioned at Cartesian coordinates (x, y) along the orbit circle,
 * with synchronized counter-rotation so its icons remain 100% upright relative to the screen (§1).
 */
export function HeroOrbitNode({
  angle,
  initialAngle,
  radius,
  duration,
  direction = "cw",
  isPaused = false,
  children,
  className = "",
}: HeroOrbitNodeProps) {
  const polarAngle = angle ?? initialAngle ?? 0;

  // Cartesian coordinates relative to center (0, 0):
  // 0° = North (0, -radius), 90° = East (radius, 0), 180° = South (0, radius), 270° = West (-radius, 0)
  const rad = (polarAngle * Math.PI) / 180;
  const x = Math.round(radius * Math.sin(rad) * 100) / 100;
  const y = -Math.round(radius * Math.cos(rad) * 100) / 100;

  // Counter-rotation direction: if parent track revolves CW, child revolves CCW, and vice versa.
  const counterAnimClass =
    direction === "cw" ? "animate-orbit-ccw" : "animate-orbit-cw";

  return (
    <div
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
      className={`absolute flex items-center justify-center pointer-events-none ${className}`}
    >
      {/* Synchronized counter-rotation container canceling parent layer's revolution */}
      <div
        style={
          {
            "--duration": `${duration}s`,
            animationPlayState: isPaused ? "paused" : "running",
          } as React.CSSProperties
        }
        className={`pointer-events-auto ${counterAnimClass}`}
      >
        {children}
      </div>
    </div>
  );
}

export interface HeroStationaryOrbitNodeProps {
  angle: number; // polar angle in degrees (0 = North / 12 o'clock, clockwise)
  radius: number; // orbit radius in pixels from center
  pulseDuration?: number; // seconds for gentle breathing cycle (default: 4s)
  pulseDelay?: string; // staggered delay e.g. "1s"
  children: React.ReactNode;
  className?: string;
}

/**
 * Stationary orbit node positioned at Cartesian coordinates (x, y) along an orbital track.
 * Does not revolve around the core; instead anchors at a fixed landmark coordinate with
 * subtle breathing illumination to prevent visual crowding while maintaining spatial structure.
 */
export function HeroStationaryOrbitNode({
  angle,
  radius,
  pulseDuration = 4,
  pulseDelay = "0s",
  children,
  className = "",
}: HeroStationaryOrbitNodeProps) {
  const rad = (angle * Math.PI) / 180;
  const x = Math.round(radius * Math.sin(rad) * 100) / 100;
  const y = -Math.round(radius * Math.cos(rad) * 100) / 100;

  return (
    <div
      style={{
        transform: `translate3d(${x}px, ${y}px, 0)`,
      }}
      className={`absolute flex items-center justify-center pointer-events-none ${className}`}
    >
      <div
        style={
          {
            "--pulse-duration": `${pulseDuration}s`,
            animationDelay: pulseDelay,
          } as React.CSSProperties
        }
        className="pointer-events-auto animate-pulse-subtle"
      >
        {children}
      </div>
    </div>
  );
}
