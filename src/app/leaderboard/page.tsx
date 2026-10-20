"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Github, 
  Code2, 
  Award, 
  Info, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  Clock,
  ChevronDown,
  ExternalLink,
  CheckCircle2,
  Users,
  FileDown
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";

interface LeaderboardEntry {
  rank: number;
  name: string;
  handle: string;
  value: string;
  numericVal: number;
  coverage: string;
  coveragePass: boolean;
  freshness: string;
  status: "Finalized" | "Provisional";
  isCurrentUser?: boolean;
}

export default function LeaderboardPage() {
  const { exportLeaderboardCSV, openDisputeModal } = useApp();
  const [platform, setPlatform] = useState<"github" | "leetcode">("github");
  const [period, setPeriod] = useState<"current" | "past">("current");
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);

  // 70% threshold calculation
  const totalRoster = 60;
  const participatingCount = 42;
  const participationPercentage = Math.round((participatingCount / totalRoster) * 100);
  const isRepresentative = participationPercentage >= 70; // 70%

  // Sample deterministic data with 1, 2, 2, 4 competition ties (§9.6)
  const githubEntries: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "Rohan Varma",
      handle: "@rohan-code",
      value: "7 / 7 Days",
      numericVal: 7,
      coverage: "96.5%",
      coveragePass: true,
      freshness: "18m ago",
      status: "Finalized",
    },
    {
      rank: 2,
      name: "Aarav Sharma",
      handle: "@aarav-dev",
      value: "6 / 7 Days",
      numericVal: 6,
      coverage: "94.2%",
      coveragePass: true,
      freshness: "12m ago",
      status: "Finalized",
      isCurrentUser: true,
    },
    {
      rank: 2,
      name: "Priya Nair",
      handle: "@priya-n",
      value: "6 / 7 Days",
      numericVal: 6,
      coverage: "92.8%",
      coveragePass: true,
      freshness: "24m ago",
      status: "Finalized",
    },
    {
      rank: 4,
      name: "Aditya Kumar",
      handle: "@aditya-k",
      value: "5 / 7 Days",
      numericVal: 5,
      coverage: "91.0%",
      coveragePass: true,
      freshness: "35m ago",
      status: "Finalized",
    },
    {
      rank: 5,
      name: "Sneha Patel",
      handle: "@sneha-p",
      value: "4 / 7 Days",
      numericVal: 4,
      coverage: "88.4%",
      coveragePass: false,
      freshness: "1h ago",
      status: "Provisional",
    },
  ];

  const leetcodeEntries: LeaderboardEntry[] = [
    {
      rank: 1,
      name: "Priya Nair",
      handle: "@priya-n",
      value: "+16 Solved",
      numericVal: 16,
      coverage: "Pre-boundary check",
      coveragePass: true,
      freshness: "Sun 23:45",
      status: "Finalized",
    },
    {
      rank: 2,
      name: "Aarav Sharma",
      handle: "@aarav-dev",
      value: "+12 Solved",
      numericVal: 12,
      coverage: "Pre-boundary check",
      coveragePass: true,
      freshness: "Sun 23:45",
      status: "Finalized",
      isCurrentUser: true,
    },
    {
      rank: 3,
      name: "Rohan Varma",
      handle: "@rohan-code",
      value: "+10 Solved",
      numericVal: 10,
      coverage: "Pre-boundary check",
      coveragePass: true,
      freshness: "Sun 23:45",
      status: "Finalized",
    },
    {
      rank: 4,
      name: "Aditya Kumar",
      handle: "@aditya-k",
      value: "+8 Solved",
      numericVal: 8,
      coverage: "Pre-boundary check",
      coveragePass: true,
      freshness: "Sun 23:45",
      status: "Finalized",
    },
  ];

  const entries = platform === "github" ? githubEntries : leetcodeEntries;

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-accent selection:text-canvas">
      <AppHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & 70% Threshold Banner (§3.3) */}
        <div className="rounded-2xl border border-white/[0.08] bg-surface p-7 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Trophy className="h-6 w-6 text-accent" />
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {isRepresentative ? "CSE 2026 Class Leaderboard" : "Participating Members Leaderboard"}
                </h1>
              </div>
              <p className="text-sm text-muted font-mono">
                Class: B.Tech CSE 2026 • Period: Week 42 (Mon 00:00 to Sun 23:59:59 IST)
              </p>
            </div>

            {/* 70% Participation Ratio Badge */}
            <div className="flex items-center gap-3.5 p-3.5 px-4 rounded-xl bg-surface-raised border border-white/[0.08] self-start sm:self-auto font-mono text-sm shadow-sm">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <span className="text-muted-soft block text-xs uppercase tracking-wider">PARTICIPATION RATIO</span>
                <span className="text-white font-bold">{participatingCount} / {totalRoster} students ({participationPercentage}%)</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Representative (&ge;70%)
              </span>
            </div>
          </div>

          {/* Platform Tab Switchers & Period Filter */}
          <div className="pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Leaderboard platform"
              className="inline-flex p-1.5 rounded-xl bg-canvas border border-white/10 text-sm font-mono"
            >
              <button
                type="button"
                aria-pressed={platform === "github"}
                onClick={() => setPlatform("github")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                  platform === "github" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                }`}
              >
                <Github className="h-4 w-4" />
                <span>GitHub (Active Days)</span>
              </button>
              <button
                type="button"
                aria-pressed={platform === "leetcode"}
                onClick={() => setPlatform("leetcode")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                  platform === "leetcode" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                }`}
              >
                <Code2 className="h-4 w-4" />
                <span>LeetCode (Solved Delta)</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm font-mono">
              <button
                onClick={exportLeaderboardCSV}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 transition-colors font-semibold"
                title="Export current standings as CSV"
              >
                <FileDown className="h-4 w-4 text-emerald-400" />
                <span>Export Standings (CSV)</span>
              </button>

              <button
                type="button"
                aria-expanded={showCalculationInfo}
                onClick={() => setShowCalculationInfo(!showCalculationInfo)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-surface-raised text-sm font-mono text-ink-secondary hover:bg-surface transition-colors font-semibold"
              >
                <Info className="h-4 w-4 text-accent" />
                <span>Rules</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Rule Explanation Modal / Drawer */}
        {showCalculationInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-2xl border border-amber-500/20 bg-surface-raised text-sm font-mono space-y-2.5 text-ink-secondary shadow-md"
          >
            <div className="flex items-center justify-between text-white font-bold">
              <span className="flex items-center gap-2 text-accent text-base">
                <Info className="h-5 w-5" />
                Leaderboard Calculation Rules
              </span>
              <button
                type="button"
                onClick={() => setShowCalculationInfo(false)}
                className="text-muted hover:text-white text-sm"
              >
                Close &times;
              </button>
            </div>
            <p>
              • <strong>Deterministic Ties (§9.6):</strong> Equal metric values share the same rank (e.g. 1, 2, 2, 4). Secondary sort is alphabetical without changing rank.
            </p>
            <p>
              • <strong>Boundary Rule (§9.1, §9.7):</strong> Cumulative deltas are computed from observations taken at or before Sunday 23:59:59 IST. Late observations are never rewound.
            </p>
            <p>
              • <strong>Coverage Threshold (§7.4):</strong> GitHub active days require at least 90% API date-level coverage to receive a &ldquo;Finalized&rdquo; standing.
            </p>
          </motion.div>
        )}

        {/* Deterministic Leaderboard Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-surface overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-sm">
              <thead className="bg-surface-raised border-b border-white/[0.08] text-muted uppercase tracking-wider text-xs">
                <tr>
                  <th scope="col" className="py-4 px-6">Rank</th>
                  <th scope="col" className="py-4 px-6">Participant</th>
                  <th scope="col" className="py-4 px-6">
                    {platform === "github" ? "Observed Active Days" : "Weekly Solved Delta"}
                  </th>
                  <th scope="col" className="py-4 px-6">Retrieval Coverage</th>
                  <th scope="col" className="py-4 px-6">Last Freshness</th>
                  <th scope="col" className="py-4 px-6 text-right">Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {entries.map((item, idx) => (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      item.isCurrentUser ? "bg-surface-raised border-l-4 border-accent" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-4 px-6 font-bold text-base">
                      <div className="flex items-center gap-2">
                        {item.rank === 1 ? (
                          <span className="h-7 w-7 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-sm font-bold">
                            1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="h-7 w-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center text-sm font-bold">
                            2
                          </span>
                        ) : (
                          <span className="text-muted pl-2 text-sm">{item.rank}</span>
                        )}
                      </div>
                    </td>

                    {/* Participant */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-surface-raised border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                          {item.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-sans font-semibold text-white text-base flex items-center gap-2">
                            <span>{item.name}</span>
                            {item.isCurrentUser && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-accent text-canvas font-bold">
                                YOU
                              </span>
                            )}
                          </div>
                          <span className="text-muted-soft text-xs font-mono">{item.handle}</span>
                        </div>
                      </div>
                    </td>

                    {/* Metric Value */}
                    <td className="py-4 px-6 font-bold text-white text-base">
                      {item.value}
                    </td>

                    {/* Retrieval Coverage */}
                    <td className="py-4 px-6">
                      <span className={item.coveragePass ? "text-emerald-400 font-semibold" : "text-amber-400"}>
                        {item.coverage}
                      </span>
                    </td>

                    {/* Last Freshness */}
                    <td className="py-4 px-6 text-muted">
                      {item.freshness}
                    </td>

                    {/* Standing Badge & Dispute Action */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-medium border ${
                            item.status === "Finalized"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}
                        >
                          {item.status}
                        </span>

                        {item.isCurrentUser && (
                          <button
                            onClick={() => openDisputeModal(platform === "github" ? "github_active_days" : "leetcode_delta")}
                            className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 font-semibold transition-colors"
                            title="Dispute calculation under Rule §9.7"
                          >
                            Dispute
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-canvas py-6 text-xs text-muted-soft font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>TWM 3.0 Platform • Deterministic Ranks &amp; Roster Denominator</div>
          <div className="text-muted">
            Rule §9.6: Competition Ranking (1, 2, 2, 4 ties)
          </div>
        </div>
      </footer>
    </div>
  );
}
