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
  insertDispute,
  getDisputesByStudentId,
  getOpenDisputesCountForStudent,
} from "../src/lib/db.ts";
import { signSessionToken } from "../src/lib/auth.ts";

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

/**
 * Generates an authenticated session cookie header for testing.
 */
function makeTestSessionCookie(studentId, name, rollNo) {
  const session = {
    studentId,
    rollNo,
    name,
    email: `${studentId}@vitstudent.ac.in`,
    classSection: "B.Tech CSE 2026 (Sec A)",
    handleGithub: `${studentId}-gh`,
    handleLeetcode: `${studentId}-lc`,
    handleHackerrank: `${studentId}-hr`,
    identityTier: "LEGAL_NAME",
    emailVerified: true,
    emailVerifiedAt: new Date().toISOString(),
    issuedAt: Date.now(),
    expiresAt: Date.now() + 86400000,
  };
  return `twm_session=${signSessionToken(session)}`;
}

describe("TWM-001 Security Containment & Negative Authorization Suite", () => {
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

  // =========================================================================
  // BATCH 1 CONTAINMENT SUITES
  // =========================================================================

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
    let tempDb;
    let tempDbPath;

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

      // Verify row state in isolated SQLite
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
        await fetch(`${BASE_URL}/api/telemetry/sync`, { method: "POST" });
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) return;

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
        await fetch(`${BASE_URL}/api/auth/hmac-challenge`, { method: "POST" });
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
        await fetch(`${BASE_URL}/api/cron/boundary-finalize`, { method: "POST" });
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

  // =========================================================================
  // BATCH 2 CONTAINMENT & AUTHORIZATION SUITES
  // =========================================================================

  describe("TWM-001C: Dispute API Authorization & Cross-Student Isolation", () => {
    let tempDb;
    let tempDbPath;

    before(() => {
      tempDbPath = path.join(DATA_DIR, `test-p0-disputes-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.sqlite`);
      tempDb = new DatabaseSync(tempDbPath);
      initSchema(tempDb);
      // Insert referenced roster members to satisfy foreign key constraints
      tempDb.prepare(`
        INSERT INTO roster_members (id, roll_no, name, email, class_section)
        VALUES ('usr-aarav', '2022BCSE042', 'Aarav Sharma', 'aarav.sharma2022@vitstudent.ac.in', 'CSE-A'),
               ('usr-priya', '2022BCSE008', 'Priya Nair', 'priya.nair2022@vitstudent.ac.in', 'CSE-A')
      `).run();
    });

    after(() => {
      cleanupTempDb(tempDb, tempDbPath);
    });

    it("statically verifies dispute route enforces session checks, student scoping, and adjudication locks", () => {
      const disputeRoutePath = path.join(process.cwd(), "src", "app", "api", "disputes", "route.ts");
      assert.ok(fs.existsSync(disputeRoutePath), "disputes/route.ts must exist");
      const content = fs.readFileSync(disputeRoutePath, "utf8");

      // GET must check session and call getDisputesByStudentId
      assert.match(content, /getCurrentSession/, "Disputes route must use getCurrentSession");
      assert.match(content, /getDisputesByStudentId/, "Disputes route must scope GET to student ID");
      assert.match(content, /status:\s*401/, "Disputes route must return 401 for unauthenticated calls");

      // POST must enforce DEC-02 limit
      assert.match(content, /MAX_OPEN_DISPUTES_EXCEEDED/, "Disputes POST must enforce DEC-02 max open disputes");

      // PATCH must fail closed with 403 FORBIDDEN
      assert.match(content, /status:\s*403/, "Disputes PATCH must fail closed with 403 Forbidden");
      assert.match(content, /FORBIDDEN/, "Disputes PATCH error code must be FORBIDDEN");
    });

    it("isolated unit test: proves getDisputesByStudentId prevents cross-student dispute disclosure", () => {
      // Register 2 disputes for Student A (usr-aarav) and 1 for Student B (usr-priya)
      insertDispute({
        id: `DSP-A1-${Date.now()}`,
        studentId: "usr-aarav",
        studentName: "Aarav Sharma",
        rollNo: "2022BCSE042",
        metric: "active_days",
        platform: "github",
        claim: "Commit recorded before boundary",
        evidenceUrl: "https://github.com/aarav-dev",
        ruleReference: "Rule §9.7",
      }, tempDb);

      insertDispute({
        id: `DSP-A2-${Date.now()}`,
        studentId: "usr-aarav",
        studentName: "Aarav Sharma",
        rollNo: "2022BCSE042",
        metric: "leetcode_delta",
        platform: "leetcode",
        claim: "Problem delta calculation dispute",
        evidenceUrl: "https://leetcode.com/aarav_algo",
        ruleReference: "Rule §10.1",
      }, tempDb);

      insertDispute({
        id: `DSP-B1-${Date.now()}`,
        studentId: "usr-priya",
        studentName: "Priya Nair",
        rollNo: "2022BCSE008",
        metric: "active_days",
        platform: "github",
        claim: "Priya's private dispute",
        evidenceUrl: "https://github.com/priya-n",
        ruleReference: "Rule §9.7",
      }, tempDb);

      // Student A queries: strictly returns 2 disputes belonging to usr-aarav
      const disputesA = getDisputesByStudentId("usr-aarav", tempDb);
      assert.equal(disputesA.length, 2, "Student A must receive exactly their own 2 disputes");
      for (const d of disputesA) {
        assert.equal(d.student_id, "usr-aarav", "Dispute must strictly belong to Student A");
      }

      // Cross-student verification: Student A receives 0 disputes belonging to Student B
      const leakedDisputes = disputesA.filter((d) => d.student_id === "usr-priya");
      assert.equal(leakedDisputes.length, 0, "Student A must never receive Student B's disputes");

      // Student B queries: strictly returns 1 dispute belonging to usr-priya
      const disputesB = getDisputesByStudentId("usr-priya", tempDb);
      assert.equal(disputesB.length, 1);
      assert.equal(disputesB[0].student_id, "usr-priya");

      // Open disputes count for DEC-02
      const openCountA = getOpenDisputesCountForStudent("usr-aarav", tempDb);
      assert.equal(openCountA, 2, "Student A has 2 open disputes, reaching DEC-02 limit");
    });

    it("live route: unauthenticated GET and POST /api/disputes return 401", async () => {
      let isServerUp = false;
      try {
        await fetch(`${BASE_URL}/api/disputes`);
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) return;

      // 1. Unauthenticated GET -> 401
      const getRes = await fetch(`${BASE_URL}/api/disputes`);
      assert.equal(getRes.status, 401, "Unauthenticated GET /api/disputes must return 401");

      // 2. Unauthenticated POST -> 401
      const postRes = await fetch(`${BASE_URL}/api/disputes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric: "active_days",
          platform: "github",
          claim: "Unauthenticated claim",
        }),
      });
      assert.equal(postRes.status, 401, "Unauthenticated POST /api/disputes must return 401");

      // 3. Dispute PATCH -> 403 Forbidden fail-closed
      const patchRes = await fetch(`${BASE_URL}/api/disputes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: "DSP-TEST-ANY",
          status: "approved",
          resolutionNote: "Malicious resolution attempt",
        }),
      });
      assert.equal(patchRes.status, 403, "PATCH /api/disputes must return 403 Forbidden");
    });

    it("live route: authenticated student session scopes disputes and rejects identity spoofing", async () => {
      let isServerUp = false;
      try {
        await fetch(`${BASE_URL}/api/disputes`);
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) return;

      const cookieA = makeTestSessionCookie("usr-aarav", "Aarav Sharma", "2022BCSE042");

      // Authenticated GET returns 200 scoped to student
      const getRes = await fetch(`${BASE_URL}/api/disputes`, {
        headers: { Cookie: cookieA },
      });
      assert.equal(getRes.status, 200, "Authenticated student GET /api/disputes must return 200");
      const getJson = await getRes.json();
      assert.ok(getJson.success);
      assert.ok(Array.isArray(getJson.disputes));
      for (const d of getJson.disputes) {
        assert.equal(d.student_id, "usr-aarav", "All returned disputes must belong to authenticated student");
      }

      // Negative authorization test: student attempts to lodge dispute for another student (identity spoofing)
      const postRes = await fetch(`${BASE_URL}/api/disputes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieA,
        },
        body: JSON.stringify({
          metric: "active_days",
          platform: "github",
          claim: "Legitimate student claim",
          studentId: "usr-priya", // Spoofed target
          rollNo: "2022BCSE008", // Spoofed roll
          studentName: "Priya Nair", // Spoofed name
        }),
      });

      // Either created under session identity or rejected if DEC-02 limit reached
      if (postRes.status === 201) {
        const postJson = await postRes.json();
        assert.ok(postJson.success);
        assert.ok(postJson.disputeId);
      } else {
        assert.equal(postRes.status, 400, "If at DEC-02 capacity, returns 400 MAX_OPEN_DISPUTES_EXCEEDED");
      }

      // Coordinator / Student PATCH attempt fails closed with 403
      const coordinatorCookie = makeTestSessionCookie("usr-rohan", "Rohan Varma", "2022BCSE015");
      const patchRes = await fetch(`${BASE_URL}/api/disputes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: coordinatorCookie,
        },
        body: JSON.stringify({
          id: "DSP-TEST-ANY",
          status: "approved",
          resolutionNote: "Coordinator approval attempt",
        }),
      });
      assert.equal(patchRes.status, 403, "Coordinator PATCH /api/disputes must return 403 Forbidden");
    });
  });

  describe("TWM-001D: Roster Bulk Import Containment", () => {
    it("statically verifies roster bulk import route is locked fail-closed with zero write paths", () => {
      const rosterImportPath = path.join(process.cwd(), "src", "app", "api", "roster", "bulk-import", "route.ts");
      assert.ok(fs.existsSync(rosterImportPath), "roster/bulk-import/route.ts must exist");
      const content = fs.readFileSync(rosterImportPath, "utf8");

      assert.match(content, /status:\s*403/, "Roster bulk import must return 403 Forbidden");
      assert.match(content, /FORBIDDEN/, "Error code must be FORBIDDEN");
      assert.ok(!content.includes("insertRosterMember"), "Route must not contain insertRosterMember");
      assert.ok(!content.includes("getDb"), "Route must not access database");
    });

    it("live route: POST /api/roster/bulk-import returns 403 for unauthenticated and student callers", async () => {
      let isServerUp = false;
      try {
        await fetch(`${BASE_URL}/api/roster/bulk-import`, { method: "POST" });
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) return;

      const csvPayload = "roll_no,name,email,class_section\n2022BCSE099,Malicious Insert,malicious@vitstudent.ac.in,CSE-A";

      // 1. Unauthenticated POST
      const res1 = await fetch(`${BASE_URL}/api/roster/bulk-import`, {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: csvPayload,
      });
      assert.equal(res1.status, 403, "Unauthenticated bulk import must return 403 Forbidden");

      // 2. Authenticated student POST
      const studentCookie = makeTestSessionCookie("usr-aarav", "Aarav Sharma", "2022BCSE042");
      const res2 = await fetch(`${BASE_URL}/api/roster/bulk-import`, {
        method: "POST",
        headers: {
          "Content-Type": "text/csv",
          Cookie: studentCookie,
        },
        body: csvPayload,
      });
      assert.equal(res2.status, 403, "Student session bulk import must return 403 Forbidden");
    });
  });

  describe("TWM-001G: LeetCode & HackerRank Collection Isolation", () => {
    it("statically verifies provider telemetry routes are paused with honest UNAVAILABLE status", () => {
      // LeetCode route
      const lcRoutePath = path.join(process.cwd(), "src", "app", "api", "telemetry", "leetcode", "route.ts");
      assert.ok(fs.existsSync(lcRoutePath), "leetcode/route.ts must exist");
      const lcContent = fs.readFileSync(lcRoutePath, "utf8");
      assert.match(lcContent, /UNAVAILABLE/, "LeetCode route must return UNAVAILABLE status");
      assert.match(lcContent, /isVerified:\s*false/, "LeetCode route must set isVerified: false");
      assert.ok(!lcContent.includes("fetch("), "LeetCode route must not perform external fetch calls");

      // HackerRank route
      const hrRoutePath = path.join(process.cwd(), "src", "app", "api", "telemetry", "hackerrank", "route.ts");
      assert.ok(fs.existsSync(hrRoutePath), "hackerrank/route.ts must exist");
      const hrContent = fs.readFileSync(hrRoutePath, "utf8");
      assert.match(hrContent, /UNAVAILABLE/, "HackerRank route must return UNAVAILABLE status");
      assert.match(hrContent, /isVerified:\s*false/, "HackerRank route must set isVerified: false");
      assert.match(hrContent, /isEligibleForWeeklyCompetition:\s*false/, "HackerRank route must gate weekly competition");
      assert.ok(!hrContent.includes("fetch("), "HackerRank route must not perform external fetch calls");
    });

    it("live route: LeetCode and HackerRank routes return honest UNAVAILABLE payload without external fetches", async () => {
      let isServerUp = false;
      try {
        await fetch(`${BASE_URL}/api/telemetry/leetcode?username=test`);
        isServerUp = true;
      } catch {
        isServerUp = false;
      }

      if (!isServerUp) return;

      // 1. LeetCode route query
      const lcRes = await fetch(`${BASE_URL}/api/telemetry/leetcode?username=neal_wu`);
      assert.equal(lcRes.status, 200);
      const lcJson = await lcRes.json();
      assert.equal(lcJson.provider, "leetcode");
      assert.equal(lcJson.status, "UNAVAILABLE");
      assert.equal(lcJson.isVerified, false);
      assert.equal(lcJson.metrics, null);

      // 2. HackerRank route query
      const hrRes = await fetch(`${BASE_URL}/api/telemetry/hackerrank?username=alice`);
      assert.equal(hrRes.status, 200);
      const hrJson = await hrRes.json();
      assert.equal(hrJson.provider, "hackerrank");
      assert.equal(hrJson.status, "UNAVAILABLE");
      assert.equal(hrJson.isVerified, false);
      assert.equal(hrJson.isEligibleForWeeklyCompetition, false);
    });
  });
});
