"use client";

import React, { useMemo, useState } from "react";

// Sunday boundary checker: real UTC+5:30 logic, no backend.
// Boundary is fixed to the coming Sunday 23:59:59 IST (this week's close).
// Eligible  = observation <= boundary and gap <= 3h (§9.7)
// Provisional = observation <= boundary but stale (gap > 3h)
// Excluded  = observation after boundary, or HackerRank (display-only, always)

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const THREE_HOURS_MS = 3 * 60 * 60 * 1000;

type Provider = "github" | "leetcode" | "hackerrank";
type Verdict = "eligible" | "provisional" | "excluded";

function nextSundayBoundaryMs(fromMs: number): number {
  const nowIst = new Date(fromMs + IST_OFFSET_MS);
  const currentDay = nowIst.getUTCDay();
  const daysUntilSunday = currentDay === 0 ? 0 : 7 - currentDay;
  const boundaryIst = new Date(nowIst);
  boundaryIst.setUTCDate(nowIst.getUTCDate() + daysUntilSunday);
  boundaryIst.setUTCHours(23, 59, 59, 0);
  return boundaryIst.getTime() - IST_OFFSET_MS;
}

function parseIstInput(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [, y, mo, d, h, mi] = m;
  const utc = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)) - IST_OFFSET_MS;
  return Number.isNaN(utc) ? null : utc;
}

