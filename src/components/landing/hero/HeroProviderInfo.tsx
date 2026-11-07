"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Clock, ExternalLink } from "lucide-react";
import { ProviderMeta } from "./hero-constants";
import Link from "next/link";

interface HeroProviderInfoProps {
  provider: ProviderMeta | null;
  onClose: () => void;
}

export function HeroProviderInfo({ provider, onClose }: HeroProviderInfoProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <AnimatePresence>
      {provider && (
        <motion.div
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="absolute z-40 bottom-0 left-0 right-0 sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm rounded-2xl sm:rounded-3xl bg-surface-card/95 backdrop-blur-2xl border border-white/15 p-4 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
        >
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: provider.colorHex }}
              />
              <h3 className="text-sm font-bold text-white font-sans">
                {provider.name} Telemetry Adapter
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close adapter information"
              className="p-1 rounded-lg text-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-brand-secondary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-1 text-xs text-brand-secondary font-medium font-sans">
            {provider.tagline}
          </p>

          <p className="mt-2.5 text-xs text-slate-300 font-sans leading-relaxed">
            {provider.description}
          </p>

          {/* Technical Specs */}
          <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1.5 font-mono text-[11px]">
            <div className="flex items-center justify-between text-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-brand-highlight" />
                Rhythm
              </span>
              <span className="text-slate-200">{provider.rhythm}</span>
            </div>
            <div className="flex items-center justify-between text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-status-verified" />
                Standard
              </span>
              <span className="text-slate-200 text-right truncate max-w-[190px]">
                {provider.verificationProof}
              </span>
            </div>
          </div>

          {/* Action Link */}
          <div className="mt-3.5 flex items-center justify-between">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1 text-[11px] text-brand-secondary hover:text-white transition-colors"
            >
              <span>Telemetry policy (§18)</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-white transition-colors"
            >
              Resume Orbit
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
