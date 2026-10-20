import { NextRequest, NextResponse } from "next/server";
import { getAllRosterMembers, getLatestPlatformObservations } from "@/lib/db";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`roster:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many roster requests. Please slow down." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const members = getAllRosterMembers();
    const githubObs = getLatestPlatformObservations("github");

    // Map members with their latest observations
    const rosterWithTelemetry = members.map((m) => {
      const g = githubObs.find((obs) => (obs as any).student_id === m.id) as any;
      return {
        id: m.id,
        rollNo: m.roll_no,
        name: m.name,
        email: m.email,
        classSection: m.class_section,
        handleGithub: m.handle_github,
        handleLeetcode: m.handle_leetcode,
        handleHackerrank: m.handle_hackerrank,
        isCurrentUser: m.is_current_user === 1,
        latestGithubActiveDays: g ? g.metric_value : null,
        latestObservationTime: g ? g.observed_at : null,
      };
    });

    return NextResponse.json(
      {
        success: true,
        totalMembers: members.length,
        roster: rosterWithTelemetry,
      },
      { headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error) {
    console.error("Error fetching roster from SQLite:", error);
    return NextResponse.json(
      { error: "Failed to fetch class roster from database." },
      { status: 500 }
    );
  }
}
