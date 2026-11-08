"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  Info, 
  ShieldCheck, 
  AlertCircle, 
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle2,
  Users,
  FileDown,
  Star,
  ShieldAlert,
  X,
  ChevronRight,
  TrendingUp,
  Percent
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { LeetCodeIcon as Code2 } from "@/components/ui/LeetCodeIcon";
import { HackerRankIcon as Award } from "@/components/ui/HackerRankIcon";
import { AppHeader } from "@/components/ui/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
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
        id: "p-sneha",
        name: "Sneha Patel",
        handle: "@sneha-p",
        numericVal: 10,
        value: "+10 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      },
      {
        id: "p-vikram",
        name: "Vikram Singh",
        handle: "@vikram-s",
        numericVal: 6,
        value: "+6 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      },
      {
        id: "p-ananya",
        name: "Ananya Roy",
        handle: "@ananya-r",
        numericVal: 12,
        value: "+12 Solved",
        coverage: "Pre-boundary check",
        coveragePass: true,
        freshness: "Sun 23:45",
        status: "Finalized",
      }
    ];

    // Current user dynamically inserted from live context
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
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-brand-primary/30 selection:text-white">
      <AppHeader />

      <PageContainer className="space-y-6 sm:space-y-8">
        {/* 1. STANDARDIZED PAGE HEADER & METADATA */}
        <PageHeader
          badge={
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-mono font-semibold">
              <Trophy className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
              <span>Cohort Tournament · Week 42</span>
              <span className="opacity-40">|</span>
              <span>Sunday 23:59:59 IST Close</span>
            </div>
          }
          title={isRepresentative ? "Representative Class Leaderboard" : "Participating Members Leaderboard"}
          description={
            <span>
              Deterministic competition rankings grounded in verified telemetry. Evaluated under Rule §9.1 Sunday Boundary
              and Rule §9.6 standard tie ranking (<code className="text-white font-mono text-xs">1, 2, 2, 4</code>).
            </span>
          }
        />

        {/* 2. DEDICATED QUORUM PARTICIPATION CARD (§3.3) */}
        <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="h-11 w-11 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center text-brand-secondary shrink-0 shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted">
                    Cohort Quorum Gate (§3.3)
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-md border font-semibold font-mono ${
                      isRepresentative
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {isRepresentative ? "Quorum Satisfied (≥ 70%)" : "Quorum Pending (< 70%)"}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">
                  <span className="tabular-nums font-bold text-base">{participatingCount}</span> of{" "}
                  <span className="tabular-nums font-bold text-base">{totalRoster}</span> enrolled students participating
                  {" "}(<span className="text-brand-secondary font-bold tabular-nums">{participationPercentage}%</span>)
                </div>
              </div>
            </div>

            {/* Quorum Visual Progress Bar */}
            <div className="w-full md:w-64 space-y-1.5 self-center">
              <div className="flex justify-between text-xs font-mono text-muted">
                <span>70% Threshold Target</span>
                <span className="text-white font-semibold">{participationPercentage}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/5 border border-white/10 overflow-hidden relative">
                <div
                  className="h-full bg-brand-gradient rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(participationPercentage, 100)}%` }}
                />
                {/* 70% demarcation line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white/60 z-10"
                  style={{ left: "70%" }}
                  title="70% Class Quorum Line"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. PLATFORM SELECTION TABS & ACTION TOOLBAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          {/* Platform Tab Group (Horizontally Scrollable on Mobile) */}
          <div
            role="tablist"
            aria-label="Platform leaderboard filter"
            className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-border bg-surface/90 shadow-sm overflow-x-auto no-scrollbar w-full sm:w-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={platform === "github"}
              onClick={() => setPlatform("github")}
              className={`relative flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                platform === "github" ? "text-white" : "text-muted hover:text-ink hover:bg-white/[0.04]"
              }`}
            >
              {platform === "github" && (
                <motion.span
                  layoutId="leaderboard-active-tab"
                  className="absolute inset-0 rounded-xl bg-surface-raised border border-white/10 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Github className="relative z-10 h-4 w-4 shrink-0 text-white" />
              <span className="relative z-10">GitHub (Active Days)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={platform === "leetcode"}
              onClick={() => setPlatform("leetcode")}
              className={`relative flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                platform === "leetcode" ? "text-white" : "text-muted hover:text-ink hover:bg-white/[0.04]"
              }`}
            >
              {platform === "leetcode" && (
                <motion.span
                  layoutId="leaderboard-active-tab"
                  className="absolute inset-0 rounded-xl bg-surface-raised border border-white/10 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Code2 className="relative z-10 h-4 w-4 shrink-0 text-provider-leetcode-brand" />
              <span className="relative z-10">LeetCode (Solved Delta)</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={platform === "hackerrank"}
              onClick={() => setPlatform("hackerrank")}
              className={`relative flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                platform === "hackerrank" ? "text-white" : "text-muted hover:text-ink hover:bg-white/[0.04]"
              }`}
            >
              {platform === "hackerrank" && (
                <motion.span
                  layoutId="leaderboard-active-tab"
                  className="absolute inset-0 rounded-xl bg-surface-raised border border-white/10 shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Award className="relative z-10 h-4 w-4 shrink-0 text-provider-hackerrank" />
              <span className="relative z-10">HackerRank (Badges)</span>
            </button>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <button
              onClick={exportLeaderboardCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-raised text-xs sm:text-sm font-semibold text-slate-200 hover:text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              title="Export current standings as verifiable CSV ledger"
            >
              <FileDown className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Export Standings (CSV)</span>
            </button>

            <button
              type="button"
              aria-expanded={showCalculationInfo}
              onClick={() => setShowCalculationInfo(!showCalculationInfo)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-surface-raised text-xs sm:text-sm font-semibold text-ink-secondary hover:text-white transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <Info className="h-4 w-4 text-brand-secondary shrink-0" />
              <span>Competition Rules</span>
            </button>
          </div>
        </div>

        {/* 4. EXPANDABLE COMPETITION RULES DRAWER */}
        <AnimatePresence>
          {showCalculationInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="p-6 rounded-2xl border border-brand-primary/30 bg-surface text-sm font-sans space-y-4 text-ink-secondary shadow-panel overflow-hidden"
            >
              <div className="flex items-center justify-between text-white font-bold">
                <span className="flex items-center gap-2 text-brand-primary text-base font-semibold">
                  <Info className="h-5 w-5" />
                  Deterministic Competition Rules &amp; Tie Policy (Rule §9.6)
                </span>
                <button
                  type="button"
                  onClick={() => setShowCalculationInfo(false)}
                  className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Close</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="p-4 rounded-xl bg-surface-raised border border-white/5 space-y-1.5">
                  <span className="block text-xs font-mono font-semibold text-brand-primary uppercase">
                    Rule §9.6: Standard Ties
                  </span>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Equal metric values share the same rank (e.g. 1, 2, 2, 4). Secondary display sorting is strictly alphabetical by student handle without altering shared ranks.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-raised border border-white/5 space-y-1.5">
                  <span className="block text-xs font-mono font-semibold text-brand-primary uppercase">
                    Rule §9.7: Sunday Boundary
                  </span>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    Weekly competition windows close strictly at Sunday 23:59:59 IST. Late observations are never retroactively attributed.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-surface-raised border border-white/5 space-y-1.5">
                  <span className="block text-xs font-mono font-semibold text-brand-primary uppercase">
                    Rule §5.6: Capability Gating
                  </span>
                  <p className="text-xs text-muted leading-relaxed font-sans">
                    HackerRank lacks public event timestamps; badges &amp; stars are displayed for verification only and excluded from weekly ranking deltas.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. TABLE / CARDS CONTENT AREA */}
        {platform === "hackerrank" ? (
          <div className="space-y-6">
            {/* Section 5.6 Capability Gating Notice */}
            <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm font-sans flex items-start gap-4 shadow-sm">
              <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block text-sm">
                  Section 5.6 Capability Gating Enforced: Display-Only Telemetry
                </span>
                <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                  HackerRank’s public profile endpoint does not expose event timestamps or submission histories. Under TWM’s Zero-Fabrication Rule, cumulative badges and domain stars cannot be attributed to a specific weekly competition window. These metrics are verified and displayed below for individual capability auditing, but excluded from weekly delta rankings.
                </p>
              </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-2xl border border-border bg-surface overflow-hidden shadow-panel">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left font-sans text-sm">
                  <thead className="bg-surface-raised/70 border-b border-border text-muted text-xs font-mono uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="py-4 px-6">Participant</th>
                      <th scope="col" className="py-4 px-6 text-right tabular-nums">Python Domain</th>
                      <th scope="col" className="py-4 px-6 text-right tabular-nums">Problem Solving</th>
                      <th scope="col" className="py-4 px-6">Audit Status</th>
                      <th scope="col" className="py-4 px-6 text-right">Attribution Policy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {hackerRankParticipants.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.isCurrentUser ? "bg-brand-primary/[0.04] border-l-4 border-l-brand-secondary" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-white text-sm flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.isCurrentUser && (
                                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-brand-secondary text-white font-mono font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-muted text-xs font-mono">{item.handle}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right tabular-nums">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold justify-end">
                            <span className="text-white text-sm tabular-nums font-mono">{item.pythonStars}</span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < item.pythonStars ? "fill-amber-400 text-amber-400" : "text-white/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right tabular-nums">
                          <div className="flex items-center gap-1.5 text-amber-400 font-bold justify-end">
                            <span className="text-white text-sm tabular-nums font-mono">{item.problemSolvingStars}</span>
                            <div className="flex items-center">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < item.problemSolvingStars ? "fill-amber-400 text-amber-400" : "text-white/20"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <ShieldCheck className="h-3 w-3" />
                              {item.status}
                            </span>
                            <span className="block text-[11px] font-mono text-muted truncate max-w-[140px]" title={item.evidenceHash}>
                              {item.evidenceHash}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 text-muted border border-border">
                            Excluded from Weekly Delta
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards View (HackerRank) */}
            <div className="md:hidden space-y-3">
              {hackerRankParticipants.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 space-y-3 shadow-sm ${
                    item.isCurrentUser
                      ? "border-brand-secondary/50 bg-surface-raised"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-9 w-9 rounded-xl bg-surface-card border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-sm flex items-center gap-2 truncate">
                          <span>{item.name}</span>
                          {item.isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-secondary text-white font-mono font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-muted text-xs font-mono">{item.handle}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle text-xs">
                    <div>
                      <span className="text-muted block text-[11px]">Python Domain</span>
                      <div className="flex items-center gap-1 font-bold text-amber-400 mt-0.5">
                        <span className="text-white font-mono">{item.pythonStars}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2.5 w-2.5 ${i < item.pythonStars ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted block text-[11px]">Problem Solving</span>
                      <div className="flex items-center gap-1 font-bold text-amber-400 mt-0.5">
                        <span className="text-white font-mono">{item.problemSolvingStars}</span>
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-2.5 w-2.5 ${i < item.problemSolvingStars ? "fill-amber-400 text-amber-400" : "text-white/20"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between text-xs font-mono text-muted">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified Badges
                    </span>
                    <span className="truncate max-w-[150px]">{item.evidenceHash}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Deterministic Competition Leaderboard Table (GitHub & LeetCode) */
          <div className="space-y-4">
            {/* Desktop & Tablet Table */}
            <div className="hidden md:block rounded-2xl border border-border bg-surface overflow-hidden shadow-panel">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left font-sans text-sm">
                  <thead className="bg-surface-raised/70 border-b border-border text-muted text-xs font-mono uppercase tracking-wider">
                    <tr>
                      <th scope="col" className="py-4 px-6 text-center w-24">Rank</th>
                      <th scope="col" className="py-4 px-6">Participant</th>
                      <th scope="col" className="py-4 px-6 text-right tabular-nums">
                        {platform === "github" ? "Observed Active Days" : "Weekly Solved Delta"}
                      </th>
                      <th scope="col" className="py-4 px-6 text-right tabular-nums">Retrieval Coverage</th>
                      <th scope="col" className="py-4 px-6 text-right tabular-nums">Last Freshness</th>
                      <th scope="col" className="py-4 px-6 text-right">Standing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {activeRankedEntries.map((item) => (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          item.isCurrentUser ? "bg-brand-primary/[0.04] border-l-4 border-l-brand-secondary" : "hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* Rank & Tied Indicator */}
                        <td className="py-4 px-6 text-center tabular-nums">
                          <div className="flex items-center justify-center gap-1.5">
                            {item.rank === 1 ? (
                              <span className="h-7 w-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                                1
                              </span>
                            ) : item.rank === 2 ? (
                              <span className="h-7 w-7 rounded-lg bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                                2
                              </span>
                            ) : item.rank === 3 ? (
                              <span className="h-7 w-7 rounded-lg bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                                3
                              </span>
                            ) : (
                              <span className="text-muted text-sm font-mono font-medium">{item.rank}</span>
                            )}

                            {item.isTied && (
                              <span
                                className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-muted font-mono"
                                title="Tied score (Rule §9.6: standard competition ranking 1, 2, 2, 4)"
                              >
                                Tied
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Participant Identity */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white shadow-sm">
                              {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white text-sm flex items-center gap-2">
                                <span>{item.name}</span>
                                {item.isCurrentUser && (
                                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-brand-secondary text-white font-mono font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <span className="text-muted text-xs font-mono">{item.handle}</span>
                            </div>
                          </div>
                        </td>

                        {/* Metric Value */}
                        <td className="py-4 px-6 font-bold text-white text-sm text-right tabular-nums font-mono">
                          {item.value}
                        </td>

                        {/* Retrieval Coverage */}
                        <td className="py-4 px-6 text-right tabular-nums text-xs font-mono">
                          <span className={item.coveragePass ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                            {item.coverage}
                          </span>
                        </td>

                        {/* Last Freshness */}
                        <td className="py-4 px-6 text-muted text-right tabular-nums text-xs font-mono">
                          {item.freshness}
                        </td>

                        {/* Standing Badge & Dispute */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
                                item.status === "Finalized"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {item.status === "Finalized" ? (
                                <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                              ) : (
                                <AlertCircle className="h-3 w-3" aria-hidden="true" />
                              )}
                              <span>{item.status === "Finalized" ? "Finalized" : "Provisional"}</span>
                            </span>

                            {item.isCurrentUser && (
                              <button
                                onClick={() => openDisputeModal(platform === "github" ? "github_active_days" : "leetcode_delta")}
                                className="text-xs text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded-md bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 font-semibold transition-colors"
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

            {/* Mobile Participant Cards View (< 768px): Eliminates awkward table blowout */}
            <div className="md:hidden space-y-3">
              {activeRankedEntries.map((item) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border p-4 space-y-3 shadow-sm ${
                    item.isCurrentUser
                      ? "border-brand-secondary/50 bg-surface-raised"
                      : "border-border bg-surface"
                  }`}
                >
                  {/* Top Bar: Rank, Avatar, Name, Metric Value */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Rank Badge */}
                      <div className="shrink-0">
                        {item.rank === 1 ? (
                          <span className="h-7 w-7 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                            1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="h-7 w-7 rounded-lg bg-slate-300/20 text-slate-200 border border-slate-300/40 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                            2
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="h-7 w-7 rounded-lg bg-amber-700/20 text-amber-600 border border-amber-700/40 flex items-center justify-center text-xs font-mono font-bold shadow-sm">
                            3
                          </span>
                        ) : (
                          <span className="h-7 w-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono text-muted font-bold">
                            {item.rank}
                          </span>
                        )}
                      </div>

                      <div className="h-9 w-9 rounded-xl bg-surface-card border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white shrink-0">
                        {item.name.substring(0, 2).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-white text-sm flex items-center gap-1.5 truncate">
                          <span>{item.name}</span>
                          {item.isCurrentUser && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-secondary text-white font-mono font-bold">
                              YOU
                            </span>
                          )}
                          {item.isTied && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-white/5 border border-white/10 text-muted font-mono">
                              Tied
                            </span>
                          )}
                        </div>
                        <span className="text-muted text-xs font-mono">{item.handle}</span>
                      </div>
                    </div>

                    {/* Metric Value */}
                    <div className="text-right shrink-0">
                      <div className="font-mono font-bold text-base text-white tabular-nums">
                        {item.value}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border-subtle text-xs font-mono">
                    <div>
                      <span className="text-muted block text-[11px] font-sans">Coverage</span>
                      <span className={item.coveragePass ? "text-emerald-400 font-semibold" : "text-amber-400 font-semibold"}>
                        {item.coverage}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-muted block text-[11px] font-sans">Freshness</span>
                      <span className="text-ink-secondary">{item.freshness}</span>
                    </div>
                  </div>

                  {/* Standing Status & Dispute Action */}
                  <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
                        item.status === "Finalized"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {item.status === "Finalized" ? (
                        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      )}
                      <span>{item.status === "Finalized" ? "Finalized — verified" : "Provisional — re-sync pending"}</span>
                    </span>

                    {item.isCurrentUser && (
                      <button
                        onClick={() => openDisputeModal(platform === "github" ? "github_active_days" : "leetcode_delta")}
                        className="text-xs text-rose-400 hover:text-rose-300 px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 font-semibold transition-colors"
                      >
                        Lodge Dispute
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>

      {/* Standard Authenticated Footer */}
      <footer className="border-t border-border bg-canvas py-6 text-xs text-muted font-sans mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>TWM 3.1 Platform · Deterministic Ranks &amp; Roster Denominator</div>
          <div className="text-muted font-mono text-[11px]">
            Rule §9.6: Standard Competition Ties (1, 2, 2, 4) · Section §5.6: Capability Gating
          </div>
        </div>
      </footer>
    </div>
  );
}
