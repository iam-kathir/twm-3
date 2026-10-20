"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function NavBar() {
  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 25, delay: 0.1 }}
      className="fixed top-4 sm:top-5 inset-x-0 z-50 max-w-6xl mx-auto px-4 sm:px-6 pointer-events-none"
    >
      <div className="h-16 sm:h-20 px-5 sm:px-8 rounded-2xl border border-white/[0.08] bg-surface/80 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-center justify-between pointer-events-auto transition-all hover:border-white/[0.14]">
        {/* Brand Logo with Live Status */}
        <div className="flex items-center gap-4">
          <BrandLogo variant="horizontal" size="md" showLivePulse={true} href="/" />
        </div>

        {/* Center Nav Links with Micro-Interactions */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-mono text-muted">
          {[
            { label: "Telemetry", href: "#showcase" },
            { label: "Leaderboard", href: "/leaderboard" },
            { label: "Discovery", href: "/search" },
            { label: "Cockpit", href: "/dashboard" },
            { label: "Admin Hub", href: "/admin" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="relative px-3.5 py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-200 hover:text-ink hover:bg-white/[0.06] active:scale-95"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Call to Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 text-xs lg:text-sm text-muted hover:text-ink px-3 py-2 font-mono transition-colors font-medium rounded-xl hover:bg-white/[0.05]"
          >
            <Github className="h-4 w-4 text-white/70" />
            Sign in
          </Link>
          <motion.a
            href="#invite"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-canvas text-xs sm:text-sm font-bold font-mono transition-colors shadow-lg shadow-accent/20 cursor-pointer"
          >
            <span>Join Class</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}
