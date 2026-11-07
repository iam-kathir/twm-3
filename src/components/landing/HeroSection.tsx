"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Trophy,
  ShieldCheck,
  BarChart2,
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { LeetCodeIcon as Code2 } from "@/components/ui/LeetCodeIcon";
import { HackerRankIcon } from "@/components/ui/HackerRankIcon";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
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
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#6555F5]/10 via-[#3478F6]/10 to-[#16C8E8]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[420px] h-[360px] bg-[#3478F6]/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center"
        >
          {/* Left Column: Copy & Actions (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Pill Badge */}
            <motion.div variants={itemVariants} className="mb-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-primary/25 bg-surface-elevated/80 backdrop-blur-md shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-brand-highlight" />
                <span className="text-xs font-medium text-slate-300 font-sans">
                  A Developer Activity Platform for Our Class
                </span>
              </div>
            </motion.div>

            {/* Headline */}
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
              A unified platform to track your coding journey across GitHub,
              LeetCode, and HackerRank, compete with your classmates, and build
              a verifiable developer profile.
            </motion.p>

            {/* Feature Pills */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-center gap-3"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-surface-card text-xs font-semibold text-slate-200 shadow-sm">
                <BarChart2 className="h-4 w-4 text-brand-secondary" />
                <span>Verified Activity</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-surface-card text-xs font-semibold text-slate-200 shadow-sm">
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>Weekly Leaderboards</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-surface-card text-xs font-semibold text-slate-200 shadow-sm">
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
                className="inline-flex min-h-[48px] items-center gap-2.5 px-7 py-3 rounded-xl bg-brand-secondary hover:bg-accent-hover text-white text-base font-bold transition-all shadow-[0_0_25px_rgba(52,120,246,0.35)] hover:shadow-[0_0_35px_rgba(52,120,246,0.5)] hover:scale-105 active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>
              <Link
                href="/leaderboard"
                className="inline-flex min-h-[48px] items-center gap-2.5 px-6 py-3 rounded-xl border border-white/15 bg-surface hover:bg-surface-raised text-white text-base font-semibold transition-all hover:border-white/30"
              >
                <Trophy className="h-4 w-4 text-amber-400" />
                <span>View Leaderboard</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Orbiting Telemetry Visualization (5 Cols) */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-5 flex items-center justify-center relative min-h-[380px] sm:min-h-[440px]"
          >
            {/* Outer Circular Orbit Ring */}
            <div className="absolute w-[360px] h-[360px] sm:w-[420px] sm:h-[420px] rounded-full border border-brand-secondary/20 pointer-events-none" />

            {/* Inner Circular Orbit Ring */}
            <div className="absolute w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] rounded-full border border-brand-primary/20 pointer-events-none" />

            {/* Glowing Orbit Nodes */}
            <div className="absolute top-12 left-12 w-2.5 h-2.5 rounded-full bg-brand-highlight shadow-[0_0_12px_#16C8E8]" />
            <div className="absolute top-1/2 right-4 w-2 h-2 rounded-full bg-brand-primary shadow-[0_0_10px_#6555F5]" />
            <div className="absolute bottom-10 left-1/2 w-2 h-2 rounded-full bg-brand-secondary shadow-[0_0_10px_#3478F6]" />

            {/* Central Glowing TWM Squircle Card */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="relative z-10 w-28 h-28 sm:w-34 sm:h-34 rounded-3xl bg-gradient-to-b from-[#151B24] to-[#0E121A] border border-brand-primary/40 shadow-[0_0_45px_rgba(101,85,245,0.30)] flex items-center justify-center p-3 cursor-pointer"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                <Image
                  src="/icon.svg"
                  alt="TWM Platform Emblem"
                  width={104}
                  height={40}
                  priority
                  className="object-contain drop-shadow-[0_0_16px_rgba(101,85,245,0.5)]"
                />
              </div>
            </motion.div>

            {/* GitHub Card (Top Orbit) */}
            <motion.div
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="absolute top-1 sm:top-4 left-1/2 -translate-x-1/2 p-3 sm:p-3.5 rounded-2xl bg-surface/95 border border-white/15 shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer"
            >
              <Github className="h-6 w-6 text-white" />
            </motion.div>

            {/* LeetCode Card (Left Orbit) */}
            <motion.div
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="absolute top-1/2 -translate-y-1/2 left-1 sm:left-4 p-3 sm:p-3.5 rounded-2xl bg-surface/95 border border-provider-leetcode-brand/30 shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer"
            >
              <Code2 className="h-6 w-6 text-provider-leetcode-brand" />
            </motion.div>

            {/* HackerRank Card (Right Orbit) */}
            <motion.div
              whileHover={{ scale: 1.12 }}
              transition={{ type: "spring", stiffness: 350, damping: 20 }}
              className="absolute top-1/2 -translate-y-1/2 right-1 sm:right-4 p-3 sm:p-3.5 rounded-2xl bg-surface/95 border border-provider-hackerrank/30 shadow-[0_8px_24px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer"
            >
              <HackerRankIcon className="h-6 w-auto" variant="wide" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
