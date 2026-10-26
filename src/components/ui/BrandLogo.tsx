"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "mark" | "horizontal";
  showText?: boolean;
  showSubtitle?: boolean;
  showLivePulse?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = "md",
  variant = "mark",
  showText = true,
  showSubtitle = false,
  showLivePulse = false,
  href = "/",
  className = "",
}: BrandLogoProps) {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 52,
  };

  const px = iconSizes[size];

  if (variant === "horizontal") {
    const horizontalWidths = {
      sm: 110,
      md: 148,
      lg: 185,
      xl: 225,
    };
    const w = horizontalWidths[size];
    const h = Math.round((w * 360) / 980);

    const logoContent = (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`inline-flex items-center gap-2.5 group cursor-pointer ${className}`}
      >
        <div className="relative flex items-center">
          <Image
            src="/logo-horizontal.svg"
            alt="TWM — Track. Win. Maintain."
            width={w}
            height={h}
            className="transition-all duration-300 group-hover:brightness-110 drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_20px_rgba(16,185,129,0.28)]"
            priority
          />
        </div>

        {showLivePulse && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-elevated/90 border border-white/10 text-xs text-muted">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-emerald-400 font-bold">LIVE</span>
          </span>
        )}
      </motion.div>
    );

    if (href) {
      return (
        <Link href={href} className="inline-flex items-center">
          {logoContent}
        </Link>
      );
    }
    return logoContent;
  }

  const markContent = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={`inline-flex items-center gap-3.5 group select-none cursor-pointer ${className}`}
    >
      <div
        className="relative rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-surface-elevated to-surface flex items-center justify-center transition-all duration-300 group-hover:border-accent/50 shadow-[0_4px_20px_rgba(0,0,0,0.4)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.30)]"
        style={{ width: px, height: px }}
      >
        <Image
          src="/icon.svg"
          alt="TWM Platform Icon"
          width={Math.round(px * 0.72)}
          height={Math.round(px * 0.72)}
          className="transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_2px_8px_rgba(16,185,129,0.4)]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/15 via-transparent to-white/5 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-ink tracking-tight font-sans transition-colors group-hover:text-white ${
                size === "lg" || size === "xl" ? "text-xl sm:text-2xl" : "text-base sm:text-lg"
              }`}
            >
              TWM
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent text-xs font-semibold">
              3.1
            </span>
          </div>

          {showSubtitle && (
            <span className="text-xs text-muted">
              Track. Win. Maintain.
            </span>
          )}
        </div>
      )}

      {showLivePulse && !showSubtitle && (
        <span className="relative flex h-2 w-2 ml-0.5" title="Telemetry Engine Active">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {markContent}
      </Link>
    );
  }

  return markContent;
}
