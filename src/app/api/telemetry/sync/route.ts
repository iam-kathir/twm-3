import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/telemetry/sync
 * TWM-001B: Client-authored telemetry writes are disabled.
 * Invariant §5.7: Telemetry observations are persisted exclusively via authorized server-side ingestion workers.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "FORBIDDEN",
      message: "Client-authored telemetry writes are disabled. Telemetry is collected exclusively via authorized server ingestion workers (§5.7, TWM-001B).",
    },
    { status: 403 }
  );
}
