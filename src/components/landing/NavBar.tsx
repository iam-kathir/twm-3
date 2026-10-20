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
      className="fixed top-4 inset-x-0 z-50 max-w-4xl mx-auto px-4 pointer-events-none"
    >
      <div className="h-14 px-5 rounded-2xl border border-white/[0.08] bg-surface/90 backdrop-blur-xl shadow-2xl flex items-center justify-between pointer-events-auto">
        {/* Brand */}
        <BrandLogo showLivePulse={true} />

        {/* Quick Nav Anchors */}
        <nav className="hidden sm:flex items-center gap-6 text-xs font-mono text-muted">
          <a href="#showcase" className="hover:text-white transition-colors">
            Telemetry
          </a>
          <Link href="/leaderboard" className="hover:text-white transition-colors">
            Leaderboard
          </Link>
          <Link href="/search" className="hover:text-white transition-colors">
            Discovery
          </Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Cockpit
          </Link>
        </nav>

        {/* Action Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted hover:text-white px-2.5 py-1.5 font-mono transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            Sign in
          </Link>
          <a
            href="#invite"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-accent hover:bg-accent-hover text-canvas text-xs font-bold font-mono transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            Join Class
            <ArrowRight className="h-3 w-3" />
          </a>
        </div>
      </div>
    </motion.header>

  );
}
