/**
 * TWM 3.1 — Semantic Classmate Search & Cohort Directory API Route
 * Reference: Plan §10.3, §1.2 & §5.7
 *
 * GET /api/search?q=...&tag=...&evidence=...
 *
 * Returns live enrolled cohort members with verified telemetry and skill manifests.
 */

import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCohortDevelopers, EvidenceLevel } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const rateCheck = checkRateLimit(`search:${ip}`, { limit: 30, windowMs: 60000 });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "RATE_LIMIT_EXCEEDED",
          message: "Rate limit exceeded for cohort search. Please wait before retrying.",
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
    const query = searchParams.get("q") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const evidenceParam = searchParams.get("evidence");
    const evidenceLevel = (
      evidenceParam === "EXPLICIT_SOURCE" ||
      evidenceParam === "SUPPORTED_INFERENCE" ||
      evidenceParam === "SELF_DECLARED"
        ? evidenceParam
        : "ALL"
    ) as EvidenceLevel | "ALL";

    const developers = getCohortDevelopers({
      query,
      tag,
      evidenceLevel,
    });

    return NextResponse.json(
      {
        success: true,
        count: developers.length,
        developers,
        zeroFabricationNotice: "All profiles and metrics backed strictly by SQLite cohort roster & verified observations (Plan §1.2 & §5.7).",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=180",
          "X-TWM-Zero-Fabrication": "ENFORCED",
        },
      }
    );
  } catch (error) {
    console.error("[API Search] Error querying cohort directory:", error);
    return NextResponse.json(
      {
        error: "INTERNAL_SEARCH_ERROR",
        message: "Failed to query cohort directory from database.",
      },
      { status: 500 }
    );
  }
}
