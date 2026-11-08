"use client";

import React, { useState, useRef, useEffect } from "react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCw,
  Search,
  Command,
  ChevronDown,
  User,
  Shield,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Trophy,
  Compass
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useApp } from "@/context/AppContext";

interface NavLinkItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export function AppHeader() {
  const pathname = usePathname();
  const {
    currentUser,
    switchRole,
    isSyncing,
    triggerLiveSync,
    lastSyncTime,
    openCommandPalette,
    openDisputeModal,
  } = useApp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const userInitials = (currentUser?.name || "Student")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ST";

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navLinks: NavLinkItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Leaderboards", href: "/leaderboard", icon: Trophy },
    { label: "Discover", href: "/search", icon: Compass },
    { label: "Admin Hub", href: "/admin", icon: Shield },
    { label: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 sm:h-20 min-w-0 max-w-7xl items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8">
        {/* 1. LEFT SECTION: Logo, System Pulse, and Environment/Demo pill */}
        <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
          <BrandLogo variant="horizontal" size="md" showLivePulse={true} href="/" className="shrink-0" />

          {/* Honest Demo Data Badge */}
          <div
            title="Three provider adapters are wired (GitHub, LeetCode, HackerRank). Displayed accounts and metrics are illustrative until a student links authentic credentials."
            className="hidden items-center gap-1.5 rounded-xl border border-brand-primary/25 bg-brand-primary/10 px-2.5 py-1 text-xs font-mono text-brand-primary shadow-sm xl:inline-flex"
          >
            <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary animate-pulse" />
            <span className="font-medium whitespace-nowrap">Demo data · 3 adapters</span>
          </div>
        </div>

        {/* 2. CENTRE SECTION: Primary Application Navigation (Desktop & Laptop) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex min-w-0 items-center justify-center flex-1 max-w-lg mx-2"
        >
          <div className="flex items-center gap-1 rounded-2xl border border-border/80 bg-surface/90 p-1 shadow-sm">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "text-white font-semibold"
                      : "text-muted hover:text-ink hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="header-active-nav"
                      className="absolute inset-0 rounded-xl bg-surface-raised border border-white/10 shadow-sm"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                  <Icon className={`relative z-10 h-3.5 w-3.5 shrink-0 ${isActive ? "text-brand-secondary" : "text-muted"}`} />
                  <span className="relative z-10">{link.label}</span>
                </NextLink>
              );
            })}
          </div>
        </nav>

        {/* 3. RIGHT SECTION: Search/Command Palette, Telemetry Sync, Profile Dropdown, Mobile Menu Trigger */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          {/* Command Palette Trigger */}
          <button
            onClick={openCommandPalette}
            aria-label="Search or command palette (Cmd+K)"
            className="group flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface p-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-muted shadow-sm transition-all hover:bg-surface-raised hover:text-ink hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <Search className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-brand-secondary" />
            <span className="hidden whitespace-nowrap text-muted lg:inline">Search...</span>
            <kbd className="hidden items-center gap-0.5 rounded border border-border bg-white/5 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-muted lg:inline-flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {/* Sync Trigger Button (Collapsed into mobile drawer on small screens) */}
          <button
            onClick={triggerLiveSync}
            disabled={isSyncing}
            aria-label={`Execute live telemetry sync. Last sync: ${lastSyncTime}`}
            title={`Execute live telemetry crawl. Last sync: ${lastSyncTime}`}
            className="hidden sm:flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface p-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-ink transition-all hover:bg-surface-raised hover:border-white/15 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <RotateCw className={`h-4 w-4 shrink-0 text-brand-secondary ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden whitespace-nowrap font-mono text-xs text-muted xl:inline">
              {isSyncing ? "Syncing..." : lastSyncTime}
            </span>
          </button>

          {/* User Profile & Account Dropdown */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="Account menu"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1.5 sm:px-2.5 sm:py-1.5 shadow-sm transition-all hover:bg-surface-raised hover:border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg border border-brand-primary/40 bg-surface-raised font-mono text-xs sm:text-sm font-bold text-brand-primary shadow-sm">
                {userInitials}
              </div>
              <div className="hidden min-w-0 text-left lg:block">
                <div className="truncate text-xs font-semibold leading-tight text-ink max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="truncate text-[10px] font-mono text-muted">
                  {currentUser.role === "co-admin" ? "Faculty" : currentUser.rollNo}
                </div>
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform duration-200 ${
                  isProfileOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {/* Profile Dropdown Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 450, damping: 30 }}
                  className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-surface border border-border-strong shadow-overlay p-2 z-50 text-sm font-sans"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-3 py-2.5 border-b border-border-subtle">
                    <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
                    <div className="text-xs font-mono text-muted truncate mt-0.5">{currentUser.email}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-mono bg-white/5 border border-border text-brand-primary">
                      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-primary" />
                      <span>{currentUser.role === "co-admin" ? "Faculty Co-Admin" : "Verified Student"}</span>
                    </div>
                  </div>

                  <div className="py-1 space-y-0.5" role="none">
                    <NextLink
                      href="/settings"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-secondary hover:text-white hover:bg-white/[0.06] transition-colors font-medium text-xs sm:text-sm"
                    >
                      <Settings className="h-4 w-4 shrink-0 text-muted" />
                      <span>Account Settings</span>
                    </NextLink>

                    <NextLink
                      href="/privacy"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-secondary hover:text-white hover:bg-white/[0.06] transition-colors font-medium text-xs sm:text-sm"
                    >
                      <Shield className="h-4 w-4 shrink-0 text-muted" />
                      <span>Privacy &amp; Governance</span>
                    </NextLink>

                    <button
                      role="menuitem"
                      onClick={() => {
                        setIsProfileOpen(false);
                        openDisputeModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink-secondary hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-medium text-xs sm:text-sm"
                    >
                      <ShieldAlert className="h-4 w-4 shrink-0 text-rose-400" />
                      <span>Lodge Score Dispute</span>
                    </button>

                    <button
                      role="menuitem"
                      onClick={() => {
                        setIsProfileOpen(false);
                        switchRole(currentUser.role === "student" ? "co-admin" : "student");
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-ink-secondary hover:text-brand-secondary hover:bg-brand-secondary/10 transition-colors text-left font-medium text-xs sm:text-sm"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <Shield className="h-4 w-4 shrink-0 text-brand-secondary" />
                        <span>Switch to {currentUser.role === "student" ? "Co-Admin View" : "Student View"}</span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-border-subtle" role="none">
                    <NextLink
                      href="/login"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-xs sm:text-sm"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Sign Out</span>
                    </NextLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Trigger Button */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="md:hidden shrink-0 rounded-xl border border-border bg-surface p-2 text-muted transition-colors hover:text-ink hover:bg-surface-raised"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4 text-white" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* 4. MOBILE DRAWER NAVIGATION: Seamless animated dropdown for screens < 768px */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden border-t border-border-subtle bg-surface/98 backdrop-blur-xl px-4 py-4 space-y-3 overflow-hidden shadow-2xl"
          >
            {/* Demo Notice on Mobile */}
            <div className="px-1">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-primary/30 bg-brand-primary/10 px-2.5 py-1 text-xs font-mono text-brand-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-primary animate-pulse" />
                Demo data · 3 adapters wired
              </span>
            </div>

            {/* Nav Links */}
            <nav className="space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <NextLink
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-surface-raised text-white border border-white/10 shadow-sm"
                        : "text-ink-secondary hover:bg-white/[0.04] hover:text-white"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-secondary" : "text-muted"}`} />
                    <span>{link.label}</span>
                  </NextLink>
                );
              })}
            </nav>

            {/* Mobile Actions */}
            <div className="pt-2 border-t border-border-subtle space-y-1">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openCommandPalette();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-white/5 hover:text-white transition-colors text-left"
              >
                <Search className="h-4 w-4 shrink-0 text-brand-secondary" />
                <span>Search or command palette (Cmd+K)</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  triggerLiveSync();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary hover:bg-white/5 hover:text-white transition-colors text-left"
              >
                <RotateCw className="h-4 w-4 shrink-0 text-brand-secondary" />
                <span>Sync Telemetry ({lastSyncTime})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
