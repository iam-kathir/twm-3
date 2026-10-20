"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Trophy,
  Search,
  UserCheck,
  Shield,
  ExternalLink,
  CheckCircle2,
  Layers,
  Sparkles,
  Eye
} from "lucide-react";

interface ScreenView {
  id: string;
  label: string;
  image: string;
  tag: string;
}

interface ScreenItem {
  id: string;
  tabLabel: string;
  title: string;
  badge: string;
  badgeColor: string;
  route: string;
  icon: React.ElementType;
  description: string;
  views: ScreenView[];
  highlightPoints: string[];
}

const SCREENS: ScreenItem[] = [
  {
    id: "dashboard",
    tabLabel: "Cockpit",
    title: "Live Developer Cockpit",
    badge: "Personal Telemetry",
    badgeColor: "bg-accent/10 text-accent border-accent/20",
    route: "/dashboard",
    icon: Activity,
    description: "Real-time activity observation, weekly AI developer recaps, streak consistency tracker, and provider-native UTC/IST time stamps.",
    views: [
      { id: "main", label: "Cockpit Overview", image: "/twm_dashboard_view.png", tag: "Live Metrics" },
      { id: "breakdown", label: "Activity Breakdown", image: "/twm_dashboard_breakdown.png", tag: "Deep Telemetry" }
    ],
    highlightPoints: [
      "Zero surveillance of private code",
      "AI & deterministic weekly recap modes",
      "Manual sync trigger with rate-limit protection",
      "Provider-native UTC contribution calendar"
    ]
  },
  {
    id: "leaderboard",
    tabLabel: "Leaderboards",
    title: "Deterministic Leaderboards",
    badge: "Fair Competition",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    route: "/leaderboard",
    icon: Trophy,
    description: "Platform-specific rankings for GitHub and LeetCode with strict eligibility criteria, audited data quality flags, and deterministic tie-sharing.",
    views: [
      { id: "standings", label: "Rankings & Eligibility", image: "/twm_leaderboard_view.png", tag: "Audited Standings" }
    ],
    highlightPoints: [
      "Missing data never converted to zero",
      "Independent platform tables (no fabricated composite scores)",
      "Transparent audit status and tie-breakers",
      "Sunday 23:59:59 IST boundary rule enforcement"
    ]
  },
  {
    id: "search",
    tabLabel: "Discovery",
    title: "Semantic Developer Discovery",
    badge: "Skill Evidence",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    route: "/search",
    icon: Search,
    description: "Find classmates by verified language expertise, system capabilities, and algorithm focus with rigorous 3-tier evidence attribution.",
    views: [
      { id: "matrix", label: "Capability Matrix", image: "/twm_search_view.png", tag: "Verified Tags" }
    ],
    highlightPoints: [
      "Explicit Source vs Supported Inference evidence flags",
      "Tag-based filtering across repo commits and solved categories",
      "Direct profile deep links with verified identity badges",
      "Full privacy opt-out toggle per developer"
    ]
  },
  {
    id: "onboarding",
    tabLabel: "Onboarding",
    title: "3-Step Verified Onboarding",
    badge: "HMAC Proof",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    route: "/onboarding",
    icon: UserCheck,
    description: "Connect GitHub OAuth, verify LeetCode / HackerRank ownership via 15-minute HMAC bio challenge tokens, and link college email roster.",
    views: [
      { id: "step1", label: "Step 1: Profile Linkage", image: "/twm_onboarding_step1.png", tag: "HMAC Challenge" },
      { id: "step3", label: "Step 3: Verified Roster", image: "/twm_onboarding_step3_verified.png", tag: "Completed Pass" }
    ],
    highlightPoints: [
      "No passwords or private tokens collected",
      "HMAC bio challenge verifies account ownership",
      "Class roster matching prevents impersonation",
      "Configurable public telemetry consent"
    ]
  },
  {
    id: "admin",
    tabLabel: "Governance",
    title: "Governance & Dispute Resolution",
    badge: "Co-Admin Audited",
    badgeColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    route: "/admin",
    icon: Shield,
    description: "Class roster management, sync failure monitors, dispute investigation queue, and tamper-evident audit logs.",
    views: [
      { id: "overview", label: "Roster Management", image: "/twm_admin_view.png", tag: "Admin Console" },
      { id: "disputes", label: "Dispute Investigation", image: "/twm_admin_disputes.png", tag: "Resolution Queue" }
    ],
    highlightPoints: [
      "Two-person integrity for student record changes",
      "Sync failure and rate-limit circuit breaker monitoring",
      "Transparent student dispute review workflow",
      "Immutable audit trail of administrative actions"
    ]
  }
];

