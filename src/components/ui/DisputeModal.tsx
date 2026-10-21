"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, X, Send, Link as LinkIcon, FileText } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function DisputeModal() {
  const { isDisputeModalOpen, closeDisputeModal, addDispute, disputeModalMetric, currentUser } = useApp();

  const [platform, setPlatform] = useState<"GitHub" | "LeetCode" | "HackerRank">("GitHub");
  const [metric, setMetric] = useState<"github_active_days" | "leetcode_delta" | "hackerrank_badge">(
    (disputeModalMetric as any) || "github_active_days"
  );
  const [claim, setClaim] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [ruleReference, setRuleReference] = useState("Rule §9.4: Timezone Normalization (IST 23:59:59)");

  if (!isDisputeModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claim.trim() || !evidenceUrl.trim()) return;

    addDispute({
      studentName: currentUser.name,
      rollNo: currentUser.rollNo,
      handle: currentUser.handle,
      metric,
      platform,
      claim: claim.trim(),
      evidenceUrl: evidenceUrl.trim(),
      ruleReference
    });

    setClaim("");
    setEvidenceUrl("");
    closeDisputeModal();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl bg-surface border border-white/10 p-6 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink font-sans">
                Lodge Telemetry Score Dispute
              </h3>
              <p className="text-xs text-muted font-mono">
                Two-Person Co-Admin Review Queue • Rule §9.7
              </p>
            </div>
          </div>

          <button
            onClick={closeDisputeModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono text-muted mb-1">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-ink focus:border-accent focus:outline-none"
              >
                <option value="GitHub">GitHub</option>
                <option value="LeetCode">LeetCode</option>
                <option value="HackerRank">HackerRank</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-muted mb-1">
                Affected Metric
              </label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-ink focus:border-accent focus:outline-none"
              >
                <option value="github_active_days">Active Contribution Days</option>
                <option value="leetcode_delta">LeetCode Delta</option>
                <option value="hackerrank_badge">HackerRank Badge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-muted mb-1">
              Dispute Rationale &amp; Claim Details
            </label>
            <textarea
              required
              rows={3}
              value={claim}
              onChange={(e) => setClaim(e.target.value)}
              placeholder="e.g. Commit 8f1e pushed at 23:51 IST was recorded in git reflog but omitted from public contribution graph due to default branch merge delay."
              className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs text-ink focus:border-accent focus:outline-none placeholder:text-muted-soft"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-muted mb-1">
              Public Evidence URL
            </label>
            <div className="relative">
              <input
                required
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://github.com/.../commit/... or https://leetcode.com/submissions/..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-ink focus:border-accent focus:outline-none placeholder:text-muted-soft"
              />
              <LinkIcon className="h-3.5 w-3.5 text-muted absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-muted mb-1">
              Governing Rule Clause
            </label>
            <select
              value={ruleReference}
              onChange={(e) => setRuleReference(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface-raised border border-white/10 text-xs font-mono text-ink focus:border-accent focus:outline-none"
            >
              <option value="Rule §9.4: Timezone Normalization (IST 23:59:59)">
                Rule §9.4: Timezone Normalization (IST 23:59:59)
              </option>
              <option value="Rule §9.6: Scraper Latency Grace Window (15m)">
                Rule §9.6: Scraper Latency Grace Window (15m)
              </option>
              <option value="Rule §4.2: Domain Badges Display Only">
                Rule §4.2: Domain Badges Display Only
              </option>
              <option value="Rule §10.3: Grounded in Verified Artifacts">
                Rule §10.3: Grounded in Verified Artifacts
              </option>
            </select>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={closeDisputeModal}
              className="px-4 py-2 rounded-xl text-xs font-mono text-muted hover:text-white hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-canvas text-xs font-mono font-bold transition-all shadow-md active:scale-95"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Submit for Audit Review</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
