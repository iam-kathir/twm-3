import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

let dbInstance: DatabaseSync | null = null;

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "twm.sqlite");

/**
 * Ensures data directory exists and returns singleton DatabaseSync instance
 */
export function getDb(): DatabaseSync {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_FILE);

  // Enable WAL mode for high concurrent throughput & foreign keys
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  initSchema(db);
  seedInitialRosterIfEmpty(db);

  dbInstance = db;
  return dbInstance;
}

function initSchema(db: DatabaseSync): void {
  db.exec(`
    -- 1. Class Roster Members (§3.2, §3.3)
    CREATE TABLE IF NOT EXISTS roster_members (
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

    -- 2. Telemetry Observations (§9.1, §9.7 boundary rule)
    CREATE TABLE IF NOT EXISTS telemetry_observations (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      platform TEXT NOT NULL, -- 'github' | 'leetcode' | 'hackerrank'
      metric_name TEXT NOT NULL,
      metric_value REAL NOT NULL,
      display_value TEXT NOT NULL,
      scheduled_boundary_at TEXT,
      observed_at TEXT NOT NULL,
      boundary_gap_seconds INTEGER,
      is_provisional INTEGER NOT NULL DEFAULT 0,
      coverage_pass INTEGER NOT NULL DEFAULT 1,
      raw_payload TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES roster_members(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_obs_student_platform 
      ON telemetry_observations (student_id, platform, observed_at DESC);

    -- 3. Nonce Invalidation Store for HMAC Tokens (§6.2 replay prevention)
    CREATE TABLE IF NOT EXISTS hmac_nonces (
      nonce TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      provider TEXT NOT NULL,
      handle TEXT NOT NULL,
      created_at INTEGER NOT NULL, -- unix ms
      expires_at INTEGER NOT NULL, -- unix ms
      consumed_at TEXT
    );

    -- 4. Telemetry Disputes Ledger (§10.1)
    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      roll_no TEXT NOT NULL,
      metric TEXT NOT NULL,
      platform TEXT NOT NULL,
      claim TEXT NOT NULL,
      evidence_url TEXT NOT NULL,
      rule_reference TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
      reviewed_by TEXT,
      reviewed_at TEXT,
      resolution_note TEXT,
      submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      FOREIGN KEY (student_id) REFERENCES roster_members(id) ON DELETE CASCADE
    );

    -- 5. Finalized Weekly Competition Standings (§9.1, §9.7)
    CREATE TABLE IF NOT EXISTS weekly_standings (
      id TEXT PRIMARY KEY,
      week_number INTEGER NOT NULL,
      year INTEGER NOT NULL,
      platform TEXT NOT NULL, -- 'github' | 'leetcode'
      student_id TEXT NOT NULL,
      rank INTEGER NOT NULL,
      score_value REAL NOT NULL,
      display_value TEXT NOT NULL,
      is_tied INTEGER NOT NULL DEFAULT 0,
      boundary_observed_at TEXT NOT NULL,
      boundary_gap_seconds INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'Finalized', -- 'Finalized' | 'Provisional'
      finalized_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES roster_members(id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX IF NOT EXISTS idx_standing_week_platform_student
      ON weekly_standings (week_number, year, platform, student_id);
  `);

  // Idempotent column migrations for existing databases
  try { db.exec("ALTER TABLE disputes ADD COLUMN reviewed_by TEXT;"); } catch {}
  try { db.exec("ALTER TABLE disputes ADD COLUMN reviewed_at TEXT;"); } catch {}
}

