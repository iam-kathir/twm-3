import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { recordObservation, getCurrentUserMember, getDb } from "@/lib/db";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface SyncRequest {
  platform: "github" | "leetcode" | "hackerrank";
  metricName: string;
  metricValue: number;
  displayValue: string;
  studentId?: string;
  coveragePass?: boolean;
  isProvisional?: boolean;
  rawPayload?: Record<string, unknown>;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`sync:${ip}`, { limit: 20, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many sync requests. Please wait a moment." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: SyncRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { platform, metricName, metricValue, displayValue, studentId, coveragePass, isProvisional, rawPayload } = body;

  if (!platform || !metricName || typeof metricValue !== "number") {
    return NextResponse.json(
      { error: "Missing required fields: platform, metricName, and numeric metricValue are required." },
      { status: 400 }
    );
  }

  try {
    // Resolve student ID: if not supplied, use current user
    let targetStudentId = studentId;
    if (!targetStudentId) {
      const currentUser = getCurrentUserMember();
      targetStudentId = currentUser ? currentUser.id : "usr-aarav";
    }

    const obsId = `obs-${crypto.randomBytes(6).toString("hex")}`;
    const now = new Date().toISOString();

    recordObservation({
      id: obsId,
      studentId: targetStudentId,
      platform,
      metricName,
      metricValue,
      displayValue: displayValue || `${metricValue}`,
      observedAt: now,
      scheduledBoundaryAt: "2026-10-25T23:59:59.000Z", // Next Sunday closing
      boundaryGapSeconds: 0,
      isProvisional: !!isProvisional,
      coveragePass: coveragePass !== false,
      rawPayload,
    });

    return NextResponse.json({
      success: true,
      observationId: obsId,
      studentId: targetStudentId,
      platform,
      metricName,
      metricValue,
      observedAt: now,
      persistedInSqlite: true,
    });
  } catch (error) {
    console.error("Telemetry sync recording error:", error);
    return NextResponse.json(
      { error: "Failed to persist telemetry observation to SQLite." },
      { status: 500 }
    );
  }
}
