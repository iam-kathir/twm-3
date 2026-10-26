"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Github, 
  Code2, 
  Award, 
  Activity, 
  Clock, 
  ShieldCheck, 
  Sparkles, 
  RotateCw, 
  CheckCircle2, 
  Trophy, 
  Sliders, 
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  GitCommit,
  GitBranch,
  Flame,
  Lock,
  Star
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";
import { WeeklyRecapCard } from "@/components/dashboard/WeeklyRecapCard";

export default function DashboardPage() {
  const {
    currentUser,
    isSyncing,
    triggerLiveSync,
    lastSyncTime,
    openDisputeModal,
    openSyncModal,
    exportTelemetryJSON
  } = useApp();

  const [recapMode, setRecapMode] = useState<"ai" | "deterministic">("ai");

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-accent selection:text-canvas">
      <AppHeader />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Metadata Banner */}
        <div className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {currentUser.name}
              </h1>
              <span className="text-sm font-mono text-muted">@{currentUser.handle}</span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                ● Leaderboard Opted-In
              </span>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold">
                {currentUser.activeTrack}
              </span>
            </div>
            <p className="text-sm sm:text-base text-muted font-mono">
              Class: {currentUser.classSection} • Register No: <strong className="text-white">{currentUser.rollNo}</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 text-sm font-mono">
            <button
              onClick={() => openDisputeModal()}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors text-sm font-mono flex items-center gap-2 font-medium"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Lodge Dispute</span>
            </button>

            <button
              onClick={exportTelemetryJSON}
              className="px-4 py-2.5 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-sm font-mono flex items-center gap-2 font-medium"
            >
              <span>Export Ledger</span>
            </button>

            <div className="px-4 py-2 rounded-xl bg-surface-raised border border-white/[0.08] text-right">
              <span className="block text-xs font-medium text-muted">Last sync</span>
              <span className="text-emerald-400 font-semibold text-sm">{lastSyncTime}</span>
            </div>
          </div>
        </div>

        {/* 4 Quick Telemetry KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-medium text-muted block">Weekly active days</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-white">{currentUser.github.activeDaysWeek} / 7 Days</div>
            <span className="text-xs font-mono text-emerald-400 block font-medium">Qualifying consistency</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-medium text-muted block">Consistency rate</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-accent">{Math.round((currentUser.github.activeDaysWeek / 7) * 100)}%</div>
            <span className="text-xs font-mono text-muted-soft block">Rule §9.4 enforced</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-medium text-muted block">Retrieval coverage</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400">94.2%</div>
            <span className="text-xs font-mono text-muted-soft block">Passes &gt;90% threshold</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-medium text-muted block">LeetCode delta</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-accent">
              {currentUser.leetcode.weeklyDelta ? `+${currentUser.leetcode.weeklyDelta} Solved` : `${currentUser.leetcode.totalSolved} Solved`}
            </div>
            <span className="text-xs font-mono text-muted-soft block">Boundary rule compliant</span>
          </div>
        </div>

        {/* Deterministic Weekly Recap (§10.1) */}
        <WeeklyRecapCard />

        {/* 3 Active Provider Adapters (Inspired by GitHub, LeetCode, HackerRank Design Systems) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. GitHub Card - Heatmap Matrix & Repo Stack */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 flex flex-col justify-between space-y-6 shadow-xl transition-all hover:border-white/20">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-ink font-bold text-base sm:text-lg">
                  <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                    <Github className="h-5 w-5 text-ink" />
                  </div>
                  <div>
                    <span className="block leading-tight">GitHub Activity</span>
                    <span className="text-xs font-mono text-muted flex items-center gap-1.5 mt-0.5">
                      <GitBranch className="h-3 w-3 text-accent" />
                      <span>main · HEAD 2026</span>
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>SUPPORTED_LIVE</span>
                </span>
              </div>

              {/* GitHub 4-Week Activity Matrix */}
              <div className="space-y-2 p-3.5 rounded-xl bg-surface-raised border border-white/[0.06]">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted font-semibold">Activity heatmap (4 weeks)</span>
                  <span className="text-emerald-400 font-bold">{currentUser.github.activeDaysWeek * 4 + 3} commits</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 pt-1">
                  {Array.from({ length: 28 }).map((_, i) => {
                    const level = (i + 1) % 7 < currentUser.github.activeDaysWeek ? ((i % 4) + 1) : 0;
                    return (
                      <div
                        key={i}
                        title={`Day ${i + 1}: ${level > 0 ? `${level * 2} commits` : "No commits"}`}
                        className={`h-4 rounded-[3px] transition-colors ${
                          level === 0
                            ? "bg-white/[0.04] border border-white/[0.04]"
                            : level === 1
                            ? "bg-emerald-950/80 border border-emerald-900/60"
                            : level === 2
                            ? "bg-emerald-800 border border-emerald-700/60"
                            : level === 3
                            ? "bg-emerald-600 border border-emerald-500/60"
                            : "bg-emerald-400 border border-emerald-300"
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-xs text-muted pt-1">
                  <span>Less</span>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-white/[0.04]" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-950/80" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-800" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-600" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400" />
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Stack & Author Audit Row */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-muted">Language Footprint</span>
                  <span className="text-ink font-semibold">TypeScript 68% • Python 32%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden flex bg-white/5 border border-white/5">
                  <div className="bg-[#3178C6] h-full" style={{ width: "68%" }} title="TypeScript" />
                  <div className="bg-[#3572A5] h-full" style={{ width: "32%" }} title="Python" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted">Tracked Repositories:</span>
                  <span className="text-ink font-bold">{currentUser.github.reposTracked || 4} Course Repos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Author Attribution:</span>
                  <span className="text-emerald-400 font-semibold">100% Roster Email Match</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-muted">@{currentUser.github.username || "iam-kathir"}</span>
              <span className="text-accent font-bold flex items-center gap-1">
                <GitCommit className="h-3.5 w-3.5" />
                <span>Audited UTC</span>
              </span>
            </div>
          </div>

          {/* 2. LeetCode Card - Problem Tiers, Donut Stats & Boundary Deltas */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 flex flex-col justify-between space-y-6 shadow-xl transition-all hover:border-white/20">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-ink font-bold text-base sm:text-lg">
                  <div className="p-2 rounded-xl bg-provider-leetcode-brand/10 border border-provider-leetcode-brand/20">
                    <Code2 className="h-5 w-5 text-provider-leetcode-brand" />
                  </div>
                  <div>
                    <span className="block leading-tight">LeetCode Telemetry</span>
                    <span className="text-xs font-mono text-muted flex items-center gap-1 mt-0.5">
                      <Flame className="h-3 w-3 text-provider-leetcode-brand" />
                      <span>14-Day Problem Streak</span>
                    </span>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>HMAC_VERIFIED</span>
                </span>
              </div>

              {/* Cumulative Solved Metric */}
              <div>
                <span className="text-xs text-muted font-medium block">Cumulative solved</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-ink mt-0.5 flex items-baseline gap-2">
                  <span>{currentUser.leetcode.totalSolved}</span>
                  <span className="text-sm font-medium text-muted">/ 3,200 total</span>
                </div>
              </div>

              {/* Difficulty Breakdown Bars (LeetCode Canonical Colors) */}
              <div className="space-y-3 font-mono">
                {/* Easy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400 font-semibold">Easy</span>
                    <span className="text-muted font-medium">{currentUser.leetcode.easyCount} / 800</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${Math.min(100, (currentUser.leetcode.easyCount / 120) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Medium */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400 font-semibold">Medium</span>
                    <span className="text-muted font-medium">{currentUser.leetcode.mediumCount} / 1,600</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${Math.min(100, (currentUser.leetcode.mediumCount / 100) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Hard */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-rose-400 font-semibold">Hard</span>
                    <span className="text-muted font-medium">{currentUser.leetcode.hardCount} / 800</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-rose-400 rounded-full"
                      style={{ width: `${Math.min(100, (currentUser.leetcode.hardCount / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Sunday 23:59:59 IST Pre-Boundary Delta Notice */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] text-xs font-mono space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted">Observation Window:</span>
                  <span className="text-emerald-400 font-semibold">Sunday 23:59:59 IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Weekly Delta:</span>
                  <span className="text-accent font-bold">
                    {currentUser.leetcode.weeklyDelta ? `+${currentUser.leetcode.weeklyDelta} Solved` : "Baseline Active"}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-muted">@{currentUser.leetcode.username || "neal_wu"}</span>
              <span className="text-accent font-bold">Boundary Closed</span>
            </div>
          </div>

          {/* 3. HackerRank Card - Domain Badges & Verifiable Certificates */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 flex flex-col justify-between space-y-6 shadow-xl transition-all hover:border-white/20">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-ink font-bold text-base sm:text-lg">
                  <div className="p-2 rounded-xl bg-provider-hackerrank/10 border border-provider-hackerrank/20">
                    <Award className="h-5 w-5 text-provider-hackerrank" />
                  </div>
                  <div>
                    <span className="block leading-tight">HackerRank Badges</span>
                    <span className="text-xs font-mono text-muted mt-0.5">Domain Certifications</span>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  DISPLAY_ONLY
                </span>
              </div>

              {/* Domain Badges Display */}
              <div className="space-y-3 font-mono">
                {/* Python Badge */}
                <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-400 text-xs">
                      Py
                    </div>
                    <div>
                      <span className="text-sm font-bold text-ink block leading-none">Python Domain</span>
                      <span className="text-xs text-muted">Gold Star Standard</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-amber-400 flex items-center gap-0.5">
                      {Array.from({ length: currentUser.hackerrank.pythonStars || 5 }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </span>                      <span className="text-xs text-muted-soft block">{currentUser.hackerrank.pythonStars || 5} Stars</span>
                  </div>
                </div>

                {/* Problem Solving Badge */}
                <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      PS
                    </div>
                    <div>
                      <span className="text-sm font-bold text-ink block leading-none">Problem Solving</span>
                      <span className="text-xs text-muted">Data Structures &amp; Algos</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-emerald-400 flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < (currentUser.hackerrank.problemSolvingStars || 4) ? "fill-current" : "opacity-30"
                          }`}
                        />
                      ))}
                    </span>                      <span className="text-xs text-muted-soft block">{currentUser.hackerrank.problemSolvingStars || 4} Stars</span>
                  </div>
                </div>
              </div>

              {/* Verifiable Cryptographic Evidence Notice (§5.6) */}
              <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                    <span>Evidence Digest:</span>
                  </span>
                  <span className="text-ink font-semibold">hr-proof-8f12a...</span>
                </div>
                <p className="text-xs text-muted-soft leading-relaxed">
                  Section 5.6 Rule: Cumulative badges are verified evidence but excluded from weekly competition deltas.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-muted">@{currentUser.hackerrank.username || "alice"}</span>
              <span className="text-emerald-400 font-bold">Verified</span>
            </div>
          </div>
        </div>


        {/* Weekly Developer Recap (AI / Deterministic Synthesis) */}
        <div className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-accent" />
              <h3 className="text-lg font-bold text-ink tracking-tight">
                Weekly Developer Recap (Week 42)
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-surface-raised text-muted border border-white/[0.06]">
                Non-Judgmental Synthesis
              </span>
            </div>

            <div className="flex items-center gap-1 bg-canvas p-1 rounded-lg border border-white/10 text-xs font-mono">
              <button
                onClick={() => setRecapMode("ai")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recapMode === "ai" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                }`}
              >
                AI Explanation
              </button>
              <button
                onClick={() => setRecapMode("deterministic")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recapMode === "deterministic" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                }`}
              >
                Metrics Breakdown
              </button>
            </div>
          </div>

          {recapMode === "ai" ? (
            <div className="p-4 rounded-xl bg-canvas border border-white/[0.06] text-sm text-ink-secondary leading-relaxed font-sans">
              &ldquo;Aarav, you maintained solid rhythm this week with <strong>6 active days observed on GitHub</strong> and an <strong>85.7% consistency rate</strong> across your semester repositories (94.2% data retrieval coverage). On LeetCode, 12 verified problems were closed before Sunday 23:59 IST. <em>Suggested focus for next week:</em> tackle two Medium Dynamic Programming problems to sustain your pattern.&rdquo;
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-canvas border border-white/[0.06] font-mono text-xs text-ink-secondary space-y-1.5">
              <div>• GitHub Active Days: 6 / 7 Days (Provider UTC) | Coverage: 94.2%</div>
              <div>• LeetCode Problem Delta: +12 Solved (Pre-close Sun 23:45 IST: 172 &rarr; 184)</div>
              <div>• HackerRank: Excluded from delta attribution (Cumulative Display Only)</div>
              <div>• Next Week Calculation Period: Monday 00:00:00 to Sunday 23:59:59 IST</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-canvas py-6 text-xs text-muted-soft font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>TWM 3.0 Platform • Personal Student Dashboard</div>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="text-accent hover:underline flex items-center gap-1">
              <span>View Class Leaderboards</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
