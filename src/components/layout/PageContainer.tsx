"use client";

import React from "react";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "narrow" | "wide" | "full";
  as?: React.ElementType;
}

/**
 * PageContainer — Standardized page layout wrapper for all authenticated views.
 * Enforces uniform max-widths, horizontal gutters, and vertical spacing rhythms.
 */
export function PageContainer({
  children,
  className = "",
  size = "default",
  as: Component = "main",
}: PageContainerProps) {
  const maxWidthClass = {
    narrow: "max-w-5xl",
    default: "max-w-7xl",
    wide: "max-w-[90rem]",
    full: "max-w-full",
  }[size];

  return (
    <Component
      className={`flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 min-w-0 ${maxWidthClass} ${className}`}
    >
      {children}
    </Component>
  );
}
