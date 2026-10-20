"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Activity,
  Trophy,
  UserCheck,
  Shield,
  Settings,
  RotateCw,
  FileDown,
  ShieldAlert,
  ArrowRight,
  User,
  Sliders,
  Sparkles,
  Command
} from "lucide-react";
import { useApp } from "@/context/AppContext";

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    triggerLiveSync,
    openDisputeModal,
    exportLeaderboardCSV,
    exportTelemetryJSON,
    switchRole,
    currentUser,
    leaderboard
  } = useApp();

  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch("");
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const navigateTo = (path: string) => {
    closeCommandPalette();
    router.push(path);
  };

  const navItems = [
    { id: "nav-dash", label: "Developer Cockpit", category: "Navigation", path: "/dashboard", icon: Activity },
    { id: "nav-lead", label: "Class Leaderboards", category: "Navigation", path: "/leaderboard", icon: Trophy },
    { id: "nav-search", label: "Peer Discovery Matrix", category: "Navigation", path: "/search", icon: Search },
    { id: "nav-admin", label: "Governance Hub", category: "Navigation", path: "/admin", icon: Shield },
    { id: "nav-settings", label: "Platform Settings", category: "Navigation", path: "/settings", icon: Settings },
    { id: "nav-onboard", label: "Verified Onboarding", category: "Navigation", path: "/onboarding", icon: UserCheck }
  ];

  const actionItems = [
    {
      id: "act-sync",
      label: "Execute Live Telemetry Crawl",
      category: "Actions",
      icon: RotateCw,
      action: () => {
        closeCommandPalette();
        triggerLiveSync();
      }
    },
    {
      id: "act-dispute",
      label: "Lodge Score Dispute (Rule §9.7)",
      category: "Actions",
      icon: ShieldAlert,
      action: () => {
        closeCommandPalette();
        openDisputeModal();
      }
    },
    {
      id: "act-csv",
      label: "Export Leaderboard Standings (CSV)",
      category: "Actions",
      icon: FileDown,
      action: () => {
        closeCommandPalette();
        exportLeaderboardCSV();
      }
    },
    {
      id: "act-json",
      label: "Export Personal Telemetry Ledger (JSON)",
      category: "Actions",
      icon: FileDown,
      action: () => {
        closeCommandPalette();
        exportTelemetryJSON();
      }
    },
    {
      id: "act-role",
      label: currentUser.role === "student" ? "Switch Persona to Co-Admin" : "Switch Persona to Student",
      category: "Actions",
      icon: User,
      action: () => {
        closeCommandPalette();
        switchRole(currentUser.role === "student" ? "co-admin" : "student");
      }
    }
  ];

  const q = search.toLowerCase().trim();

  const filteredNav = navItems.filter((item) =>
    item.label.toLowerCase().includes(q)
  );

  const filteredActions = actionItems.filter((item) =>
    item.label.toLowerCase().includes(q)
  );

  const filteredStudents = leaderboard.filter((s) =>
    s.name.toLowerCase().includes(q) ||
    s.handle.toLowerCase().includes(q) ||
    s.rollNo.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl rounded-2xl bg-surface border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3 bg-surface-raised">
          <Search className="h-4 w-4 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type a command, page, or classmate name..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-slate-500 focus:outline-none font-sans"
          />
          <div className="flex items-center gap-1 font-mono text-[10px] text-slate-400 px-2 py-0.5 rounded bg-white/5 border border-white/10">
            <span>ESC</span>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4">
          {/* Navigation group */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted">
                Navigation
              </div>
              <div className="space-y-0.5">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.path)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-white/[0.06] hover:text-accent transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-accent transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-accent opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions group */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted">
                Platform Actions
              </div>
              <div className="space-y-0.5">
                {filteredActions.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-white/[0.06] hover:text-accent transition-colors group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-accent transition-colors" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300">Run</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Students Directory quick match */}
          {q.length > 0 && filteredStudents.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-muted">
                Classmates
              </div>
              <div className="space-y-0.5">
                {filteredStudents.map((s) => (
                  <button
                    key={s.rollNo}
                    onClick={() => navigateTo(`/search?q=${encodeURIComponent(s.name)}`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans text-ink hover:bg-white/[0.06] hover:text-accent transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-surface-raised border border-white/10 flex items-center justify-center font-mono text-[9px] text-accent font-bold">
                        {s.avatarInitial}
                      </div>
                      <span>{s.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">@{s.handle}</span>
                    </div>
                    <span className="font-mono text-[10px] text-muted">{s.rollNo}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && filteredStudents.length === 0 && (
            <div className="py-8 text-center text-xs font-mono text-slate-500">
              No matching commands or classmates found for &quot;{search}&quot;
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-4 py-2 border-t border-white/[0.08] bg-canvas flex items-center justify-between text-[11px] font-mono text-muted">
          <div className="flex items-center gap-2">
            <Command className="h-3 w-3 text-accent" />
            <span>TWM 3.0 Telemetry Command Palette</span>
          </div>
          <span>Active: {currentUser.name} ({currentUser.role})</span>
        </div>
      </motion.div>
    </div>
  );
}
