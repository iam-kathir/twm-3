import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { requestEmailOtp } from "@/lib/otp";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/email/request-otp
 * Requests a secure 6-digit OTP sent to an approved college email.
 * Requires an active pending or authenticated student session.
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in with GitHub required before email verification" },
      { status: 401 }
    );
  }

  // Extract client IP for security rate limiting
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  // Rate limit: max 5 requests per 10 minutes per IP
  const ipRate = checkRateLimit(`otp-req-ip:${ip}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!ipRate.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "Too many OTP requests from this connection. Please try again later.",
        retryAfterMs: ipRate.retryAfterSeconds * 1000,
      },
      { status: 429 }
    );
  }

  // Rate limit: max 5 requests per 10 minutes per student
  const studentRate = checkRateLimit(`otp-req-student:${session.studentId}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!studentRate.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "Too many OTP requests for this account. Please wait a few minutes.",
        retryAfterMs: studentRate.retryAfterSeconds * 1000,
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Invalid JSON payload" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("email" in body) || typeof (body as { email: unknown }).email !== "string") {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Field 'email' must be a valid string" },
      { status: 400 }
    );
  }

  const email = (body as { email: string }).email;

  const result = await requestEmailOtp({
    studentId: session.studentId,
    email,
    ipAddress: ip,
  });

  if (!result.success) {
    if (result.reason === "COOLDOWN_ACTIVE") {
      return NextResponse.json(
        {
          error: "COOLDOWN_ACTIVE",
          message: "A verification code was recently sent. Please wait before requesting another.",
        },
        { status: 429 }
      );
    }

    if (result.reason === "DOMAIN_NOT_ALLOWED") {
      return NextResponse.json(
        {
          error: "DOMAIN_NOT_ALLOWED",
          message: "Email domain is not authorized. Please use your official institutional email.",
        },
        { status: 400 }
      );
    }

    if (result.reason === "ROSTER_MISMATCH") {
      return NextResponse.json(
        {
          error: "ROSTER_MISMATCH",
          message: "This email address is not registered to your student profile.",
        },
        { status: 400 }
      );
    }

    if (result.reason === "DELIVERY_FAILED") {
      return NextResponse.json(
        {
          error: "DELIVERY_FAILED",
          message: "Failed to deliver verification code. Please check configuration or try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        error: "REQUEST_FAILED",
        message: "Unable to process verification request at this time.",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "A 6-digit verification code has been dispatched to your institutional email.",
    cooldownSeconds: 60,
  });
}
