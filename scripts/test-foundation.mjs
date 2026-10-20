import { test, describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeCompetitionRanks } from "../src/lib/leaderboard.ts";
import { checkRateLimit } from "../src/lib/rate-limit.ts";
import { getDb, getAllRosterMembers, registerHmacNonce, verifyAndConsumeNonce } from "../src/lib/db.ts";

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
});
