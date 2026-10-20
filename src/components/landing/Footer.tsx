import React from "react";
import Link from "next/link";
import { Shield, Sparkles, Heart } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-canvas py-14 text-xs text-muted font-mono relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand Identity & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <BrandLogo variant="horizontal" size="md" href="/" />
            <div className="hidden sm:block h-6 w-px bg-white/10" />
            <div className="flex flex-col">
              <span className="text-white font-medium text-xs tracking-tight">
                Track. Win. Maintain.
              </span>
              <span className="text-muted text-[11px]">
                Engineering Cohort Telemetry &amp; Peer Progress Platform
              </span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-muted">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Cockpit
            </Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">
              Leaderboards
            </Link>
            <Link href="/search" className="hover:text-white transition-colors">
              Peer Discovery
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin Governance
            </Link>
            <Link href="/settings" className="hover:text-white transition-colors">
              Settings
            </Link>
          </div>
        </div>

        {/* Bottom Integrity Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-soft">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} TWM Class Platform</span>
            <span>•</span>
            <span className="text-accent font-semibold">v3.1.0 (Phase 2 Tournament)</span>
            <span>•</span>
            <span>Zero Fabrication Architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              Two-Person Co-Admin Audited
            </span>
            <span>•</span>
            <span className="text-muted">Boundary Closes Sun 23:59:59 IST</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
