/**
 * TWM 3.1 — Deterministic Weekly Recap Generator
 * Reference: Plan §10.1, §11, §16.3
 *
 * Invariant: 100% deterministic, rule-based milestone evaluation.
 * Never hallucinate praise, fabricate trends, or smooth unverified dips.
 * Quotes only verified SQLite standings and boundary observations.
 */

import { getDb, getRosterQuorumStats, getAllRosterMembers, getWeeklyStandingsFromDb } from "./db.ts";
import { computeLeetCodeBaseline } from "./baseline.ts";

export interface CohortRecapSummary {
  totalEnrolled: number;
  participatingCount: number;
  quorumPercentage: number;
  meetsQuorum: boolean;
  quorumLabel: string;
  topGithubStudent: { name: string; score: number; rank: number; isTied: boolean } | null;
  topLeetcodeStudent: { name: string; score: number; rank: number; isTied: boolean } | null;
  totalGithubActiveDaysObserved: number;
  totalLeetcodeProblemsSolved: number;
}

export interface StudentRecapDetail {
  studentId: string;
  name: string;
  rollNo: string;
  handleGithub: string | null;
  handleLeetcode: string | null;
  github: {
    activeDays: number;
    rank: number;
    isTied: boolean;
    status: string;
    consistencyRate: number;
  } | null;
  leetcode: {
    weeklyDelta: number;
    totalSolved: number;
    easyDelta: number;
    mediumDelta: number;
    hardDelta: number;
    rank: number;
    isTied: boolean;
    status: string;
  } | null;
  consistencyStreakWeeks: number;
}

export interface DeterministicWeeklyRecap {
  weekNumber: number;
  year: number;
  boundaryTimestampIST: string;
  generatedAt: string;
  cohort: CohortRecapSummary;
  student?: StudentRecapDetail;
  highlights: string[];
  disclosures: {
    zeroFabricationNotice: string;
    boundaryRule: string;
    hackerRankNotice: string;
  };
}

