import { NextRequest, NextResponse } from "next/server";
import { 
  getAllRosterMembers, 
  getLatestPlatformObservations, 
  getRosterQuorumStats, 
  insertRosterMember,
  NewRosterMemberInput 
} from "@/lib/db";
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
    const quorum = getRosterQuorumStats();

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
        quorum,
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`roster_post:${ip}`, { limit: 15, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many enrollment requests. Please slow down." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const body = await req.json();
    const { rollNo, name, email, classSection, handleGithub, handleLeetcode, handleHackerrank } = body;

    if (!rollNo || typeof rollNo !== "string" || rollNo.trim() === "") {
      return NextResponse.json(
        { error: "Missing required parameter: rollNo (e.g. '2022BCSE099')" },
        { status: 400 }
      );
    }

    if (!name || typeof name !== "string" || name.trim() === "") {
      return NextResponse.json(
        { error: "Missing required parameter: name" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid or missing required parameter: email" },
        { status: 400 }
      );
    }

    const newMemberInput: NewRosterMemberInput = {
      rollNo: rollNo.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      classSection: classSection?.trim() || "B.Tech CSE 2026 (Sec A)",
      handleGithub: handleGithub?.trim() || null,
      handleLeetcode: handleLeetcode?.trim() || null,
      handleHackerrank: handleHackerrank?.trim() || null,
    };

    const created = insertRosterMember(newMemberInput);
    const updatedQuorum = getRosterQuorumStats();

    return NextResponse.json(
      {
        success: true,
        message: `Successfully enrolled ${created.name} (${created.roll_no}) in class roster.`,
        member: {
          id: created.id,
          rollNo: created.roll_no,
          name: created.name,
          email: created.email,
          classSection: created.class_section,
          handleGithub: created.handle_github,
          handleLeetcode: created.handle_leetcode,
          handleHackerrank: created.handle_hackerrank,
          isCurrentUser: created.is_current_user === 1,
        },
        quorum: updatedQuorum,
      },
      { status: 201, headers: getRateLimitHeaders(rateLimit) }
    );
  } catch (error: any) {
    console.error("Error creating roster member in SQLite:", error);
    const msg = error?.message || "";
    if (msg.includes("UNIQUE constraint failed: roster_members.roll_no")) {
      return NextResponse.json(
        { error: "A student with this Roll Number is already enrolled." },
        { status: 409 }
      );
    }
    if (msg.includes("UNIQUE constraint failed: roster_members.email")) {
      return NextResponse.json(
        { error: "A student with this email address is already enrolled." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to enroll student in database." },
      { status: 500 }
    );
  }
}
