import { NextRequest, NextResponse } from "next/server";
import {
  getCurrentSession,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signSessionToken,
  IdentityTier,
  formatStudentDisplayName,
} from "@/lib/auth";
import { getDb, type RosterMemberRow } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/session
 * Returns authenticated student profile, identity tier, and display name
 */
export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    // Check if default current user is active in SQLite
    const db = getDb();
    const defaultUser = db.prepare("SELECT * FROM roster_members WHERE is_current_user = 1").get() as RosterMemberRow | undefined;

    return NextResponse.json({
      authenticated: false,
      session: null,
      fallbackDefaultUser: defaultUser
        ? {
            id: defaultUser.id,
            rollNo: defaultUser.roll_no,
            name: defaultUser.name,
            email: defaultUser.email,
            handleGithub: defaultUser.handle_github,
          }
        : null,
    });
  }

  const displayName = formatStudentDisplayName({
    name: session.name,
    rollNo: session.rollNo,
    handleGithub: session.handleGithub,
    identityTier: session.identityTier,
  });

  return NextResponse.json({
    authenticated: true,
    session: {
      ...session,
      displayName,
    },
  });
}

/**
 * PATCH /api/auth/session
 * Updates student Identity Tier (§18.1: LEGAL_NAME | HANDLE_ONLY | ANONYMOUS)
 */
export async function PATCH(request: NextRequest) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "UNAUTHORIZED", message: "Sign in required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const newTier: IdentityTier = body.identityTier;

    if (!["LEGAL_NAME", "HANDLE_ONLY", "ANONYMOUS"].includes(newTier)) {
      return NextResponse.json({ error: "INVALID_TIER", message: "Invalid identity tier specified" }, { status: 400 });
    }

    const updatedSession = {
      ...session,
      identityTier: newTier,
    };

    const token = signSessionToken(updatedSession);
    const response = NextResponse.json({
      success: true,
      identityTier: newTier,
      displayName: formatStudentDisplayName(updatedSession),
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });

    return response;
  } catch (err) {
    return NextResponse.json({ error: "BAD_REQUEST", message: "Malformed JSON payload" }, { status: 400 });
  }
}

/**
 * POST /api/auth/logout
 * Destroys session cookie
 */
export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete(SESSION_COOKIE_NAME);
  return response;
}
