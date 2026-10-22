"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, AlertCircle } from "lucide-react";

export function FairnessGuarantees() {
  const pillars = [
    {
      icon: AlertCircle,
      title: "Missing Data is Never Zero",
      desc: "API rate limits, provider outages, or private days are never converted into zero. Standing is never unfairly penalized.",
      tag: "Rule 7.3",
      accent: "text-accent",
    },
    {
      icon: Scale,
      title: "Platform-Specific Truth",
      desc: "GitHub commits and LeetCode problems are unlike metrics. We never combine them into an arbitrary fiction score.",
      tag: "Rule 9.8",
      accent: "text-provider-github",
    },
    {
      icon: ShieldCheck,
      title: "Deterministic Ties",
      desc: "Equal performance shares the same rank (1, 2, 2, 4). No secret tie-breakers or bias by join date.",
      tag: "Rule 9.6",
      accent: "text-emerald-400",
    },
  ];

  return (
    <section id="pillars" className="py-16 md:py-24 relative border-t border-white/[0.08] bg-canvas">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] lg:gap-16">
        {/* Asymmetric split: statement on the left, rule rows on the right. */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
            Fairness is a data rule, not a promise.
          </h2>
          <p className="mt-4 text-sm text-muted leading-relaxed max-w-sm">
            Three non-negotiable rules baked into the platform architecture. They are enforced
            before a number reaches a leaderboard, not explained after someone questions it.
          </p>
        </div>

        <ul className="border-t border-white/[0.08]">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.tag}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.45, delay: idx * 0.07, ease: "easeOut" }}
                className="grid grid-cols-[3.25rem_1fr] gap-4 border-b border-white/[0.08] py-7"
              >
                <span className="pt-0.5 font-sans font-semibold text-xs text-emerald-400">{item.tag}</span>
                <div>
                  <h3 className="flex items-center gap-2 text-base font-bold text-ink">
                    <Icon className={`h-4 w-4 ${item.accent}`} />
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted leading-relaxed max-w-prose">
                    {item.desc}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