export function AppScreensGallery() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [selectedViewIndex, setSelectedViewIndex] = useState<Record<string, number>>({
    dashboard: 0,
    leaderboard: 0,
    search: 0,
    onboarding: 0,
    admin: 0,
  });

  const currentScreen = SCREENS.find((s) => s.id === activeTab) || SCREENS[0];
  const activeViewIdx = selectedViewIndex[activeTab] ?? 0;
  const currentView = currentScreen.views[activeViewIdx] || currentScreen.views[0];

  const handleSelectSubView = (idx: number) => {
    setSelectedViewIndex((prev) => ({
      ...prev,
      [activeTab]: idx,
    }));
  };

  return (
    <section id="screens" className="py-20 md:py-28 border-t border-white/[0.08] relative overflow-hidden bg-tech-dots">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface border border-white/10 text-xs font-mono text-muted mb-4">
            <Layers className="h-4 w-4 text-accent" />
            <span>Interactive Screen Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-ink tracking-tight">
            Designed for Trust and Clarity
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed">
            Explore every module and state of the platform. Clean interfaces crafted with Tailwind, Framer Motion, and accessibility first.
          </p>

          {/* Screen Tabs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5">
            {SCREENS.map((screen) => {
              const Icon = screen.icon;
              const isSelected = activeTab === screen.id;
              return (
                <button
                  key={screen.id}
                  type="button"
                  onClick={() => setActiveTab(screen.id)}
                  className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-mono transition-all ${
                    isSelected
                      ? "text-ink bg-surface-raised border border-accent/40 font-semibold"
                      : "text-muted hover:text-ink hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-accent" : "text-muted"}`} />
                  <span>{screen.tabLabel}</span>
                  {isSelected && (
                    <motion.div
                      layoutId="active-screen-pill"
                      className="absolute inset-0 rounded-xl bg-accent/10 border border-accent/40 -z-10"
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Screen Stage */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="rounded-2xl border border-white/10 bg-surface p-8 sm:p-10 shadow-2xl overflow-hidden"
          >
            {/* Top Bar with Screen Meta & View Toggles */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-6 mb-8 border-b border-white/[0.08] gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border font-semibold ${currentScreen.badgeColor}`}>
                    {currentScreen.badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">
                    {currentScreen.title}
                  </h3>
                </div>
                <p className="mt-2 text-sm sm:text-base text-muted max-w-3xl leading-relaxed">
                  {currentScreen.description}
                </p>
              </div>

              {/* Multi-view Toggles (if screen has multiple captures) */}
              <div className="flex flex-wrap items-center gap-3">
                {currentScreen.views.length > 1 && (
                  <div className="inline-flex p-1.5 rounded-xl bg-surface-raised border border-white/10">
                    {currentScreen.views.map((v, i) => {
                      const isActive = i === activeViewIdx;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => handleSelectSubView(i)}
                          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-mono transition-all ${
                            isActive
                              ? "bg-surface text-ink font-semibold border border-white/10 shadow-sm"
                              : "text-muted hover:text-ink"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5 text-accent" />
                          <span>{v.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <Link
                  href={currentScreen.route}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-mono text-sm font-bold transition-all hover:scale-105 active:scale-95 shrink-0 shadow-lg shadow-accent/20"
                >
                  <span>Open Page</span>
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Browser Preview Frame */}
            <div className="relative rounded-2xl border border-white/10 bg-canvas overflow-hidden shadow-2xl">
              {/* Fake Browser Toolbar */}
              <div className="px-5 py-3 bg-surface-raised border-b border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="px-5 py-1 rounded-lg bg-surface border border-white/10 text-xs sm:text-sm font-mono text-ink-secondary flex items-center gap-2 max-w-sm w-full justify-center">
                  <span className="text-muted">Preview</span>
                  <span className="text-accent font-semibold">{currentScreen.route}</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-mono text-muted">
                  <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-ink">
                    {currentView.tag}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-accent font-medium">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>2560x1385 HD</span>
                  </span>
                </div>
              </div>

              {/* High-Resolution Screenshot Image with AnimatePresence */}
              <div className="relative aspect-[16/9] w-full bg-canvas">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentView.image}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={currentView.image}
                      alt={currentView.label}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 1400px) 100vw, 1300px"
                      priority
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentScreen.highlightPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 rounded-xl bg-surface-raised/70 border border-white/[0.06] text-xs sm:text-sm font-mono text-muted"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
