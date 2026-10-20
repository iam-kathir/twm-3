import { NextRequest, NextResponse } from "next/server";
import { executeWeeklyFinalization } from "@/lib/finalizer";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`cron-finalize:${ip}`, { limit: 10, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many finalization requests." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: { weekNumber?: number; year?: number; platform?: "github" | "leetcode" | "all" } = {};
  try {
    body = await req.json();
  } catch {
    // default params
  }

  const weekNumber = body.weekNumber ?? 42;
  const year = body.year ?? 2026;
  const targetPlatform = body.platform ?? "all";

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
