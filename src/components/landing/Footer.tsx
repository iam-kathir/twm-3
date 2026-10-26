import React from "react";
import Link from "next/link";
import { Shield, Sparkles, Heart } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] bg-canvas py-14 text-sm text-muted font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-10 border-b border-white/[0.06]">
          {/* Brand Identity & Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <BrandLogo variant="horizontal" size="md" href="/" />
            <div className="hidden sm:block h-6 w-px bg-white/[0.08]" />
            <div className="flex flex-col">
              <span className="text-ink font-medium text-sm">
                Track. Win. Maintain.
              </span>
              <span className="text-muted text-xs">
                Engineering cohort telemetry and peer progress platform
              </span>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-sm text-muted">
            <Link href="/dashboard" className="hover:text-ink transition-colors">
              Cockpit
            </Link>
            <Link href="/leaderboard" className="hover:text-ink transition-colors">
              Leaderboard
            </Link>
            <Link href="/search" className="hover:text-ink transition-colors">
              Discovery
            </Link>
            <Link href="/admin" className="hover:text-ink transition-colors">
              Admin
            </Link>
            <Link href="/settings" className="hover:text-ink transition-colors">
              Settings
            </Link>
            <Link href="/privacy" className="hover:text-ink transition-colors">
              Privacy
            </Link>
          </div>
        </div>

        {/* Bottom Integrity Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} TWM Class Platform</span>
            <span className="text-white/20">/</span>
            <span className="text-accent font-medium">v3.1.0</span>
            <span className="text-white/20">/</span>
            <span>Zero-fabrication architecture</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-accent">
              <Shield className="h-3.5 w-3.5" />
              Two-person admin audit
            </span>
            <span className="text-white/20">/</span>
            <span className="text-muted">Boundary closes Sunday 23:59:59 IST</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
