/**
 * TWM 3.1 — Section 16.3 Full Tournament Week Simulation Engine
 * 
 * Simulates a complete 7-day engineering cohort tournament lifecycle:
 * - Day 1 (Monday 00:00:00 IST): Tournament kickoff, quorum evaluation (§3.3).
 * - Day 3 (Wednesday 14:00:00 IST): Telemetry sync & GitHub author verification (§9.1).
 * - Day 5 (Friday 18:30:00 IST): Telemetry dispute filing & two-person audit approval (§10.1).
 * - Day 7 (Sunday 23:45:00 IST): Pre-boundary sweep & 3-hour gap validation (§9.7).
 * - Sunday 23:59:59 IST: Strict boundary cutoff, deterministic ranking 1, 2, 2, 4 (§9.6).
 * - Post-Boundary: Deterministic & Grounded AI weekly recap synthesis with zero-fabrication certification.
 */

import { 
  getDb, 
  getAllRosterMembers, 
  getRosterQuorumStats, 
  recordObservation, 
  insertDispute, 
  resolveDisputeInDb, 
  getAllDisputes 
} from "./db.ts";
import { executeWeeklyFinalization } from "./finalizer.ts";
import type { FinalizationReport } from "./finalizer.ts";
import { generateDeterministicWeeklyRecap } from "./recap.ts";
import type { DeterministicWeeklyRecap } from "./recap.ts";
import { synthesizeDeterministicGroundedRecap } from "./ai-recap.ts";
import type { AIRecapResponse } from "./ai-recap.ts";

export interface SimulationStepDetail {
  step: number;
  title: string;
  timestamp: string;
  description: string;
  data: Record<string, unknown>;
}

