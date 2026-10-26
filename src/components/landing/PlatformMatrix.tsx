"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github, Code2, Award, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export function PlatformMatrix() {
  const platforms = [
    {
      name: "GitHub",
      icon: Github,
      iconColor: "text-white",
      status: "SUPPORTED_LIVE",
      statusClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      description: "Direct OAuth identity verification and public contribution calendar metrics.",
      fields: [
        { name: "Active Contribution Days", state: "Live / Verified", period: "Provider UTC Days" },
        { name: "Retrieval Coverage", state: "Audited", period: "Min 90% required" },
        { name: "Private Repo Code", state: "Excluded", period: "Zero surveillance" },
      ],
      cadence: "Sync every 6h + rate-limited manual sync",
    },
    {
      name: "LeetCode",
      icon: Code2,
      iconColor: "text-provider-leetcode-brand",
      status: "SUPPORTED_SNAPSHOT",
      statusClass: "bg-accent/10 text-accent border-accent/20",
      description: "HMAC profile bio challenge verification with cumulative problem-solving snapshots.",
      fields: [
        { name: "Cumulative Solved Count", state: "Verified Snapshot", period: "Continuous" },
        { name: "Weekly Problem Delta", state: "Boundary Rule", period: "Sun 23:45 IST check" },
        { name: "Submission History", state: "Phase 0 Gate", period: "Cumulative only" },
      ],
      cadence: "Sync every 3h + Sunday pre-close observation",
    },
    {
      name: "HackerRank",
      icon: Award,
      iconColor: "text-provider-hackerrank",
      status: "LIMITED_CAPABILITY",
      statusClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      description: "Community profile badges and domain star ratings with honest capability gating.",
      fields: [
        { name: "Domain Badges & Stars", state: "Display Only", period: "Cumulative" },
        { name: "Competitive Ranking", state: "Disabled", period: "Pending Phase 0 gate" },
        { name: "Ownership Verification", state: "Manual Challenge", period: "In Review" },
      ],
      cadence: "Periodic refresh for active class members",
    },
  ];

  return (
    <section id="platforms" className="py-20 md:py-32 border-t border-white/[0.08] bg-canvas relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-mono font-medium mb-3 shadow-sm">
            <Layers className="h-4 w-4" />
            <span>Multi-Provider Invariants (§5.1)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-ink tracking-tight">
            Independent Provider Adapters
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            TWM never guesses APIs or fudges missing timestamps. Each provider operates under isolated adapters, capability states, and rate limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {platforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                className="rounded-2xl border border-white/10 bg-surface/90 p-7 sm:p-8 flex flex-col justify-between hover:border-white/20 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-surface-raised border border-white/10 shadow-inner">
                        <Icon className={`h-6 w-6 ${platform.iconColor}`} />
                      </div>
                      <h3 className="font-extrabold text-ink text-xl">{platform.name}</h3>
                    </div>
                    <span className={`text-xs font-mono px-3 py-1 rounded-full border font-semibold tracking-wide ${platform.statusClass}`}>
                      {platform.status}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-muted mb-7 leading-relaxed font-sans">
                    {platform.description}
                  </p>

                  <div className="space-y-2.5 mb-7">
                    <span className="text-xs font-mono text-muted uppercase tracking-wider block font-semibold">
                      Tracked Fields &amp; Semantics:
                    </span>
                    {platform.fields.map((field, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center justify-between p-3 rounded-xl bg-surface-raised/70 border border-white/[0.05] text-xs sm:text-sm font-mono"
                      >
                        <span className="text-ink font-medium">{field.name}</span>
                        <span className="text-xs text-muted-soft bg-surface px-2.5 py-1 rounded-md border border-white/[0.06] font-mono">
                          {field.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.08] text-xs sm:text-sm font-mono text-muted">
                  <span className="text-muted block mb-1">Cadence:</span>
                  <span className="text-ink font-semibold">{platform.cadence}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
