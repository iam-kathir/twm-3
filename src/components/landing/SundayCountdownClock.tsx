"use client";

import React, { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
  isClosed: boolean;
  boundaryLabel: string;
}

function calculateSundayBoundaryTime(): TimeLeft {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const nowIst = new Date(now.getTime() + istOffsetMs);

  const currentDay = nowIst.getUTCDay();
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;

  const targetSundayIst = new Date(nowIst);
  targetSundayIst.setUTCDate(nowIst.getUTCDate() + daysUntilSunday);
  targetSundayIst.setUTCHours(23, 59, 59, 0);

  const boundaryLabel = targetSundayIst.toUTCString().slice(0, 16) + ", 23:59:59 IST";

  const daysSinceMonday = (currentDay + 6) % 7;
  const startOfWeekIst = new Date(nowIst);
  startOfWeekIst.setUTCDate(nowIst.getUTCDate() - daysSinceMonday);
  startOfWeekIst.setUTCHours(0, 0, 0, 0);

  const totalWeekMs = 7 * 24 * 60 * 60 * 1000;
  const elapsedMs = Math.max(0, nowIst.getTime() - startOfWeekIst.getTime());
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalWeekMs) * 100));

  const diffMs = targetSundayIst.getTime() - nowIst.getTime();

  if (diffMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, progressPercent: 100, isClosed: true, boundaryLabel };
  }

  const seconds = Math.floor((diffMs / 1000) % 60);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, progressPercent: Math.round(progressPercent), isClosed: false, boundaryLabel };
}

export function SundayCountdownClock() {
  // Synchronous initializer so server-rendered HTML already shows real numbers.
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculateSundayBoundaryTime());

  useEffect(() => {
    setTimeLeft(calculateSundayBoundaryTime());
    const interval = setInterval(() => setTimeLeft(calculateSundayBoundaryTime()), 1000);
    return () => clearInterval(interval);
  }, []);

  const timeUnits = [
    { label: "Days", value: String(timeLeft.days).padStart(2, "0") },
    { label: "Hours", value: String(timeLeft.hours).padStart(2, "0") },
    { label: "Minutes", value: String(timeLeft.minutes).padStart(2, "0") },
    { label: "Seconds", value: String(timeLeft.seconds).padStart(2, "0") },
  ];

  return (
    <div className="max-w-xl mx-auto rounded-panel bg-surface border border-white/10 p-4 sm:p-5 text-left">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
        <p className="text-sm font-bold text-ink flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent shrink-0" aria-hidden="true" />
          {timeLeft.isClosed ? "This week has closed" : "This week's boundary"}
        </p>
        <p className="text-sm text-muted shrink-0">{timeLeft.boundaryLabel}</p>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3 py-4" role="timer" aria-label={`Time until Sunday boundary: ${timeLeft.days} days, ${timeLeft.hours} hours`}>
        {timeUnits.map((unit) => (
          <div
            key={unit.label}
            className="flex flex-col items-center justify-center rounded-control bg-surface-raised border border-white/[0.08] px-2 py-3"
          >
            <span className="font-mono text-2xl sm:text-3xl font-extrabold text-ink tabular-nums">{unit.value}</span>
            <span className="text-sm text-muted mt-1">{unit.label}</span>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between text-sm text-muted">
          <span>Week elapsed</span>
          <span className="font-mono text-ink font-semibold tabular-nums">{timeLeft.progressPercent}%</span>
        </div>
        <div className="mt-2 h-2 w-full rounded-full bg-white/[0.06] border border-white/[0.08] overflow-hidden">
          <div className="h-full rounded-full bg-accent" style={{ width: `${timeLeft.progressPercent}%` }} />
        </div>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          Only observations at or before this moment count toward the week. Anything fresher than 3 hours before the
          boundary is finalized; older observations stay provisional.
        </p>
      </div>
    </div>
  );
}
