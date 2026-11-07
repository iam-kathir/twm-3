import { NextRequest, NextResponse } from "next/server";
import { getRosterQuorumStats, getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/stats/public
 * Public cohort aggregate statistics for landing page.
 * Strictly exposes aggregate counts only — NO private student records or PII.
 * Uses conditional ETag validation to resolve stale cache window limitations
 * while eliminating redundant database bandwidth.
 *
 * Data freshness semantics (§E):
 * - generatedAt: ISO timestamp when this API response was generated.
 * - latestObservationAt: Genuine ISO timestamp of the latest recorded observation in SQLite (or null).
 */
export async function GET(req: NextRequest) {
  try {
    const quorum = getRosterQuorumStats();
    const db = getDb();

    // Query genuine latest observation timestamp if present in DB (§E.4)
    const latestObsRow = db
      .prepare("SELECT MAX(observed_at) as latest FROM telemetry_observations")
      .get() as { latest: string | null } | undefined;
    const latestObservationAt = latestObsRow?.latest ?? null;

    const etag = `"${quorum.totalEnrolled}-${quorum.verifiedOptedIn}-${quorum.quorumPercentage}-${latestObservationAt}"`;

    if (req.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        totalEnrolled: quorum.totalEnrolled,
        verifiedOptedIn: quorum.verifiedOptedIn,
        quorumPercentage: quorum.quorumPercentage,
        meetsQuorum: quorum.meetsQuorum,
        label: quorum.label,
        platformCount: 3,
        generatedAt: new Date().toISOString(),
        latestObservationAt,
      },
      {
        headers: {
          ETag: etag,
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      }
    );
  } catch (err) {
    console.error("Public stats aggregate error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load public cohort aggregates." },
      { status: 500 }
    );
  }
}

