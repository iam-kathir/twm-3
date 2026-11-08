"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface HeroCoreProps {
  onCoreClick?: () => void;
}

export function HeroCore({ onCoreClick }: HeroCoreProps) {
  return (
    <div className="relative z-30 flex items-center justify-center">
      {/* Independent Rotating Energy Ring around the Core (Astrolabe Gyroscope) */}
      <div
        className="absolute -inset-3 sm:-inset-5 rounded-full border border-dashed border-brand-primary/25 animate-orbit-cw pointer-events-none"
        style={{ "--duration": "24s" } as React.CSSProperties}
      />

      {/* Dimensional Glassmorphic TWM Core Frame */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05, rotate: 0.5 }}
        whileTap={{ scale: 0.96 }}
        onClick={onCoreClick}
        title="TWM Core — Developer Activity Universe"
        aria-label="TWM Developer Activity Universe Core"
        className="group relative flex w-20 h-20 sm:w-26 sm:h-26 lg:w-28 lg:h-28 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#18202E]/95 via-[#121620]/95 to-[#0A0D14]/95 p-2 sm:p-3 lg:p-3.5 border border-brand-primary/40 shadow-[0_0_30px_rgba(101,85,245,0.25)] hover:shadow-[0_0_45px_rgba(101,85,245,0.45)] hover:border-brand-highlight/50 transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
      >
        {/* Outer Breathing Energy Rings (Relative Inset Bounds Guarantee Zero Orbital Intrusion) */}
        <div className="absolute -inset-2 sm:-inset-3.5 rounded-full border border-brand-primary/25 animate-energy-pulse pointer-events-none" />
        <div className="absolute -inset-4 sm:-inset-6 rounded-full border border-brand-highlight/15 animate-energy-pulse [animation-delay:1.5s] pointer-events-none" />

        {/* Soft Inner Rim Highlight */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-white/[0.08] to-transparent pointer-events-none" />

        {/* Official 3D Ribbon Monogram */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src="/icon.svg"
            alt="TWM Platform Official Monogram"
            width={96}
            height={38}
            priority
            className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_16px_rgba(101,85,245,0.45)]"
          />
        </div>

        {/* Decorative Brand Monogram Pill (Neutral Brand Identity — Zero False Operational Verification Claims) */}
        <span className="absolute -bottom-2 sm:-bottom-2.5 px-2 sm:px-2.5 py-0.5 rounded-full border border-white/10 bg-surface-elevated/95 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
          <span className="text-[9px] sm:text-[10px] font-mono font-semibold text-slate-300 uppercase tracking-wider">
            TWM Core
          </span>
        </span>
      </motion.button>
    </div>
  );
}

