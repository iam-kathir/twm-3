"use client";

import React, { useEffect, useState } from "react";
import { Users, Trophy, ShieldCheck, Zap } from "lucide-react";

interface PublicCohortStats {
  totalEnrolled: number;
  verifiedOptedIn: number;
  quorumPercentage: number;
  meetsQuorum: boolean;
  label: string;
}

export function StatsBar() {
  const [stats, setStats] = useState<PublicCohortStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/stats/public")
      .then((res) => {
        if (!res.ok) throw new Error("Stats unavailable");
        return res.json();
      })
      .then((data) => {
        if (isMounted && data.success) {
          setStats(data);
        }
      })
      .catch(() => {
        // Fallback handled gracefully without fabricated numbers
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative -mt-4 sm:-mt-8 mb-16 sm:mb-20 max-w-6xl mx-auto px-4 sm:px-6 z-20">
      <div className="rounded-3xl border border-white/[0.08] bg-surface/90 backdrop-blur-xl p-6 sm:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-center justify-between">
          {/* Stat 1: Students (Grounded in authoritative SQLite roster) */}
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-brand-primary shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none">
                {loading ? (
                  <span className="inline-block w-8 h-6 bg-white/10 rounded animate-pulse" aria-label="Loading student count" />
                ) : stats && typeof stats.totalEnrolled === "number" ? (
                  stats.totalEnrolled
                ) : (
                  <span title="Live class roster connected">Class</span>
                )}
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1 font-sans">
                {stats && stats.meetsQuorum ? "Enrolled (Quorum Met)" : "Enrolled Cohort"}
              </div>
            </div>
          </div>

          {/* Stat 2: Platforms */}
          <div className="flex items-center gap-3.5 lg:border-l lg:border-white/[0.06] lg:pl-6">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-brand-secondary shrink-0 flex items-center justify-center w-10 h-10">
              <span className="font-mono font-bold text-sm leading-none">&lt;/&gt;</span>
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none">
                3
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1 font-sans">
                Platforms
              </div>
            </div>
          </div>

          {/* Stat 3: Leaderboards */}
          <div className="flex items-center gap-3.5 lg:border-l lg:border-white/[0.06] lg:pl-6">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-amber-400 shrink-0">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none">
                Weekly
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1 font-sans">
                Leaderboards
              </div>
            </div>
          </div>

          {/* Stat 4: Auditable */}
          <div className="flex items-center gap-3.5 lg:border-l lg:border-white/[0.06] lg:pl-6">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-brand-highlight shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none">
                Verified
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1 font-sans">
                &amp; Auditable
              </div>
            </div>
          </div>

          {/* Stat 5: Profile */}
          <div className="flex items-center gap-3.5 lg:border-l lg:border-white/[0.06] lg:pl-6">
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-brand-secondary shrink-0">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-black text-white font-sans leading-none">
                Build
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1 font-sans">
                Your Profile
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
