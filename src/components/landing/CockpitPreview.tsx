"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Code2,
  Award,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export function CockpitPreview() {
  const [recapMode, setRecapMode] = useState<"ai" | "deterministic">("ai");

  return (
    <section id="cockpit" className="scroll-mt-24 py-12 md:py-16 border-t border-white/[0.08] bg-canvas">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-semibold text-accent">Cohort momentum — sample view</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          How your activity appears in TWM
        </h2>
        <p className="mt-3 text-base text-muted leading-relaxed max-w-2xl">
          Zero fabrication. Every metric shows its origin, window, freshness, and capability gate. The card below is
          a sample — live numbers appear only after you verify and opt in.
        </p>

        <div className="mt-8 rounded-panel border border-white/10 bg-surface overflow-hidden">
          <div className="border-b border-white/[0.08] bg-surface-raised px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-11 w-11 rounded-control bg-canvas border border-white/10 flex items-center justify-center font-bold text-accent font-mono text-sm" aria-hidden="true">
                SS
              </div>
              <div>
                <p className="font-bold text-ink text-base">Sample student (demo)</p>
                <p className="text-sm text-muted font-mono mt-0.5">
                  CSE 2026 · <span className="text-emerald-400 font-medium">Opted in to tournament</span>
                </p>
              </div>
            </div>

            <p className="flex items-center gap-2 text-sm font-mono bg-canvas border border-white/10 px-3 py-2 rounded-control text-muted">
              <Clock className="h-4 w-4 text-accent" aria-hidden="true" />
              <span>Last synced 14m ago · Asia/Kolkata (IST)</span>
            </p>
          </div>

          <p className="mx-4 sm:mx-6 mt-4 text-sm font-semibold text-ink bg-surface-raised border border-white/10 rounded-lg px-3 py-2">
            Demo data — sample student view. Values are illustrative, not live telemetry.
          </p>

          <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-canvas/40">
            <div className="rounded-panel border border-white/[0.08] bg-surface p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <p className="flex items-center gap-2 text-ink font-bold text-base">
                    <Github className="h-5 w-5 text-white" aria-hidden="true" />
                    <span>GitHub</span>
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Supported live
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm text-muted mb-2 font-medium">
                      <span>Observed active days:</span>
                      <span className="text-ink font-extrabold text-base">6 / 7 days</span>
                    </div>
                    <div className="flex gap-1.5" aria-label="6 of 7 days active">
                      {[1, 1, 1, 1, 0, 1, 1].map((active, i) => (
                        <div
                          key={i}
                          title={`Day ${i + 1}: ${active ? "Active commit observed" : "No commits"}`}
                          className={`h-7 flex-1 rounded-md ${active ? "bg-emerald-400" : "bg-surface-raised border border-white/[0.06]"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted block mt-2">Calendar buckets: UTC days</p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex justify-between text-sm">
                    <span className="text-muted">Retrieval coverage:</span>
                    <span className="text-emerald-400 font-bold">94% (passes)</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-sm text-muted">
                <span>Weekly consistency:</span>
                <span className="text-accent font-extrabold text-base">86%</span>
              </div>
            </div>

            <div className="rounded-panel border border-white/[0.08] bg-surface p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <p className="flex items-center gap-2 text-ink font-bold text-base">
                    <Code2 className="h-5 w-5 text-provider-leetcode-brand" aria-hidden="true" />
                    <span>LeetCode</span>
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-mono font-semibold bg-accent/10 text-accent border border-accent/20">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    HMAC verified
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-muted">Cumulative solved:</span>
                    <span className="text-2xl text-ink font-extrabold tabular-nums">184</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-surface-raised py-2.5 rounded-control border border-emerald-500/20">
                      <span className="text-emerald-400 block font-extrabold text-base">92</span>
                      <span className="text-muted mt-0.5 block text-sm">Easy</span>
                    </div>
                    <div className="bg-surface-raised py-2.5 rounded-control border border-amber-500/20">
                      <span className="text-amber-400 block font-extrabold text-base">78</span>
                      <span className="text-muted mt-0.5 block text-sm">Medium</span>
                    </div>
                    <div className="bg-surface-raised py-2.5 rounded-control border border-rose-500/20">
                      <span className="text-rose-400 block font-extrabold text-base">14</span>
                      <span className="text-muted mt-0.5 block text-sm">Hard</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex justify-between text-sm">
                    <span className="text-muted">Weekly delta:</span>
                    <span className="text-accent font-bold">+12 solved</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-sm text-muted">
                <span>Method: pre-boundary observation</span>
                <span className="text-emerald-400 font-semibold">Finalized</span>
              </div>
            </div>

            <div className="rounded-panel border border-white/[0.08] bg-surface p-5 flex flex-col justify-between sm:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <p className="flex items-center gap-2 text-ink font-bold text-base">
                    <Award className="h-5 w-5 text-provider-hackerrank" aria-hidden="true" />
                    <span>HackerRank</span>
                  </p>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                    Limited
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-sm text-muted">Badges observed:</span>
                    <span className="text-ink font-bold text-sm text-right">5-star Python, 4-star PS</span>
                  </div>

                  <p className="p-3.5 rounded-control bg-surface-raised border border-white/[0.06] text-sm text-muted leading-relaxed">
                    Profile linked. Cumulative stats shown for display; excluded from period ranking because there
                    are no public timestamps.
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-sm text-muted">
                <span>Eligibility status:</span>
                <span className="text-accent font-bold">Display only</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.08] bg-surface p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-base text-ink">Weekly developer recap</h3>
                <p className="text-sm text-muted">Non-judgmental peer recap — grounded in the sample above.</p>
              </div>
              <div className="flex items-center gap-1 bg-canvas p-1 rounded-control border border-white/10 text-sm" role="group" aria-label="Recap mode">
                <button
                  type="button"
                  onClick={() => setRecapMode("ai")}
                  aria-pressed={recapMode === "ai"}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-md transition-colors ${
                    recapMode === "ai" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-ink"
                  }`}
                >
                  AI explanation
                </button>
                <button
                  type="button"
                  onClick={() => setRecapMode("deterministic")}
                  aria-pressed={recapMode === "deterministic"}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-md transition-colors ${
                    recapMode === "deterministic" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-ink"
                  }`}
                >
                  Pure metrics view
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {recapMode === "ai" ? (
                <motion.p
                  key="ai"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-muted leading-relaxed bg-canvas p-4 rounded-control border border-white/[0.06]"
                >
                  &ldquo;You showed steady momentum this week with <strong className="text-ink">6 active days on GitHub</strong> and
                  an <strong className="text-ink">86% consistency rate</strong>. On LeetCode, 12 verified problems were
                  closed before the Sunday boundary. <em>Next week focus:</em> two Medium tree problems would sustain
                  the pattern.&rdquo;
                </motion.p>
              ) : (
                <motion.div
                  key="deterministic"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm text-muted bg-canvas p-4 rounded-control border border-white/[0.06] space-y-1.5"
                >
                  <p>GitHub active days: 6/7 (UTC) · Coverage: 94% · Period: Mon–Sun IST</p>
                  <p>LeetCode boundary change: +12 solved (172 → 184)</p>
                  <p>HackerRank: excluded from delta calculation (display only)</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
