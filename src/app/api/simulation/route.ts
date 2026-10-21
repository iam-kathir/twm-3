import { NextRequest, NextResponse } from "next/server";
import { runTournamentSimulationSync } from "@/lib/simulation";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`sim-status:${ip}`, { limit: 30, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  return NextResponse.json({
    status: "ready",
    capabilities: [
      "7-Day Tournament Lifecycle",
      "Section 3.3 Cohort Quorum Calculation",
      "Section 9.1 Anti-Gaming Commit Author Verification",
      "Section 10.1 Two-Person Dispute Audit Trail",
      "Section 9.7 Sunday 3-Hour Freshness Window Validation",
      "Section 9.6 Deterministic Competition Ties (1, 2, 2, 4)",
      "Section 10.1 & 10.2 Grounded Dual Weekly Recaps"
    ],
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`sim-run:${ip}`, { limit: 15, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many simulation requests. Please wait a minute." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: { weekNumber?: number; year?: number } = {};
  try {
    body = await req.json();
  } catch {
    // default parameters
  }

  const weekNumber = body.weekNumber ?? 43;
  const year = body.year ?? 2026;

  try {
    const result = runTournamentSimulationSync({ weekNumber, year });

    return NextResponse.json({
      success: true,
      message: `Tournament Week ${weekNumber} (${year}) simulated successfully under Sections 3.3, 9.1, 9.6, 9.7, 10.1, and 10.2 rules.`,
      result
    }, {
      headers: {
        "X-TWM-Zero-Fabrication": "1",
        "X-TWM-Simulation-Week": String(weekNumber)
      }
    });
  } catch (error) {
    console.error("Tournament simulation execution error:", error);
    return NextResponse.json(
      { error: "Failed to execute tournament week simulation." },
      { status: 500 }
    );
  }
}
