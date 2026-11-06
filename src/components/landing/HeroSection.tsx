"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, KeyRound, ShieldCheck } from "lucide-react";
import { SundayCountdownClock } from "./SundayCountdownClock";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
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
    <section className="relative pt-28 pb-12 md:pt-36 md:pb-16 overflow-hidden text-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative max-w-4xl mx-auto px-4 sm:px-6 z-10"
      >
        {/* Flat status label — no shimmer, no gradient */}
        <motion.p
          variants={itemVariants}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-surface text-sm font-medium text-muted"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          Class cohort pilot · Verified under Rule 9.1
        </motion.p>

        {/* Solid ink headline — no gradient text */}
        <motion.h1
          variants={itemVariants}
          className="mt-5 text-[30px] sm:text-5xl md:text-6xl font-extrabold text-ink tracking-tight leading-[1.08]"
        >
          Track your code. Win your consistency.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-5 text-base sm:text-lg text-muted max-w-2xl mx-auto leading-relaxed"
        >
          The peer progress and friendly competition platform for engineering cohorts. Verify daily code
          momentum, observe provider telemetry as it is, and rank deterministically — with zero fabrication.
        </motion.p>

        {/* Live Sunday boundary countdown (flat, no tilt/glow) */}
        <motion.div variants={itemVariants} className="mt-8">
          <SundayCountdownClock />
        </motion.div>

        {/* Class invite code gate */}
        <motion.div variants={itemVariants} id="invite" className="mt-8 max-w-md mx-auto">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-2 rounded-panel border border-white/10 bg-surface focus-within:border-accent/60 transition-colors"
          >
            <div className="pl-3 text-muted" aria-hidden="true">
              <KeyRound className="h-5 w-5 text-accent" />
            </div>
            <input
              id="hero-invite-code"
              name="hero-invite-code"
              aria-label="Enter class code"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="Class code (e.g. CS2026)"
              maxLength={10}
              className="w-full bg-transparent border-none text-base font-semibold text-ink placeholder:text-muted focus:outline-none px-1 py-2"
            />
            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center gap-2 px-5 py-2.5 rounded-control bg-accent hover:bg-accent-hover text-canvas text-sm font-semibold shrink-0"
            >
              <span>Join</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted">
            <ShieldCheck className="h-4 w-4 text-accent shrink-0" aria-hidden="true" />
            GitHub sign-in plus roster check. No passwords collected.
          </p>
        </motion.div>

        {/* Cockpit preview — one product image, labelled as demo data */}
        <motion.figure variants={itemVariants} className="mt-10 sm:mt-12">
          <div className="rounded-panel overflow-hidden border border-white/10 bg-surface">
            <div className="relative aspect-[16/9] w-full bg-canvas">
              <Image
                src="/twm_dashboard_view.png"
                alt="Sample TWM cockpit layout (demo data)"
                fill
                className="object-cover object-top"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
            <figcaption className="border-t border-white/[0.08] px-4 py-3 text-left text-sm text-muted">
              <span className="font-semibold text-ink">Demo data</span> — sample cockpit layout from the current
              build. Live numbers appear only after you verify and opt in.
            </figcaption>
          </div>
        </motion.figure>

        {/* Static rule strip instead of a fake live ticker */}
        <motion.ul variants={itemVariants} className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-muted">
          <li className="rounded-full border border-white/10 bg-surface px-3 py-1.5">Verified telemetry, nothing inferred</li>
          <li className="rounded-full border border-white/10 bg-surface px-3 py-1.5">Ties rank 1, 2, 2, 4</li>
          <li className="rounded-full border border-white/10 bg-surface px-3 py-1.5">Providers never merged into one score</li>
        </motion.ul>
      </motion.div>
    </section>
  );
}
