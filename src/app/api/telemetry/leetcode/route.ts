import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * GET /api/telemetry/leetcode
 * TWM-001G: LeetCode collection isolation.
 * Pauses unsanctioned GraphQL scraping pending official provider integration (§5.7, PROV-06, DEC-08).
 * Returns honest UNAVAILABLE state with isVerified: false.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`leetcode:${ip}`, { limit: 30, windowMs: 60000 });
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
      { error: "Query parameter 'username' is required (e.g. /api/telemetry/leetcode?username=neal_wu)" },
      { status: 400, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const cleanUsername = username.trim().replace(/^@/, "");

  return NextResponse.json(
    {
      provider: "leetcode",
      username: cleanUsername,
      status: "UNAVAILABLE",
      isVerified: false,
      message: "Automated LeetCode telemetry collection is paused pending official provider API integration (DEC-08, TWM-001G).",
      capabilityNotice: "LeetCode public endpoint scraping disabled per Invariant §5.7 & Decision DEC-08.",
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
