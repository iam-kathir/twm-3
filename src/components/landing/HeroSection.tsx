"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowRight,
  KeyRound,
  Sparkles,
  Activity,
  ShieldCheck,
  Trophy,
  Zap,
  CheckCircle2,
  GitCommit,
  Flame,
  Radio
} from "lucide-react";
import { SundayCountdownClock } from "./SundayCountdownClock";
import { CyberConstellation } from "./CyberConstellation";
import { fireMilestoneBurst, fireTournamentCelebration } from "@/lib/celebrate";
import { toast } from "sonner";
import { AnimatedShinyText } from "@/components/ui/AnimatedShinyText";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
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

// Continuous floating spring animation variants
const floatVariant1 = {
  animate: {
    y: [0, -8, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const floatVariant2 = {
  animate: {
    y: [-4, 6, -4],
    transition: {
      duration: 4.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const floatVariant3 = {
  animate: {
    y: [0, -7, 0],
    transition: {
      duration: 3.6,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const LIVE_EVENTS = [
  { icon: Flame, text: "Aarav Sharma completed 6-Day Streak", tag: "Streak", color: "text-amber-400" },
  { icon: GitCommit, text: "Rohan Varma verified 7-day GitHub activity", tag: "GitHub", color: "text-sky-400" },
  { icon: Trophy, text: "Quorum Met: 70% threshold reached (Representative Board)", tag: "Quorum", color: "text-emerald-400" },
  { icon: Activity, text: "Sunday 23:59:59 IST Hard Boundary active (Week 42)", tag: "Boundary", color: "text-accent" },
  { icon: Zap, text: "Priya Nair verified +4 LeetCode Hard problems", tag: "LeetCode", color: "text-amber-400" },
  { icon: ShieldCheck, text: "Zero Fabrication: 100% telemetry grounded in SQLite WAL", tag: "Integrity", color: "text-emerald-400" },
];

export function HeroSection() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inviteCode.trim();
    if (!clean) return;
    fireMilestoneBurst(0.5, 0.4);
    toast.success(`Joining cohort with code ${clean}...`);
    setTimeout(() => {
      router.push(`/onboarding?class=${encodeURIComponent(clean)}`);
    }, 400);
  };

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-28 overflow-hidden text-center">
      {/* 3D WebGL Cybernetic Constellation Mesh Background */}
      <CyberConstellation />

      {/* Dynamic ambient lighting orbs with breathing motion */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.18, 0.28, 0.18],
        }}
        transition={{
          repeat: Infinity,
          duration: 7,
          ease: "easeInOut",
        }}
        className="absolute -top-36 left-1/2 -translate-x-1/2 w-[850px] h-[480px] rounded-full bg-accent/20 blur-[140px] pointer-events-none"
      />
      <div className="absolute top-1/3 left-1/4 w-[420px] h-[320px] rounded-full bg-sky-500/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[300px] rounded-full bg-emerald-500/10 blur-[130px] pointer-events-none" />

      {/* Subtle tech dot overlay */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-tech-dots opacity-25 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10"
      >
        {/* Shimmering Launch Pill with Interactive Celebration Trigger */}
        <motion.div variants={itemVariants} className="inline-block mb-6">
          <button
            type="button"
            onClick={() => {
              fireMilestoneBurst(0.5, 0.2);
              toast.info("Class Cohort Pilot 2026 Engine Ready • Rule §9.1 Verified");
            }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-accent/30 bg-surface/80 backdrop-blur-xl text-xs font-sans font-semibold text-accent shadow-sm hover:border-accent/60 hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <AnimatedShinyText className="text-accent font-semibold">
              Class Cohort Competition Pilot 2026
            </AnimatedShinyText>
            <span className="text-white/20">|</span>
            <span className="text-slate-300 font-medium group-hover:text-white transition-colors">Audited Rule 9.1</span>
            <Sparkles className="h-3 w-3 text-accent group-hover:rotate-12 transition-transform" />
          </button>
        </motion.div>

        {/* Headline: Crisp typography with glowing precision emerald accent */}
        <motion.h1
          variants={itemVariants}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.06]"
        >
          Track your code.
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-accent to-emerald-300 drop-shadow-[0_2px_18px_rgba(16,185,129,0.35)]">
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
            className="flex items-center gap-2.5 p-2 rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-xl focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/25 transition-all duration-200 shadow-panel"
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
              placeholder="Class code (e.g. CS2026)"
              maxLength={10}
              className="w-full bg-transparent border-none text-sm sm:text-base font-sans font-semibold text-ink placeholder:text-muted placeholder:font-normal focus:outline-none px-1 py-1"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-sans text-sm font-semibold transition-colors shrink-0 cursor-pointer shadow-md"
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

        {/* Hero Interactive Cockpit Preview Frame with Floating HUD Badges & Laser Border Beam */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -6, scale: 1.008 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="mt-16 sm:mt-20 relative rounded-3xl p-[1px] overflow-hidden group shadow-overlay"
        >
          {/* Animated laser border beam around the entire cockpit preview */}
          <div
            className="absolute -inset-[200%] animate-border-beam pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 280deg, #10B981 330deg, #38BDF8 360deg)",
            }}
          />

          <div className="relative rounded-[23px] bg-surface/95 backdrop-blur-2xl p-1.5 sm:p-2.5 border border-white/[0.08] overflow-hidden">

          {/* Floating Live Badge 1: Quorum */}
          <motion.div
            variants={floatVariant1}
            animate="animate"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fireMilestoneBurst(0.2, 0.5);
              toast.info("Authoritative Roster Quorum: 70% threshold verified (§3.3)");
            }}
            className="hidden lg:flex absolute -top-5 -left-5 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface/95 backdrop-blur-xl border border-emerald-500/35 text-xs font-sans text-ink font-semibold shadow-lg cursor-pointer transition-colors hover:border-emerald-500/70"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span>42 / 60 Enrolled</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-bold border border-emerald-500/25">
              70% Quorum Met
            </span>
          </motion.div>

          {/* Floating Live Badge 2: Sunday Boundary */}
          <motion.div
            variants={floatVariant2}
            animate="animate"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fireTournamentCelebration();
              toast.success("Tournament Celebration! Sunday 23:59:59 IST Hard Boundary active (§9.1)");
            }}
            className="hidden lg:flex absolute -top-5 -right-5 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface/95 backdrop-blur-xl border border-amber-500/35 text-xs font-sans text-ink font-semibold shadow-lg cursor-pointer transition-colors hover:border-amber-500/70"
          >
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Sunday 23:59:59 IST</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold border border-amber-500/25">
              Hard Boundary
            </span>
          </motion.div>

          {/* Floating Live Badge 3: Telemetry Stream Pulse */}
          <motion.div
            variants={floatVariant3}
            animate="animate"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              fireMilestoneBurst(0.8, 0.7);
              toast.info("Telemetry Stream Active: Live sync with GitHub, LeetCode, and HackerRank adapters");
            }}
            className="hidden lg:flex absolute -bottom-5 -right-4 z-20 items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-surface/95 backdrop-blur-xl border border-sky-500/35 text-xs font-sans text-ink font-semibold shadow-lg cursor-pointer transition-colors hover:border-sky-500/70"
          >
            <Radio className="h-4 w-4 text-sky-400 animate-pulse" />
            <span>Telemetry Stream:</span>
            <span className="font-mono text-sky-400 text-xs font-bold">+14 Commits · 6 Problems</span>
          </motion.div>

          {/* Browser Mockup Window */}
          <div className="relative rounded-2xl bg-surface overflow-hidden border border-white/[0.06]">
            {/* Browser Bar */}
            <div className="px-5 py-3.5 bg-surface-raised/90 rounded-t-2xl border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/30 border border-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500/40" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/40" />
              </div>
              <div className="px-4 py-1.5 rounded-lg bg-surface border border-white/[0.08] text-xs font-sans font-medium text-slate-300 flex items-center gap-2 shadow-inner">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>twm.class/cockpit/demo</span>
              </div>
              <span className="text-xs font-sans text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Audited Deterministic View
              </span>
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
        </div>
      </motion.div>

        {/* Live Running Telemetry Event Ticker Ribbon */}
        <motion.div
          variants={itemVariants}
          className="mt-12 relative overflow-hidden py-3 rounded-2xl bg-surface/50 border border-white/[0.06] backdrop-blur-md"
        >
          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-canvas via-canvas/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-canvas via-canvas/80 to-transparent z-10 pointer-events-none" />

          {/* Running marquee track */}
          <div className="flex items-center gap-8 animate-marquee whitespace-nowrap">
            {[...LIVE_EVENTS, ...LIVE_EVENTS].map((event, idx) => {
              const Icon = event.icon;
              return (
                <div key={idx} className="flex items-center gap-2.5 text-xs font-sans font-medium text-slate-300 shrink-0">
                  <Icon className={`h-4 w-4 ${event.color}`} />
                  <span>{event.text}</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08] text-[10px] text-muted font-mono uppercase">
                    {event.tag}
                  </span>
                  <span className="text-white/10 mx-2">•</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
