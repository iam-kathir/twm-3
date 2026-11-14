/**
-- ==============================================================================
-- TWM 3.1 — Phase 1 PostgreSQL Migration & Authoritative Server-Side RBAC Test Suite
-- ==============================================================================
*/

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import {
  checkPermission,
  assertPermission,
  verifyCohortAccess,
  verifyCoordinatorGrant,
  AuthorizationError,
  SessionManager,
  MemorySessionStore,
  AuditLogger,
  MemoryAuditStore,
  computeAuditEntryHash,
  verifyAuditChain,
  AUDIT_GENESIS_HASH,
  FORBIDDEN_COORDINATOR_PERMISSIONS,
  validateCoordinatorGrantPermissions,
} from "../src/lib/rbac/index.ts";

// ------------------------------------------------------------------------------
// Test Group 1: PostgreSQL DDL Migration Files Verification
// ------------------------------------------------------------------------------
test("1. PostgreSQL DDL Migration Files Invariants", async (t) => {
  await t.test("verifies existence and structure of migration 0001_core_schema.sql", () => {
    const filePath = path.join(process.cwd(), "migrations", "0001_core_schema.sql");
    assert.ok(fs.existsSync(filePath), "0001_core_schema.sql must exist");
    const sql = fs.readFileSync(filePath, "utf-8");

    // Table definitions
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS users"), "Defines users table");
    assert.ok(sql.includes("roll_no VARCHAR(64) UNIQUE NOT NULL"), "users has roll_no unique");
    assert.ok(sql.includes("email VARCHAR(255) UNIQUE NOT NULL"), "users has email unique");
    assert.ok(sql.includes("is_active BOOLEAN NOT NULL DEFAULT TRUE"), "users has is_active flag");
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS cohorts"), "Defines cohorts table");
    assert.ok(sql.includes("code VARCHAR(64) UNIQUE NOT NULL"), "cohorts has unique code");
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS cohort_memberships"), "Defines cohort_memberships table");
    assert.ok(sql.includes("uq_cohort_memberships_user_cohort"), "cohort_memberships enforces unique user-cohort");
  });

  await t.test("verifies existence and structure of migration 0002_rbac_and_grants.sql", () => {
    const filePath = path.join(process.cwd(), "migrations", "0002_rbac_and_grants.sql");
    assert.ok(fs.existsSync(filePath), "0002_rbac_and_grants.sql must exist");
    const sql = fs.readFileSync(filePath, "utf-8");

    // Roles and assignments
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS roles"), "Defines roles catalog table");
    assert.ok(sql.includes("'student'"), "Includes student role");
    assert.ok(sql.includes("'coordinator'"), "Includes coordinator role");
    assert.ok(sql.includes("'faculty'"), "Includes faculty role");
    assert.ok(sql.includes("'platform_admin'"), "Includes platform_admin role");
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS user_roles"), "Defines user_roles table");
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS faculty_cohort_assignments"), "Defines faculty_cohort_assignments");
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS coordinator_grants"), "Defines coordinator_grants table");

    // Invariant: Coordinator Triage-Only Boundary in DDL
    assert.ok(sql.includes("chk_coordinator_triage_boundary"), "Enforces triage boundary check constraint");
    assert.ok(sql.includes("FINALIZE_DISPUTE"), "Prohibits FINALIZE_DISPUTE for coordinators");
    assert.ok(sql.includes("IMPORT_COHORT_ROSTER"), "Prohibits IMPORT_COHORT_ROSTER for coordinators");
    assert.ok(sql.includes("chk_grant_time_window"), "Enforces time window constraint (expires_at > starts_at)");
  });

  await t.test("verifies existence and structure of migration 0003_sessions_and_audit.sql", () => {
    const filePath = path.join(process.cwd(), "migrations", "0003_sessions_and_audit.sql");
    assert.ok(fs.existsSync(filePath), "0003_sessions_and_audit.sql must exist");
    const sql = fs.readFileSync(filePath, "utf-8");

    // Sessions and Audit Logs
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS sessions"), "Defines sessions table");
    assert.ok(sql.includes("session_token_hash VARCHAR(64) UNIQUE NOT NULL"), "Uses SHA-256 token hash");
    assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS audit_logs"), "Defines audit_logs table");
    assert.ok(sql.includes("previous_log_hash VARCHAR(64) NOT NULL"), "Enforces previous_log_hash for chaining");
    assert.ok(sql.includes("entry_hash VARCHAR(64) NOT NULL"), "Enforces entry_hash for tamper evidence");
    assert.ok(sql.includes("trg_audit_logs_prevent_modification"), "Enforces append-only trigger guard");
  });
});