function seedInitialRosterIfEmpty(db: DatabaseSync): void {
  const countRow = db.prepare("SELECT COUNT(*) as count FROM roster_members").get() as { count: number };
  if (countRow && countRow.count > 0) {
    return;
  }

  const insertMember = db.prepare(`
    INSERT INTO roster_members (id, roll_no, name, email, class_section, handle_github, handle_leetcode, handle_hackerrank, is_active, is_current_user)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  const initialClass = [
    {
      id: "usr-aarav",
      roll_no: "2022BCSE042",
      name: "Aarav Sharma",
      email: "aarav.sharma2022@vitstudent.ac.in",
      class_section: "B.Tech CSE 2026 (Sec A)",
      handle_github: "aarav-dev",
      handle_leetcode: "aarav_algo",
      handle_hackerrank: "aarav_code",
      is_current_user: 1
    },
    {
      id: "usr-rohan",
      roll_no: "2022BCSE015",
      name: "Rohan Varma",
      email: "rohan.varma2022@vitstudent.ac.in",
      class_section: "B.Tech CSE 2026 (Sec A)",
      handle_github: "rohan-code",
      handle_leetcode: "rohan-code",
      handle_hackerrank: "rohan-code",
      is_current_user: 0
    },
    {
      id: "usr-priya",
      roll_no: "2022BCSE008",
      name: "Priya Nair",
      email: "priya.nair2022@vitstudent.ac.in",
      class_section: "B.Tech CSE 2026 (Sec A)",
      handle_github: "priya-n",
      handle_leetcode: "priya-n",
      handle_hackerrank: "priya-n",
      is_current_user: 0
    },
    {
      id: "usr-aditya",
      roll_no: "2022BCSE019",
      name: "Aditya Kumar",
      email: "aditya.k2022@vitstudent.ac.in",
      class_section: "B.Tech CSE 2026 (Sec A)",
      handle_github: "aditya-k",
      handle_leetcode: "aditya-k",
      handle_hackerrank: "aditya-k",
      is_current_user: 0
    },
    {
      id: "usr-sneha",
      roll_no: "2022BCSE071",
      name: "Sneha Patel",
      email: "sneha.p2022@vitstudent.ac.in",
      class_section: "B.Tech CSE 2026 (Sec A)",
      handle_github: "sneha-p",
      handle_leetcode: "sneha-p",
      handle_hackerrank: "sneha-p",
      is_current_user: 0
    },
    {
      id: "usr-vikram",
      roll_no: "2022BCSE033",
      name: "Vikram Singh",
      email: "vikram.s2022@vitstudent.ac.in",
      class_section: "B.Tech CSE 2026 (Sec A)",
      handle_github: "vikram-s",
      handle_leetcode: "vikram-s",
      handle_hackerrank: "vikram-s",
      is_current_user: 0
    },
    {
      id: "usr-ananya",
      roll_no: "2022BCSE058",
      name: "Ananya Roy",
      email: "ananya.r2022@vitstudent.ac.in",
      class_section: "B.Tech CSE 2026 (Sec A)",
      handle_github: "ananya-r",
      handle_leetcode: "ananya-r",
      handle_hackerrank: "ananya-r",
      is_current_user: 0
    }
  ];

  for (const m of initialClass) {
    insertMember.run(
      m.id,
      m.roll_no,
      m.name,
      m.email,
      m.class_section,
      m.handle_github,
      m.handle_leetcode,
      m.handle_hackerrank,
      m.is_current_user
    );
  }

  // Pre-seed default baseline observations for the class
  const insertObservation = db.prepare(`
    INSERT INTO telemetry_observations (
      id, student_id, platform, metric_name, metric_value, display_value, 
      scheduled_boundary_at, observed_at, boundary_gap_seconds, is_provisional, coverage_pass, raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialObservations = [
    { id: "obs-1", student_id: "usr-rohan", platform: "github", metric: "active_days", val: 7, disp: "7 / 7 Days", prov: 0, cov: 1 },
    { id: "obs-2", student_id: "usr-priya", platform: "github", metric: "active_days", val: 6, disp: "6 / 7 Days", prov: 0, cov: 1 },
    { id: "obs-3", student_id: "usr-aditya", platform: "github", metric: "active_days", val: 5, disp: "5 / 7 Days", prov: 0, cov: 1 },
    { id: "obs-4", student_id: "usr-sneha", platform: "github", metric: "active_days", val: 4, disp: "4 / 7 Days", prov: 1, cov: 0 },
    { id: "obs-5", student_id: "usr-vikram", platform: "github", metric: "active_days", val: 5, disp: "5 / 7 Days", prov: 0, cov: 1 },
    { id: "obs-6", student_id: "usr-ananya", platform: "github", metric: "active_days", val: 6, disp: "6 / 7 Days", prov: 0, cov: 1 },
    { id: "obs-7", student_id: "usr-aarav", platform: "github", metric: "active_days", val: 6, disp: "6 / 7 Days", prov: 0, cov: 1 },
  ];

  const now = new Date().toISOString();
  for (const o of initialObservations) {
    insertObservation.run(
      o.id,
      o.student_id,
      o.platform,
      o.metric,
      o.val,
      o.disp,
      "2026-10-18T23:59:59.000Z",
      now,
      120,
      o.prov,
      o.cov,
      JSON.stringify({ note: "Initial baseline observation seed" })
    );
  }
}

// ---------------------------------------------------------------------------
// Typed DB Accessor Methods
// ---------------------------------------------------------------------------

export interface RosterMemberRow {
  id: string;
  roll_no: string;
  name: string;
  email: string;
  class_section: string;
  handle_github: string | null;
  handle_leetcode: string | null;
  handle_hackerrank: string | null;
  is_active: number;
  is_current_user: number;
  created_at: string;
}

export function getAllRosterMembers(): RosterMemberRow[] {
  const db = getDb();
  return db.prepare("SELECT * FROM roster_members WHERE is_active = 1 ORDER BY roll_no ASC").all() as unknown as RosterMemberRow[];
}

export function getCurrentUserMember(): RosterMemberRow | undefined {
  const db = getDb();
  return db.prepare("SELECT * FROM roster_members WHERE is_current_user = 1 LIMIT 1").get() as unknown as RosterMemberRow | undefined;
}

export interface ObservationRecord {
  id: string;
  studentId: string;
  platform: "github" | "leetcode" | "hackerrank";
  metricName: string;
  metricValue: number;
  displayValue: string;
  scheduledBoundaryAt?: string;
  observedAt: string;
  boundaryGapSeconds?: number;
  isProvisional?: boolean;
  coveragePass?: boolean;
  rawPayload?: Record<string, unknown>;
}

export function recordObservation(obs: ObservationRecord): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO telemetry_observations (
      id, student_id, platform, metric_name, metric_value, display_value,
      scheduled_boundary_at, observed_at, boundary_gap_seconds, is_provisional,
      coverage_pass, raw_payload
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    obs.id,
    obs.studentId,
    obs.platform,
    obs.metricName,
    obs.metricValue,
    obs.displayValue,
    obs.scheduledBoundaryAt || null,
    obs.observedAt,
    obs.boundaryGapSeconds ?? null,
    obs.isProvisional ? 1 : 0,
    obs.coveragePass !== false ? 1 : 0,
    obs.rawPayload ? JSON.stringify(obs.rawPayload) : null
  );
}

export function getLatestPlatformObservations(platform: string): Record<string, unknown>[] {
  const db = getDb();
  return db.prepare(`
    SELECT obs.*, m.name, m.roll_no, m.is_current_user, m.handle_github, m.handle_leetcode, m.handle_hackerrank
    FROM telemetry_observations obs
    JOIN roster_members m ON obs.student_id = m.id
    WHERE obs.platform = ? AND obs.id IN (
      SELECT id FROM telemetry_observations
      WHERE platform = ?
      GROUP BY student_id
      HAVING MAX(observed_at)
    )
    ORDER BY obs.metric_value DESC
  `).all(platform, platform);
}

// Nonce Storage (§6.2 replay prevention)
export function registerHmacNonce(nonce: string, userId: string, provider: string, handle: string, expiresAt: number): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO hmac_nonces (nonce, user_id, provider, handle, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(nonce, userId, provider, handle, Date.now(), expiresAt);
}

export function verifyAndConsumeNonce(nonce: string): { valid: boolean; reason?: string } {
  const db = getDb();
  const row = db.prepare("SELECT * FROM hmac_nonces WHERE nonce = ?").get(nonce) as {
    nonce: string;
    expires_at: number;
    consumed_at: string | null;
  } | undefined;

  if (!row) {
    // If not found in registry, record it as consumed now so it cannot be re-used
    const insert = db.prepare(`
      INSERT INTO hmac_nonces (nonce, user_id, provider, handle, created_at, expires_at, consumed_at)
      VALUES (?, 'unknown', 'unknown', 'unknown', ?, ?, datetime('now'))
    `);
    insert.run(nonce, Date.now(), Date.now() + 900000);
    return { valid: true };
  }

  if (row.consumed_at) {
    return { valid: false, reason: "NONCE_ALREADY_USED" };
  }

  if (Date.now() > row.expires_at) {
    return { valid: false, reason: "TOKEN_EXPIRED" };
  }

  // Mark consumed
  db.prepare("UPDATE hmac_nonces SET consumed_at = datetime('now') WHERE nonce = ?").run(nonce);
  return { valid: true };
}

// ---------------------------------------------------------------------------
// Disputes Accessors (§10.1)
// ---------------------------------------------------------------------------

export interface DisputeRow {
  id: string;
  student_id: string;
  student_name: string;
  roll_no: string;
  metric: string;
  platform: string;
  claim: string;
  evidence_url: string;
  rule_reference: string;
  status: "pending" | "approved" | "rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution_note: string | null;
  submitted_at: string;
  resolved_at: string | null;
}

export function getAllDisputes(): DisputeRow[] {
  const db = getDb();
  return db.prepare("SELECT * FROM disputes ORDER BY submitted_at DESC").all() as unknown as DisputeRow[];
}

export function insertDispute(d: {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  metric: string;
  platform: string;
  claim: string;
  evidenceUrl: string;
  ruleReference: string;
}): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO disputes (id, student_id, student_name, roll_no, metric, platform, claim, evidence_url, rule_reference, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `);
  stmt.run(d.id, d.studentId, d.studentName, d.rollNo, d.metric, d.platform, d.claim, d.evidenceUrl, d.ruleReference);
}

export function resolveDisputeInDb(id: string, status: "approved" | "rejected", note: string, reviewer: string): void {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE disputes 
    SET status = ?, resolution_note = ?, reviewed_by = ?, reviewed_at = ?, resolved_at = ?
    WHERE id = ?
  `).run(status, note, reviewer, now, now, id);
}

