import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentSession,
  buildStudentSession,
  signSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { verifyEmailOtp } from "@/lib/otp";
import { getRosterMemberById } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/email/verify-otp
 * Verifies submitted 6-digit OTP, atomically consumes challenge, marks roster verified,
 * and upgrades the session cookie to verified status.
 */
export async function POST(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json(
      { error: "UNAUTHORIZED", message: "Sign in with GitHub required before email verification" },
      { status: 401 }
    );
  }

  // Extract client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";

  // Rate limit: max 10 verify attempts per 5 minutes per IP
  const ipRate = checkRateLimit(`otp-verify-ip:${ip}`, { limit: 10, windowMs: 5 * 60 * 1000 });
  if (!ipRate.allowed) {
    return NextResponse.json(
      {
        error: "RATE_LIMITED",
        message: "Too many verification attempts from this connection. Please wait a moment.",
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

  if (
    !body ||
    typeof body !== "object" ||
    !("email" in body) ||
    !("otp" in body) ||
    typeof (body as { email: unknown }).email !== "string" ||
    typeof (body as { otp: unknown }).otp !== "string"
  ) {
    return NextResponse.json(
      { error: "BAD_REQUEST", message: "Fields 'email' and 'otp' are required and must be strings" },
      { status: 400 }
    );
  }

  const { email, otp } = body as { email: string; otp: string };

  // Validate OTP format server-side (strictly 6 digits)
  if (!/^\d{6}$/.test(otp.trim())) {
    return NextResponse.json(
      { error: "INVALID_FORMAT", message: "Verification code must be exactly 6 numeric digits" },
      { status: 400 }
    );
  }

  const verifyResult = await verifyEmailOtp({
    studentId: session.studentId,
    email,
    otp: otp.trim(),
  });

  if (!verifyResult.success) {
    if (verifyResult.reason === "EXPIRED") {
      return NextResponse.json(
        { error: "OTP_EXPIRED", message: "Verification code has expired. Please request a new code." },
        { status: 400 }
      );
    }

    if (verifyResult.reason === "MAX_ATTEMPTS_EXCEEDED") {
      return NextResponse.json(
        {
          error: "MAX_ATTEMPTS_EXCEEDED",
          message: "Too many failed attempts. This code is now invalidated. Please request a new code.",
        },
        { status: 429 }
      );
    }

    if (verifyResult.reason === "INVALID_OTP") {
      return NextResponse.json(
        {
          error: "INVALID_OTP",
          message: "Incorrect verification code. Please check and try again.",
          attemptsRemaining: verifyResult.attemptsRemaining,
        },
        { status: 400 }
      );
    }

    if (verifyResult.reason === "CHALLENGE_NOT_FOUND") {
      return NextResponse.json(
        {
          error: "NO_ACTIVE_CHALLENGE",
          message: "No active verification challenge found. Please request a code first.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "VERIFICATION_FAILED", message: "Unable to verify code at this time." },
      { status: 400 }
    );
  }

  // Verification succeeded! Fetch updated roster member and upgrade session token
  const updatedStudent = getRosterMemberById(session.studentId);
  if (!updatedStudent) {
    return NextResponse.json(
      { error: "ROSTER_ERROR", message: "Student record not found after verification" },
      { status: 500 }
    );
  }

  const updatedSession = buildStudentSession(updatedStudent, session.identityTier);
  const sessionToken = signSessionToken(updatedSession);

  const response = NextResponse.json({
    success: true,
    message: "College email verified successfully.",
    emailVerified: true,
    email: updatedStudent.email,
  });

  // Issue upgraded session cookie
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });

  return response;
}
