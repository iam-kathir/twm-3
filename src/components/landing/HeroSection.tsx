"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  ShieldCheck,
  BarChart2,
} from "lucide-react";
import { HeroOrbitalUniverse } from "./hero/HeroOrbitalUniverse";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 140,
      damping: 18,
    },
  },
};

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Smooth scroll-responsive subtle scale and fade as user scrolls into the page
  const visualScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const visualOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0.45]);

  return (
    <section
      ref={sectionRef}
      className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-canvas"
    >
      {/* Background Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#6555F5]/10 via-[#3478F6]/10 to-[#16C8E8]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[460px] h-[380px] bg-[#3478F6]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Column: Copy & Actions (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Eyebrow Pill Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-primary/25 bg-surface-elevated/80 backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-highlight" />
                <span className="text-xs font-medium text-slate-300 font-sans">
                  The Developer Activity Universe • Class of 2026
                </span>
              </div>
            </motion.div>

            {/* Headline with Staggered Word Reveal */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.06] font-sans"
            >
              Track. Win.
              <br />
              <span className="text-transparent bg-clip-text bg-brand-gradient">
                Maintain.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={itemVariants}
              className="mt-6 text-base sm:text-lg text-slate-300 font-sans leading-relaxed max-w-xl"
            >
              A unified platform to monitor your coding momentum across GitHub,
              LeetCode, and HackerRank — compete with your classmates, verify
              telemetry, and maintain an auditable developer profile.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-surface-card text-xs font-semibold text-slate-200 shadow-sm hover:border-brand-secondary/40 transition-colors">
                <BarChart2 className="h-4 w-4 text-brand-secondary" />
                <span>Verified Activity</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-surface-card text-xs font-semibold text-slate-200 shadow-sm hover:border-amber-400/40 transition-colors">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Weekly Leaderboards</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-surface-card text-xs font-semibold text-slate-200 shadow-sm hover:border-brand-highlight/40 transition-colors">
                <ShieldCheck className="h-4 w-4 text-brand-highlight" />
                <span>Auditable Records</span>
              </div>
            </motion.div>

            {/* Dual Action CTAs */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/login"
                className="inline-flex min-h-[48px] items-center gap-2.5 px-7 py-3 rounded-xl bg-brand-secondary hover:bg-accent-hover text-white text-base font-bold transition-all shadow-[0_0_25px_rgba(52,120,246,0.35)] hover:shadow-[0_0_35px_rgba(52,120,246,0.5)] hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex min-h-[48px] items-center gap-2.5 px-6 py-3 rounded-xl border border-white/15 bg-surface hover:bg-surface-raised text-white text-base font-semibold transition-all hover:border-white/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>View Leaderboard</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: The Developer Activity Universe (5 Cols) */}
          <motion.div
            variants={itemVariants}
            style={{ scale: visualScale, opacity: visualOpacity }}
            className="lg:col-span-5 flex items-center justify-center relative min-h-[420px] sm:min-h-[500px]"
          >
            <HeroOrbitalUniverse />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
