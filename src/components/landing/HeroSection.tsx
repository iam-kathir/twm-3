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

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        {/* Technical Status Tag */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#111319] border border-white/[0.08] text-xs font-mono text-[#C8CDD6] mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
          <span>Classroom Developer Telemetry</span>
          <span className="text-white/20">•</span>
          <span className="text-[#8D94A5]">GitHub, LeetCode &amp; HackerRank</span>
        </motion.div>

        {/* Solid Authoritative Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-[#F5F6F8] tracking-tight leading-[1.08]"
        >
          Track your code. <br />
          <span className="text-[#8D94A5]">Win your consistency.</span>
        </motion.h1>

        {/* Informative Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="mt-6 text-base sm:text-lg text-[#8D94A5] max-w-xl mx-auto font-normal leading-relaxed"
        >
          The peer progress platform for engineering classes. Connect your developer profiles, track real active days, and compare verified progress without toxic gamification.
        </motion.p>

        {/* Class Invite Code Gate */}
        <motion.div
          id="invite"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-10 max-w-sm mx-auto"
        >
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-white/10 bg-[#111319] shadow-xl focus-within:border-[#F59E0B] transition-all"
          >
            <div className="pl-3.5 text-[#8D94A5]">
              <KeyRound className="h-4 w-4" />
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
              className="w-full bg-transparent border-none text-xs sm:text-sm font-mono text-white placeholder:text-[#4B5262] focus:outline-none uppercase tracking-wider"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F59E0B] hover:bg-[#D97706] text-[#090A0E] font-mono text-xs font-bold transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              Join
              <ArrowRight className="h-3 w-3" />
            </button>
          </form>
        </motion.div>

        {/* Hero Interactive Cockpit Preview Frame */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="mt-14 relative rounded-2xl border border-white/[0.08] bg-[#111319] p-2 sm:p-2.5 shadow-2xl overflow-hidden hover:border-white/[0.14] transition-colors"
        >
          {/* Browser Bar */}
          <div className="px-4 py-2 bg-[#181B23] rounded-t-xl border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E3440]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E3440]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E3440]" />
            </div>
            <div className="px-4 py-0.5 rounded-md bg-[#111319] border border-white/[0.06] text-[10px] font-mono text-[#8D94A5]">
              Dashboard preview
            </div>
            <span className="text-[10px] font-mono text-[#8D94A5]">Illustrative data</span>
          </div>

          {/* Screenshot Image Container */}
          <div className="relative aspect-[16/9] w-full rounded-b-xl overflow-hidden bg-[#090A0E]">
            <Image
              src="/twm_dashboard_view.png"
              alt="TWM Live Cockpit Dashboard"
              fill
              className="object-cover object-top"
              sizes="(max-width: 1200px) 100vw, 896px"
              priority
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

