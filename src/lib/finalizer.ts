/**
 * Section 9.1 & Section 9.7 Sunday 23:59:59 IST Boundary Finalizer Engine
 *
 * Requirements from TWM Master Plan v3.1:
 * 1. Boundary Observation Rule: Only observations taken at or before Sunday 23:59:59 IST
 *    are eligible to be closing values. Observations after boundary are never used.
 * 2. Boundary Gap Validation: Observations must be within max configured threshold (3 hours).
 *    Otherwise marked PROVISIONAL.
 * 3. Deterministic Ranking: Utilizes computeCompetitionRanks (§9.6) for 1, 2, 2, 4 ties.
 * 4. Immutable Persistence: Records results in weekly_standings table in SQLite.
 */

import { getDb, getAllRosterMembers, saveWeeklyFinalizedStandings } from "./db.ts";
import type { WeeklyStandingRow } from "./db.ts";
import { computeCompetitionRanks } from "./leaderboard.ts";
import type { RawParticipant } from "./leaderboard.ts";

export interface FinalizationReport {
  weekNumber: number;
  year: number;
  platform: "github" | "leetcode";
  boundaryTimestampIST: string;
  totalEnrolled: number;
  participatingCount: number;
  quorumPercentage: number;
  meetsQuorum: boolean;
  finalizedCount: number;
  provisionalCount: number;
  standings: Array<{
    rank: number;
    studentId: string;
    studentName: string;
    score: number;
    displayValue: string;
    isTied: boolean;
    status: "Finalized" | "Provisional";
    boundaryGapMinutes: number;
  }>;
}

export function executeWeeklyFinalization(options: {
  weekNumber?: number;
  year?: number;
  platform: "github" | "leetcode";
  boundaryDateIso?: string;
}): FinalizationReport {
  const db = getDb();
  const weekNumber = options.weekNumber ?? 42;
  const year = options.year ?? 2026;
  const platform = options.platform;

  // Sunday 23:59:59 IST in ISO string (UTC+05:30 -> 18:29:59 UTC). Defaults to current time if unprovided
  const boundaryIso = options.boundaryDateIso || new Date().toISOString();
  const boundaryMs = new Date(boundaryIso).getTime();

  const members = getAllRosterMembers();
  const totalEnrolled = members.length;

  // Retrieve latest observation for each student at or before Sunday boundary
  const rawParticipants: (RawParticipant & { boundaryGapSeconds: number })[] = [];

  for (const m of members) {
    // Only query observations taken at or before boundary timestamp
    const obs = db.prepare(`
      SELECT * FROM telemetry_observations
      WHERE student_id = ? AND platform = ? AND datetime(observed_at) <= datetime(?)
      ORDER BY observed_at DESC
      LIMIT 1
    `).get(m.id, platform, boundaryIso) as any;

    if (obs) {
      const observedMs = new Date(obs.observed_at).getTime();
      const gapSeconds = Math.max(0, Math.floor((boundaryMs - observedMs) / 1000));
      const isWithin3Hours = gapSeconds <= 3 * 3600;

      rawParticipants.push({
        id: m.id,
        name: m.name,
        handle: platform === "github" ? (m.handle_github || "") : (m.handle_leetcode || ""),
        numericVal: obs.metric_value,
        value: obs.display_value,
        coverage: isWithin3Hours ? "Pre-boundary valid" : "Stale observation",
        coveragePass: isWithin3Hours,
        freshness: `${Math.round(gapSeconds / 60)}m gap`,
        status: isWithin3Hours ? "Finalized" : "Provisional",
        isCurrentUser: m.is_current_user === 1,
        boundaryGapSeconds: gapSeconds,
      });
    }
  }

  // Rank with Section 9.6 deterministic tie policy (1, 2, 2, 4)
  const ranked = computeCompetitionRanks(rawParticipants);

  const finalStandingsRows: WeeklyStandingRow[] = [];
  const reportStandings: FinalizationReport["standings"] = [];

  let finalizedCount = 0;
  let provisionalCount = 0;

  for (const r of ranked) {
    const raw = rawParticipants.find((p) => p.id === r.id);
    const gapSeconds = raw ? raw.boundaryGapSeconds : 0;
    const isProvisional = r.status === "Provisional";

    if (isProvisional) provisionalCount++;
    else finalizedCount++;

    const standingId = `std-${year}-w${weekNumber}-${platform}-${r.id}`;

    finalStandingsRows.push({
      id: standingId,
      week_number: weekNumber,
      year,
      platform,
      student_id: r.id,
      student_name: r.name,
      rank: r.rank,
      score_value: r.numericVal,
      display_value: r.value,
      is_tied: r.isTied ? 1 : 0,
      boundary_observed_at: new Date(boundaryMs - gapSeconds * 1000).toISOString(),
      boundary_gap_seconds: gapSeconds,
      status: r.status,
      finalized_at: new Date().toISOString(),
    });

    reportStandings.push({
      rank: r.rank,
      studentId: r.id,
      studentName: r.name,
      score: r.numericVal,
      displayValue: r.value,
      isTied: r.isTied,
      status: r.status,
      boundaryGapMinutes: Math.round(gapSeconds / 60),
    });
  }

  // Persist to SQLite
  saveWeeklyFinalizedStandings(finalStandingsRows);

  const quorumPercentage = totalEnrolled > 0 ? (rawParticipants.length / totalEnrolled) * 100 : 0;

  return {
    weekNumber,
    year,
    platform,
    boundaryTimestampIST: "Sunday 23:59:59 IST",
    totalEnrolled,
    participatingCount: rawParticipants.length,
    quorumPercentage: Math.round(quorumPercentage),
    meetsQuorum: quorumPercentage >= 70,
    finalizedCount,
    provisionalCount,
    standings: reportStandings,
  };
}
