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
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      <div
        className="relative rounded-lg overflow-hidden border border-white/10 flex items-center justify-center bg-canvas group-hover:border-accent/40 transition-all duration-300 group-hover:shadow-[0_0_16px_rgba(245,158,11,0.2)]"
        style={{ width: px, height: px }}
      >
        <Image
          src="/icon.svg"
          alt="TWM Logo"
          width={px - 6}
          height={px - 6}
          className="group-hover:scale-105 transition-transform duration-300"
          priority
        />
      </div>

      {showText && (
        <span className="font-bold text-ink text-sm tracking-tight font-sans">
          TWM <span className="text-accent font-mono text-xs">3.0</span>
        </span>
      )}

      {showLivePulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping ml-0.5" />
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
