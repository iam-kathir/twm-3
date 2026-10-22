export type UserRole = "student" | "co-admin";

export type LeaderboardVisibility = "public" | "handle_only" | "anonymous";
export type RecapPreference = "ai" | "deterministic";

export interface UserProfile {
  name: string;
  handle: string;
  rollNo: string;
  classSection: string;
  email: string;
  avatar: string;
  role: UserRole;
  activeTrack: "Systems & Cloud" | "Fullstack & Product" | "Algorithms & Theory";
  github: {
    connected: boolean;
    username: string;
    reposTracked: number;
    activeDaysWeek: number;
    lastCommitTime: string;
  };
  leetcode: {
    connected: boolean;
    username: string;
    hmacVerified: boolean;
    totalSolved: number;
    weeklyDelta: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
  };
  hackerrank: {
    connected: boolean;
    username: string;
    pythonStars: number;
    problemSolvingStars: number;
  };
  settings: {
    leaderboardVisibility: LeaderboardVisibility;
    recapPreference: RecapPreference;
    publicDiscovery: boolean;
    autoSyncInterval: number; // in hours
    notifyOnDispute: boolean;
    notifyOnWeeklyRecap: boolean;
  };
}

export type DisputeStatus = "pending" | "approved" | "rejected";

export interface TelemetryDispute {
  id: string;
  studentName: string;
  rollNo: string;
  handle: string;
  metric: "github_active_days" | "leetcode_delta" | "hackerrank_badge";
  platform: "GitHub" | "LeetCode" | "HackerRank";
  claim: string;
  evidenceUrl: string;
  ruleReference: string;
  status: DisputeStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  resolutionNote?: string;
}

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastNotification {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
  timestamp: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface LeaderboardStudent {
  rank: number;
  name: string;
  handle: string;
  rollNo: string;
  section: string;
  activeDays: number;
  coverage: number;
  delta: number;
  lastFreshness: string;
  auditStatus: "Finalized" | "Audited" | "Provisional";
  isCurrentUser: boolean;
  avatarInitial: string;
  evidenceTags: string[];
}
