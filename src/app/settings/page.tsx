"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Shield,
  FileDown,
  Save,
  CheckCircle2,
  RotateCw,
  Lock,
  Eye,
  Database,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { LeetCodeIcon as Code2 } from "@/components/ui/LeetCodeIcon";
import { HackerRankIcon as Award } from "@/components/ui/HackerRankIcon";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";

type SettingsTab = "profile" | "adapters" | "privacy" | "data";

export default function SettingsPage() {
  const {
    currentUser,
    updateUserSettings,
    updateConnectedAccount,
    exportLeaderboardCSV,
    exportTelemetryJSON,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  // Local state for profile and privacy form
  const [visibility, setVisibility] = useState(currentUser.settings.leaderboardVisibility);
  const [recapPref, setRecapPref] = useState(currentUser.settings.recapPreference);
  const [publicDiscovery, setPublicDiscovery] = useState(currentUser.settings.publicDiscovery);
  const [notifyDispute, setNotifyDispute] = useState(currentUser.settings.notifyOnDispute);
  const [notifyRecap, setNotifyRecap] = useState(currentUser.settings.notifyOnWeeklyRecap);
  const [testingAdapter, setTestingAdapter] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Destructive actions require an explicit second confirmation step.
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const testGitHubAdapter = async () => {
    setTestingAdapter("github");
    try {
      const res = await fetch(`/api/telemetry/github?username=${encodeURIComponent(currentUser.github.username || "octocat")}`);
      const data = await res.json();
      if (res.ok) {
        addToast({
          title: "GitHub Adapter Verified",
          description: `Observed ${data.metrics?.activeDaysWeek || 0} active days in trailing 7 UTC days. Rate limit: ${data.rateLimit?.remaining || "ok"}.`,
          type: "success",
        });
      } else {
        addToast({
          title: "GitHub Observation Notice",
          description: data.error || "Unable to reach public profile.",
          type: "warning",
        });
      }
    } catch {
      addToast({
        title: "Network Notice",
        description: "Failed to connect to GitHub telemetry route.",
        type: "error",
      });
    } finally {
      setTestingAdapter(null);
    }
  };

  const testLeetCodeAdapter = async () => {
    setTestingAdapter("leetcode");
    try {
      const res = await fetch(`/api/telemetry/leetcode?username=${encodeURIComponent(currentUser.leetcode.username || "neal_wu")}`);
      const data = await res.json();
      if (res.ok && data.isVerified) {
        addToast({
          title: "LeetCode Snapshot Live",
          description: `Verified ${data.metrics?.totalSolved || 0} solved problems (Easy: ${data.metrics?.easySolved}, Med: ${data.metrics?.mediumSolved}, Hard: ${data.metrics?.hardSolved}).`,
          type: "success",
        });
      } else {
        addToast({
          title: "LeetCode Adapter Notice",
          description: data.error || data.capabilityNotice || "Unable to retrieve public profile.",
          type: "warning",
        });
      }
    } catch {
      addToast({
        title: "Network Notice",
        description: "Failed to query LeetCode snapshot service.",
        type: "error",
      });
    } finally {
      setTestingAdapter(null);
    }
  };

  const testHackerRankAdapter = async () => {
    setTestingAdapter("hackerrank");
    try {
      const res = await fetch(`/api/telemetry/hackerrank?username=${encodeURIComponent(currentUser.hackerrank.username || "alice")}`);
      const data = await res.json();
      if (res.ok && data.isVerified) {
        addToast({
          title: "HackerRank Gated Verified",
          description: `Verified ${data.metrics?.totalStars || 0} domain stars (${data.metrics?.badgesCount || 0} badges). Status: DISPLAY_ONLY_EXCLUDED_FROM_DELTA.`,
          type: "success",
        });
      } else {
        addToast({
          title: "HackerRank Capability Status",
          description: data.capabilityNotice || data.error || "HackerRank profile query complete.",
          type: "info",
        });
      }
    } catch {
      addToast({
        title: "Network Notice",
        description: "Failed to connect to HackerRank adapter route.",
        type: "error",
      });
    } finally {
      setTestingAdapter(null);
    }
  };

  const testHmacChallenge = async () => {
    setTestingAdapter("hmac");
    try {
      const res = await fetch("/api/auth/hmac-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: currentUser.rollNo,
          provider: "leetcode",
          handle: currentUser.leetcode.username,
        }),
      });
      const data = await res.json();
      if (res.ok && data.challengeCode) {
        addToast({
          title: "Cryptographic HMAC Generated",
          description: `Token: ${data.challengeCode.slice(0, 24)}... (Valid for 15 minutes)`,
          type: "success",
        });
      } else {
        addToast({
          title: "HMAC Service Notice",
          description: data.error ?? "Challenge token generation failed.",
          type: "error",
        });
      }
    } catch {
      addToast({
        title: "HMAC Service Notice",
        description: "Challenge token generation failed.",
        type: "error",
      });
    } finally {
      setTestingAdapter(null);
    }
  };

  const handleSavePrivacy = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveError(null);

    const tierMap: Record<string, string> = {
      public: "LEGAL_NAME",
      handle_only: "HANDLE_ONLY",
      anonymous: "ANONYMOUS",
    };

    try {
      const res = await fetch("/api/auth/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identityTier: tierMap[visibility] || "LEGAL_NAME" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        // Local preferences still apply, but the server tier did not sync —
        // say so honestly instead of reporting full success.
        updateUserSettings({
          leaderboardVisibility: visibility,
          recapPreference: recapPref,
          publicDiscovery,
          notifyOnDispute: notifyDispute,
          notifyOnWeeklyRecap: notifyRecap
        });
        setSaveError(
          data.error ?? "Saved locally, but the server identity tier could not be synced. You can retry saving."
        );
        return;
      }
      updateUserSettings({
        leaderboardVisibility: visibility,
        recapPreference: recapPref,
        publicDiscovery,
        notifyOnDispute: notifyDispute,
        notifyOnWeeklyRecap: notifyRecap
      });
    } catch {
      // Offline or local mode: local preferences are kept, server sync is not claimed.
      updateUserSettings({
        leaderboardVisibility: visibility,
        recapPreference: recapPref,
        publicDiscovery,
        notifyOnDispute: notifyDispute,
        notifyOnWeeklyRecap: notifyRecap
      });
      setSaveError("Saved locally. The server could not be reached to sync your identity tier.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurgeCache = () => {
    try {
      localStorage.removeItem("twm_user_profile");
      localStorage.removeItem("twm_disputes");
      setConfirmAction(null);
      addToast({
        title: "Telemetry Cache Cleared",
        description: "Local cache purged. Fresh values will be fetched from provider adapters.",
        type: "info"
      });
    } catch {
      addToast({
        title: "Cache Purge Failed",
        description: "Could not clear the local cache in this browser.",
        type: "error",
      });
    }
  };

  const handleDisconnect = (platform: "github" | "leetcode") => {
    updateConnectedAccount(platform, false);
    setConfirmAction(null);
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: "profile", label: "Profile & Roster", icon: User },
    { id: "adapters", label: "Connected Adapters", icon: Github },
    { id: "privacy", label: "Privacy & Visibility", icon: Eye },
    { id: "data", label: "Data & Audits", icon: FileDown }
  ];

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-brand-primary/30 selection:text-white">
      <AppHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10" aria-labelledby="settings-heading">
        {/* Title & Description Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-sm font-medium text-brand-primary">
            <span>Platform settings</span>
            <span className="text-brand-primary" aria-hidden="true">/</span>
            <span>Rule §10.3 compliant</span>
          </div>
          <h1 id="settings-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Account &amp; Telemetry Preferences
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-3xl leading-relaxed">
            Manage your verified provider adapters, privacy visibility tiers, cohort roster credentials, and export verifiable observation artifacts.
          </p>
        </div>

        {/* Tab Controls Bar */}
        <div role="tablist" aria-label="Settings sections" className="flex items-center gap-2 sm:gap-3 border-b border-white/[0.08] pb-4 overflow-x-auto p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`settings-tab-${tab.id}`}
                aria-selected={isSelected}
                aria-controls={`settings-panel-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setConfirmAction(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                    e.preventDefault();
                    const idx = tabs.findIndex((t) => t.id === tab.id);
                    const next = e.key === "ArrowRight"
                      ? tabs[(idx + 1) % tabs.length]
                      : tabs[(idx - 1 + tabs.length) % tabs.length];
                    setActiveTab(next.id);
                    document.getElementById(`settings-tab-${next.id}`)?.focus();
                  }
                }}
                className={`relative flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm sm:text-base font-semibold transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                  isSelected
                    ? "text-white font-bold"
                    : "text-muted hover:text-white hover:bg-white/5"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="settings-active-tab"
                    className="absolute inset-0 rounded-xl bg-surface-raised border border-brand-primary/40"
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    aria-hidden="true"
                  />
                )}
                <Icon className={`relative z-10 h-5 w-5 ${isSelected ? "text-brand-secondary" : "text-slate-300"}`} aria-hidden="true" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile & College Roster */}
        {activeTab === "profile" && (
          <motion.section
            role="tabpanel"
            id="settings-panel-profile"
            aria-labelledby="settings-tab-profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-8 shadow-xl">
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-bold text-white">College Roster Identity</h2>
                <p className="text-sm sm:text-base text-muted max-w-3xl leading-relaxed">
                  Your academic profile is cryptographically matched with the official institutional class enrollment roster. Roll numbers and degrees are immutable under Rule §3.3.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label htmlFor="settings-name" className="block text-sm font-semibold text-ink-secondary">
                    Full Legal Name
                  </label>
                  <input
                    id="settings-name"
                    type="text"
                    disabled
                    readOnly
                    value={currentUser.name}
                    autoComplete="name"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg text-white cursor-not-allowed"
                  />
                  <span id="settings-name-help" className="text-sm text-muted block">Verified from institutional registrar records</span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="settings-roll" className="block text-sm font-semibold text-ink-secondary">
                    Registration / Roll Number
                  </label>
                  <input
                    id="settings-roll"
                    type="text"
                    disabled
                    readOnly
                    value={currentUser.rollNo}
                    autoComplete="off"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg text-brand-primary cursor-not-allowed font-bold"
                  />
                  <span className="text-sm text-muted block">Immutable cohort participant index</span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="settings-class" className="block text-sm font-semibold text-ink-secondary">
                    Class Section &amp; Academic Program
                  </label>
                  <input
                    id="settings-class"
                    type="text"
                    disabled
                    readOnly
                    value={currentUser.classSection}
                    autoComplete="off"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg text-white cursor-not-allowed"
                  />
                  <span className="text-sm text-muted block">Cohort denominator quorum: 60 enrolled students</span>
                </div>

                <div className="space-y-2">
                  <label htmlFor="settings-email" className="block text-sm font-semibold text-ink-secondary">
                    Institutional Email Address
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    disabled
                    readOnly
                    value={currentUser.email}
                    autoComplete="email"
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg text-white cursor-not-allowed"
                  />
                  <span className="text-sm text-muted block">Single sign-on identifier</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <span className="text-muted">Roster Verification Quorum:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                  <span>Cryptographically Signed &amp; Verified by Faculty Co-Admin</span>
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-raised/70 border border-white/[0.08] flex items-start gap-4 shadow-md">
              <Lock className="h-6 w-6 text-brand-primary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                Need to correct a misspelled name or update class section? Per <strong>Rule §3.3</strong>, student identity modifications require two-person integrity approval from the faculty co-admin. You can file an audited request via the <strong className="text-brand-secondary">Admin Hub</strong>.
              </p>
            </div>
          </motion.section>
        )}

        {/* Tab 2: Connected Adapters */}
        {activeTab === "adapters" && (
          <motion.section
            role="tabpanel"
            id="settings-panel-adapters"
            aria-labelledby="settings-tab-adapters"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-white">Connected Adapters</h2>
            <p className="text-sm sm:text-base text-muted -mt-6">
              Test a connection to see live observed data, or disconnect an adapter. Disconnecting is a destructive action and asks for confirmation first.
            </p>

            {/* GitHub Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white">
                    <Github className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">GitHub Developer Adapter</h3>
                    <p className="text-sm text-muted mt-0.5">
                      OAuth v2 • Public Activity Calendar &amp; Commit Timestamp Attributions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.github.connected ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold">
                      Connected (@{currentUser.github.username})
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/25 text-sm font-semibold">
                      Disconnected
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-sm text-muted font-medium block">Tracked repositories</span>
                  <span className="text-xl sm:text-2xl font-bold text-white">4 Course Repos</span>
                  <span className="text-sm text-muted block">Public commits only</span>
                </div>
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-sm text-muted font-medium block">Boundary enforcement</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-400">Sun 23:59:59 IST</span>
                  <span className="text-sm text-muted block">Strict cutoff under Rule §9.7</span>
                </div>
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-sm text-muted font-medium block">Code surveillance</span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-200">0% (Zero Telemetry)</span>
                  <span className="text-sm text-muted block">Timestamps &amp; SHAs only</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={testGitHubAdapter}
                  disabled={testingAdapter === "github"}
                  aria-busy={testingAdapter === "github"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <RotateCw className={`h-4 w-4 text-brand-secondary ${testingAdapter === "github" ? "animate-spin" : ""}`} aria-hidden="true" />
                  <span>{testingAdapter === "github" ? "Querying GitHub…" : "Test GitHub Connection"}</span>
                </button>
                {currentUser.github.connected ? (
                  confirmAction === "disconnect-github" ? (
                    <>
                      <p role="alert" className="text-sm text-rose-300 self-center">Disconnect GitHub? This stops future GitHub syncs until you reconnect.</p>
                      <button
                        type="button"
                        onClick={() => handleDisconnect("github")}
                        className="px-5 py-3 rounded-xl text-sm font-semibold bg-rose-500 text-canvas border border-rose-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                      >
                        Confirm Disconnect
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmAction(null)}
                        className="px-5 py-3 rounded-xl text-sm font-medium bg-surface-raised text-slate-200 border border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmAction("disconnect-github")}
                      className="px-5 py-3 rounded-xl text-sm font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    >
                      Disconnect GitHub Adapter
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => updateConnectedAccount("github", true)}
                    className="px-5 py-3 rounded-xl text-sm font-semibold bg-brand-secondary hover:bg-accent-hover text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    Connect GitHub Account
                  </button>
                )}
              </div>
            </div>

            {/* LeetCode Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-provider-leetcode-brand/10 border border-provider-leetcode-brand/20 text-provider-leetcode-brand">
                    <Code2 className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">LeetCode Telemetry Adapter</h3>
                    <p className="text-sm text-muted mt-0.5">
                      GraphQL Public Profile Scraper • 15-Minute HMAC Bio Verification Challenge
                    </p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm font-semibold">
                  Verified (@{currentUser.leetcode.username})
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" aria-hidden="true" />
                  <span className="text-slate-200 font-medium">Bio Challenge Token: Valid, Active &amp; Cryptographically Signed</span>
                </div>
                <span className="text-sm text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-md border border-brand-primary/20">
                  Hash: 8f4c9a2...39b1
                </span>
              </div>

              <div className="pt-2 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={testHmacChallenge}
                  disabled={testingAdapter === "hmac"}
                  aria-busy={testingAdapter === "hmac"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors border border-white/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <Lock className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                  <span>{testingAdapter === "hmac" ? "Generating…" : "Generate New Challenge"}</span>
                </button>
                <button
                  type="button"
                  onClick={testLeetCodeAdapter}
                  disabled={testingAdapter === "leetcode"}
                  aria-busy={testingAdapter === "leetcode"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors border border-white/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <RotateCw className={`h-4 w-4 text-provider-leetcode-brand ${testingAdapter === "leetcode" ? "animate-spin" : ""}`} aria-hidden="true" />
                  <span>{testingAdapter === "leetcode" ? "Fetching…" : "Query Live Snapshot"}</span>
                </button>
                {confirmAction === "disconnect-leetcode" ? (
                  <>
                    <p role="alert" className="text-sm text-rose-300 self-center">Disconnect LeetCode? This stops future LeetCode syncs until you reconnect.</p>
                    <button
                      type="button"
                      onClick={() => handleDisconnect("leetcode")}
                      className="px-5 py-3 rounded-xl text-sm font-semibold bg-rose-500 text-canvas border border-rose-500/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    >
                      Confirm Disconnect
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction(null)}
                      className="px-5 py-3 rounded-xl text-sm font-medium bg-surface-raised text-slate-200 border border-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmAction("disconnect-leetcode")}
                    className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/25 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    Disconnect LeetCode
                  </button>
                )}
              </div>
            </div>

            {/* HackerRank Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-provider-hackerrank/10 border border-provider-hackerrank/20 text-provider-hackerrank">
                    <Award className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">HackerRank Badges Adapter</h3>
                    <p className="text-sm text-muted mt-0.5">
                      Domain Stars &amp; Certifications • Display Only (Excluded from Weekly Competition)
                    </p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 text-sm font-semibold">
                  Display only
                </span>
              </div>

              <div className="text-sm sm:text-base text-muted leading-relaxed p-4 rounded-xl bg-surface-raised/50 border border-white/[0.08]">
                Rule §4.2 Guarantee: Cumulative badges on HackerRank do not convey timestamped weekly deltas and are held strictly for profile display.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={testHackerRankAdapter}
                  disabled={testingAdapter === "hackerrank"}
                  aria-busy={testingAdapter === "hackerrank"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors border border-white/10 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <RotateCw className={`h-4 w-4 text-provider-hackerrank ${testingAdapter === "hackerrank" ? "animate-spin" : ""}`} aria-hidden="true" />
                  <span>{testingAdapter === "hackerrank" ? "Querying…" : "Verify HackerRank Profile"}</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* Tab 3: Privacy & Visibility */}
        {activeTab === "privacy" && (
          <motion.section
            role="tabpanel"
            id="settings-panel-privacy"
            aria-labelledby="settings-tab-privacy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-8 shadow-xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Telemetry Visibility Controls</h2>
                <p className="text-sm sm:text-base text-muted mt-1">
                  Choose how your rankings and activity are presented to classmates across class leaderboards and discovery searches.
                </p>
              </div>

              {/* Full Policy Link Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-raised border border-brand-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                    <Shield className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">Official Cohort Privacy &amp; Data Governance Policy</div>
                    <div className="text-sm text-muted">Read our non-surveillance pledge, telemetry boundaries, and rights under Rule §11.</div>
                  </div>
                </div>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/10 transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                >
                  <span>Read Policy</span>
                  <ArrowRight className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
                </Link>
              </div>

              {/* Leaderboard visibility mode */}
              <fieldset className="space-y-4">
                <legend className="block text-sm sm:text-base font-semibold text-white pb-2">
                  Leaderboard Identity Tier
                </legend>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="radiogroup" aria-label="Leaderboard identity tier">
                  {[
                    {
                      id: "public",
                      title: "Public Full Name",
                      desc: "Show full student legal name & roll number on class board."
                    },
                    {
                      id: "handle_only",
                      title: "Handle Only",
                      desc: "Mask legal name and display only verified GitHub handle."
                    },
                    {
                      id: "anonymous",
                      title: "Anonymous Candidate",
                      desc: "Display as 'Candidate #42' with private ranking visible only to you."
                    }
                  ].map((tier) => {
                    const selected = visibility === tier.id;
                    return (
                      <button
                        key={tier.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => {
                          setVisibility(tier.id as typeof visibility);
                          setSaveError(null);
                        }}
                        className={`p-5 rounded-2xl text-left border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                          selected
                            ? "bg-surface-raised border-brand-primary ring-1 ring-brand-primary"
                            : "bg-surface border-white/10 hover:border-white/25"
                        }`}
                      >
                        <span className="text-base font-bold text-white flex items-center gap-2">
                          {selected && <CheckCircle2 className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />}
                          {tier.title}
                        </span>
                        <span className="text-sm text-muted mt-2 leading-relaxed block">{tier.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Discovery Toggle */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <label htmlFor="setting-discovery" className="text-base font-bold text-white block">Semantic Peer Discovery Listing</label>
                  <p id="setting-discovery-help" className="text-sm text-muted max-w-2xl leading-relaxed">
                    Allow classmates to discover your profile in <code className="text-brand-secondary">/search</code> using verified capabilities &amp; explicit source manifests.
                  </p>
                </div>

                <input
                  id="setting-discovery"
                  type="checkbox"
                  checked={publicDiscovery}
                  onChange={(e) => setPublicDiscovery(e.target.checked)}
                  aria-describedby="setting-discovery-help"
                  className="w-5 h-5 rounded accent-brand-secondary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shrink-0"
                />
              </div>

              {/* AI Recap Toggle */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-base font-bold text-white block">Weekly AI Developer Recap Synthesis</span>
                  <p className="text-sm text-muted max-w-2xl leading-relaxed">
                    Generate an objective, non-judgmental natural language summary of your weekly commit and problem-solving velocity.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRecapPref(recapPref === "ai" ? "deterministic" : "ai")}
                  aria-pressed={recapPref === "ai"}
                  aria-label={`AI recap synthesis: ${recapPref === "ai" ? "enabled" : "disabled"}. Activate to toggle.`}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${
                    recapPref === "ai"
                      ? "bg-brand-primary/10 text-brand-primary border-brand-primary/30"
                      : "bg-surface-raised text-muted border-white/10"
                  }`}
                >
                  {recapPref === "ai" ? "AI Synthesis Enabled" : "Deterministic Only"}
                </button>
              </div>

              {/* Dispute Notifications Toggle */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <label htmlFor="setting-dispute" className="text-base font-bold text-white block">Dispute &amp; Recourse Notifications</label>
                  <p id="setting-dispute-help" className="text-sm text-muted max-w-2xl leading-relaxed">
                    Receive immediate toast and notification alerts whenever a Rule §9.7 dispute involving your metrics is submitted or adjudicated.
                  </p>
                </div>

                <input
                  id="setting-dispute"
                  type="checkbox"
                  checked={notifyDispute}
                  onChange={(e) => setNotifyDispute(e.target.checked)}
                  aria-describedby="setting-dispute-help"
                  className="w-5 h-5 rounded accent-brand-secondary cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary shrink-0"
                />
              </div>

              {saveError && (
                <div role="alert" className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-sm text-amber-200 flex items-start gap-2.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="leading-relaxed">{saveError}</p>
                </div>
              )}

              <div className="pt-6 border-t border-white/[0.08] flex justify-end">
                <button
                  type="button"
                  onClick={handleSavePrivacy}
                  disabled={isSaving}
                  aria-busy={isSaving}
                  className="px-8 py-3.5 rounded-xl bg-brand-secondary hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base flex items-center gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {isSaving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> : <Save className="h-5 w-5" aria-hidden="true" />}
                  <span>{isSaving ? "Saving…" : "Save Privacy Preferences"}</span>
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* Tab 4: Data & Audits */}
        {activeTab === "data" && (
          <motion.section
            role="tabpanel"
            id="settings-panel-data"
            aria-labelledby="settings-tab-data"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Data Sovereignty &amp; Verifiable Exports</h2>
                <p className="text-sm sm:text-base text-muted mt-1 max-w-3xl leading-relaxed">
                  Per Rule §11, all observations made on this platform are owned by the cohort. Export your raw telemetry logs or download the official verified class standings at any time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Export Telemetry JSON */}
                <div className="p-6 rounded-2xl bg-surface-raised border border-white/10 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
                        <Database className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Full Telemetry Archive</h3>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      Download complete cryptographic observation audit payload including raw timestamps, commit SHAs, LeetCode submission IDs, and HMAC signatures as a structured JSON bundle.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={exportTelemetryJSON}
                    className="w-full py-3.5 rounded-xl bg-surface hover:bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                  >
                    <FileDown className="h-4 w-4 text-brand-primary" aria-hidden="true" />
                    <span>Download Telemetry JSON</span>
                  </button>
                </div>

                {/* Export Leaderboard CSV */}
                <div className="p-6 rounded-2xl bg-surface-raised border border-white/10 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <FileDown className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <h3 className="text-lg font-bold text-white">Official Class Standings</h3>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      Download current cohort standings, verified active days, retrieval coverage percentages, and audit status flags formatted as a standard RFC 4180 CSV spreadsheet.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={exportLeaderboardCSV}
                    className="w-full py-3.5 rounded-xl bg-surface hover:bg-white/10 border border-white/10 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <FileDown className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                    <span>Download Leaderboard CSV</span>
                  </button>
                </div>
              </div>

              {/* Cache Purge Card */}
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                <div className="space-y-1">
                  <div className="text-base font-bold text-rose-300 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                    <span>Purge Client-Side Cache</span>
                  </div>
                  <p className="text-sm text-muted max-w-xl">
                    Clear local storage cache and force a complete resynchronization with the provider adapters on your next crawl.
                  </p>
                </div>

                {confirmAction === "purge-cache" ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <p role="alert" className="text-sm text-rose-300">Purge cache now? This cannot be undone.</p>
                    <button
                      type="button"
                      onClick={handlePurgeCache}
                      className="px-5 py-3 rounded-xl bg-rose-500 text-canvas text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Confirm Purge
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmAction(null)}
                      className="px-5 py-3 rounded-xl bg-surface-raised text-slate-200 border border-white/10 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmAction("purge-cache")}
                    className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-semibold transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Purge Cache
                  </button>
                )}
              </div>
            </div>
          </motion.section>
        )}
      </main>
    </div>
  );
}
