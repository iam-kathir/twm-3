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
  Command,
  CornerDownLeft
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setSearch("");
    }
  }, [isCommandPaletteOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

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

  type FlatItem =
    | { kind: "nav"; id: string; label: string; path: string; icon: any }
    | { kind: "action"; id: string; label: string; action: () => void; icon: any }
    | { kind: "student"; rollNo: string; name: string; handle: string; avatarInitial: string };

  const flatItems: FlatItem[] = [
    ...filteredNav.map((item) => ({ kind: "nav" as const, ...item })),
    ...filteredActions.map((item) => ({ kind: "action" as const, ...item })),
    ...filteredStudents.map((s) => ({ kind: "student" as const, ...s }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeCommandPalette();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (flatItems.length > 0 ? (prev + 1) % flatItems.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatItems[selectedIndex]) {
        const item = flatItems[selectedIndex];
        if (item.kind === "nav") navigateTo(item.path);
        else if (item.kind === "action") item.action();
        else if (item.kind === "student") navigateTo(`/search?q=${encodeURIComponent(item.name)}`);
      }
    }
  };

  let currentIndexTracker = 0;

  return (
    <div
      onClick={closeCommandPalette}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/85 backdrop-blur-xl"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -12 }}
        transition={{ type: "spring", stiffness: 420, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl rounded-panel bg-surface border border-white/10 shadow-overlay overflow-hidden flex flex-col relative"
      >
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />

        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] gap-3 bg-surface-raised/50 relative z-10">
          <Search className="h-4 w-4 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command, page, or classmate name..."
            className="flex-1 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none font-sans"
          />
          <button
            onClick={closeCommandPalette}
            className="flex items-center gap-1 text-xs text-muted hover:text-ink px-2 py-1 rounded-md bg-white/5 border border-white/10 transition-colors"
          >
            <span>ESC</span>
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-4 relative z-10">
          {/* Navigation group */}
          {filteredNav.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted">
                Navigation
              </div>
              <div className="space-y-1">
                {filteredNav.map((item) => {
                  const Icon = item.icon;
                  const itemIndex = currentIndexTracker++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.path)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all group text-left ${
                        isSelected
                          ? "bg-accent/15 border border-accent/30 text-white font-semibold shadow-sm"
                          : "text-slate-300 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 transition-colors ${isSelected ? "text-accent" : "text-slate-400 group-hover:text-accent"}`} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {isSelected && <CornerDownLeft className="h-3 w-3 text-accent" />}
                        <ArrowRight className={`h-3.5 w-3.5 transition-all ${isSelected ? "text-accent translate-x-0 opacity-100" : "text-slate-600 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions group */}
          {filteredActions.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted">
                Platform Actions
              </div>
              <div className="space-y-1">
                {filteredActions.map((item) => {
                  const Icon = item.icon;
                  const itemIndex = currentIndexTracker++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all group text-left ${
                        isSelected
                          ? "bg-accent/15 border border-accent/30 text-white font-semibold shadow-sm"
                          : "text-slate-300 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 transition-colors ${isSelected ? "text-accent" : "text-slate-400 group-hover:text-accent"}`} />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && <CornerDownLeft className="h-3 w-3 text-accent" />}
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${isSelected ? "bg-accent/20 text-accent font-semibold" : "bg-white/5 text-muted"}`}>Run</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Students Directory quick match */}
          {q.length > 0 && filteredStudents.length > 0 && (
            <div>
              <div className="px-3 py-1.5 text-xs font-medium text-muted">
                Classmates
              </div>
              <div className="space-y-1">
                {filteredStudents.map((s) => {
                  const itemIndex = currentIndexTracker++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={s.rollNo}
                      onClick={() => navigateTo(`/search?q=${encodeURIComponent(s.name)}`)}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-sans transition-all group text-left ${
                        isSelected
                          ? "bg-accent/15 border border-accent/30 text-white font-semibold shadow-sm"
                          : "text-slate-300 hover:bg-white/[0.04] border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-surface-raised border border-white/10 flex items-center justify-center text-xs text-accent font-semibold">
                          {s.avatarInitial}
                        </div>
                        <span>{s.name}</span>
                        <span className="font-mono text-xs text-muted">@{s.handle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected && <CornerDownLeft className="h-3 w-3 text-accent" />}
                        <span className="text-xs text-muted">{s.rollNo}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredNav.length === 0 && filteredActions.length === 0 && filteredStudents.length === 0 && (
            <div className="py-12 text-center text-xs font-mono text-muted space-y-1">
              <p>No matching commands or classmates found for &quot;{search}&quot;</p>
              <p className="text-xs text-muted">Try &quot;dashboard&quot;, &quot;sync&quot;, or &quot;dispute&quot;</p>
            </div>
          )}
        </div>

        {/* Footer info strip */}
        <div className="px-4 py-2.5 border-t border-white/[0.07] bg-canvas flex items-center justify-between text-xs text-muted relative z-10">
          <div className="flex items-center gap-2">
            <Command className="h-3 w-3 text-accent" />
            <span className="text-slate-400">Navigate:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs">↓</kbd>
            <span className="text-slate-400 ml-1">Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs">↵</kbd>
          </div>
          <span className="hidden sm:inline">User: {currentUser.name}</span>
        </div>
      </motion.div>
    </div>
  );
}