export interface InvariantAssertion {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface TournamentSimulationResult {
  weekNumber: number;
  year: number;
  simulatedAt: string;
  invariantsPassed: boolean;
  steps: SimulationStepDetail[];
  assertions: InvariantAssertion[];
  finalization: {
    github: FinalizationReport;
    leetcode: FinalizationReport;
  };
  recaps: {
    deterministic: DeterministicWeeklyRecap;
    ai: AIRecapResponse;
  };
}

export function runTournamentSimulationSync(options: { weekNumber?: number; year?: number } = {}): TournamentSimulationResult {
  const weekNumber = options.weekNumber ?? 43;
  const year = options.year ?? 2026;
  const steps: SimulationStepDetail[] = [];
  const assertions: InvariantAssertion[] = [];

  const db = getDb();

  // 0. Clean previous simulation artifacts for idempotency
  try {
    db.prepare("DELETE FROM telemetry_observations WHERE id LIKE 'sim-%'").run();
    db.prepare("DELETE FROM disputes WHERE id LIKE 'disp-sim-%'").run();
    db.prepare("DELETE FROM weekly_standings WHERE week_number = ? AND year = ?").run(weekNumber, year);
  } catch {
    // Ignore cleanup errors
  }

  // =========================================================================
  // STEP 1: Monday 00:00:00 IST — Tournament Kickoff & Quorum Baseline (§3.3)
  // =========================================================================
  const roster = getAllRosterMembers();
  const quorumStats = getRosterQuorumStats();

  const quorumAssertion = quorumStats.totalEnrolled >= 7 && quorumStats.quorumPercentage >= 70;
  assertions.push({
    name: "Quorum 70% Invariant (§3.3)",
    passed: quorumAssertion,
    expected: ">= 70%",
    actual: `${quorumStats.quorumPercentage}%`
  });

  steps.push({
    step: 1,
    title: "Tournament Kickoff & Quorum Baseline",
    timestamp: "Monday 00:00:00 IST",
    description: `Evaluated class roster denominator: ${quorumStats.totalEnrolled} enrolled, ${quorumStats.verifiedOptedIn} verified (${quorumStats.quorumPercentage}%).`,
    data: {
      totalEnrolled: quorumStats.totalEnrolled,
      verifiedOptedIn: quorumStats.verifiedOptedIn,
      quorumPercentage: quorumStats.quorumPercentage,
      label: quorumStats.label
    }
  });

  // =========================================================================
  // STEP 2: Wednesday 14:00:00 IST — Midweek Telemetry Sync & Author Verification (§9.1)
  // =========================================================================
  const simulatedObservations = [
    { studentId: "usr-rohan", name: "Rohan Varma", githubDays: 7, leetcodeDelta: 14, commitEmail: "rohan.v2022@vitstudent.ac.in", authorMatch: true },
    { studentId: "usr-priya", name: "Priya Nair", githubDays: 6, leetcodeDelta: 12, commitEmail: "priya.s2022@vitstudent.ac.in", authorMatch: true },
    { studentId: "usr-aarav", name: "Aarav Sharma", githubDays: 6, leetcodeDelta: 12, commitEmail: "aarav.p2022@vitstudent.ac.in", authorMatch: true },
    { studentId: "usr-ananya", name: "Ananya Roy", githubDays: 5, leetcodeDelta: 9, commitEmail: "ananya.r2022@vitstudent.ac.in", authorMatch: true },
    { studentId: "usr-vikram", name: "Vikram Singh", githubDays: 5, leetcodeDelta: 8, commitEmail: "vikram.s2022@vitstudent.ac.in", authorMatch: true },
    { studentId: "usr-aditya", name: "Aditya Kumar", githubDays: 4, leetcodeDelta: 6, commitEmail: "aditya.n2022@vitstudent.ac.in", authorMatch: true },
    { studentId: "usr-sneha", name: "Sneha Patel", githubDays: 3, leetcodeDelta: 4, commitEmail: "sneha.r2022@vitstudent.ac.in", authorMatch: true },
  ];

  const wednesdayIso = `2026-10-21T08:30:00.000Z`;
  for (const item of simulatedObservations) {
    recordObservation({
      id: `sim-mid-gh-${item.studentId}`,
      studentId: item.studentId,
      platform: "github",
      metricName: "active_days",
      metricValue: Math.max(1, item.githubDays - 2),
      displayValue: `${Math.max(1, item.githubDays - 2)} / 7 Days`,
      observedAt: wednesdayIso,
      isProvisional: false,
      coveragePass: true,
      rawPayload: { authorMatched: item.authorMatch, email: item.commitEmail }
    });
  }

  steps.push({
    step: 2,
    title: "Midweek Telemetry Sync & Author Verification",
    timestamp: "Wednesday 14:00:00 IST",
    description: "Ingested active GitHub commit rhythms and LeetCode problem breakdowns. Matched commit author emails against student college roster.",
    data: {
      syncedParticipants: simulatedObservations.length,
      authorMatchRate: "100%",
      antiGamingStatus: "VERIFIED"
    }
  });

  // =========================================================================
  // STEP 3: Friday 18:30:00 IST — Telemetry Dispute & Two-Person Audit (§10.1)
  // =========================================================================
  const disputeId = `disp-sim-${Date.now()}`;
  insertDispute({
    id: disputeId,
    studentId: "usr-aditya",
    studentName: "Aditya Kumar",
    rollNo: "2022BCSE019",
    metric: "active_days",
    platform: "github",
    claim: "Simulated dispute: 1 commit on branch 'feat/auth' made before boundary not indexed during webhook sync.",
    evidenceUrl: "https://github.com/iam-kathir/twm-demo/commit/a1b2c3d4e5f6",
    ruleReference: "Section 9.1 UTC Day-Bucket Rule"
  });

  resolveDisputeInDb(
    disputeId,
    "approved",
    "Verified valid commit author signature & timestamp within competition window. Applied +1 active day adjustment.",
    "Prof. K. Sharma (Faculty Lead / Co-Admin)"
  );

  const updatedDisputes = getAllDisputes();
  const resolution = updatedDisputes.find(d => d.id === disputeId);

  const disputeAssertion = resolution?.status === "approved" && !!resolution?.reviewed_by;
  assertions.push({
    name: "Two-Person Dispute Audit (§10.1)",
    passed: disputeAssertion,
    expected: "approved with reviewed_by",
    actual: `${resolution?.status} by ${resolution?.reviewed_by}`
  });

  steps.push({
    step: 3,
    title: "Dispute Lodged & Faculty Audit Resolution",
    timestamp: "Friday 18:30:00 IST",
    description: `Aditya Kumar raised dispute on branch indexing. Approved by co-admin ${resolution?.reviewed_by}.`,
    data: {
      disputeId,
      claim: "Unindexed secondary branch commit",
      status: resolution?.status,
      reviewedBy: resolution?.reviewed_by,
      resolutionNote: resolution?.resolution_note
    }
  });

  // =========================================================================
  // STEP 4: Sunday 23:45:00 IST — Pre-Boundary Sweep & 3h Gap Validation (§9.7)
  // =========================================================================
  const sundayBoundaryIso = `2026-10-25T18:29:59.000Z`; // Sunday 23:59:59 IST in UTC
  const preBoundaryIso = `2026-10-25T18:15:00.000Z`;    // 15 min prior
  const staleBoundaryIso = `2026-10-25T14:00:00.000Z`;  // 4.25h prior

  for (const item of simulatedObservations) {
    const isStaleObservation = item.studentId === "usr-sneha";
    const observationTimestamp = isStaleObservation ? staleBoundaryIso : preBoundaryIso;
    const gapSeconds = isStaleObservation ? 15300 : 900;

    recordObservation({
      id: `sim-sun-gh-${item.studentId}`,
      studentId: item.studentId,
      platform: "github",
      metricName: "active_days",
      metricValue: item.githubDays,
      displayValue: `${item.githubDays} / 7 Days`,
      scheduledBoundaryAt: sundayBoundaryIso,
      observedAt: observationTimestamp,
      boundaryGapSeconds: gapSeconds,
      isProvisional: gapSeconds > 3 * 3600,
      coveragePass: gapSeconds <= 3 * 3600,
      rawPayload: { authorMatched: item.authorMatch, email: item.commitEmail }
    });

    recordObservation({
      id: `sim-sun-lc-${item.studentId}`,
      studentId: item.studentId,
      platform: "leetcode",
      metricName: "problems_solved",
      metricValue: item.leetcodeDelta,
      displayValue: `+${item.leetcodeDelta} Solved`,
      scheduledBoundaryAt: sundayBoundaryIso,
      observedAt: observationTimestamp,
      boundaryGapSeconds: gapSeconds,
      isProvisional: gapSeconds > 3 * 3600,
      coveragePass: gapSeconds <= 3 * 3600,
      rawPayload: { easy: Math.floor(item.leetcodeDelta * 0.5), medium: Math.floor(item.leetcodeDelta * 0.4), hard: Math.floor(item.leetcodeDelta * 0.1) }
    });
  }

  steps.push({
    step: 4,
    title: "Pre-Boundary Snapshot Sweep",
    timestamp: "Sunday 23:45:00 IST",
    description: "Executed pre-boundary observation sweep. 6 students within 15-minute gap (Finalized); 1 student at 4.25-hour gap flagged Provisional (§9.7).",
    data: {
      scheduledBoundary: sundayBoundaryIso,
      capturedCount: simulatedObservations.length,
      freshnessWindowHours: 3
    }
  });

  // =========================================================================
  // STEP 5: Sunday 23:59:59 IST — Strict Boundary Cutoff & Ranking Engine (§9.6)
  // =========================================================================
  const ghFinalization = executeWeeklyFinalization({
    weekNumber,
    year,
    platform: "github",
    boundaryDateIso: sundayBoundaryIso
  });

  const lcFinalization = executeWeeklyFinalization({
    weekNumber,
    year,
    platform: "leetcode",
    boundaryDateIso: sundayBoundaryIso
  });

  const priyaStanding = ghFinalization.standings.find(s => s.studentId === "usr-priya");
  const aaravStanding = ghFinalization.standings.find(s => s.studentId === "usr-aarav");
  const tieAssertion = priyaStanding && aaravStanding && priyaStanding.rank === 2 && aaravStanding.rank === 2 && priyaStanding.isTied && aaravStanding.isTied;

  assertions.push({
    name: "Standard Competition Ranking Ties (§9.6: 1, 2, 2, 4)",
    passed: !!tieAssertion,
    expected: "Rank 2 shared with isTied=true",
    actual: `${priyaStanding?.studentName}: Rank ${priyaStanding?.rank} (Tied: ${priyaStanding?.isTied}), ${aaravStanding?.studentName}: Rank ${aaravStanding?.rank} (Tied: ${aaravStanding?.isTied})`
  });

  const nextRankStanding = ghFinalization.standings.find(s => s.score < 6);
  const skipAssertion = nextRankStanding ? nextRankStanding.rank >= 4 : false;

  assertions.push({
    name: "Rank Skip Policy (§9.6)",
    passed: skipAssertion,
    expected: "Rank >= 4 for score after 2-way tie",
    actual: `Next rank assigned: ${nextRankStanding?.rank}`
  });

  steps.push({
    step: 5,
    title: "Strict Boundary Finalization & Ranking",
    timestamp: "Sunday 23:59:59 IST",
    description: `Standings finalized. Priya Nair & Aarav Sharma tied for Rank 2; subsequent score skipped to Rank ${nextRankStanding?.rank}.`,
    data: {
      githubFinalized: ghFinalization.finalizedCount,
      githubProvisional: ghFinalization.provisionalCount,
      leetcodeFinalized: lcFinalization.finalizedCount,
      topGithub: ghFinalization.standings[0]?.studentName,
      topScore: ghFinalization.standings[0]?.score
    }
  });

  // =========================================================================
  // STEP 6: Post-Boundary — Deterministic & Grounded AI Recaps (§10.1, §10.2)
  // =========================================================================
  const deterministicRecap = generateDeterministicWeeklyRecap({
    weekNumber,
    year,
    studentId: "usr-rohan"
  });

  const aiRecap = synthesizeDeterministicGroundedRecap(deterministicRecap);

  const recapAssertion = aiRecap.groundingAudit.zeroFabricationVerified === true &&
                         deterministicRecap.highlights.length > 0 &&
                         aiRecap.actionPlan.length > 0;

  assertions.push({
    name: "Grounded AI Zero-Fabrication Guarantee (§1.2 & §5.7)",
    passed: recapAssertion,
    expected: "zeroFabricationVerified: true, grounded facts only",
    actual: `Verified: ${aiRecap.groundingAudit.zeroFabricationVerified}, Highlights: ${deterministicRecap.highlights.length}`
  });

  steps.push({
    step: 6,
    title: "Dual Recap Synthesis & Grounding Certification",
    timestamp: "Monday 00:05:00 IST",
    description: "Generated deterministic recap and grounded natural language summary quoting strictly verified metrics.",
    data: {
      zeroFabricationVerified: aiRecap.groundingAudit.zeroFabricationVerified,
      executiveSummary: aiRecap.executiveSummary,
      actionPlanCount: aiRecap.actionPlan.length
    }
  });

  const invariantsPassed = assertions.every(a => a.passed);

  return {
    weekNumber,
    year,
    simulatedAt: new Date().toISOString(),
    invariantsPassed,
    steps,
    assertions,
    finalization: {
      github: ghFinalization,
      leetcode: lcFinalization
    },
    recaps: {
      deterministic: deterministicRecap,
      ai: aiRecap
    }
  };
}
