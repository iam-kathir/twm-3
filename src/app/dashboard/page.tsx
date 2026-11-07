"use client";

import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Download,
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { LeetCodeIcon as Code2 } from "@/components/ui/LeetCodeIcon";
import { HackerRankIcon as Award } from "@/components/ui/HackerRankIcon";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";
import { WeeklyRecapCard } from "@/components/dashboard/WeeklyRecapCard";

export default function DashboardPage() {
  const {
    currentUser,
    isSyncing,
    syncStep,
    triggerLiveSync,
    lastSyncTime,
    openDisputeModal,
    exportTelemetryJSON,
  } = useApp();

  const ghConnected = currentUser.github.connected && !!currentUser.github.username;
  const lcConnected = currentUser.leetcode.connected && !!currentUser.leetcode.username;
  const hrConnected = currentUser.hackerrank.connected && !!currentUser.hackerrank.username;
  const verifiedCount = [ghConnected, lcConnected, hrConnected].filter(Boolean).length;
  const weekVerified =
    verifiedCount === 3 && currentUser.leetcode.hmacVerified;
  const verificationLabel = weekVerified
    ? "Verified"
    : verifiedCount > 0
      ? "Pending"
      : "UNAVAILABLE";
  const verificationDetail = weekVerified
    ? "GitHub, LeetCode and HackerRank are connected. LeetCode is HMAC-verified."
    : verifiedCount > 0
      ? "Some providers are not connected. Missing data is shown as UNAVAILABLE, never as 0."
      : "No providers are connected. Sync telemetry to restore verified observations.";

  const trackerClass =
    "text-[13px] sm:text-sm font-medium min-w-0";

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-accent selection:text-canvas overflow-x-hidden">
      <AppHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 min-w-0">
        {/* Verification status + primary actions */}
        <section
          aria-label="Weekly verification status"
          className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-8 shadow-xl"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 min-w-0">
              <h1 className="text-sm font-semibold text-muted">Is my week verified?</h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white tabular-nums">
                  {verificationLabel}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${
                    weekVerified
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {weekVerified ? (
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  )}
                  {verificationLabel === "Verified"
                    ? "All providers verified"
                    : verificationLabel}
                </span>
              </div>
              <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl">
                {verificationDetail} Weekly window: Monday 00:00:00 to Sunday
                23:59:59 IST. Only observations at or before the boundary count.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-muted">
                <span>
                  GitHub:{" "}
                  {ghConnected ? (
                    <span className="text-emerald-400 font-semibold">
                      Connected @{currentUser.github.username}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">UNAVAILABLE</span>
                  )}
                </span>
                <span>
                  LeetCode:{" "}
                  {lcConnected ? (
                    <span className="text-emerald-400 font-semibold">
                      Connected @{currentUser.leetcode.username}
                      {currentUser.leetcode.hmacVerified ? " (HMAC-verified)" : ""}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">UNAVAILABLE</span>
                  )}
                </span>
                <span>
                  HackerRank:{" "}
                  {hrConnected ? (
                    <span className="text-emerald-400 font-semibold">
                      Connected @{currentUser.hackerrank.username} (display-only)
                    </span>
                  ) : (
                    <span className="text-amber-400 font-semibold">UNAVAILABLE</span>
                  )}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => triggerLiveSync()}
                disabled={isSyncing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-canvas transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} aria-hidden="true" />
                {isSyncing ? "Syncing…" : "Sync telemetry"}
              </button>
              <button
                type="button"
                onClick={() => openDisputeModal()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/20"
              >
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                Lodge dispute
              </button>
              <button
                type="button"
                onClick={exportTelemetryJSON}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-surface-raised px-4 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Export ledger
              </button>
              <p className="text-[13px] text-muted text-center lg:text-right" aria-live="polite">
                Last sync: <span className="text-emerald-400 font-semibold">{lastSyncTime}</span>
                {isSyncing && syncStep ? ` — ${syncStep}` : ""}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-white font-semibold">
              {currentUser.name}{" "}
              <span className="font-mono text-muted font-normal">@{currentUser.handle}</span>
            </p>
            <p className="text-[13px] text-muted">
              Class: {currentUser.classSection} • Register No:{" "}
              <strong className="text-white">{currentUser.rollNo}</strong> • Track:{" "}
              {currentUser.activeTrack} • Leaderboard opted-in
            </p>
          </div>
        </section>

        {/* Type-led metrics (no icon chips, no invented coverage) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <section aria-label="GitHub weekly active days" className="p-6 rounded-2xl border border-white/[0.08] bg-surface shadow-lg">
            <p className={trackerClass}>GitHub active days</p>
            {ghConnected ? (
              <>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums mt-2">
                  {currentUser.github.activeDaysWeek} / 7 days
                </p>
                <p className="text-[13px] text-muted mt-2">
                  Last commit: {currentUser.github.lastCommitTime} • Tracked repos:{" "}
                  {currentUser.github.reposTracked}
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-amber-400 tabular-nums mt-2">UNAVAILABLE</p>
                <p className="text-[13px] text-muted mt-2">GitHub is not connected.</p>
              </>
            )}
          </section>

          <section aria-label="LeetCode weekly solved delta" className="p-6 rounded-2xl border border-white/[0.08] bg-surface shadow-lg">
            <p className={trackerClass}>LeetCode weekly delta</p>
            {lcConnected ? (
              <>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-accent tabular-nums mt-2">
                  {currentUser.leetcode.weeklyDelta > 0
                    ? `+${currentUser.leetcode.weeklyDelta} solved`
                    : currentUser.leetcode.totalSolved > 0
                      ? "Baseline active"
                      : "UNAVAILABLE"}
                </p>
                <p className="text-[13px] text-muted mt-2">
                  Total solved: {currentUser.leetcode.totalSolved} • Easy{" "}
                  {currentUser.leetcode.easyCount} • Medium {currentUser.leetcode.mediumCount} • Hard{" "}
                  {currentUser.leetcode.hardCount}
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-amber-400 tabular-nums mt-2">UNAVAILABLE</p>
                <p className="text-[13px] text-muted mt-2">LeetCode is not connected.</p>
              </>
            )}
          </section>

          <section aria-label="HackerRank badges display only" className="p-6 rounded-2xl border border-white/[0.08] bg-surface shadow-lg">
            <p className={trackerClass}>HackerRank badges (display-only)</p>
            {hrConnected ? (
              <>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-white tabular-nums mt-2">
                  {currentUser.hackerrank.pythonStars} / {currentUser.hackerrank.problemSolvingStars} stars
                </p>
                <p className="text-[13px] text-muted mt-2">
                  Python {currentUser.hackerrank.pythonStars} • Problem Solving{" "}
                  {currentUser.hackerrank.problemSolvingStars} — excluded from weekly deltas (§5.6).
                </p>
              </>
            ) : (
              <>
                <p className="text-3xl sm:text-4xl font-bold font-mono text-amber-400 tabular-nums mt-2">UNAVAILABLE</p>
                <p className="text-[13px] text-muted mt-2">HackerRank is not connected.</p>
              </>
            )}
          </section>
        </div>

        {/* Provider details — provider columns kept semantically separate */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section aria-label="GitHub activity" className="rounded-2xl border border-white/[0.08] bg-surface p-6 flex flex-col justify-between gap-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Github className="h-5 w-5 text-ink" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-ink leading-tight">GitHub activity</h2>
                  <p className="text-[13px] text-muted font-mono truncate">
                    {ghConnected ? `@${currentUser.github.username}` : "UNAVAILABLE"}
                  </p>
                </div>
              </div>
              {ghConnected ? (
                <dl className="space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4"><dt className="text-muted">Weekly active days</dt><dd className="font-mono font-bold text-white tabular-nums">{currentUser.github.activeDaysWeek} / 7</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Tracked repositories</dt><dd className="font-mono font-bold text-white tabular-nums">{currentUser.github.reposTracked}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Last commit</dt><dd className="font-mono text-ink-secondary tabular-nums">{currentUser.github.lastCommitTime}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-amber-400 font-semibold">UNAVAILABLE — GitHub is not connected. Connect it to restore observations.</p>
              )}
            </div>
            <p className="pt-4 border-t border-white/[0.06] text-[13px] text-muted">
              {ghConnected ? "Author attribution is checked against the class roster on sync." : "No GitHub observations are claimed while disconnected."}
            </p>
          </section>

          <section aria-label="LeetCode telemetry" className="rounded-2xl border border-white/[0.08] bg-surface p-6 flex flex-col justify-between gap-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Code2 className="h-5 w-5 text-provider-leetcode-brand" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-ink leading-tight">LeetCode telemetry</h2>
                  <p className="text-[13px] text-muted font-mono truncate">
                    {lcConnected ? `@${currentUser.leetcode.username}` : "UNAVAILABLE"}
                  </p>
                </div>
              </div>
              {lcConnected ? (
                <dl className="space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4"><dt className="text-muted">Total solved</dt><dd className="font-mono font-bold text-white tabular-nums">{currentUser.leetcode.totalSolved}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Weekly delta</dt><dd className="font-mono font-bold text-accent tabular-nums">{currentUser.leetcode.weeklyDelta}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">HMAC verification</dt><dd className="font-mono font-bold text-emerald-400">{currentUser.leetcode.hmacVerified ? "Verified" : "Not verified"}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Easy / Medium / Hard</dt><dd className="font-mono text-ink-secondary tabular-nums">{currentUser.leetcode.easyCount} / {currentUser.leetcode.mediumCount} / {currentUser.leetcode.hardCount}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-amber-400 font-semibold">UNAVAILABLE — LeetCode is not connected.</p>
              )}
            </div>
            <p className="pt-4 border-t border-white/[0.06] text-[13px] text-muted">
              Boundary: Sunday 23:59:59 IST. Deltas use only observations at or before the boundary.
            </p>
          </section>

          <section aria-label="HackerRank badges" className="rounded-2xl border border-white/[0.08] bg-surface p-6 flex flex-col justify-between gap-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-provider-hackerrank" aria-hidden="true" />
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-ink leading-tight">HackerRank badges</h2>
                  <p className="text-[13px] text-muted font-mono truncate">
                    {hrConnected ? `@${currentUser.hackerrank.username}` : "UNAVAILABLE"}
                  </p>
                </div>
              </div>
              {hrConnected ? (
                <dl className="space-y-2 text-[13px]">
                  <div className="flex justify-between gap-4"><dt className="text-muted">Python stars</dt><dd className="font-mono font-bold text-white tabular-nums">{currentUser.hackerrank.pythonStars}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted">Problem solving stars</dt><dd className="font-mono font-bold text-white tabular-nums">{currentUser.hackerrank.problemSolvingStars}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-amber-400 font-semibold">UNAVAILABLE — HackerRank is not connected.</p>
              )}
            </div>
            <p className="pt-4 border-t border-white/[0.06] text-[13px] text-muted flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
              Cumulative badges are display-only and excluded from weekly competition deltas (§5.6).
            </p>
          </section>
        </div>

        <WeeklyRecapCard />
      </main>

      <footer className="border-t border-white/[0.08] bg-canvas py-6 text-[12px] text-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>TWM 3.1 Platform • Personal student dashboard</span>
          <Link href="/leaderboard" className="text-accent hover:underline inline-flex items-center gap-1">
            <span>View class leaderboards</span>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </div>
  );
}
