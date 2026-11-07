"use client";

import React from "react";
import { motion } from "framer-motion";
import { FLOATING_MICRO_CARDS } from "./hero-constants";

export function HeroMicroStats() {
  return (
    <>
      {FLOATING_MICRO_CARDS.map((card, idx) => {
        const Icon = card.icon;
        const floatDuration = 5 + idx * 0.8;

        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [-4, 4, -4],
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
            className={`absolute z-20 hidden sm:flex items-center gap-3 px-3.5 py-2.5 rounded-2xl bg-surface-elevated/90 backdrop-blur-xl border border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.6)] ${card.positionClasses}`}
          >
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0">
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider leading-none">
                {card.title}
              </span>
              <span className="text-xs font-bold text-white font-sans mt-0.5 leading-tight">
                {card.metric}
              </span>
              <span className="text-[9px] text-brand-secondary/80 font-sans mt-0.5">
                {card.subtext}
              </span>
            </div>
          </motion.div>
        );
      })}
    </>
  );
}
