"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";


export function NavBar() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-5 inset-x-0 z-50 max-w-6xl mx-auto px-4 sm:px-6 pointer-events-none"
    >
      <div className="h-16 sm:h-18 px-6 sm:px-8 rounded-2xl border border-white/[0.08] bg-surface/90 backdrop-blur-xl shadow-2xl flex items-center justify-between pointer-events-auto">
        {/* Brand */}
        <BrandLogo showLivePulse={true} />

        {/* Quick Nav Anchors */}
        <nav className="hidden sm:flex items-center gap-7 text-sm font-mono text-muted">
          <a href="#showcase" className="hover:text-ink transition-colors font-medium">
            Telemetry
          </a>
          <Link href="/leaderboard" className="hover:text-ink transition-colors font-medium">
            Leaderboard
          </Link>
          <Link href="/search" className="hover:text-ink transition-colors font-medium">
            Discovery
          </Link>
          <Link href="/dashboard" className="hover:text-ink transition-colors font-medium">
            Cockpit
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-muted hover:text-ink px-3 py-2 font-mono transition-colors font-medium"
          >
            <Github className="h-4 w-4" />
            Sign in
          </Link>
          <a
            href="#invite"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-canvas text-sm font-bold font-mono transition-all hover:scale-105 active:scale-95 shadow-md shadow-accent/20"
          >
            Join Class
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.header>

  );
}
