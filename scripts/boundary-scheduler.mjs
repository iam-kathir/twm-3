#!/usr/bin/env node

/**
 * TWM 3.1 — Boundary Background Scheduler & Telemetry Auditor
 * 
 * Implements:
 * - Rule §9.1: Sunday 23:59:59 IST weekly boundary constraint.
 * - Rule §9.7: 3-hour observation gap check (boundary_gap <= 3h).
 * - Rule §3.3: Quorum denominator tracking (>=70% requirement).
 * - Automated invocation of POST /api/cron/boundary-finalize.
 * 
 * Usage:
 *   node scripts/boundary-scheduler.mjs --once       # Run single check and exit
 *   node scripts/boundary-scheduler.mjs --finalize   # Force boundary finalization now
 *   node scripts/boundary-scheduler.mjs              # Run as continuous daemon (3h cadence)
 */

import http from "node:http";
import { getRosterQuorumStats, getAllRosterMembers, getDb } from "../src/lib/db.ts";
import { executeWeeklyFinalization } from "../src/lib/finalizer.ts";

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// IST is UTC + 5h 30m
function getISTDate(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  return new Date(utc + 5.5 * 3600000);
}

function getWeekNumber(d) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

function getNextSundayBoundaryIST(istNow) {
  const boundary = new Date(istNow);
  const day = boundary.getDay(); // 0 is Sunday
  const daysUntilSunday = (7 - day) % 7;
  boundary.setDate(boundary.getDate() + daysUntilSunday);
  boundary.setHours(23, 59, 59, 999);
  return boundary;
}

async function triggerApiFinalization(weekNumber, year) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({ weekNumber, year, platform: "all" });
    const req = http.request(
      `${BASE_URL}/api/cron/boundary-finalize`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
        timeout: 5000,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, data });
          }
        });
      }
    );

    req.on("error", (err) => {
      resolve({ status: 503, error: err.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ status: 504, error: "Gateway Timeout" });
    });

    req.write(payload);
    req.end();
  });
}

export async function runSchedulerCycle(forceFinalize = false) {
  const istNow = getISTDate();
  const currentWeek = getWeekNumber(istNow);
  const currentYear = istNow.getFullYear();
  const boundaryIST = getNextSundayBoundaryIST(istNow);

  const msToBoundary = boundaryIST.getTime() - istNow.getTime();
  const hoursToBoundary = (msToBoundary / (1000 * 3600)).toFixed(2);

  console.log("\n=======================================================");
  console.log("  TWM 3.1 — BOUNDARY SCHEDULER & TELEMETRY AUDITOR");
  console.log("=======================================================");
  console.log(`🕒 Current IST Time:      ${istNow.toISOString().replace("Z", "+05:30")}`);
  console.log(`📅 Target Week / Year:    Week ${currentWeek}, ${currentYear}`);
  console.log(`🎯 Sunday IST Boundary:   ${boundaryIST.toISOString().replace("Z", "+05:30")}`);
  console.log(`⏳ Gap to Closeout:       ${hoursToBoundary} hours`);

  // 1. Quorum and Roster Audit (§3.3)
  const quorum = getRosterQuorumStats();
  console.log("\n--- [Section 3.3 Class Roster Quorum Audit] ---");
  console.log(`👥 Total Enrolled:        ${quorum.totalEnrolled}`);
  console.log(`✅ Verified Opted-In:     ${quorum.verifiedOptedIn}`);
  console.log(`📊 Participation Quorum:  ${quorum.quorumPercentage}% (Required >= 70%)`);
  console.log(`🏷️ Leaderboard Label:     "${quorum.label}"`);
  console.log(`🛡️ Quorum Met:            ${quorum.meetsQuorum ? "YES" : "NO"}`);

  // 2. Boundary Criteria Check (§9.1 & §9.7)
  const isSunday = istNow.getDay() === 0;
  const isFinalizationWindow = isSunday && istNow.getHours() === 23 && istNow.getMinutes() >= 45;
  const shouldExecute = forceFinalize || isFinalizationWindow;

  console.log("\n--- [Section 9.1 & §9.7 Boundary Window Analysis] ---");
  console.log(`• Boundary Gap Compliance: ${Number(hoursToBoundary) <= 3 ? "PASS (<= 3h)" : "OUTSIDE_WINDOW (> 3h)"}`);
  console.log(`• Finalization Window:     ${isFinalizationWindow ? "ACTIVE (Sunday 23:45+ IST)" : "INACTIVE"}`);
  console.log(`• Execution Triggered:     ${shouldExecute ? "YES" : "NO"}`);

  if (shouldExecute) {
    console.log(`\n🚀 Executing Weekly Closeout for Week ${currentWeek}...`);

    // Try API endpoint first
    const apiResult = await triggerApiFinalization(currentWeek, currentYear);
    if (apiResult.status === 200) {
      console.log(`✅ HTTP 200 Finalization Succeeded via ${BASE_URL}`);
      console.log(`   Message: ${apiResult.data?.message}`);
    } else {
      console.log(`⚠️ HTTP ${apiResult.status} from API server (${apiResult.error || "Falling back to in-process execution"})...`);
      const directReport = executeWeeklyFinalization({
        weekNumber: currentWeek,
        year: currentYear,
        platform: "github",
      });
      console.log(`✅ Direct In-Process SQLite Finalization Complete:`);
      console.log(`   Standings Committed: ${directReport.standings.length} participants.`);
      console.log(`   Winner (Rank 1): ${directReport.standings[0]?.name || "None"} (${directReport.standings[0]?.scoreFormatted})`);
    }
  }

  console.log("=======================================================\n");
  return {
    istNow: istNow.toISOString(),
    currentWeek,
    hoursToBoundary,
    quorum,
    finalized: shouldExecute,
  };
}

// CLI Execution Entrypoint
const args = process.argv.slice(2);
const isOnce = args.includes("--once");
const isFinalize = args.includes("--finalize");

if (isOnce || isFinalize) {
  runSchedulerCycle(isFinalize)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Scheduler run failed:", err);
      process.exit(1);
    });
} else {
  console.log("Starting TWM 3.1 Scheduler Daemon (3-hour cycle)...");
  runSchedulerCycle(false).catch(console.error);

  const THREE_HOURS_MS = 3 * 3600 * 1000;
  setInterval(() => {
    runSchedulerCycle(false).catch(console.error);
  }, THREE_HOURS_MS);
}
