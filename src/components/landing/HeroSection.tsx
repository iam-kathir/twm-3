"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound } from "lucide-react";


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
    <section className="relative pt-24 pb-16 md:pt-24 md:pb-24 overflow-hidden text-center">
      {/* Precision Tech Dot Grid Background */}
      <div className="absolute inset-0 bg-tech-dots opacity-35 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Technical Status Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-surface border border-white/[0.08] text-xs sm:text-sm font-mono text-ink-secondary mb-8 shadow-sm"
        >
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Classroom Developer Telemetry</span>
          <span className="text-white/20">•</span>
          <span className="text-muted">GitHub, LeetCode &amp; HackerRank</span>
        </motion.div>

        {/* Solid Authoritative Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-ink tracking-tight leading-[1.06]"
        >
          Track your code. <br />
          <span className="text-muted">Win your consistency.</span>
        </motion.h1>

        {/* Informative Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-8 text-base sm:text-xl text-muted max-w-2xl mx-auto font-normal leading-relaxed"
        >
          The peer progress platform for engineering classes. Connect your developer profiles, track real active days, and compare verified progress without toxic gamification.
        </motion.p>

        {/* Class Invite Code Gate */}
        <motion.div
          id="invite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-12 max-w-md mx-auto"
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2.5 p-2 rounded-2xl border border-white/10 bg-surface shadow-2xl focus-within:border-accent transition-all"
          >
            <div className="pl-4 text-muted">
              <KeyRound className="h-5 w-5" />
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
              className="w-full bg-transparent border-none text-sm sm:text-base font-mono text-white placeholder:text-muted-dark focus:outline-none uppercase tracking-wider px-1 py-1"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-mono text-sm font-bold transition-all hover:scale-105 active:scale-95 shrink-0 shadow-lg shadow-accent/20"
            >
              Join
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </motion.div>

        {/* Hero Interactive Cockpit Preview Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-16 relative rounded-2xl border border-white/[0.08] bg-surface p-2.5 sm:p-3 shadow-2xl overflow-hidden hover:border-white/[0.14] transition-colors"
        >
          {/* Browser Bar */}
          <div className="px-5 py-3 bg-surface-raised rounded-t-xl border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2E3440]" />
              <span className="w-3 h-3 rounded-full bg-[#2E3440]" />
              <span className="w-3 h-3 rounded-full bg-[#2E3440]" />
            </div>
            <div className="px-5 py-1 rounded-md bg-surface border border-white/[0.06] text-xs font-mono text-ink-secondary">
              Dashboard preview
            </div>
            <span className="text-xs font-mono text-muted">Illustrative data</span>
          </div>

          {/* Screenshot Image Container */}
          <div className="relative aspect-[16/9] w-full rounded-b-xl overflow-hidden bg-canvas">
            <Image
              src="/twm_dashboard_view.png"
              alt="TWM Live Cockpit Dashboard"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1400px) 100vw, 1150px"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

