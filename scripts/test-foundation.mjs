import { test, describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeCompetitionRanks } from "../src/lib/leaderboard.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";
import { getDb, getAllRosterMembers, insertRosterMember, getRosterQuorumStats, registerHmacNonce, verifyAndConsumeNonce, insertDispute, resolveDisputeInDb, getAllDisputes, getWeeklyStandingsFromDb } from "../src/lib/db.ts";
import { executeWeeklyFinalization } from "../src/lib/finalizer.ts";

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

      // Attempting duplicate roll number must throw SQLITE_CONSTRAINT
      assert.throws(() => {
        insertRosterMember({
          rollNo: testRollNo,
          name: "Duplicate Roll",
          email: `duplicate.${uniqueSuffix}@college.edu`,
        });
      });
    });
  });
});

