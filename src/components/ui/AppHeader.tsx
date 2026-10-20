"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/navigation";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
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
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-canvas/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-6 lg:gap-8">
          <BrandLogo variant="horizontal" size="md" showLivePulse={true} href="/" />

          {/* Three adapters exist, but the accounts and figures on these screens are still
              illustrative. Claiming "live" here would break the ground rule. */}
          <div
            title="Three provider adapters are wired (GitHub, LeetCode, HackerRank). The accounts and figures shown on these screens are illustrative until a student links one."
            className="hidden xl:inline-flex items-center gap-2 rounded-xl border border-accent/25 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent shadow-sm cursor-help transition-all hover:bg-accent/15"
          >
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-semibold tracking-wide">Demo data · 3 adapters wired</span>
          </div>

          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-surface-raised text-white font-semibold border border-white/10 shadow-sm"
                      : "text-muted hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </NextLink>
              );
            })}
          </nav>
        </div>

        {/* Global Utilities & Profile */}
        <div className="flex items-center gap-3.5">
          {/* Quick Search / Cmd+K Pill */}
          <button
            onClick={openCommandPalette}
            className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-sm text-muted hover:text-ink transition-all font-mono shadow-sm group"
          >
            <Search className="h-4 w-4 text-slate-400 group-hover:text-accent transition-colors" />
            <span className="text-slate-400 group-hover:text-slate-200">Search or command...</span>
            <kbd className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-white/5 border border-white/10 text-muted font-sans font-semibold">
              <Command className="h-3 w-3" /> K
            </kbd>
          </button>

          {/* Sync Trigger Button */}
          <button
            onClick={triggerLiveSync}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-sm font-mono text-ink transition-all disabled:opacity-50"
            title="Execute Live Telemetry Crawl"
          >
            <RotateCw className={`h-4 w-4 text-accent ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline text-muted font-medium">
              {isSyncing ? "Syncing..." : lastSyncTime}
            </span>
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 transition-colors"
            >
              <div className="w-9 h-9 rounded-xl bg-surface-raised border border-accent/40 flex items-center justify-center font-mono text-sm font-bold text-accent shadow-sm">
                AS
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-semibold text-ink leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-xs font-mono text-muted">
                  {currentUser.role === "co-admin" ? "Faculty Co-Admin" : currentUser.rollNo}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 ml-0.5" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-surface border border-white/10 shadow-2xl p-2.5 z-50 text-sm font-sans">
                <div className="px-3.5 py-3 border-b border-white/[0.08]">
                  <div className="font-bold text-base text-ink">{currentUser.name}</div>
                  <div className="text-xs font-mono text-muted truncate mt-0.5">{currentUser.email}</div>
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-white/5 border border-white/10 text-accent">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Role: {currentUser.role === "co-admin" ? "Co-Admin Reviewer" : "Verified Student"}</span>
                  </div>
                </div>

                <div className="py-1.5 space-y-0.5">
                  <NextLink
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-medium"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Account Settings</span>
                  </NextLink>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      openDisputeModal();
                    }}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-white/5 transition-colors text-left font-medium"
                  >
                    <ShieldAlert className="h-4 w-4 text-rose-400" />
                    <span>Lodge Score Dispute</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      switchRole(currentUser.role === "student" ? "co-admin" : "student");
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-slate-300 hover:text-accent hover:bg-white/5 transition-colors text-left font-medium"
                  >
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-accent" />
                      <span>Switch to {currentUser.role === "student" ? "Co-Admin View" : "Student View"}</span>
                    </div>
                  </button>
                </div>

                <div className="pt-1.5 border-t border-white/[0.08]">
                  <NextLink
                    href="/login"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors font-medium"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </NextLink>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-xl bg-surface border border-white/10 text-slate-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 border-t border-white/[0.08] bg-canvas space-y-1">
          <div className="px-3 pb-2">
            <span className="inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
              Demo data — 3 adapters wired, no account linked
            </span>
          </div>
          {navLinks.map((link) => (
            <NextLink
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5"
            >
              {link.label}
            </NextLink>
          ))}
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openCommandPalette();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 text-left"
          >
            <Search className="h-3.5 w-3.5 text-accent" />
            <span>Search or command (Cmd+K)</span>
          </button>
        </div>
      )}
    </header>
  );
}
