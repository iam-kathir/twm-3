import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/roster/bulk-import
 * TWM-001D: Class roster import containment.
 * Fails closed for all mutation requests pending deployment of authoritative
 * Faculty role and cohort authorization tables (§3.2, §3.3, TWM-001D).
 * Eliminates development authentication bypasses and protects class roster integrity.
 */
export async function POST() {
  return NextResponse.json(
    {
      error: "FORBIDDEN",
      message: "Class roster mutations require authoritative Faculty cohort authorization (TWM-001D).",
    },
    { status: 403 }
  );
}
