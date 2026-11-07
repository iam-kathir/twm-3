"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Code2, Award, Clock, Sparkles, CheckCircle2, ShieldCheck, Zap, Check } from "lucide-react";

export function MotionShowcase() {
  const [activeTab, setActiveTab] = useState<"github" | "leetcode" | "hackerrank">("github");

  const tabGlowStyles = {
    github: {
      glow: "bg-sky-500/[0.08]",
      border: "border-sky-500/30",
      accentBg: "bg-sky-500/10 text-sky-400 border-sky-500/25",
      badge: "border-sky-500/30 text-sky-400 bg-sky-500/10",
      iconColor: "text-sky-400",
    },
    leetcode: {
      glow: "bg-amber-500/[0.08]",
      border: "border-amber-500/30",
      accentBg: "bg-amber-500/10 text-amber-400 border-amber-500/25",
      badge: "border-amber-500/30 text-amber-400 bg-amber-500/10",
      iconColor: "text-amber-400",
    },
    hackerrank: {
      glow: "bg-accent/[0.08]",
      border: "border-emerald-500/30",
      accentBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      badge: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
  };

  const currentTheme = tabGlowStyles[activeTab];

  return (
    <section id="showcase" className="py-20 md:py-28 relative overflow-hidden">
      {/* Background Dynamic Ambient Radial Mesh */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] ${currentTheme.glow} rounded-full blur-[140px] pointer-events-none transition-colors duration-500`}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/25 bg-accent/10 text-accent text-xs font-sans font-semibold  mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Observation Console
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Live Telemetry Demo
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
            Click across providers to inspect how student observations, timestamps, and verification guarantees are evaluated deterministically.
          </p>

          {/* Animated Tab Switcher with Glowing Active Pill */}
          <div className="mt-8 inline-flex max-w-full p-1.5 rounded-2xl border border-white/10 bg-surface shadow-panel">
            {[
              { id: "github", label: "GitHub Commits", short: "GitHub", icon: Github, color: "text-sky-400" },
              { id: "leetcode", label: "LeetCode Activity", short: "LeetCode", icon: Code2, color: "text-amber-400" },
              { id: "hackerrank", label: "HackerRank Badges", short: "HackerRank", icon: Award, color: "text-emerald-400" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-3 rounded-xl text-xs sm:text-sm font-sans font-semibold transition-all ${
                    isSelected ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-showcase-tab"
                      className="absolute inset-0 rounded-xl bg-surface-raised border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
                      transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 ${tab.color}`} />
                  <span className="relative z-10 whitespace-nowrap">
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.short}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Showcase Card Container */}
        <div
          className={`relative rounded-3xl border ${currentTheme.border} bg-surface p-8 sm:p-10 shadow-panel overflow-hidden min-h-[400px] flex flex-col justify-between transition-colors duration-500`}
        >
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/[0.08] text-sm font-sans text-slate-300">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold text-base">Aarav Sharma</span>
              <span className="text-white/20">|</span>
              <span className="text-slate-300 font-medium">CSE 2026</span>
              <span className="text-white/20">|</span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/[0.06] border border-white/10 text-xs font-medium text-slate-200">
                Section A
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm font-medium">
              <Clock className="h-4 w-4 text-accent" />
              <span>Synced 12m ago (IST)</span>
            </div>
          </div>

          {/* Dynamic Content Views */}
          <div className="py-8 flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === "github" && (
                <motion.div
                  key="github"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl space-y-7"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-xs sm:text-sm font-sans font-medium text-slate-400">Observed Active Days (7-Day Rolling)</span>
                      <div className="text-4xl sm:text-5xl font-black font-sans text-white mt-1">
                        6 <span className="text-slate-400 text-xl sm:text-2xl font-normal">/ 7 Days</span>
                      </div>
                    </div>
                    <span className="text-xs font-sans px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold tracking-wide flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      SUPPORTED LIVE
                    </span>
                  </div>

                  {/* Heatmap Stagger Squares */}
                  <div className="grid grid-cols-7 gap-2.5 sm:gap-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                      const active = i !== 4; // Friday rest
                      return (
                        <div key={day} className="text-center">
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: i * 0.04, duration: 0.2 }}
                            className={`h-14 sm:h-16 w-full rounded-2xl flex flex-col items-center justify-center font-sans text-xs font-bold transition-all ${
                              active
                                ? "bg-accent text-canvas"
                                : "bg-white/[0.03] text-slate-500 border border-white/[0.08]"
                            }`}
                          >
                            <span className="text-base font-extrabold flex items-center justify-center">{active ? <Check className="h-4 w-4" strokeWidth={3} /> : "—"}</span>
                            <span className="text-xs font-medium">{active ? "Active" : "Rest"}</span>
                          </motion.div>
                          <span className="text-xs font-sans text-slate-400 mt-2 block font-medium">{day}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coverage Gauge */}
                  <div className="p-4 rounded-2xl bg-surface-raised/80 border border-white/[0.08] space-y-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-sans">
                      <span className="text-slate-300 font-medium">Commit Author Matching &amp; Verification:</span>
                      <span className="text-accent font-bold">94.2% (Passed &gt; 90% Threshold)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-accent transition-all duration-500"
                        style={{ width: "94.2%" }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "leetcode" && (
                <motion.div
                  key="leetcode"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl space-y-6"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-xs sm:text-sm font-sans font-medium text-slate-400">Verified Solved Count</span>
                      <div className="text-4xl sm:text-5xl font-black font-sans text-white mt-1">
                        184 <span className="text-emerald-400 text-lg sm:text-xl font-bold">(+12 this week)</span>
                      </div>
                    </div>
                    <span className="text-xs font-sans px-3.5 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold tracking-wide flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      HMAC VERIFIED
                    </span>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
                    <div className="p-5 rounded-2xl bg-surface-raised/80 border border-emerald-500/30 text-center shadow-sm">
                      <span className="text-emerald-400 text-2xl sm:text-3xl font-black font-mono block">92</span>
                      <span className="text-xs sm:text-sm text-slate-300 font-sans font-semibold mt-1 block">Easy</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface-raised/80 border border-amber-500/30 text-center shadow-sm">
                      <span className="text-amber-400 text-2xl sm:text-3xl font-black font-mono block">78</span>
                      <span className="text-xs sm:text-sm text-slate-300 font-sans font-semibold mt-1 block">Medium</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-surface-raised/80 border border-rose-500/30 text-center shadow-sm">
                      <span className="text-rose-400 text-2xl sm:text-3xl font-black font-mono block">14</span>
                      <span className="text-xs sm:text-sm text-slate-300 font-sans font-semibold mt-1 block">Hard</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-surface-raised/80 border border-white/[0.08] flex flex-wrap justify-between items-center text-xs sm:text-sm font-sans gap-2">
                    <span className="text-slate-300 font-medium">Weekly Boundary Observation:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Sunday 23:45 IST Baseline Snapshot Verified
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === "hackerrank" && (
                <motion.div
                  key="hackerrank"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl space-y-6 text-center py-4"
                >
                  <div className="inline-flex p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Award className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">5-Star Python &amp; 4-Star Problem Solving</h3>
                    <p className="text-sm sm:text-base text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed font-sans">
                      Cumulative domain badges verified. Excluded from weekly delta competition per TWM capability policy.
                    </p>
                  </div>
                  <div>
                    <span className="inline-block text-xs font-sans px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold tracking-wide">
                      POLICY: DISPLAY ONLY (EXCLUDED FROM WEEKLY DELTA)
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Verification Footer Strip */}
          <div className="pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-sans text-slate-400">
            <div className="flex items-center gap-2 text-white font-medium">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Sunday Recap: 85.7% cohort consistency rate</span>
            </div>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Zero fabricated metrics
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

