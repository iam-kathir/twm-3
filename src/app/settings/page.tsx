"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Github,
  Code2,
  Award,
  Shield,
  FileDown,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Lock,
  Eye,
  Sliders,
  Bell,
  Trash2,
  Database,
  ArrowRight
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";

export default function SettingsPage() {
  const {
    currentUser,
    updateUserSettings,
    updateConnectedAccount,
    exportLeaderboardCSV,
    exportTelemetryJSON,
    addToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<"profile" | "adapters" | "privacy" | "data">("profile");

  // Local state for profile and privacy form
  const [visibility, setVisibility] = useState(currentUser.settings.leaderboardVisibility);
  const [recapPref, setRecapPref] = useState(currentUser.settings.recapPreference);
  const [publicDiscovery, setPublicDiscovery] = useState(currentUser.settings.publicDiscovery);
  const [notifyDispute, setNotifyDispute] = useState(currentUser.settings.notifyOnDispute);
  const [notifyRecap, setNotifyRecap] = useState(currentUser.settings.notifyOnWeeklyRecap);
  const [testingAdapter, setTestingAdapter] = useState<string | null>(null);

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

  const handleSavePrivacy = () => {
    updateUserSettings({
      leaderboardVisibility: visibility,
      recapPreference: recapPref,
      publicDiscovery,
      notifyOnDispute: notifyDispute,
      notifyOnWeeklyRecap: notifyRecap
    });
  };

  const handlePurgeCache = () => {
    try {
      localStorage.removeItem("twm_user_profile");
      localStorage.removeItem("twm_disputes");
      addToast({
        title: "Telemetry Cache Cleared",
        description: "Local cache purged. Fresh values will be fetched from provider adapters.",
        type: "info"
      });
    } catch {}
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-accent selection:text-canvas">
      <AppHeader />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Title & Description Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-xs sm:text-sm font-mono font-semibold text-accent">
            <span>PLATFORM SETTINGS</span>
            <span>•</span>
            <span>RULE §10.3 COMPLIANT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Account &amp; Telemetry Preferences
          </h1>
          <p className="text-base sm:text-lg text-muted max-w-3xl leading-relaxed">
            Manage your verified provider adapters, privacy visibility tiers, cohort roster credentials, and export verifiable observation artifacts.
          </p>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center gap-2 sm:gap-3 border-b border-white/[0.08] pb-4 overflow-x-auto">
          {[
            { id: "profile", label: "Profile & Roster", icon: User },
            { id: "adapters", label: "Connected Adapters", icon: Github },
            { id: "privacy", label: "Privacy & Visibility", icon: Eye },
            { id: "data", label: "Data & Audits", icon: FileDown }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm sm:text-base font-semibold transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-surface-raised text-white border border-accent/40 shadow-md"
                    : "text-muted hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${isSelected ? "text-accent" : "text-slate-400"}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: Profile & College Roster */}
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-8 shadow-xl">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-bold text-white">College Roster Identity</h3>
                <p className="text-sm sm:text-base text-muted max-w-3xl leading-relaxed">
                  Your academic profile is cryptographically matched with the official institutional class enrollment roster. Roll numbers and degrees are immutable under Rule §3.3.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-ink-secondary">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg font-mono text-white cursor-not-allowed shadow-inner"
                  />
                  <span className="text-xs text-muted block">Verified from institutional registrar records</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-ink-secondary">
                    Registration / Roll Number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.rollNo}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg font-mono text-accent cursor-not-allowed shadow-inner font-bold"
                  />
                  <span className="text-xs text-muted block">Immutable cohort participant index</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-ink-secondary">
                    Class Section &amp; Academic Program
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.classSection}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg font-mono text-white cursor-not-allowed shadow-inner"
                  />
                  <span className="text-xs text-muted block">Cohort denominator quorum: 60 enrolled students</span>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-ink-secondary">
                    Institutional Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full px-4 py-3.5 rounded-xl bg-surface-raised border border-white/10 text-base sm:text-lg font-mono text-white cursor-not-allowed shadow-inner"
                  />
                  <span className="text-xs text-muted block">Single sign-on identifier</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-mono">
                <span className="text-muted">Roster Verification Quorum:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Cryptographically Signed &amp; Verified by Faculty Co-Admin</span>
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-surface-raised/70 border border-white/[0.08] flex items-start gap-4 shadow-md">
              <Lock className="h-6 w-6 text-accent shrink-0 mt-0.5" />
              <div className="text-sm sm:text-base text-ink-secondary leading-relaxed">
                Need to correct a misspelled name or update class section? Per <strong>Rule §3.3</strong>, student identity modifications require two-person integrity approval from the faculty co-admin. You can file an audited request via the <strong className="text-accent">Admin Hub</strong>.
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Connected Adapters */}
        {activeTab === "adapters" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* GitHub Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-white">
                    <Github className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">GitHub Developer Adapter</h3>
                    <p className="text-sm font-mono text-muted mt-0.5">
                      OAuth v2 • Public Activity Calendar &amp; Commit Timestamp Attributions
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.github.connected ? (
                    <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs sm:text-sm font-mono font-semibold">
                      CONNECTED (@{currentUser.github.username})
                    </span>
                  ) : (
                    <span className="px-3.5 py-1.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs sm:text-sm font-mono font-semibold">
                      DISCONNECTED
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-xs font-mono text-muted block uppercase">TRACKED REPOSITORIES</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-white">4 Course Repos</span>
                  <span className="text-xs text-muted-soft block">Public commits only</span>
                </div>
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-xs font-mono text-muted block uppercase">BOUNDARY ENFORCEMENT</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">Sun 23:59:59 IST</span>
                  <span className="text-xs text-muted-soft block">Strict cutoff under Rule §9.7</span>
                </div>
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-xs font-mono text-muted block uppercase">CODE SURVEILLANCE</span>
                  <span className="text-xl sm:text-2xl font-bold font-mono text-slate-300">0% (Zero Telemetry)</span>
                  <span className="text-xs text-muted-soft block">Timestamps &amp; SHAs only</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap justify-end gap-3">
                <button
                  onClick={testGitHubAdapter}
                  disabled={testingAdapter === "github"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-mono transition-colors border border-white/10 font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <RotateCw className={`h-4 w-4 text-accent ${testingAdapter === "github" ? "animate-spin" : ""}`} />
                  <span>{testingAdapter === "github" ? "Querying GitHub..." : "Test GitHub Connection"}</span>
                </button>
                <button
                  onClick={() => updateConnectedAccount("github", !currentUser.github.connected)}
                  className={`px-5 py-3 rounded-xl text-sm font-mono font-semibold transition-all ${
                    currentUser.github.connected
                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                      : "bg-accent hover:bg-emerald-400 text-canvas font-bold shadow-lg"
                  }`}
                >
                  {currentUser.github.connected ? "Disconnect GitHub Adapter" : "Connect GitHub Account"}
                </button>
              </div>
            </div>

            {/* LeetCode Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-provider-leetcode-brand/10 border border-provider-leetcode-brand/20 text-provider-leetcode-brand">
                    <Code2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">LeetCode Telemetry Adapter</h3>
                    <p className="text-sm font-mono text-muted mt-0.5">
                      GraphQL Public Profile Scraper • 15-Minute HMAC Bio Verification Challenge
                    </p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs sm:text-sm font-mono font-semibold">
                  HMAC_VERIFIED (@{currentUser.leetcode.username})
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-mono">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span className="text-slate-200 font-medium">Bio Challenge Token: Valid, Active &amp; Cryptographically Signed</span>
                </div>
                <span className="text-xs font-mono text-accent bg-accent/10 px-3 py-1 rounded-md border border-accent/20">
                  Hash: 8f4c9a2...39b1
                </span>
              </div>

              <div className="pt-2 flex flex-wrap justify-end gap-3">
                <button
                  onClick={testHmacChallenge}
                  disabled={testingAdapter === "hmac"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-mono transition-colors border border-white/10 font-medium flex items-center gap-2"
                >
                  <Lock className="h-4 w-4 text-accent" />
                  <span>{testingAdapter === "hmac" ? "Generating..." : "Generate New Challenge"}</span>
                </button>
                <button
                  onClick={testLeetCodeAdapter}
                  disabled={testingAdapter === "leetcode"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-mono transition-colors border border-white/10 font-medium flex items-center gap-2"
                >
                  <RotateCw className={`h-4 w-4 text-amber-400 ${testingAdapter === "leetcode" ? "animate-spin" : ""}`} />
                  <span>{testingAdapter === "leetcode" ? "Fetching..." : "Query Live Snapshot"}</span>
                </button>
                <button
                  onClick={() => updateConnectedAccount("leetcode", !currentUser.leetcode.connected)}
                  className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-sm font-mono transition-colors font-medium"
                >
                  Disconnect LeetCode
                </button>
              </div>
            </div>

            {/* HackerRank Card */}
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-provider-hackerrank/10 border border-provider-hackerrank/20 text-provider-hackerrank">
                    <Award className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">HackerRank Badges Adapter</h3>
                    <p className="text-sm font-mono text-muted mt-0.5">
                      Domain Stars &amp; Certifications • Display Only (Excluded from Weekly Competition)
                    </p>
                  </div>
                </div>

                <span className="px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs sm:text-sm font-mono font-semibold">
                  STATUS: DISPLAY_ONLY
                </span>
              </div>

              <div className="text-sm sm:text-base font-mono text-muted leading-relaxed p-4 rounded-xl bg-surface-raised/50 border border-white/5">
                Rule §4.2 Guarantee: Cumulative badges on HackerRank do not convey timestamped weekly deltas and are held strictly for profile display.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={testHackerRankAdapter}
                  disabled={testingAdapter === "hackerrank"}
                  className="px-5 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-slate-200 text-sm font-mono transition-colors border border-white/10 font-medium flex items-center gap-2"
                >
                  <RotateCw className={`h-4 w-4 text-emerald-400 ${testingAdapter === "hackerrank" ? "animate-spin" : ""}`} />
                  <span>{testingAdapter === "hackerrank" ? "Querying..." : "Verify HackerRank Profile"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Privacy & Visibility */}
        {activeTab === "privacy" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-8 shadow-xl">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Telemetry Visibility Controls</h3>
                <p className="text-sm sm:text-base text-muted mt-1">
                  Choose how your rankings and activity are presented to classmates across class leaderboards and discovery searches.
                </p>
              </div>

              {/* Full Policy Link Banner */}
              <div className="p-4 sm:p-5 rounded-2xl bg-surface-raised border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-accent">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-semibold text-white">Official Cohort Privacy &amp; Data Governance Policy</div>
                    <div className="text-xs sm:text-sm text-muted">Read our non-surveillance pledge, telemetry boundaries, and rights under Rule §11.</div>
                  </div>
                </div>
                <Link
                  href="/privacy"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono text-xs font-semibold border border-white/10 transition-colors shrink-0"
                >
                  <span>Read Policy</span>
                  <ArrowRight className="h-4 w-4 text-accent" />
                </Link>
              </div>

              {/* Leaderboard visibility mode */}
              <div className="space-y-4">
                <label className="block text-sm sm:text-base font-semibold text-white font-mono">
                  Leaderboard Identity Tier
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setVisibility(tier.id as any)}
                      className={`p-5 rounded-2xl text-left border transition-all ${
                        visibility === tier.id
                          ? "bg-surface-raised border-accent shadow-md ring-1 ring-accent"
                          : "bg-surface border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-base font-bold text-white font-sans">{tier.title}</div>
                      <div className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discovery Toggle */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-base font-bold text-white">Semantic Peer Discovery Listing</div>
                  <div className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
                    Allow classmates to discover your profile in `/search` using verified capabilities &amp; explicit source manifests.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={publicDiscovery}
                  onChange={(e) => setPublicDiscovery(e.target.checked)}
                  className="w-5 h-5 rounded accent-accent cursor-pointer"
                />
              </div>

              {/* AI Recap Toggle */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-base font-bold text-white">Weekly AI Developer Recap Synthesis</div>
                  <div className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
                    Generate an objective, non-judgmental natural language summary of your weekly commit and problem-solving velocity.
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-sm">
                  <button
                    onClick={() => setRecapPref(recapPref === "ai" ? "deterministic" : "ai")}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                      recapPref === "ai"
                        ? "bg-accent/10 text-accent border-accent/30"
                        : "bg-surface-raised text-muted border-white/10"
                    }`}
                  >
                    {recapPref === "ai" ? "AI Synthesis Enabled" : "Deterministic Only"}
                  </button>
                </div>
              </div>

              {/* Dispute Notifications Toggle */}
              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-base font-bold text-white">Dispute &amp; Recourse Notifications</div>
                  <div className="text-xs sm:text-sm text-muted max-w-2xl leading-relaxed">
                    Receive immediate toast and notification alerts whenever a Rule §9.7 dispute involving your metrics is submitted or adjudicated.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={notifyDispute}
                  onChange={(e) => setNotifyDispute(e.target.checked)}
                  className="w-5 h-5 rounded accent-accent cursor-pointer"
                />
              </div>

              <div className="pt-6 border-t border-white/[0.08] flex justify-end">
                <button
                  onClick={handleSavePrivacy}
                  className="px-8 py-3.5 rounded-xl bg-accent hover:bg-emerald-400 text-canvas font-bold text-base flex items-center gap-2.5 transition-all shadow-lg"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Privacy Preferences</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 4: Data & Audits */}
        {activeTab === "data" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-white/10 space-y-6 shadow-xl">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">Data Sovereignty &amp; Verifiable Exports</h3>
                <p className="text-sm sm:text-base text-muted mt-1 max-w-3xl leading-relaxed">
                  Per Rule §11, all observations made on this platform are owned by the cohort. Export your raw telemetry logs or download the official verified class standings at any time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Export Telemetry JSON */}
                <div className="p-6 rounded-2xl bg-surface-raised border border-white/10 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent">
                        <Database className="h-6 w-6" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Full Telemetry Archive</h4>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      Download complete cryptographic observation audit payload including raw timestamps, commit SHAs, LeetCode submission IDs, and HMAC signatures as a structured JSON bundle.
                    </p>
                  </div>

                  <button
                    onClick={exportTelemetryJSON}
                    className="w-full py-3.5 rounded-xl bg-surface hover:bg-white/10 border border-white/10 text-white font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <FileDown className="h-4 w-4 text-accent" />
                    <span>Download Telemetry JSON</span>
                  </button>
                </div>

                {/* Export Leaderboard CSV */}
                <div className="p-6 rounded-2xl bg-surface-raised border border-white/10 flex flex-col justify-between space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <FileDown className="h-6 w-6" />
                      </div>
                      <h4 className="text-lg font-bold text-white">Official Class Standings</h4>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      Download current cohort standings, verified active days, retrieval coverage percentages, and audit status flags formatted as a standard RFC 4180 CSV spreadsheet.
                    </p>
                  </div>

                  <button
                    onClick={exportLeaderboardCSV}
                    className="w-full py-3.5 rounded-xl bg-surface hover:bg-white/10 border border-white/10 text-white font-mono text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <FileDown className="h-4 w-4 text-emerald-400" />
                    <span>Download Leaderboard CSV</span>
                  </button>
                </div>
              </div>

              {/* Cache Purge Card */}
              <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4">
                <div className="space-y-1">
                  <div className="text-base font-bold text-rose-300 flex items-center gap-2">
                    <Trash2 className="h-5 w-5" />
                    <span>Purge Client-Side Cache</span>
                  </div>
                  <p className="text-xs sm:text-sm text-muted max-w-xl">
                    Clear local storage cache and force a complete resynchronization with the provider adapters on your next crawl.
                  </p>
                </div>

                <button
                  onClick={handlePurgeCache}
                  className="px-5 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-sm font-mono font-semibold transition-all shrink-0"
                >
                  Purge Cache
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
