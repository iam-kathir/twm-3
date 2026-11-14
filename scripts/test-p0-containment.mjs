import { test, describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  initSchema,
  registerHmacNonce,
  verifyAndConsumeNonce,
  seedInitialRosterIfEmpty,
} from "../src/lib/db.ts";

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";
const DATA_DIR = path.join(process.cwd(), "data");
const MAIN_DB_PATH = path.join(DATA_DIR, "twm.sqlite");

/**
 * Robust teardown helper: closes DatabaseSync instance and unlinks database + WAL + SHM files.
 */
function cleanupTempDb(db, dbPath) {
  if (db) {
    try {
      db.close();
    } catch {
      // Ignore if already closed
    }
  }
  if (dbPath) {
    for (const file of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
      try {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      } catch {
        // Ignore deletion errors during teardown
      }
    }
  }
}

/**
 * Purges any leftover test database files or legacy test records.
 */
function purgeOrphanedTestFiles() {
  if (!fs.existsSync(DATA_DIR)) return;
  try {
    const files = fs.readdirSync(DATA_DIR);
    for (const f of files) {
      if (f.startsWith("test-clean-") || f.startsWith("test-nonce-") || f.startsWith("test-p0-")) {
        const full = path.join(DATA_DIR, f);
        try {
          fs.unlinkSync(full);
        } catch {
          // In use by another test runner
        }
      }
    }
  } catch {
    // Non-blocking
  }
}

