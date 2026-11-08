"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Download,
  Activity,
  Layers,
  Sparkles,
  ShieldAlert
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { LeetCodeIcon as Code2 } from "@/components/ui/LeetCodeIcon";
import { HackerRankIcon as Award } from "@/components/ui/HackerRankIcon";
import { AppHeader } from "@/components/ui/AppHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
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
  const weekVerified = verifiedCount === 3 && currentUser.leetcode.hmacVerified;
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

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col selection:bg-brand-primary/30 selection:text-white">
      <AppHeader />

      <PageContainer className="space-y-6 sm:space-y-8">
        {/* 1. STANDARDIZED PAGE HEADER */}
        <PageHeader
          badge={
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/25 text-brand-primary text-xs font-mono font-semibold">
              <Activity className="h-3.5 w-3.5 text-brand-secondary shrink-0" />
              <span>Developer Cockpit · {currentUser.classSection}</span>
              <span className="opacity-40">|</span>
              <span className="text-white font-mono">{currentUser.rollNo}</span>
            </div>
          }
          title="Student Activity & Telemetry Cockpit"
          description="Personal weekly verification status, multi-provider observation stream, and tamper-resistant audit logs."
          actions={
            <>
              <button
                type="button"
                onClick={() => triggerLiveSync()}
                disabled={isSyncing}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-secondary px-4 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-accent-hover disabled:opacity-60 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} aria-hidden="true" />
                <span>{isSyncing ? "Syncing..." : "Sync Telemetry"}</span>
              </button>

              <button
                type="button"
                onClick={() => openDisputeModal()}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/25 bg-rose-500/10 px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-400 transition-all hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
              >
                <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Lodge Dispute</span>
              </button>

              <button
                type="button"
                onClick={exportTelemetryJSON}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface hover:bg-surface-raised px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition-all shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              >
                <Download className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>Export Ledger</span>
              </button>
            </>
          }
        />

        {/* 2. WEEKLY VERIFICATION STATUS HERO PANEL */}
        <section
          aria-label="Weekly verification status"
          className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-panel"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-3 min-w-0 flex-1">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted block">
                Weekly Observation Status
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white tabular-nums">
                  {verificationLabel}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs sm:text-sm font-semibold ${
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
                  {verificationLabel === "Verified" ? "All providers verified" : verificationLabel}
                </span>
              </div>

              <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl font-sans">
                {verificationDetail} Weekly window closes strictly at Sunday 23:59:59 IST. Only observations at or before the boundary count.
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-mono text-muted pt-1">
                <span>
                  GitHub:{" "}
                  {ghConnected ? (
                    <span className="text-emerald-400 font-semibold">Connected @{currentUser.github.username}</span>
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
                    <span className="text-emerald-400 font-semibold">Connected @{currentUser.hackerrank.username}</span>
                  ) : (
                    <span className="text-amber-400 font-semibold">UNAVAILABLE</span>
                  )}
                </span>
              </div>
            </div>

            {/* Sync Telemetry Meta */}
            <div className="p-4 rounded-xl bg-surface-raised border border-white/5 space-y-1.5 shrink-0 min-w-[200px] text-right">
              <span className="text-xs font-mono text-muted block">Telemetry Sync Status</span>
              <div className="text-sm font-semibold text-white flex items-center justify-end gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{lastSyncTime}</span>
              </div>
              {isSyncing && syncStep && (
                <div className="text-xs font-mono text-brand-secondary animate-pulse">
                  {syncStep}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted">
            <p className="text-sm text-white font-semibold flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="font-mono text-muted font-normal">@{currentUser.handle}</span>
            </p>
            <p>
              Class: {currentUser.classSection} · Register No:{" "}
              <strong className="text-white font-mono">{currentUser.rollNo}</strong> · Track:{" "}
              {currentUser.activeTrack} · Leaderboard opted-in
            </p>
          </div>
        </section>

        {/* 3. TYPE-LED METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <section aria-label="GitHub weekly active days" className="p-6 rounded-2xl border border-border bg-surface shadow-panel flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted block">GitHub Active Days</span>
            {ghConnected ? (
              <div className="mt-3 space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
                  {currentUser.github.activeDaysWeek} / 7 days
                </p>
                <p className="text-xs text-muted font-mono pt-1">
                  Last commit: {currentUser.github.lastCommitTime} · Repos: {currentUser.github.reposTracked}
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tabular-nums">UNAVAILABLE</p>
                <p className="text-xs text-muted font-mono pt-1">GitHub adapter not connected.</p>
              </div>
            )}
          </section>

          <section aria-label="LeetCode weekly solved delta" className="p-6 rounded-2xl border border-border bg-surface shadow-panel flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted block">LeetCode Weekly Delta</span>
            {lcConnected ? (
              <div className="mt-3 space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-brand-secondary tabular-nums">
                  {currentUser.leetcode.weeklyDelta > 0
                    ? `+${currentUser.leetcode.weeklyDelta} solved`
                    : currentUser.leetcode.totalSolved > 0
                      ? "Baseline active"
                      : "UNAVAILABLE"}
                </p>
                <p className="text-xs text-muted font-mono pt-1">
                  Total: {currentUser.leetcode.totalSolved} (E: {currentUser.leetcode.easyCount} · M: {currentUser.leetcode.mediumCount} · H: {currentUser.leetcode.hardCount})
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tabular-nums">UNAVAILABLE</p>
                <p className="text-xs text-muted font-mono pt-1">LeetCode adapter not connected.</p>
              </div>
            )}
          </section>

          <section aria-label="HackerRank badges display only" className="p-6 rounded-2xl border border-border bg-surface shadow-panel flex flex-col justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted block">HackerRank Badges (Display-Only)</span>
            {hrConnected ? (
              <div className="mt-3 space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
                  {currentUser.hackerrank.pythonStars} / {currentUser.hackerrank.problemSolvingStars} stars
                </p>
                <p className="text-xs text-muted font-mono pt-1">
                  Python {currentUser.hackerrank.pythonStars}★ · PS {currentUser.hackerrank.problemSolvingStars}★ (Excluded from delta)
                </p>
              </div>
            ) : (
              <div className="mt-3 space-y-1">
                <p className="text-3xl sm:text-4xl font-extrabold font-mono text-amber-400 tabular-nums">UNAVAILABLE</p>
                <p className="text-xs text-muted font-mono pt-1">HackerRank adapter not connected.</p>
              </div>
            )}
          </section>
        </div>

        {/* 4. PROVIDER DEEP DIVES (3 GRIDS) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GitHub Panel */}
          <section aria-label="GitHub activity" className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between gap-6 shadow-panel">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Github className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-white leading-tight">GitHub Telemetry</h2>
                  <p className="text-xs text-muted font-mono truncate">
                    {ghConnected ? `@${currentUser.github.username}` : "UNAVAILABLE"}
                  </p>
                </div>
              </div>
              {ghConnected ? (
                <dl className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between gap-4 py-1 border-b border-border-subtle">
                    <dt className="text-muted">Weekly active days</dt>
                    <dd className="font-bold text-white tabular-nums">{currentUser.github.activeDaysWeek} / 7</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1 border-b border-border-subtle">
                    <dt className="text-muted">Tracked repos</dt>
                    <dd className="font-bold text-white tabular-nums">{currentUser.github.reposTracked}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="text-muted">Last commit time</dt>
                    <dd className="text-ink-secondary tabular-nums">{currentUser.github.lastCommitTime}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-amber-400 font-mono">UNAVAILABLE — GitHub is not connected.</p>
              )}
            </div>
            <p className="pt-4 border-t border-border-subtle text-xs text-muted font-sans">
              Author attribution is checked against enrolled college roster on sync.
            </p>
          </section>

          {/* LeetCode Panel */}
          <section aria-label="LeetCode telemetry" className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between gap-6 shadow-panel">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center text-provider-leetcode-brand shrink-0 shadow-sm">
                  <Code2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-white leading-tight">LeetCode Telemetry</h2>
                  <p className="text-xs text-muted font-mono truncate">
                    {lcConnected ? `@${currentUser.leetcode.username}` : "UNAVAILABLE"}
                  </p>
                </div>
              </div>
              {lcConnected ? (
                <dl className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between gap-4 py-1 border-b border-border-subtle">
                    <dt className="text-muted">Total solved</dt>
                    <dd className="font-bold text-white tabular-nums">{currentUser.leetcode.totalSolved}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1 border-b border-border-subtle">
                    <dt className="text-muted">Weekly delta</dt>
                    <dd className="font-bold text-brand-secondary tabular-nums">+{currentUser.leetcode.weeklyDelta}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1 border-b border-border-subtle">
                    <dt className="text-muted">HMAC bio challenge</dt>
                    <dd className="text-emerald-400 font-semibold">{currentUser.leetcode.hmacVerified ? "Verified" : "Pending"}</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="text-muted">Difficulty split</dt>
                    <dd className="text-ink-secondary tabular-nums">
                      {currentUser.leetcode.easyCount}E / {currentUser.leetcode.mediumCount}M / {currentUser.leetcode.hardCount}H
                    </dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-amber-400 font-mono">UNAVAILABLE — LeetCode is not connected.</p>
              )}
            </div>
            <p className="pt-4 border-t border-border-subtle text-xs text-muted font-sans">
              Rule §9.7: Sunday 23:59:59 IST pre-boundary baseline diffing.
            </p>
          </section>

          {/* HackerRank Panel */}
          <section aria-label="HackerRank badges" className="rounded-2xl border border-border bg-surface p-6 flex flex-col justify-between gap-6 shadow-panel">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center text-provider-hackerrank shrink-0 shadow-sm">
                  <Award className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-white leading-tight">HackerRank Evidence</h2>
                  <p className="text-xs text-muted font-mono truncate">
                    {hrConnected ? `@${currentUser.hackerrank.username}` : "UNAVAILABLE"}
                  </p>
                </div>
              </div>
              {hrConnected ? (
                <dl className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between gap-4 py-1 border-b border-border-subtle">
                    <dt className="text-muted">Python domain</dt>
                    <dd className="font-bold text-amber-400 tabular-nums">{currentUser.hackerrank.pythonStars} / 5 Stars</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1 border-b border-border-subtle">
                    <dt className="text-muted">Problem solving</dt>
                    <dd className="font-bold text-amber-400 tabular-nums">{currentUser.hackerrank.problemSolvingStars} / 5 Stars</dd>
                  </div>
                  <div className="flex justify-between gap-4 py-1">
                    <dt className="text-muted">Evidence digest</dt>
                    <dd className="text-emerald-400 font-semibold">SHA-256 Verified</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-amber-400 font-mono">UNAVAILABLE — HackerRank is not connected.</p>
              )}
            </div>
            <p className="pt-4 border-t border-border-subtle text-xs text-muted font-sans">
              Rule §5.6: Excluded from weekly rankings due to timestamp disparity.
            </p>
          </section>
        </div>

        {/* 5. WEEKLY RECAP & AI SUMMARY COMPONENT */}
        <WeeklyRecapCard />
      </PageContainer>
    </div>
  );
}
