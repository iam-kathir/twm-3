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
      {/* Outer Breathing Energy Ring */}
      <div className="absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-brand-primary/25 animate-energy-pulse pointer-events-none" />
      <div className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-brand-highlight/15 animate-energy-pulse [animation-delay:1.5s] pointer-events-none" />

      {/* Dimensional Glassmorphic TWM Core Frame */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.06, rotate: 1 }}
        whileTap={{ scale: 0.96 }}
        onClick={onCoreClick}
        title="TWM Telemetry Engine Core — Click for verification pulse"
        aria-label="TWM Telemetry Engine Core"
        className="group relative flex w-28 h-28 sm:w-34 sm:h-34 items-center justify-center rounded-3xl bg-gradient-to-b from-[#18202E]/95 via-[#121620]/95 to-[#0A0D14]/95 p-3 sm:p-4 border border-brand-primary/40 shadow-[0_0_40px_rgba(101,85,245,0.30)] hover:shadow-[0_0_60px_rgba(101,85,245,0.50)] hover:border-brand-highlight/50 transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-primary"
      >
        {/* Soft Inner Rim Highlight */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/[0.08] to-transparent pointer-events-none" />

        {/* Official 3D Ribbon Monogram */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src="/icon.svg"
            alt="TWM Platform Official Monogram"
            width={112}
            height={44}
            priority
            className="object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_18px_rgba(101,85,245,0.45)]"
          />
        </div>

        {/* Telemetry Active Status Pulse Pill */}
        <span className="absolute -bottom-2.5 px-2 py-0.5 rounded-full border border-status-verified/40 bg-surface-elevated/95 backdrop-blur-md flex items-center gap-1.5 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-status-verified animate-ping" />
          <span className="h-1.5 w-1.5 rounded-full bg-status-verified" />
          <span className="text-[10px] font-mono font-bold text-status-verified uppercase tracking-wider">
            Engine
          </span>
        </span>
      </motion.button>
    </div>
  );
}
