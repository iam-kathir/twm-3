"use client";

import React from "react";
import { motion } from "framer-motion";
import { Github } from "@/components/ui/GithubIcon";
import { LeetCodeIcon as Code2 } from "@/components/ui/LeetCodeIcon";
import { HackerRankIcon } from "@/components/ui/HackerRankIcon";
import { ProviderMeta } from "./hero-constants";

interface HeroProviderNodeProps {
  provider: ProviderMeta;
  isActive: boolean;
  isAnyActive: boolean;
  onSelect: () => void;
}

export function HeroProviderNode({
  provider,
  isActive,
  isAnyActive,
  onSelect,
}: HeroProviderNodeProps) {
  const getProviderIcon = () => {
    switch (provider.id) {
      case "github":
        return <Github className="h-6 w-6 text-white" />;
      case "leetcode":
        return <Code2 className="h-6 w-6 text-[#FFA116]" />;
      case "hackerrank":
        return <HackerRankIcon className="h-5 w-auto" variant="wide" />;
    }
  };

  const getBorderColor = () => {
    if (isActive) {
      switch (provider.id) {
        case "github":
          return "border-white shadow-[0_0_28px_rgba(255,255,255,0.4)]";
        case "leetcode":
          return "border-amber-400 shadow-[0_0_28px_rgba(255,161,22,0.45)]";
        case "hackerrank":
          return "border-emerald-400 shadow-[0_0_28px_rgba(46,200,102,0.45)]";
      }
    }
    switch (provider.id) {
      case "github":
        return "border-white/20 hover:border-white/50 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]";
      case "leetcode":
        return "border-amber-500/30 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(255,161,22,0.25)]";
      case "hackerrank":
        return "border-emerald-500/30 hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(46,200,102,0.25)]";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.14 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: isActive ? 1.15 : isAnyActive ? 0.92 : 1,
        opacity: isActive ? 1 : isAnyActive ? 0.65 : 1,
      }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
      role="button"
      tabIndex={0}
      aria-label={`Inspect ${provider.name} Telemetry Adapter (${provider.badgeLabel})`}
      aria-expanded={isActive}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
      className={`group relative flex items-center justify-center p-3 sm:p-3.5 rounded-2xl bg-surface-elevated/95 backdrop-blur-xl border ${getBorderColor()} shadow-[0_8px_24px_rgba(0,0,0,0.65)] cursor-pointer select-none transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-secondary`}
    >
      {/* Soft Radial Reflection */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/[0.04] to-transparent pointer-events-none" />

      {/* Provider Emblem */}
      <div className="relative z-10 flex items-center justify-center">
        {getProviderIcon()}
      </div>

      {/* Mini Active Indicator Glow Dot */}
      {isActive && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-highlight opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-highlight" />
        </span>
      )}
    </motion.div>
  );
}

