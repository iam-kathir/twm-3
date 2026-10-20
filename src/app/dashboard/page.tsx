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
    <div className="min-h-screen bg-[#090A0E] text-[#F5F6F8] flex flex-col selection:bg-[#F59E0B] selection:text-[#090A0E]">
      <AppHeader />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome & Metadata Banner */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111319] p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F6F8] tracking-tight">
                {currentUser.name}
              </h1>
              <span className="text-xs font-mono text-[#8D94A5]">@{currentUser.handle}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Leaderboard Opted-In
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20">
                {currentUser.activeTrack}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#8D94A5] font-mono">
              Class: {currentUser.classSection} • Register No: {currentUser.rollNo}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-10 text-xs font-mono">
            <button
              onClick={() => openDisputeModal()}
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors text-xs font-mono flex items-center gap-1.5"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              <span>Lodge Dispute</span>
            </button>

            <button
              onClick={exportTelemetryJSON}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-colors text-xs font-mono flex items-center gap-1.5"
            >
              <span>Export Ledger</span>
            </button>

            <div className="p-2.5 px-3 rounded-xl bg-[#181B23] border border-white/[0.06] text-right">
              <span className="text-[#636A7E] block text-[9px]">LAST SYNC</span>
              <span className="text-emerald-400 font-semibold">{lastSyncTime}</span>
            </div>
          </div>
        </div>

        {/* 4 Quick Telemetry KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111319] space-y-1">
            <span className="text-[11px] font-mono text-[#8D94A5]">WEEKLY ACTIVE DAYS</span>
            <div className="text-2xl font-bold font-mono text-[#F5F6F8]">6 / 7 Days</div>
            <span className="text-[10px] font-mono text-emerald-400 block">Qualifying consistency</span>
          </div>

          <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111319] space-y-1">
            <span className="text-[11px] font-mono text-[#8D94A5]">CONSISTENCY RATE</span>
            <div className="text-2xl font-bold font-mono text-[#F59E0B]">85.7%</div>
            <span className="text-[10px] font-mono text-[#636A7E] block">Rule §9.4 enforced</span>
          </div>

          <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111319] space-y-1">
            <span className="text-[11px] font-mono text-[#8D94A5]">RETRIEVAL COVERAGE</span>
            <div className="text-2xl font-bold font-mono text-emerald-400">94.2%</div>
            <span className="text-[10px] font-mono text-[#636A7E] block">Passes &gt;90% threshold</span>
          </div>

          <div className="p-5 rounded-xl border border-white/[0.08] bg-[#111319] space-y-1">
            <span className="text-[11px] font-mono text-[#8D94A5]">LEETCODE DELTA</span>
            <div className="text-2xl font-bold font-mono text-[#F59E0B]">+12 Solved</div>
            <span className="text-[10px] font-mono text-[#636A7E] block">Boundary rule compliant</span>
          </div>
        </div>

        {/* 3 Active Provider Adapters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1. GitHub Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111319] p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#F5F6F8] font-bold text-sm">
                  <Github className="h-4 w-4" />
                  <span>GitHub Activity</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SUPPORTED_LIVE
                </span>
              </div>

              {/* Day Heatmap Row */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-mono text-[#8D94A5] block">This Week (Provider UTC):</span>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => {
                    const active = i !== 4;
                    return (
                      <div key={i}>
                        <div
                          className={`h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold ${
                            active
                              ? "bg-emerald-400 text-[#090A0E]"
                              : "bg-[#181B23] text-[#636A7E] border border-white/[0.04]"
                          }`}
                        >
                          {active ? "1" : "0"}
                        </div>
                        <span className="text-[10px] font-mono text-[#636A7E] mt-1 block">{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#181B23] border border-white/[0.05] text-xs font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#8D94A5]">Tracked Repositories:</span>
                  <span className="text-[#F5F6F8] font-bold">4 Course Repos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#8D94A5]">Date Attribution:</span>
                  <span className="text-[#F59E0B]">Provider Native UTC</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8D94A5]">Freshness: Current</span>
              <span className="text-emerald-400 font-bold">Audited</span>
            </div>
          </div>

          {/* 2. LeetCode Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111319] p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#F5F6F8] font-bold text-sm">
                  <Code2 className="h-4 w-4 text-[#FFA116]" />
                  <span>LeetCode Telemetry</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-[#F59E0B] border border-amber-500/20">
                  HMAC_VERIFIED
                </span>
              </div>

              <div className="mb-4">
                <span className="text-xs font-mono text-[#8D94A5]">Cumulative Solved:</span>
                <div className="text-3xl font-extrabold font-mono text-[#F5F6F8] mt-1">184 Problems</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono mb-4">
                <div className="p-2.5 rounded-xl bg-[#181B23] border border-emerald-500/20">
                  <span className="text-emerald-400 font-bold block">92</span>
                  <span className="text-[10px] text-[#8D94A5]">Easy</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#181B23] border border-amber-500/20">
                  <span className="text-amber-400 font-bold block">78</span>
                  <span className="text-[10px] text-[#8D94A5]">Medium</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#181B23] border border-rose-500/20">
                  <span className="text-rose-400 font-bold block">14</span>
                  <span className="text-[10px] text-[#8D94A5]">Hard</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#181B23] border border-white/[0.05] text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-[#8D94A5]">Observation Rule:</span>
                  <span className="text-emerald-400">Pre-close (Sun 23:45 IST)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8D94A5]">Weekly Delta:</span>
              <span className="text-[#F59E0B] font-bold">+12 Solved</span>
            </div>
          </div>

          {/* 3. HackerRank Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#111319] p-6 flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#F5F6F8] font-bold text-sm">
                  <Award className="h-4 w-4 text-[#00EA64]" />
                  <span>HackerRank Badges</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  LIMITED
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#181B23] border border-white/[0.06]">
                  <span className="text-xs font-mono text-[#F5F6F8]">Python Domain</span>
                  <span className="text-xs font-mono font-bold text-amber-400">5 Stars ★★★★★</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#181B23] border border-white/[0.06]">
                  <span className="text-xs font-mono text-[#F5F6F8]">Problem Solving</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">4 Stars ★★★★☆</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#181B23] border border-amber-500/20 text-xs font-mono text-amber-300 leading-snug">
                Cumulative display only. Excluded from period delta leaderboard until Phase 0 boundary evidence is documented.
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8D94A5]">Period Ranking:</span>
              <span className="text-[#F59E0B] font-bold">Excluded</span>
            </div>
          </div>
        </div>

        {/* Weekly Developer Recap (AI / Deterministic Synthesis) */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111319] p-6 sm:p-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[#F59E0B]" />
              <h3 className="text-lg font-bold text-[#F5F6F8] tracking-tight">
                Weekly Developer Recap (Week 42)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#181B23] text-[#8D94A5] border border-white/[0.06]">
                Non-Judgmental Synthesis
              </span>
            </div>

            <div className="flex items-center gap-1 bg-[#090A0E] p-1 rounded-lg border border-white/10 text-xs font-mono">
              <button
                onClick={() => setRecapMode("ai")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recapMode === "ai" ? "bg-[#F59E0B] text-[#090A0E] font-bold" : "text-[#8D94A5] hover:text-white"
                }`}
              >
                AI Explanation
              </button>
              <button
                onClick={() => setRecapMode("deterministic")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  recapMode === "deterministic" ? "bg-[#F59E0B] text-[#090A0E] font-bold" : "text-[#8D94A5] hover:text-white"
                }`}
              >
                Metrics Breakdown
              </button>
            </div>
          </div>

          {recapMode === "ai" ? (
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] text-sm text-[#C8CDD6] leading-relaxed font-sans">
              &ldquo;Aarav, you maintained solid rhythm this week with <strong>6 active days observed on GitHub</strong> and an <strong>85.7% consistency rate</strong> across your semester repositories (94.2% data retrieval coverage). On LeetCode, 12 verified problems were closed before Sunday 23:59 IST. <em>Suggested focus for next week:</em> tackle two Medium Dynamic Programming problems to sustain your pattern.&rdquo;
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#090A0E] border border-white/[0.06] font-mono text-xs text-[#C8CDD6] space-y-1.5">
              <div>• GitHub Active Days: 6 / 7 Days (Provider UTC) | Coverage: 94.2%</div>
              <div>• LeetCode Problem Delta: +12 Solved (Pre-close Sun 23:45 IST: 172 &rarr; 184)</div>
              <div>• HackerRank: Excluded from delta attribution (Cumulative Display Only)</div>
              <div>• Next Week Calculation Period: Monday 00:00:00 to Sunday 23:59:59 IST</div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090A0E] py-6 text-xs text-[#636A7E] font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>TWM 3.0 Platform • Personal Student Dashboard</div>
          <div className="flex items-center gap-4">
            <Link href="/leaderboard" className="text-[#F59E0B] hover:underline flex items-center gap-1">
              <span>View Class Leaderboards</span>
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
