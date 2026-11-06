"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Github } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export function NavBar() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.08] bg-canvas"
    >
      <div className="h-16 max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <BrandLogo variant="horizontal" size="md" showLivePulse={false} href="/" />

        <nav className="hidden md:flex items-center gap-1 text-sm" aria-label="Primary">
          {[
            { label: "Boundary checker", href: "#boundary-checker" },
            { label: "Providers", href: "#showcase" },
            { label: "Cohort rules", href: "#cohort-rules" },
            { label: "Leaderboard", href: "/leaderboard" },
            { label: "Cockpit", href: "/dashboard" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-muted hover:text-ink rounded-lg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-2 text-sm text-muted hover:text-ink px-3 py-2 font-medium rounded-lg hover:bg-white/[0.05]"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            Sign in
          </Link>
          <Link
            href="#invite"
            className="inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-canvas text-sm font-semibold"
          >
            <span>Join class</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
