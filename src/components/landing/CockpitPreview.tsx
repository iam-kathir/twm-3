"use client";

import React, { useState } from "react";
import { 
  Github, 
  Code2, 
  Award, 
  Activity, 
  Clock, 
  ShieldCheck, 
  AlertCircle, 
  Sparkles, 
  CheckCircle,
  HelpCircle
} from "lucide-react";

export function CockpitPreview() {
  const [recapMode, setRecapMode] = useState<"ai" | "deterministic">("ai");

  return (
    <section id="cockpit" className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/[0.08] text-xs font-mono text-muted mb-3">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span>Interactive Telemetry Preview</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
            How Your Activity Appears in TWM
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            Real data transparency. Every metric displays its origin, coverage window, freshness, and capability gate status.
          </p>
        </div>

        {/* The Dashboard Cockpit Mock Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-surface shadow-2xl overflow-hidden">
          {/* Cockpit Top Bar */}
          <div className="border-b border-white/[0.06] bg-surface-raised px-8 py-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-surface border border-white/10 flex items-center justify-center font-bold text-white font-mono text-base shadow-sm">
                AS
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-ink text-base sm:text-lg">Aarav Sharma</h3>
                  <span className="text-xs sm:text-sm font-mono text-muted">@aarav-dev</span>
                </div>
                <div className="text-xs sm:text-sm font-mono text-muted flex items-center gap-2.5 mt-0.5">
                  <span>Class: CSE 2026 (Section A)</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Opted-In to Leaderboard
                  </span>
                </div>
              </div>
            </div>

            {/* Freshness & Timezone metadata */}
            <div className="flex items-center gap-2.5 text-xs sm:text-sm font-mono bg-surface border border-white/[0.06] px-4 py-2 rounded-xl text-muted">
              <Clock className="h-4 w-4 text-accent" />
              <span>Last Synced: 14m ago</span>
              <span className="text-white/10">|</span>
              <span className="text-ink font-medium">Asia/Kolkata (IST)</span>
            </div>
          </div>

          {/* Provider Grid */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 bg-canvas">
            {/* 1. GitHub Provider Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-md">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5 text-ink font-bold text-base sm:text-lg">
                    <Github className="h-5 w-5 text-white" />
                    <span>GitHub</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="h-3 w-3" />
                    SUPPORTED_LIVE
                  </span>
                </div>

                <div className="space-y-4 font-mono">
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm text-muted mb-2 font-medium">
                      <span>Observed Active Days:</span>
                      <span className="text-ink font-extrabold text-base">6 / 7 Days</span>
                    </div>
                    {/* Active days visual squares */}
                    <div className="flex gap-2">
                      {[1, 1, 1, 1, 0, 1, 1].map((active, i) => (
                        <div
                          key={i}
                          title={`Day ${i + 1}: ${active ? "Active" : "Inactive"}`}
                          className={`h-6 flex-1 rounded-md transition-all ${
                            active ? "bg-emerald-400 shadow-sm shadow-emerald-400/20" : "bg-surface-raised border border-white/[0.04]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-soft block mt-1.5">Calendar buckets: UTC Days</span>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex justify-between text-xs sm:text-sm">
                    <span className="text-muted flex items-center gap-1.5">
                      Retrieval Coverage:
                      <span title="Percentage of days successfully observed via GitHub API">
                        <HelpCircle className="h-3.5 w-3.5 text-muted-soft" />
                      </span>
                    </span>
                    <span className="text-emerald-400 font-bold">94.2% (Passes)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs sm:text-sm font-mono text-muted">
                <span>Weekly Consistency:</span>
                <span className="text-accent font-extrabold text-base">85.7%</span>
              </div>
            </div>

            {/* 2. LeetCode Provider Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-md">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5 text-ink font-bold text-base sm:text-lg">
                    <Code2 className="h-5 w-5 text-[#FFA116]" />
                    <span>LeetCode</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-accent border border-amber-500/20">
                    <ShieldCheck className="h-3 w-3" />
                    HMAC_VERIFIED
                  </span>
                </div>

                <div className="space-y-4 font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted">Cumulative Solved:</span>
                    <span className="text-2xl text-ink font-extrabold">184</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-surface-raised py-2.5 rounded-xl border border-emerald-500/20">
                      <span className="text-emerald-400 block font-extrabold text-base">92</span>
                      <span className="text-muted mt-0.5 block">Easy</span>
                    </div>
                    <div className="bg-surface-raised py-2.5 rounded-xl border border-amber-500/20">
                      <span className="text-amber-400 block font-extrabold text-base">78</span>
                      <span className="text-muted mt-0.5 block">Med</span>
                    </div>
                    <div className="bg-surface-raised py-2.5 rounded-xl border border-rose-500/20">
                      <span className="text-rose-400 block font-extrabold text-base">14</span>
                      <span className="text-muted mt-0.5 block">Hard</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex justify-between text-xs sm:text-sm">
                    <span className="text-muted">Weekly Delta:</span>
                    <span className="text-accent font-bold">+12 Solved</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs sm:text-sm font-mono text-muted">
                <span>Method: Pre-boundary observation</span>
                <span className="text-emerald-400 font-semibold">Finalized</span>
              </div>
            </div>

            {/* 3. HackerRank Provider Card */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-md">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5 text-ink font-bold text-base sm:text-lg">
                    <Award className="h-5 w-5 text-[#00EA64]" />
                    <span>HackerRank</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-3 w-3" />
                    LIMITED
                  </span>
                </div>

                <div className="space-y-4 font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs sm:text-sm text-muted">Badges Observed:</span>
                    <span className="text-ink font-extrabold text-sm sm:text-base">5★ Python, 4★ PS</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] text-xs sm:text-sm text-muted leading-relaxed">
                    Profile linked. Cumulative stats shown for display; excluded from period ranking per Phase 0 boundary rule.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs sm:text-sm font-mono text-muted">
                <span>Eligibility Status:</span>
                <span className="text-accent font-extrabold">Display Only</span>
              </div>
            </div>
          </div>

          {/* Weekly Developer Recap Footer Strip */}
          <div className="border-t border-white/[0.08] bg-surface p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-accent" />
                <h4 className="font-bold text-base sm:text-lg text-ink">Weekly Developer Recap (Week 41)</h4>
                <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-surface-raised border border-white/[0.06] text-muted">
                  Non-Judgmental Synthesis
                </span>
              </div>
              <div className="flex items-center gap-1 bg-canvas p-1.5 rounded-xl border border-white/10 text-xs sm:text-sm font-mono">
                <button
                  type="button"
                  onClick={() => setRecapMode("ai")}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                    recapMode === "ai" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                  }`}
                >
                  AI Explanation
                </button>
                <button
                  type="button"
                  onClick={() => setRecapMode("deterministic")}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                    recapMode === "deterministic" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                  }`}
                >
                  Pure Metrics View
                </button>
              </div>
            </div>

            {recapMode === "ai" ? (
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed font-sans bg-canvas p-5 rounded-xl border border-white/[0.06]">
                &ldquo;You demonstrated steady momentum this week with <strong>6 active days observed on GitHub</strong> and an <strong>85.7% consistency rate</strong>. Your commit activity was distributed across semester repositories with 94.2% data coverage. On LeetCode, 12 verified problems were closed before Sunday 23:59 IST. <em>Next week focus:</em> try solving two Medium Tree problems on LeetCode to sustain your pattern.&rdquo;
              </p>
            ) : (
              <div className="text-xs sm:text-sm font-mono text-ink-secondary bg-canvas p-5 rounded-xl border border-white/[0.06] space-y-1.5">
                <div>• GitHub Active Days: 6/7 (UTC) | Coverage: 94.2% | Period: Mon–Sun IST</div>
                <div>• LeetCode Boundary Change: +12 Solved | Base: 172 -&gt; Current: 184</div>
                <div>• HackerRank: Excluded from delta calculation (cumulative display only)</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
