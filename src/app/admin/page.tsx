"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  History,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  ChevronRight,
  Database,
  ArrowUpRight,
  Info
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";


interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

interface DisputeItem {
  id: string;
  studentName: string;
  githubHandle: string;
  platform: "GitHub" | "LeetCode";
  reportedIssue: string;
  providerTimestamp: string;
  calculatedPeriod: string;
  status: "PENDING_REVIEW" | "RESOLVED" | "REJECTED";
  rawPayload: string;
}

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: "disp-101",
    studentName: "Sneha Patel",
    githubHandle: "sneha-p",
    platform: "GitHub",
    reportedIssue: "Commit pushed Sunday 23:58 IST attributed to next week",
    providerTimestamp: "2026-10-18T18:28:15Z (UTC)",
    calculatedPeriod: "Sunday 23:58:15 IST (Eligible for Week 42 under Rule §9.7)",
    status: "PENDING_REVIEW",
    rawPayload: JSON.stringify(
      {
        commit_sha: "7f9a2b8e4c1d",
        author: "sneha-p",
        timestamp_utc: "2026-10-18T18:28:15Z",
        calculated_ist: "2026-10-18T23:58:15+05:30",
        boundary_deadline: "2026-10-18T23:59:59+05:30",
        diff_seconds: -104
      },
      null,
      2
    )
  },
  {
    id: "disp-102",
    studentName: "Aditya Kumar",
    githubHandle: "aditya-k",
    platform: "LeetCode",
    reportedIssue: "Weekly delta missed 1 problem closed right before midnight",
    providerTimestamp: "2026-10-18T18:15:00Z (UTC)",
    calculatedPeriod: "Sunday 23:45:00 IST (Boundary observation validated)",
    status: "PENDING_REVIEW",
    rawPayload: JSON.stringify(
      {
        problem_id: 1482,
        slug: "minimum-number-of-days-to-make-m-bouquets",
        submission_time: "2026-10-18T18:15:00Z",
        snapshot_time: "2026-10-18T18:15:30Z",
        status: "Accepted"
      },
      null,
      2
    )
  }
];

const INITIAL_LOGS: AuditLogEntry[] = [
  {
    id: "log-1",
    timestamp: "2026-10-20 00:45 IST",
    action: "ROSTER_VERIFICATION_CHECK",
    actor: "sys_cron_worker",
    details: "Automated denominator check passed (42/60 enrolled, 70% quorum verified).",
    severity: "INFO"
  },
  {
    id: "log-2",
    timestamp: "2026-10-19 23:59 IST",
    action: "WEEKLY_SNAPSHOT_CLOSED",
    actor: "sys_scheduler",
    details: "Week 42 observation window closed at 2026-10-18T23:59:59 IST (Rule §9.7 enforced).",
    severity: "INFO"
  },
  {
    id: "log-3",
    timestamp: "2026-10-19 14:10 IST",
    action: "DISPUTE_RESOLVED",
    actor: "admin_dr_rao",
    details: "Approved timestamp timezone adjustment for student Rohan Varma (#disp-099).",
    severity: "WARNING"
  },
  {
    id: "log-4",
    timestamp: "2026-10-18 09:30 IST",
    action: "COHORT_ROSTER_UPLOAD",
    actor: "admin_dr_rao",
    details: "Uploaded B.Tech CSE Class of 2026 Section A official academic registry (60 records).",
    severity: "INFO"
  }
];

