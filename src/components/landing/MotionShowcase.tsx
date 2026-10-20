"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Code2, Award, Clock, Sparkles, CheckCircle2 } from "lucide-react";

export function MotionShowcase() {
  const [activeTab, setActiveTab] = useState<"github" | "leetcode" | "hackerrank">("github");

  return (
    <section id="showcase" className="py-12 md:py-20 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F6F8] tracking-tight">
            Live Telemetry Demo
          </h2>
          <p className="mt-2 text-sm text-[#8D94A5]">
            Click a platform to explore how real observations are rendered.
          </p>

          {/* Animated Tab Switcher */}
          <div className="mt-6 inline-flex p-1 rounded-xl border border-white/[0.08] bg-[#111319]">
            {[
              { id: "github", label: "GitHub", icon: Github, color: "text-[#60A5FA]" },
              { id: "leetcode", label: "LeetCode", icon: Code2, color: "text-[#FBBF24]" },
              { id: "hackerrank", label: "HackerRank", icon: Award, color: "text-[#34D399]" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono transition-colors ${
                    isSelected ? "text-white" : "text-[#8D94A5] hover:text-white"
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="active-tab-indicator"
                      className="absolute inset-0 rounded-lg bg-white/10 border border-white/15"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className={`h-3.5 w-3.5 ${tab.color}`} />
                  <span className="relative z-10 font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Animated Card Container */}
        <div className="relative rounded-2xl border border-white/[0.08] bg-[#111319] p-6 sm:p-8 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] text-xs font-mono text-[#8D94A5]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="text-[#F5F6F8] font-medium">Aarav Sharma</span>
              <span className="text-[#4B5262]">•</span>
              <span>CSE 2026</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#8D94A5]">
              <Clock className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>Synced 12m ago (IST)</span>
            </div>
          </div>


          {/* Dynamic Content Views */}
          <div className="py-6 flex-1 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {activeTab === "github" && (
                <motion.div
                  key="github"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-lg space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-400">Observed Active Days</span>
                      <div className="text-2xl font-bold font-mono text-white mt-0.5">
                        6 <span className="text-slate-400 text-sm font-normal">/ 7 Days</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      SUPPORTED_LIVE
                    </span>
                  </div>

                  {/* Heatmap Stagger Squares */}
                  <div className="flex gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                      const active = i !== 4; // Friday rest
                      return (
                        <div key={day} className="flex-1 text-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.05, duration: 0.3 }}
                            className={`h-8 w-full rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                              active
                                ? "bg-emerald-400 text-[#090A0E] shadow-sm"
                                : "bg-white/[0.04] text-slate-500 border border-white/5"
                            }`}
                          >
                            {active ? "✓" : "—"}
                          </motion.div>
                          <span className="text-[10px] font-mono text-slate-400 mt-1 block">{day}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 flex justify-between text-xs font-mono">
                    <span className="text-slate-400">API Date Retrieval:</span>
                    <span className="text-[#F59E0B] font-semibold">94.2% Coverage (Passes &gt;90% rule)</span>
                  </div>
                </motion.div>
              )}

              {activeTab === "leetcode" && (
                <motion.div
                  key="leetcode"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-lg space-y-5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono text-slate-400">Verified Solved Count</span>
                      <div className="text-2xl font-bold font-mono text-white mt-0.5">
                        184 <span className="text-emerald-400 text-sm font-medium">(+12 this week)</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                      HMAC_VERIFIED
                    </span>
                  </div>

                  {/* Difficulty Breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-emerald-500/20 text-center">
                      <span className="text-emerald-400 text-lg font-bold font-mono block">92</span>
                      <span className="text-xs text-slate-400 font-mono">Easy</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 text-center">
                      <span className="text-amber-400 text-lg font-bold font-mono block">78</span>
                      <span className="text-xs text-slate-400 font-mono">Medium</span>
                    </div>
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-rose-500/20 text-center">
                      <span className="text-rose-400 text-lg font-bold font-mono block">14</span>
                      <span className="text-xs text-slate-400 font-mono">Hard</span>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between text-xs font-mono text-slate-400">
                    <span>Boundary Rule Check:</span>
                    <span className="text-emerald-400 font-semibold">Sunday 23:45 IST Closed</span>
                  </div>
                </motion.div>
              )}

              {activeTab === "hackerrank" && (
                <motion.div
                  key="hackerrank"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-lg space-y-4 text-center py-2"
                >
                  <div className="inline-flex p-3 rounded-full bg-[#00EA64]/10 border border-[#00EA64]/20 text-[#00EA64]">
                    <Award className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">5★ Python &amp; 4★ Problem Solving</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      Cumulative domain badges verified. Excluded from weekly delta competition per Phase 0 capability policy.
                    </p>
                  </div>
                  <span className="inline-block text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    STATUS: DISPLAY_ONLY
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Minimalist Bottom Pulse Strip */}
          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="h-3.5 w-3.5 text-[#F59E0B]" />
              <span>Sunday Recap: 85.7% consistency rate</span>
            </div>
            <span className="text-emerald-400">No fake stats</span>
          </div>
        </div>
      </div>
    </section>
  );
}
