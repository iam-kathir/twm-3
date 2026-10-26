"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { fireMilestoneBurst } from "@/lib/celebrate";
import { toast } from "sonner";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
  isClosed: boolean;
}

function calculateSundayBoundaryTime(): TimeLeft {
  // Current time in UTC ms
  const now = new Date();
  
  // IST is UTC + 5 hours 30 mins
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIst = new Date(now.getTime() + istOffsetMs);
  
  // Find current day in IST (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  const currentDay = nowIst.getUTCDay();
  
  // Target: Next Sunday 23:59:59 IST
  // If today is Sunday (0), check if we already passed 23:59:59
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  
  const targetSundayIst = new Date(nowIst);
  targetSundayIst.setUTCDate(nowIst.getUTCDate() + daysUntilSunday);
  targetSundayIst.setUTCHours(23, 59, 59, 999);
  
  // Start of week: Monday 00:00:00 IST
  const daysSinceMonday = (currentDay + 6) % 7;
  const startOfWeekIst = new Date(nowIst);
  startOfWeekIst.setUTCDate(nowIst.getUTCDate() - daysSinceMonday);
  startOfWeekIst.setUTCHours(0, 0, 0, 0);

  const totalWeekMs = 7 * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, nowIst.getTime() - startOfWeekIst.getTime());
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalWeekMs) * 100));

  const diffMs = targetSundayIst.getTime() - nowIst.getTime();

  if (diffMs <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      progressPercent: 100,
      isClosed: true,
    };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return {
    days,
    hours,
    minutes,
    seconds,
    progressPercent: Math.round(progressPercent),
    isClosed: false,
  };
}

export function SundayCountdownClock() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 3,
    hours: 11,
    minutes: 42,
    seconds: 18,
    progressPercent: 50,
    isClosed: false,
  });

  useEffect(() => {
    setMounted(true);
    setTimeLeft(calculateSundayBoundaryTime());

    const interval = setInterval(() => {
      setTimeLeft(calculateSundayBoundaryTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: "Days", value: String(timeLeft.days).padStart(2, "0") },
    { label: "Hours", value: String(timeLeft.hours).padStart(2, "0") },
    { label: "Mins", value: String(timeLeft.minutes).padStart(2, "0") },
    { label: "Secs", value: String(timeLeft.seconds).padStart(2, "0") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
      onClick={() => {
        fireMilestoneBurst(0.5, 0.3);
        toast.success("Week 42 Live Competition • Hard Boundary Sun 23:59:59 IST");
      }}
      className="relative max-w-xl mx-auto rounded-3xl border border-white/[0.08] hover:border-emerald-500/40 bg-surface group cursor-pointer transition-colors"
    >
      <div className="rounded-3xl p-4 sm:p-5 relative overflow-hidden">
        {/* Subtle ambient interior glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-accent/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Label */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-sans text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-400" />
              Week 42 Live Competition
            </span>
          </div>
          <span className="text-xs font-sans font-medium text-emerald-400/90 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Cutoff: Sun 23:59:59 IST
          </span>
        </div>

        {/* Digital Clocks Display */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 py-3.5">
          {timeUnits.map((unit, idx) => {
            const isSeconds = unit.label === "Secs";
            return (
              <motion.div
                key={unit.label}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 350, damping: 20 }}
                className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-surface-raised/95 border transition-colors shadow-inner overflow-hidden ${
                  isSeconds ? "border-accent/40 bg-accent/[0.04]" : "border-white/[0.08]"
                }`}
              >
                {isSeconds && (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                )}
                <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {unit.value}
                </div>
                <span className="font-sans text-xs font-medium text-slate-300 mt-1">
                  {unit.label}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Bar through the week */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-sans text-muted">
            <span>Tournament Week Progress</span>
            <span className="font-mono text-emerald-400 font-semibold">{timeLeft.progressPercent}% Elapsed</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/[0.05] overflow-hidden p-0.5 border border-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-accent to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${timeLeft.progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
