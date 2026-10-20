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
  UserCheck
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";


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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [evidenceFilter, setEvidenceFilter] = useState<EvidenceLevel | "ALL">("ALL");

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
    <div className="min-h-screen bg-[#090A0E] text-[#F5F6F8] flex flex-col font-sans selection:bg-[#F59E0B] selection:text-[#090A0E]">
      {/* Navigation */}
      <header className="sticky top-0 z-40 bg-[#090A0E]/80 backdrop-blur-md border-b border-white/[0.08] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <BrandLogo showLivePulse={true} />


            <nav className="hidden md:flex items-center gap-1.5 text-xs font-mono">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/leaderboard"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Leaderboards
              </Link>
              <Link
                href="/search"
                className="px-3 py-1.5 rounded-lg bg-[#181B23] text-white font-semibold border border-white/10"
              >
                Discover
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Admin Hub
              </Link>
              <Link
                href="/onboarding"
                className="px-3 py-1.5 rounded-lg text-[#8D94A5] hover:text-white hover:bg-white/5 transition-colors"
              >
                Preferences
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#181B23] border border-amber-500/30 flex items-center justify-center text-xs font-semibold text-[#F59E0B]">
              AS
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title & Philosophy Banner */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] text-xs font-mono mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Audited Peer Discovery</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-[#F5F6F8]">
                Class Developer &amp; Skill Directory
              </h1>
              <p className="text-sm text-[#8D94A5] mt-1">
                Explore peer capabilities grounded in verified telemetry and tamper-resistant evidence classifications.
              </p>
            </div>

            {/* Evidence Legend Pill */}
            <div className="flex flex-wrap items-center gap-2 text-xs bg-[#111319] border border-white/[0.08] p-2.5 rounded-xl">
              <span className="text-[#8D94A5] font-mono text-[11px] mr-1">Evidence Standard:</span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>EXPLICIT</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-[#F59E0B] border border-amber-500/20 font-mono text-[10px]">
                <ShieldCheck className="w-3 h-3" />
                <span>SUPPORTED</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md bg-[#181B23] text-[#8D94A5] border border-white/10 font-mono text-[10px]">
                <AlertCircle className="w-3 h-3" />
                <span>SELF-DECLARED</span>
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#111319] border border-white/[0.08] rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Input Field */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#636A7E]" />
              <input
                id="developer-search-input"
                name="developer-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, GitHub handle, or technology (e.g. Next.js, Go)..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#090A0E] border border-white/[0.08] rounded-xl text-sm text-[#F5F6F8] placeholder-[#636A7E] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8D94A5] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Evidence Level Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-[#8D94A5] hidden sm:block" />
              <select
                id="evidence-filter"
                name="evidence-filter"
                value={evidenceFilter}
                onChange={(e) => setEvidenceFilter(e.target.value as any)}
                aria-label="Filter by Evidence Standard"
                className="bg-[#090A0E] border border-white/[0.08] text-[#C8CDD6] text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#F59E0B]"
              >
                <option value="ALL">All Evidence Standards</option>
                <option value="EXPLICIT_SOURCE">Explicit Source Only</option>
                <option value="SUPPORTED_INFERENCE">Supported Inference</option>
                <option value="SELF_DECLARED">Self-Declared</option>
              </select>
            </div>
          </div>

          {/* Popular Tag Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-xs text-[#8D94A5] font-mono flex items-center space-x-1 mr-1">
              <Tag className="w-3 h-3" />
              <span>Filter by Tag:</span>
            </span>
            {selectedTag && (
              <button
                onClick={() => setSelectedTag(null)}
                className="px-2.5 py-1 rounded-lg bg-[#F59E0B] text-[#090A0E] font-bold text-xs font-mono flex items-center space-x-1"
              >
                <span>✕ {selectedTag}</span>
              </button>
            )}
            {POPULAR_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200 ${
                  selectedTag === tag
                    ? "bg-[#F59E0B] text-[#090A0E] font-bold border border-[#F59E0B]"
                    : "bg-[#181B23] text-[#8D94A5] hover:text-white border border-white/[0.06] hover:border-white/20"
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Empty State */}
        <div className="flex items-center justify-between text-xs text-[#8D94A5] px-1">
          <span>
            Found <strong className="text-white">{filteredDevelopers.length}</strong> matching developer{filteredDevelopers.length === 1 ? "" : "s"}
          </span>
          <span className="font-mono text-[11px] text-[#636A7E]">
            Rule §10.3: Telemetry evidence verified
          </span>
        </div>

        {/* Developer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {filteredDevelopers.map((dev) => (
              <motion.div
                key={dev.id}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="bg-[#111319] border border-white/[0.08] rounded-2xl p-5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-[#181B23] border border-white/10 flex items-center justify-center font-bold text-sm text-[#F59E0B]">
                        {dev.avatarInitials}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#F5F6F8] group-hover:text-white transition-colors flex items-center space-x-1.5">
                          <span>{dev.name}</span>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </h3>
                        <p className="text-xs text-[#8D94A5] font-mono">
                          @{dev.githubHandle} • {dev.classBatch}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Focus & Rhythm */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-[#C8CDD6]">
                      {dev.roleInterest}
                    </p>
                    <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-[#181B23] border border-white/[0.06] text-[11px] font-mono text-[#F59E0B]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                      <span>{dev.activeRhythm}</span>
                    </div>
                  </div>

                  {/* Tags & Evidence Badges */}
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] font-mono text-[#636A7E] uppercase tracking-wider block">
                      Verified Capabilities:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dev.tags.map((tag) => {
                        const isExplicit = tag.evidence === "EXPLICIT_SOURCE";
                        const isSupported = tag.evidence === "SUPPORTED_INFERENCE";
                        return (
                          <div
                            key={tag.id}
                            title={`${tag.name}: ${tag.sourceDetail} (${tag.evidence})`}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-mono border flex items-center space-x-1 cursor-help transition-colors ${
                              isExplicit
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40"
                                : isSupported
                                ? "bg-amber-500/10 text-[#F59E0B] border-amber-500/20 hover:border-amber-500/40"
                                : "bg-[#181B23] text-[#8D94A5] border-white/10 hover:border-white/20"
                            }`}
                          >
                            <span>#{tag.name}</span>
                            {isExplicit ? (
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            ) : isSupported ? (
                              <ShieldCheck className="w-2.5 h-2.5 text-[#F59E0B]" />
                            ) : (
                              <AlertCircle className="w-2.5 h-2.5 text-amber-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Telemetry Stats */}
                <div className="mt-5 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-[#8D94A5]">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-[#C8CDD6]" title="GitHub Verified Repos">
                      <Github className="w-3.5 h-3.5 text-[#8D94A5]" />
                      <span>{dev.platforms.github.repos} repos</span>
                    </span>
                    <span className="flex items-center space-x-1 text-[#C8CDD6]" title="LeetCode Solved Problems">
                      <Code2 className="w-3.5 h-3.5 text-[#FFA116]" />
                      <span>{dev.platforms.leetcode.solved}</span>
                    </span>
                  </div>

                  <Link
                    href={`/dashboard?user=${dev.githubHandle}`}
                    className="inline-flex items-center space-x-1 text-[#F59E0B] hover:underline text-xs font-sans font-medium"
                  >
                    <span>View Telemetry</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty state fallback */}
        {filteredDevelopers.length === 0 && (
          <div className="text-center py-16 bg-[#111319] border border-dashed border-white/10 rounded-2xl">
            <Search className="w-8 h-8 text-[#636A7E] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#F5F6F8]">No developers match your query</h3>
            <p className="text-xs text-[#8D94A5] max-w-sm mx-auto mt-1">
              Try clearing tags or searching for broader terms like TypeScript, Python, or Go.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag(null);
                setEvidenceFilter("ALL");
              }}
              className="mt-4 px-4 py-1.5 rounded-lg bg-[#181B23] border border-white/10 text-xs text-white hover:bg-white/10 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-[#090A0E] px-6 py-4 text-xs text-[#636A7E]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TWM 3.0 Platform • Peer Discovery &amp; Skill Verification</span>
          <span className="font-mono text-[11px]">Rule §10.3: Grounded in Verified Artifacts</span>
        </div>
      </footer>
    </div>
  );
}
