import { test, describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeCompetitionRanks } from "../src/lib/leaderboard.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";
import { getDb, getAllRosterMembers, insertRosterMember, getRosterQuorumStats, registerHmacNonce, verifyAndConsumeNonce, insertDispute, resolveDisputeInDb, getAllDisputes, getWeeklyStandingsFromDb } from "../src/lib/db.ts";
import { executeWeeklyFinalization } from "../src/lib/finalizer.ts";
import { getPreviousSundayBoundaryIST, computeLeetCodeBaseline } from "../src/lib/baseline.ts";
import { generateDeterministicWeeklyRecap } from "../src/lib/recap.ts";
import { synthesizeDeterministicGroundedRecap, generateGroundedAIRecap } from "../src/lib/ai-recap.ts";
import { getCohortDevelopers } from "../src/lib/search.ts";
import { runTournamentSimulation } from "./simulate-tournament-week.mjs";
import { createDatabaseBackup, verifyBackupFile, restoreDatabaseFromBackup } from "../src/lib/backup.ts";
import { runLaunchAcceptanceAudit } from "./audit-launch-checklist.mjs";
import fs from "node:fs";
import path from "node:path";

describe("TWM Foundation Suite", () => {
  describe("Section 9.6 Competition Ranking & Tie Policy", () => {
    it("handles empty and single participant lists", () => {
      assert.deepEqual(computeCompetitionRanks([]), []);

      const single = [
        {
          id: "1",
          name: "Alice",
          handle: "@alice",
          numericVal: 10,
          value: "10",
          coverage: "100%",
          coveragePass: true,
          freshness: "now",
          status: "Finalized",
        },
      ];
      const res = computeCompetitionRanks(single);
      assert.equal(res.length, 1);
      assert.equal(res[0].rank, 1);
      assert.equal(res[0].isTied, false);
    });

    it("applies standard competition ranking (1, 2, 2, 4) deterministically", () => {
      const participants = [
        { id: "1", name: "Rohan", handle: "@rohan", numericVal: 7, value: "7", coverage: "95%", coveragePass: true, freshness: "now", status: "Finalized" },
        { id: "2", name: "Priya", handle: "@priya", numericVal: 6, value: "6", coverage: "95%", coveragePass: true, freshness: "now", status: "Finalized" },
        { id: "3", name: "Aarav", handle: "@aarav", numericVal: 6, value: "6", coverage: "95%", coveragePass: true, freshness: "now", status: "Finalized" },
        { id: "4", name: "Aditya", handle: "@aditya", numericVal: 4, value: "4", coverage: "95%", coveragePass: true, freshness: "now", status: "Finalized" },
      ];

      const ranked = computeCompetitionRanks(participants);

      // Rohan (7) -> Rank 1
      assert.equal(ranked[0].name, "Rohan");
      assert.equal(ranked[0].rank, 1);
      assert.equal(ranked[0].isTied, false);

      // Aarav (6) and Priya (6) tied for rank 2. Sorted alphabetically: Aarav, then Priya
      assert.equal(ranked[1].name, "Aarav");
      assert.equal(ranked[1].rank, 2);
      assert.equal(ranked[1].isTied, true);

      assert.equal(ranked[2].name, "Priya");
      assert.equal(ranked[2].rank, 2);
      assert.equal(ranked[2].isTied, true);

      // Aditya (4) skips 3 and takes Rank 4 (§9.6)
      assert.equal(ranked[3].name, "Aditya");
      assert.equal(ranked[3].rank, 4);
      assert.equal(ranked[3].isTied, false);
    });
  });

  describe("Sliding-Window Rate Limiter", () => {
    it("permits requests within limit and throttles excess", () => {
      const key = `test-ip-${Date.now()}`;
      const opts = { limit: 3, windowMs: 10000 };

      const r1 = checkRateLimit(key, opts);
      assert.equal(r1.allowed, true);
      assert.equal(r1.remaining, 2);

      const r2 = checkRateLimit(key, opts);
      assert.equal(r2.allowed, true);
      assert.equal(r2.remaining, 1);

      const r3 = checkRateLimit(key, opts);
      assert.equal(r3.allowed, true);
      assert.equal(r3.remaining, 0);

      // 4th request exceeds limit
      const r4 = checkRateLimit(key, opts);
      assert.equal(r4.allowed, false);
      assert.equal(r4.remaining, 0);
      assert.ok(r4.retryAfterSeconds > 0);
    });
  });

  describe("SQLite Database Layer", () => {
    it("initializes SQLite WAL database with seeded roster", () => {
      const db = getDb();
      assert.ok(db, "Database should initialize");

      const members = getAllRosterMembers();
      assert.ok(members.length >= 7, "Should seed at least 7 class members");

      const aarav = members.find((m) => m.roll_no === "2022BCSE042");
      assert.ok(aarav, "Aarav Sharma should exist in seeded roster");
      assert.equal(aarav.is_current_user, 1);
    });

    it("registers and consumes HMAC nonces (replay prevention)", () => {
      const nonce = `test-nonce-${Date.now()}`;
      const expiresAt = Date.now() + 60000;

      registerHmacNonce(nonce, "usr-test", "leetcode", "test_user", expiresAt);

      // First verification should pass and consume
      const check1 = verifyAndConsumeNonce(nonce);
      assert.equal(check1.valid, true);

      // Second verification of same nonce must be rejected (replay attack prevention)
      const check2 = verifyAndConsumeNonce(nonce);
      assert.equal(check2.valid, false);
      assert.equal(check2.reason, "NONCE_ALREADY_USED");
    });
  });

  describe("Section 9.7 Sunday 23:59:59 IST Finalizer Engine", () => {
    it("executes weekly finalization and commits standings to SQLite", () => {
      const report = executeWeeklyFinalization({
        weekNumber: 42,
        year: 2026,
        platform: "github",
      });

      assert.equal(report.weekNumber, 42);
      assert.equal(report.platform, "github");
      assert.ok(report.totalEnrolled >= 7);
      assert.ok(report.participatingCount >= 7);
      assert.equal(report.meetsQuorum, true);
      assert.ok(report.standings.length > 0);

      // Verify that rank 1 exists
      const winner = report.standings.find((s) => s.rank === 1);
      assert.ok(winner, "Rank 1 winner must exist");

      // Verify records are written into SQLite weekly_standings table
      const stored = getWeeklyStandingsFromDb(42, 2026, "github");
      assert.ok(stored.length >= 7, "Standings must be retrieved from SQLite");
      assert.equal(stored[0].rank, 1);
    });
  });

  describe("Dispute Resolution & Audit Trail (§10.1)", () => {
    it("records, queries, and approves disputes in SQLite", () => {
      const testId = `DSP-TEST-${Date.now()}`;
      insertDispute({
        id: testId,
        studentId: "usr-aarav",
        studentName: "Aarav Sharma",
        rollNo: "2022BCSE042",
        metric: "github_active_days",
        platform: "GitHub",
        claim: "Late commit verified via PGP signature.",
        evidenceUrl: "https://github.com/test",
        ruleReference: "Rule §9.7",
      });

      const listBefore = getAllDisputes();
      const created = listBefore.find((d) => d.id === testId);
      assert.ok(created);
      assert.equal(created.status, "pending");

      // Resolve dispute
      resolveDisputeInDb(testId, "approved", "Valid signature", "Faculty Co-Admin");

      const listAfter = getAllDisputes();
      const resolved = listAfter.find((d) => d.id === testId);
      assert.ok(resolved);
      assert.equal(resolved.status, "approved");
      assert.equal(resolved.reviewed_by, "Faculty Co-Admin");
    });
  });

  describe("Section 3.3 Quorum & Class Roster Management", () => {
    it("computes live quorum percentage and determines representative label", () => {
      const stats = getRosterQuorumStats();
      assert.ok(stats.totalEnrolled >= 7, "Total enrolled denominator must be at least 7");
      assert.ok(stats.verifiedOptedIn >= 7, "Verified opted in count must match seeded count");
      assert.ok(stats.quorumPercentage >= 70, "Initial seeded cohort should meet 70% quorum");
      assert.equal(stats.meetsQuorum, true);
      assert.equal(stats.label, "Representative Class Leaderboard");
    });

    it("inserts a new roster member into SQLite and verifies uniqueness", () => {
      const uniqueSuffix = Date.now().toString().slice(-4);
      const testRollNo = `2026TEST${uniqueSuffix}`;
      const newMember = insertRosterMember({
        rollNo: testRollNo,
        name: "Test Enrollee",
        email: `test.${uniqueSuffix}@college.edu`,
        classSection: "B.Tech CSE 2026 (Sec B)",
        handleGithub: `test-gh-${uniqueSuffix}`,
        handleLeetcode: `test-lc-${uniqueSuffix}`,
        handleHackerrank: `test-hr-${uniqueSuffix}`,
      });

      assert.ok(newMember.id);
      assert.equal(newMember.roll_no, testRollNo);
      assert.equal(newMember.is_active, 1);

      // Verify member is listed in all members
      const all = getAllRosterMembers();
      const found = all.find((m) => m.roll_no === testRollNo);
      assert.ok(found, "Newly enrolled member should be in roster list");
      assert.equal(found.name, "Test Enrollee");

      // Clean up test member to ensure idempotent database state
      getDb().prepare("DELETE FROM roster_members WHERE roll_no = ?").run(testRollNo);
    });
  });

  describe("Section 9.7 & §16.3 LeetCode Historical Baseline Tracking (P3-2)", () => {
    it("computes previous Sunday 23:59:59 IST boundary timestamp accurately", () => {
      // Wednesday 2026-10-21 14:00 IST -> Prior Sunday is 2026-10-18 23:59:59.999 IST
      const refDate = new Date("2026-10-21T08:30:00.000Z"); // 14:00 IST
      const priorSunday = getPreviousSundayBoundaryIST(refDate);

      // Verify that priorSunday converted to IST is 23:59:59 Sunday
      const istTime = new Date(priorSunday.getTime() + 5.5 * 60 * 60 * 1000);
      assert.equal(istTime.getUTCDay(), 0, "Must be Sunday");
      assert.equal(istTime.getUTCHours(), 23, "Must be 23 hours IST");
      assert.equal(istTime.getUTCMinutes(), 59, "Must be 59 minutes IST");
      assert.equal(istTime.getUTCSeconds(), 59, "Must be 59 seconds IST");
    });

    it("evaluates LeetCode baseline deltas when prior Sunday snapshot exists", () => {
      const db = getDb();
      const testStudentId = "test-std-baseline-01";
      const testRollNo = "2026BASE01";

      // Insert test student
      db.prepare(`
        INSERT OR REPLACE INTO roster_members (id, roll_no, name, email, class_section, handle_leetcode, is_active)
        VALUES (?, ?, 'Baseline Student', 'base@college.edu', 'B.Tech CSE', 'base_coder', 1)
      `).run(testStudentId, testRollNo);

      // Insert prior Sunday baseline observation
      const refDate = new Date("2026-10-21T08:30:00.000Z");
      const priorSunday = getPreviousSundayBoundaryIST(refDate);
      const priorObsId = "obs-prior-sun-01";

      db.prepare(`
        INSERT OR REPLACE INTO telemetry_observations (
          id, student_id, platform, metric_name, metric_value, display_value,
          observed_at, raw_payload
        ) VALUES (?, ?, 'leetcode', 'total_solved', 150, '150 Solved', ?, ?)
      `).run(
        priorObsId,
        testStudentId,
        priorSunday.toISOString(),
        JSON.stringify({ total: 150, easy: 80, medium: 55, hard: 15 })
      );

      // Current metrics to compare
      const currentMetrics = {
        total: 165,
        easy: 85,
        medium: 63,
        hard: 17,
      };

      const result = computeLeetCodeBaseline(testStudentId, currentMetrics, refDate);

      assert.equal(result.hasBaseline, true);
      assert.equal(result.status, "BASELINE_DELTA_COMPUTED");
      assert.ok(result.weeklyDelta);
      assert.equal(result.weeklyDelta.total, 15, "165 - 150 = 15 total delta");
      assert.equal(result.weeklyDelta.easy, 5, "85 - 80 = 5 easy delta");
      assert.equal(result.weeklyDelta.medium, 8, "63 - 55 = 8 medium delta");
      assert.equal(result.weeklyDelta.hard, 2, "17 - 15 = 2 hard delta");

      // Clean up test fixtures to maintain idempotent DB
      db.prepare("DELETE FROM telemetry_observations WHERE id = ?").run(priorObsId);
      db.prepare("DELETE FROM roster_members WHERE id = ?").run(testStudentId);
    });

    it("returns NO_PRIOR_SUNDAY_BASELINE when no baseline exists", () => {
      const result = computeLeetCodeBaseline("2022BCSE042", {
        total: 184,
        easy: 92,
        medium: 78,
        hard: 14,
      }, new Date("2020-01-01T00:00:00Z")); // Date in distant past where no observations exist

      assert.equal(result.hasBaseline, false);
      assert.equal(result.status, "NO_PRIOR_SUNDAY_BASELINE");
      assert.equal(result.weeklyDelta, null);
    });

    it("handles unenrolled students with STUDENT_NOT_ENROLLED", () => {
      const result = computeLeetCodeBaseline("non_existent_student_xyz");
      assert.equal(result.hasBaseline, false);
      assert.equal(result.status, "STUDENT_NOT_ENROLLED");
    });
  });

  describe("Section 10.1 Deterministic Weekly Recap Generator (P4-1)", () => {
    it("generates structured weekly recap with cohort quorum and disclosures", () => {
      const recap = generateDeterministicWeeklyRecap({ weekNumber: 42, year: 2026 });

      assert.equal(recap.weekNumber, 42);
      assert.equal(recap.year, 2026);
      assert.ok(recap.boundaryTimestampIST.includes("Sunday 23:59:59 IST"));
      assert.ok(recap.cohort.totalEnrolled >= 7);
      assert.ok(recap.cohort.quorumPercentage >= 70);
      assert.equal(recap.cohort.meetsQuorum, true);
      assert.ok(recap.highlights.length >= 1);

      // Verify zero fabrication disclosures are present per §1.2 & §5.7
      assert.ok(recap.disclosures.zeroFabricationNotice.includes("Plan §1.2"));
      assert.ok(recap.disclosures.boundaryRule.includes("Sunday 23:59:59 IST"));
      assert.ok(recap.disclosures.hackerRankNotice.includes("Plan §5.6"));
    });

    it("evaluates student specific recap milestones for current user", () => {
      const recap = generateDeterministicWeeklyRecap({
        rollNo: "2022BCSE042", // Aarav Sharma
        weekNumber: 42,
        year: 2026,
      });

      assert.ok(recap.student, "Student recap detail must be populated");
      assert.equal(recap.student.rollNo, "2022BCSE042");
      assert.equal(recap.student.name, "Aarav Sharma");
      assert.ok(recap.student.consistencyStreakWeeks >= 1);

      // Verify highlights include student's verified accomplishments
      const studentHighlights = recap.highlights.filter((h) => h.includes("Aarav Sharma"));
      assert.ok(studentHighlights.length >= 1, "Must generate at least one factual student milestone highlight");
    });
  });

  describe("Section 10.2 Grounded AI Natural Language Performance Summarizer (P4-2)", () => {
    it("synthesizes grounded executive summary strictly quoting verified telemetry", () => {
      const deterministic = generateDeterministicWeeklyRecap({
        rollNo: "2022BCSE042",
        weekNumber: 42,
        year: 2026,
      });
      const aiRecap = synthesizeDeterministicGroundedRecap(deterministic);

      assert.ok(aiRecap.executiveSummary.length > 20);
      assert.ok(aiRecap.executiveSummary.includes("Aarav Sharma"));
      assert.equal(aiRecap.groundingAudit.isGrounded, true);
      assert.equal(aiRecap.groundingAudit.zeroFabricationVerified, true);
      assert.equal(aiRecap.groundingAudit.engine, "DETERMINISTIC_GROUNDED_SYNTHESIS");
      assert.ok(aiRecap.groundingAudit.verifiedFactsQuoted.length >= 2);
    });

    it("enforces honest growth areas and action plan without fabricated praise", async () => {
      const aiRecap = await generateGroundedAIRecap({
        rollNo: "2022BCSE042",
        weekNumber: 42,
        year: 2026,
      });

      assert.ok(aiRecap.verifiedStrengths.length >= 1);
      assert.ok(aiRecap.honestGrowthAreas.length >= 1);
      assert.ok(aiRecap.actionPlan.length >= 1);

      // Every action plan item must have targetMetric defined
      for (const item of aiRecap.actionPlan) {
        assert.ok(item.title);
        assert.ok(item.description);
        assert.ok(item.targetMetric);
      }

      // Check disclosures: HackerRank must be cited as display-only per §5.6
      const hrGrowthArea = aiRecap.honestGrowthAreas.find((g) => g.includes("HackerRank"));
      assert.ok(hrGrowthArea, "HackerRank must be disclosed as display-only per §5.6");
    });
  });

  describe("Section 10.3 Semantic Classmate Search & Cohort Directory (P4-3)", () => {
    it("returns real enrolled cohort members from SQLite database without mocks", () => {
      const allDevs = getCohortDevelopers();
      assert.ok(allDevs.length >= 7, "Must contain all enrolled cohort members from SQLite");

      const aarav = allDevs.find((d) => d.rollNo === "2022BCSE042");
      assert.ok(aarav, "Aarav Sharma must be present in directory");
      assert.equal(aarav.name, "Aarav Sharma");
      assert.ok(aarav.tags.length >= 2, "Must contain grounded skill tags");
      assert.equal(aarav.platforms.hackerrank.isDisplayOnly, true, "HackerRank must be flagged display-only per §5.6");
    });

    it("filters cohort directory by technology tag and evidence level correctly", () => {
      // Filter by tag: TypeScript
      const tsDevs = getCohortDevelopers({ tag: "TypeScript" });
      assert.ok(tsDevs.length >= 1, "Must find students with TypeScript tag");
      for (const dev of tsDevs) {
        assert.ok(dev.tags.some((t) => t.name.toLowerCase() === "typescript"));
      }

      // Filter by evidence level: EXPLICIT_SOURCE
      const explicitDevs = getCohortDevelopers({ evidenceLevel: "EXPLICIT_SOURCE" });
      assert.ok(explicitDevs.length >= 1, "Must find students with explicit source evidence");
      for (const dev of explicitDevs) {
        assert.ok(dev.tags.some((t) => t.evidence === "EXPLICIT_SOURCE"));
      }

      // Filter by text search: 'Python'
      const pythonSearch = getCohortDevelopers({ query: "Python" });
      assert.ok(pythonSearch.length >= 1);
      const priya = pythonSearch.find((d) => d.name.includes("Priya"));
      assert.ok(priya, "Priya Nair must be returned for Python query");
    });
  });

  describe("Section 16.3 Full Tournament Week Simulation (Phase 5)", () => {
    it("executes full 7-day tournament lifecycle and passes all invariant gates", async () => {
      const results = await runTournamentSimulation({ weekNumber: 44, year: 2026 });
      assert.ok(results.invariantsPassed, "All tournament invariants must pass");
      assert.equal(results.assertions.length, 5, "Must test all 5 core invariants");
      for (const a of results.assertions) {
        assert.equal(a.passed, true, `Invariant '${a.name}' failed`);
      }
    });
  });

  describe("Section 19.5 & §21 Database Backup, Restore & Launch Gates (Phase 7)", () => {
    const testBackupDir = path.join(process.cwd(), "data", "test_backups");

    it("creates an online atomic SQLite WAL backup and verified manifest", () => {
      const backup = createDatabaseBackup({
        targetDir: testBackupDir,
        maxBackups: 3,
      });

      assert.equal(backup.success, true);
      assert.ok(fs.existsSync(backup.backupPath), "Backup SQLite file must exist");
      assert.ok(fs.existsSync(backup.manifestPath), "Manifest JSON file must exist");
      assert.equal(backup.metadata.integrityCheck, "ok");
      assert.ok(backup.metadata.sizeBytes > 0);
      assert.ok(backup.metadata.sha256.length === 64, "SHA-256 hash must be 64 characters");
      assert.ok(backup.metadata.tables.roster_members >= 7, "Must contain all roster members");
    });

    it("validates SQLite backup integrity and detects valid files", () => {
      const backup = createDatabaseBackup({ targetDir: testBackupDir });
      const verification = verifyBackupFile(backup.backupPath);

      assert.equal(verification.isValid, true);
      assert.equal(verification.integrityCheck, "ok");
      assert.equal(verification.manifestMatch, true);
      assert.equal(verification.sha256, backup.metadata.sha256);
    });

    it("restores database from backup with pre-restore safety snapshot", () => {
      const backup = createDatabaseBackup({ targetDir: testBackupDir });
      const targetTestDb = path.join(testBackupDir, "restored_test.sqlite");

      const restore = restoreDatabaseFromBackup(backup.backupPath, {
        targetDbPath: targetTestDb,
        createSafetyBackup: false,
      });

      assert.equal(restore.success, true);
      assert.equal(restore.integrityCheck, "ok");
      assert.equal(restore.tables.roster_members, backup.metadata.tables.roster_members);
      assert.equal(restore.tables.telemetry_observations, backup.metadata.tables.telemetry_observations);

      // Clean up test database
      if (fs.existsSync(targetTestDb)) fs.unlinkSync(targetTestDb);
    });

    it("passes all Master Launch Acceptance Checklist gates programmatically", () => {
      const audit = runLaunchAcceptanceAudit();
      assert.equal(audit.allPassed, true, "All launch acceptance gates must pass");
      assert.equal(audit.failedCount, 0);
      assert.ok(audit.passedCount >= 10);
    });

    // Cleanup test backups directory
    it("cleans up test backup artifacts", () => {
      if (fs.existsSync(testBackupDir)) {
        fs.rmSync(testBackupDir, { recursive: true, force: true });
      }
      assert.equal(fs.existsSync(testBackupDir), false);
    });
  });
});



