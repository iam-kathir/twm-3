import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { executeWeeklyFinalization } from "@/lib/finalizer";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // TWM-001F: Strict scheduler authentication — fail closed if secret is unset
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "CRON_SECRET is not configured on the server." },
      { status: 401 }
    );
  }

  const authHeader = req.headers.get("authorization");
  const expectedHeader = `Bearer ${cronSecret}`;
  if (!authHeader || authHeader.length !== expectedHeader.length) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Invalid or missing CRON_SECRET authorization." },
      { status: 401 }
    );
  }

  const expectedBuf = Buffer.from(expectedHeader);
  const receivedBuf = Buffer.from(authHeader);
  if (!crypto.timingSafeEqual(expectedBuf, receivedBuf)) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Invalid or missing CRON_SECRET authorization." },
      { status: 401 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`cron-finalize:${ip}`, { limit: 10, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many finalization requests." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  // TWM-001F: Require explicit period parameters; reject implicit fallbacks
  let body: { weekNumber?: number; year?: number; platform?: "github" | "leetcode" | "all" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Missing required JSON body with explicit weekNumber and year." },
      { status: 400 }
    );
  }

  const { weekNumber, year, platform: targetPlatform = "all" } = body;
  if (typeof weekNumber !== "number" || typeof year !== "number") {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Explicit numeric weekNumber and year are required (§9.1, TWM-001F)." },
      { status: 400 }
    );
  }

  try {
    const reports = [];

    if (targetPlatform === "github" || targetPlatform === "all") {
      const ghReport = executeWeeklyFinalization({ weekNumber, year, platform: "github" });
      reports.push(ghReport);
    }

    if (targetPlatform === "leetcode" || targetPlatform === "all") {
      const lcReport = executeWeeklyFinalization({ weekNumber, year, platform: "leetcode" });
      reports.push(lcReport);
    }

    return NextResponse.json({
      success: true,
      message: `Week ${weekNumber} (${year}) competition boundary finalized under Section 9.1 & 9.7 rules.`,
      executedAt: new Date().toISOString(),
      reports,
    });
  } catch (error) {
    console.error("Weekly finalization error:", error);
    return NextResponse.json(
      { error: "Failed to execute weekly finalization job." },
      { status: 500 }
    );
  }
}
