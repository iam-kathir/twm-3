"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "mark" | "horizontal";
  showText?: boolean;
  showLivePulse?: boolean;
  href?: string;
  className?: string;
}

export function BrandLogo({
  size = "md",
  variant = "mark",
  showText = true,
  showLivePulse = false,
  href = "/",
  className = "",
}: BrandLogoProps) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 48,
  };

  const px = iconSizes[size];

  if (variant === "horizontal") {
    const horizontalWidths = {
      sm: 98,
      md: 130,
      lg: 160,
      xl: 200,
    };
    const w = horizontalWidths[size];
    const h = Math.round((w * 360) / 980);

    const logoContent = (
      <div className={`inline-flex items-center group ${className}`}>
        <Image
          src="/logo-horizontal.svg"
          alt="TWM — Track. Win. Maintain."
          width={w}
          height={h}
          className="group-hover:opacity-95 transition-opacity"
          priority
        />
        {showLivePulse && (
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping ml-2 self-center" />
        )}
      </div>
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
    <div className={`inline-flex items-center gap-3 group select-none ${className}`}>
      <div
        className="relative rounded-xl overflow-hidden border border-accent/25 flex items-center justify-center bg-gradient-to-b from-surface-elevated to-surface group-hover:border-accent/60 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.12)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]"
        style={{ width: px, height: px }}
      >
        <Image
          src="/icon.svg"
          alt="TWM Logo"
          width={Math.round(px * 0.72)}
          height={Math.round(px * 0.72)}
          className="group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/10 via-transparent to-white/5 pointer-events-none" />
      </div>

      {showText && (
        <div className="flex items-center gap-2">
          <span className={`font-black text-white tracking-tight font-sans ${
            size === "lg" || size === "xl" ? "text-lg sm:text-xl" : "text-base"
          }`}>
            TWM
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-accent/15 border border-accent/30 text-accent font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm">
            3.0
          </span>
        </div>
      )}

      {showLivePulse && (
        <span className="relative flex h-2.5 w-2.5 ml-0.5" title="Telemetry Engine Active">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      )}
    </div>
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
