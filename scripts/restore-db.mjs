#!/usr/bin/env node

/**
 * TWM 3.1 — Automated SQLite WAL Database Restore Runner
 * Master Plan §19.5 & §21: Documented and tested restore process with integrity pre-check.
 *
 * Usage:
 *   node scripts/restore-db.mjs [path-to-backup.sqlite] [--latest] [--force]
 */

import fs from "node:fs";
import path from "node:path";
import { restoreDatabaseFromBackup, verifyBackupFile } from "../src/lib/backup.ts";

function findLatestBackup(backupDir = "data/backups") {
  if (!fs.existsSync(backupDir)) return null;
  const files = fs.readdirSync(backupDir)
    .filter((f) => f.startsWith("twm-backup-") && f.endsWith(".sqlite"))
    .map((f) => {
      const fullPath = path.join(backupDir, f);
      return { path: fullPath, mtime: fs.statSync(fullPath).mtimeMs };
    })
    .sort((a, b) => b.mtime - a.mtime);

  return files.length > 0 ? files[0].path : null;
}

console.log("══════════════════════════════════════════════════════════════");
console.log("🔄 TWM 3.1 — SQLite WAL Database Restore Engine (§19.5)");
console.log("══════════════════════════════════════════════════════════════");

const args = process.argv.slice(2);
let backupPath = args.find((a) => !a.startsWith("--"));

if (!backupPath || args.includes("--latest")) {
  backupPath = findLatestBackup();
  if (!backupPath) {
    console.error("❌ No backup file specified and no existing backups found in data/backups/");
    console.error("Usage: node scripts/restore-db.mjs <path-to-backup.sqlite>");
    process.exit(1);
  }
}

try {
  console.log(`▶ Verifying source backup file: ${path.resolve(backupPath)}...`);
  const verification = verifyBackupFile(backupPath);

  if (!verification.isValid) {
    console.error(`❌ Source backup validation failed: ${verification.error}`);
    process.exit(1);
  }

  console.log(`✔ Source backup is VALID (SHA-256: ${verification.sha256.slice(0, 16)}..., Size: ${(verification.sizeBytes / 1024).toFixed(2)} KB)`);

  console.log("▶ Creating safety pre-restore snapshot and atomically restoring database...");
  const startTime = Date.now();
  const result = restoreDatabaseFromBackup(backupPath, {
    createSafetyBackup: true,
  });

  const durationMs = Date.now() - startTime;

  console.log(`✔ Database restored successfully in ${durationMs}ms`);
  console.log(`  • Target DB:      ${result.targetDbPath}`);
  if (result.safetyBackupPath) {
    console.log(`  • Safety Backup:  ${result.safetyBackupPath}`);
  }
  console.log(`  • Integrity:      ${result.integrityCheck}`);
  console.log("");
  console.log("📊 Restored Verified Table Counts:");
  console.log(`  • roster_members:         ${result.tables.roster_members} rows`);
  console.log(`  • telemetry_observations: ${result.tables.telemetry_observations} rows`);
  console.log(`  • hmac_nonces:            ${result.tables.hmac_nonces} rows`);
  console.log(`  • disputes:               ${result.tables.disputes} rows`);
  console.log(`  • weekly_standings:       ${result.tables.weekly_standings} rows`);

  console.log("\n✔ DATABASE RESTORE VERIFIED (EXIT 0)");
  process.exit(0);
} catch (err) {
  console.error("\n❌ Database restore failed:");
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