// ------------------------------------------------------------------------------
// Test Group 2: Authoritative Server-Side RBAC Engine
// ------------------------------------------------------------------------------
test("2. Authoritative Server-Side RBAC Authorization Engine", async (t) => {
  const studentActor = {
    id: "usr_student_01",
    rollNo: "CS2601",
    name: "Aarav Sharma",
    email: "aarav@geca.ac.in",
    roles: ["student"],
    primaryRole: "student",
    isActive: true,
  };

  const coordinatorActor = {
    id: "usr_coord_01",
    rollNo: "CS2602",
    name: "Rohan Verma",
    email: "rohan@geca.ac.in",
    roles: ["student", "coordinator"],
    primaryRole: "coordinator",
    isActive: true,
  };

  const facultyActor = {
    id: "usr_faculty_01",
    name: "Dr. K. Sharma",
    email: "faculty@geca.ac.in",
    roles: ["faculty"],
    primaryRole: "faculty",
    assignedCohorts: ["cohort_cs_2026_a"],
    isActive: true,
  };

  const adminActor = {
    id: "usr_admin_01",
    name: "System Admin",
    email: "admin@twm.internal",
    roles: ["platform_admin"],
    primaryRole: "platform_admin",
    isActive: true,
  };

  await t.test("Student Role: strictly owns dispute operations and fails closed on admin actions", () => {
    // Can view own disputes
    const ownView = checkPermission(studentActor, "VIEW_OWN_DISPUTES", {
      studentId: "usr_student_01",
    });
    assert.equal(ownView.granted, true);
    assert.equal(ownView.code, "ALLOWED");

    // Cross-student dispute access is rejected
    const crossView = checkPermission(studentActor, "VIEW_OWN_DISPUTES", {
      studentId: "usr_other_student",
    });
    assert.equal(crossView.granted, false);
    assert.equal(crossView.code, "NOT_DISPUTE_OWNER");

    // Cannot lodge dispute for another student
    const crossLodge = checkPermission(studentActor, "LODGE_DISPUTE", {
      studentId: "usr_other_student",
    });
    assert.equal(crossLodge.granted, false);
    assert.equal(crossLodge.code, "NOT_DISPUTE_OWNER");

    // Administrative permissions fail closed
    const importAttempt = checkPermission(studentActor, "IMPORT_COHORT_ROSTER", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(importAttempt.granted, false);
    assert.equal(importAttempt.code, "FORBIDDEN");

    const finalizeAttempt = checkPermission(studentActor, "FINALIZE_DISPUTE", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(finalizeAttempt.granted, false);
    assert.equal(finalizeAttempt.code, "FORBIDDEN");
  });

  await t.test("Coordinator Role: Enforces Coordinator Triage-Only Boundary (FINALIZE_DISPUTE & IMPORT barred)", () => {
    // Coordinators can NEVER be granted FINALIZE_DISPUTE
    const finalizeDecision = checkPermission(coordinatorActor, "FINALIZE_DISPUTE", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(finalizeDecision.granted, false);
    assert.equal(finalizeDecision.code, "COORDINATOR_BOUNDARY_VIOLATION");

    // Coordinators can NEVER be granted IMPORT_COHORT_ROSTER
    const importDecision = checkPermission(coordinatorActor, "IMPORT_COHORT_ROSTER", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(importDecision.granted, false);
    assert.equal(importDecision.code, "COORDINATOR_BOUNDARY_VIOLATION");

    // Coordinators cannot grant coordinator role
    const grantRoleDecision = checkPermission(coordinatorActor, "GRANT_COORDINATOR_ROLE", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(grantRoleDecision.granted, false);
    assert.equal(grantRoleDecision.code, "COORDINATOR_BOUNDARY_VIOLATION");

    // Static validator rejects forbidden permissions
    const validation = validateCoordinatorGrantPermissions([
      "ASSIST_DISPUTE_TRIAGE",
      "FINALIZE_DISPUTE",
      "IMPORT_COHORT_ROSTER",
    ]);
    assert.equal(validation.valid, false);
    assert.deepEqual(validation.forbidden, ["FINALIZE_DISPUTE", "IMPORT_COHORT_ROSTER"]);
  });

  await t.test("Coordinator Role: Enforces Time-Bounded and Revocable Grants", () => {
    const now = Date.now();
    const activeGrant = {
      id: "grant_01",
      coordinatorUserId: "usr_coord_01",
      cohortId: "cohort_cs_2026_a",
      grantedBy: "usr_faculty_01",
      permissions: ["VIEW_COHORT_ROSTER", "ASSIST_DISPUTE_TRIAGE"],
      startsAt: new Date(now - 3600000).toISOString(), // 1h ago
      expiresAt: new Date(now + 86400000).toISOString(), // in 1 day
      revokedAt: null,
      createdAt: new Date(now - 3600000).toISOString(),
    };

    // Valid grant: allowed
    const validCheck = checkPermission(coordinatorActor, "ASSIST_DISPUTE_TRIAGE", {
      cohortId: "cohort_cs_2026_a",
      grants: [activeGrant],
      now,
    });
    assert.equal(validCheck.granted, true);
    assert.equal(validCheck.code, "ALLOWED");

    // Missing cohort context fails with MISSING_COHORT_CONTEXT
    const missingCohort = checkPermission(coordinatorActor, "ASSIST_DISPUTE_TRIAGE", {
      grants: [activeGrant],
      now,
    });
    assert.equal(missingCohort.granted, false);
    assert.equal(missingCohort.code, "MISSING_COHORT_CONTEXT");

    // Expired grant fails immediately
    const expiredGrant = {
      ...activeGrant,
      id: "grant_expired",
      startsAt: new Date(now - 7200000).toISOString(),
      expiresAt: new Date(now - 1000).toISOString(), // Expired 1 second ago
    };
    const expiredCheck = checkPermission(coordinatorActor, "ASSIST_DISPUTE_TRIAGE", {
      cohortId: "cohort_cs_2026_a",
      grants: [expiredGrant],
      now,
    });
    assert.equal(expiredCheck.granted, false);
    assert.equal(expiredCheck.code, "GRANT_EXPIRED");

    // Revoked grant fails immediately
    const revokedGrant = {
      ...activeGrant,
      id: "grant_revoked",
      revokedAt: new Date(now - 500).toISOString(),
      revocationReason: "Semester rotation ended early",
    };
    const revokedCheck = checkPermission(coordinatorActor, "ASSIST_DISPUTE_TRIAGE", {
      cohortId: "cohort_cs_2026_a",
      grants: [revokedGrant],
      now,
    });
    assert.equal(revokedCheck.granted, false);
    assert.equal(revokedCheck.code, "GRANT_REVOKED");

    // Not yet active grant fails with GRANT_NOT_STARTED
    const futureGrant = {
      ...activeGrant,
      id: "grant_future",
      startsAt: new Date(now + 3600000).toISOString(), // Starts in 1h
      expiresAt: new Date(now + 86400000).toISOString(),
    };
    const futureCheck = checkPermission(coordinatorActor, "ASSIST_DISPUTE_TRIAGE", {
      cohortId: "cohort_cs_2026_a",
      grants: [futureGrant],
      now,
    });
    assert.equal(futureCheck.granted, false);
    assert.equal(futureCheck.code, "GRANT_NOT_STARTED");
  });

  await t.test("Faculty Role: Enforces Explicit Faculty Cohort Boundary", () => {
    // Authorized for assigned cohort
    const assignedCheck = checkPermission(facultyActor, "FINALIZE_DISPUTE", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(assignedCheck.granted, true);
    assert.equal(assignedCheck.code, "ALLOWED");

    const rosterImportCheck = checkPermission(facultyActor, "IMPORT_COHORT_ROSTER", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(rosterImportCheck.granted, true);
    assert.equal(rosterImportCheck.code, "ALLOWED");

    // Denied for unassigned cohort (Cross-cohort boundary protection)
    const unassignedCheck = checkPermission(facultyActor, "FINALIZE_DISPUTE", {
      cohortId: "cohort_it_2025_b",
    });
    assert.equal(unassignedCheck.granted, false);
    assert.equal(unassignedCheck.code, "COHORT_NOT_ASSIGNED");

    // Missing cohort context fails with MISSING_COHORT_CONTEXT
    const missingCohort = checkPermission(facultyActor, "FINALIZE_DISPUTE");
    assert.equal(missingCohort.granted, false);
    assert.equal(missingCohort.code, "MISSING_COHORT_CONTEXT");

    // verifyCohortAccess helper reflects explicit cohort assignment
    assert.equal(verifyCohortAccess(facultyActor, "cohort_cs_2026_a"), true);
    assert.equal(verifyCohortAccess(facultyActor, "cohort_it_2025_b"), false);
  });

  await t.test("Platform Admin Role: Global system-wide authorization across all cohorts", () => {
    const adminAction1 = checkPermission(adminActor, "FINALIZE_DISPUTE", {
      cohortId: "cohort_any_batch",
    });
    assert.equal(adminAction1.granted, true);
    assert.equal(adminAction1.code, "ALLOWED");

    const adminAction2 = checkPermission(adminActor, "IMPORT_COHORT_ROSTER", {
      cohortId: "cohort_it_2025_b",
    });
    assert.equal(adminAction2.granted, true);
    assert.equal(adminAction2.code, "ALLOWED");

    assert.equal(verifyCohortAccess(adminActor, "arbitrary_cohort_id"), true);
  });

  await t.test("Deactivated User Account: Fails closed immediately", () => {
    const inactiveActor = {
      ...facultyActor,
      isActive: false,
    };
    const decision = checkPermission(inactiveActor, "FINALIZE_DISPUTE", {
      cohortId: "cohort_cs_2026_a",
    });
    assert.equal(decision.granted, false);
    assert.equal(decision.code, "USER_INACTIVE");
  });

  await t.test("assertPermission throws AuthorizationError on denial", () => {
    assert.throws(
      () => {
        assertPermission(studentActor, "FINALIZE_DISPUTE", {
          cohortId: "cohort_cs_2026_a",
        });
      },
      (err) => {
        assert.ok(err instanceof AuthorizationError);
        assert.equal(err.decision.code, "FORBIDDEN");
        return true;
      }
    );
  });
});

// ------------------------------------------------------------------------------
// Test Group 3: Database-Backed Session Manager
// ------------------------------------------------------------------------------
test("3. Database-Backed Session Manager (Tokens, Hashing, Rotation, Revocation)", async (t) => {
  const store = new MemorySessionStore();
  const sessionManager = new SessionManager(store, { defaultTtlSeconds: 3600 });

  await t.test("generates 256-bit cryptographically secure token and stores only SHA-256 hash", async () => {
    const { rawToken, session } = await sessionManager.createSession("usr_student_01", {
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    });

    assert.ok(rawToken.startsWith("twm_s_"), "Token starts with secure prefix");
    assert.ok(rawToken.length > 40, "Token has high entropy (>256 bits)");

    // Raw token is NEVER equal to the stored hash
    assert.notEqual(rawToken, session.sessionTokenHash);

    // Verify hash matches SHA-256 calculation
    const expectedHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    assert.equal(session.sessionTokenHash, expectedHash);
    assert.equal(session.userId, "usr_student_01");
    assert.equal(session.ipAddress, "192.168.1.100");
  });

  await t.test("validates active session and rejects expired or tampered tokens", async () => {
    const { rawToken } = await sessionManager.createSession("usr_student_01", {
      ttlSeconds: 3600,
    });

    const result = await sessionManager.validateSession(rawToken);
    assert.equal(result.valid, true);
    assert.equal(result.session?.userId, "usr_student_01");

    // Tampered token fails lookup
    const tamperedResult = await sessionManager.validateSession(rawToken + "x");
    assert.equal(tamperedResult.valid, false);
    assert.equal(tamperedResult.reason, "Session not found.");

    // Expired session fails validation
    const futureDate = new Date(Date.now() + 7200000); // 2h in future
    const expiredResult = await sessionManager.validateSession(rawToken, futureDate);
    assert.equal(expiredResult.valid, false);
    assert.ok(expiredResult.reason?.includes("Session expired"));
  });

  await t.test("session rotation marks old session rotated/revoked and issues new token", async () => {
    const { rawToken: initialToken } = await sessionManager.createSession("usr_student_01");

    const rotation = await sessionManager.rotateSession(initialToken, {
      ipAddress: "10.0.0.1",
    });
    assert.equal(rotation.success, true);
    assert.ok(rotation.newRawToken);
    assert.notEqual(rotation.newRawToken, initialToken);

    // Old token must now fail validation because it was rotated/revoked
    const oldValidation = await sessionManager.validateSession(initialToken);
    assert.equal(oldValidation.valid, false);
    assert.ok(oldValidation.reason?.includes("revoked"));

    // New token validates successfully
    const newValidation = await sessionManager.validateSession(rotation.newRawToken);
    assert.equal(newValidation.valid, true);
    assert.equal(newValidation.session?.userId, "usr_student_01");
    assert.equal(newValidation.session?.ipAddress, "10.0.0.1");
  });

  await t.test("session revocation invalidates token immediately", async () => {
    const { rawToken } = await sessionManager.createSession("usr_coord_01");

    const revoked = await sessionManager.revokeSession(rawToken, "User clicked logout");
    assert.equal(revoked, true);

    const validation = await sessionManager.validateSession(rawToken);
    assert.equal(validation.valid, false);
    assert.ok(validation.reason?.includes("revoked"));
  });

  await t.test("revokeAllUserSessions revokes all active sessions for a user", async () => {
    const s1 = await sessionManager.createSession("usr_multi_session");
    const s2 = await sessionManager.createSession("usr_multi_session");

    const count = await sessionManager.revokeAllUserSessions("usr_multi_session", "Security password reset");
    assert.equal(count, 2);

    assert.equal((await sessionManager.validateSession(s1.rawToken)).valid, false);
    assert.equal((await sessionManager.validateSession(s2.rawToken)).valid, false);
  });
});

// ------------------------------------------------------------------------------
// Test Group 4: Tamper-Evident Structured Audit Logging System
// ------------------------------------------------------------------------------
test("4. Tamper-Evident Structured Audit Logging System", async (t) => {
  const auditStore = new MemoryAuditStore();
  const logger = new AuditLogger(auditStore);

  await t.test("creates cryptographically chained audit log entries", async () => {
    const e1 = await logger.log({
      actorId: "usr_faculty_01",
      actorRole: "faculty",
      action: "GRANT_COORDINATOR_ROLE",
      targetType: "user",
      targetId: "usr_coord_01",
      cohortId: "cohort_cs_2026_a",
      payload: { permissions: ["VIEW_COHORT_ROSTER", "ASSIST_DISPUTE_TRIAGE"] },
    });

    assert.equal(e1.previousLogHash, AUDIT_GENESIS_HASH);
    assert.ok(e1.entryHash.length === 64, "entryHash is 64-char SHA-256");

    const e2 = await logger.log({
      actorId: "usr_coord_01",
      actorRole: "coordinator",
      action: "ASSIST_DISPUTE_TRIAGE",
      targetType: "dispute",
      targetId: "disp_901",
      cohortId: "cohort_cs_2026_a",
      payload: { triageCategory: "ELIGIBLE_DELTA", preliminaryNote: "Observational timestamps verified." },
    });

    // e2 links back to e1's hash
    assert.equal(e2.previousLogHash, e1.entryHash);

    const e3 = await logger.log({
      actorId: "usr_faculty_01",
      actorRole: "faculty",
      action: "FINALIZE_DISPUTE",
      targetType: "dispute",
      targetId: "disp_901",
      cohortId: "cohort_cs_2026_a",
      payload: { resolution: "ACCEPTED", adjustment: 5 },
    });

    // e3 links back to e2's hash
    assert.equal(e3.previousLogHash, e2.entryHash);

    // Verify unbroken chain passes verification
    const integrity = await logger.verifyLedgerIntegrity();
    assert.equal(integrity.valid, true);
  });

  await t.test("detects tampering when payload content is modified", async () => {
    const all = await auditStore.getAll();
    assert.ok(all.length >= 3);

    // Clone entries and tamper with entry 1 payload
    const tamperedEntries = all.map((item) => ({ ...item, payload: { ...item.payload } }));
    tamperedEntries[1].payload = { ...tamperedEntries[1].payload, maliciousInjection: true };

    const check = verifyAuditChain(tamperedEntries);
    assert.equal(check.valid, false);
    assert.equal(check.brokenAtIndex, 1);
    assert.ok(check.reason?.includes("Hash mismatch"));
  });

  await t.test("detects tampering when an entry is deleted from the middle of the chain", async () => {
    const all = await auditStore.getAll();
    assert.ok(all.length >= 3);

    // Delete middle entry
    const droppedChain = [all[0], all[2]];

    const check = verifyAuditChain(droppedChain);
    assert.equal(check.valid, false);
    assert.equal(check.brokenAtIndex, 1);
    assert.ok(check.reason?.includes("Broken chain link"));
  });

  await t.test("logAuthorizationDecision records structured decision audit trails", async () => {
    const actor = {
      id: "usr_coord_01",
      name: "Rohan Verma",
      email: "rohan@geca.ac.in",
      roles: ["coordinator"],
      primaryRole: "coordinator",
    };

    const decision = checkPermission(actor, "FINALIZE_DISPUTE", {
      cohortId: "cohort_cs_2026_a",
    });

    const auditEntry = await logger.logAuthorizationDecision(actor, "FINALIZE_DISPUTE", decision, {
      cohortId: "cohort_cs_2026_a",
      ipAddress: "127.0.0.1",
    });

    assert.equal(auditEntry.action, "AUTHZ_DENIED:FINALIZE_DISPUTE");
    assert.equal(auditEntry.targetType, "permission");
    assert.equal(auditEntry.targetId, "FINALIZE_DISPUTE");
    assert.equal(auditEntry.payload.granted, false);
    assert.equal(auditEntry.payload.code, "COORDINATOR_BOUNDARY_VIOLATION");
    assert.equal(auditEntry.ipAddress, "127.0.0.1");
  });
});
