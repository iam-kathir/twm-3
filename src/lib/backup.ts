import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export interface BackupMetadata {
  id: string;
  timestamp: string;
  filename: string;
  sha256: string;
  sizeBytes: number;
  sourceDb: string;
  tables: {
    roster_members: number;
    telemetry_observations: number;
    hmac_nonces: number;
    disputes: number;
    weekly_standings: number;
  };
  integrityCheck: string;
}

export interface BackupResult {
  success: boolean;
  backupPath: string;
  manifestPath: string;
  metadata: BackupMetadata;
  prunedCount: number;
  error?: string;
}

export interface RestoreResult {
  success: boolean;
  sourceBackupPath: string;
  targetDbPath: string;
  safetyBackupPath?: string;
  restoredAt: string;
  integrityCheck: string;
  tables: {
    roster_members: number;
    telemetry_observations: number;
    hmac_nonces: number;
    disputes: number;
    weekly_standings: number;
  };
  error?: string;
}

const DEFAULT_DATA_DIR = path.join(process.cwd(), "data");
const DEFAULT_DB_FILE = path.join(DEFAULT_DATA_DIR, "twm.sqlite");
const DEFAULT_BACKUP_DIR = path.join(DEFAULT_DATA_DIR, "backups");

/**
 * Computes SHA-256 hash of a file synchronously.
 */
export function computeFileSha256(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(fileBuffer).digest("hex");
}

/**
 * Formats a date into a filesystem-safe ISO timestamp string (UTC): YYYY-MM-DDTHHmmssZ
 */
export function formatBackupTimestamp(date: Date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-").replace("T", "_");
}

/**
 * Safely creates an atomic, consistent online SQLite backup using WAL checkpoint and VACUUM INTO.
 * Master Plan §19.5 & §21 compliance: Tested, verified single-file snapshot.
 */
