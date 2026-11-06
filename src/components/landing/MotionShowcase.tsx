"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Code2, Award, Clock, CheckCircle2, ShieldCheck, Check } from "lucide-react";

type TabId = "github" | "leetcode" | "hackerrank";

export function MotionShowcase() {
  const [activeTab, setActiveTab] = useState<TabId>("github");

  return (
    <section id="showcase" className="scroll-mt-24 py-12 md:py-16 border-t border-white/[0.08] bg-canvas">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-semibold text-accent">Provider proofs — sample observations</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          One sample student, three providers
        </h2>
        <p className="mt-3 text-base text-muted leading-relaxed max-w-2xl">
          Switch tabs to see how each provider is observed. Every number below is a sample to explain the rules —
          it is not live telemetry.
        </p>

        <div className="mt-6 inline-flex max-w-full p-1.5 rounded-panel border border-white/10 bg-surface">
          {[
            { id: "github" as TabId, label: "GitHub", icon: Github, color: "text-white" },
            { id: "leetcode" as TabId, label: "LeetCode", icon: Code2, color: "text-provider-leetcode-brand" },
            { id: "hackerrank" as TabId, label: "HackerRank", icon: Award, color: "text-provider-hackerrank" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isSelected}
                className={`min-h-[44px] flex items-center gap-2 px-3 sm:px-5 rounded-control text-sm font-semibold transition-colors ${
                  isSelected ? "bg-surface-raised text-ink border border-white/15" : "text-muted hover:text-ink border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 ${tab.color}`} aria-hidden="true" />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-panel border border-white/10 bg-surface p-5 sm:p-8 overflow-hidden">
          <p className="text-sm font-semibold text-ink bg-surface-raised border border-white/10 rounded-lg px-3 py-2">
            Demo data — sample student view. Values are illustrative, not live telemetry.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 pb-5 border-b border-white/[0.08] text-sm text-muted">
            <p className="text-ink font-bold text-base">Sample student (demo)</p>
            <p className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Synced 12m ago (IST)</span>
            </p>
          </div>

          <div className="py-8">
            <AnimatePresence mode="wait">
              {activeTab === "github" && (
                <motion.div
                  key="github"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-2xl mx-auto space-y-6"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted">Observed active days (7-day rolling)</span>
                      <p className="text-4xl font-extrabold text-ink mt-1 tabular-nums">
                        6 <span className="text-muted text-xl font-normal">/ 7 days</span>
                      </p>
                    </div>
                    <span className="text-sm px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Supported live
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
                      const active = i !== 4;
                      return (
                        <div key={day} className="text-center">
                          <div
                            className={`min-h-[56px] rounded-control flex flex-col items-center justify-center text-sm font-bold ${
                              active ? "bg-accent text-canvas" : "bg-white/[0.03] text-muted border border-white/[0.08]"
                            }`}
                          >
                            <span className="text-base font-extrabold flex items-center justify-center">
                              {active ? <Check className="h-4 w-4" strokeWidth={3} aria-label="Active" /> : "—"}
                            </span>
                            <span className="text-sm font-medium">{active ? "Active" : "Rest"}</span>
                          </div>
                          <span className="text-sm text-muted mt-2 block">{day}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-control bg-surface-raised border border-white/[0.08] p-4 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted font-medium">Commit author matching</span>
                      <span className="text-accent font-semibold">94% (passes 90% threshold)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full rounded-full bg-accent" style={{ width: "94%" }} />
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
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-2xl mx-auto space-y-6"
                >
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <span className="text-sm font-medium text-muted">Verified solved count</span>
                      <p className="text-4xl font-extrabold text-ink mt-1 tabular-nums">
                        184 <span className="text-emerald-400 text-lg font-bold">(+12 this week)</span>
                      </p>
                    </div>
                    <span className="text-sm px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                      HMAC verified
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-control bg-surface-raised border border-emerald-500/30 text-center">
                      <span className="text-emerald-400 text-2xl font-extrabold font-mono block tabular-nums">92</span>
                      <span className="text-sm text-muted font-semibold mt-1 block">Easy</span>
                    </div>
                    <div className="p-4 rounded-control bg-surface-raised border border-amber-500/30 text-center">
                      <span className="text-amber-400 text-2xl font-extrabold font-mono block tabular-nums">78</span>
                      <span className="text-sm text-muted font-semibold mt-1 block">Medium</span>
                    </div>
                    <div className="p-4 rounded-control bg-surface-raised border border-rose-500/30 text-center">
                      <span className="text-rose-400 text-2xl font-extrabold font-mono block tabular-nums">14</span>
                      <span className="text-sm text-muted font-semibold mt-1 block">Hard</span>
                    </div>
                  </div>

                  <p className="rounded-control bg-surface-raised border border-white/[0.08] p-4 text-sm text-muted flex flex-wrap justify-between items-center gap-2">
                    <span className="font-medium">Weekly boundary observation:</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Sunday 23:45 IST baseline snapshot verified
                    </span>
                  </p>
                </motion.div>
              )}

              {activeTab === "hackerrank" && (
                <motion.div
                  key="hackerrank"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="w-full max-w-2xl mx-auto space-y-5 text-center py-4"
                >
                  <div className="inline-flex p-4 rounded-panel bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <Award className="h-10 w-10" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-ink">5-Star Python &amp; 4-Star Problem Solving</h3>
                    <p className="text-sm text-muted max-w-lg mx-auto mt-2 leading-relaxed">
                      Cumulative badges verified for display. Excluded from weekly competition by capability policy —
                      there are no public timestamps to place in a week.
                    </p>
                  </div>
                  <p>
                    <span className="inline-block text-sm px-4 py-2 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-semibold">
                      Display only — excluded from weekly deltas
                    </span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>Real observations always show their source, window, and freshness.</p>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Zero fabricated metrics
            </span>
          </div>

          <p className="mt-4 flex items-start gap-2 text-sm text-muted">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
            Providers stay separate. GitHub commits and LeetCode problems are never merged into one composite score.
          </p>
        </div>
      </div>
    </section>
  );
}