function toIstInputValue(ms: number): string {
  const d = new Date(ms + IST_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function fmtIst(ms: number): string {
  const d = new Date(ms + IST_OFFSET_MS);
  return d.toUTCString().slice(0, 25) + " IST";
}

function fmtGap(absMs: number): string {
  const totalSec = Math.floor(absMs / 1000);
  if (totalSec < 3600) return `${Math.floor(totalSec / 60)} min`;
  const hours = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
}

const verdictStyle: Record<Verdict, { label: string; className: string }> = {
  eligible: { label: "Eligible — finalized", className: "bg-accent text-canvas border-accent" },
  provisional: { label: "Provisional — stale observation", className: "bg-amber-500/15 text-amber-400 border-amber-500/40" },
  excluded: { label: "Excluded from this week", className: "bg-surface-raised text-muted border-white/15" },
};

export function BoundaryChecker() {
  const [provider, setProvider] = useState<Provider>("github");
  const [input, setInput] = useState(() => toIstInputValue(nextSundayBoundaryMs(Date.now()) - 60 * 60 * 1000));

  const result = useMemo(() => {
    const observed = parseIstInput(input);
    if (observed === null) return null;
    // Fixed boundary: the coming Sunday for *today*, not for the picked date.
    const boundary = nextSundayBoundaryMs(Date.now());
    if (provider === "hackerrank") {
      return { verdict: "excluded" as Verdict, boundary, observed, reason: "HackerRank has no public event timestamps. Badges are display-only and never enter weekly deltas." };
    }
    if (observed > boundary) {
      return { verdict: "excluded" as Verdict, boundary, observed, reason: `Observed ${fmtGap(observed - boundary)} after the hard boundary. Observations after Sunday 23:59:59 IST are never used for that week.` };
    }
    if (boundary - observed <= THREE_HOURS_MS) {
      return { verdict: "eligible" as Verdict, boundary, observed, reason: `Observed ${fmtGap(boundary - observed)} before the boundary — inside the 3-hour freshness window (§9.7).` };
    }
    return { verdict: "provisional" as Verdict, boundary, observed, reason: `Observed ${fmtGap(boundary - observed)} before the boundary — outside the 3-hour window. Marked provisional and flagged for re-sync.` };
  }, [input, provider]);

  const applyPreset = (offsetMs: number) => {
    setInput(toIstInputValue(nextSundayBoundaryMs(Date.now()) + offsetMs));
  };

  return (
    <section id="boundary-checker" className="scroll-mt-24 py-12 md:py-16 border-t border-white/[0.08] bg-canvas">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <p className="text-sm font-semibold text-accent">Sunday boundary checker</p>
        <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
          Is one observation inside the week?
        </h2>
        <p className="mt-3 text-sm text-muted leading-relaxed">
          Pick an observation time and a provider. We check it against this week&apos;s hard boundary —{" "}
          <span className="font-mono text-ink">Sunday 23:59:59 IST</span> — using real UTC+5:30 arithmetic.
        </p>

        <div className="mt-6 rounded-panel bg-surface border border-white/10 p-4 sm:p-6">
          <p className="text-sm font-semibold text-ink bg-surface-raised border border-white/10 rounded-lg px-3 py-2">
            Demo data — sample observations. This checks the rules, not your telemetry.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <div>
              <label htmlFor="boundary-provider" className="meta-label">
                Provider
              </label>
              <div id="boundary-provider" className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Provider">
                {(["github", "leetcode", "hackerrank"] as Provider[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProvider(p)}
                    aria-pressed={provider === p}
                    className={`min-h-[44px] px-4 rounded-control text-sm font-semibold border transition-colors ${
                      provider === p ? "bg-accent text-canvas border-accent" : "bg-surface-raised text-muted border-white/15 hover:text-ink"
                    }`}
                  >
                    {p === "github" ? "GitHub" : p === "leetcode" ? "LeetCode" : "HackerRank"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="boundary-observed-at" className="meta-label">
                Observation time (IST)
              </label>
              <input
                id="boundary-observed-at"
                type="datetime-local"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="mt-2 w-full min-h-[44px] rounded-control bg-canvas border border-white/15 px-3 text-base text-ink focus:border-accent"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(-60 * 60 * 1000)}
                  className="min-h-[44px] px-3 rounded-control text-sm font-medium bg-surface-raised border border-white/15 text-muted hover:text-ink"
                >
                  Sample A — Sunday 23:00
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(-11 * 60 * 60 * 1000)}
                  className="min-h-[44px] px-3 rounded-control text-sm font-medium bg-surface-raised border border-white/15 text-muted hover:text-ink"
                >
                  Sample B — Sunday 12:00
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(60 * 1000)}
                  className="min-h-[44px] px-3 rounded-control text-sm font-medium bg-surface-raised border border-white/15 text-muted hover:text-ink"
                >
                  Sample C — Monday 00:05
                </button>
              </div>
            </div>
          </div>

          {result ? (
            <div className="mt-5 border-t border-white/[0.08] pt-5" aria-live="polite">
              <span className={`inline-flex min-h-[32px] items-center px-3 rounded-full border text-sm font-bold ${verdictStyle[result.verdict].className}`}>
                {verdictStyle[result.verdict].label}
              </span>
              <p className="mt-3 text-sm text-muted leading-relaxed">{result.reason}</p>
              <dl className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="rounded-control bg-canvas border border-white/[0.08] p-3">
                  <dt className="meta-label">Observed</dt>
                  <dd className="mt-1 font-mono text-[13px] text-ink">{fmtIst(result.observed)}</dd>
                </div>
                <div className="rounded-control bg-canvas border border-white/[0.08] p-3">
                  <dt className="meta-label">Boundary</dt>
                  <dd className="mt-1 font-mono text-[13px] text-ink">{fmtIst(result.boundary)}</dd>
                </div>
                <div className="rounded-control bg-canvas border border-white/[0.08] p-3">
                  <dt className="meta-label">Freshness gap</dt>
                  <dd className="mt-1 font-mono text-[13px] text-ink">
                    {result.boundary - result.observed >= 0
                      ? `${fmtGap(result.boundary - result.observed)} before`
                      : `${fmtGap(result.observed - result.boundary)} after`}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="mt-5 border-t border-white/[0.08] pt-5 text-sm text-muted">Enter a valid observation time to check it.</p>
          )}
        </div>
      </div>
    </section>
  );
}
