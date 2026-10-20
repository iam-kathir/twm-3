"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Scale, AlertCircle } from "lucide-react";

export function FairnessGuarantees() {
  const pillars = [
    {
      icon: AlertCircle,
      title: "Missing Data != Zero",
      desc: "API rate limits, provider outages, or private days are never converted into zero. Standing is never unfairly penalized.",
      tag: "Rule §7.3",
      accent: "text-[#F59E0B]",
    },
    {
      icon: Scale,
      title: "Platform-Specific Truth",
      desc: "GitHub commits and LeetCode problems are unlike metrics. We never combine them into an arbitrary fiction score.",
      tag: "Rule §9.8",
      accent: "text-[#60A5FA]",
    },
    {
      icon: ShieldCheck,
      title: "Deterministic Ties",
      desc: "Equal performance shares the same rank (1, 2, 2, 4). No secret tie-breakers or bias by join date.",
      tag: "Rule §9.6",
      accent: "text-emerald-400",
    },
  ];

  return (
    <section id="pillars" className="py-16 md:py-24 relative border-t border-white/[0.08] bg-[#090A0E]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs font-mono mb-3">
            <span>Integrity Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#F5F6F8] tracking-tight">
            Fairness Guarantees
          </h2>
          <p className="mt-2 text-sm text-[#8D94A5]">
            Three non-negotiable rules baked into the platform architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="p-6 rounded-2xl border border-white/[0.08] bg-[#111319] hover:border-white/20 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-[#181B23] border border-white/[0.06]">
                      <Icon className={`h-5 w-5 ${item.accent}`} />
                    </div>
                    <span className="text-[10px] font-mono text-[#8D94A5] bg-[#181B23] px-2 py-0.5 rounded border border-white/[0.06]">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[#F5F6F8] mb-2">{item.title}</h3>
                  <p className="text-xs text-[#8D94A5] leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
