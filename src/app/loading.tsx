"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Activity } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function Loading() {
  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Flat instrument panel: opaque surface, one hairline border, no glass/glow. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        className="relative z-10 w-full max-w-md p-8 rounded-panel border border-border bg-surface shadow-panel text-center"
      >
        {/* Static brand mark: no live claim while loading. */}
        <div className="relative mx-auto mb-6 flex flex-col items-center justify-center">
          <div className="relative z-10 flex items-center justify-center">
            <BrandLogo variant="horizontal" size="xl" href="" showLivePulse={false} />
          </div>
        </div>

        <p className="text-xs sm:text-sm font-sans text-muted">
          Institutional Developer Telemetry Platform
        </p>

        {/* Solid accent progress: indeterminate loading only, never a completed state. */}
        <div className="mt-6 relative h-1.5 w-full bg-ink/5 rounded-full overflow-hidden border border-border-subtle">
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.6,
              ease: "easeInOut",
            }}
            className="h-full w-1/2 rounded-full bg-brand-secondary"
          />
        </div>

        {/* Status hint (static dot, no attention loop). */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs font-sans text-ink-secondary">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-brand-secondary" />
          <span>Hydrating verified cohort telemetry...</span>
        </div>

        {/* Guaranteed Invariant Badges */}
        <div className="mt-6 pt-5 border-t border-border-subtle flex items-center justify-center gap-4 text-xs font-sans text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-brand-primary" />
            Zero Fabrication
          </span>
          <span className="text-ink/20">•</span>
          <span className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 shrink-0 text-brand-secondary" />
            Sunday Boundary Engine
          </span>
        </div>
      </motion.div>
    </div>
  );
}
