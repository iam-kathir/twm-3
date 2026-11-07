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
    sm: 30,
    md: 38,
    lg: 46,
    xl: 54,
  };

  const px = iconSizes[size];

  if (variant === "horizontal") {
    const horizontalWidths = {
      sm: 130,
      md: 165,
      lg: 200,
      xl: 240,
    };
    const w = horizontalWidths[size];
    const h = Math.max(22, Math.round((w * 100) / 652));

    const logoContent = (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`inline-flex min-w-0 max-w-full items-center gap-2.5 group cursor-pointer ${className}`}
      >
        <div className="relative flex min-w-0 items-center">
          <Image
            src="/logo-horizontal.svg"
            alt="TWM — Track · Win · Maintain"
            width={w}
            height={h}
            className="h-auto max-w-full transition-[filter] duration-200 group-hover:brightness-110 object-contain"
            priority
          />
        </div>

        {showLivePulse && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-border bg-surface-raised px-2 py-0.5 text-xs text-muted lg:inline-flex">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="font-semibold text-accent">LIVE</span>
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
      className={`inline-flex items-center gap-3 group select-none cursor-pointer ${className}`}
    >
      <div
        className="relative rounded-xl overflow-hidden border border-white/10 bg-surface-elevated flex items-center justify-center transition-colors duration-300 group-hover:border-sky-500/40 p-1"
        style={{ width: px, height: px }}
      >
        <Image
          src="/icon.svg"
          alt="TWM Platform Icon"
          width={Math.round(px * 0.88)}
          height={Math.round((px * 0.88 * 176) / 376)}
          className="transition-transform duration-300 group-hover:scale-110 object-contain"
          priority
        />
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span
              className={`font-black text-ink tracking-tight font-sans transition-colors group-hover:text-ink ${
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
            <span className="text-xs text-muted leading-tight font-medium">
              Track · Win · Maintain
            </span>
          )}
        </div>
      )}

      {showLivePulse && !showSubtitle && (
        <span
          aria-hidden="true"
          title="Telemetry engine active (static indicator)"
          className="ml-0.5 h-2 w-2 shrink-0 rounded-full bg-accent"
        />
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
