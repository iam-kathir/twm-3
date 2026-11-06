import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { disconnectStudentProvider, deleteStudentTelemetryData } from "@/lib/db";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/disconnect
 * 1-Click Platform Disconnect & Data Sovereignty Erasure (§17.4 & §18.4)
 * Allows authenticated students to disconnect specific adapters or wipe all telemetry observations.
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Active authenticated session required to manage data connections." },
      { status: 401 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
  const rateLimit = checkRateLimit(`disconnect:${session.studentId || ip}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "RATE_LIMITED", message: "Too many disconnect requests. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: { platform?: "github" | "leetcode" | "hackerrank"; wipeAll?: boolean } = {};
  try {
    body = await request.json();
  } catch {
    // defaults to no-op
  }

  try {
    if (body.wipeAll) {
      const result = deleteStudentTelemetryData(session.studentId);
      return NextResponse.json(
        {
          success: true,
          action: "FULL_DATA_WIPE",
          message: "All telemetry observations, challenges, and adapter handles successfully erased per §17.4 policy.",
          deletedObservations: result.deletedObservations,
          studentId: session.studentId,
        },
        { headers: getRateLimitHeaders(rateLimit) }
      );
    }

    if (body.platform) {
      if (!["github", "leetcode", "hackerrank"].includes(body.platform)) {
        return NextResponse.json(
          { error: "INVALID_PLATFORM", message: "Platform must be one of: github, leetcode, hackerrank" },
          { status: 400 }
        );
      }

      const result = disconnectStudentProvider(session.studentId, body.platform);
      return NextResponse.json(
        {
          success: true,
          action: "PROVIDER_DISCONNECT",
          platform: body.platform,
          message: `Successfully disconnected ${body.platform} adapter and pruned ${result.deletedObservations} observations.`,
          deletedObservations: result.deletedObservations,
          studentId: session.studentId,
        },
        { headers: getRateLimitHeaders(rateLimit) }
      );
    }

    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Must specify either 'platform' ('github' | 'leetcode' | 'hackerrank') or 'wipeAll: true'." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Data disconnect error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to process data disconnect request." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/disconnect
 * Direct HTTP DELETE method for complete 1-click telemetry wipe
 */
export async function DELETE(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Active authenticated session required to delete data." },
      { status: 401 }
    );
  }

  try {
    const result = deleteStudentTelemetryData(session.studentId);
    return NextResponse.json({
      success: true,
      action: "FULL_DATA_WIPE",
      message: "All telemetry observations, challenges, and adapter handles successfully erased per §17.4 policy.",
      deletedObservations: result.deletedObservations,
      studentId: session.studentId,
    });
  } catch (error) {
    console.error("Data wipe error:", error);
    return NextResponse.json(
      { error: "INTERNAL_ERROR", message: "Failed to wipe student data." },
      { status: 500 }
    );
  }
}
