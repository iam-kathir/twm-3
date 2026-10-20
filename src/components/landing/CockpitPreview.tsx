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
    <section id="cockpit" className="py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border border-white/[0.08] text-xs font-mono text-ink-secondary mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>Interactive Telemetry Preview</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            How Your Activity Appears in TWM
          </h2>
          <p className="mt-2 text-sm sm:text-base text-muted">
            Real data transparency. Every metric displays its origin, coverage window, freshness, and capability gate status.
          </p>
        </div>

        {/* The Dashboard Cockpit Mock Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-surface shadow-2xl overflow-hidden">
          {/* Cockpit Top Bar */}
          <div className="border-b border-white/[0.06] bg-surface-raised px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center font-bold text-white font-mono text-sm">
                AS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-ink text-sm">Aarav Sharma</h3>
                  <span className="text-[11px] font-mono text-muted">@aarav-dev</span>
                </div>
                <div className="text-xs font-mono text-muted flex items-center gap-2">
                  <span>Class: CSE 2026 (Section A)</span>
                  <span>•</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Opted-In to Leaderboard
                  </span>
                </div>
              </div>
            </div>

            {/* Freshness & Timezone metadata */}
            <div className="flex items-center gap-2 text-xs font-mono bg-surface border border-white/[0.06] px-3 py-1.5 rounded-lg text-muted">
              <Clock className="h-3.5 w-3.5 text-accent" />
              <span>Last Synced: 14m ago</span>
              <span className="text-white/10">|</span>
              <span className="text-ink-secondary">Asia/Kolkata (IST)</span>
            </div>
          </div>


          {/* Provider Grid */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#0B0D13]">
            {/* 1. GitHub Provider Card */}
            <div className="rounded-xl border border-white/[0.08] bg-surface p-5 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                    <Github className="h-4 w-4 text-white" />
                    <span>GitHub</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle className="h-2.5 w-2.5" />
                    SUPPORTED_LIVE
                  </span>
                </div>

                <div className="space-y-3 font-mono">
                  <div>
                    <div className="flex justify-between text-xs text-muted mb-1.5">
                      <span>Observed Active Days:</span>
                      <span className="text-ink font-bold">6 / 7 Days</span>
                    </div>
                    {/* Active days visual squares */}
                    <div className="flex gap-1.5">
                      {[1, 1, 1, 1, 0, 1, 1].map((active, i) => (
                        <div
                          key={i}
                          title={`Day ${i + 1}: ${active ? "Active" : "Inactive"}`}
                          className={`h-4 flex-1 rounded-sm ${
                            active ? "bg-emerald-400" : "bg-surface-raised border border-white/[0.04]"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-soft block mt-1">Calendar buckets: UTC</span>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.06] flex justify-between text-xs">
                    <span className="text-muted flex items-center gap-1">
                      Retrieval Coverage:
                      <span title="Percentage of days successfully observed via GitHub API">
                        <HelpCircle className="h-3 w-3 text-muted-soft" />
                      </span>
                    </span>
                    <span className="text-emerald-400 font-bold">94.2% (Passes)</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-muted">
                <span>Weekly Consistency:</span>
                <span className="text-accent font-bold">85.7%</span>
              </div>
            </div>

            {/* 2. LeetCode Provider Card */}
            <div className="rounded-xl border border-white/[0.08] bg-surface p-5 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                    <Code2 className="h-4 w-4 text-[#FFA116]" />
                    <span>LeetCode</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-accent border border-amber-500/20">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    HMAC_VERIFIED
                  </span>
                </div>

                <div className="space-y-3 font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted">Cumulative Solved:</span>
                    <span className="text-lg text-ink font-bold">184</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="bg-surface-raised py-1.5 rounded border border-emerald-500/20">
                      <span className="text-emerald-400 block font-bold">92</span>
                      <span className="text-muted">Easy</span>
                    </div>
                    <div className="bg-surface-raised py-1.5 rounded border border-amber-500/20">
                      <span className="text-amber-400 block font-bold">78</span>
                      <span className="text-muted">Med</span>
                    </div>
                    <div className="bg-surface-raised py-1.5 rounded border border-rose-500/20">
                      <span className="text-rose-400 block font-bold">14</span>
                      <span className="text-muted">Hard</span>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.06] flex justify-between text-xs">
                    <span className="text-muted">Weekly Delta:</span>
                    <span className="text-accent font-bold">+12 Solved</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-muted">
                <span>Method: Pre-boundary observation</span>
                <span className="text-emerald-400 font-semibold">Finalized</span>
              </div>
            </div>

            {/* 3. HackerRank Provider Card */}
            <div className="rounded-xl border border-white/[0.08] bg-surface p-5 flex flex-col justify-between hover:border-white/20 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-ink font-semibold text-sm">
                    <Award className="h-4 w-4 text-[#00EA64]" />
                    <span>HackerRank</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <AlertCircle className="h-2.5 w-2.5" />
                    LIMITED
                  </span>
                </div>

                <div className="space-y-3 font-mono">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted">Badges Observed:</span>
                    <span className="text-ink font-bold text-sm">5★ Python, 4★ PS</span>
                  </div>

                  <div className="p-2.5 rounded bg-surface-raised border border-white/[0.06] text-[11px] text-[#A0A6B5] leading-snug">
                    Profile linked. Cumulative stats shown for display; excluded from period ranking per Phase 0 boundary rule.
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-muted">
                <span>Eligibility Status:</span>
                <span className="text-accent font-bold">Display Only</span>
              </div>
            </div>
          </div>

          {/* Weekly Developer Recap Footer Strip */}
          <div className="border-t border-white/[0.08] bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <h4 className="font-semibold text-sm text-ink">Weekly Developer Recap (Week 41)</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised border border-white/[0.06] text-muted">
                  Non-Judgmental Synthesis
                </span>
              </div>
              <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setRecapMode("ai")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    recapMode === "ai" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                  }`}
                >
                  AI Explanation
                </button>
                <button
                  onClick={() => setRecapMode("deterministic")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    recapMode === "deterministic" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                  }`}
                >
                  Pure Metrics View
                </button>
              </div>
            </div>

            {recapMode === "ai" ? (
              <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans bg-canvas p-3.5 rounded-lg border border-white/[0.06]">
                &ldquo;You demonstrated steady momentum this week with <strong>6 active days observed on GitHub</strong> and an <strong>85.7% consistency rate</strong>. Your commit activity was distributed across semester repositories with 94.2% data coverage. On LeetCode, 12 verified problems were closed before Sunday 23:59 IST. <em>Next week focus:</em> try solving two Medium Tree problems on LeetCode to sustain your pattern.&rdquo;
              </p>
            ) : (
              <div className="text-xs font-mono text-ink-secondary bg-canvas p-3.5 rounded-lg border border-white/[0.06] space-y-1">
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