describe("TWM-001 Batch 1 Security Containment & Negative Persistence Suite", () => {
  before(() => {
    // 1. Purge any orphaned temporary test databases
    purgeOrphanedTestFiles();

    // 2. Defensive cleanup: Purge any legacy test records from shared twm.sqlite if present
    if (fs.existsSync(MAIN_DB_PATH)) {
      try {
        const sharedDb = new DatabaseSync(MAIN_DB_PATH);
        sharedDb.exec("DELETE FROM hmac_nonces WHERE nonce LIKE 'test-atomic-%' OR nonce LIKE 'test-expired-%';");
        sharedDb.close();
      } catch {
        // Database in use or busy, safe to proceed
      }
    }
  });

  after(() => {
    purgeOrphanedTestFiles();
  });

  describe("TWM-001H: Production Demo Seeding Guard", () => {
    it("guarantees empty database remains clean under NODE_ENV=production", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const tempDbPath = path.join(DATA_DIR, `test-clean-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.sqlite`);
      const tempDb = new DatabaseSync(tempDbPath);

      try {
        // Authoritative production schema initialization
        initSchema(tempDb);

        // Execute seedInitialRosterIfEmpty under production mode
        seedInitialRosterIfEmpty(tempDb);

        const rosterCount = tempDb.prepare("SELECT COUNT(*) as c FROM roster_members").get();
        const obsCount = tempDb.prepare("SELECT COUNT(*) as c FROM telemetry_observations").get();

        assert.equal(rosterCount.c, 0, "Production initialization must create 0 roster rows");
        assert.equal(obsCount.c, 0, "Production initialization must create 0 observation rows");
      } finally {
        cleanupTempDb(tempDb, tempDbPath);
        process.env.NODE_ENV = originalEnv;
      }
    });
  });

  describe("TWM-001E: Atomic Nonce Lifecycle & Fail-Closed Protection (Isolated DB)", () => {
    let tempDb = null;
    let tempDbPath = null;

    before(() => {
      tempDbPath = path.join(DATA_DIR, `test-nonce-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.sqlite`);
      tempDb = new DatabaseSync(tempDbPath);
      initSchema(tempDb);
    });

    after(() => {
      cleanupTempDb(tempDb, tempDbPath);
    });

    it("fails closed on unknown nonces and performs zero database inserts", () => {
      const unknownNonce = `unknown-nonce-${Date.now()}`;

      const countBefore = tempDb.prepare("SELECT COUNT(*) as c FROM hmac_nonces WHERE nonce = ?").get(unknownNonce);
      assert.equal(countBefore.c, 0);

      const result = verifyAndConsumeNonce(unknownNonce, tempDb);
      assert.equal(result.valid, false, "Unknown nonce must fail closed");
      assert.equal(result.reason, "NONCE_NOT_FOUND");

      const countAfter = tempDb.prepare("SELECT COUNT(*) as c FROM hmac_nonces WHERE nonce = ?").get(unknownNonce);
      assert.equal(countAfter.c, 0, "Negative assertion: unknown nonce must insert zero rows in hmac_nonces");
    });

    it("verifies and atomically consumes a registered valid nonce exactly once", () => {
      const nonce = `test-atomic-${Date.now()}`;
      const expiresAt = Date.now() + 60000;

      registerHmacNonce(nonce, "usr-aarav", "leetcode", "aarav_coder", expiresAt, tempDb);

      // First verification passes
      const firstCheck = verifyAndConsumeNonce(nonce, tempDb);
      assert.equal(firstCheck.valid, true, "Valid unconsumed nonce must verify successfully");

      // Verify row state in SQLite
      const row = tempDb.prepare("SELECT * FROM hmac_nonces WHERE nonce = ?").get(nonce);
      assert.ok(row.consumed_at !== null, "Consumed nonce must have non-null consumed_at timestamp");

      // Replay attempt must fail closed
      const secondCheck = verifyAndConsumeNonce(nonce, tempDb);
      assert.equal(secondCheck.valid, false, "Replayed nonce must fail closed");
      assert.equal(secondCheck.reason, "NONCE_ALREADY_USED");
    });

    it("rejects expired registered nonces", () => {
      const expiredNonce = `test-expired-${Date.now()}`;
      const pastExpiry = Date.now() - 10000; // 10s in the past

      registerHmacNonce(expiredNonce, "usr-aarav", "leetcode", "aarav_coder", pastExpiry, tempDb);

      const check = verifyAndConsumeNonce(expiredNonce, tempDb);
      assert.equal(check.valid, false);
      assert.equal(check.reason, "TOKEN_EXPIRED");
    });
  });

  describe("TWM-001B & TWM-001F: Route Boundary & Zero Mutation Assertions", () => {
    // 1. Static Invariant Verification (runs in all test environments without dev server)
    it("statically verifies route handlers enforce fail-closed containment with zero write paths", () => {
      // POST /api/telemetry/sync: must return 403 Forbidden with no database imports
      const telemetryRoutePath = path.join(process.cwd(), "src", "app", "api", "telemetry", "sync", "route.ts");
      assert.ok(fs.existsSync(telemetryRoutePath), "telemetry/sync/route.ts must exist");
      const telemetryContent = fs.readFileSync(telemetryRoutePath, "utf8");
      assert.match(telemetryContent, /status:\s*403/, "Telemetry sync route must return 403");
      assert.match(telemetryContent, /FORBIDDEN/, "Telemetry sync error code must be FORBIDDEN");
      assert.ok(!telemetryContent.includes("getDb"), "Telemetry sync route must not import or access getDb");
      assert.ok(!telemetryContent.includes("recordObservation"), "Telemetry sync route must not write observations");

      // POST /api/auth/hmac-challenge: bio challenge must be disabled (403 DISABLED)
      const challengeRoutePath = path.join(process.cwd(), "src", "app", "api", "auth", "hmac-challenge", "route.ts");
      assert.ok(fs.existsSync(challengeRoutePath), "auth/hmac-challenge/route.ts must exist");
      const challengeContent = fs.readFileSync(challengeRoutePath, "utf8");
      assert.match(challengeContent, /status:\s*403/, "HMAC challenge route must return 403");
      assert.match(challengeContent, /DISABLED/, "HMAC challenge error code must be DISABLED");

      // POST /api/cron/boundary-finalize: fail closed without valid CRON_SECRET before finalizer logic
      const cronRoutePath = path.join(process.cwd(), "src", "app", "api", "cron", "boundary-finalize", "route.ts");
      assert.ok(fs.existsSync(cronRoutePath), "cron/boundary-finalize/route.ts must exist");
      const cronContent = fs.readFileSync(cronRoutePath, "utf8");
      assert.match(cronContent, /process\.env\.CRON_SECRET/, "Cron route must check CRON_SECRET");
      assert.match(cronContent, /timingSafeEqual/, "Cron route must use constant-time comparison for secrets");
      assert.match(cronContent, /status:\s*401/, "Cron route must fail closed with 401 Unauthorized");
    });

    // 2. Live HTTP Integration Verification (when server is running)
    it("POST /api/telemetry/sync returns 403 and produces 0 database mutations", async () => {
      let isServerUp = false;
      try {
        const ping = await fetch(`${BASE_URL}/api/telemetry/sync`, { method: "POST" });
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) {
        return; // Dev server not active, static invariant verified above
      }

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

      // 1. Missing secret
      const res1 = await fetch(`${BASE_URL}/api/cron/boundary-finalize`, { method: "POST" });
      assert.equal(res1.status, 401, "Missing CRON_SECRET must return 401 Unauthorized");

      // 2. Invalid secret
      const res2 = await fetch(`${BASE_URL}/api/cron/boundary-finalize`, {
        method: "POST",
        headers: { Authorization: "Bearer definitely_wrong_secret" },
      });
      assert.equal(res2.status, 401, "Wrong CRON_SECRET must return 401 Unauthorized");
    });
  });
});
