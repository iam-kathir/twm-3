"use client";

import React from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * PageHeader — Standardized heading component across authenticated application routes.
 * Ensures consistent typography, visual hierarchy, badge styling, and responsive action layout.
 */
export function PageHeader({
  badge,
  icon,
  title,
  description,
  meta,
  actions,
  className = "",
}: PageHeaderProps) {
  return (
    <header className={`space-y-4 min-w-0 ${className}`}>
      {badge && <div className="flex items-center gap-2">{badge}</div>}

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 sm:gap-6 min-w-0">
        <div className="space-y-2 min-w-0 flex-1">
          <div className="flex items-center gap-3 min-w-0">
            {icon && <div className="shrink-0 text-brand-secondary">{icon}</div>}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight break-words">
              {title}
            </h1>
          </div>

          {description && (
            <div className="text-sm sm:text-base text-muted max-w-3xl leading-relaxed break-words font-sans">
              {description}
            </div>
          )}

          {meta && <div className="pt-1">{meta}</div>}
        </div>

        {actions && (
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 pt-1 lg:pt-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
