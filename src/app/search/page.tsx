"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Tag, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  Github, 
  Code2, 
  ExternalLink,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
  Calendar,
  GitCommit,
  ChevronRight,
  ShieldAlert,
  Award
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { useApp } from "@/context/AppContext";


type EvidenceLevel = "EXPLICIT_SOURCE" | "SUPPORTED_INFERENCE" | "SELF_DECLARED";

interface DeveloperTag {
  id: string;
  name: string;
  evidence: EvidenceLevel;
  sourceDetail: string;
}

interface SearchableDeveloper {
  id: string;
  name: string;
  githubHandle: string;
  avatarInitials: string;
  classBatch: string;
  roleInterest: string;
  activeRhythm: string;
  tags: DeveloperTag[];
  platforms: {
    github: { repos: number; activeDaysThisMonth: number };
    leetcode: { solved: number };
    hackerrank: { stars: number };
  };
}

const MOCK_DEVELOPERS: SearchableDeveloper[] = [
  {
    id: "dev-1",
    name: "Aarav Sharma",
    githubHandle: "aarav-dev",
    avatarInitials: "AS",
    classBatch: "B.Tech CSE '26 (Sec A)",
    roleInterest: "Distributed Systems & Full-Stack",
    activeRhythm: "6/7 days active this week",
    tags: [
      { id: "t1", name: "TypeScript", evidence: "EXPLICIT_SOURCE", sourceDetail: "Verified via 4 repo manifests" },
      { id: "t2", name: "Next.js", evidence: "EXPLICIT_SOURCE", sourceDetail: "Verified in 3 package.json configs" },
      { id: "t3", name: "PostgreSQL", evidence: "SUPPORTED_INFERENCE", sourceDetail: "Prisma schema & Docker compose" },
      { id: "t4", name: "Algorithms", evidence: "SUPPORTED_INFERENCE", sourceDetail: "184 verified LeetCode solves" },
      { id: "t5", name: "Rust", evidence: "SELF_DECLARED", sourceDetail: "Declared on profile (learning)" }
    ],
    platforms: {
      github: { repos: 12, activeDaysThisMonth: 24 },
      leetcode: { solved: 184 },
      hackerrank: { stars: 5 }
    }
  },
  {
    id: "dev-2",
    name: "Rohan Varma",
    githubHandle: "rohan-code",
    avatarInitials: "RO",
    classBatch: "B.Tech CSE '26 (Sec A)",
    roleInterest: "Backend & Systems Infrastructure",
    activeRhythm: "7/7 days active this week",
    tags: [
      { id: "t6", name: "Go", evidence: "EXPLICIT_SOURCE", sourceDetail: "Verified via go.mod in 5 repos" },
      { id: "t7", name: "Docker", evidence: "EXPLICIT_SOURCE", sourceDetail: "Dockerfile and Compose verified" },
      { id: "t8", name: "Kubernetes", evidence: "SUPPORTED_INFERENCE", sourceDetail: "K8s YAML manifests in main branch" },
      { id: "t9", name: "Algorithms", evidence: "SUPPORTED_INFERENCE", sourceDetail: "212 verified LeetCode solves" }
    ],
    platforms: {
      github: { repos: 18, activeDaysThisMonth: 28 },
      leetcode: { solved: 212 },
      hackerrank: { stars: 5 }
    }
  },
  {
    id: "dev-3",
    name: "Priya Nair",
    githubHandle: "priya-n",
    avatarInitials: "PR",
    classBatch: "B.Tech CSE '26 (Sec B)",
    roleInterest: "AI/ML & Data Engineering",
    activeRhythm: "6/7 days active this week",
    tags: [
      { id: "t10", name: "Python", evidence: "EXPLICIT_SOURCE", sourceDetail: "PyProject & requirements.txt" },
      { id: "t11", name: "PyTorch", evidence: "SUPPORTED_INFERENCE", sourceDetail: "Model training commit logs" },
      { id: "t12", name: "FastAPI", evidence: "EXPLICIT_SOURCE", sourceDetail: "API service route declarations" },
      { id: "t13", name: "MLOps", evidence: "SELF_DECLARED", sourceDetail: "Declared interest" }
    ],
    platforms: {
      github: { repos: 14, activeDaysThisMonth: 22 },
      leetcode: { solved: 142 },
      hackerrank: { stars: 5 }
    }
  },
  {
    id: "dev-4",
    name: "Aditya Kumar",
    githubHandle: "aditya-k",
    avatarInitials: "AD",
    classBatch: "B.Tech CSE '26 (Sec A)",
    roleInterest: "Full-Stack & Mobile Development",
    activeRhythm: "5/7 days active this week",
    tags: [
      { id: "t14", name: "React Native", evidence: "EXPLICIT_SOURCE", sourceDetail: "App repo code audit" },
      { id: "t15", name: "TypeScript", evidence: "EXPLICIT_SOURCE", sourceDetail: "tsconfig.json across 3 repos" },
      { id: "t16", name: "Node.js", evidence: "SUPPORTED_INFERENCE", sourceDetail: "Express backend endpoints" },
      { id: "t17", name: "GraphQL", evidence: "SELF_DECLARED", sourceDetail: "Profile portfolio declaration" }
    ],
    platforms: {
      github: { repos: 9, activeDaysThisMonth: 19 },
      leetcode: { solved: 95 },
      hackerrank: { stars: 4 }
    }
  },
  {
    id: "dev-5",
    name: "Sneha Patel",
    githubHandle: "sneha-p",
    avatarInitials: "SN",
    classBatch: "B.Tech CSE '26 (Sec B)",
    roleInterest: "Competitive Programming & Backend",
    activeRhythm: "4/7 days active this week",
    tags: [
      { id: "t18", name: "C++", evidence: "EXPLICIT_SOURCE", sourceDetail: "Competitive programming repo source" },
      { id: "t19", name: "Algorithms", evidence: "SUPPORTED_INFERENCE", sourceDetail: "128 verified LeetCode solves" },
      { id: "t20", name: "SQL", evidence: "SUPPORTED_INFERENCE", sourceDetail: "Course database submissions" }
    ],
    platforms: {
      github: { repos: 7, activeDaysThisMonth: 16 },
      leetcode: { solved: 128 },
      hackerrank: { stars: 4 }
    }
  }
];

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
  const { openDisputeModal, currentUser, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceLevel | "ALL">("ALL");
  const [selectedDev, setSelectedDev] = useState<SearchableDeveloper | null>(null);

  const filteredDevelopers = useMemo(() => {
    return MOCK_DEVELOPERS.filter((dev) => {
      // Text search
      const q = searchQuery.toLowerCase().trim();
      const matchesText =
        q === "" ||
        dev.name.toLowerCase().includes(q) ||
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
  }, [searchQuery, selectedTag, evidenceFilter]);

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-accent selection:text-canvas">
      <AppHeader />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title & Philosophy Banner */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-accent/10 border border-accent/20 text-accent text-xs sm:text-sm font-mono font-semibold">
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
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm bg-surface border border-white/[0.08] p-3 rounded-xl shadow-sm">
              <span className="text-muted font-mono mr-1">Evidence Standard:</span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>EXPLICIT</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-500/10 text-accent border border-amber-500/20 font-mono text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>SUPPORTED</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-surface-raised text-muted border border-white/10 font-mono text-xs font-semibold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>SELF-DECLARED</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-surface border border-white/[0.08] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Input Field */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-soft" />
              <input
                id="developer-search-input"
                name="developer-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, GitHub handle, or technology (e.g. Next.js, Go)..."
                className="w-full pl-12 pr-4 py-3.5 bg-canvas border border-white/[0.08] rounded-xl text-base text-white placeholder-muted-soft focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-sans shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-white"
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
                className="bg-canvas border border-white/[0.08] text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:border-accent font-mono cursor-pointer"
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
            <span className="text-xs text-muted font-mono flex items-center space-x-1.5 mr-1 font-semibold uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              <span>Filter by Tag:</span>
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-3 py-1.5 rounded-lg bg-accent text-canvas font-bold text-xs font-mono flex items-center space-x-1 shadow-sm"
              >
                <span>✕ {selectedTag}</span>
              </button>
            )}
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 ${
                  selectedTag === tag
                    ? "bg-accent text-canvas font-bold border border-accent"
                    : "bg-surface-raised text-muted hover:text-white border border-white/[0.06] hover:border-white/20"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Empty State */}
        <div className="flex items-center justify-between text-sm text-muted px-1 font-mono">
          <span>
            Found <strong className="text-white font-bold">{filteredDevelopers.length}</strong> verified classmate{filteredDevelopers.length === 1 ? "" : "s"}
          </span>
          <span className="text-xs text-muted-soft">
            Rule §10.3: Telemetry evidence verified
          </span>
        </div>

        {/* Developer Cards Grid */}
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
                className="bg-surface border border-white/[0.08] rounded-2xl p-7 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div className="space-y-5">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-surface-raised border border-white/10 flex items-center justify-center font-bold text-base text-accent shadow-sm">
                        {dev.avatarInitials}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-white group-hover:text-accent transition-colors flex items-center space-x-1.5">
                          <span>{dev.name}</span>
                          <UserCheck className="w-4 h-4 text-emerald-400" />
                        </h3>
                        <p className="text-xs sm:text-sm text-muted font-mono">
                          @{dev.githubHandle} • {dev.classBatch}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Focus & Rhythm */}
                  <div className="space-y-1.5">
                    <p className="text-sm sm:text-base font-medium text-slate-200">
                      {dev.roleInterest}
                    </p>
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-surface-raised border border-white/[0.06] text-xs font-mono text-accent">
                      <span className="w-2 h-2 rounded-full bg-accent" />
                      <span>{dev.activeRhythm}</span>
                    </div>
                  </div>

                  {/* Tags & Evidence Badges */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-mono text-muted-soft uppercase tracking-wider block font-semibold">
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
                                ? "bg-amber-500/10 text-accent border-amber-500/20 hover:border-amber-500/40"
                                : "bg-surface-raised text-muted border-white/10 hover:border-white/20"
                            }`}
                          >
                            <span>#{tag.name}</span>
                            {isExplicit ? (
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            ) : isSupported ? (
                              <ShieldCheck className="w-3 h-3 text-accent" />
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
                      <Code2 className="w-4 h-4 text-[#FFA116]" />
                      <span>{dev.platforms.leetcode.solved}</span>
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedDev(dev)}
                    className="inline-flex items-center space-x-1 text-accent hover:underline text-sm font-sans font-semibold"
                  >
                    <span>Inspect Profile</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state fallback */}
        {filteredDevelopers.length === 0 && (
          <div className="text-center py-16 bg-surface border border-dashed border-white/10 rounded-2xl">
            <Search className="w-8 h-8 text-muted-soft mx-auto mb-3" />
            <h3 className="text-base font-semibold text-ink">No developers match your query</h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              Try clearing tags or searching for broader terms like TypeScript, Python, or Go.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
                setEvidenceFilter("ALL");
              }}
              className="mt-4 px-4 py-1.5 rounded-lg bg-surface-raised border border-white/10 text-xs text-white hover:bg-white/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Interactive Telemetry Inspection Modal */}
      <AnimatePresence>
        {selectedDev && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="bg-surface border border-white/10 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDev(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-surface-raised hover:bg-white/10 text-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Modal Header */}
              <div className="flex items-start space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-xl text-accent">
                  {selectedDev.avatarInitials}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-bold text-white">{selectedDev.name}</h2>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      COHORT VERIFIED
                    </span>
                  </div>
                  <p className="text-xs text-muted font-mono mt-0.5">
                    @{selectedDev.githubHandle} • {selectedDev.classBatch}
                  </p>
                  <p className="text-xs text-ink-secondary mt-1.5 font-medium">
                    {selectedDev.roleInterest}
                  </p>
                </div>
              </div>

              {/* Telemetry Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-canvas rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[10px] font-mono text-muted block uppercase">ACTIVE RHYTHM</span>
                  <span className="text-sm font-bold text-accent font-mono">{selectedDev.activeRhythm}</span>
                  <span className="text-[10px] text-muted-soft block">Weekly regularity</span>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[10px] font-mono text-muted block uppercase">GITHUB REPOSITORIES</span>
                  <span className="text-sm font-bold text-white font-mono">{selectedDev.platforms.github.repos} Repos</span>
                  <span className="text-[10px] text-emerald-400 block">{selectedDev.platforms.github.activeDaysThisMonth} active days/mo</span>
                </div>
                <div className="p-3 bg-canvas rounded-xl border border-white/[0.06] text-xs space-y-1">
                  <span className="text-[10px] font-mono text-muted block uppercase">LEETCODE PROBLEMS</span>
                  <span className="text-sm font-bold text-[#FFA116] font-mono">{selectedDev.platforms.leetcode.solved} Solved</span>
                  <span className="text-[10px] text-muted block">{selectedDev.platforms.hackerrank.stars}★ HackerRank</span>
                </div>
              </div>

              {/* Verified Capabilities & Explicit File Evidence */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono text-muted uppercase tracking-wider">
                    Audited Skill Artifacts (Rule §10.3)
                  </h4>
                  <span className="text-[11px] font-mono text-emerald-400">
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
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                            tag.evidence === "EXPLICIT_SOURCE"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : tag.evidence === "SUPPORTED_INFERENCE"
                              ? "bg-amber-500/10 text-accent border-amber-500/20"
                              : "bg-white/5 text-muted border-white/10"
                          }`}>
                            {tag.evidence}
                          </span>
                        </div>
                        <p className="text-xs text-ink-secondary">
                          {tag.sourceDetail}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-muted shrink-0 flex items-center space-x-1">
                        <GitCommit className="w-3 h-3 text-accent" />
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
                <span className="text-muted text-[11px]">Rule §9.7</span>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <Link
                  href={`/dashboard?user=${selectedDev.githubHandle}`}
                  onClick={() => setSelectedDev(null)}
                  className="flex-1 py-2.5 rounded-xl bg-accent hover:bg-amber-400 text-canvas font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
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
                  <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                  <span>Peer Inquiry (§9.7)</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-canvas px-6 py-4 text-xs text-muted-soft">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TWM 3.0 Platform • Peer Discovery &amp; Skill Verification</span>
          <span className="font-mono text-[11px]">Rule §10.3: Grounded in Verified Artifacts</span>
        </div>
      </footer>
    </div>
  );
}
