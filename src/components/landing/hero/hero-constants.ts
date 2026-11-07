import type { LucideIcon } from "lucide-react";
import {
  GitCommit,
  ShieldCheck,
  Code2,
  CheckCircle2,
  BarChart3,
  Trophy,
  Flame,
  Users,
  Target,
} from "lucide-react";

export type ProviderId = "github" | "leetcode" | "hackerrank";

export interface ProviderMeta {
  id: ProviderId;
  name: string;
  tagline: string;
  badgeLabel: string;
  colorHex: string;
  telemetryType: string;
  verificationProof: string;
  description: string;
  rhythm: string;
}

export const PROVIDERS_META: Record<ProviderId, ProviderMeta> = {
  github: {
    id: "github",
    name: "GitHub",
    tagline: "Repository Activity & Active Days",
    badgeLabel: "7-Day UTC Rhythm",
    colorHex: "#FFFFFF",
    telemetryType: "Active Commit Rhythm",
    verificationProof: "PGP Signature & Bio HMAC Challenge",
    description: "Tracks public commit frequencies and repository contribution days across branches within a rolling 7-day UTC observation window.",
    rhythm: "Daily Commit Ingestion",
  },
  leetcode: {
    id: "leetcode",
    name: "LeetCode",
    tagline: "Problem-Solving & Category Velocity",
    badgeLabel: "Sunday Baseline Delta",
    colorHex: "#FFA116",
    telemetryType: "Algorithmic Progression",
    verificationProof: "Sunday 23:59:59 IST Historical Baseline Snapshot (§16.3)",
    description: "Evaluates problem milestones by computing solved deltas across Easy, Medium, and Hard categories strictly against verified prior Sunday baselines.",
    rhythm: "Weekly Delta Comparison",
  },
  hackerrank: {
    id: "hackerrank",
    name: "HackerRank",
    tagline: "Verified Domain Badges & Achievements",
    badgeLabel: "Display-Only Audit Proof",
    colorHex: "#2EC866",
    telemetryType: "Domain Stars & Certifications",
    verificationProof: "Immutable SHA-256 Digest (hr-proof-*)",
    description: "Validates public skill domain stars and certifications. Public telemetry lacks event timestamps, so badge achievements are display-only and excluded from weekly delta competitions (§5.6).",
    rhythm: "Periodic Achievement Pull",
  },
};

export interface OrbitalNodeItem {
  id: string;
  name: string;
  label: string;
  icon: LucideIcon;
  angle: number; // degrees (0 to 360)
  colorClass: string;
  glowColor: string;
}

/**
 * Layer 2: Activity & Verification Orbit (Counter-Clockwise, ~34s)
 * 4 curated, meaningful telemetry streams evenly spaced at 90° intervals
 */
export const ACTIVITY_VERIFICATION_NODES: OrbitalNodeItem[] = [
  {
    id: "act-commit",
    name: "Git Rhythm",
    label: "7-Day Commit Rhythm",
    icon: GitCommit,
    angle: 0,
    colorClass: "text-brand-highlight",
    glowColor: "rgba(22, 200, 232, 0.45)",
  },
  {
    id: "act-solve",
    name: "Problem Velocity",
    label: "Algorithmic Solves",
    icon: Code2,
    angle: 90,
    colorClass: "text-[#FFA116]",
    glowColor: "rgba(255, 161, 22, 0.45)",
  },
  {
    id: "act-domain",
    name: "Domain Badges",
    label: "Verified Skill Stars",
    icon: CheckCircle2,
    angle: 180,
    colorClass: "text-[#2EC866]",
    glowColor: "rgba(46, 200, 102, 0.45)",
  },
  {
    id: "act-audit",
    name: "HMAC Proof",
    label: "Two-Person Verification",
    icon: ShieldCheck,
    angle: 270,
    colorClass: "text-brand-primary",
    glowColor: "rgba(101, 85, 245, 0.45)",
  },
];

/**
 * Layer 3: Analytics & Achievement Orbit (Clockwise, ~44s)
 * 4 curated pillars of competition and governance evenly spaced at 90° intervals (offset 45°)
 */
export const ANALYTICS_ACHIEVEMENT_NODES: OrbitalNodeItem[] = [
  {
    id: "ana-standings",
    name: "Standings",
    label: "1, 2, 2, 4 Tie Policy",
    icon: Trophy,
    angle: 45,
    colorClass: "text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.4)",
  },
  {
    id: "ana-boundary",
    name: "Sunday Boundary",
    label: "23:59:59 IST Close",
    icon: Target,
    angle: 135,
    colorClass: "text-brand-secondary",
    glowColor: "rgba(52, 120, 246, 0.4)",
  },
  {
    id: "ana-quorum",
    name: "Cohort Quorum",
    label: "≥ 70% Class Demarcation",
    icon: Users,
    angle: 225,
    colorClass: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "ana-momentum",
    name: "Active Momentum",
    label: "Consistency Trajectory",
    icon: Flame,
    angle: 315,
    colorClass: "text-brand-highlight",
    glowColor: "rgba(22, 200, 232, 0.4)",
  },
];

export interface FloatingMicroCard {
  id: string;
  title: string;
  metric: string;
  subtext: string;
  icon: LucideIcon;
  iconColor: string;
  positionClasses: string;
}

export const FLOATING_MICRO_CARDS: FloatingMicroCard[] = [
  {
    id: "card-consistency",
    title: "Coding Consistency",
    metric: "7 / 7 Active Days",
    subtext: "Illustrative preview",
    icon: CheckCircle2,
    iconColor: "text-emerald-400",
    positionClasses: "-top-2 -left-4 sm:-top-3 sm:-left-6 lg:-top-5 lg:-left-8",
  },
  {
    id: "card-baseline",
    title: "Sunday Baseline Delta",
    metric: "+14 Solved",
    subtext: "Illustrative preview",
    icon: BarChart3,
    iconColor: "text-brand-secondary",
    positionClasses: "-bottom-2 -right-4 sm:-bottom-3 sm:-right-6 lg:-bottom-5 lg:-right-8",
  },
  {
    id: "card-audit",
    title: "Cryptographic Audit",
    metric: "Section 9.6 Verified",
    subtext: "Illustrative preview",
    icon: ShieldCheck,
    iconColor: "text-brand-highlight",
    positionClasses: "-bottom-2 -left-4 sm:-bottom-3 sm:-left-6 lg:-bottom-5 lg:-left-8",
  },
];

export interface OrbitalRadii {
  innerRadius: number;
  middleRadius: number;
  outerRadius: number;
  containerSize: number;
}

/**
 * Mathematically calculates responsive orbital radii based on container width.
 * Ensures all nodes remain safely inside the container across viewports from 320px to 1920px.
 */
export function calculateResponsiveOrbitalRadii(containerWidth: number): OrbitalRadii {
  const clampedWidth = Math.max(
    260,
    Math.min(Number.isFinite(containerWidth) ? containerWidth : 540, 580)
  );

  // Clearance margins for outer node badges
  const outerNodeAllowance = clampedWidth < 380 ? 22 : clampedWidth < 500 ? 26 : 30;

  const outerRadius = Math.max(105, Math.floor(clampedWidth / 2 - outerNodeAllowance));
  const middleRadius = Math.round(outerRadius * 0.75);
  const innerRadius = Math.max(65, Math.round(outerRadius * 0.50));

  return {
    innerRadius,
    middleRadius,
    outerRadius,
    containerSize: clampedWidth,
  };
}
