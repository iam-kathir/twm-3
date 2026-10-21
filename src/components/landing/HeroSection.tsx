"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Sparkles, Activity, ShieldCheck } from "lucide-react";

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
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden text-center">
      {/* Precision Ambient Atmosphere (Linear / Stripe style radial gradients) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-accent/[0.12] via-accent/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-tech-dots opacity-25 pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-5xl mx-auto px-4 sm:px-6"
      >
        {/* Technical Status Tag */}
        <motion.div variants={itemVariants} className="inline-flex items-center justify-center mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface-elevated/80 border border-white/10 text-xs sm:text-sm font-mono text-ink-secondary shadow-lg shadow-black/40 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-semibold text-white">TWM 3.1 Platform</span>
            <span className="text-white/20">•</span>
            <span className="text-muted">GitHub, LeetCode &amp; HackerRank Live Telemetry</span>
          </div>
        </motion.div>

        {/* Solid Authoritative Headline with Intentional Contrast */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-ink tracking-tight leading-[1.04]"
        >
          Track your code. <br />
          <span className="bg-gradient-to-r from-muted via-ink-secondary to-muted bg-clip-text text-transparent">
            Win your consistency.
          </span>
        </motion.h1>

        {/* Informative Subtitle */}
        <motion.p
          variants={itemVariants}
          className="mt-8 text-base sm:text-xl text-muted max-w-2xl mx-auto font-normal leading-relaxed"
        >
          The peer progress and friendly competition platform for engineering cohorts.
          Verify daily code momentum, observe multi-provider telemetry, and rank deterministically without fabricated vanity metrics.
        </motion.p>

        {/* Class Invite Code Gate */}
        <motion.div variants={itemVariants} id="invite" className="mt-12 max-w-md mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 p-2 rounded-2xl border border-white/10 bg-surface/90 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.6)] focus-within:border-accent/80 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.25)] transition-all duration-300"
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
              className="w-full bg-transparent border-none text-sm sm:text-base font-mono text-white placeholder:text-muted-soft focus:outline-none uppercase tracking-wider px-1 py-1"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-mono text-sm font-bold transition-colors shrink-0 shadow-lg shadow-accent/25 cursor-pointer"
            >
              <span>Join</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </motion.button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-mono text-muted">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Verified Telemetry (§1.2)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-accent" />
              1, 2, 2, 4 Tie Policy (§9.6)
            </span>
          </div>
        </motion.div>

        {/* Hero Interactive Cockpit Preview Frame */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="mt-16 sm:mt-20 relative rounded-2xl border border-white/10 bg-surface/90 p-2.5 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden hover:border-white/20 transition-all duration-300 group"
        >
          {/* Subtle Ambient Radial Glow on Preview Frame */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

          {/* Browser Bar */}
          <div className="px-5 py-3.5 bg-surface-raised rounded-t-xl border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/30" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
            </div>
            <div className="px-4 py-1 rounded-md bg-surface border border-white/[0.06] text-xs font-mono text-ink-secondary flex items-center gap-2 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>twm.class/cockpit/demo</span>
            </div>
            <span className="text-xs font-mono text-muted">Deterministic Demo Mode</span>
          </div>

          {/* Screenshot Image Container */}
          <div className="relative aspect-[16/9] w-full rounded-b-xl overflow-hidden bg-canvas">
            <Image
              src="/twm_dashboard_view.png"
              alt="TWM Live Cockpit Dashboard"
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-[1.01]"
              sizes="(max-width: 1400px) 100vw, 1150px"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
