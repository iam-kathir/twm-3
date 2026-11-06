"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Trophy } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: KeyRound,
    title: "OAuth and roster check",
    desc: "Sign in with GitHub and match against your class roster. Zero passwords collected.",
  },
  {
    num: "02",
    icon: ShieldCheck,
    title: "HMAC bio challenge",
    desc: "Prove ownership of LeetCode or HackerRank with a 15-minute challenge token in your bio.",
  },
  {
    num: "03",
    icon: Trophy,
    title: "Track and compete",
    desc: "See verified active days, weekly recaps, and opt-in peer leaderboards.",
  },
];

export function HowItWorks() {
  return (
    <section id="workflow" className="scroll-mt-24 py-12 md:py-16 border-t border-white/[0.08] bg-canvas">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <p className="text-sm font-semibold text-accent">Deterministic flow</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
              Three steps. No passwords.
            </h2>
          </div>
          <p className="text-sm text-muted leading-relaxed max-w-sm md:text-right">
            Every claim is verified against a provider before it counts on a leaderboard.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.li
                key={step.num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.45, delay: idx * 0.07, ease: "easeOut" }}
                className="border-t border-white/[0.08] pt-5"
              >
                <span className="font-mono text-sm font-bold text-accent">{step.num}</span>
                <h3 className="mt-3 flex items-center gap-2 text-base font-bold text-ink">
                  <Icon className="h-4 w-4 text-muted shrink-0" aria-hidden="true" />
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted leading-relaxed max-w-xs">{step.desc}</p>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
