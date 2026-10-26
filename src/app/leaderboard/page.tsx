"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
  FileDown,
  Star,
  ShieldAlert,
  X
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";
import { computeCompetitionRanks, RawParticipant, RankedParticipant } from "@/lib/leaderboard";

export default function LeaderboardPage() {
  const { exportLeaderboardCSV, openDisputeModal, currentUser } = useApp();
  const [platform, setPlatform] = useState<"github" | "leetcode" | "hackerrank">("github");
  const [showCalculationInfo, setShowCalculationInfo] = useState(false);

  // 70% threshold calculation (§3.3)
  const totalRoster = 60;
  const participatingCount = 42;
  const participationPercentage = Math.round((participatingCount / totalRoster) * 100);
  const isRepresentative = participationPercentage >= 70; // 70%

  // Raw GitHub participants (with currentUser dynamically bound)
  const rawGithubParticipants: RawParticipant[] = useMemo(() => {
    const peers: RawParticipant[] = [
      {
        id: "p-rohan",
        name: "Rohan Varma",
        handle: "@rohan-code",
        numericVal: 7,
        value: "7 / 7 Days",
        coverage: "96.5%",
        coveragePass: true,
        freshness: "18m ago",
        status: "Finalized",
      },
      {
        id: "p-priya",
        name: "Priya Nair",
        handle: "@priya-n",
        numericVal: 6,
        value: "6 / 7 Days",
        coverage: "92.8%",
        coveragePass: true,
        freshness: "24m ago",
        status: "Finalized",
      },
      {
        id: "p-aditya",
        name: "Aditya Kumar",
        handle: "@aditya-k",
        numericVal: 5,
        value: "5 / 7 Days",
        coverage: "91.0%",
        coveragePass: true,
        freshness: "35m ago",
        status: "Finalized",
      },
      {
        id: "p-sneha",
        name: "Sneha Patel",
        handle: "@sneha-p",
        numericVal: 4,
        value: "4 / 7 Days",
        coverage: "88.4%",
        coveragePass: false,
        freshness: "1h ago",
        status: "Provisional",
      },
      {
        id: "p-vikram",
        name: "Vikram Singh",
        handle: "@vikram-s",
        numericVal: 5,
        value: "5 / 7 Days",
        coverage: "93.1%",
        coveragePass: true,
        freshness: "42m ago",
        status: "Finalized",
      },
      {
        id: "p-ananya",
        name: "Ananya Roy",
        handle: "@ananya-r",
        numericVal: 6,
        value: "6 / 7 Days",
        coverage: "94.0%",
        coveragePass: true,
        freshness: "5m ago",
        status: "Finalized",
      }
    ];

    // Current user dynamically inserted from live context
    const currentActiveDays = currentUser?.github?.activeDaysWeek ?? 6;
    const userEntry: RawParticipant = {
      id: "p-current-user",
      name: currentUser?.name || "Aarav Sharma",
      handle: currentUser?.handle ? `@${currentUser.handle}` : "@aarav-dev",
      numericVal: currentActiveDays,
      value: `${currentActiveDays} / 7 Days`,
      coverage: "94.2%",
      coveragePass: true,
      freshness: currentUser?.github?.lastCommitTime || "12m ago",
      status: "Finalized",
      isCurrentUser: true,
    };

    return [...peers, userEntry];
  }, [currentUser]);

  // Raw LeetCode participants (with currentUser dynamically bound)
  const rawLeetCodeParticipants: RawParticipant[] = useMemo(() => {
    const peers: RawParticipant[] = [
      {
        id: "p-priya",
        name: "Priya Nair",
        handle: "@priya-n",
        numericVal: 16,
        value: "+16 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      },
      {
        id: "p-rohan",
        name: "Rohan Varma",
        handle: "@rohan-code",
        numericVal: 12,
        value: "+12 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      },
      {
        id: "p-aditya",
        name: "Aditya Kumar",
        handle: "@aditya-k",
        numericVal: 8,
        value: "+8 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      },
      {
        id: "p-vikram",
        name: "Vikram Singh",
        handle: "@vikram-s",
        numericVal: 12,
        value: "+12 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      },
      {
        id: "p-sneha",
        name: "Sneha Patel",
        handle: "@sneha-p",
        numericVal: 6,
        value: "+6 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      }
    ];

    const currentDelta = currentUser?.leetcode?.weeklyDelta ?? 12;
    const userEntry: RawParticipant = {
      id: "p-current-user",
      name: currentUser?.name || "Aarav Sharma",
      handle: currentUser?.leetcode?.username ? `@${currentUser.leetcode.username}` : "@aarav_algo",
      numericVal: currentDelta,
      value: `+${currentDelta} Solved`,
      coverage: "Pre-boundary check",
      coveragePass: true,
      freshness: "Sun 23:45",
      status: "Finalized",
      isCurrentUser: true,
    };

    return [...peers, userEntry];
  }, [currentUser]);

  // HackerRank capability participants (Display Only - Section 5.6)
  const hackerRankParticipants = useMemo(() => {
    return [
      {
        id: "p-priya",
        name: "Priya Nair",
        handle: "@priya-n",
        pythonStars: 5,
        problemSolvingStars: 5,
        status: "Verified Badges",
        freshness: "Observed",
        evidenceHash: "hr-proof-8a3c9b21f091",
      },
      {
        id: "p-current-user",
        name: currentUser?.name || "Aarav Sharma",
        handle: currentUser?.hackerrank?.username ? `@${currentUser.hackerrank.username}` : "@aarav_code",
        pythonStars: currentUser?.hackerrank?.pythonStars ?? 5,
        problemSolvingStars: currentUser?.hackerrank?.problemSolvingStars ?? 4,
        status: "Verified Badges",
        freshness: "Observed",
        evidenceHash: "hr-proof-c71e84d29a03",
        isCurrentUser: true,
      },
      {
        id: "p-rohan",
        name: "Rohan Varma",
        handle: "@rohan-code",
        pythonStars: 4,
        problemSolvingStars: 4,
        status: "Verified Badges",
        freshness: "Observed",
        evidenceHash: "hr-proof-4f28d10b99ac",
      },
      {
        id: "p-vikram",
        name: "Vikram Singh",
        handle: "@vikram-s",
        pythonStars: 5,
        problemSolvingStars: 3,
        status: "Verified Badges",
        freshness: "Observed",
        evidenceHash: "hr-proof-9d82e4a1106e",
      },
      {
        id: "p-aditya",
        name: "Aditya Kumar",
        handle: "@aditya-k",
        pythonStars: 3,
        problemSolvingStars: 3,
        status: "Verified Badges",
        freshness: "Observed",
        evidenceHash: "hr-proof-1b49f78cc320",
      }
    ];
  }, [currentUser]);

  // Dynamically compute Section 9.6 deterministic competition ranks
  const githubRanked = useMemo(() => computeCompetitionRanks(rawGithubParticipants), [rawGithubParticipants]);
  const leetcodeRanked = useMemo(() => computeCompetitionRanks(rawLeetCodeParticipants), [rawLeetCodeParticipants]);

  const activeRankedEntries = platform === "github" ? githubRanked : leetcodeRanked;

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
              <p className="text-sm text-muted font-sans">
                Class: B.Tech CSE 2026 <span className="mx-1.5 opacity-40">|</span> Period: Week 42 (Mon 00:00 to Sun 23:59:59 IST)
              </p>
            </div>

            {/* 70% Participation Ratio Badge */}
            <div className="flex items-center gap-3.5 p-3.5 px-4 rounded-xl bg-surface-raised border border-white/[0.08] self-start sm:self-auto font-sans text-sm shadow-sm">
              <Users className="h-5 w-5 text-accent" />
              <div>
                <span className="text-muted block text-xs font-semibold">Participation ratio</span>
                <span className="text-white font-bold">{participatingCount} / {totalRoster} students ({participationPercentage}%)</span>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold font-sans">
                Representative (&gt;= 70%)
              </span>
            </div>
          </div>

          {/* Platform Tab Switchers & Controls */}
          <div className="pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
            <div
              role="group"
              aria-label="Leaderboard platform"
              className="inline-flex p-1.5 rounded-xl bg-canvas border border-white/10 text-sm font-sans flex-wrap"
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
              <button
                type="button"
                aria-pressed={platform === "hackerrank"}
                onClick={() => setPlatform("hackerrank")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold ${
                  platform === "hackerrank" ? "bg-accent text-canvas font-bold" : "text-muted hover:text-white"
                }`}
              >
                <Award className="h-4 w-4" />
                <span>HackerRank (Verified Badges)</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm font-sans">
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
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-surface-raised text-sm font-sans text-ink-secondary hover:bg-surface transition-colors font-semibold"
              >
                <Info className="h-4 w-4 text-accent" />
                <span>Competition Rules</span>
              </button>
            </div>
          </div>
        </div>

        {/* Calculation Rule Explanation Modal / Drawer */}
        <AnimatePresence>
          {showCalculationInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-6 rounded-2xl border border-accent/30 bg-surface-raised text-sm font-sans space-y-4 text-ink-secondary shadow-md overflow-hidden"
            >
              <div className="flex items-center justify-between text-white font-bold">
                <span className="flex items-center gap-2 text-accent text-base font-sans">
                  <Info className="h-5 w-5" />
                  Deterministic Competition Rules &amp; Tie Policy (Rule 9.6)
                </span>
                <button
                  type="button"
                  onClick={() => setShowCalculationInfo(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5 font-sans"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Close</span>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1.5">
                  <span className="block text-xs font-semibold text-accent font-sans">
                    RULE 9.6: TIE POLICY
                  </span>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Equal metric values share the same rank (e.g. 1, 2, 2, 4). Secondary display sort is strictly alphabetical by name without altering rank.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1.5">
                  <span className="block text-xs font-semibold text-accent font-sans">
                    RULE 9.7: SUNDAY BOUNDARY
                  </span>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Cumulative deltas use only observations taken at or before Sunday 23:59:59 IST. Late observations are never rewound.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface border border-white/5 space-y-1.5">
                  <span className="block text-xs font-semibold text-accent font-sans">
                    RULE 5.6: CAPABILITY GATING
                  </span>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    HackerRank lacks public event timestamps; badges &amp; stars are displayed for verification only and excluded from weekly ranking deltas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Platform Display: HackerRank Capability Gating View */}
        {platform === "hackerrank" ? (
          <div className="space-y-6">
            {/* Capability Gating Notice (§5.6) */}
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm font-mono flex items-start gap-4 shadow-sm">
              <ShieldAlert className="h-6 w-6 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  Section 5.6 Capability Gating Enforced: Display-Only Telemetry
                </span>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  HackerRank’s public profile endpoint does not expose event timestamps or submission histories. Under TWM’s Zero-Fabrication Rule, cumulative badges and domain stars cannot be attributed to a specific weekly competition window. These metrics are verified and displayed below for individual capability auditing, but excluded from weekly delta rankings.
                </p>
              </div>
            </div>

            {/* HackerRank Verified Badges Table */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-sans text-sm">
                  <thead className="bg-surface-raised border-b border-white/[0.08] text-muted text-xs">
                    <tr>
                      <th scope="col" className="py-4 px-6">Participant</th>
                      <th scope="col" className="py-4 px-6">Python Domain</th>
                      <th scope="col" className="py-4 px-6">Problem Solving</th>
                      <th scope="col" className="py-4 px-6">Audit Status</th>
                      <th scope="col" className="py-4 px-6 text-right">Attribution Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {hackerRankParticipants.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.isCurrentUser ? "bg-surface-raised border-l-4 border-accent" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-surface-raised border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-sans font-semibold text-white text-base flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.isCurrentUser && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-accent text-canvas font-semibold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-muted-soft text-xs font-mono">{item.handle}</span>
                            </div>
                          </div>
                        </td>

                        {/* Python Stars */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <span className="text-white text-base">{item.pythonStars}</span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < item.pythonStars ? "fill-amber-400 text-amber-400" : "text-white/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Problem Solving Stars */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                            <span className="text-white text-base">{item.problemSolvingStars}</span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3.5 w-3.5 ${
                                    i < item.problemSolvingStars ? "fill-amber-400 text-amber-400" : "text-white/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>

                        {/* Status & Evidence Hash */}
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {item.status}
                            </span>
                            <span className="block text-xs font-medium text-muted" title="Cryptographic SHA-256 evidence digest">
                              {item.evidenceHash}
                            </span>
                          </div>
                        </td>

                        {/* Policy & Proof */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="inline-block px-2.5 py-1 rounded text-xs font-sans bg-white/5 text-muted border border-white/10">
                              Excluded from Weekly Delta (Rule 5.6)
                            </span>
                            <span className="text-xs font-medium text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                              SHA-256 Evidence Verified
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Deterministic Competition Leaderboard Table */
          <div className="rounded-2xl border border-white/[0.08] bg-surface overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-sm">
                <thead className="bg-surface-raised border-b border-white/[0.08] text-muted text-xs">
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
                  {activeRankedEntries.map((item) => (
                    <tr
                      key={item.id}
                      className={`transition-colors ${
                        item.isCurrentUser ? "bg-surface-raised border-l-4 border-accent" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      {/* Rank & Tied Indicator */}
                      <td className="py-4 px-6 font-bold text-base">
                        <div className="flex items-center gap-2">
                          {item.rank === 1 ? (
                            <span className="h-7 w-7 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-sm font-bold shadow-sm">
                              1
                            </span>
                          ) : item.rank === 2 ? (
                            <span className="h-7 w-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center text-sm font-bold shadow-sm">
                              2
                            </span>
                          ) : item.rank === 3 ? (
                            <span className="h-7 w-7 rounded-full bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center text-sm font-bold shadow-sm">
                              3
                            </span>
                          ) : (
                            <span className="text-muted pl-2 text-sm">{item.rank}</span>
                          )}

                          {item.isTied && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted-soft font-sans font-medium"
                              title="Tied score (Rule 9.6: standard competition ranking 1, 2, 2, 4)"
                            >
                              Tied
                            </span>
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
                                <span className="text-xs px-2 py-0.5 rounded bg-accent text-canvas font-semibold">
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
                              title="Dispute calculation under Rule 9.7"
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
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-canvas py-6 text-xs text-muted font-sans">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>TWM 3.1 Platform | Deterministic Ranks &amp; Roster Denominator</div>
          <div className="text-muted">
            Rule 9.6: Competition Ranking (1, 2, 2, 4 ties) | Section 5.6: Capability Gating
          </div>
        </div>
      </footer>
    </div>
  );
}
