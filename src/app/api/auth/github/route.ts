import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { CSRF_COOKIE_NAME, sanitizeReturnTo } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/github
 * Initiates GitHub OAuth flow with CSRF state protection (§6.1, §17.4)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  // Generate 32-byte cryptographic CSRF state nonce
  const stateNonce = crypto.randomBytes(24).toString("hex");
  const statePayload = Buffer.from(JSON.stringify({ nonce: stateNonce, returnTo })).toString("base64url");

  const clientId = process.env.GITHUB_CLIENT_ID;

  // In production, GitHub OAuth Client ID is mandatory (no demo bypass)
  if (!clientId || clientId.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "OAUTH_UNCONFIGURED", message: "GitHub OAuth client ID is not configured on production server." },
        { status: 500 }
      );
    }

    // Development / Demo Fallback Mode
    const url = new URL("/login", request.url);
    url.searchParams.set("demo_oauth", "true");
    url.searchParams.set("state", statePayload);
    const response = NextResponse.redirect(url);
    response.cookies.set({
      name: CSRF_COOKIE_NAME,
      value: stateNonce,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 600, // 10 minutes
      path: "/",
    });
    return response;
  }

  // Official GitHub OAuth Redirect
  const redirectUri = `${request.nextUrl.origin}/api/auth/github/callback`;
  const githubAuthUrl = new URL("https://github.com/login/oauth/authorize");
  githubAuthUrl.searchParams.set("client_id", clientId);
  githubAuthUrl.searchParams.set("redirect_uri", redirectUri);
  githubAuthUrl.searchParams.set("scope", "read:user user:email");
  githubAuthUrl.searchParams.set("state", statePayload);

  const response = NextResponse.redirect(githubAuthUrl.toString());
  response.cookies.set({
    name: CSRF_COOKIE_NAME,
    value: stateNonce,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minutes
    path: "/",
  });

  return response;
}
