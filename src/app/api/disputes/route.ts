import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDisputesByStudentId, insertDispute, getOpenDisputesCountForStudent } from "@/lib/db";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/disputes
 * TWM-001C: Scoped disputes retrieval.
 * Requires authenticated session. Ordinary students receive strictly their own disputes.
 */
export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`disputes-get:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many dispute requests." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Authentication required to view disputes." },
      { status: 401 }
    );
  }

  try {
    // Scoped strictly to the authenticated student's own disputes (§10.1, TWM-001C)
    const disputes = getDisputesByStudentId(session.studentId);
    return NextResponse.json({
      success: true,
      total: disputes.length,
      disputes,
    });
  } catch (error) {
    console.error("Disputes fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch disputes from SQLite." }, { status: 500 });
  }
}

/**
 * POST /api/disputes
 * TWM-001C: Dispute creation with server-derived student identity & DEC-02 concurrency limits.
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`disputes-post:${ip}`, { limit: 10, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many dispute submissions. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Authentication required to submit disputes." },
      { status: 401 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { metric, platform, claim, evidenceUrl, ruleReference } = body || {};

  if (!metric || !platform || !claim) {
    return NextResponse.json(
      { error: "Missing required fields: metric, platform, and claim are required." },
      { status: 400 }
    );
  }

  // Decision DEC-02: Maximum of 2 simultaneously open disputes per student per competition week
  const openCount = getOpenDisputesCountForStudent(session.studentId);
  if (openCount >= 2) {
    return NextResponse.json(
      {
        error: "MAX_OPEN_DISPUTES_EXCEEDED",
        message: "Maximum of 2 open disputes permitted simultaneously under Rule DEC-02.",
      },
      { status: 400 }
    );
  }

  try {
    const disputeId = `DSP-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    // Identity is derived STRICTLY from the server session (TWM-001C)
    insertDispute({
      id: disputeId,
      studentId: session.studentId,
      studentName: session.name,
      rollNo: session.rollNo,
      metric: String(metric).trim(),
      platform: String(platform).trim(),
      claim: String(claim).trim(),
      evidenceUrl: evidenceUrl ? String(evidenceUrl).trim() : "https://github.com",
      ruleReference: ruleReference ? String(ruleReference).trim() : "Rule §9.7: Sunday Boundary Observation",
    });

    return NextResponse.json(
      {
        success: true,
        disputeId,
        message: "Dispute lodged successfully. Queued for two-person review.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Dispute submission error:", error);
    return NextResponse.json({ error: "Failed to record dispute." }, { status: 500 });
  }
}

/**
 * PATCH /api/disputes
 * TWM-001C: Dispute adjudication lock.
 * Fails closed for all callers pending authoritative Faculty workspace deployment.
 * Prevents unauthorized students or Coordinators from making final dispute decisions (GOV-06).
 */
export async function PATCH() {
  return NextResponse.json(
    {
      error: "FORBIDDEN",
      message: "Dispute adjudication requires authoritative Faculty workspace credentials.",
    },
    { status: 403 }
  );
}
