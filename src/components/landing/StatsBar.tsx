"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Users, Trophy, ShieldCheck, Zap, Code2 } from "lucide-react";
import {
  ValidatedCohortStats,
  validateCohortStatsPayload,
} from "@/lib/stats-validator";

export { validateCohortStatsPayload, type ValidatedCohortStats };

/**
 * Smooth count-up animation hook (§11).
 * Resets/animates only on valid positive integer updates.
 * Respects prefers-reduced-motion by returning the target instantly.
 */
function useCountUp(target: number | null, shouldAnimate = true, durationMs = 800): number | null {
  const [count, setCount] = useState<number | null>(shouldAnimate ? 0 : target);
  const prevTargetRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === null) {
      setCount(null);
      prevTargetRef.current = null;
      return;
    }

    if (!shouldAnimate) {
      setCount(target);
      prevTargetRef.current = target;
      return;
    }

    const startVal = prevTargetRef.current ?? 0;
    const endVal = target;
    if (startVal === endVal && prevTargetRef.current !== null) return;

    prevTargetRef.current = endVal;
    let startTime: number | null = null;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Easing: easeOutExpo (1 - 2^(-10t))
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (endVal - startVal) * easeProgress);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setCount(endVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [target, shouldAnimate, durationMs]);

  return count;
}

