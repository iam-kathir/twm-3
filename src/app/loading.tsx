"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity, Terminal } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Ambient background light orbs */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-accent/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Center Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl border border-white/10 bg-surface/90 backdrop-blur-2xl shadow-overlay text-center"
      >
        {/* Pulsing Brand Mark */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.35, 0.7, 0.35],
            }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl bg-accent/25 blur-lg"
          />
          <div className="relative w-16 h-16 rounded-2xl bg-surface-elevated border border-accent/40 flex items-center justify-center shadow-lg">
            <Terminal className="h-8 w-8 text-accent animate-pulse" />
          </div>
        </div>

        {/* Brand Title & Platform Identification */}
        <h2 className="text-xl sm:text-2xl font-bold font-sans text-ink tracking-tight">
          TWM <span className="text-accent">3.1</span>
        </h2>
        <p className="mt-1 text-xs sm:text-sm font-sans text-muted">
          Institutional Developer Telemetry Platform
        </p>

        {/* High-Tech Running Progress Beam */}
        <div className="mt-6 relative h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden border border-white/[0.08]">
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-accent to-transparent"
          />
        </div>

        {/* Dynamic Status Ticker */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-sans text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span>Hydrating verified cohort telemetry...</span>
        </div>

        {/* Guaranteed Invariant Badges */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-center gap-4 text-xs font-sans text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Zero Fabrication
          </span>
          <span className="text-white/10">•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-accent" />
            Sunday Boundary Engine
          </span>
        </div>
      </motion.div>
    </div>
  );
}
