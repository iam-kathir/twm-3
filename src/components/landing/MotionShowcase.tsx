"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Code2, Award, Clock, Sparkles, CheckCircle2 } from "lucide-react";

export function MotionShowcase() {
  const [activeTab, setActiveTab] = useState<"github" | "leetcode" | "hackerrank">("github");

  return (
    <section id="showcase" className="py-16 md:py-24 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-accent/20 bg-accent/5 text-accent text-xs font-mono font-medium tracking-wide uppercase mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Interactive Observation Console
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
            Live Telemetry Demo
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed">
            Click across providers to inspect how real student observations, timestamps, and verification guarantees are rendered deterministically.
          </p>

          {/* Animated Tab Switcher */}
          <div className="mt-8 inline-flex p-1.5 rounded-2xl border border-white/[0.08] bg-surface shadow-lg">
            {[
              { id: "github", label: "GitHub Commits", icon: Github, color: "text-provider-github" },
              { id: "leetcode", label: "LeetCode Activity", icon: Code2, color: "text-provider-leetcode" },
              { id: "hackerrank", label: "HackerRank Badges", icon: Award, color: "text-provider-hackerrank" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-mono transition-colors ${
                    isSelected ? "text-ink font-semibold" : "text-muted hover:text-ink"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/15 shadow-inner"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-4 w-4 relative z-10 ${tab.color}`} />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Card Container */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-surface p-8 sm:p-10 shadow-2xl overflow-hidden min-h-[380px] flex flex-col justify-between">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/[0.06] text-sm font-mono text-muted">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-ink font-semibold text-base">Aarav Sharma</span>
              <span className="text-muted-soft">•</span>
              <span className="text-muted">CSE 2026</span>
              <span className="text-muted-soft">•</span>
              <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-xs text-muted-soft">Section A</span>
            </div>
            <div className="flex items-center gap-2 text-muted text-xs sm:text-sm">
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
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl space-y-7"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-sm font-mono text-muted">Observed Active Days</span>
                      <div className="text-4xl sm:text-5xl font-extrabold font-mono text-ink mt-1">
                        6 <span className="text-muted text-xl sm:text-2xl font-normal">/ 7 Days</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold tracking-wide">
                      SUPPORTED_LIVE
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
                            className={`h-14 sm:h-16 w-full rounded-xl flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                              active
                                ? "bg-emerald-400 text-canvas shadow-md shadow-emerald-400/20"
                                : "bg-white/[0.03] text-muted-soft border border-white/[0.06]"
                            }`}
                          >
                            <span className="text-base">{active ? "✓" : "—"}</span>
                            <span className="text-[10px] opacity-75">{active ? "Active" : "Rest"}</span>
                          </motion.div>
                          <span className="text-xs font-mono text-muted mt-2 block font-medium">{day}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coverage Gauge */}
                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                    <div className="flex justify-between items-center text-sm font-mono">
                      <span className="text-muted">Commit Date Observation Coverage:</span>
                      <span className="text-accent font-semibold">94.2% (&gt;90% rule passed)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: "94.2%" }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "leetcode" && (
                <motion.div
                  key="leetcode"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl space-y-6"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-sm font-mono text-muted">Verified Solved Count</span>
                      <div className="text-4xl sm:text-5xl font-extrabold font-mono text-ink mt-1">
                        184 <span className="text-emerald-400 text-lg sm:text-xl font-medium">(+12 this week)</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-3.5 py-1.5 rounded-full bg-accent/15 text-accent border border-accent/30 font-semibold tracking-wide">
                      HMAC_VERIFIED
                    </span>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="grid grid-cols-3 gap-3.5 sm:gap-4">
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-500/25 text-center shadow-sm">
                      <span className="text-emerald-400 text-2xl sm:text-3xl font-extrabold font-mono block">92</span>
                      <span className="text-xs sm:text-sm text-muted font-mono mt-1 block">Easy</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-amber-500/25 text-center shadow-sm">
                      <span className="text-amber-400 text-2xl sm:text-3xl font-extrabold font-mono block">78</span>
                      <span className="text-xs sm:text-sm text-muted font-mono mt-1 block">Medium</span>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-rose-500/25 text-center shadow-sm">
                      <span className="text-rose-400 text-2xl sm:text-3xl font-extrabold font-mono block">14</span>
                      <span className="text-xs sm:text-sm text-muted font-mono mt-1 block">Hard</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] flex flex-wrap justify-between items-center text-sm font-mono gap-2">
                    <span className="text-muted">Window Boundary Verification:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Sunday 23:45 IST Closed Snapshot
                    </span>
                  </div>
                </motion.div>
              )}

              {activeTab === "hackerrank" && (
                <motion.div
                  key="hackerrank"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="w-full max-w-2xl space-y-6 text-center py-4"
                >
                  <div className="inline-flex p-4 rounded-2xl bg-provider-hackerrank/10 border border-provider-hackerrank/20 text-provider-hackerrank shadow-md shadow-provider-hackerrank/10">
                    <Award className="h-10 w-10 sm:h-12 sm:w-12" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-ink">5★ Python &amp; 4★ Problem Solving</h3>
                    <p className="text-sm sm:text-base text-muted max-w-lg mx-auto mt-2 leading-relaxed">
                      Cumulative domain badges verified. Excluded from weekly delta competition per Phase 0 capability policy.
                    </p>
                  </div>
                  <div>
                    <span className="inline-block text-xs font-mono px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold tracking-wide">
                      POLICY: DISPLAY_ONLY_EXCLUDED_FROM_DELTA
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Minimalist Bottom Pulse Strip */}
          <div className="pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-sm font-mono text-muted">
            <div className="flex items-center gap-2 text-ink">
              <Sparkles className="h-4 w-4 text-accent" />
              <span>Sunday Recap: 85.7% class consistency rate</span>
            </div>
            <span className="text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Zero fabricated metrics
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
