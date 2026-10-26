"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Github,
  Code2,
  Award,
  GitCommit,
  Trophy,
  ShieldCheck,
  Radio,
  Zap,
  CheckCircle2,
  Lock,
  Flame,
  ArrowRight
} from "lucide-react";
import { OrbitingCircles } from "@/components/ui/OrbitingCircles";
import { Meteors } from "@/components/ui/Meteors";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { AnimatedShinyText } from "@/components/ui/AnimatedShinyText";
import { fireMilestoneBurst } from "@/lib/celebrate";
import { toast } from "sonner";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function OrbitingTelemetryShowcase() {
  return (
    <section className="py-24 md:py-36 relative overflow-hidden bg-canvas border-t border-white/[0.08]">
      {/* 21st.dev Falling Shooting Star Meteors */}
      <Meteors number={18} />

      {/* Dynamic Ambient Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/[0.07] rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header with Animated Shiny Text */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-surface/80 backdrop-blur-xl mb-4 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-accent animate-ping" />
            <AnimatedShinyText className="text-xs font-sans font-bold text-accent">
              21st.dev Architecture • Orbiting Verification Engine
            </AnimatedShinyText>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Deterministic Orbital Core
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 font-sans leading-relaxed">
            Multi-platform telemetry streams orbit around an authoritative SQLite core, validating student activity with cryptographic zero-fabrication.
          </p>
        </div>

        {/* 21st.dev Bento Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Visual: Orbiting Circles Component (7 Cols) */}
          <SpotlightCard
            spotlightColor="rgba(16, 185, 129, 0.18)"
            className="lg:col-span-7 flex flex-col items-center justify-center p-8 sm:p-12 min-h-[460px] relative overflow-hidden"
          >
            {/* Ambient Radial Spotlight inside Card */}
            <div className="absolute inset-0 bg-radial-gradient from-accent/[0.08] to-transparent pointer-events-none" />

            <div className="relative flex h-[380px] w-full max-w-[420px] items-center justify-center overflow-hidden">
              {/* Central Glowing Core: TWM Brand Mark */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  fireMilestoneBurst(0.5, 0.5);
                  toast.success("TWM Verified Engine Core: SHA-256 HMAC & Boundary Guard Active");
                }}
                className="z-20 flex size-20 items-center justify-center rounded-3xl bg-surface-raised border border-accent/40 shadow-[0_0_35px_rgba(16,185,129,0.35)] cursor-pointer group"
              >
                <BrandLogo variant="mark" size="lg" showLivePulse={true} />
              </motion.div>

              {/* Inner Orbit (Radius 100, 24s) */}
              <OrbitingCircles radius={100} duration={24} delay={0}>
                <div
                  title="GitHub Live Commits"
                  onClick={() => toast.info("GitHub Adapter: 7-Day Contribution Frequency")}
                  className="flex size-10 items-center justify-center rounded-2xl border border-sky-500/30 bg-surface shadow-md cursor-pointer hover:scale-110 transition-transform"
                >
                  <Github className="size-5 text-sky-400" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles radius={100} duration={24} delay={8}>
                <div
                  title="LeetCode Snapshots"
                  onClick={() => toast.info("LeetCode Adapter: Cumulative Delta via GraphQL")}
                  className="flex size-10 items-center justify-center rounded-2xl border border-amber-500/30 bg-surface shadow-md cursor-pointer hover:scale-110 transition-transform"
                >
                  <Code2 className="size-5 text-amber-400" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles radius={100} duration={24} delay={16}>
                <div
                  title="HackerRank Verified Proof"
                  onClick={() => toast.info("HackerRank Adapter: Cryptographic Proof Digest")}
                  className="flex size-10 items-center justify-center rounded-2xl border border-emerald-500/30 bg-surface shadow-md cursor-pointer hover:scale-110 transition-transform"
                >
                  <Award className="size-5 text-emerald-400" />
                </div>
              </OrbitingCircles>

              {/* Outer Orbit (Radius 165, 34s, Reversed) */}
              <OrbitingCircles radius={165} duration={34} reverse delay={0}>
                <div
                  title="Verified Commit Rule §9.1"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-surface/90 text-slate-300 shadow-sm"
                >
                  <GitCommit className="size-4 text-emerald-400" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles radius={165} duration={34} reverse delay={8.5}>
                <div
                  title="Tournament Trophy §9.6"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-surface/90 text-slate-300 shadow-sm"
                >
                  <Trophy className="size-4 text-amber-400" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles radius={165} duration={34} reverse delay={17}>
                <div
                  title="Deterministic Proof §10.1"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-surface/90 text-slate-300 shadow-sm"
                >
                  <ShieldCheck className="size-4 text-sky-400" />
                </div>
              </OrbitingCircles>
              <OrbitingCircles radius={165} duration={34} reverse delay={25.5}>
                <div
                  title="Telemetry Stream §5.1"
                  className="flex size-9 items-center justify-center rounded-xl border border-white/10 bg-surface/90 text-slate-300 shadow-sm"
                >
                  <Radio className="size-4 text-accent animate-pulse" />
                </div>
              </OrbitingCircles>
            </div>

            <div className="mt-4 text-center z-10">
              <span className="text-xs font-mono text-muted flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-ping" />
                Continuous Real-Time Telemetry Synchronization
              </span>
            </div>
          </SpotlightCard>

          {/* Side Bento Cards (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Card 1: Quorum Demarcation */}
            <SpotlightCard
              spotlightColor="rgba(56, 189, 248, 0.16)"
              className="p-6 sm:p-7 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/25 text-sky-400 text-xs font-mono font-bold">
                    Rule §3.3
                  </span>
                  <ShieldCheck className="h-4 w-4 text-sky-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-sans">
                  Authoritative Roster Quorum
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  Denominator is strictly the enrolled cohort roster. Only cohorts meeting the 70% threshold earn the official &quot;Representative Class Leaderboard&quot; badge.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Class Representation:</span>
                <span className="text-emerald-400 font-bold">Verified &ge; 70%</span>
              </div>
            </SpotlightCard>

            {/* Card 2: 1, 2, 2, 4 Competition Ranking */}
            <SpotlightCard
              spotlightColor="rgba(245, 158, 11, 0.16)"
              className="p-6 sm:p-7 flex-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-mono font-bold">
                    Rule §9.6
                  </span>
                  <Trophy className="h-4 w-4 text-amber-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-sans">
                  Deterministic Standard Ranking
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  Ties share ranks honestly with standard competition skips (1, 2, 2, 4) and alphabetical secondary sorting. No arbitrary hidden ties or join-date favoritism.
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Tie Secondary Sort:</span>
                <span className="text-amber-400 font-bold">Alphabetical Handle</span>
              </div>
            </SpotlightCard>
          </div>
        </div>
      </div>
    </section>
  );
}
