"use client";

import React, { useEffect, useState } from "react";

interface MeteorsProps {
  number?: number;
  className?: string;
}

export function Meteors({ number = 20, className = "" }: MeteorsProps) {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([]);

  useEffect(() => {
    // Generate meteor positions and delays only on client to avoid hydration mismatch
    const styles = [...new Array(number)].map(() => ({
      top: -10,
      left: Math.floor(Math.random() * 100) + "%",
      animationDelay: Math.random() * 5 + "s",
      animationDuration: Math.floor(Math.random() * 6 + 4) + "s",
    }));
    setMeteorStyles(styles);
  }, [number]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          className="absolute h-0.5 w-0.5 rounded-full bg-emerald-400 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg] animate-meteor"
          style={style}
        >
          {/* Meteor Tail with Hyper-Mint / Emerald Glow */}
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-[60px] -translate-y-1/2 bg-gradient-to-r from-emerald-400/80 via-accent/30 to-transparent" />
        </span>
      ))}
    </div>
  );
}
