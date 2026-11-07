"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Trophy,
  Flame,
  Bot,
  ListChecks,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import type { DeterministicWeeklyRecap } from "@/lib/recap";
import type { AIRecapResponse } from "@/lib/ai-recap";

export function WeeklyRecapCard() {
  const [activeTab, setActiveTab] = useState<"deterministic" | "ai">("deterministic");
  const [recap, setRecap] = useState<DeterministicWeeklyRecap | null>(null);
  const [aiRecap, setAiRecap] = useState<AIRecapResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const fetchRecap = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/recap");
      const data = await res.json();
      if (!res.ok || !data.success || !data.recap) {
        setLoadError("Weekly recap is UNAVAILABLE right now. No metrics are claimed while telemetry is loading.");
        return;
      }
      setRecap(data.recap);
    } catch {
      setLoadError("Weekly recap is UNAVAILABLE right now. No metrics are claimed while telemetry is loading.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecap();
    // Run once on mount; retry calls fetchRecap explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAiRecap = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/recap");
      const data = await res.json();
      if (!res.ok || !data.executiveSummary) {
        setAiError("Grounded summary is UNAVAILABLE right now. Telemetry facts above are unchanged.");
        return;
      }
      setAiRecap(data);
    } catch {
      setAiError("Grounded summary is UNAVAILABLE right now. Telemetry facts above are unchanged.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleTabChange = (tab: "deterministic" | "ai") => {
    setActiveTab(tab);
    if (tab === "ai" && !aiRecap) {
      loadAiRecap();
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-7 animate-pulse space-y-4" aria-busy="true" aria-label="Loading weekly recap">
        <div className="h-6 w-48 bg-white/10 rounded-lg" />
        <div className="h-20 bg-white/5 rounded-xl" />
        <div className="h-4 w-3/4 bg-white/5 rounded" />
        <p className="text-[13px] text-muted">Loading verified telemetry facts…</p>
      </div>
    );
  }

  if (!recap) {
    return (
      <section aria-label="Weekly recap unavailable" className="rounded-2xl border border-amber-500/30 bg-surface p-6 sm:p-7 space-y-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-400" aria-hidden="true" /> Weekly recap UNAVAILABLE
        </h3>
        <p className="text-sm text-ink-secondary leading-relaxed">{loadError ?? "Weekly recap is UNAVAILABLE right now. No metrics are claimed while telemetry is loading."}</p>
        <button
          type="button"
          onClick={fetchRecap}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-surface-raised px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
        >
          <RefreshCw className="h-4 w-4 text-brand-secondary" aria-hidden="true" /> Retry
        </button>
      </section>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-7 space-y-6 shadow-xl relative overflow-hidden"
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-brand-primary shrink-0" aria-hidden="true" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white font-sans">Weekly Performance Recap</h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-surface-raised border border-white/10 text-muted">
                Week {recap.weekNumber}
              </span>
            </div>
            <p className="text-xs font-mono text-muted mt-0.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted" />
              <span>Closed: {recap.boundaryTimestampIST}</span>
            </p>
          </div>
        </div>

        {/* Mode Selector & Quorum Badge */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tabs */}
          <div role="tablist" aria-label="Recap view" className="flex items-center p-1 rounded-xl bg-surface-raised border border-white/[0.08]">
            <button
              role="tab"
              aria-selected={activeTab === "deterministic"}
              onClick={() => handleTabChange("deterministic")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[13px] font-mono transition-colors ${
                activeTab === "deterministic"
                  ? "bg-brand-secondary text-white font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Telemetry facts</span>
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "ai"}
              onClick={() => handleTabChange("ai")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[13px] font-mono transition-colors ${
                activeTab === "ai"
                  ? "bg-brand-secondary text-white font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <Bot className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Grounded summary</span>
            </button>
          </div>

          {/* Quorum Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border ${
              recap.cohort.meetsQuorum
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/20"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>{recap.cohort.quorumLabel} ({recap.cohort.quorumPercentage}%)</span>
          </span>
        </div>
      </div>

      {/* Tab 1: Deterministic Metrics & Highlights */}
      <AnimatePresence mode="wait">
        {activeTab === "deterministic" ? (
          <motion.div
            key="deterministic"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Student Highlight Metric Cards */}
            {recap.student && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* GitHub Active Days */}
                <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="block text-[13px] font-medium text-muted">GitHub active days</span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-black font-mono text-white tabular-nums">
                      {recap.student.github ? `${recap.student.github.activeDays} / 7` : "UNAVAILABLE"}
                    </span>
                    {recap.student.github ? (
                      <span className="text-[12px] font-mono font-bold text-provider-github flex items-center gap-1 shrink-0">
                        <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Rank #{recap.student.github.rank}{recap.student.github.isTied ? " tied" : ""}</span>
                      </span>
                    ) : (
                      <span className="text-[12px] font-mono font-bold text-amber-400 shrink-0">Pending</span>
                    )}
                  </div>
                  <span className="text-[12px] text-muted block font-mono tabular-nums">
                    {recap.student.github ? `${recap.student.github.consistencyRate}% weekly consistency (${recap.student.github.status})` : "No GitHub standing — shown as UNAVAILABLE, not 0."}
                  </span>
                </div>

                {/* LeetCode Weekly Delta */}
                <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="block text-[13px] font-medium text-muted">LeetCode weekly delta</span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-black font-mono text-white tabular-nums">
                      {recap.student.leetcode ? `+${recap.student.leetcode.weeklyDelta}` : "UNAVAILABLE"}
                    </span>
                    {recap.student.leetcode ? (
                      <span className="text-[12px] font-mono font-bold text-provider-leetcode flex items-center gap-1 shrink-0">
                        <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Rank #{recap.student.leetcode.rank}{recap.student.leetcode.isTied ? " tied" : ""}</span>
                      </span>
                    ) : (
                      <span className="text-[12px] font-mono font-bold text-amber-400 shrink-0">Pending</span>
                    )}
                  </div>
                  <span className="text-[12px] text-muted block font-mono">
                    {recap.student.leetcode ? `Status: ${recap.student.leetcode.status}` : "No LeetCode delta yet — baseline activates at the next Sunday boundary."}
                  </span>
                </div>

                {/* Consistency Streak */}
                <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="block text-[13px] font-medium text-muted">Consistency streak</span>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-2xl font-black font-mono text-white flex items-center gap-1.5 tabular-nums">
                      <Flame className="h-5 w-5 text-brand-secondary" aria-hidden="true" />
                      <span>{recap.student.consistencyStreakWeeks} weeks</span>
                    </span>
                    <span className="text-[12px] font-mono text-muted font-bold">≥4 days / cycle</span>
                  </div>
                  <span className="text-[12px] text-muted block font-mono">
                    Stored observations only.
                  </span>
                </div>
              </div>
            )}

            {/* Bullet Points with Rule-based Evidence */}
            <div className="space-y-2.5 pt-1">
              <span className="text-[13px] text-muted block">Audited weekly highlights (rule-based, quotable)</span>
              <div className="space-y-2">
                {recap.highlights.map((highlight, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-ink-secondary leading-relaxed">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          /* Tab 2: Grounded AI Natural Language Analysis */
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-5"
          >
            {aiLoading ? (
              <div className="p-8 rounded-xl bg-surface-raised border border-white/[0.06] flex flex-col items-center justify-center space-y-3" aria-busy="true">
                <RefreshCw className="h-6 w-6 text-brand-secondary animate-spin" aria-hidden="true" />
                <span className="text-[13px] font-mono text-muted">Summarizing verified telemetry facts…</span>
              </div>
            ) : aiRecap ? (
              <div className="space-y-5">
                {/* Executive Summary Callout */}
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-brand-primary/30 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[13px] font-bold text-brand-primary flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Grounded analyst synthesis</span>
                    </span>
                    <span className="text-[12px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Only verified facts quoted
                    </span>
                  </div>
                  <p className="text-sm text-ink leading-relaxed">
                    {aiRecap.executiveSummary}
                  </p>
                </div>

                {/* Grid: Strengths vs Growth Areas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Verified Strengths */}
                  <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-2.5">
                    <span className="text-[13px] text-emerald-400 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Verified strengths</span>
                    </span>
                    <ul className="space-y-2">
                      {aiRecap.verifiedStrengths.map((item, i) => (
                        <li key={i} className="text-[13px] text-ink-secondary leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5" aria-hidden="true">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Honest Growth Areas */}
                  <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-2.5">
                    <span className="text-[13px] text-amber-400 flex items-center gap-1.5 font-bold">
                      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Honest gaps</span>
                    </span>
                    <ul className="space-y-2">
                      {aiRecap.honestGrowthAreas.map((item, i) => (
                        <li key={i} className="text-[13px] text-ink-secondary leading-relaxed flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5" aria-hidden="true">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Plan */}
                {aiRecap.actionPlan.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[13px] text-muted block">Recommended action plan</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {aiRecap.actionPlan.map((action, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-mono font-bold text-white">{action.title}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-brand-secondary shrink-0" aria-hidden="true" />
                          </div>
                          <p className="text-[13px] text-ink-secondary leading-snug">
                            {action.description}
                          </p>
                          <span className="inline-block text-[12px] font-mono px-2 py-0.5 rounded bg-surface border border-white/10 text-muted tabular-nums">
                            Target: {action.targetMetric}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div role="alert" className="p-6 rounded-xl border border-amber-500/30 bg-amber-500/10 text-sm text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>{aiError ?? "Grounded summary is UNAVAILABLE right now. Telemetry facts above are unchanged."}</span>
                </span>
                <button type="button" onClick={loadAiRecap} className="shrink-0 rounded-xl border border-amber-500/30 px-4 py-2 text-sm font-semibold transition-colors hover:bg-amber-500/20">Retry</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auditable footer — quotable facts only, no new metrics */}
      <div className="pt-3 border-t border-white/[0.06] space-y-2 text-[12px] text-muted">
        <p>{recap.disclosures.zeroFabricationNotice}</p>
        <p>{recap.disclosures.boundaryRule} {recap.disclosures.hackerRankNotice}</p>
        <p className="tabular-nums">
          Week {recap.weekNumber} ({recap.year}) • Closes {recap.boundaryTimestampIST} • Quorum {recap.cohort.quorumPercentage}% ({recap.cohort.quorumLabel}) • Generated {recap.generatedAt}
        </p>
      </div>
    </motion.div>
  );
}
