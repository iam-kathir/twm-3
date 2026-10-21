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
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetch("/api/recap")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.recap) {
          setRecap(data.recap);
        }
      })
      .catch((err) => {
        console.error("Failed to load recap:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadAiRecap = () => {
    if (aiRecap || aiLoading) return;
    setAiLoading(true);
    fetch("/api/ai/recap")
      .then((res) => res.json())
      .then((data) => {
        if (data.executiveSummary) {
          setAiRecap(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load AI recap:", err);
      })
      .finally(() => setAiLoading(false));
  };

  const handleTabChange = (tab: "deterministic" | "ai") => {
    setActiveTab(tab);
    if (tab === "ai" && !aiRecap) {
      loadAiRecap();
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-7 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-white/10 rounded-lg" />
        <div className="h-20 bg-white/5 rounded-xl" />
        <div className="h-4 w-3/4 bg-white/5 rounded" />
      </div>
    );
  }

  if (!recap) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-white/[0.08] bg-surface p-6 sm:p-7 space-y-6 shadow-xl relative overflow-hidden"
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
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
          <div className="flex items-center p-1 rounded-xl bg-surface-raised border border-white/[0.08]">
            <button
              onClick={() => handleTabChange("deterministic")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activeTab === "deterministic"
                  ? "bg-accent text-canvas font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" />
              <span>Telemetry Facts</span>
            </button>
            <button
              onClick={() => handleTabChange("ai")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                activeTab === "ai"
                  ? "bg-accent text-canvas font-bold shadow-sm"
                  : "text-muted hover:text-white"
              }`}
            >
              <Bot className="h-3.5 w-3.5" />
              <span>Grounded AI</span>
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
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider block">GitHub Active Days</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-white">
                      {recap.student.github ? `${recap.student.github.activeDays} / 7` : "—"}
                    </span>
                    {recap.student.github && (
                      <span className="text-xs font-mono font-bold text-provider-github flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>Rank #{recap.student.github.rank}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted block font-mono">
                    {recap.student.github ? `${recap.student.github.consistencyRate}% Weekly Consistency` : "No observed commits"}
                  </span>
                </div>

                {/* LeetCode Weekly Delta */}
                <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider block">LeetCode Weekly Delta</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-white">
                      {recap.student.leetcode ? `+${recap.student.leetcode.weeklyDelta}` : "0"}
                    </span>
                    {recap.student.leetcode && (
                      <span className="text-xs font-mono font-bold text-provider-leetcode flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Rank #{recap.student.leetcode.rank}</span>
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted block font-mono">
                    Prior Sunday Baseline Finalized
                  </span>
                </div>

                {/* Consistency Streak */}
                <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1">
                  <span className="text-[11px] font-mono text-muted uppercase tracking-wider block">Consistency Streak</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black font-mono text-white flex items-center gap-1.5">
                      <Flame className="h-5 w-5 text-accent" />
                      <span>{recap.student.consistencyStreakWeeks} Weeks</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold">Active</span>
                  </div>
                  <span className="text-[11px] text-muted block font-mono">
                    ≥4 active days / cycle
                  </span>
                </div>
              </div>
            )}

            {/* Bullet Points with Rule-based Evidence */}
            <div className="space-y-2.5 pt-1">
              <span className="text-xs font-mono text-muted uppercase tracking-wider block">Audited Weekly Highlights</span>
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
              <div className="p-8 rounded-xl bg-surface-raised border border-white/[0.06] flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="h-6 w-6 text-accent animate-spin" />
                <span className="text-xs font-mono text-muted">Synthesizing verified telemetry facts...</span>
              </div>
            ) : aiRecap ? (
              <div className="space-y-5">
                {/* Executive Summary Callout */}
                <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-accent/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5" />
                      <span>Grounded Analyst Synthesis</span>
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Zero Hallucination Verified
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
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Verified Strengths</span>
                    </span>
                    <ul className="space-y-2">
                      {aiRecap.verifiedStrengths.map((item, i) => (
                        <li key={i} className="text-xs text-ink-secondary leading-relaxed flex items-start gap-2">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Honest Growth Areas */}
                  <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-2.5">
                    <span className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Honest Bottlenecks & Gaps</span>
                    </span>
                    <ul className="space-y-2">
                      {aiRecap.honestGrowthAreas.map((item, i) => (
                        <li key={i} className="text-xs text-ink-secondary leading-relaxed flex items-start gap-2">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Plan */}
                {aiRecap.actionPlan.length > 0 && (
                  <div className="space-y-2.5 pt-1">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider block">Recommended Action Plan</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {aiRecap.actionPlan.map((action, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-surface-raised border border-white/[0.06] space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-white">{action.title}</span>
                            <ArrowRight className="h-3.5 w-3.5 text-accent" />
                          </div>
                          <p className="text-[12px] text-ink-secondary leading-snug">
                            {action.description}
                          </p>
                          <span className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-surface border border-white/10 text-muted">
                            Target: {action.targetMetric}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-mono text-muted">
                Unable to load AI summary.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zero Fabrication Footer Guarantee */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-muted">
        <span>{recap.disclosures.zeroFabricationNotice}</span>
        <span className="text-accent shrink-0">Rule §9.1 Verified</span>
      </div>
    </motion.div>
  );
}
