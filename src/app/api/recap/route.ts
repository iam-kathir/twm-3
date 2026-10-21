import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { generateDeterministicWeeklyRecap } from "@/lib/recap";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`recap:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many recap requests. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId") || undefined;
  const rollNo = searchParams.get("rollNo") || undefined;
  const weekParam = searchParams.get("week");
  const yearParam = searchParams.get("year");

  const weekNumber = weekParam ? parseInt(weekParam, 10) : undefined;
  const year = yearParam ? parseInt(yearParam, 10) : undefined;

  try {
    const recap = generateDeterministicWeeklyRecap({
      studentId,
      rollNo,
      weekNumber,
      year,
    });

    return NextResponse.json(
      {
        success: true,
        recap,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
          ...getRateLimitHeaders(rateLimit),
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to generate deterministic weekly recap",
      },
      { status: 500, headers: getRateLimitHeaders(rateLimit) }
    );
  }
}
