import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { registerHmacNonce, verifyAndConsumeNonce } from "@/lib/db";

// 15-minute challenge TTL (Section 6.2 rule)
const CHALLENGE_TTL_MS = 15 * 60 * 1000;

// Known development secret. In production an unset TWM_HMAC_SECRET must fail closed —
// otherwise anyone reading this repo can mint valid challenge tokens.
const DEV_SECRET = "twm-dev-secret-key-3.1-master-baseline";
function getSecret(): string {
  const fromEnv = process.env.TWM_HMAC_SECRET;
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV === "production") {
    throw new Error("TWM_HMAC_SECRET is not configured");
  }
  return DEV_SECRET;
}

type Provider = "leetcode" | "hackerrank";

interface ChallengeRequest {
  action: "create" | "verify";
  userId: string;
  provider: Provider;
  handle: string;
  challenge?: string;
}

interface ParsedToken {
  expiresAt: number;
  nonce: string;
  sig: string;
}

/**
 * Token layout: twm-verify-<expiresAt base36>-<nonce hex>-<signature hex>
 * The payload is recoverable from the token itself, so verification needs no database:
 * the signature covers userId + provider + handle + nonce + expiry.
 */
function signToken(
  userId: string,
  provider: Provider,
  handle: string,
  nonce: string,
  expiresAt: number
): string {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${userId}:${provider}:${handle.trim().toLowerCase()}:${nonce}:${expiresAt}`)
    .digest("hex");
}

function createChallenge(userId: string, provider: Provider, handle: string) {
  const nonce = crypto.randomBytes(8).toString("hex");
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  const sig = signToken(userId, provider, handle, nonce, expiresAt);
  registerHmacNonce(nonce, userId, provider, handle, expiresAt);
  return {
    challengeCode: `twm-verify-${expiresAt.toString(36)}-${nonce}-${sig}`,
    expiresAt: new Date(expiresAt).toISOString(),
  };
}

function parseToken(code: string): ParsedToken | null {
  const match = /^twm-verify-([0-9a-z]+)-([0-9a-f]{16})-([0-9a-f]{64})$/.exec(code.trim());
  if (!match) return null;
  const expiresAt = parseInt(match[1], 36);
  if (!Number.isFinite(expiresAt)) return null;
  return { expiresAt, nonce: match[2], sig: match[3] };
}

type TokenCheck = { ok: true } | { ok: false; status: number; reason: string };

function checkToken(
  code: string,
  userId: string,
  provider: Provider,
  handle: string
): TokenCheck {
  const parsed = parseToken(code);
  if (!parsed) return { ok: false, status: 400, reason: "MALFORMED_TOKEN" };
  if (parsed.expiresAt < Date.now()) return { ok: false, status: 400, reason: "TOKEN_EXPIRED" };

  const expected = Buffer.from(
    signToken(userId, provider, handle, parsed.nonce, parsed.expiresAt),
    "hex"
  );
  const received = Buffer.from(parsed.sig, "hex");
  if (expected.length !== received.length || !crypto.timingSafeEqual(expected, received)) {
    return { ok: false, status: 400, reason: "SIGNATURE_MISMATCH" };
  }

  // Nonce single-use check (§6.2 replay protection)
  const nonceCheck = verifyAndConsumeNonce(parsed.nonce);
  if (!nonceCheck.valid) {
    return { ok: false, status: 400, reason: nonceCheck.reason || "NONCE_INVALID" };
  }

  return { ok: true };
}

/**
 * Reads the public bio straight from the provider. The client never supplies this text:
 * whatever the client says about itself is not evidence of account ownership.
 */
async function fetchPublicBio(provider: Provider, handle: string): Promise<string> {
  const clean = handle.trim().replace(/^@/, "");
  if (!clean) return "";

  if (provider === "leetcode") {
    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
      body: JSON.stringify({
        query:
          "query($username: String!) { matchedUser(username: $username) { profile { aboutMe } } }",
        variables: { username: clean },
      }),
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`LeetCode returned HTTP ${res.status}`);
    const json = await res.json();
    return json?.data?.matchedUser?.profile?.aboutMe ?? "";
  }

  const res = await fetch(
    `https://www.hackerrank.com/rest/hackers/${encodeURIComponent(clean)}/profile`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`HackerRank returned HTTP ${res.status}`);
  const json = await res.json();
  const model = json?.model ?? {};
  return model.about ?? model.bio ?? model.about_me ?? "";
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  const rateLimit = checkRateLimit(`hmac:${ip}`, { limit: 15, windowMs: 60000 });
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment before trying again." },
      { status: 429, headers: getRateLimitHeaders(rateLimit) }
    );
  }

  let body: ChallengeRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 });
  }

  const { action, userId, provider, handle, challenge } = body;

  if (!userId || !provider || !handle) {
    return NextResponse.json(
      { error: "Missing required fields: userId, provider, and handle are required." },
      { status: 400 }
    );
  }

  if (provider !== "leetcode" && provider !== "hackerrank") {
    return NextResponse.json(
      { error: "Provider must be either 'leetcode' or 'hackerrank' for bio challenge verification." },
      { status: 400 }
    );
  }

  try {
    if (action === "create") {
      const { challengeCode, expiresAt } = createChallenge(userId, provider, handle);
      return NextResponse.json({
        success: true,
        action: "create",
        provider,
        handle,
        challengeCode,
        expiresAt,
        ttlMinutes: 15,
        instructions: `Paste '${challengeCode}' anywhere in your public ${
          provider === "leetcode" ? "LeetCode profile summary/bio" : "HackerRank 'About Me' bio"
        }. Once verified, you may safely delete it.`,
      });
    }

    if (action === "verify") {
      if (!challenge) {
        return NextResponse.json(
          { error: "Missing 'challenge' string for verification." },
          { status: 400 }
        );
      }

      // Signature and expiry are checked before any network call: a forged or stale
      // token must never be able to trigger a provider request.
      const check = checkToken(challenge, userId, provider, handle);
      if (!check.ok) {
        return NextResponse.json(
          { verified: false, error: "Challenge token is invalid or expired.", reason: check.reason },
          { status: check.status }
        );
      }

      let bio: string;
      try {
        bio = await fetchPublicBio(provider, handle);
      } catch (err) {
        return NextResponse.json(
          {
            verified: false,
            error: `Could not read the public ${provider} profile: ${
              err instanceof Error ? err.message : "provider unavailable"
            }.`,
            reason: "PROVIDER_UNAVAILABLE",
          },
          { status: 502 }
        );
      }

      if (!bio) {
        return NextResponse.json(
          {
            verified: false,
            error: `The public ${provider} profile for '${handle}' has no bio text. Make the profile public and add the code, then retry.`,
            reason: "NO_PUBLIC_BIO",
          },
          { status: 422 }
        );
      }

      // Exact token match inside the real bio, not a substring supplied by the caller.
      const verified = bio.includes(challenge.trim());

      return NextResponse.json({
        success: true,
        action: "verify",
        provider,
        handle,
        verified,
        verifiedAt: verified ? new Date().toISOString() : null,
        reason: verified ? "TOKEN_FOUND" : "TOKEN_NOT_IN_BIO",
        message: verified
          ? "Account ownership successfully verified! You can now remove the verification code from your profile."
          : "The challenge code was not found in your public profile bio. Paste it, save, and try again before the token expires.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'create' | 'verify'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("hmac-challenge error:", error);
    return NextResponse.json({ error: "Internal challenge handler error" }, { status: 500 });
  }
}
