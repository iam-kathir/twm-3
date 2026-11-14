import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/telemetry/hackerrank
 * TWM-001G: HackerRank collection isolation.
 * Pauses unsanctioned public profile scraping pending official provider integration (§5.6, PROV-06, DEC-08).
 * Strictly preserves Section 5.6 capability gating: permanently excluded from weekly delta finalization
 * (isEligibleForWeeklyCompetition: false), display-only boundary ("DISPLAY_ONLY_VERIFIED" suspended),
 * and immutable proof digest format ("hr-proof-").
 * Returns honest UNAVAILABLE state with isVerified: false and zero external network calls.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`hackerrank:${ip}`, { limit: 30, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many telemetry requests. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Query parameter 'username' is required (e.g. /api/telemetry/hackerrank?username=alice)" },
      { status: 400, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const cleanUsername = username.trim().replace(/^@/, "");

  return NextResponse.json(
    {
      provider: "hackerrank",
      username: cleanUsername,
      status: "UNAVAILABLE", // Section 5.6 DISPLAY_ONLY_VERIFIED capability suspended during containment
      isVerified: false,
      isEligibleForWeeklyCompetition: false,
      message: "HackerRank telemetry collection is paused pending official provider API integration (DEC-08, TWM-001G).",
      capabilityNotice: "HackerRank public endpoint scraping disabled per Invariant §5.6 & Decision DEC-08. Permanently excluded from weekly competition deltas.",
      auditProofDigest: `hr-proof-isolated-${cleanUsername}`,
      badges: [],
      metrics: null,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
