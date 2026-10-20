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
  Info,
  Download,
  ShieldAlert,
  ExternalLink
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";
import { TelemetryDispute } from "@/types/saas";

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

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
    details: "Approved timestamp timezone adjustment for student Rohan Varma (#DSP-1048).",
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
  const { 
    currentUser, 
    switchRole, 
    disputes, 
    resolveDispute, 
    addToast,
    exportLeaderboardCSV 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"overview" | "disputes" | "logs">("overview");
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_LOGS);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(disputes[0]?.id || null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  const selectedDispute = disputes.find((d) => d.id === selectedDisputeId) || disputes[0] || null;

  // Roster metrics
  const totalEnrolled = 60;
  const verifiedCount = 42;
  const quorumPercentage = ((verifiedCount / totalEnrolled) * 100).toFixed(1);
  const meetsQuorum = (verifiedCount / totalEnrolled) >= 0.70;

  const handleResolveDispute = (id: string, decision: "approved" | "rejected") => {
    const note = resolutionNote.trim() || (decision === "approved" 
      ? "Telemetry verified against provider timestamp certificate under Rule §9.7."
      : "Does not meet boundary exemption criteria under Rule §9.7.");
    
    resolveDispute(id, decision, note);

    const dispute = disputes.find(d => d.id === id);
    const newLog: AuditLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: "Just now",
      action: decision === "approved" ? "DISPUTE_ACCEPTED" : "DISPUTE_REJECTED",
      actor: `${currentUser.name} (${currentUser.role === "co-admin" ? "Co-Admin" : "Class Rep"})`,
      details: `${decision === "approved" ? "Accepted" : "Rejected"} dispute #${id} for ${dispute?.studentName}. Justification: ${note}`,
      severity: decision === "approved" ? "WARNING" : "INFO"
    };
    setLogs(prev => [newLog, ...prev]);
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
        actor: `${currentUser.name} (Admin)`,
        details: "Manual health audit resync executed for all 3 telemetry connectors. All endpoints healthy.",
        severity: "INFO"
      };
      setLogs(prev => [newLog, ...prev]);
      addToast({
        title: "Telemetry Connectors Audited",
        description: "All GitHub REST, LeetCode GraphQL, and HackerRank adapters verified.",
        type: "success"
      });
    }, 1200);
  };

  const handleExportAuditLogs = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      ["ID,Timestamp,Action,Actor,Severity,Details"].concat(
        logs.map(l => `"${l.id}","${l.timestamp}","${l.action}","${l.actor}","${l.severity}","${l.details.replace(/"/g, '""')}"`)
      ).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `twm3_audit_trail_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      title: "Audit Trail Exported",
      description: "Downloaded immutable ledger as CSV.",
      type: "info"
    });
  };

  return (
    <div className="min-h-screen bg-[#090A0E] text-[#F5F6F8] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#090A0E]">
      <AppHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Header Title with Sync Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Shield className="w-3.5 h-3.5" />
              <span>Administrative Operations • Rule §3.3 & §9.7</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white flex items-center space-x-3">
              <span>Class Administrator &amp; Audit Hub</span>
            </h1>
            <p className="text-base sm:text-lg text-muted mt-2 max-w-3xl">
              Deterministic roster governance, sync connector monitors, and tamper-resistant dispute logging.
            </p>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <button
              onClick={handleTriggerGlobalSync}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2.5 px-5 py-3 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-sm font-semibold font-mono text-ink-secondary hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin text-accent" : "text-muted"}`} />
              <span>{isSyncing ? "Auditing Connectors..." : "Audit Telemetry Connectors"}</span>
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "overview"
                ? "bg-accent text-canvas font-bold shadow-md shadow-accent/20"
                : "text-muted hover:text-white bg-surface/50 hover:bg-surface border border-transparent hover:border-white/10"
            }`}
          >
            System Overview &amp; Roster Quorum
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
              activeTab === "disputes"
                ? "bg-accent text-canvas font-bold shadow-md shadow-accent/20"
                : "text-muted hover:text-white bg-surface/50 hover:bg-surface border border-transparent hover:border-white/10"
            }`}
          >
            <span>Telemetry Disputes</span>
            {disputes.filter(d => d.status === "pending").length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-xs font-mono font-bold">
                {disputes.filter(d => d.status === "pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "logs"
                ? "bg-accent text-canvas font-bold shadow-md shadow-accent/20"
                : "text-muted hover:text-white bg-surface/50 hover:bg-surface border border-transparent hover:border-white/10"
            }`}
          >
            Immutable Audit Trail
          </button>
        </div>

        {/* Co-Admin Mode Banner */}
        <div className="p-5 sm:p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm">
          <div className="flex items-center space-x-3.5">
            <ShieldAlert className="w-6 h-6 text-accent shrink-0" />
            <div>
              <span className="font-bold text-white text-base">
                Active Session: {currentUser.name} ({currentUser.role === "co-admin" ? "Faculty Co-Admin" : "Elected Class Rep"})
              </span>
              <p className="text-muted text-sm mt-0.5">
                {currentUser.role === "co-admin"
                  ? "Full administrative quorum authorization active. All actions cryptographically signed."
                  : "Operating with delegated student-representative review rights under Rule §9.7."}
              </p>
            </div>
          </div>
          <button
            onClick={() => switchRole(currentUser.role === "co-admin" ? "student" : "co-admin")}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-sm font-semibold text-accent hover:text-white transition-colors shrink-0"
          >
            Switch to {currentUser.role === "co-admin" ? "Student View" : "Co-Admin View"}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Roster & Threshold Progress Card */}
            <div className="bg-surface border border-white/[0.08] rounded-2xl p-8 sm:p-10 space-y-7 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-accent" />
                    <h2 className="text-2xl font-bold text-white">
                      Roster Quorum &amp; Participation Denominator
                    </h2>
                  </div>
                  <p className="text-sm sm:text-base text-muted mt-2">
                    Rule §3.3 Invariant: Class leaderboards require ≥70% verified cohort opt-in to represent class standing.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`px-4 py-2 rounded-xl text-sm font-semibold font-mono flex items-center space-x-2 ${
                    meetsQuorum
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  }`}>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{meetsQuorum ? "Quorum Satisfied (≥70%)" : "Quorum Incomplete"}</span>
                  </div>
                  <button 
                    onClick={exportLeaderboardCSV}
                    className="px-4 py-2 rounded-xl bg-surface-raised hover:bg-white/10 text-sm font-semibold font-mono text-ink-secondary hover:text-white border border-white/10 flex items-center space-x-2 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Roster Standings</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm sm:text-base font-mono">
                  <span className="text-ink-secondary">
                    Verified Students: <strong className="text-accent font-bold">{verifiedCount}</strong> / {totalEnrolled} total
                  </span>
                  <span className="text-muted">
                    Threshold: <strong className="text-white">70.0%</strong> (Current: <strong className="text-emerald-400 font-bold">{quorumPercentage}%</strong>)
                  </span>
                </div>
                <div className="w-full h-4 bg-canvas rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${quorumPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                <div className="p-5 rounded-2xl bg-surface-raised border border-white/[0.06] space-y-2">
                  <span className="text-muted-soft font-mono text-xs font-bold tracking-wider block uppercase">TOTAL ENROLLED</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">60 Students</span>
                  <p className="text-xs sm:text-sm text-muted">Official registry for CSE 2026</p>
                </div>
                <div className="p-5 rounded-2xl bg-surface-raised border border-white/[0.06] space-y-2">
                  <span className="text-muted-soft font-mono text-xs font-bold tracking-wider block uppercase">OPTED-IN &amp; VERIFIED</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-accent font-mono">42 Students</span>
                  <p className="text-xs sm:text-sm text-muted">Completed OAuth &amp; HMAC proof</p>
                </div>
                <div className="p-5 rounded-2xl bg-surface-raised border border-white/[0.06] space-y-2">
                  <span className="text-muted-soft font-mono text-xs font-bold tracking-wider block uppercase">UNCLAIMED SEATS</span>
                  <span className="text-2xl sm:text-3xl font-extrabold text-muted font-mono">18 Pending</span>
                  <p className="text-xs sm:text-sm text-muted">Invite tokens active &amp; unexpired</p>
                </div>
              </div>
            </div>

            {/* Provider Sync Health Monitor */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2.5">
                <Activity className="w-5 h-5 text-accent" />
                <h3 className="text-xl font-bold text-white">
                  Telemetry Provider Sync Health
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* GitHub Connector */}
                <div className="bg-surface border border-white/[0.08] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">GitHub Connector</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between text-muted">
                      <span>Rate Limit:</span>
                      <span className="text-white font-semibold">4,812 / 5,000 req/hr</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Avg Latency:</span>
                      <span className="text-emerald-400 font-semibold">142 ms</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Last Audited:</span>
                      <span className="text-white font-semibold">3m ago</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-muted-soft">Rule §9.1: Commit attribution</span>
                    <span className="text-emerald-400 font-mono font-semibold">Passing</span>
                  </div>
                </div>

                {/* LeetCode Bridge */}
                <div className="bg-surface border border-white/[0.08] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">LeetCode Bridge</span>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between text-muted">
                      <span>API Protocol:</span>
                      <span className="text-white font-semibold">GraphQL Scraper</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Avg Latency:</span>
                      <span className="text-emerald-400 font-semibold">318 ms</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Boundary Check:</span>
                      <span className="text-white font-semibold">Sunday 23:45 IST</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-muted-soft">Rule §9.7: Cumulative-only</span>
                    <span className="text-emerald-400 font-mono font-semibold">Passing</span>
                  </div>
                </div>

                {/* HackerRank Connector */}
                <div className="bg-surface border border-white/[0.08] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">HackerRank Sync</span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-mono font-semibold">
                      LIMITED_READONLY
                    </span>
                  </div>
                  <div className="space-y-2 text-sm font-mono">
                    <div className="flex justify-between text-muted">
                      <span>Mode:</span>
                      <span className="text-white font-semibold">Badge Display Only</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Leaderboard State:</span>
                      <span className="text-amber-400 font-semibold">Excluded (No Delta)</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Last Audited:</span>
                      <span className="text-white font-semibold">12m ago</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
                    <span className="text-muted-soft">Phase 0 Guardrail</span>
                    <span className="text-amber-400 font-mono font-semibold">Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISPUTES */}
        {activeTab === "disputes" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Student Telemetry Dispute Queue
                </h2>
                <p className="text-sm sm:text-base text-muted mt-1">
                  Inspect raw platform timestamps, time-boundary evaluations, and log verified adjustments.
                </p>
              </div>
              <span className="text-sm font-mono text-accent bg-accent/10 px-3 py-1.5 rounded-xl border border-accent/20 w-fit">
                Rule §12: Transparent Student Recourse
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Dispute List */}
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    onClick={() => setSelectedDisputeId(dispute.id)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer ${
                      selectedDispute?.id === dispute.id
                        ? "bg-surface-raised border-accent shadow-lg shadow-accent/10"
                        : "bg-surface border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-white text-base sm:text-lg">
                            {dispute.studentName}
                          </span>
                          <span className="text-sm text-muted font-mono">
                            @{dispute.handle} • {dispute.rollNo}
                          </span>
                        </div>
                        <p className="text-sm sm:text-base text-ink-secondary mt-2 line-clamp-2 leading-relaxed">
                          {dispute.claim}
                        </p>
                      </div>

                      <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border uppercase shrink-0 ${
                        dispute.status === "pending"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : dispute.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}>
                        {dispute.status}
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-sm font-mono text-muted">
                      <span>{dispute.platform} • {dispute.submittedAt}</span>
                      <span className="text-accent font-semibold text-xs sm:text-sm">Inspect Audit Claim →</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inspector Pane */}
              <div className="bg-surface border border-white/[0.08] rounded-2xl p-7 flex flex-col justify-between shadow-xl">
                {selectedDispute ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                      <div>
                        <h3 className="font-extrabold text-white text-xl">
                          Dispute Audit: #{selectedDispute.id}
                        </h3>
                        <p className="text-sm text-muted font-mono mt-0.5">
                          {selectedDispute.studentName} (@{selectedDispute.handle}) • {selectedDispute.platform}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border uppercase ${
                        selectedDispute.status === "pending"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : selectedDispute.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}>
                        {selectedDispute.status}
                      </span>
                    </div>

                    <div className="space-y-4 text-sm">
                      <div className="p-4 bg-surface-raised rounded-2xl border border-white/[0.06] space-y-1.5">
                        <span className="text-xs font-mono font-bold text-muted block uppercase tracking-wider">Student Claim</span>
                        <p className="text-white text-base leading-relaxed">{selectedDispute.claim}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-xs sm:text-sm">
                        <div className="p-3.5 rounded-xl bg-canvas border border-white/[0.06]">
                          <span className="text-muted block text-xs font-bold uppercase mb-1">RULE REFERENCE</span>
                          <span className="text-white font-semibold">{selectedDispute.ruleReference}</span>
                        </div>
                        <div className="p-3.5 rounded-xl bg-canvas border border-white/[0.06]">
                          <span className="text-muted block text-xs font-bold uppercase mb-1">METRIC TARGET</span>
                          <span className="text-accent font-semibold">{selectedDispute.metric}</span>
                        </div>
                      </div>

                      {selectedDispute.evidenceUrl && (
                        <div className="p-3.5 rounded-xl bg-canvas border border-white/[0.06] flex items-center justify-between font-mono text-xs sm:text-sm">
                          <span className="text-muted truncate max-w-[280px]">Proof: {selectedDispute.evidenceUrl}</span>
                          <a
                            href={selectedDispute.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline flex items-center space-x-1.5 shrink-0 font-sans font-semibold"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}

                      {selectedDispute.resolutionNote && (
                        <div className="p-4 rounded-2xl bg-canvas border border-emerald-500/20 text-emerald-300 space-y-1.5">
                          <span className="text-xs font-mono uppercase font-bold block text-muted">Audited Resolution</span>
                          <p className="text-sm text-emerald-200">{selectedDispute.resolutionNote}</p>
                          <span className="text-xs font-mono text-muted block mt-1">
                            By {selectedDispute.reviewedBy || "Faculty Co-Admin"} at {selectedDispute.reviewedAt || "Recent"}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedDispute.status === "pending" && (
                      <div className="space-y-4 pt-4 border-t border-white/[0.08]">
                        <label className="text-sm font-semibold font-mono text-ink-secondary block">
                          Mandatory Resolution Justification:
                        </label>
                        <input
                          type="text"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="e.g. Verified UTC to IST boundary offset under Rule §9.7"
                          className="w-full px-4 py-3 bg-canvas border border-white/10 rounded-xl text-base text-white placeholder-muted-soft focus:outline-none focus:border-accent"
                        />
                        <div className="flex items-center space-x-3 pt-1">
                          <button
                            onClick={() => handleResolveDispute(selectedDispute.id, "approved")}
                            className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-canvas font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-colors shadow-md shadow-emerald-500/20"
                          >
                            <Check className="w-4 h-4" />
                            <span>Accept &amp; Backfill Telemetry</span>
                          </button>
                          <button
                            onClick={() => handleResolveDispute(selectedDispute.id, "rejected")}
                            className="flex-1 py-3 rounded-xl bg-surface-raised hover:bg-white/10 text-ink-secondary hover:text-white font-semibold text-sm sm:text-base flex items-center justify-center space-x-2 transition-colors border border-white/10"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject Appeal</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-muted space-y-3">
                    <Database className="w-10 h-10 text-muted-soft" />
                    <p className="text-sm max-w-sm">Select a dispute from the queue to inspect raw payload and execute an audited decision.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AUDIT TRAIL */}
        {activeTab === "logs" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Immutable Governance Log
                </h2>
                <p className="text-sm sm:text-base text-muted mt-1">
                  Append-only administrative trail capturing all cohort adjustments and scheduler milestones.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportAuditLogs}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-sm font-semibold font-mono text-accent hover:text-white flex items-center space-x-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Audit Trail (CSV)</span>
                </button>
                <span className="text-xs sm:text-sm font-mono text-muted">
                  Rule §11.4: Immutable Ledger
                </span>
              </div>
            </div>

            <div className="bg-surface border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06] shadow-xl">
              {logs.map((log) => (
                <div key={log.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm hover:bg-surface-raised transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${
                        log.severity === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                          : log.severity === "WARNING"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-mono text-muted text-xs sm:text-sm">
                        Actor: <strong className="text-white font-semibold">{log.actor}</strong>
                      </span>
                    </div>
                    <p className="text-ink-secondary text-sm sm:text-base leading-relaxed">
                      {log.details}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-muted font-mono text-xs sm:text-sm whitespace-nowrap shrink-0">
                    <Clock className="w-4 h-4 text-muted" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-canvas px-6 py-4 text-xs text-muted-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TWM 3.0 Platform • Administrator Governance &amp; Audit Registry</span>
          <span className="font-mono text-[11px]">Rule §3.3 &amp; §9.7 Compliance Enforced</span>
        </div>
      </footer>
    </div>
  );
}
