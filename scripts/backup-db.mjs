#!/usr/bin/env node

/**
 * TWM 3.1 — Automated SQLite WAL Database Backup Runner
 * Master Plan §19.5 & §21: Zero-data-loss online database snapshotting.
 *
 * Usage:
 *   node scripts/backup-db.mjs [--prune] [--max=7] [--dir=data/backups]
 */

import path from "node:path";
import { createDatabaseBackup } from "../src/lib/backup.ts";

function parseArgs() {
  const args = process.argv.slice(2);
  let maxBackups = 7;
  let targetDir = undefined;

  for (const arg of args) {
    if (arg.startsWith("--max=")) {
      maxBackups = parseInt(arg.split("=")[1], 10) || 7;
    } else if (arg.startsWith("--dir=")) {
      targetDir = arg.split("=")[1];
    }
  }

  return { maxBackups, targetDir };
}

console.log("══════════════════════════════════════════════════════════════");
console.log("💾 TWM 3.1 — SQLite WAL Online Backup Engine (§19.5)");
console.log("══════════════════════════════════════════════════════════════");

try {
  const { maxBackups, targetDir } = parseArgs();
  const startTime = Date.now();

  console.log("▶ Checkpointing WAL and initiating atomic VACUUM INTO snapshot...");
  const result = createDatabaseBackup({
    maxBackups,
    targetDir,
  });

  const durationMs = Date.now() - startTime;
  const meta = result.metadata;

  console.log(`✔ Backup created successfully in ${durationMs}ms`);
  console.log(`  • File:        ${meta.filename}`);
  console.log(`  • Size:        ${(meta.sizeBytes / 1024).toFixed(2)} KB (${meta.sizeBytes} bytes)`);
  console.log(`  • SHA-256:     ${meta.sha256}`);
  console.log(`  • Integrity:   ${meta.integrityCheck}`);
  console.log(`  • Manifest:    ${path.basename(result.manifestPath)}`);
  console.log("");
  console.log("📊 Preserved Snapshot Tables:");
  console.log(`  • roster_members:         ${meta.tables.roster_members} rows`);
  console.log(`  • telemetry_observations: ${meta.tables.telemetry_observations} rows`);
  console.log(`  • hmac_nonces:            ${meta.tables.hmac_nonces} rows`);
  console.log(`  • disputes:               ${meta.tables.disputes} rows`);
  console.log(`  • weekly_standings:       ${meta.tables.weekly_standings} rows`);

  if (result.prunedCount > 0) {
    console.log(`\n🧹 Retention policy applied: Pruned ${result.prunedCount} older snapshot(s) (retaining latest ${maxBackups}).`);
  }

  console.log("\n✔ DATABASE BACKUP VERIFIED (EXIT 0)");
  process.exit(0);
} catch (err) {
  console.error("\n❌ Database backup failed:");
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
}
