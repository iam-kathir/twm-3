"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Features", href: "#showcase" },
  { label: "How it Works", href: "#workflow" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "About", href: "#pillars" },
];

export function NavBar() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 inset-x-0 z-50 bg-canvas/80 backdrop-blur-xl border-b border-white/[0.06]"
    >
      <div className="h-18 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3.5">
        {/* Left: Stylized TWM Logo + Brand */}
        <Link href="/" className="inline-flex items-center gap-3.5 group shrink-0">
          <div className="relative h-8 w-auto flex items-center justify-center">
            <Image
              src="/icon.svg"
              alt="TWM Logo"
              width={82}
              height={32}
              className="h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(56,189,248,0.35)]"
              priority
            />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-base font-extrabold text-white tracking-tight leading-none font-sans">
              TWM
            </span>
            <span className="text-[11px] font-medium text-slate-400 tracking-normal leading-tight mt-1 font-sans">
              Track · Win · Maintain
            </span>
          </div>
        </Link>

        {/* Center: Floating Nav Pill */}
        <nav
          className="hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/[0.08] bg-[#0c1220]/80 backdrop-blur-md shadow-inner"
          aria-label="Primary"
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white rounded-full transition-colors hover:bg-white/[0.06]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Gradient CTA + Mobile Menu */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex min-h-[40px] items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white text-sm font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.35)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)]"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation"
            aria-expanded={isMobileOpen}
            className="shrink-0 rounded-xl border border-white/[0.08] bg-surface p-2 text-slate-300 hover:text-white lg:hidden transition-colors"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/[0.06] bg-canvas lg:hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
