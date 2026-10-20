"use client";

import React from "react";
import { motion } from "framer-motion";
import { KeyRound, ShieldCheck, Trophy, ArrowRight } from "lucide-react";

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/10 text-accent border border-accent/20 text-xs font-mono mb-3">
            <span>Deterministic Flow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-muted">
            A frictionless, privacy-conscious 3-step onboarding.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl border border-white/[0.08] bg-surface hover:border-white/20 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-accent">
                      STEP {step.num}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-surface-raised border border-white/[0.06] flex items-center justify-center text-muted">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-ink mb-2">{step.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{step.desc}</p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-[11px] font-mono text-accent">
                  <span>Ready</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
