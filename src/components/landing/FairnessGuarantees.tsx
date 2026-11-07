"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Scale, ShieldCheck, Eye, Lock } from "lucide-react";

const pillars = [
  {
    icon: AlertCircle,
    title: "Missing data is never zero",
    desc: "Rate limits, outages, or private days are never converted into zero. Standing is never penalised for a missing observation.",
    tag: "Rule 7.3",
    accent: "text-brand-secondary",
  },
  {
    icon: Scale,
    title: "One platform, one truth",
    desc: "GitHub commits and LeetCode problems are unlike metrics. They are never combined into an invented composite score.",
    tag: "Rule 9.8",
    accent: "text-provider-github",
  },
  {
    icon: ShieldCheck,
    title: "Deterministic ties",
    desc: "Equal performance shares the same rank (1, 2, 2, 4). No secret tie-breakers and no bias by join date.",
    tag: "Rule 9.6",
    accent: "text-emerald-400",
  },
  {
    icon: Eye,
    title: "Disputes are audited in the open",
    desc: "A disputed observation is logged and resolved under two-person admin review. The original row stands until the outcome is recorded.",
    tag: "Rule 9.7",
    accent: "text-amber-400",
  },
  {
    icon: Lock,
    title: "Opt-out is respected",
    desc: "Leaderboard participation is opt-in. Private repositories stay private, and telemetry never becomes surveillance.",
    tag: "Privacy",
    accent: "text-provider-hackerrank",
  },
];

export function FairnessGuarantees() {
  return (
    <section id="pillars" className="scroll-mt-24 py-12 md:py-16 border-t border-white/[0.08] bg-canvas">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-12">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold text-brand-secondary">Fairness guarantees</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Fairness is a data rule, not a promise.
          </h2>
          <p className="mt-3 text-base text-muted leading-relaxed max-w-sm">
            Five rules are enforced before a number reaches a leaderboard — not explained after someone questions it.
          </p>
        </div>

        <ul className="border-t border-white/[0.08]">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.tag + item.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4, delay: idx * 0.05, ease: "easeOut" }}
                className="grid grid-cols-[4.5rem_1fr] gap-4 border-b border-white/[0.08] py-6"
              >
                <span className="pt-0.5 font-mono text-sm font-bold text-emerald-400">{item.tag}</span>
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                    <Icon className={`h-4 w-4 shrink-0 ${item.accent}`} aria-hidden="true" />
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted leading-relaxed max-w-prose">{item.desc}</p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
