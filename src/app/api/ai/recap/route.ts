/**
 * TWM 3.1 — Grounded AI Performance Summarizer API Route
 * Reference: Plan §10.1, §10.2, §16.3
 *
 * GET /api/ai/recap?studentId=...&rollNo=...
 *
 * Invariant: Never renders hallucinated or fabricated metrics (§1.2, §5.7).
 * Protected by sliding-window rate limiting (15 requests/min).
 */

import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateGroundedAIRecap } from "@/lib/ai-recap";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = checkRateLimit(`ai-recap:${ip}`, { limit: 15, windowMs: 60000 });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded for AI telemetry recap. Please wait before retrying.",
          retryAfterSeconds: rateCheck.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": rateCheck.retryAfterSeconds.toString(),
            "X-RateLimit-Limit": rateCheck.limit.toString(),
            "X-RateLimit-Remaining": rateCheck.remaining.toString(),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || undefined;
    const rollNo = searchParams.get("rollNo") || undefined;
    const weekNumber = searchParams.get("week") ? parseInt(searchParams.get("week")!, 10) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined;

    const recap = await generateGroundedAIRecap({
      studentId,
      rollNo,
      weekNumber,
      year,
    });

    return NextResponse.json(recap, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300",
        "X-TWM-Zero-Fabrication": "ENFORCED",
        "X-TWM-Engine": recap.groundingAudit.engine,
      },
    });
  } catch (error) {
    console.error("[API AI Recap] Unhandled error:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_RECAP_ERROR",
        message: "Failed to generate grounded AI weekly performance recap.",
      },
      { status: 500 }
    );
  }
}
