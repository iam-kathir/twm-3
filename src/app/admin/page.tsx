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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title with Sync Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-ink flex items-center space-x-2.5">
              <span>Class Administrator &amp; Audit Hub</span>
            </h1>
            <p className="text-sm text-muted mt-1">
              Deterministic roster governance, sync connector monitors, and tamper-resistant dispute logging.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleTriggerGlobalSync}
              disabled={isSyncing}
              className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-xs font-mono text-ink-secondary transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-accent" : "text-muted"}`} />
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
                ? "bg-accent text-canvas font-bold"
                : "text-muted hover:text-white"
            }`}
          >
            System Overview &amp; Roster Quorum
          </button>
          <button
            onClick={() => setActiveTab("disputes")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors flex items-center space-x-1.5 ${
              activeTab === "disputes"
                ? "bg-accent text-canvas font-bold"
                : "text-muted hover:text-white"
            }`}
          >
            <span>Telemetry Disputes</span>
            {disputes.filter(d => d.status === "pending").length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center text-[10px]">
                {disputes.filter(d => d.status === "pending").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
              activeTab === "logs"
                ? "bg-accent text-canvas font-bold"
                : "text-muted hover:text-white"
            }`}
          >
            Immutable Audit Trail
          </button>
        </div>

        {/* Co-Admin Mode Banner */}
        <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-accent shrink-0" />
            <div>
              <span className="font-semibold text-white">
                Active Session: {currentUser.name} ({currentUser.role === "co-admin" ? "Faculty Co-Admin" : "Elected Class Rep"})
              </span>
              <p className="text-muted text-[11px]">
                {currentUser.role === "co-admin"
                  ? "Full administrative quorum authorization active. All actions cryptographically signed."
                  : "Operating with delegated student-representative review rights under Rule §9.7."}
              </p>
            </div>
          </div>
          <button
            onClick={() => switchRole(currentUser.role === "co-admin" ? "student" : "co-admin")}
            className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-white/10 text-xs font-mono text-accent transition-colors shrink-0"
          >
            Switch to {currentUser.role === "co-admin" ? "Student View" : "Co-Admin View"}
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Roster & Threshold Progress Card */}
            <div className="bg-surface border border-white/[0.08] rounded-2xl p-6 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-accent" />
                    <h2 className="text-lg font-bold text-ink">
                      Roster Quorum &amp; Participation Denominator
                    </h2>
                  </div>
                  <p className="text-xs text-muted mt-1">
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
                  <button 
                    onClick={exportLeaderboardCSV}
                    className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-white/10 text-xs font-mono text-ink-secondary border border-white/10 flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Roster Standings</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-ink-secondary">
                    Verified Students: <strong className="text-accent">{verifiedCount}</strong> / {totalEnrolled} total
                  </span>
                  <span className="text-muted">
                    Threshold: <strong className="text-white">70.0%</strong> (Current: <strong className="text-emerald-400">{quorumPercentage}%</strong>)
                  </span>
                </div>
                <div className="w-full h-3 bg-canvas rounded-full overflow-hidden p-0.5 border border-white/[0.08]">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${quorumPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] text-xs space-y-1">
                  <span className="text-muted-soft font-mono text-[11px] block">TOTAL ENROLLED</span>
                  <span className="text-lg font-bold text-ink font-mono">60 Students</span>
                  <p className="text-[11px] text-muted">Official registry for CSE 2026</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] text-xs space-y-1">
                  <span className="text-muted-soft font-mono text-[11px] block">OPTED-IN &amp; VERIFIED</span>
                  <span className="text-lg font-bold text-accent font-mono">42 Students</span>
                  <p className="text-[11px] text-muted">Completed OAuth &amp; HMAC proof</p>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] text-xs space-y-1">
                  <span className="text-muted-soft font-mono text-[11px] block">UNCLAIMED SEATS</span>
                  <span className="text-lg font-bold text-muted font-mono">18 Pending</span>
                  <p className="text-[11px] text-muted">Invite tokens active &amp; unexpired</p>
                </div>
              </div>
            </div>

            {/* Provider Sync Health Monitor */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-accent" />
                <h3 className="text-base font-semibold text-ink">
                  Telemetry Provider Sync Health
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* GitHub Connector */}
                <div className="bg-surface border border-white/[0.08] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink text-sm">GitHub Connector</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-muted">
                      <span>Rate Limit:</span>
                      <span className="text-ink-secondary">4,812 / 5,000 req/hr</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Avg Latency:</span>
                      <span className="text-emerald-400">142 ms</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Last Audited:</span>
                      <span className="text-ink-secondary">3m ago</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-muted-soft">Rule §9.1: Commit attribution</span>
                    <span className="text-emerald-400 font-mono">Passing</span>
                  </div>
                </div>

                {/* LeetCode Bridge */}
                <div className="bg-surface border border-white/[0.08] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink text-sm">LeetCode Bridge</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      OPERATIONAL
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-muted">
                      <span>API Protocol:</span>
                      <span className="text-ink-secondary">GraphQL Scraper</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Avg Latency:</span>
                      <span className="text-emerald-400">318 ms</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Boundary Check:</span>
                      <span className="text-ink-secondary">Sunday 23:45 IST</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-muted-soft">Rule §9.7: Cumulative-only</span>
                    <span className="text-emerald-400 font-mono">Passing</span>
                  </div>
                </div>

                {/* HackerRank Connector */}
                <div className="bg-surface border border-white/[0.08] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-ink text-sm">HackerRank Sync</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-mono">
                      LIMITED_READONLY
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-muted">
                      <span>Mode:</span>
                      <span className="text-ink-secondary">Badge Display Only</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Leaderboard State:</span>
                      <span className="text-amber-400">Excluded (No Delta)</span>
                    </div>
                    <div className="flex justify-between text-muted">
                      <span>Last Audited:</span>
                      <span className="text-ink-secondary">12m ago</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-muted-soft">Phase 0 Guardrail</span>
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
                <h2 className="text-lg font-bold text-ink">
                  Student Telemetry Dispute Queue
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Inspect raw platform timestamps, time-boundary evaluations, and log verified adjustments.
                </p>
              </div>
              <span className="text-xs font-mono text-muted">
                Rule §12: Transparent Student Recourse
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dispute List */}
              <div className="space-y-3">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    onClick={() => setSelectedDisputeId(dispute.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedDispute?.id === dispute.id
                        ? "bg-surface-raised border-accent"
                        : "bg-surface border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-ink text-sm">
                            {dispute.studentName}
                          </span>
                          <span className="text-xs text-muted font-mono">
                            @{dispute.handle} • {dispute.rollNo}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary mt-1.5 line-clamp-2">
                          {dispute.claim}
                        </p>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${
                        dispute.status === "pending"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : dispute.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}>
                        {dispute.status}
                      </span>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-muted">
                      <span>{dispute.platform} • {dispute.submittedAt}</span>
                      <span className="text-accent text-[11px]">Inspect Audit Claim →</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inspector Pane */}
              <div className="bg-surface border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
                {selectedDispute ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                      <div>
                        <h3 className="font-bold text-ink text-sm">
                          Dispute Audit: #{selectedDispute.id}
                        </h3>
                        <p className="text-xs text-muted font-mono">
                          {selectedDispute.studentName} (@{selectedDispute.handle}) • {selectedDispute.platform}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${
                        selectedDispute.status === "pending"
                          ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          : selectedDispute.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                      }`}>
                        {selectedDispute.status}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 bg-surface-raised rounded-xl border border-white/[0.06] space-y-1">
                        <span className="text-[11px] font-mono text-muted block uppercase">Student Claim</span>
                        <p className="text-ink-secondary leading-relaxed">{selectedDispute.claim}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                        <div className="p-2.5 rounded-lg bg-canvas border border-white/[0.06]">
                          <span className="text-muted block text-[10px]">RULE REFERENCE</span>
                          <span className="text-white">{selectedDispute.ruleReference}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-canvas border border-white/[0.06]">
                          <span className="text-muted block text-[10px]">METRIC TARGET</span>
                          <span className="text-accent">{selectedDispute.metric}</span>
                        </div>
                      </div>

                      {selectedDispute.evidenceUrl && (
                        <div className="p-2.5 rounded-lg bg-canvas border border-white/[0.06] flex items-center justify-between font-mono text-[11px]">
                          <span className="text-muted truncate max-w-[280px]">Proof: {selectedDispute.evidenceUrl}</span>
                          <a
                            href={selectedDispute.evidenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline flex items-center space-x-1 shrink-0"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {selectedDispute.resolutionNote && (
                        <div className="p-3 rounded-xl bg-canvas border border-emerald-500/20 text-emerald-300 space-y-1">
                          <span className="text-[10px] font-mono uppercase block text-muted">Audited Resolution</span>
                          <p className="text-xs">{selectedDispute.resolutionNote}</p>
                          <span className="text-[10px] font-mono text-muted block">
                            By {selectedDispute.reviewedBy || "Faculty Co-Admin"} at {selectedDispute.reviewedAt || "Recent"}
                          </span>
                        </div>
                      )}
                    </div>

                    {selectedDispute.status === "pending" && (
                      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                        <label className="text-xs font-mono text-ink-secondary block">
                          Mandatory Resolution Justification:
                        </label>
                        <input
                          type="text"
                          value={resolutionNote}
                          onChange={(e) => setResolutionNote(e.target.value)}
                          placeholder="e.g. Verified UTC to IST boundary offset under Rule §9.7"
                          className="w-full px-3 py-2 bg-canvas border border-white/[0.08] rounded-lg text-xs text-white placeholder-muted-soft focus:outline-none focus:border-accent"
                        />
                        <div className="flex items-center space-x-2 pt-1">
                          <button
                            onClick={() => handleResolveDispute(selectedDispute.id, "approved")}
                            className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-canvas font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept &amp; Backfill Telemetry</span>
                          </button>
                          <button
                            onClick={() => handleResolveDispute(selectedDispute.id, "rejected")}
                            className="flex-1 py-2 rounded-lg bg-surface-raised hover:bg-white/10 text-ink-secondary font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors border border-white/10"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Reject Appeal</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-center text-muted space-y-2">
                    <Database className="w-8 h-8 text-muted-soft" />
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-ink">
                  Immutable Governance Log
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Append-only administrative trail capturing all cohort adjustments and scheduler milestones.
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleExportAuditLogs}
                  className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-raised border border-white/10 text-xs font-mono text-accent flex items-center space-x-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Audit Trail (CSV)</span>
                </button>
                <span className="text-xs font-mono text-muted">
                  Rule §11.4: Immutable Ledger
                </span>
              </div>
            </div>

            <div className="bg-surface border border-white/[0.08] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
              {logs.map((log) => (
                <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-surface-raised transition-colors">
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
                      <span className="font-mono text-muted text-[11px]">
                        Actor: <strong className="text-ink-secondary">{log.actor}</strong>
                      </span>
                    </div>
                    <p className="text-ink-secondary text-xs">
                      {log.details}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 text-muted font-mono text-[11px] whitespace-nowrap">
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
      <footer className="border-t border-white/[0.08] bg-canvas px-6 py-4 text-xs text-muted-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TWM 3.0 Platform • Administrator Governance &amp; Audit Registry</span>
          <span className="font-mono text-[11px]">Rule §3.3 &amp; §9.7 Compliance Enforced</span>
        </div>
      </footer>
    </div>
  );
}
