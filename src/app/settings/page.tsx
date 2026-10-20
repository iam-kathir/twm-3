"use client";

import React, { useState } from "react";
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
  Bell
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Description */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-mono text-accent mb-1">
            <span>PLATFORM SETTINGS</span>
            <span>•</span>
            <span>RULE §10.3 COMPLIANT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            Account &amp; Telemetry Preferences
          </h1>
          <p className="mt-1 text-sm text-muted">
            Manage your verified provider adapters, privacy visibility tiers, and export verifiable observation artifacts.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4 mb-8 overflow-x-auto">
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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono transition-all whitespace-nowrap ${
                  isSelected
                    ? "bg-surface-raised text-ink font-semibold border border-accent/40 shadow-sm"
                    : "text-muted hover:text-ink hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isSelected ? "text-accent" : "text-slate-500"}`} />
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
            className="space-y-6 max-w-3xl"
          >
            <div className="p-6 rounded-2xl bg-surface border border-white/10 space-y-5">
              <h3 className="text-base font-bold text-ink">College Roster Identity</h3>
              <p className="text-xs text-muted">
                Your profile is cryptographically matched with official class enrollment lists. Roll numbers are immutable under Rule §3.3.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.name}
                    className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-slate-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">Registration / Roll Number</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.rollNo}
                    className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-slate-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">Class Section &amp; Degree</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.classSection}
                    className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-slate-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-muted mb-1">Institutional Email</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.email}
                    className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-slate-300 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-muted">Roster Verification Status:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Verified by Faculty Co-Admin</span>
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised/70 border border-white/[0.06] flex items-start gap-3">
              <Lock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <div className="text-xs text-muted leading-relaxed">
                Need to correct a misspelled name or update class section? Per Rule §3.3, student identity modifications require two-person integrity approval from the faculty co-admin. Please file a ticket from the Admin Hub.
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Connected Adapters */}
        {activeTab === "adapters" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-3xl"
          >
            {/* GitHub Card */}
            <div className="p-6 rounded-2xl bg-surface border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-white">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">GitHub Developer Adapter</h3>
                    <p className="text-xs text-muted font-mono">
                      OAuth v2 • Public Activity Calendar &amp; Commit Boundaries
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentUser.github.connected ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      CONNECTED (@{currentUser.github.username})
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-mono">
                      DISCONNECTED
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface-raised border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-muted block">Tracked Repos</span>
                  <span className="text-base font-bold font-mono text-ink">4 Course Repos</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-raised border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-muted block">Boundary Enforcement</span>
                  <span className="text-base font-bold font-mono text-emerald-400">Sun 23:59 IST</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-raised border border-white/[0.06]">
                  <span className="text-[10px] font-mono text-muted block">Code Surveillance</span>
                  <span className="text-base font-bold font-mono text-slate-300">0% (Timestamps Only)</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => updateConnectedAccount("github", !currentUser.github.connected)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-colors ${
                    currentUser.github.connected
                      ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20"
                      : "bg-accent hover:bg-accent-hover text-canvas font-bold"
                  }`}
                >
                  {currentUser.github.connected ? "Disconnect Adapter" : "Connect GitHub Account"}
                </button>
              </div>
            </div>

            {/* LeetCode Card */}
            <div className="p-6 rounded-2xl bg-surface border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#FFA116]/10 border border-[#FFA116]/20 text-[#FFA116]">
                    <Code2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">LeetCode Telemetry Adapter</h3>
                    <p className="text-xs text-muted font-mono">
                      GraphQL Public Profile Scraper • 15m HMAC Bio Challenge
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                  HMAC_VERIFIED (@{currentUser.leetcode.username})
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-raised border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-slate-300">Bio Challenge Token: Valid &amp; Signed</span>
                </div>
                <span className="text-[10px] text-slate-500">Hash: 8f4c...39b1</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => addToast({
                    title: "HMAC Challenge Verified",
                    description: "Re-queried LeetCode public bio. Signature matches current student session.",
                    type: "success"
                  })}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-mono transition-colors"
                >
                  Test Challenge Token
                </button>
                <button
                  onClick={() => updateConnectedAccount("leetcode", !currentUser.leetcode.connected)}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-mono transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* HackerRank Card */}
            <div className="p-6 rounded-2xl bg-surface border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#00EA64]/10 border border-[#00EA64]/20 text-[#00EA64]">
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-ink">HackerRank Badges Adapter</h3>
                    <p className="text-xs text-muted font-mono">
                      Domain Stars • Display Only (Excluded from Weekly Competition)
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                  STATUS: DISPLAY_ONLY
                </span>
              </div>

              <div className="text-xs font-mono text-muted leading-relaxed">
                Rule §4.2 Guarantee: Cumulative badges on HackerRank do not convey timestamped weekly deltas and are held strictly for profile display.
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Privacy & Visibility */}
        {activeTab === "privacy" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 max-w-3xl"
          >
            <div className="p-6 rounded-2xl bg-surface border border-white/10 space-y-6">
              <h3 className="text-base font-bold text-ink">Telemetry Visibility Controls</h3>

              {/* Leaderboard visibility mode */}
              <div className="space-y-3">
                <label className="block text-xs font-mono text-muted">
                  Leaderboard Identity Tier
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "public",
                      title: "Public Full Name",
                      desc: "Show full student name & roll number on class board."
                    },
                    {
                      id: "handle_only",
                      title: "Handle Only",
                      desc: "Mask legal name and display only verified GitHub handle."
                    },
                    {
                      id: "anonymous",
                      title: "Anonymous Candidate",
                      desc: "Display as 'Candidate #42' with private ranking."
                    }
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setVisibility(tier.id as any)}
                      className={`p-4 rounded-xl text-left border transition-all ${
                        visibility === tier.id
                          ? "bg-surface-raised border-accent shadow-sm"
                          : "bg-surface border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="text-xs font-bold text-ink font-sans">{tier.title}</div>
                      <div className="text-[11px] text-muted mt-1 leading-snug">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discovery Toggle */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-ink">Semantic Peer Discovery Listing</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Allow classmates to find your profile in `/search` using verified skills &amp; repositories.
                  </div>
                </div>

                <input
                  type="checkbox"
                  checked={publicDiscovery}
                  onChange={(e) => setPublicDiscovery(e.target.checked)}
                  className="w-4 h-4 rounded accent-accent cursor-pointer"
                />
              </div>

              {/* AI Recap Toggle */}
              <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-ink">Weekly AI Developer Recap Synthesis</div>
                  <div className="text-[11px] text-muted mt-0.5">
                    Generate an objective, non-judgmental natural language summary of weekly activity.
                  </div>
                </div>

                <select
                  value={recapPref}
                  onChange={(e) => setRecapPref(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-ink focus:border-accent focus:outline-none"
                >
                  <option value="ai">AI Narrative Synthesis</option>
                  <option value="deterministic">Raw Deterministic Breakdown</option>
                </select>
              </div>

              {/* Notification preferences */}
              <div className="pt-4 border-t border-white/[0.08] space-y-3">
                <div className="text-xs font-mono text-muted">Automated Notifications</div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Sunday 23:59 IST calculation wrap notification</span>
                  <input
                    type="checkbox"
                    checked={notifyRecap}
                    onChange={(e) => setNotifyRecap(e.target.checked)}
                    className="w-4 h-4 rounded accent-accent cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Dispute resolution status alerts</span>
                  <input
                    type="checkbox"
                    checked={notifyDispute}
                    onChange={(e) => setNotifyDispute(e.target.checked)}
                    className="w-4 h-4 rounded accent-accent cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex justify-end">
                <button
                  onClick={handleSavePrivacy}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-canvas text-xs font-mono font-bold transition-all shadow-md active:scale-95"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Save Privacy Settings</span>
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
            className="space-y-6 max-w-3xl"
          >
            <div className="p-6 rounded-2xl bg-surface border border-white/10 space-y-6">
              <div>
                <h3 className="text-base font-bold text-ink">Data Sovereignty &amp; Verification Artifacts</h3>
                <p className="text-xs text-muted mt-1">
                  In compliance with Rule §10.3, students have unencumbered access to their raw telemetry logs and class competition standings.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-ink">Observation Ledger (JSON)</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      Contains raw commit timestamps, LeetCode delta certificates, and HMAC proof records.
                    </div>
                  </div>
                  <button
                    onClick={exportTelemetryJSON}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono font-medium border border-white/10 transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5 text-accent" />
                    <span>Download JSON</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-ink">Class Leaderboard Standings (CSV)</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      Spreadsheet of verified active days, delta counts, and audit statuses for Section A.
                    </div>
                  </div>
                  <button
                    onClick={exportLeaderboardCSV}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono font-medium border border-white/10 transition-colors"
                  >
                    <FileDown className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Download CSV</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-rose-400">Purge Local Browser Cache</div>
                    <div className="text-[11px] text-muted mt-0.5">
                      Wipes local mock overrides, re-authenticates token challenges, and resyncs from adapters.
                    </div>
                  </div>
                  <button
                    onClick={handlePurgeCache}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-mono font-medium border border-rose-500/20 transition-colors"
                  >
                    Purge Cache
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