export function createDatabaseBackup(options: {
  targetDir?: string;
  dbPath?: string;
  maxBackups?: number;
} = {}): BackupResult {
  const dbPath = options.dbPath || DEFAULT_DB_FILE;
  const targetDir = options.targetDir || DEFAULT_BACKUP_DIR;
  const maxBackups = options.maxBackups ?? 7;

  if (!fs.existsSync(dbPath)) {
    throw new Error(`Source database file does not exist at: ${dbPath}`);
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const timestamp = formatBackupTimestamp();
  const backupFilename = `twm-backup-${timestamp}.sqlite`;
  const backupPath = path.join(targetDir, backupFilename);
  const manifestFilename = `twm-backup-${timestamp}.meta.json`;
  const manifestPath = path.join(targetDir, manifestFilename);

  // 1. Open source database to flush WAL and VACUUM INTO destination
  const sourceDb = new DatabaseSync(dbPath);
  try {
    // Flush WAL to disk
    sourceDb.exec("PRAGMA wal_checkpoint(TRUNCATE);");

    // Standard SQLite safe online vacuum backup
    // Escape single quotes in backupPath for SQL statement
    const escapedPath = backupPath.replace(/'/g, "''");
    sourceDb.exec(`VACUUM INTO '${escapedPath}';`);
  } finally {
    sourceDb.close();
  }

  // 2. Open newly created backup and verify integrity + collect table statistics
  const backupDb = new DatabaseSync(backupPath);
  let integrity = "unknown";
  let counts = {
    roster_members: 0,
    telemetry_observations: 0,
    hmac_nonces: 0,
    disputes: 0,
    weekly_standings: 0,
  };

  try {
    const integrityRes = backupDb.prepare("PRAGMA integrity_check;").all() as Array<{ integrity_check: string }>;
    integrity = integrityRes.length > 0 ? integrityRes[0].integrity_check : "failed";

    // Safe table count helper
    const getCount = (table: string): number => {
      try {
        const row = backupDb.prepare(`SELECT COUNT(*) as count FROM ${table};`).get() as { count: number } | undefined;
        return row?.count ?? 0;
      } catch {
        return 0;
      }
    };

    counts = {
      roster_members: getCount("roster_members"),
      telemetry_observations: getCount("telemetry_observations"),
      hmac_nonces: getCount("hmac_nonces"),
      disputes: getCount("disputes"),
      weekly_standings: getCount("weekly_standings"),
    };
  } finally {
    backupDb.close();
  }

  if (integrity !== "ok") {
    throw new Error(`Backup integrity check failed with status: ${integrity}`);
  }

  // 3. Compute SHA-256 and file stats
  const stat = fs.statSync(backupPath);
  const sha256 = computeFileSha256(backupPath);

  const metadata: BackupMetadata = {
    id: `twm-bck-${timestamp}`,
    timestamp: new Date().toISOString(),
    filename: backupFilename,
    sha256,
    sizeBytes: stat.size,
    sourceDb: path.resolve(dbPath),
    tables: counts,
    integrityCheck: integrity,
  };

  fs.writeFileSync(manifestPath, JSON.stringify(metadata, null, 2), "utf-8");

  // 4. Prune older backups if exceeding maxBackups
  let prunedCount = 0;
  if (maxBackups > 0) {
    prunedCount = pruneOldBackups(targetDir, maxBackups);
  }

  return {
    success: true,
    backupPath,
    manifestPath,
    metadata,
    prunedCount,
  };
}

/**
 * Prunes backups in target directory keeping only the latest N backups.
 */
export function pruneOldBackups(backupDir: string, retainCount: number): number {
  if (!fs.existsSync(backupDir)) return 0;

  const files = fs.readdirSync(backupDir);
  const sqliteBackups = files
    .filter((f) => f.startsWith("twm-backup-") && f.endsWith(".sqlite"))
    .map((f) => {
      const fullPath = path.join(backupDir, f);
      const stat = fs.statSync(fullPath);
      return { file: f, path: fullPath, mtime: stat.mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime); // Newest first

  if (sqliteBackups.length <= retainCount) {
    return 0;
  }

  const toRemove = sqliteBackups.slice(retainCount);
  let removed = 0;

  for (const item of toRemove) {
    try {
      fs.unlinkSync(item.path);
      // Also remove corresponding manifest if exists
      const metaPath = item.path.replace(/\.sqlite$/, ".meta.json");
      if (fs.existsSync(metaPath)) {
        fs.unlinkSync(metaPath);
      }
      removed++;
    } catch {
      // Ignore deletion errors on busy files
    }
  }

  return removed;
}

/**
 * Validates SQLite magic header bytes and runs PRAGMA integrity_check.
 */
export function verifyBackupFile(backupPath: string): {
  isValid: boolean;
  sha256: string;
  sizeBytes: number;
  integrityCheck: string;
  manifestMatch?: boolean;
  error?: string;
} {
  if (!fs.existsSync(backupPath)) {
    return {
      isValid: false,
      sha256: "",
      sizeBytes: 0,
      integrityCheck: "file_not_found",
      error: `File not found: ${backupPath}`,
    };
  }

  // 1. Check SQLite magic header (first 16 bytes: "SQLite format 3\0")
  const fd = fs.openSync(backupPath, "r");
  const headerBuf = Buffer.alloc(16);
  fs.readSync(fd, headerBuf, 0, 16, 0);
  fs.closeSync(fd);

  const headerStr = headerBuf.toString("utf-8");
  if (!headerStr.startsWith("SQLite format 3")) {
    return {
      isValid: false,
      sha256: "",
      sizeBytes: 0,
      integrityCheck: "invalid_header",
      error: "Invalid SQLite file header",
    };
  }

  const sha256 = computeFileSha256(backupPath);
  const stat = fs.statSync(backupPath);

  // 2. Check PRAGMA integrity_check
  let integrity = "unknown";
  try {
    const db = new DatabaseSync(backupPath);
    try {
      const res = db.prepare("PRAGMA integrity_check;").all() as Array<{ integrity_check: string }>;
      integrity = res.length > 0 ? res[0].integrity_check : "failed";
    } finally {
      db.close();
    }
  } catch (err: unknown) {
    return {
      isValid: false,
      sha256,
      sizeBytes: stat.size,
      integrityCheck: "corrupt",
      error: err instanceof Error ? err.message : String(err),
    };
  }

  // 3. Check manifest match if present
  let manifestMatch: boolean | undefined = undefined;
  const metaPath = backupPath.replace(/\.sqlite$/, ".meta.json");
  if (fs.existsSync(metaPath)) {
    try {
      const meta: BackupMetadata = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      manifestMatch = meta.sha256 === sha256;
    } catch {
      manifestMatch = false;
    }
  }

  const isValid = integrity === "ok" && (manifestMatch === undefined || manifestMatch === true);

  return {
    isValid,
    sha256,
    sizeBytes: stat.size,
    integrityCheck: integrity,
    manifestMatch,
    error: isValid ? undefined : `Integrity: ${integrity}, Manifest Match: ${manifestMatch}`,
  };
}

/**
 * Restores a SQLite database from a verified backup.
 * Master Plan §19.5: Tested restore workflow with pre-restore safety snapshot.
 */
export function restoreDatabaseFromBackup(
  backupPath: string,
  options: {
    targetDbPath?: string;
    createSafetyBackup?: boolean;
  } = {}
): RestoreResult {
  const targetDbPath = options.targetDbPath || DEFAULT_DB_FILE;
  const createSafety = options.createSafetyBackup ?? true;

  // 1. Verify source backup before doing anything
  const verification = verifyBackupFile(backupPath);
  if (!verification.isValid) {
    throw new Error(`Cannot restore from invalid or corrupt backup (${backupPath}): ${verification.error}`);
  }

  let safetyBackupPath: string | undefined = undefined;

  // 2. Create safety snapshot of active database before overwrite
  if (createSafety && fs.existsSync(targetDbPath)) {
    const targetDir = path.dirname(targetDbPath);
    const safetyFilename = `twm-pre-restore-${formatBackupTimestamp()}.sqlite`;
    safetyBackupPath = path.join(targetDir, safetyFilename);

    try {
      const activeDb = new DatabaseSync(targetDbPath);
      try {
        activeDb.exec("PRAGMA wal_checkpoint(TRUNCATE);");
        const escaped = safetyBackupPath.replace(/'/g, "''");
        activeDb.exec(`VACUUM INTO '${escaped}';`);
      } finally {
        activeDb.close();
      }
    } catch {
      // Fallback to direct synchronous copy
      fs.copyFileSync(targetDbPath, safetyBackupPath);
    }
  }

  // 3. Remove existing target files (.sqlite, .sqlite-wal, .sqlite-shm) to ensure clean restoration
  const targetWal = `${targetDbPath}-wal`;
  const targetShm = `${targetDbPath}-shm`;

  if (fs.existsSync(targetWal)) {
    try { fs.unlinkSync(targetWal); } catch {}
  }
  if (fs.existsSync(targetShm)) {
    try { fs.unlinkSync(targetShm); } catch {}
  }

  // Copy verified backup file into target location
  fs.copyFileSync(backupPath, targetDbPath);

  // 4. Verify restored database integrity and collect table counts
  const restoredDb = new DatabaseSync(targetDbPath);
  let integrity = "unknown";
  let counts = {
    roster_members: 0,
    telemetry_observations: 0,
    hmac_nonces: 0,
    disputes: 0,
    weekly_standings: 0,
  };

  try {
    restoredDb.exec("PRAGMA journal_mode = WAL;");
    restoredDb.exec("PRAGMA foreign_keys = ON;");

    const integrityRes = restoredDb.prepare("PRAGMA integrity_check;").all() as Array<{ integrity_check: string }>;
    integrity = integrityRes.length > 0 ? integrityRes[0].integrity_check : "failed";

    const getCount = (table: string): number => {
      try {
        const row = restoredDb.prepare(`SELECT COUNT(*) as count FROM ${table};`).get() as { count: number } | undefined;
        return row?.count ?? 0;
      } catch {
        return 0;
      }
    };

    counts = {
      roster_members: getCount("roster_members"),
      telemetry_observations: getCount("telemetry_observations"),
      hmac_nonces: getCount("hmac_nonces"),
      disputes: getCount("disputes"),
      weekly_standings: getCount("weekly_standings"),
    };
  } finally {
    restoredDb.close();
  }

  if (integrity !== "ok") {
    throw new Error(`Restored database failed integrity check: ${integrity}`);
  }

  return {
    success: true,
    sourceBackupPath: path.resolve(backupPath),
    targetDbPath: path.resolve(targetDbPath),
    safetyBackupPath: safetyBackupPath ? path.resolve(safetyBackupPath) : undefined,
    restoredAt: new Date().toISOString(),
    integrityCheck: integrity,
    tables: counts,
  };
}
