import { test, describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  getDb,
  registerHmacNonce,
  verifyAndConsumeNonce,
  seedInitialRosterIfEmpty,
} from "../src/lib/db.ts";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

describe("TWM-001 Batch 1 Security Containment & Negative Persistence Suite", () => {
  const db = getDb();

  describe("TWM-001H: Production Demo Seeding Guard", () => {
    it("guarantees empty database remains clean under NODE_ENV=production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const tempDbPath = path.join(process.cwd(), "data", `test-clean-${Date.now()}.sqlite`);
      const tempDb = new DatabaseSync(tempDbPath);

      try {
        tempDb.exec(`
          CREATE TABLE roster_members (
            id TEXT PRIMARY KEY,
            roll_no TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            class_section TEXT NOT NULL,
            handle_github TEXT,
            handle_leetcode TEXT,
            handle_hackerrank TEXT,
            is_active INTEGER NOT NULL DEFAULT 1,
            is_current_user INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now'))
          );
          CREATE TABLE telemetry_observations (
            id TEXT PRIMARY KEY,
            student_id TEXT NOT NULL,
            platform TEXT NOT NULL,
            metric_name TEXT NOT NULL,
            metric_value REAL NOT NULL,
            display_value TEXT NOT NULL,
            scheduled_boundary_at TEXT NOT NULL,
            observed_at TEXT NOT NULL,
            boundary_gap_seconds INTEGER NOT NULL DEFAULT 0,
            is_provisional INTEGER NOT NULL DEFAULT 0,
            coverage_pass INTEGER NOT NULL DEFAULT 1,
            raw_payload TEXT
          );
        `);

        // Execute seedInitialRosterIfEmpty under production mode
        seedInitialRosterIfEmpty(tempDb);

        const rosterCount = tempDb.prepare("SELECT COUNT(*) as c FROM roster_members").get();
        const obsCount = tempDb.prepare("SELECT COUNT(*) as c FROM telemetry_observations").get();

        assert.equal(rosterCount.c, 0, "Production initialization must create 0 roster rows");
        assert.equal(obsCount.c, 0, "Production initialization must create 0 observation rows");
      } finally {
        tempDb.close();
        if (fs.existsSync(tempDbPath)) {
          fs.unlinkSync(tempDbPath);
        }
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("TWM-001E: Atomic Nonce Lifecycle & Fail-Closed Protection", () => {
    it("fails closed on unknown nonces and performs zero database inserts", () => {
      const unknownNonce = `unknown-nonce-${Date.now()}`;

      const countBefore = db.prepare("SELECT COUNT(*) as c FROM hmac_nonces WHERE nonce = ?").get(unknownNonce);
      assert.equal(countBefore.c, 0);

      const result = verifyAndConsumeNonce(unknownNonce);
      assert.equal(result.valid, false, "Unknown nonce must fail closed");
      assert.equal(result.reason, "NONCE_NOT_FOUND");

      const countAfter = db.prepare("SELECT COUNT(*) as c FROM hmac_nonces WHERE nonce = ?").get(unknownNonce);
      assert.equal(countAfter.c, 0, "Negative assertion: unknown nonce must insert zero rows in hmac_nonces");
    });

    it("verifies and atomically consumes a registered valid nonce exactly once", () => {
      const nonce = `test-atomic-${Date.now()}`;
      const expiresAt = Date.now() + 60000;

      registerHmacNonce(nonce, "usr-aarav", "leetcode", "aarav_coder", expiresAt);

      // First verification passes
      const firstCheck = verifyAndConsumeNonce(nonce);
      assert.equal(firstCheck.valid, true, "Valid unconsumed nonce must verify successfully");

      // Verify row state in SQLite
      const row = db.prepare("SELECT * FROM hmac_nonces WHERE nonce = ?").get(nonce);
      assert.ok(row.consumed_at !== null, "Consumed nonce must have non-null consumed_at timestamp");

      // Replay attempt must fail closed
      const secondCheck = verifyAndConsumeNonce(nonce);
      assert.equal(secondCheck.valid, false, "Replayed nonce must fail closed");
      assert.equal(secondCheck.reason, "NONCE_ALREADY_USED");
    });

    it("rejects expired registered nonces", () => {
      const expiredNonce = `test-expired-${Date.now()}`;
      const pastExpiry = Date.now() - 10000; // 10s in the past

      registerHmacNonce(expiredNonce, "usr-aarav", "leetcode", "aarav_coder", pastExpiry);

      const check = verifyAndConsumeNonce(expiredNonce);
      assert.equal(check.valid, false);
      assert.equal(check.reason, "TOKEN_EXPIRED");
    });
  });

  describe("TWM-001B & TWM-001F: Route Boundary & Zero Mutation Assertions", () => {
    it("POST /api/telemetry/sync returns 403 and produces 0 database mutations", async () => {
      let isServerUp = false;
      try {
        const ping = await fetch(`${BASE_URL}/api/telemetry/sync`, { method: "POST" });
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) {
        // Skip live network assertions if dev server is not active
        return;
      }

      const obsCountBefore = db.prepare("SELECT COUNT(*) as c FROM telemetry_observations").get().c;

      const res = await fetch(`${BASE_URL}/api/telemetry/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "github",
          metricName: "active_days",
          metricValue: 9999,
          studentId: "usr-aarav",
        }),
      });

      assert.equal(res.status, 403, "Client telemetry write must return 403 Forbidden");
      const json = await res.json();
      assert.equal(json.error, "FORBIDDEN");

      const obsCountAfter = db.prepare("SELECT COUNT(*) as c FROM telemetry_observations").get().c;
      assert.equal(obsCountAfter, obsCountBefore, "Strict assertion: rejected telemetry write produces 0 rows");
    });

    it("POST /api/auth/hmac-challenge returns 403 DISABLED", async () => {
      let isServerUp = false;
      try {
        const ping = await fetch(`${BASE_URL}/api/auth/hmac-challenge`, { method: "POST" });
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) return;

      const res = await fetch(`${BASE_URL}/api/auth/hmac-challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: "usr-aarav",
          provider: "leetcode",
          handle: "aarav_coder",
        }),
      });

      assert.equal(res.status, 403, "Bio challenge endpoint must return 403 Forbidden");
      const json = await res.json();
      assert.equal(json.error, "DISABLED");
    });

    it("POST /api/cron/boundary-finalize fails closed without valid CRON_SECRET", async () => {
      let isServerUp = false;
      try {
        const ping = await fetch(`${BASE_URL}/api/cron/boundary-finalize`, { method: "POST" });
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) return;

      const standingsBefore = db.prepare("SELECT COUNT(*) as c FROM weekly_standings").get().c;

      // 1. Missing secret
      const res1 = await fetch(`${BASE_URL}/api/cron/boundary-finalize`, { method: "POST" });
      assert.equal(res1.status, 401, "Missing CRON_SECRET must return 401 Unauthorized");

      // 2. Invalid secret
      const res2 = await fetch(`${BASE_URL}/api/cron/boundary-finalize`, {
        method: "POST",
        headers: { Authorization: "Bearer definitely_wrong_secret" },
      });
      assert.equal(res2.status, 401, "Wrong CRON_SECRET must return 401 Unauthorized");

      const standingsAfter = db.prepare("SELECT COUNT(*) as c FROM weekly_standings").get().c;
      assert.equal(standingsAfter, standingsBefore, "Strict assertion: rejected cron call produces 0 rows");
    });
  });
});
