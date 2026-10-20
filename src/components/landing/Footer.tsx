import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-canvas py-12 text-xs text-muted font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/[0.05]">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <BrandLogo variant="horizontal" size="md" />
            <span className="hidden sm:inline text-white/10">|</span>
            <span className="text-muted text-xs">
              Class Developer Activity &amp; Friendly Progress Platform
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-muted">
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Cockpit
            </Link>
            <Link href="/leaderboard" className="hover:text-white transition-colors">
              Leaderboards
            </Link>
            <Link href="/search" className="hover:text-white transition-colors">
              Search
            </Link>
            <Link href="/admin" className="hover:text-white transition-colors">
              Admin
            </Link>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-muted-soft">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} TWM Class Platform</span>
            <span>•</span>
            <span>Version 3.1.0</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="h-3 w-3" />
              Two-Person Co-Admin Audited
            </span>
            <span>•</span>
            <span>Asia/Kolkata (IST)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

