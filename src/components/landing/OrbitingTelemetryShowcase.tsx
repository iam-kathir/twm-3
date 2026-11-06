"use client";

import React from "react";
import Link from "next/link";

// Recomposed (FE-3): formerly an orbiting/meteor/spotlight showcase.
// Now a flat, readable rules table. No Three.js, no orbiting, no gradients.
// Export name kept so page composition is unchanged.

const rules = [
  {
    tag: "Rule 3.3",
    title: "Quorum decides the leaderboard label",
    desc: "The denominator is the enrolled roster. At 70% or more verified and opted-in, the board is labelled Representative Class Leaderboard. Below that, it is labelled Participating Members Leaderboard.",
  },
  {
    tag: "Rule 9.6",
    title: "Ties rank 1, 2, 2, 4",
    desc: "Equal performance shares one rank with a tie badge, with alphabetical order as the only secondary sort. No join-date or hidden tie-breakers.",
  },
  {
    tag: "Rule 9.7",
    title: "Disputes get a second pair of eyes",
    desc: "A disputed observation is logged and reviewed under two-person admin audit. The original telemetry stands unchanged until the dispute is resolved.",
  },
  {
    tag: "Privacy",
    title: "Opt-in or it does not count",
    desc: "Participation is opt-in, private repositories are excluded, and no code is surveilled. Read the full policy before you join.",
  },
];

export function OrbitingTelemetryShowcase() {
  return (
    <section id="cohort-rules" className="scroll-mt-24 py-12 md:py-16 border-t border-white/[0.08] bg-canvas">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-semibold text-accent">Cohort standing rules</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          How cohort standing is decided
        </h2>
        <p className="mt-3 text-base text-muted leading-relaxed max-w-2xl">
          Four rules run before a number ever reaches a leaderboard. They are stated here in plain language, the
          same way they are enforced.
        </p>

        <ul className="mt-8 border-t border-white/[0.08]">
          {rules.map((rule) => (
            <li
              key={rule.title}
              className="grid grid-cols-[5.5rem_1fr] gap-4 border-b border-white/[0.08] py-6 sm:grid-cols-[7rem_1fr]"
            >
              <span className="pt-1 font-mono text-sm font-bold text-accent">{rule.tag}</span>
              <div>
                <h3 className="text-base font-bold text-ink">{rule.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed max-w-prose">{rule.desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-muted">
          <Link href="/privacy" className="font-semibold text-accent hover:underline">
            Read the privacy policy
          </Link>{" "}
          — opt-out, data use, and dispute rights.
        </p>
      </div>
    </section>
  );
}
