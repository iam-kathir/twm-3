"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Sparkles, Activity, ShieldCheck, Trophy, Zap, CheckCircle2 } from "lucide-react";
import { SundayCountdownClock } from "./SundayCountdownClock";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 18,
    },
  },
};

export function HeroSection() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inviteCode.trim();
    if (!clean) return;
    router.push(`/onboarding?class=${encodeURIComponent(clean)}`);
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden text-center">
      {/* Precision Multi-Tone Ambient Atmosphere (Vibrant Hyper-Mint & Royal Indigo Meshes) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-gradient-to-tr from-accent/25 via-emerald-400/15 to-teal-400/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-[600px] h-[450px] bg-gradient-to-bl from-indigo-500/20 via-sky-500/10 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-tech-dots opacity-30 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-6xl mx-auto px-4 sm:px-6"
      >
        {/* Technical Status Tag with High-Visibility Glow */}
        <motion.div variants={itemVariants} className="inline-flex items-center justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-2 rounded-full bg-surface-elevated/90 border border-accent/30 text-xs sm:text-sm font-sans text-ink shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <span className="font-bold text-white tracking-wide">TWM 3.1 Platform</span>
            <span className="text-white/20">|</span>
            <span className="text-slate-300 font-medium">GitHub, LeetCode &amp; HackerRank Live Telemetry</span>
          </div>
        </motion.div>

        {/* Solid Authoritative Headline with Luminous Hyper-Mint Gradient */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.04] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]"
        >
          Track your code. <br />
          <span className="bg-gradient-to-r from-accent via-emerald-300 to-teal-200 bg-clip-text text-transparent font-extrabold filter drop-shadow-[0_4px_20px_rgba(16,185,129,0.35)]">
            Win your consistency.
          </span>
        </motion.h1>

        {/* Informative Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed"
        >
          The peer progress and friendly competition platform for engineering cohorts.
          Verify daily code momentum, observe multi-provider telemetry, and rank deterministically with zero fabrication.
        </motion.p>

        {/* Live Sunday Boundary Tournament Countdown Clock */}
        <motion.div variants={itemVariants} className="mt-10">
          <SundayCountdownClock />
        </motion.div>

        {/* Class Invite Code Gate */}
        <motion.div variants={itemVariants} id="invite" className="mt-10 max-w-md mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 p-2 rounded-2xl border border-white/15 bg-surface/90 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/30 focus-within:shadow-[0_0_35px_rgba(16,185,129,0.35)] transition-all duration-300"
          >
            <div className="pl-4 text-muted">
              <KeyRound className="h-5 w-5 text-accent" />
            </div>
            <input
              id="hero-invite-code"
              name="hero-invite-code"
              aria-label="Enter Class Code"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="CLASS CODE (e.g. CS2026)"
              maxLength={10}
              className="w-full bg-transparent border-none text-sm sm:text-base font-sans font-semibold text-white placeholder:text-muted focus:outline-none uppercase tracking-wider px-1 py-1"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-sans text-sm font-bold transition-all shrink-0 shadow-lg shadow-accent/30 cursor-pointer"
            >
              <span>Join</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.button>
          </form>
          <div className="mt-3.5 flex items-center justify-center gap-4 text-xs font-sans text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Verified Telemetry (Rule 1.2)
            </span>
            <span>|</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="h-3.5 w-3.5 text-accent" />
              1, 2, 2, 4 Tie Policy (Rule 9.6)
            </span>
          </div>
        </motion.div>

        {/* Hero Interactive Cockpit Preview Frame with Floating Badges */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-16 sm:mt-20 relative rounded-3xl p-[1px] bg-gradient-to-b from-white/20 via-white/5 to-white/0 shadow-[0_25px_80px_rgba(0,0,0,0.85)] group"
        >
          {/* Floating Live Badge 1: Quorum */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="hidden lg:flex absolute -top-5 -left-4 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface/90 border border-emerald-500/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(16,185,129,0.25)] text-xs font-sans text-white font-medium"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>42 / 60 Enrolled (70% Quorum Met)</span>
          </motion.div>

          {/* Floating Live Badge 2: Sunday Boundary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="hidden lg:flex absolute -top-5 -right-4 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface/90 border border-amber-500/30 backdrop-blur-xl shadow-[0_10px_30px_rgba(245,158,11,0.25)] text-xs font-sans text-white font-medium"
          >
            <Trophy className="h-3.5 w-3.5 text-amber-400" />
            <span>Sunday 23:59:59 IST Hard Boundary</span>
          </motion.div>

          <div className="relative rounded-3xl bg-surface/95 overflow-hidden p-2.5 sm:p-3">
            {/* Ambient Radial Highlight inside card */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

            {/* Browser Bar */}
            <div className="px-5 py-3.5 bg-surface-raised rounded-t-2xl border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/40" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/40" />
              </div>
              <div className="px-4 py-1.5 rounded-lg bg-surface border border-white/[0.08] text-xs font-sans font-medium text-slate-300 flex items-center gap-2 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>twm.class/cockpit/demo</span>
              </div>
              <span className="text-xs font-sans text-slate-400 font-medium">Deterministic View</span>
            </div>

            {/* Screenshot Image Container */}
            <div className="relative aspect-[16/9] w-full rounded-b-2xl overflow-hidden bg-canvas">
              <Image
                src="/twm_dashboard_view.png"
                alt="TWM Live Cockpit Dashboard"
                fill
                className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.015]"
                sizes="(max-width: 1400px) 100vw, 1150px"
                priority
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