// ---------------------------------------------------------------------------
// Weekly Finalized Standings (§9.1, §9.7)
// ---------------------------------------------------------------------------

export interface WeeklyStandingRow {
  id: string;
  week_number: number;
  year: number;
  platform: "github" | "leetcode";
  student_id: string;
  student_name?: string;
  rank: number;
  score_value: number;
  display_value: string;
  is_tied: number;
  boundary_observed_at: string;
  boundary_gap_seconds: number;
  status: "Finalized" | "Provisional";
  finalized_at: string;
}

export function saveWeeklyFinalizedStandings(rows: WeeklyStandingRow[]): void {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO weekly_standings (
      id, week_number, year, platform, student_id, rank, score_value, display_value,
      is_tied, boundary_observed_at, boundary_gap_seconds, status, finalized_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const r of rows) {
    stmt.run(
      r.id,
      r.week_number,
      r.year,
      r.platform,
      r.student_id,
      r.rank,
      r.score_value,
      r.display_value,
      r.is_tied,
      r.boundary_observed_at,
      r.boundary_gap_seconds,
      r.status
    );
  }
}

export function getWeeklyStandingsFromDb(weekNumber: number, year: number, platform: string): (WeeklyStandingRow & { name: string; roll_no: string; handle_github: string; handle_leetcode: string })[] {
  const db = getDb();
  return db.prepare(`
    SELECT s.*, m.name, m.roll_no, m.handle_github, m.handle_leetcode
    FROM weekly_standings s
    JOIN roster_members m ON s.student_id = m.id
    WHERE s.week_number = ? AND s.year = ? AND s.platform = ?
    ORDER BY s.rank ASC, m.name ASC
  `).all(weekNumber, year, platform) as unknown as (WeeklyStandingRow & { name: string; roll_no: string; handle_github: string; handle_leetcode: string })[];
}

