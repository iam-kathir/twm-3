import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface HackerRankBadge {
  badge_name: string;
  badge_type: string;
  stars: number;
  current_points?: number;
  total_challenges?: number;
  icon?: string;
}

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

  try {
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "application/json",
    };

    // 1. Check HackerRank public hacker profile with 5s timeout
    const profileRes = await fetch(
      `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(cleanUsername)}/profile`,
      { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) }
    );

    if (profileRes.status === 404) {
      return NextResponse.json(
        {
          provider: "hackerrank",
          username: cleanUsername,
          status: "NOT_FOUND",
          error: `HackerRank user '${cleanUsername}' was not found.`,
          isVerified: false,
          isEligibleForWeeklyCompetition: false,
        },
        { status: 404 }
      );
    }

    if (!profileRes.ok) {
      // In case HackerRank anti-bot or rate limit triggers, provide honest fallback status
      return NextResponse.json(
        {
          provider: "hackerrank",
          username: cleanUsername,
          status: "ADAPTER_DEGRADED",
          error: `HackerRank public endpoint returned HTTP ${profileRes.status}`,
          isVerified: false,
          isEligibleForWeeklyCompetition: false,
          capabilityNotice: "HackerRank public endpoint response unverified; capability gated to display-only.",
        },
        { status: 200 }
      );
    }

    const profileData = await profileRes.json();
    const model = profileData?.model;

    if (!model) {
      return NextResponse.json(
        {
          provider: "hackerrank",
          username: cleanUsername,
          status: "NOT_FOUND",
          error: `HackerRank profile '${cleanUsername}' has no public model record.`,
          isVerified: false,
          isEligibleForWeeklyCompetition: false,
        },
        { status: 404 }
      );
    }

    // 2. Fetch badges / domain stars
    let badges: HackerRankBadge[] = [];
    try {
      const badgesRes = await fetch(
        `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(cleanUsername)}/badges`,
        { headers, next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) }
      );

      if (badgesRes.ok) {
        const badgesData = await badgesRes.json();
        if (Array.isArray(badgesData?.models)) {
          badges = badgesData.models.map((b: any) => ({
            badge_name: b.badge_name || "Unknown Badge",
            badge_type: b.badge_type || "domain",
            stars: Number(b.stars || 0),
            current_points: Number(b.current_points || 0),
            total_challenges: Number(b.total_challenges || 0),
            icon: b.icon || null,
          }));
        }
      }
    } catch {
      // Non-fatal if badges endpoint fails; profile exists
    }

    // Calculate total domain stars earned (Problem Solving, Python, etc.)
    const totalStars = badges.reduce((sum, b) => sum + (b.stars || 0), 0);
    const problemSolvingBadge = badges.find(
      (b) => b.badge_name.toLowerCase().includes("problem solving") || b.badge_name.toLowerCase().includes("algorithms")
    );

    // Section 5.6 Compliance: HackerRank data is strictly display-only & excluded from weekly delta rankings
    return NextResponse.json(
      {
        provider: "hackerrank",
        username: cleanUsername,
        name: model.name || cleanUsername,
        avatar: model.avatar || null,
        country: model.country || null,
        school: model.school || null,
        status: "DISPLAY_ONLY_VERIFIED",
        isVerified: true,
        isEligibleForWeeklyCompetition: false,
        capabilityGating: {
          mode: "DISPLAY_ONLY_EXCLUDED_FROM_DELTA",
          reason:
            "HackerRank provides cumulative domain badges and stars without deterministic event timestamps. Per Plan Section 5.6, this data is displayed for personal portfolio showcase but strictly excluded from weekly competition deltas.",
        },
        metrics: {
          totalStars,
          badgesCount: badges.length,
          problemSolvingStars: problemSolvingBadge ? problemSolvingBadge.stars : 0,
          badges,
        },
        observationTimestamp: new Date().toISOString(),
        freshnessSeconds: 300,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        provider: "hackerrank",
        username: cleanUsername,
        status: "PROVIDER_UNREACHABLE",
        error: err.message || "Failed to reach HackerRank provider service",
        isVerified: false,
        isEligibleForWeeklyCompetition: false,
        capabilityNotice:
          "HackerRank public endpoint timed out or blocked connection. Observed status set to UNREACHABLE per Plan §5.7.",
      },
      { status: 200 }
    );
  }
}
