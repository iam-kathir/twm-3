import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getAllDisputes, insertDispute, resolveDisputeInDb, getCurrentUserMember } from "@/lib/db";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`disputes-get:${ip}`, { limit: 60, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many dispute requests." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  try {
    const disputes = getAllDisputes();
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

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`disputes-post:${ip}`, { limit: 10, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many dispute submissions. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { metric, platform, claim, evidenceUrl, ruleReference, studentName, rollNo, studentId } = body;

  if (!metric || !platform || !claim) {
    return NextResponse.json(
      { error: "Missing required fields: metric, platform, and claim are required." },
      { status: 400 }
    );
  }

  try {
    const currentUser = getCurrentUserMember();
    const disputeId = `DSP-${Math.floor(1050 + Math.random() * 900)}`;

    insertDispute({
      id: disputeId,
      studentId: studentId || (currentUser ? currentUser.id : "usr-aarav"),
      studentName: studentName || (currentUser ? currentUser.name : "Aarav Sharma"),
      rollNo: rollNo || (currentUser ? currentUser.roll_no : "2022BCSE042"),
      metric,
      platform,
      claim,
      evidenceUrl: evidenceUrl || "https://github.com",
      ruleReference: ruleReference || "Rule §9.7: Sunday Boundary Observation",
    });

    return NextResponse.json({
      success: true,
      disputeId,
      message: "Dispute lodged successfully. Queued for two-person review.",
    });
  } catch (error) {
    console.error("Dispute submission error:", error);
    return NextResponse.json({ error: "Failed to record dispute." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { id, status, resolutionNote, reviewer } = body;

  if (!id || (status !== "approved" && status !== "rejected")) {
    return NextResponse.json(
      { error: "Valid dispute ID and status ('approved' | 'rejected') are required." },
      { status: 400 }
    );
  }

  try {
    const currentUser = getCurrentUserMember();
    const reviewerName = reviewer || (currentUser ? `${currentUser.name} (Co-Admin)` : "Faculty Co-Admin");

    resolveDisputeInDb(id, status, resolutionNote || "Resolved per Rule §9.7 audit criteria.", reviewerName);

    return NextResponse.json({
      success: true,
      id,
      status,
      reviewedBy: reviewerName,
      message: `Dispute ${id} marked ${status} in SQLite audit log.`,
    });
  } catch (error) {
    console.error("Dispute resolution error:", error);
    return NextResponse.json({ error: "Failed to update dispute status." }, { status: 500 });
  }
}
