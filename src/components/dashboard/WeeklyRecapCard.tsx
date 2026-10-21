"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, CheckCircle2, TrendingUp, ShieldCheck, Trophy, Flame } from "lucide-react";
import type { DeterministicWeeklyRecap } from "@/lib/recap";

export function WeeklyRecapCard() {
  const [recap, setRecap] = useState<DeterministicWeeklyRecap | null>(null);
  const [loading, setLoading] = useState(true);

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
              <h3 className="text-lg sm:text-xl font-bold text-white font-sans">Deterministic Weekly Recap</h3>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-surface-raised border border-white/10 text-muted">
                Week {recap.weekNumber}
              </span>
            </div>
            <p className="text-xs font-mono text-muted mt-0.5 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-soft" />
              <span>Closed: {recap.boundaryTimestampIST}</span>
            </p>
          </div>
        </div>

        {/* Quorum Badge */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold border ${
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
            <span className="text-[11px] text-muted-soft block font-mono">
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
            <span className="text-[11px] text-muted-soft block font-mono">
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
            <span className="text-[11px] text-muted-soft block font-mono">
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

      {/* Zero Fabrication Footer Guarantee */}
      <div className="pt-3 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-muted">
        <span>{recap.disclosures.zeroFabricationNotice}</span>
        <span className="text-accent shrink-0">Rule §9.1 Verified</span>
      </div>
    </motion.div>
  );
}
