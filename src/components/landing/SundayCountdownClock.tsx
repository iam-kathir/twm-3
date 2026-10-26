"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Clock, ShieldAlert, Sparkles, Trophy, Zap, Radio } from "lucide-react";
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
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIst = new Date(now.getTime() + istOffsetMs);
  
  const currentDay = nowIst.getUTCDay();
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  
  const targetSundayIst = new Date(nowIst);
  targetSundayIst.setUTCDate(nowIst.getUTCDate() + daysUntilSunday);
  targetSundayIst.setUTCHours(23, 59, 59, 999);
  
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

  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Gyroscopic Perspective Tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

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
    <div style={{ perspective: 1000 }} className="relative max-w-xl mx-auto">
      <motion.div
        ref={cardRef}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.015 }}
        transition={{ duration: 0.35 }}
        onClick={() => {
          fireMilestoneBurst(0.5, 0.3);
          toast.success("Week 42 Live Competition • Hard Boundary Sun 23:59:59 IST");
        }}
        className="relative rounded-3xl p-[1px] overflow-hidden group cursor-pointer shadow-overlay"
      >
        {/* Dynamic Traveling Laser Border Beam */}
        <div
          className="absolute -inset-[200%] animate-border-beam pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 270deg, #10B981 330deg, #34D399 360deg)",
          }}
        />

        {/* Inner Card Container */}
        <div className="relative rounded-[23px] bg-surface/95 backdrop-blur-2xl p-4 sm:p-5 border border-white/[0.08] overflow-hidden">
          {/* Subtle ambient interior glow */}
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-accent/20 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/30 transition-colors" />

          {/* Top Header Label */}
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
              </span>
              <span className="font-sans text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Trophy className="h-4 w-4 text-amber-400" />
                Week 42 Live Competition
              </span>
            </div>
            <span className="text-xs font-sans font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/25 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Cutoff: Sun 23:59:59 IST
            </span>
          </div>

          {/* Digital Clocks Display with Rolling Digits */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 py-3.5">
            {timeUnits.map((unit) => {
              const isSeconds = unit.label === "Secs";
              return (
                <motion.div
                  key={unit.label}
                  whileHover={{ y: -3, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className={`relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl bg-surface-raised/95 border transition-all shadow-inner overflow-hidden ${
                    isSeconds
                      ? "border-accent/50 bg-accent/[0.06] shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                      : "border-white/[0.08]"
                  }`}
                >
                  {/* Radar Ripple on Seconds Unit */}
                  {isSeconds && (
                    <span className="absolute inset-0 rounded-2xl border border-accent/40 animate-radar-ripple pointer-events-none" />
                  )}

                  {isSeconds && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                  )}

                  {/* Smooth Rolling / Sliding Digit Ticker with PopLayout Spring Motion */}
                  <div className="relative h-9 sm:h-11 w-full flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={unit.value}
                        initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                        transition={{
                          type: "spring",
                          stiffness: 450,
                          damping: 30,
                          mass: 0.8,
                        }}
                        className="font-mono text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
                      >
                        {unit.value}
                      </motion.span>
                    </AnimatePresence>
                  </div>

                  <span className="font-sans text-xs font-semibold text-slate-300 mt-0.5">
                    {unit.label}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* Progress Bar with Flowing Energy Stream */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-sans text-muted">
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-accent" />
                Tournament Week Elapsed
              </span>
              <span className="font-mono text-emerald-400 font-bold">{timeLeft.progressPercent}%</span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/[0.08]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-accent to-emerald-300 animate-energy-stream shadow-[0_0_14px_rgba(16,185,129,0.6)] relative"
                initial={{ width: 0 }}
                animate={{ width: `${timeLeft.progressPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {/* Flowing spark head on the progress bar */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#34D399]" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
