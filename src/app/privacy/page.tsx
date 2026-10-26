"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield,
  Lock,
  Eye,
  FileCheck2,
  Database,
  UserX,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Download,
  ExternalLink,
  Code2,
  Github,
  Award,
  Scale,
  Users
} from "lucide-react";
import { AppHeader } from "@/components/ui/AppHeader";
import { Footer } from "@/components/landing/Footer";

const POLICY_SECTIONS = [
  {
    id: "principles",
    title: "1. Core Philosophy & Non-Surveillance Commitment",
    icon: Shield,
    summary: "TWM is an educational cohort telemetry and peer momentum platform — not an academic judge, assignment portal, or surveillance tool."
  },
  {
    id: "data-collection",
    title: "2. What Telemetry We Collect (And What We Strictly Exclude)",
    icon: Code2,
    summary: "Public commit timestamps, active day counts, problem difficulty milestones, and verified badge proofs only. Zero private code inspection."
  },
  {
    id: "zero-fabrication",
    title: "3. The Zero-Fabrication & Non-Punitive Invariant",
    icon: CheckCircle2,
    summary: "Rule §1.2 & §5.7: Missing, delayed, or disconnected data is labelled UNAVAILABLE or Pending — never 0, and never proof of inactivity."
  },
  {
    id: "identity-visibility",
    title: "4. Student Identity Tiers & Granular Visibility",
    icon: Eye,
    summary: "Rule §18.1: Full control over your leaderboard display name: Full Legal Name, Verified Handle Only, or Anonymous Candidate (#42)."
  },
  {
    id: "authentication",
    title: "5. Cryptographic Bio Verification & Zero Passwords",
    icon: Lock,
    summary: "Rule §6.2: Single sign-on via college email. Third-party accounts verified using single-use HMAC nonces. Zero passwords collected or stored."
  },
  {
    id: "disputes",
    title: "6. Two-Person Audit Integrity & Dispute Rights",
    icon: Scale,
    summary: "Rule §10.1: Any student can file an audited score dispute with public evidence. Dual-admin sign-off prevents arbitrary teacher adjustments."
  },
  {
    id: "retention-export",
    title: "7. Data Portability, Erasure & The Right to Disconnect",
    icon: Database,
    summary: "Rule §18.4: Export your entire telemetry history in JSON/CSV at any time. Instant 1-click adapter disconnection."
  },
  {
    id: "governance",
    title: "8. Institutional Scope & Zero Commercial Sharing",
    icon: Users,
    summary: "Data is class-scoped, hosted in native SQLite WAL mode, and strictly never sold, rented, or shared with commercial recruitment brokers."
  }
];

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState("principles");

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col font-sans selection:bg-accent selection:text-canvas">
      <AppHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-mono text-muted hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Platform Overview</span>
          </Link>

          <span className="text-xs font-mono text-muted-soft">
            Policy Version 3.1 • Last Revised October 2026
          </span>
        </div>

        {/* Hero Header */}
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-mono font-bold tracking-wider uppercase">
            <Shield className="w-3.5 h-3.5" />
            <span>Institutional Governance • Fairness Rules §1.2, §18 &amp; §19</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Privacy, Fairness &amp; Student Data Governance Policy
          </h1>

          <p className="text-base sm:text-lg text-muted leading-relaxed">
            TWM (&quot;Track. Win. Maintain.&quot;) is designed around a single non-negotiable principle: <strong>friendly competition should inspire practice, never inflict surveillance or punitive anxiety</strong>. This document specifies our cryptographic guarantees, telemetry boundaries, and student privacy rights.
          </p>
        </div>

        {/* 4 Core Guarantees Callout Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-surface border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-accent flex items-center justify-center font-bold text-xs font-mono">
              01
            </div>
            <h4 className="font-bold text-white text-sm">Zero Code Reading</h4>
            <p className="text-xs text-muted leading-relaxed">
              We never clone, inspect, or store private code, file contents, or proprietary repository diffs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-accent flex items-center justify-center font-bold text-xs font-mono">
              02
            </div>
            <h4 className="font-bold text-white text-sm">Non-Punitive Missing Data</h4>
            <p className="text-xs text-muted leading-relaxed">
              Network delays, API rate limits, or missing observations are never treated as &quot;0&quot; or proof of inactivity.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-accent flex items-center justify-center font-bold text-xs font-mono">
              03
            </div>
            <h4 className="font-bold text-white text-sm">Pseudonymous Identity</h4>
            <p className="text-xs text-muted leading-relaxed">
              Switch anytime to &quot;Handle Only&quot; or &quot;Anonymous Candidate #42&quot; on class leaderboards.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-white/[0.08] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-accent flex items-center justify-center font-bold text-xs font-mono">
              04
            </div>
            <h4 className="font-bold text-white text-sm">1-Click Full Portability</h4>
            <p className="text-xs text-muted leading-relaxed">
              Download your complete telemetry history in JSON/CSV and disconnect adapters whenever you want.
            </p>
          </div>
        </div>

        {/* Policy Body Layout with Sticky Index */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Table of Contents */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-3">
            <span className="text-xs font-mono text-muted uppercase tracking-wider font-bold block px-2">
              Policy Sections
            </span>
            <nav className="space-y-1">
              {POLICY_SECTIONS.map((sec) => (
                <a
                  key={sec.id}
                  href={`#${sec.id}`}
                  onClick={() => setActiveSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center space-x-3 block ${
                    activeSection === sec.id
                      ? "bg-accent/15 text-accent border border-accent/30 font-bold"
                      : "text-muted hover:text-white hover:bg-surface border border-transparent"
                  }`}
                >
                  <sec.icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{sec.title}</span>
                </a>
              ))}
            </nav>

            <div className="p-5 rounded-2xl bg-surface border border-white/[0.06] space-y-3 text-xs text-muted mt-6">
              <span className="font-mono text-white font-bold block uppercase text-xs">
                Your Privacy Controls
              </span>
              <p>
                Configure your identity tier, notification channels, or export your full history directly from your account settings.
              </p>
              <Link
                href="/settings"
                className="inline-flex items-center space-x-1.5 text-accent hover:text-white font-mono font-bold pt-1"
              >
                <span>Open Privacy Settings</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </aside>

          {/* Right Policy Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Section 1 */}
            <section id="principles" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <Shield className="w-4 h-4" />
                <span>Section 1</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                1. Core Philosophy &amp; Non-Surveillance Commitment
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  TWM exists to help engineering students build consistent development habits, celebrate weekly breakthroughs, and understand their own rhythms across public developer ecosystems.
                </p>
                <p>
                  TWM is <strong>not</strong> an academic surveillance system, exam proctor, keystroke logger, or punitive grading instrument. The platform is intentionally segregated from official gradebooks and cannot be used by academic institutions to inflict penalties, demerits, or compulsory tracking.
                </p>
                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-muted flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>
                    Rule §1.2 Invariant: Participation in competitive class leaderboards is entirely opt-in. Opting out never limits access to course materials, assignments, or cohort resources.
                  </span>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="data-collection" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <Code2 className="w-4 h-4" />
                <span>Section 2</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                2. What Telemetry We Collect (And What We Strictly Exclude)
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  We operate with strict telemetry minimization. TWM only connects to authorized public API endpoints to retrieve verifiable public statistics:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-1.5">
                    <div className="flex items-center space-x-2 text-white font-bold text-sm">
                      <Github className="w-4 h-4 text-provider-github" />
                      <span>GitHub Telemetry</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      We collect public commit timestamps within tracked repositories to calculate active development days in UTC. Commit author emails are checked strictly to prevent username impersonation (§9.1). We <strong>never</strong> inspect commit diffs, clone source trees, or read repository contents.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-1.5">
                    <div className="flex items-center space-x-2 text-white font-bold text-sm">
                      <Code2 className="w-4 h-4 text-provider-leetcode-brand" />
                      <span>LeetCode Telemetry</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      We collect public profile problem completion aggregates (Easy, Medium, Hard breakdown) and timestamped Sunday baselines to calculate honest weekly delta progression (§9.7). Private submissions or code solution text are never scraped.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-1.5">
                    <div className="flex items-center space-x-2 text-white font-bold text-sm">
                      <Award className="w-4 h-4 text-provider-hackerrank" />
                      <span>HackerRank Evidence</span>
                    </div>
                    <p className="text-xs text-muted leading-relaxed">
                      Because HackerRank lacks public event timestamps, badge evidence is classified as display-only and strictly excluded from weekly competition point deltas under Section 5.6. Evidence is anchored using an immutable SHA-256 digest (`hr-proof-...`).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="zero-fabrication" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Section 3</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                3. The Zero-Fabrication &amp; Non-Punitive Invariant
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  Under <strong>Rule §1.2 &amp; §5.7</strong> of the TWM Master Specification, the platform enforces an absolute zero-fabrication invariant across all user-facing interfaces:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
                  <li>
                    <strong>Missing data is never zero:</strong> If a third-party platform experiences downtime, rate limiting, or webhook drops, the observation is labelled <code className="text-accent bg-accent/10 px-1 py-0.5 rounded">UNAVAILABLE</code> or <code className="text-accent bg-accent/10 px-1 py-0.5 rounded">Pending</code>. It is never displayed as zero.
                  </li>
                  <li>
                    <strong>Never fabricate success:</strong> Simulated delays or artificial &quot;all systems operational&quot; indicators are strictly prohibited.
                  </li>
                  <li>
                    <strong>Demo data transparency:</strong> Any mock or illustrative views are prominently badged with <code className="text-accent bg-accent/10 px-1 py-0.5 rounded">Demo data</code>.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section id="identity-visibility" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <Eye className="w-4 h-4" />
                <span>Section 4</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                4. Student Identity Tiers &amp; Granular Visibility
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  Every student possesses complete sovereignty over how their activity is displayed to peers. Under <strong>Rule §18.1</strong>, you can configure your presentation tier at any time in <Link href="/settings" className="text-accent hover:underline">Settings</Link>:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-1">
                    <span className="text-xs font-mono font-bold text-white block">Tier 1: Full Name</span>
                    <p className="text-xs text-muted">
                      Displays your official enrolled name and roll number alongside verified scores.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-1">
                    <span className="text-xs font-mono font-bold text-white block">Tier 2: Handle Only</span>
                    <p className="text-xs text-muted">
                      Masks legal name; renders only your verified GitHub username (e.g. @octocat).
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-1">
                    <span className="text-xs font-mono font-bold text-white block">Tier 3: Anonymous</span>
                    <p className="text-xs text-muted">
                      Displays as &quot;Candidate #42&quot; with private scores visible solely to you.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section id="authentication" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <Lock className="w-4 h-4" />
                <span>Section 5</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                5. Cryptographic Bio Verification &amp; Zero Passwords
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  To eliminate password breach risks, TWM does not store or process student passwords. Authentication is handled via:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-muted">
                  <li>
                    <strong>Single Sign-On:</strong> GitHub OAuth v2 matched against the student&apos;s verified college domain email address.
                  </li>
                  <li>
                    <strong>HMAC Bio Proof (§6.2):</strong> To verify external accounts (such as LeetCode), TWM generates a cryptographic bio token containing a single-use nonce (`twm-bio-...`). After verification, the nonce is burned in SQLite to prevent replay attacks.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section id="disputes" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <Scale className="w-4 h-4" />
                <span>Section 6</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                6. Two-Person Audit Integrity &amp; Dispute Rights
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  Under <strong>Rule §10.1</strong>, competition fairness is governed by an immutable SQLite dispute ledger. Any student can file a dispute if an observation was impacted by sync latency, timezone boundary offsets, or secondary branch commits:
                </p>
                <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-2">
                  <span className="text-xs font-mono font-bold text-white block">
                    Two-Person Approval Requirement:
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    Disputes require explicit approval with justification from an elected student representative and the faculty co-admin. No single administrator can unilaterally mutate scores or alter leaderboard standings.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="retention-export" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <Database className="w-4 h-4" />
                <span>Section 7</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                7. Data Portability, Erasure &amp; The Right to Disconnect
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  You own your developer momentum. In compliance with modern data protection regulations (including the Digital Personal Data Protection Act and GDPR principles):
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.08] space-y-2">
                    <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                      <Download className="w-4 h-4 text-accent" />
                      <span>Instant Data Export</span>
                    </span>
                    <p className="text-xs text-muted">
                      Download your raw observations, weekly ranks, and audit snapshots anytime in CSV or structured JSON formats from <Link href="/settings" className="text-accent hover:underline">Settings</Link>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.08] space-y-2">
                    <span className="text-xs font-mono font-bold text-white flex items-center space-x-1.5">
                      <UserX className="w-4 h-4 text-rose-400" />
                      <span>Complete Account Purge</span>
                    </span>
                    <p className="text-xs text-muted">
                      Request permanent deletion of your account and telemetry records. Once confirmed by co-admin signature, records are expunged from the SQLite store.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 8 */}
            <section id="governance" className="space-y-4 scroll-mt-28">
              <div className="flex items-center space-x-3 text-accent font-mono text-xs uppercase tracking-wider font-bold">
                <Users className="w-4 h-4" />
                <span>Section 8</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                8. Institutional Scope &amp; Zero Commercial Sharing
              </h2>
              <div className="text-ink-secondary text-sm sm:text-base leading-relaxed space-y-3">
                <p>
                  All telemetry collected by TWM remains strictly scoped to your authorized class cohort. <strong>We do not sell, rent, monetize, or disclose student data to third-party recruitment agencies, advertisers, or commercial data brokers.</strong>
                </p>
                <p>
                  Data is stored in native `node:sqlite` WAL mode with strict access controls. No unnecessary cloud microservices or third-party tracking pixels run on our platform.
                </p>
              </div>
            </section>

            {/* Contact / Inquiries Box */}
            <div className="p-6 rounded-2xl bg-surface border border-white/10 space-y-3">
              <h3 className="text-base font-bold text-white">Questions or Governance Inquiries?</h3>
              <p className="text-xs sm:text-sm text-muted leading-relaxed">
                If you have questions regarding telemetry attribution, boundary timezones, or data rights under TWM Master Plan v3.1, contact your course faculty co-admin or file an audited request via the <Link href="/admin" className="text-accent hover:underline">Admin Hub</Link>.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
