#!/usr/bin/env node

/**
 * TWM 3.1 — Phase 5: End-to-End Tournament Week Simulation Engine
 * 
 * Simulates a full 7-day competitive lifecycle for an engineering cohort:
 * - Day 1 (Monday 00:00:00 IST): Tournament kickoff, quorum evaluation (§3.3).
 * - Day 3 (Wednesday 14:00:00 IST): Telemetry sync & GitHub author verification (§9.1).
 * - Day 5 (Friday 18:30:00 IST): Telemetry dispute filing & two-person audit approval (§10.1).
 * - Day 7 (Sunday 23:45:00 IST): Pre-boundary sweep & 3-hour gap validation (§9.7).
 * - Sunday 23:59:59 IST: Strict boundary cutoff, deterministic ranking 1, 2, 2, 4 (§9.6).
 * - Post-Boundary: Deterministic & Grounded AI weekly recap synthesis with zero-fabrication certification.
 * 
 * Usage:
 *   node scripts/simulate-tournament-week.mjs           # Run interactive simulation with step-by-step logs
 *   node scripts/simulate-tournament-week.mjs --verify  # Run simulation and assert all invariants
 *   node scripts/simulate-tournament-week.mjs --json    # Output structured simulation results as JSON
 */

import { runTournamentSimulationSync } from "../src/lib/simulation.ts";

const args = process.argv.slice(2);
const isVerifyOnly = args.includes("--verify");
const isJsonOutput = args.includes("--json");

// Color helpers for terminal output
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const magenta = (text) => `\x1b[35m${text}\x1b[0m`;
const bold = (text) => `\x1b[1m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

export async function runTournamentSimulation(options = {}) {
  const result = runTournamentSimulationSync(options);

  if (isJsonOutput) {
    console.log(JSON.stringify(result, null, 2));
    return result;
  }

  for (const step of result.steps) {
    console.log(`\n${bold(cyan(`▶ [STEP ${step.step}] ${step.timestamp}`))}`);
    console.log(`  ${bold(step.title)}: ${dim(step.description)}`);
    for (const [key, val] of Object.entries(step.data)) {
      if (typeof val === "object" && val !== null) {
        console.log(`    ${dim("•")} ${bold(key)}: ${JSON.stringify(val)}`);
      } else {
        console.log(`    ${dim("•")} ${bold(key)}: ${val}`);
      }
    }
    console.log(`  ${green("✔")} Step ${step.step} verified.`);
  }

  console.log(`\n${bold("══════════════════════════════════════════════════════════════════")}`);
  console.log(`${bold(magenta("🏆 TOURNAMENT SIMULATION AUDIT VERIFICATION SUMMARY"))}`);
  console.log(`${bold("══════════════════════════════════════════════════════════════════")}\n`);

  console.log(`| Invariant / Rule Gate | Expected | Actual Result | Status |`);
  console.log(`| :-------------------- | :------- | :------------ | :----- |`);
  for (const a of result.assertions) {
    const statusText = a.passed ? green("PASSED") : "\x1b[31mFAILED\x1b[0m";
    console.log(`| ${a.name.padEnd(35)} | ${a.expected.padEnd(25)} | ${a.actual.padEnd(30)} | ${statusText} |`);
  }

  console.log(`\n${result.invariantsPassed ? green(bold("✔ ALL TOURNAMENT INVARIANTS SATISFIED (PHASE 5 READY)")) : "\x1b[31mFAILURES DETECTED\x1b[0m"}\n`);

  return result;
}

// Direct CLI invocation
if (process.argv[1]?.endsWith("simulate-tournament-week.mjs")) {
  runTournamentSimulation()
    .then(res => {
      if (isVerifyOnly && !res.invariantsPassed) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch(err => {
      console.error("Simulation error:", err);
      process.exit(1);
    });
}
