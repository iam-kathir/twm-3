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
  ExternalLink,
  Menu,
  X
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useApp } from "@/context/AppContext";

export function AppHeader() {
  const pathname = usePathname();
  const {
    currentUser,
    switchRole,
    isSyncing,
    triggerLiveSync,
    lastSyncTime,
    openCommandPalette,
    openDisputeModal
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Leaderboards", href: "/leaderboard" },
    { label: "Discover", href: "/search" },
    { label: "Admin Hub", href: "/admin" },
    { label: "Settings", href: "/settings" }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-canvas">
      <div className="mx-auto flex h-20 min-w-0 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Brand & Navigation */}
        <div className="flex min-w-0 flex-1 items-center gap-3 lg:gap-6">
          <BrandLogo variant="horizontal" size="md" showLivePulse={true} href="/" className="min-w-0" />

          {/* Three adapters exist, but the accounts and figures on these screens are still
              illustrative. Claiming "live" here would break the ground rule. */}
          <div
            title="Three provider adapters are wired (GitHub, LeetCode, HackerRank). The accounts and figures shown on these screens are illustrative until a student links one."
            className="hidden shrink-0 cursor-help items-center gap-2 whitespace-nowrap rounded-xl border border-accent/25 bg-accent/10 px-3 py-1.5 font-sans text-xs text-accent shadow-sm transition-colors hover:bg-accent/15 xl:inline-flex"
          >
            <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="font-semibold">Demo data · 3 adapters wired</span>
          </div>

          <nav className="hidden min-w-0 items-center gap-1.5 rounded-2xl border border-border-subtle bg-surface p-1 lg:flex">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`relative whitespace-nowrap px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "text-ink font-semibold"
                      : "text-muted hover:text-ink hover:bg-white/[0.04]"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="header-active-nav"
                      className="absolute inset-0 rounded-xl bg-surface-raised border border-border shadow-sm"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </NextLink>
              );
            })}
          </nav>
        </div>

        {/* Global Utilities & Profile */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* Quick Search / Cmd+K Pill: icon-only below lg so 768px never overflows */}
          <button
            onClick={openCommandPalette}
            aria-label="Search or command"
            className="group flex shrink-0 items-center gap-2.5 rounded-xl border border-border bg-surface p-2.5 font-sans text-sm text-muted shadow-sm transition-colors hover:bg-surface-raised hover:text-ink lg:px-4 lg:py-2.5"
          >
            <Search className="h-4 w-4 shrink-0 text-muted transition-colors group-hover:text-accent" />
            <span className="hidden whitespace-nowrap text-muted transition-colors group-hover:text-ink-secondary lg:inline">Search or command...</span>
            <kbd className="hidden items-center gap-1 rounded-md border border-border bg-white/5 px-2 py-0.5 font-sans text-xs font-semibold text-muted xl:inline-flex">
              <Command className="h-3 w-3 shrink-0" /> K
            </kbd>
          </button>

          {/* Sync Trigger Button */}
          <button
            onClick={triggerLiveSync}
            disabled={isSyncing}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 font-sans text-sm text-ink transition-colors hover:bg-surface-raised disabled:opacity-50 lg:px-4"
            title="Execute Live Telemetry Crawl"
          >
            <RotateCw className={`h-4 w-4 shrink-0 text-accent ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden whitespace-nowrap text-muted font-medium lg:inline">
              {isSyncing ? "Syncing..." : lastSyncTime}
            </span>
          </button>

          {/* User Profile Menu */}
          <div className="relative shrink-0" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-label="Account menu"
              aria-expanded={isProfileOpen}
              className="flex min-w-0 shrink-0 items-center gap-3 rounded-xl border border-border bg-surface p-1.5 shadow-sm transition-colors hover:bg-surface-raised sm:px-3 sm:py-2"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/40 bg-surface-raised font-mono text-sm font-bold text-accent shadow-sm">
                {userInitials}
              </div>
              <div className="hidden min-w-0 text-left lg:block">
                <div className="truncate text-sm font-semibold leading-tight text-ink">
                  {currentUser.name}
                </div>
                <div className="truncate text-xs font-mono text-muted">
                  {currentUser.role === "co-admin" ? "Faculty Co-Admin" : currentUser.rollNo}
                </div>
              </div>
              <ChevronDown className={`h-4 w-4 shrink-0 text-muted ml-0.5 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                  className="absolute right-0 mt-2.5 w-72 max-w-[calc(100vw-2rem)] rounded-panel bg-surface border border-border shadow-overlay p-2.5 z-50 text-sm font-sans"
                >
                  <div className="px-3.5 py-3 border-b border-border-subtle">
                    <div className="font-bold text-base text-ink">{currentUser.name}</div>
                    <div className="text-xs font-mono text-muted truncate mt-0.5">{currentUser.email}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 border border-border text-accent">
                      <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <span>Role: {currentUser.role === "co-admin" ? "Co-Admin Reviewer" : "Verified Student"}</span>
                    </div>
                  </div>

                  <div className="py-1.5 space-y-0.5">
                    <NextLink
                      href="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-ink-secondary hover:text-ink hover:bg-white/5 transition-colors font-medium"
                    >
                      <Settings className="h-4 w-4 shrink-0 text-muted" />
                      <span>Account Settings</span>
                    </NextLink>

                    <NextLink
                      href="/privacy"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-ink-secondary hover:text-ink hover:bg-white/5 transition-colors font-medium"
                    >
                      <Shield className="h-4 w-4 shrink-0 text-muted" />
                      <span>Privacy &amp; Governance</span>
                    </NextLink>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        openDisputeModal();
                      }}
                      className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-ink-secondary hover:text-status-error hover:bg-white/5 transition-colors text-left font-medium"
                    >
                      <ShieldAlert className="h-4 w-4 shrink-0 text-status-error" />
                      <span>Lodge Score Dispute</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        switchRole(currentUser.role === "student" ? "co-admin" : "student");
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-ink-secondary hover:text-accent hover:bg-white/5 transition-colors text-left font-medium"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Shield className="h-4 w-4 shrink-0 text-accent" />
                        <span>Switch to {currentUser.role === "student" ? "Co-Admin View" : "Student View"}</span>
                      </div>
                    </button>
                  </div>

                  <div className="pt-1.5 border-t border-border-subtle">
                    <NextLink
                      href="/login"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-muted hover:text-status-error hover:bg-white/5 transition-colors font-medium"
                    >
                      <LogOut className="h-4 w-4 shrink-0" />
                      <span>Sign Out</span>
                    </NextLink>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Trigger: shows wherever the desktop nav does not */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
            className="shrink-0 rounded-xl border border-border bg-surface p-2 text-muted transition-colors hover:text-ink lg:hidden"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="border-t border-border-subtle bg-canvas px-4 pt-2 pb-4 space-y-1 lg:hidden">
          <div className="px-3 pb-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              Demo data — 3 adapters wired, no account linked
            </span>
          </div>
          {navLinks.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-white/5 hover:text-ink"
            >
              {link.label}
            </NextLink>
          ))}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openCommandPalette();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-ink-secondary transition-colors hover:bg-white/5 hover:text-ink text-left"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-accent" />
            <span>Search or command (Cmd+K)</span>
          </button>
        </div>
      )}
    </header>
  );
}
