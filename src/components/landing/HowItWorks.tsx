"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Trophy } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      icon: KeyRound,
      title: "OAuth & Roster Check",
      desc: "Sign in with GitHub and match against your class roster. Zero passwords collected.",
    },
    {
      num: "02",
      icon: ShieldCheck,
      title: "HMAC Bio Challenge",
      desc: "Prove ownership of LeetCode/HackerRank with a 15-minute challenge token in your bio.",
    },
    {
      num: "03",
      icon: Trophy,
      title: "Track & Compete",
      desc: "View verified active days, weekly recaps, and opt-in peer leaderboards.",
    },
  ];

  return (
    <section id="workflow" className="py-16 md:py-24 relative border-t border-white/[0.08] bg-canvas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Left-aligned header: deliberately not centred, so this section does not
            repeat the rhythm of the platform matrix above it. */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-14">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
              Deterministic flow
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Three steps. No passwords.
            </h2>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-sm md:text-right">
            Every claim is verified against a provider before it counts on a leaderboard.
          </p>
        </div>

        {/* Horizontal rail on desktop, stacked on mobile. Hairlines replace card chrome. */}
        <ol className="relative grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden
            className="hidden md:block absolute top-[22px] left-6 right-6 h-px bg-white/[0.08]"
          />
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                className="relative flex flex-col"
              >
                <span className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-surface font-mono text-xs font-bold text-accent">
                  {step.num}
                </span>
                <h3 className="mt-5 flex items-center gap-2 text-base font-bold text-ink">
                  <Icon className="h-4 w-4 text-muted" />
                  {step.title}
                </h3>
                <p className="mt-2 text-xs text-muted leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
