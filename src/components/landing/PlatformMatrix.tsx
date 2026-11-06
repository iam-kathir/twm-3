"use client";

import React from "react";
import { Github, Code2, Award } from "lucide-react";

const platforms = [
  {
    name: "GitHub",
    icon: Github,
    iconColor: "text-white",
    statusLabel: "Live",
    statusClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    description: "OAuth identity verification with public contribution calendar metrics.",
    fields: [
      { name: "Active contribution days", state: "Live / verified", window: "Provider UTC days" },
      { name: "Retrieval coverage", state: "Audited", window: "90% minimum" },
      { name: "Private repositories", state: "Excluded", window: "No surveillance" },
    ],
    cadence: "Sync every 6 hours, plus rate-limited manual sync",
  },
  {
    name: "LeetCode",
    icon: Code2,
    iconColor: "text-provider-leetcode-brand",
    statusLabel: "Snapshot",
    statusClass: "bg-accent/10 text-accent border-accent/20",
    description: "HMAC profile challenge verification with cumulative problem snapshots.",
    fields: [
      { name: "Cumulative solved count", state: "Verified snapshot", window: "Continuous" },
      { name: "Weekly problem delta", state: "Boundary rule", window: "Sunday 23:59:59 IST" },
      { name: "Submission history", state: "Cumulative only", window: "No per-problem timestamps" },
    ],
    cadence: "Sync every 3 hours, plus Sunday pre-close observation",
  },
  {
    name: "HackerRank",
    icon: Award,
    iconColor: "text-provider-hackerrank",
    statusLabel: "Limited",
    statusClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    description: "Badges and domain stars shown for display, with honest capability gating.",
    fields: [
      { name: "Domain badges and stars", state: "Display only", window: "Cumulative" },
      { name: "Weekly deltas", state: "Disabled", window: "No public timestamps" },
      { name: "Ownership verification", state: "Manual challenge", window: "In review" },
    ],
    cadence: "Periodic refresh for active class members",
  },
];

export function PlatformMatrix() {
  return (
    <section id="platforms" className="scroll-mt-24 py-12 md:py-16 border-t border-white/[0.08] bg-canvas">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-semibold text-accent">Provider capability parity</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Three providers, three honest states
        </h2>
        <p className="mt-3 text-base text-muted leading-relaxed max-w-2xl">
          Each provider keeps its own adapter and its own limits. HackerRank is display-only because it has no
          public timestamps — that limit is shown, not hidden.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <article
                key={platform.name}
                className="rounded-panel bg-surface border border-white/10 p-5 sm:p-6 flex flex-col"
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h3 className="flex items-center gap-2 font-extrabold text-ink text-base">
                    <Icon className={`h-5 w-5 ${platform.iconColor}`} aria-hidden="true" />
                    {platform.name}
                  </h3>
                  <span className={`text-sm px-3 py-1 rounded-full border font-semibold ${platform.statusClass}`}>
                    {platform.statusLabel}
                  </span>
                </div>

                <p className="text-sm text-muted leading-relaxed">{platform.description}</p>

                <div className="mt-5 space-y-0 border-t border-white/[0.08]">
                  {platform.fields.map((field) => (
                    <div
                      key={field.name}
                      className="flex items-start justify-between gap-3 py-3 border-b border-white/[0.08] text-sm"
                    >
                      <span className="text-ink font-medium">{field.name}</span>
                      <span className="text-muted text-right shrink-0">{field.state}</span>
                    </div>
                  ))}
                </div>

                <p className="mt-4 pt-4 border-t border-white/[0.08] text-sm">
                  <span className="text-muted block">Cadence:</span>
                  <span className="text-ink font-semibold">{platform.cadence}</span>
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
