"use client";

import React from "react";
import { motion } from "framer-motion";
import { FLOATING_MICRO_CARDS } from "./hero-constants";

export function HeroMicroStats() {
  return (
    <>
      {/* Desktop & Tablet Atmospheric Floating Cards (>= 640px) */}
      <div className="hidden sm:contents">
        {FLOATING_MICRO_CARDS.map((card, idx) => {
          const Icon = card.icon;
          const floatDuration = 5 + idx * 0.8;

          return (
            <motion.div
              key={`desktop-${card.id}`}
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [-3, 3, -3],
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.4 + idx * 0.15 },
                scale: { duration: 0.6, delay: 0.4 + idx * 0.15 },
                y: {
                  repeat: Infinity,
                  duration: floatDuration,
                  ease: "easeInOut",
                },
              }}
              className={`absolute z-20 flex items-center gap-2.5 px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-2xl bg-surface-elevated/90 backdrop-blur-xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.6)] pointer-events-none select-none ${card.positionClasses}`}
            >
              <div className="p-1.5 lg:p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0">
                <Icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 ${card.iconColor}`} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] lg:text-[10px] font-mono text-muted uppercase tracking-wider leading-none">
                  {card.title}
                </span>
                <span className="text-[11px] lg:text-xs font-bold text-white font-sans mt-0.5 leading-tight truncate">
                  {card.metric}
                </span>
                <span className="text-[8px] lg:text-[9px] text-brand-secondary/80 font-sans mt-0.5 leading-none">
                  {card.subtext}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Mobile Safe Docked Preview Row (< 640px) - Guaranteed Zero Collision with Orbital Nodes */}
      <div className="sm:hidden absolute -bottom-9 inset-x-0 flex items-center justify-center gap-1.5 px-1 z-20 pointer-events-none select-none">
        {FLOATING_MICRO_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={`mobile-${card.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + idx * 0.1 }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-surface-elevated/95 backdrop-blur-md border border-white/10 shadow-md text-left"
            >
              <Icon className={`h-3 w-3 shrink-0 ${card.iconColor}`} />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-bold text-white font-sans whitespace-nowrap">
                  {card.metric}
                </span>
                <span className="text-[7px] text-muted-soft font-mono truncate max-w-[68px]">
                  {card.title}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

