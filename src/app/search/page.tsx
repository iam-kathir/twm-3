"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  GitCommit,
  ChevronRight,
  ShieldAlert,
  RefreshCw
} from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { LeetCodeIcon as Code2 } from "@/components/ui/LeetCodeIcon";
import { HackerRankIcon as Award } from "@/components/ui/HackerRankIcon";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";
import type { SearchableDeveloper, EvidenceLevel } from "@/lib/search";

const POPULAR_TAGS = [
  "TypeScript", 
  "Python", 
  "Next.js", 
  "Go", 
  "Algorithms", 
  "Docker", 
  "PyTorch", 
  "PostgreSQL",
  "C++"
];

export default function SearchPage() {
  const { openDisputeModal } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceLevel | "ALL">("ALL");
  const [selectedDev, setSelectedDev] = useState<SearchableDeveloper | null>(null);

  const [developers, setDevelopers] = useState<SearchableDeveloper[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const loadDevelopers = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetch("/api/search");
        const data = await res.json();
        if (!res.ok || !data.success || !Array.isArray(data.developers)) {
          if (!cancelled) setLoadError("The cohort directory is unavailable right now. Check your connection and try again.");
          return;
        }
        if (!cancelled) setDevelopers(data.developers);
      } catch (err) {
        if (!cancelled) setLoadError("The cohort directory could not be loaded. Check your connection and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDevelopers();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedDev) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedDev(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedDev]);

  const filteredDevelopers = useMemo(() => {
    return developers.filter((dev) => {
      // Text search
      const q = searchQuery.toLowerCase().trim();
      const matchesText =
        q === "" ||
        dev.name.toLowerCase().includes(q) ||
        dev.rollNo.toLowerCase().includes(q) ||
        dev.githubHandle.toLowerCase().includes(q) ||
        dev.roleInterest.toLowerCase().includes(q) ||
        dev.tags.some((t) => t.name.toLowerCase().includes(q));

      // Tag filter
      const matchesTag =
        !selectedTag ||
        dev.tags.some(
          (t) => t.name.toLowerCase() === selectedTag.toLowerCase()
        );

      // Evidence filter
      const matchesEvidence =
        evidenceFilter === "ALL" ||
        dev.tags.some((t) => t.evidence === evidenceFilter);

      return matchesText && matchesTag && matchesEvidence;
    });
  }, [developers, searchQuery, selectedTag, evidenceFilter]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-brand-primary/30 selection:text-white overflow-x-hidden">
      <AppHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-w-0">
        {/* Title & Philosophy Banner */}
        <div className="space-y-3">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs sm:text-sm font-mono font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Audited Peer Discovery</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
                Class Developer &amp; Skill Directory
              </h1>
              <p className="text-base sm:text-lg text-muted max-w-3xl leading-relaxed">
                Explore peer capabilities grounded in verified telemetry, code manifest artifacts, and tamper-resistant evidence classifications.
              </p>
            </div>

            {/* Evidence Legend Pill */}
            <div className="flex items-center gap-2 bg-surface border border-white/[0.08] px-4 py-2.5 rounded-xl shadow-panel">
              <span className="text-xs text-muted font-semibold mr-1">Verification Standard:</span>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-mono text-xs font-semibold shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Source Manifest</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-brand-primary/10 text-brand-primary border border-brand-primary/25 font-mono text-xs font-semibold shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Observed Activity</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-muted border border-white/10 font-mono text-xs font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Self-Reported</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-surface border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Input Field */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                id="developer-search-input"
                name="developer-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, roll number, GitHub handle, or technology..."
                aria-describedby="developer-search-hint"
                className="w-full pl-12 pr-20 py-3.5 bg-canvas border border-white/[0.08] rounded-xl text-base text-white placeholder:text-muted focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-colors font-sans shadow-inner"
              />
              <span id="developer-search-hint" className="sr-only">Search filters the verified cohort directory below.</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-white px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Evidence Level Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted hidden sm:block" />
              <select
                id="evidence-filter"
                name="evidence-filter"
                value={evidenceFilter}
                onChange={(e) => setEvidenceFilter(e.target.value as any)}
                aria-label="Filter by Evidence Standard"
                className="bg-canvas border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-brand-primary font-mono cursor-pointer"
              >
                <option value="ALL">All Evidence Standards</option>
                <option value="EXPLICIT_SOURCE">Explicit Source Only</option>
                <option value="SUPPORTED_INFERENCE">Supported Inference</option>
                <option value="SELF_DECLARED">Self-Declared</option>
              </select>
            </div>
          </div>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
            <span className="text-xs text-muted flex items-center space-x-1.5 mr-1 font-semibold">
              <Tag className="w-3.5 h-3.5" />
              <span>Filter by Tag:</span>
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-3 py-1.5 rounded-lg bg-brand-secondary text-white font-bold text-xs font-mono flex items-center space-x-1 shadow-sm"
              >
                <span>× {selectedTag}</span>
              </button>
            )}
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-lg text-[13px] font-mono transition-colors duration-200 ${
                  selectedTag === tag
                    ? "bg-brand-secondary text-white font-bold border border-brand-secondary"
                    : "bg-surface-raised text-muted hover:text-white border border-white/[0.06] hover:border-white/20"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted px-1 font-mono" aria-live="polite">
          <span>
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-secondary" aria-hidden="true" />
                <span>Loading verified class roster…</span>
              </span>
            ) : loadError ? (
              <span className="inline-flex items-center gap-2 text-amber-400">
                <AlertCircle className="w-4 h-4" aria-hidden="true" />
                <span>Directory unavailable.</span>
              </span>
            ) : (
              <>
                Found <strong className="text-white font-bold">{filteredDevelopers.length}</strong> verified classmate{filteredDevelopers.length === 1 ? "" : "s"}
              </>
            )}
          </span>
          <span className="text-[12px] text-muted">
            Rule §10.3: Telemetry evidence verified
          </span>
        </div>

        {loadError && !loading && (
          <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span><strong className="block">Directory unavailable.</strong>{loadError}</span>
            </p>
            <button type="button" onClick={() => window.location.reload()} className="shrink-0 rounded-xl border border-amber-500/30 px-4 py-2 text-sm font-semibold text-amber-200 transition-colors hover:bg-amber-500/20">Retry</button>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="bg-surface border border-white/[0.08] rounded-2xl p-7 animate-pulse space-y-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-xl bg-white/10" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                    <div className="h-3 w-1/2 bg-white/5 rounded" />
                  </div>
                </div>
                <div className="h-12 bg-white/5 rounded-xl" />
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-white/10 rounded-md" />
                  <div className="h-6 w-20 bg-white/10 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Developer Cards Grid */}
        {!loading && !loadError && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredDevelopers.map((dev) => (
                <motion.div
                  key={dev.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="bg-surface border border-white/[0.08] rounded-2xl p-7 hover:border-white/20 transition-colors duration-300 flex flex-col justify-between group shadow-xl"
                >
                  <div className="space-y-5">
                    {/* Header Row */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-surface-raised border border-brand-primary/20 flex items-center justify-center font-bold text-base text-brand-primary shadow-sm">
                          {dev.avatarInitials}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-white group-hover:text-brand-secondary transition-colors flex items-center space-x-1.5">
                            <span>{dev.name}</span>
                            <UserCheck className="w-4 h-4 text-emerald-400" />
                          </h3>
                          <p className="text-xs sm:text-sm text-muted font-mono">
                            @{dev.githubHandle} • {dev.rollNo}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Focus & Rhythm */}
                    <div className="space-y-1.5">
                      <p className="text-sm sm:text-base font-medium text-slate-200">
                        {dev.roleInterest}
                      </p>
                      <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-surface-raised border border-white/[0.06] text-xs font-mono text-brand-secondary">
                        <span className="w-2 h-2 rounded-full bg-brand-secondary" />
                        <span>{dev.activeRhythm}</span>
                      </div>
                    </div>

                    {/* Tags & Evidence Badges */}
                    <div className="space-y-2 pt-2">
                      <span className="text-xs text-muted block font-semibold">
                        Verified Capabilities:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {dev.tags.map((tag) => {
                          const isExplicit = tag.evidence === "EXPLICIT_SOURCE";
                          const isSupported = tag.evidence === "SUPPORTED_INFERENCE";
                          return (
                            <div
                              key={tag.id}
                              title={`${tag.name}: ${tag.sourceDetail} (${tag.evidence})`}
                              className={`px-2.5 py-1 rounded-md text-xs font-mono border flex items-center space-x-1.5 cursor-help transition-colors ${
                                isExplicit
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                                  : isSupported
                                  ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:border-brand-primary/40"
                                  : "bg-surface-raised text-muted border-white/10 hover:border-white/20"
                              }`}
                            >
                              <span>#{tag.name}</span>
                              {isExplicit ? (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              ) : isSupported ? (
                                <ShieldCheck className="w-3 h-3 text-brand-primary" />
                              ) : (
                                <AlertCircle className="w-3 h-3 text-amber-400" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Footer Telemetry Stats */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-sm font-mono text-muted">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1.5 text-white" title="GitHub Verified Repos">
                        <Github className="w-4 h-4 text-muted" />
                        <span>{dev.platforms.github.repos} repos</span>
                      </span>
                      <span className="flex items-center space-x-1.5 text-white" title="LeetCode Solved Problems">
                        <Code2 className="w-4 h-4 text-provider-leetcode-brand" />
                        <span>{dev.platforms.leetcode.solved}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-muted text-xs" title="HackerRank Verified Stars (Display Only)">
                        <Award className="w-3.5 h-3.5 text-provider-hackerrank" />
                        <span>{dev.platforms.hackerrank.stars} stars</span>
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedDev(dev)}
                      className="inline-flex items-center space-x-1 text-brand-secondary hover:underline text-sm font-sans font-semibold"
                    >
                      <span>Inspect</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Empty state fallback — honest, not a silent zero */}
        {!loading && !loadError && filteredDevelopers.length === 0 && (
          <div className="text-center py-16 px-6 bg-surface border border-dashed border-white/10 rounded-2xl">
            <Search className="w-8 h-8 text-muted mx-auto mb-3" aria-hidden="true" />
            <h3 className="text-base font-semibold text-ink">No developers match your query</h3>
            <p className="text-sm text-muted max-w-sm mx-auto mt-2 leading-relaxed">
              No verified classmates match the current search, tag and evidence filters.
              Try clearing filters or searching for broader terms like TypeScript, Python, or Go.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
                setEvidenceFilter("ALL");
              }}
              className="mt-5 px-4 py-2 rounded-lg bg-surface-raised border border-white/10 text-sm text-white hover:bg-white/10 transition-colors"
            >
              Reset filters
            </button>
          </div>
        )}
      </main>

      {/* Interactive Telemetry Inspection Modal */}
      <AnimatePresence>
        {selectedDev && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedDev(null)}>
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="search-inspect-title"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-white/10 rounded-panel max-w-2xl w-full p-6 space-y-6 shadow-overlay relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedDev(null)}
                aria-label={`Close details for ${selectedDev.name}`}
                className="absolute top-4 right-4 p-2 rounded-lg bg-surface-raised hover:bg-white/10 text-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 border border-brand-primary/20 flex items-center justify-center font-bold text-xl text-brand-primary">
                  {selectedDev.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 id="search-inspect-title" className="text-xl font-bold text-white">{selectedDev.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium">
                      COHORT VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    @{selectedDev.githubHandle} • Roll {selectedDev.rollNo} • {selectedDev.classBatch}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1.5 font-medium">
                    {selectedDev.roleInterest}
                  </p>
                </div>
              </div>

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-canvas rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <span className="text-xs font-medium text-muted block">Active rhythm</span>
                  <span className="text-sm font-bold text-brand-secondary font-mono">{selectedDev.activeRhythm}</span>
                  <span className="text-xs text-muted block">Weekly regularity</span>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <span className="text-xs font-medium text-muted block">GitHub telemetry</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedDev.platforms.github.repos} Repos</span>
                  <span className="text-xs text-emerald-400 block font-medium">{selectedDev.platforms.github.matchRate}</span>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <span className="text-xs font-medium text-muted block">LeetCode problems</span>
                  <span className="text-sm font-bold text-provider-leetcode-brand font-mono">{selectedDev.platforms.leetcode.solved} Solved</span>
                  <span className="text-xs text-muted block">{selectedDev.platforms.hackerrank.stars} stars — HackerRank (display only)</span>
                </div>
              </div>

              {/* Verified Capabilities & Explicit File Evidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs text-muted">
                    Audited Skill Artifacts (Rule §10.3)
                  </h4>
                  <span className="text-xs font-mono text-emerald-400">
                    {selectedDev.tags.filter(t => t.evidence === "EXPLICIT_SOURCE").length} Explicit Manifests Verified
                  </span>
                </div>
                <div className="space-y-2">
                  {selectedDev.tags.map((tag) => (
                    <div 
                      key={tag.id}
                      className="p-3 rounded-xl bg-surface-raised border border-white/[0.06] flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white font-mono">#{tag.name}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium border ${
                            tag.evidence === "EXPLICIT_SOURCE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : tag.evidence === "SUPPORTED_INFERENCE"
                              ? "bg-brand-primary/10 text-brand-primary border-brand-primary/20"
                              : "bg-white/5 text-muted border-white/10"
                          }`}>
                            {tag.evidence}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary">
                          {tag.sourceDetail}
                        </p>
                      </div>
                      <div className="text-xs font-medium text-muted shrink-0 flex items-center space-x-1">
                        <GitCommit className="w-3 h-3 text-brand-primary" />
                        <span>Sha Audited</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Compliance Card */}
              <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Telemetry Observation Boundary (IST 23:59:59) Validated</span>
                </div>
                <span className="text-muted text-xs">Rule §9.7</span>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href={`/dashboard?user=${selectedDev.githubHandle}`}
                  onClick={() => setSelectedDev(null)}
                  className="flex-1 py-2.5 rounded-xl bg-brand-secondary hover:bg-accent-hover text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <span>Open Telemetry Cockpit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => {
                    setSelectedDev(null);
                    openDisputeModal("github_active_days");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-surface-raised hover:bg-white/10 text-xs font-mono text-ink-secondary border border-white/10 flex items-center space-x-1.5 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>Peer Inquiry (§9.7)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-canvas px-6 py-4 text-[12px] text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TWM 3.1 Platform • Peer discovery &amp; skill verification</span>
          <span className="font-mono text-[12px]">Rule §10.3: grounded in verified artifacts</span>
        </div>
      </footer>
    </div>
  );
}
