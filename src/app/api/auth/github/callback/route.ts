import { NextRequest, NextResponse } from "next/server";
import { getDb, type RosterMemberRow } from "@/lib/db";
import {
  CSRF_COOKIE_NAME,
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  buildStudentSession,
  signSessionToken,
  isInstitutionalCollegeEmail,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/github/callback
 * Handles OAuth callback, state verification, token exchange, and roster lookup (§6.1, §17.4)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const stateEncoded = searchParams.get("state");
  const demoStudentId = searchParams.get("demo_student_id");

  // 1. Verify CSRF State
  const storedCsrf = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  let returnTo = "/dashboard";

  if (stateEncoded) {
    try {
      const decoded = JSON.parse(Buffer.from(stateEncoded, "base64url").toString("utf-8"));
      if (decoded.returnTo) returnTo = decoded.returnTo;
      if (storedCsrf && decoded.nonce !== storedCsrf) {
        return NextResponse.json(
          { error: "CSRF_MISMATCH", message: "Invalid OAuth state nonce" },
          { status: 400 }
        );
      }
    } catch {
      // Invalid state format
    }
  }

  const db = getDb();

  // 2. Dev / Demo Fast-Track (when GITHUB_CLIENT_ID not configured or demo passed)
  if (demoStudentId || (!process.env.GITHUB_CLIENT_ID && !code)) {
    let student: RosterMemberRow | undefined;
    if (demoStudentId) {
      student = db.prepare("SELECT * FROM roster_members WHERE id = ?").get(demoStudentId) as RosterMemberRow | undefined;
    }
    if (!student) {
      // Default to currentUser (Aarav Sharma) or first roster member
      student = (db.prepare("SELECT * FROM roster_members WHERE is_current_user = 1").get() ||
        db.prepare("SELECT * FROM roster_members LIMIT 1").get()) as RosterMemberRow | undefined;
    }

    if (!student) {
      return NextResponse.redirect(new URL("/login?error=NO_ROSTER_SEED", request.url));
    }

    const session = buildStudentSession(student, "LEGAL_NAME");
    const sessionToken = signSessionToken(session);

    const redirectUrl = new URL(returnTo, request.url);
    const response = NextResponse.redirect(redirectUrl);

    // Set secure HTTP-only session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });

    // Clear one-time CSRF cookie
    response.cookies.delete(CSRF_COOKIE_NAME);
    return response;
  }

  // 3. Live GitHub OAuth Token Exchange
  if (!code) {
    return NextResponse.redirect(new URL("/login?error=MISSING_CODE", request.url));
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL(`/login?error=TOKEN_EXCHANGE_FAILED`, request.url));
    }

    const accessToken = tokenData.access_token;

    // Fetch GitHub User Profile
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "TWM-3.1-Auth-Client",
      },
    });
    const githubUser = await userRes.json();
    const githubLogin = githubUser.login;

    // Fetch User Verified Emails
    const emailRes = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "User-Agent": "TWM-3.1-Auth-Client",
      },
    });
    const emails: Array<{ email: string; primary: boolean; verified: boolean }> = await emailRes.json();

    // 4. Match against SQLite Roster Members
    // Look up by github handle first, then by verified emails
    let matchedStudent: RosterMemberRow | undefined;

    if (githubLogin) {
      matchedStudent = db
        .prepare("SELECT * FROM roster_members WHERE LOWER(handle_github) = LOWER(?) AND is_active = 1")
        .get(githubLogin) as RosterMemberRow | undefined;
    }

    if (!matchedStudent && Array.isArray(emails)) {
      for (const emailObj of emails) {
        if (emailObj.verified) {
          const found = db
            .prepare("SELECT * FROM roster_members WHERE LOWER(email) = LOWER(?) AND is_active = 1")
            .get(emailObj.email) as RosterMemberRow | undefined;
          if (found) {
            matchedStudent = found;
            break;
          }
        }
      }
    }

    // 5. If not found on class roster, redirect to onboarding with verified handle
    if (!matchedStudent) {
      const onboardUrl = new URL("/onboarding", request.url);
      onboardUrl.searchParams.set("github", githubLogin);
      onboardUrl.searchParams.set("unmatched_roster", "true");
      return NextResponse.redirect(onboardUrl);
    }

    // 6. Issue Session Cookie and Redirect
    const session = buildStudentSession(matchedStudent, "LEGAL_NAME");
    const sessionToken = signSessionToken(session);

    const redirectUrl = new URL(returnTo, request.url);
    const response = NextResponse.redirect(redirectUrl);

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_TTL_SECONDS,
      path: "/",
    });

    response.cookies.delete(CSRF_COOKIE_NAME);
    return response;
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(new URL("/login?error=AUTH_INTERNAL_ERROR", request.url));
  }
}
