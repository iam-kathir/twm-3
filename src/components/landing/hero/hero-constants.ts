import React from "react";
import {
  GitCommit,
  ShieldCheck,
  Code2,
  GitBranch,
  CheckCircle2,
  Radio,
  BarChart3,
  Trophy,
  TrendingUp,
  Target,
  CalendarCheck,
  Flame,
  LucideIcon
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
  initialAngle: number; // degrees (0 to 360)
  colorClass: string;
  glowColor: string;
}

// Layer 2: Activity & Verification Orbit (Counter-Clockwise, ~30s)
export const ACTIVITY_VERIFICATION_NODES: OrbitalNodeItem[] = [
  {
    id: "act-commit",
    name: "Git Commit",
    label: "Commit Observation",
    icon: GitCommit,
    initialAngle: 0,
    colorClass: "text-brand-highlight",
    glowColor: "rgba(22, 200, 232, 0.4)",
  },
  {
    id: "act-pulse",
    name: "Telemetry Pulse",
    label: "Telemetry Stream",
    icon: Radio,
    initialAngle: 60,
    colorClass: "text-brand-secondary",
    glowColor: "rgba(52, 120, 246, 0.4)",
  },
  {
    id: "act-shield",
    name: "Verified Shield",
    label: "HMAC Bio Gate",
    icon: ShieldCheck,
    initialAngle: 120,
    colorClass: "text-status-verified",
    glowColor: "rgba(16, 185, 129, 0.4)",
  },
  {
    id: "act-code",
    name: "Code Syntax",
    label: "Algorithmic Solves",
    icon: Code2,
    initialAngle: 180,
    colorClass: "text-brand-primary",
    glowColor: "rgba(101, 85, 245, 0.4)",
  },
  {
    id: "act-branch",
    name: "Repository Branch",
    label: "Active Branch Ingestion",
    icon: GitBranch,
    initialAngle: 240,
    colorClass: "text-brand-highlight",
    glowColor: "rgba(22, 200, 232, 0.4)",
  },
  {
    id: "act-audit",
    name: "Observation Audit",
    label: "Two-Person Audit Gate",
    icon: CheckCircle2,
    initialAngle: 300,
    colorClass: "text-brand-secondary",
    glowColor: "rgba(52, 120, 246, 0.4)",
  },
];

// Layer 3: Analytics & Achievement Orbit (Clockwise, ~38s)
export const ANALYTICS_ACHIEVEMENT_NODES: OrbitalNodeItem[] = [
  {
    id: "ana-barchart",
    name: "Multi-Platform Analytics",
    label: "Weekly Velocity",
    icon: BarChart3,
    initialAngle: 30,
    colorClass: "text-brand-secondary",
    glowColor: "rgba(52, 120, 246, 0.35)",
  },
  {
    id: "ana-trophy",
    name: "Deterministic Standings",
    label: "1, 2, 2, 4 Tie Policy",
    icon: Trophy,
    initialAngle: 90,
    colorClass: "text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.35)",
  },
  {
    id: "ana-trending",
    name: "Developer Momentum",
    label: "Consistent Coding",
    icon: TrendingUp,
    initialAngle: 150,
    colorClass: "text-status-verified",
    glowColor: "rgba(16, 185, 129, 0.35)",
  },
  {
    id: "ana-target",
    name: "Sunday Boundary Target",
    label: "23:59:59 IST Close",
    icon: Target,
    initialAngle: 210,
    colorClass: "text-brand-primary",
    glowColor: "rgba(101, 85, 245, 0.35)",
  },
  {
    id: "ana-calendar",
    name: "Cohort Calendar",
    label: "7-Day Active Days",
    icon: CalendarCheck,
    initialAngle: 270,
    colorClass: "text-brand-highlight",
    glowColor: "rgba(22, 200, 232, 0.35)",
  },
  {
    id: "ana-streak",
    name: "Active Streak",
    label: "Momentum Maintenance",
    icon: Flame,
    initialAngle: 330,
    colorClass: "text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.35)",
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
    iconColor: "text-status-verified",
    positionClasses: "top-2 -left-2 sm:top-6 sm:-left-6",
  },
  {
    id: "card-baseline",
    title: "Sunday Baseline Delta",
    metric: "+14 Solved",
    subtext: "Illustrative preview",
    icon: TrendingUp,
    iconColor: "text-brand-secondary",
    positionClasses: "bottom-4 -right-2 sm:bottom-8 sm:-right-4",
  },
  {
    id: "card-audit",
    title: "Cryptographic Audit",
    metric: "SHA-256 Verified",
    subtext: "Illustrative preview",
    icon: ShieldCheck,
    iconColor: "text-brand-highlight",
    positionClasses: "-bottom-6 left-6 sm:-bottom-4 sm:left-12",
  },
];