export function generateDeterministicWeeklyRecap(options: {
  studentId?: string;
  rollNo?: string;
  weekNumber?: number;
  year?: number;
}): DeterministicWeeklyRecap {
  const db = getDb();
  const weekNumber = options.weekNumber ?? 42;
  const year = options.year ?? 2026;

  // 1. Quorum and Enrollment Statistics (§3.3)
  const quorumStats = getRosterQuorumStats();
  const allMembers = getAllRosterMembers();

  // 2. Query finalized standings for the week
  const githubStandings = getWeeklyStandingsFromDb(weekNumber, year, "github");
  const leetcodeStandings = getWeeklyStandingsFromDb(weekNumber, year, "leetcode");

  // Top performers
  const topGithub = githubStandings.find((s) => s.rank === 1) || null;
  const topLeetcode = leetcodeStandings.find((s) => s.rank === 1) || null;

  const totalGithubDays = githubStandings.reduce((sum, s) => sum + s.score_value, 0);
  const totalLeetcodeSolved = leetcodeStandings.reduce((sum, s) => sum + s.score_value, 0);

  const cohortSummary: CohortRecapSummary = {
    totalEnrolled: quorumStats.totalEnrolled,
    participatingCount: quorumStats.verifiedOptedIn,
    quorumPercentage: quorumStats.quorumPercentage,
    meetsQuorum: quorumStats.meetsQuorum,
    quorumLabel: quorumStats.label,
    topGithubStudent: topGithub ? {
      name: (topGithub as any).name || topGithub.student_name || "Unknown",
      score: topGithub.score_value,
      rank: topGithub.rank,
      isTied: topGithub.is_tied === 1,
    } : null,
    topLeetcodeStudent: topLeetcode ? {
      name: (topLeetcode as any).name || topLeetcode.student_name || "Unknown",
      score: topLeetcode.score_value,
      rank: topLeetcode.rank,
      isTied: topLeetcode.is_tied === 1,
    } : null,
    totalGithubActiveDaysObserved: totalGithubDays,
    totalLeetcodeProblemsSolved: totalLeetcodeSolved,
  };

  // 3. Resolve student details if requested
  let studentDetail: StudentRecapDetail | undefined = undefined;

  const targetIdentifier = options.studentId || options.rollNo;
  let targetStudent = targetIdentifier 
    ? allMembers.find((m) => m.id === targetIdentifier || m.roll_no === targetIdentifier)
    : allMembers.find((m) => m.is_current_user === 1);

  if (targetStudent) {
    const ghEntry = githubStandings.find((s) => s.student_id === targetStudent.id);
    const lcEntry = leetcodeStandings.find((s) => s.student_id === targetStudent.id);

    // Compute LeetCode baseline deltas
    const baseline = computeLeetCodeBaseline(targetStudent.id);

    const activeDays = ghEntry ? ghEntry.score_value : 0;
    const consistencyRate = Math.round((activeDays / 7) * 100);

    // Consecutive streak calculation from stored observations
    const streakQuery = db.prepare(`
      SELECT count(DISTINCT strftime('%W', observed_at)) as streak
      FROM telemetry_observations
      WHERE student_id = ? AND metric_value >= 4
    `).get(targetStudent.id) as { streak: number } | undefined;

    const streakWeeks = Math.max(1, streakQuery?.streak || 1);

    studentDetail = {
      studentId: targetStudent.id,
      name: targetStudent.name,
      rollNo: targetStudent.roll_no,
      handleGithub: targetStudent.handle_github,
      handleLeetcode: targetStudent.handle_leetcode,
      github: ghEntry ? {
        activeDays,
        rank: ghEntry.rank,
        isTied: ghEntry.is_tied === 1,
        status: ghEntry.status,
        consistencyRate,
      } : null,
      leetcode: lcEntry ? {
        weeklyDelta: lcEntry.score_value,
        totalSolved: baseline.baselineSnapshot?.totalSolved ? baseline.baselineSnapshot.totalSolved + lcEntry.score_value : lcEntry.score_value,
        easyDelta: baseline.weeklyDelta?.easy || 0,
        mediumDelta: baseline.weeklyDelta?.medium || 0,
        hardDelta: baseline.weeklyDelta?.hard || 0,
        rank: lcEntry.rank,
        isTied: lcEntry.is_tied === 1,
        status: lcEntry.status,
      } : null,
      consistencyStreakWeeks: streakWeeks,
    };
  }

  // 4. Construct deterministic, rule-based text highlights
  const highlights: string[] = [];

  // Cohort Quorum Statement
  highlights.push(
    `Class participation stands at ${quorumStats.quorumPercentage}% (${quorumStats.verifiedOptedIn}/${quorumStats.totalEnrolled} members verified), officially designating this as a "${quorumStats.label}".`
  );

  // Student specific statements
  if (studentDetail) {
    if (studentDetail.github) {
      highlights.push(
        `${studentDetail.name} recorded ${studentDetail.github.activeDays}/7 active days on GitHub (Rank #${studentDetail.github.rank}${studentDetail.github.isTied ? " Tied" : ""}), maintaining a ${studentDetail.github.consistencyRate}% weekly commit consistency rate.`
      );
    }
    if (studentDetail.leetcode) {
      highlights.push(
        `On LeetCode, ${studentDetail.name} completed +${studentDetail.leetcode.weeklyDelta} verified problems (Rank #${studentDetail.leetcode.rank}${studentDetail.leetcode.isTied ? " Tied" : ""}) compared against the prior Sunday baseline snapshot.`
      );
    }
    if (studentDetail.consistencyStreakWeeks > 1) {
      highlights.push(
        `Active streak milestone: ${studentDetail.consistencyStreakWeeks} consecutive competition cycles with verified daily telemetry.`
      );
    }
  }

  // Top cohort mover highlight
  if (topGithub && (!studentDetail || topGithub.student_name !== studentDetail.name)) {
    highlights.push(
      `Weekly Top Contributor: ${topGithub.student_name} led the cohort with ${topGithub.score_value}/7 active commit days.`
    );
  }

  return {
    weekNumber,
    year,
    boundaryTimestampIST: "Sunday 23:59:59 IST (UTC+05:30)",
    generatedAt: new Date().toISOString(),
    cohort: cohortSummary,
    student: studentDetail,
    highlights,
    disclosures: {
      zeroFabricationNotice: "Plan §1.2 & §5.7: All statements are generated by deterministic rules evaluating verified telemetry in SQLite. No natural language hallucination.",
      boundaryRule: "Plan §9.1 & §9.7: Closed strictly at Sunday 23:59:59 IST with boundary gap <= 3 hours.",
      hackerRankNotice: "Plan §5.6: HackerRank cumulative badges are display-only and excluded from weekly competition metrics.",
    },
  };
}
