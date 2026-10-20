import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface SubmissionStat {
  difficulty: "All" | "Easy" | "Medium" | "Hard";
  count: number;
  submissions: number;
}

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

  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          githubUrl
          profile {
            realName
            userAvatar
            ranking
            reputation
            countryName
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
        allQuestionsCount {
          difficulty
          count
        }
      }
    `;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://leetcode.com",
    };

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers,
      body: JSON.stringify({
        query,
        variables: { username: cleanUsername },
      }),
      next: { revalidate: 300 }, // 5 min cache
      signal: AbortSignal.timeout(6000), // 6s anti-hang
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          provider: "leetcode",
          username: cleanUsername,
          status: "PROVIDER_DEGRADED",
          error: `LeetCode GraphQL gateway returned HTTP ${res.status}`,
          isVerified: false,
          capabilityNotice: "LeetCode public gateway unreachable; returning degraded state per Plan §5.7.",
        },
        { status: 200 }
      );
    }

    const json = await res.json();
    const matchedUser = json?.data?.matchedUser;

    if (!matchedUser) {
      return NextResponse.json(
        {
          provider: "leetcode",
          username: cleanUsername,
          status: "NOT_FOUND",
          error: `LeetCode account '${cleanUsername}' was not found.`,
          isVerified: false,
        },
        { status: 404 }
      );
    }

    const acStats: SubmissionStat[] = matchedUser.submitStatsGlobal?.acSubmissionNum || [];
    const allStat = acStats.find((s) => s.difficulty === "All") || { count: 0, submissions: 0 };
    const easyStat = acStats.find((s) => s.difficulty === "Easy") || { count: 0, submissions: 0 };
    const mediumStat = acStats.find((s) => s.difficulty === "Medium") || { count: 0, submissions: 0 };
    const hardStat = acStats.find((s) => s.difficulty === "Hard") || { count: 0, submissions: 0 };

    // Section 9.7 & 16.3: Sunday 23:59:59 IST snapshot boundary policy
    // In live observation mode without stored DB historical baseline, weekly delta cannot be fabricated
    return NextResponse.json(
      {
        provider: "leetcode",
        username: matchedUser.username,
        realName: matchedUser.profile?.realName || matchedUser.username,
        avatar: matchedUser.profile?.userAvatar || null,
        ranking: matchedUser.profile?.ranking || null,
        reputation: matchedUser.profile?.reputation || 0,
        status: "SNAPSHOT_VERIFIED",
        isVerified: true,
        metrics: {
          totalSolved: allStat.count,
          easySolved: easyStat.count,
          mediumSolved: mediumStat.count,
          hardSolved: hardStat.count,
          totalSubmissions: allStat.submissions,
        },
        snapshotProtocol: {
          mode: "SUNDAY_235959_IST_PRE_BOUNDARY",
          rule: "Plan §9.7 & §16.3: The weekly closing value is the last valid observation taken at or before Sunday 23:59:59 IST. Unlike continuous commit streams, cumulative LeetCode counts are delta-evaluated against verified prior Sunday snapshots.",
          observedAt: new Date().toISOString(),
          weeklyDelta: null,
          weeklyDeltaStatus: "NO_PRIOR_SUNDAY_BASELINE",
          weeklyDeltaNote: "Baseline snapshot will be recorded at the next Sunday 23:59:59 IST boundary.",
        },
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
        provider: "leetcode",
        username: cleanUsername,
        status: "PROVIDER_UNREACHABLE",
        error: err.message || "Failed to query LeetCode GraphQL service",
        isVerified: false,
        capabilityNotice: "LeetCode public endpoint timed out or failed per Plan §5.7.",
      },
      { status: 200 }
    );
  }
}
