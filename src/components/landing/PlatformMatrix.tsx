"use client";

import React from "react";
import { Github, Code2, Award, CheckCircle2, AlertTriangle, Layers } from "lucide-react";

export function PlatformMatrix() {
  const platforms = [
    {
      name: "GitHub",
      icon: Github,
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
      status: "SUPPORTED_SNAPSHOT",
      statusClass: "bg-amber-500/10 text-accent border-amber-500/20",
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
    <section id="platforms" className="py-16 md:py-24 border-t border-white/[0.08] bg-canvas relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-accent/10 text-accent border border-accent/20 text-xs font-mono mb-3">
            <Layers className="h-3.5 w-3.5" />
            <span>Phase 0 Capability Matrix</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">
            Independent Provider Adapters
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted">
            TWM does not assume APIs exist or fudge missing timestamps. Each provider operates under isolated adapters, capability states, and rate limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {platforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-surface p-6 flex flex-col justify-between hover:border-white/20 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-surface-raised border border-white/10 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-ink text-base">{platform.name}</h3>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${platform.statusClass}`}>
                      {platform.status}
                    </span>
                  </div>

                  <p className="text-xs text-muted mb-6 leading-relaxed">
                    {platform.description}
                  </p>

                  <div className="space-y-2.5 mb-6">
                    <span className="text-[11px] font-mono text-muted-soft uppercase tracking-wider block">
                      Tracked Fields &amp; Semantics:
                    </span>
                    {platform.fields.map((field, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface-raised border border-white/[0.05] text-xs font-mono"
                      >
                        <span className="text-ink-secondary">{field.name}</span>
                        <span className="text-[10px] text-muted bg-surface px-2 py-0.5 rounded border border-white/[0.04]">
                          {field.state}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06] text-[11px] font-mono text-muted">
                  <span className="text-muted-soft block mb-0.5">Cadence:</span>
                  <span className="text-ink-secondary">{platform.cadence}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
