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
  AlertCircle
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
              <span className="text-muted-soft block text-[10px] uppercase font-mono tracking-wider">LAST SYNC</span>
              <span className="text-emerald-400 font-semibold text-sm">{lastSyncTime}</span>
            </div>
          </div>
        </div>

        {/* 4 Quick Telemetry KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-mono text-muted uppercase tracking-wider block font-semibold">WEEKLY ACTIVE DAYS</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-white">{currentUser.github.activeDaysWeek} / 7 Days</div>
            <span className="text-xs font-mono text-emerald-400 block font-medium">Qualifying consistency</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-mono text-muted uppercase tracking-wider block font-semibold">CONSISTENCY RATE</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-accent">{Math.round((currentUser.github.activeDaysWeek / 7) * 100)}%</div>
            <span className="text-xs font-mono text-muted-soft block">Rule §9.4 enforced</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-mono text-muted uppercase tracking-wider block font-semibold">RETRIEVAL COVERAGE</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-emerald-400">94.2%</div>
            <span className="text-xs font-mono text-muted-soft block">Passes &gt;90% threshold</span>
          </div>

          <div className="p-6 rounded-2xl border border-white/[0.08] bg-surface space-y-2 shadow-lg">
            <span className="text-xs sm:text-sm font-mono text-muted uppercase tracking-wider block font-semibold">LEETCODE DELTA</span>
            <div className="text-3xl sm:text-4xl font-bold font-mono text-accent">
              {currentUser.leetcode.weeklyDelta ? `+${currentUser.leetcode.weeklyDelta} Solved` : `${currentUser.leetcode.totalSolved} Solved`}
            </div>
            <span className="text-xs font-mono text-muted-soft block">Boundary rule compliant</span>
          </div>
        </div>

        {/* Deterministic Weekly Recap (§10.1) */}
        <WeeklyRecapCard />

        {/* 3 Active Provider Adapters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. GitHub Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg">
                  <Github className="h-5 w-5" />
                  <span>GitHub Activity</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                  SUPPORTED_LIVE
                </span>
              </div>

              {/* Day Heatmap Row */}
              <div className="space-y-2.5 mb-5">
                <span className="text-xs font-mono text-muted block uppercase tracking-wider">This Week (Provider UTC):</span>
                <div className="grid grid-cols-7 gap-2 text-center">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
                    const active = i < currentUser.github.activeDaysWeek;
                    return (
                      <div key={i}>
                        <div
                          className={`h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold ${
                            active
                              ? "bg-emerald-400 text-canvas shadow-sm"
                              : "bg-surface-raised text-muted-soft border border-white/[0.04]"
                          }`}
                        >
                          {active ? "1" : "0"}
                        </div>
                        <span className="text-xs font-mono text-muted-soft mt-1.5 block">{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] text-sm font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted">Tracked Repositories:</span>
                  <span className="text-white font-bold">{currentUser.github.reposTracked || 4} Course Repos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Date Attribution:</span>
                  <span className="text-accent font-semibold">Provider Native UTC</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm font-mono">
              <span className="text-muted">Account: @{currentUser.github.username || "iam-kathir"}</span>
              <span className="text-emerald-400 font-bold">Audited</span>
            </div>
          </div>

          {/* 2. LeetCode Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg">
                  <Code2 className="h-5 w-5 text-provider-leetcode-brand" />
                  <span>LeetCode Telemetry</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 font-semibold">
                  HMAC_VERIFIED
                </span>
              </div>

              <div className="mb-5">
                <span className="text-xs font-mono text-muted uppercase tracking-wider">Cumulative Solved:</span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white mt-1">{currentUser.leetcode.totalSolved} Problems</div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center text-sm font-mono mb-5">
                <div className="p-3.5 rounded-xl bg-surface-raised border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold text-lg block">{currentUser.leetcode.easyCount}</span>
                  <span className="text-xs text-muted">Easy</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-raised border border-amber-500/20">
                  <span className="text-amber-400 font-bold text-lg block">{currentUser.leetcode.mediumCount}</span>
                  <span className="text-xs text-muted">Medium</span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-raised border border-rose-500/20">
                  <span className="text-rose-400 font-bold text-lg block">{currentUser.leetcode.hardCount}</span>
                  <span className="text-xs text-muted">Hard</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-muted">Observation Rule:</span>
                  <span className="text-emerald-400 font-semibold">Sunday 23:59:59 IST</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm font-mono">
              <span className="text-muted">Account: @{currentUser.leetcode.username || "neal_wu"}</span>
              <span className="text-accent font-bold">
                {currentUser.leetcode.weeklyDelta ? `+${currentUser.leetcode.weeklyDelta} Solved` : "Baseline Active"}
              </span>
            </div>
          </div>

          {/* 3. HackerRank Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5 text-white font-bold text-base sm:text-lg">
                  <Award className="h-5 w-5 text-provider-hackerrank" />
                  <span>HackerRank Badges</span>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                  DISPLAY_ONLY
                </span>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-raised border border-white/[0.06]">
                  <span className="text-sm font-mono text-white">Python Domain</span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    {"★".repeat(currentUser.hackerrank.pythonStars || 5)}{"☆".repeat(Math.max(0, 5 - (currentUser.hackerrank.pythonStars || 5)))}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-surface-raised border border-white/[0.06]">
                  <span className="text-sm font-mono text-white">Problem Solving</span>
                  <span className="text-sm font-mono font-bold text-emerald-400">
                    {"★".repeat(currentUser.hackerrank.problemSolvingStars || 4)}{"☆".repeat(Math.max(0, 5 - (currentUser.hackerrank.problemSolvingStars || 4)))}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] text-xs font-mono text-muted">
                Section 5.6: Excluded from weekly competition deltas to maintain unassailable attribution.
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm font-mono">
              <span className="text-muted">Account: @{currentUser.hackerrank.username || "alice"}</span>
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
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-raised text-muted border border-white/[0.06]">
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
