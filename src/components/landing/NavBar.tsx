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
      className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.07] bg-canvas/85 backdrop-blur-xl"
    >
      <div className="h-16 sm:h-[72px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo with Live Status */}
        <div className="flex items-center gap-4">
          <BrandLogo variant="horizontal" size="md" showLivePulse={true} href="/" />
        </div>

        {/* Center Nav Links with Micro-Interactions */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-sans">
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
              className="relative px-3 py-2 text-sm font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Call to Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-muted hover:text-ink px-3 py-2 font-sans transition-colors font-medium rounded-lg hover:bg-white/[0.05]"
          >
            <Github className="h-4 w-4" />
            Sign in
          </Link>
          <motion.a
            href="#invite"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-canvas text-sm font-semibold font-sans transition-colors cursor-pointer shadow-md"
          >
            <span>Join Class</span>
            <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
          </motion.a>
        </div>
      </div>
    </motion.header>
  );
}
