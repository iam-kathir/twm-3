/**
 * TWM 3.1 — LeetCode GraphQL Historical Baseline Tracking Engine
 * Reference: Plan §9.1, §9.7, §16.3
 *
 * Invariant: Cumulative metrics (such as LeetCode problem counts) cannot be
 * turned into a weekly delta from a single point-in-time observation.
 * Weekly deltas require comparing the latest pre-boundary observation against
 * a verified prior Sunday 23:59:59 IST baseline snapshot.
 * Missing prior baselines are honestly flagged as NO_PRIOR_SUNDAY_BASELINE.
 */

import { getDb } from "./db.ts";

export interface LeetCodeMetricsBreakdown {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface BaselineComparisonResult {
  hasBaseline: boolean;
  status: "BASELINE_DELTA_COMPUTED" | "NO_PRIOR_SUNDAY_BASELINE" | "STUDENT_NOT_ENROLLED";
  baselineSnapshot: {
    observedAt: string;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
    boundaryIso: string;
  } | null;
  currentSnapshot: {
    observedAt: string;
    totalSolved: number;
    easySolved: number;
    mediumSolved: number;
    hardSolved: number;
  } | null;
  weeklyDelta: {
    total: number;
    easy: number;
    medium: number;
    hard: number;
  } | null;
  notice: string;
}

/**
 * Calculates the exact prior Sunday 23:59:59 IST (UTC+05:30 -> 18:29:59 UTC)
 * timestamp relative to a given reference date.
 */
export function getPreviousSundayBoundaryIST(referenceDate: Date = new Date()): Date {
  // Convert referenceDate to IST (+5.5h)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTimeMs = referenceDate.getTime() + istOffsetMs;
  const istDate = new Date(istTimeMs);

  const dayOfWeek = istDate.getUTCDay(); // 0 is Sunday
  let daysToSubtract = dayOfWeek === 0 ? 7 : dayOfWeek;

  // Compute prior Sunday in IST calendar
  const priorSundayDate = new Date(istTimeMs - daysToSubtract * 24 * 60 * 60 * 1000);
  
  // Set to 23:59:59.999 in IST (which is 18:29:59.999 UTC)
  const y = priorSundayDate.getUTCFullYear();
  const m = priorSundayDate.getUTCMonth();
  const d = priorSundayDate.getUTCDate();

  // Create UTC date corresponding to 23:59:59.999 IST (subtract 5.5 hours)
  const boundaryUtcMs = Date.UTC(y, m, d, 23, 59, 59, 999) - istOffsetMs;
  return new Date(boundaryUtcMs);
}

/**
 * Calculates the upcoming or current Sunday 23:59:59.999 IST closing boundary
 * relative to a given reference date.
 */
export function getCurrentSundayClosingBoundaryIST(referenceDate: Date = new Date()): Date {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istTimeMs = referenceDate.getTime() + istOffsetMs;
  const istDate = new Date(istTimeMs);

  const dayOfWeek = istDate.getUTCDay(); // 0 is Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

  const closingSundayDate = new Date(istTimeMs + daysUntilSunday * 24 * 60 * 60 * 1000);
  const y = closingSundayDate.getUTCFullYear();
  const m = closingSundayDate.getUTCMonth();
  const d = closingSundayDate.getUTCDate();

  const boundaryUtcMs = Date.UTC(y, m, d, 23, 59, 59, 999) - istOffsetMs;
  return new Date(boundaryUtcMs);
}

/**
 * Section 9.1 & §9.7 Observation Boundary Eligibility Evaluator
 * Validates whether an observation timestamp is eligible, provisional, or excluded.
 */
export function evaluateObservationBoundaryEligibility(
  observedAt: Date | string,
  boundaryDate: Date | string = getCurrentSundayClosingBoundaryIST()
): {
  status: "Finalized" | "Provisional" | "Excluded";
  boundaryGapSeconds: number;
  isEligible: boolean;
  reason: string;
} {
  const observedMs = typeof observedAt === "string" ? new Date(observedAt).getTime() : observedAt.getTime();
  const boundaryMs = typeof boundaryDate === "string" ? new Date(boundaryDate).getTime() : boundaryDate.getTime();

  if (isNaN(observedMs)) {
    throw new Error("Invalid observedAt date passed to boundary evaluator.");
  }
  if (isNaN(boundaryMs)) {
    throw new Error("Invalid boundaryDate passed to boundary evaluator.");
  }

  // Hard Rule: Observations after Sunday 23:59:59 IST boundary are excluded for that week (§9.1)
  if (observedMs > boundaryMs) {
    const afterGapSeconds = Math.floor((observedMs - boundaryMs) / 1000);
    return {
      status: "Excluded",
      boundaryGapSeconds: afterGapSeconds,
      isEligible: false,
      reason: `Observed ${Math.round(afterGapSeconds / 60)}m after Sunday 23:59:59 IST boundary. Observations after boundary are excluded for that week (§9.1).`,
    };
  }

  // 3-Hour Freshness Window Rule (§9.7)
  const gapSeconds = Math.max(0, Math.floor((boundaryMs - observedMs) / 1000));
  const isWithin3Hours = gapSeconds <= 3 * 3600;

  if (isWithin3Hours) {
    return {
      status: "Finalized",
      boundaryGapSeconds: gapSeconds,
      isEligible: true,
      reason: `Observed ${Math.round(gapSeconds / 60)}m before boundary (within 3-hour freshness threshold, §9.7).`,
    };
  }

  return {
    status: "Provisional",
    boundaryGapSeconds: gapSeconds,
    isEligible: false,
    reason: `Observed ${Math.round(gapSeconds / 60)}m before boundary (exceeds 3-hour window). Marked Provisional (§9.7).`,
  };
}

/**
 * Computes LeetCode problem category deltas between consecutive Sunday baselines
 */
export function computeLeetCodeBaseline(
  studentIdentifier: string,
  currentMetrics?: LeetCodeMetricsBreakdown,
  referenceDate: Date = new Date()
): BaselineComparisonResult {
  const db = getDb();

  // Find student in roster by ID, roll_no, or handle_leetcode
  const student = db.prepare(`
    SELECT * FROM roster_members
    WHERE id = ? OR roll_no = ? OR lower(handle_leetcode) = lower(?)
    LIMIT 1
  `).get(studentIdentifier, studentIdentifier, studentIdentifier) as any;

  if (!student) {
    return {
      hasBaseline: false,
      status: "STUDENT_NOT_ENROLLED",
      baselineSnapshot: null,
      currentSnapshot: currentMetrics ? {
        observedAt: referenceDate.toISOString(),
        totalSolved: currentMetrics.total,
        easySolved: currentMetrics.easy,
        mediumSolved: currentMetrics.medium,
        hardSolved: currentMetrics.hard,
      } : null,
      weeklyDelta: null,
      notice: "Student is not enrolled in the class roster; cannot resolve historical baseline snapshots.",
    };
  }

  const priorSunday = getPreviousSundayBoundaryIST(referenceDate);
  const priorSundayIso = priorSunday.toISOString();

  // Query latest observation recorded at or before prior Sunday boundary
  const baselineRow = db.prepare(`
    SELECT * FROM telemetry_observations
    WHERE student_id = ? AND platform = 'leetcode' AND datetime(observed_at) <= datetime(?)
    ORDER BY observed_at DESC
    LIMIT 1
  `).get(student.id, priorSundayIso) as any;

  if (!baselineRow) {
    return {
      hasBaseline: false,
      status: "NO_PRIOR_SUNDAY_BASELINE",
      baselineSnapshot: null,
      currentSnapshot: currentMetrics ? {
        observedAt: referenceDate.toISOString(),
        totalSolved: currentMetrics.total,
        easySolved: currentMetrics.easy,
        mediumSolved: currentMetrics.medium,
        hardSolved: currentMetrics.hard,
      } : null,
      weeklyDelta: null,
      notice: "Plan §9.7 & §16.3: No prior Sunday 23:59:59 IST observation found in SQLite store. Current cumulative stats remain baseline for the next closeout.",
    };
  }

  // Parse baseline payload or fallback to metric_value
  let baselineTotal = Number(baselineRow.metric_value || 0);
  let baselineEasy = 0;
  let baselineMedium = 0;
  let baselineHard = 0;

  if (baselineRow.raw_payload) {
    try {
      const parsed = JSON.parse(baselineRow.raw_payload);
      baselineEasy = Number(parsed.easy ?? 0);
      baselineMedium = Number(parsed.medium ?? 0);
      baselineHard = Number(parsed.hard ?? 0);
      if (parsed.total !== undefined) {
        baselineTotal = Number(parsed.total);
      }
    } catch {
      // Use metric_value
    }
  }

  const currentTotal = currentMetrics ? currentMetrics.total : baselineTotal;
  const currentEasy = currentMetrics ? currentMetrics.easy : baselineEasy;
  const currentMedium = currentMetrics ? currentMetrics.medium : baselineMedium;
  const currentHard = currentMetrics ? currentMetrics.hard : baselineHard;

  const deltaTotal = Math.max(0, currentTotal - baselineTotal);
  const deltaEasy = Math.max(0, currentEasy - baselineEasy);
  const deltaMedium = Math.max(0, currentMedium - baselineMedium);
  const deltaHard = Math.max(0, currentHard - baselineHard);

  return {
    hasBaseline: true,
    status: "BASELINE_DELTA_COMPUTED",
    baselineSnapshot: {
      observedAt: baselineRow.observed_at,
      totalSolved: baselineTotal,
      easySolved: baselineEasy,
      mediumSolved: baselineMedium,
      hardSolved: baselineHard,
      boundaryIso: priorSundayIso,
    },
    currentSnapshot: {
      observedAt: referenceDate.toISOString(),
      totalSolved: currentTotal,
      easySolved: currentEasy,
      mediumSolved: currentMedium,
      hardSolved: currentHard,
    },
    weeklyDelta: {
      total: deltaTotal,
      easy: deltaEasy,
      medium: deltaMedium,
      hard: deltaHard,
    },
    notice: "Plan §9.7: Weekly delta finalized against verified prior Sunday 23:59:59 IST baseline snapshot.",
  };
}
