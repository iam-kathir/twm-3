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
    <header className="sticky top-0 z-40 border-b border-white/[0.08] bg-canvas/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & Navigation */}
        <div className="flex items-center gap-6">
          <BrandLogo showLivePulse={true} href="/" />

          {/* Every screen under this header renders illustrative data until a provider is
              connected. Saying so is part of the product's honesty rule. */}
          <span
            title="Illustrative figures — no provider is connected yet."
            className="hidden lg:inline-flex items-center gap-1.5 rounded-md border border-accent/25 bg-accent/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent"
          >
            Demo data
          </span>

          <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "bg-surface-raised text-ink font-semibold border border-white/10"
                      : "text-muted hover:text-ink hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </NextLink>
              );
            })}
          </nav>
        </div>

        {/* Global Utilities & Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Search / Cmd+K Pill */}
          <button
            onClick={openCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-xs text-muted hover:text-ink transition-all font-mono shadow-sm group"
          >
            <Search className="h-3.5 w-3.5 text-slate-400 group-hover:text-accent transition-colors" />
            <span className="text-slate-400 group-hover:text-slate-200">Search or command...</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded bg-white/5 border border-white/10 text-muted">
              <Command className="h-2.5 w-2.5" /> K
            </kbd>
          </button>

          {/* Sync Trigger Button */}
          <button
            onClick={triggerLiveSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 text-xs font-mono text-ink transition-all disabled:opacity-50"
            title="Execute Live Telemetry Crawl"
          >
            <RotateCw className={`h-3.5 w-3.5 text-accent ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline text-muted">
              {isSyncing ? "Syncing..." : lastSyncTime}
            </span>
          </button>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 rounded-xl bg-surface hover:bg-surface-raised border border-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-surface-raised border border-accent/30 flex items-center justify-center font-mono text-xs font-bold text-accent">
                AS
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-semibold text-ink leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] font-mono text-muted">
                  {currentUser.role === "co-admin" ? "Co-Admin" : currentUser.rollNo}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-white/10 shadow-2xl p-2 z-50 text-xs font-sans">
                <div className="px-3 py-2 border-b border-white/[0.08]">
                  <div className="font-semibold text-ink">{currentUser.name}</div>
                  <div className="text-[11px] font-mono text-muted truncate">{currentUser.email}</div>
                  <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-mono bg-white/5 border border-white/10 text-accent">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Role: {currentUser.role === "co-admin" ? "Co-Admin Reviewer" : "Verified Student"}</span>
                  </div>
                </div>

                <div className="py-1">
                  <NextLink
                    href="/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </NextLink>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      openDisputeModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-rose-400 hover:bg-white/5 transition-colors text-left"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                    <span>Lodge Score Dispute</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      switchRole(currentUser.role === "student" ? "co-admin" : "student");
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:text-accent hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <Shield className="h-3.5 w-3.5 text-accent" />
                      <span>Switch to {currentUser.role === "student" ? "Co-Admin View" : "Student View"}</span>
                    </div>
                  </button>
                </div>

                <div className="pt-1 border-t border-white/[0.08]">
                  <NextLink
                    href="/login"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
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
              Demo data — no provider connected
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
