import { NextResponse } from "next/server";
import { getRosterQuorumStats } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/stats/public
 * Public cohort aggregate statistics for landing page.
 * Strictly exposes aggregate counts only — NO private student records or PII.
 */
export async function GET() {
  try {
    const quorum = getRosterQuorumStats();
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
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
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