export default function AdminHubPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "disputes" | "logs">("overview");
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // Roster metrics
  const totalEnrolled = 60;
  const verifiedCount = 42;
  const quorumPercentage = ((verifiedCount / totalEnrolled) * 100).toFixed(1);
  const meetsQuorum = (verifiedCount / totalEnrolled) >= 0.70;

  const handleResolveDispute = (id: string, decision: "RESOLVED" | "REJECTED") => {
    setDisputes(prev =>
      prev.map(d => (d.id === id ? { ...d, status: decision } : d))
    );

    const dispute = disputes.find(d => d.id === id);
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: "Just now",
      action: decision === "RESOLVED" ? "DISPUTE_ACCEPTED" : "DISPUTE_REJECTED",
      actor: "admin_current_user",
      details: `${decision === "RESOLVED" ? "Accepted" : "Rejected"} dispute for ${dispute?.studentName}. Note: ${resolutionNote || "Admin reviewed telemetry payload"}`,
      severity: decision === "RESOLVED" ? "WARNING" : "INFO"
    };
    setLogs(prev => [newLog, ...prev]);
    setSelectedDispute(null);
    setResolutionNote("");
  };

  const handleTriggerGlobalSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: "Just now",
        action: "PROVIDER_AUDIT_RESYNC",
        actor: "admin_current_user",
        details: "Manual health audit resync executed for all 3 telemetry connectors.",
        severity: "INFO"
      };
      setLogs(prev => [newLog, ...prev]);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#090A0E] text-[#F5F6F8] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#090A0E]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#090A0E]/90 backdrop-blur-md border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <BrandLogo showLivePulse={true} />

            <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Leaderboards
              </Link>
              <Link
                href="/search"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Discover
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg bg-[#181B23] text-white font-semibold border border-white/10"
              >
                Admin Hub
              </Link>
              <Link
                href="/onboarding"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Preferences
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-mono">
              <Shield className="w-3.5 h-3.5" />
              <span>CO-ADMIN MODE</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#181B23] border border-amber-500/30 flex items-center justify-center text-xs font-semibold text-[#F59E0B]">
              DR
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title with Sync Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#F5F6F8] flex items-center space-x-2.5">
              <span>Class Administrator &amp; Audit Hub</span>
            </h1>
            <p className="text-sm text-[#8D94A5] mt-1">
              Deterministic roster governance, sync connector monitors, and tamper-resistant dispute logging.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleTriggerGlobalSync}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-[#111319] hover:bg-[#181B23] border border-white/10 text-xs font-mono text-[#C8CDD6] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-[#F59E0B]" : "text-[#8D94A5]"}`} />
              <span>{isSyncing ? "Auditing Connectors..." : "Audit Telemetry Connectors"}</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 border-b border-white/[0.06] pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-[#F59E0B] text-[#090A0E] font-bold"
                : "text-[#8D94A5] hover:text-white"
            }`}
          >
            System Overview &amp; Roster Quorum
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === "disputes"
                ? "bg-[#F59E0B] text-[#090A0E] font-bold"
                : "text-[#8D94A5] hover:text-white"
            }`}
          >
            <span>Telemetry Disputes</span>
            {disputes.filter(d => d.status === "PENDING_REVIEW").length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px]">
                {disputes.filter(d => d.status === "PENDING_REVIEW").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === "logs"
                ? "bg-[#F59E0B] text-[#090A0E] font-bold"
                : "text-[#8D94A5] hover:text-white"
            }`}
          >
            Immutable Audit Trail
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Roster & Threshold Progress Card */}
            <div className="bg-[#111319] border border-white/[0.08] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-[#F59E0B]" />
                    <h2 className="text-lg font-bold text-[#F5F6F8]">
                      Roster Quorum &amp; Participation Denominator
                    </h2>
                  </div>
                  <p className="text-xs text-[#8D94A5] mt-1">
                    Rule §3.3 Invariant: Class leaderboards require ≥70% verified cohort opt-in to represent class standing.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-mono flex items-center space-x-1.5 ${
                    meetsQuorum
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{meetsQuorum ? "Quorum Satisfied (≥70%)" : "Quorum Incomplete"}</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-[#181B23] hover:bg-white/10 text-xs font-mono text-[#C8CDD6] border border-white/10 flex items-center space-x-1.5">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Update Roster (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-[#C8CDD6]">
                    Verified Students: <strong className="text-[#F59E0B]">{verifiedCount}</strong> / {totalEnrolled} total
                  </span>
                  <span className="text-[#8D94A5]">
                    Threshold: <strong className="text-white">70.0%</strong> (Current: <strong className="text-emerald-400">{quorumPercentage}%</strong>)
                  </span>
                </div>
                <div className="w-full h-3 bg-[#090A0E] rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${quorumPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#181B23] border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[#636A7E] font-mono text-[11px] block">TOTAL ENROLLED</span>
                  <span className="text-lg font-bold text-[#F5F6F8] font-mono">60 Students</span>
                  <p className="text-[11px] text-[#8D94A5]">Official registry for CSE 2026</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#181B23] border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[#636A7E] font-mono text-[11px] block">OPTED-IN &amp; VERIFIED</span>
                  <span className="text-lg font-bold text-[#F59E0B] font-mono">42 Students</span>
                  <p className="text-[11px] text-[#8D94A5]">Completed OAuth &amp; HMAC proof</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#181B23] border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[#636A7E] font-mono text-[11px] block">UNCLAIMED SEATS</span>
                  <span className="text-lg font-bold text-[#8D94A5] font-mono">18 Pending</span>
                  <p className="text-[11px] text-[#8D94A5]">Invite tokens active &amp; unexpired</p>
                </div>
              </div>
            </div>

            {/* Provider Sync Health Monitor */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-base font-semibold text-[#F5F6F8]">
                  Telemetry Provider Sync Health
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GitHub Connector */}
                <div className="bg-[#111319] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F5F6F8] text-sm">GitHub Connector</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Rate Limit:</span>
                      <span className="text-[#C8CDD6]">4,812 / 5,000 req/hr</span>
                    </div>
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Avg Latency:</span>
                      <span className="text-emerald-400">142 ms</span>
                    </div>
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Last Audited:</span>
                      <span className="text-[#C8CDD6]">3m ago</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[#636A7E]">Rule §9.1: Commit attribution</span>
                    <span className="text-emerald-400 font-mono">Passing</span>
                  </div>
                </div>

                {/* LeetCode Bridge */}
                <div className="bg-[#111319] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F5F6F8] text-sm">LeetCode Bridge</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>API Protocol:</span>
                      <span className="text-[#C8CDD6]">GraphQL Scraper</span>
                    </div>
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Avg Latency:</span>
                      <span className="text-emerald-400">318 ms</span>
                    </div>
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Boundary Check:</span>
                      <span className="text-[#C8CDD6]">Sunday 23:45 IST</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[#636A7E]">Rule §9.7: Cumulative-only</span>
                    <span className="text-emerald-400 font-mono">Passing</span>
                  </div>
                </div>

                {/* HackerRank Connector */}
                <div className="bg-[#111319] border border-white/[0.08] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F5F6F8] text-sm">HackerRank Sync</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                      LIMITED_READONLY
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Mode:</span>
                      <span className="text-[#C8CDD6]">Badge Display Only</span>
                    </div>
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Leaderboard State:</span>
                      <span className="text-amber-400">Excluded (No Delta)</span>
                    </div>
                    <div className="flex justify-between text-[#8D94A5]">
                      <span>Last Audited:</span>
                      <span className="text-[#C8CDD6]">12m ago</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[#636A7E]">Phase 0 Guardrail</span>
                    <span className="text-amber-400 font-mono">Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISPUTES */}
        {activeTab === "disputes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#F5F6F8]">
                  Student Telemetry Dispute Queue
                </h2>
                <p className="text-xs text-[#8D94A5] mt-0.5">
                  Inspect raw platform timestamps, time-boundary evaluations, and log verified adjustments.
                </p>
              </div>
              <span className="text-xs font-mono text-[#8D94A5]">
                Rule §12: Transparent Student Recourse
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dispute List */}
              <div className="space-y-3">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    onClick={() => setSelectedDispute(dispute)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedDispute?.id === dispute.id
                        ? "bg-[#181B23] border-[#F59E0B]"
                        : "bg-[#111319] border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-[#F5F6F8] text-sm">
                            {dispute.studentName}
                          </span>
                          <span className="text-xs text-[#8D94A5] font-mono">
                            @{dispute.githubHandle}
                          </span>
                        </div>
                        <p className="text-xs text-[#C8CDD6] mt-1">
                          {dispute.reportedIssue}
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        dispute.status === "PENDING_REVIEW"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : dispute.status === "RESOLVED"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}>
                        {dispute.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#8D94A5]">
                      <span>Platform: {dispute.platform}</span>
                      <span className="text-[#F59E0B]">Click to Inspect Payload →</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inspector Pane */}
              <div className="bg-[#111319] border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
                {selectedDispute ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <div>
                        <h3 className="font-bold text-[#F5F6F8] text-sm">
                          Dispute Audit: #{selectedDispute.id}
                        </h3>
                        <p className="text-xs text-[#8D94A5] font-mono">
                          {selectedDispute.studentName} ({selectedDispute.platform})
                        </p>
                      </div>
                      <span className="text-xs text-[#F59E0B] font-mono">
                        {selectedDispute.calculatedPeriod}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-mono text-[#8D94A5] block">
                        Raw Provider Payload (Audited):
                      </span>
                      <pre className="p-3 bg-[#090A0E] rounded-xl border border-white/[0.08] font-mono text-[11px] text-[#F59E0B] overflow-x-auto max-h-48">
                        {selectedDispute.rawPayload}
                      </pre>
                    </div>

                    {selectedDispute.status === "PENDING_REVIEW" && (
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-mono text-[#C8CDD6] block">
                          Mandatory Resolution Justification:
                        </label>
                        <input
                          type="text"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="e.g. Verified UTC to IST boundary offset under Rule §9.7"
                          className="w-full px-3 py-2 bg-[#090A0E] border border-white/[0.08] rounded-lg text-xs text-white placeholder-[#636A7E] focus:outline-none focus:border-[#F59E0B]"
                        />
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleResolveDispute(selectedDispute.id, "RESOLVED")}
                            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#090A0E] font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept &amp; Backfill Telemetry</span>
                          </button>
                          <button
                            onClick={() => handleResolveDispute(selectedDispute.id, "REJECTED")}
                            className="flex-1 py-2 rounded-lg bg-[#181B23] hover:bg-white/10 text-[#C8CDD6] font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/10"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject Appeal</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {selectedDispute.status !== "PENDING_REVIEW" && (
                      <div className="p-3 rounded-xl bg-[#090A0E] border border-white/[0.08] text-xs font-mono text-[#8D94A5]">
                        This dispute has been marked as <strong className="text-white">{selectedDispute.status}</strong>. An immutable audit record has been appended to the system log.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-[#8D94A5] space-y-2">
                    <Database className="w-8 h-8 text-[#636A7E]" />
                    <p className="text-xs">Select a dispute from the queue to inspect raw payload and execute an audited decision.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === "logs" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#F5F6F8]">
                  Immutable Governance Log
                </h2>
                <p className="text-xs text-[#8D94A5] mt-0.5">
                  Append-only administrative trail capturing all cohort adjustments and scheduler milestones.
                </p>
              </div>
              <span className="text-xs font-mono text-[#8D94A5]">
                Rule §11.4: Immutable Ledger
              </span>
            </div>

            <div className="bg-[#111319] border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#181B23] transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        log.severity === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                          : log.severity === "WARNING"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-mono text-[#8D94A5] text-[11px]">
                        Actor: <strong className="text-[#C8CDD6]">{log.actor}</strong>
                      </span>
                    </div>
                    <p className="text-[#C8CDD6] text-xs">
                      {log.details}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-[#8D94A5] font-mono text-[11px] whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090A0E] px-6 py-4 text-xs text-[#636A7E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TWM 3.0 Platform • Administrator Governance &amp; Audit Registry</span>
          <span className="font-mono text-[11px]">Rule §3.3 &amp; §9.7 Compliance Enforced</span>
        </div>
      </footer>
    </div>
  );
}