export function StatsBar() {
  const [stats, setStats] = useState<ValidatedCohortStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const activeControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<number>(0);
  const inFlightRef = useRef<boolean>(false);

  // Smooth count-up for enrolled cohort count (only when valid data arrives)
  const animatedEnrolled = useCountUp(
    stats?.totalEnrolled ?? null,
    !prefersReducedMotion && stats?.totalEnrolled !== null
  );

  const fetchStats = useCallback(() => {
    // Avoid background fetch if tab is hidden (§D.7)
    if (typeof document !== "undefined" && document.visibilityState === "hidden") {
      return;
    }

    // Cancel in-flight request if present (§D.2)
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
      activeControllerRef.current = null;
    }

    const controller = new AbortController();
    activeControllerRef.current = controller;
    const currentReqId = ++requestIdRef.current;
    inFlightRef.current = true;

    fetch("/api/stats/public", { signal: controller.signal, cache: "no-cache" })
      .then(async (res) => {
        if (currentReqId !== requestIdRef.current) return;
        if (res.status === 304) {
          // Unchanged ETag — existing validated stats remain current (§D.9)
          return;
        }
        if (!res.ok) {
          throw new Error(`HTTP_${res.status}`);
        }
        const data = await res.json();
        if (currentReqId !== requestIdRef.current) return;

        const validation = validateCohortStatsPayload(data);
        if (validation.isValid) {
          setStats(validation.data);
          setIsUnavailable(false);
        } else {
          console.warn("[StatsBar] Rejected payload:", validation.reason);
          // Only show unavailable if we have no existing verified data
          setIsUnavailable((prev) => (stats === null ? true : prev));
        }
      })
      .catch((err) => {
        if (currentReqId !== requestIdRef.current) return;
        if (err.name === "AbortError" || controller.signal.aborted) {
          // Intentional cancellation — silent return (§D.11)
          return;
        }
        console.warn("[StatsBar] Fetch failed:", err.message);
        if (!stats) {
          setIsUnavailable(true);
        }
      })
      .finally(() => {
        if (currentReqId === requestIdRef.current) {
          inFlightRef.current = false;
          setLoading(false);
          activeControllerRef.current = null;
        }
      });
  }, [stats]);

  useEffect(() => {
    // Initial fetch on mount
    fetchStats();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchStats();
      }
    };

    const handleWindowFocus = () => {
      fetchStats();
    };

    const handleRosterUpdated = () => {
      fetchStats();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleWindowFocus);
    window.addEventListener("twm:roster-updated", handleRosterUpdated);

    return () => {
      activeControllerRef.current?.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("twm:roster-updated", handleRosterUpdated);
    };
  }, [fetchStats]);

  // Framer Motion viewport entrance choreography (§10)
  const containerVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 16,
      scale: prefersReducedMotion ? 1 : 0.99,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.55,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: prefersReducedMotion ? 0 : 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: prefersReducedMotion ? 0.01 : 0.45,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  };

  return (
    <section
      role="region"
      aria-label="TWM Platform Developer Metrics"
      aria-busy={loading}
      className="relative -mt-4 sm:-mt-8 mb-16 sm:mb-20 max-w-6xl mx-auto px-4 sm:px-6 z-20"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="relative rounded-3xl border border-white/[0.08] bg-surface/90 backdrop-blur-xl p-5 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden"
      >
        {/* Subtle top hairline highlight gradient matching official TWM brand spectrum */}
        <div
          className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#6555F5]/30 to-transparent pointer-events-none"
          aria-hidden="true"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 sm:gap-6 lg:gap-0 items-center justify-between">
          {/* ─────────────────────────────────────────────────────────────
              Metric 1: Enrolled Cohort (§5)
              Grounded in authoritative SQLite roster with Quorum Status
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="group flex items-start gap-3.5 p-2 rounded-2xl transition-colors duration-200 hover:bg-white/[0.02]"
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-primary/[0.08] border border-brand-primary/20 text-brand-primary shrink-0 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-primary/[0.15] group-hover:border-brand-primary/40 group-hover:shadow-[0_0_16px_rgba(101,85,245,0.25)]"
              aria-hidden="true"
            >
              <Users className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none tracking-tight">
                {loading ? (
                  <span
                    className="inline-block w-9 h-6 sm:h-7 bg-white/10 rounded animate-pulse align-middle"
                    aria-label="Loading enrolled cohort count"
                  />
                ) : stats && typeof stats.totalEnrolled === "number" ? (
                  <span className="tabular-nums font-sans">
                    {animatedEnrolled ?? stats.totalEnrolled}
                  </span>
                ) : isUnavailable ? (
                  <span className="font-sans text-lg sm:text-xl font-bold text-muted" title="Cohort metrics currently unavailable">
                    —
                  </span>
                ) : (
                  <span className="font-sans text-lg sm:text-xl font-bold text-slate-200" title="Class roster active">
                    Class
                  </span>
                )}
              </div>
              <div className="text-xs sm:text-[13px] text-slate-400 font-medium font-sans mt-1 leading-tight">
                Enrolled Cohort
              </div>

              {/* Quorum Status Badge (§6) — Grounded in Section 3.3 SQLite Quorum */}
              {!loading && stats && stats.meetsQuorum && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] sm:text-[11px] font-mono font-medium leading-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" aria-hidden="true" />
                  <span>{stats.quorumPercentage}% Quorum</span>
                </div>
              )}
              {!loading && stats && !stats.meetsQuorum && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-muted-soft text-[10px] sm:text-[11px] font-mono font-medium leading-none">
                  <span>{stats.quorumPercentage}% Participating</span>
                </div>
              )}
              {!loading && isUnavailable && (
                <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-muted-soft text-[10px] sm:text-[11px] font-mono font-medium leading-none">
                  <span>Quorum Pending</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              Metric 2: Connected Platforms (§5)
              GitHub · LeetCode · HackerRank
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="group flex items-start gap-3.5 p-2 rounded-2xl transition-colors duration-200 hover:bg-white/[0.02] lg:border-l lg:border-white/[0.06] lg:pl-6 xl:pl-7"
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-secondary/[0.08] border border-brand-secondary/20 text-brand-secondary shrink-0 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-secondary/[0.15] group-hover:border-brand-secondary/40 group-hover:shadow-[0_0_16px_rgba(52,120,246,0.25)]"
              aria-hidden="true"
            >
              <Code2 className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none tracking-tight">
                {stats?.platformCount ?? 3}
              </div>
              <div className="text-xs sm:text-[13px] text-slate-400 font-medium font-sans mt-1 leading-tight">
                Connected Platforms
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-soft font-mono mt-1.5 leading-none truncate">
                GitHub · LeetCode · HR
              </div>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              Metric 3: Weekly Leaderboards (§5)
              Weekly competition closing Sunday 23:59:59 IST
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="group flex items-start gap-3.5 p-2 rounded-2xl transition-colors duration-200 hover:bg-white/[0.02] lg:border-l lg:border-white/[0.06] lg:pl-6 xl:pl-7"
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-400/[0.08] border border-amber-400/20 text-amber-400 shrink-0 flex items-center justify-center transition-all duration-300 group-hover:bg-amber-400/[0.15] group-hover:border-amber-400/40 group-hover:shadow-[0_0_16px_rgba(251,191,36,0.25)]"
              aria-hidden="true"
            >
              <Trophy className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none tracking-tight">
                Weekly
              </div>
              <div className="text-xs sm:text-[13px] text-slate-400 font-medium font-sans mt-1 leading-tight">
                Leaderboards
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-soft font-mono mt-1.5 leading-none">
                Sunday 23:59 IST
              </div>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              Metric 4: Verified & Auditable (§5)
              Deterministic §9.6 scoring & cryptographic verification
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="group flex items-start gap-3.5 p-2 rounded-2xl transition-colors duration-200 hover:bg-white/[0.02] lg:border-l lg:border-white/[0.06] lg:pl-6 xl:pl-7"
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-highlight/[0.08] border border-brand-highlight/20 text-brand-highlight shrink-0 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-highlight/[0.15] group-hover:border-brand-highlight/40 group-hover:shadow-[0_0_16px_rgba(22,200,232,0.25)]"
              aria-hidden="true"
            >
              <ShieldCheck className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none tracking-tight">
                Verified
              </div>
              <div className="text-xs sm:text-[13px] text-slate-400 font-medium font-sans mt-1 leading-tight">
                &amp; Auditable
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-soft font-mono mt-1.5 leading-none">
                Zero fabrication
              </div>
            </div>
          </motion.div>

          {/* ─────────────────────────────────────────────────────────────
              Metric 5: Build Your Profile (§5)
              Developer consistency trajectory & multi-provider telemetry
             ───────────────────────────────────────────────────────────── */}
          <motion.div
            variants={itemVariants}
            className="group flex items-start gap-3.5 p-2 rounded-2xl transition-colors duration-200 hover:bg-white/[0.02] col-span-2 sm:col-span-1 lg:border-l lg:border-white/[0.06] lg:pl-6 xl:pl-7"
          >
            <div
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-brand-secondary/[0.08] border border-brand-secondary/20 text-brand-secondary shrink-0 flex items-center justify-center transition-all duration-300 group-hover:bg-brand-secondary/[0.15] group-hover:border-brand-secondary/40 group-hover:shadow-[0_0_16px_rgba(52,120,246,0.25)]"
              aria-hidden="true"
            >
              <Zap className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none tracking-tight">
                Build
              </div>
              <div className="text-xs sm:text-[13px] text-slate-400 font-medium font-sans mt-1 leading-tight">
                Your Profile
              </div>
              <div className="text-[10px] sm:text-[11px] text-muted-soft font-mono mt-1.5 leading-none">
                Verified trajectory
              </div>
            </div>
          </motion.div>
        </div>

        {/* Honest Non-Fabricated Telemetry & Response Freshness Metadata (§E) */}
        {stats && (stats.generatedAt || stats.latestObservationAt) && (
          <div className="mt-4 pt-3 border-t border-white/[0.04] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-muted-soft">
            {stats.latestObservationAt ? (
              <span title="Genuine SQLite observation record timestamp">
                Latest Telemetry: {new Date(stats.latestObservationAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            ) : (
              <span>Observation store: Active</span>
            )}
            {stats.generatedAt && (
              <span title="API response generation timestamp (not observation timestamp)">
                Snapshot generated: {new Date(stats.generatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </section>
  );
}
