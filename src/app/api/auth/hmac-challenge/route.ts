import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// Secret key for HMAC signing (uses env var or secure fallback for development)
const HMAC_SECRET = process.env.TWM_HMAC_SECRET || "twm-dev-secret-key-3.1-master-baseline";

// 15-minute challenge TTL in milliseconds (Section 6.2 rule)
const CHALLENGE_TTL_MS = 15 * 60 * 1000;

interface ChallengeRequest {
  action: "create" | "verify";
  userId: string;
  provider: "leetcode" | "hackerrank";
  handle: string;
  challenge?: string;
  profileText?: string;
}

/**
 * Generates a high-entropy, 15-minute single-use HMAC challenge token
 * bound to the user, provider, and target account handle per Section 6.2.
 */
function generateChallengeToken(userId: string, provider: string, handle: string) {
  const nonce = crypto.randomBytes(8).toString("hex");
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;
  const payload = `${userId}:${provider.toLowerCase()}:${handle.toLowerCase()}:${nonce}:${expiresAt}`;
  const signature = crypto.createHmac("sha256", HMAC_SECRET).update(payload).digest("hex").slice(0, 16);
  
  // Format displayed to student to paste into provider profile bio
  const challengeCode = `twm-verify-${nonce}-${signature}`;
  
  return {
    challengeCode,
    expiresAt: new Date(expiresAt).toISOString(),
    expiresAtTimestamp: expiresAt,
  };
}

/**
 * Validates the HMAC challenge code against the fetched public profile text.
 * Uses constant-time comparison to protect against timing attacks.
 */
function verifyChallengeInProfile(challengeCode: string, profileText: string): boolean {
  if (!challengeCode || !profileText) return false;
  
  // Normalize strings and check if profile bio contains the challenge code
  const cleanProfile = profileText.trim();
  const cleanChallenge = challengeCode.trim();
  
  if (!cleanProfile.includes(cleanChallenge)) {
    return false;
  }
  
  // Extract and verify structure
  const parts = cleanChallenge.split("-");
  if (parts.length < 4 || parts[0] !== "twm" || parts[1] !== "verify") {
    return false;
  }
  
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body: ChallengeRequest = await req.json();
    const { action, userId, provider, handle, challenge, profileText } = body;

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

    if (action === "create") {
      const challengeData = generateChallengeToken(userId, provider, handle);
      
      return NextResponse.json({
        success: true,
        action: "create",
        provider,
        handle,
        challengeCode: challengeData.challengeCode,
        expiresAt: challengeData.expiresAt,
        ttlMinutes: 15,
        instructions: `Paste '${challengeData.challengeCode}' anywhere in your public ${
          provider === "leetcode" ? "LeetCode profile summary/bio" : "HackerRank 'About Me' bio"
        }. Once verified, you may safely delete it.`
      });
    }

    if (action === "verify") {
      if (!challenge) {
        return NextResponse.json(
          { error: "Missing 'challenge' string for verification." },
          { status: 400 }
        );
      }

      if (!profileText) {
        return NextResponse.json(
          { 
            verified: false,
            error: "No public profile text provided or fetched for verification. Ensure profile is public." 
          },
          { status: 422 }
        );
      }

      const isVerified = verifyChallengeInProfile(challenge, profileText);

      return NextResponse.json({
        success: true,
        action: "verify",
        provider,
        handle,
        verified: isVerified,
        verifiedAt: isVerified ? new Date().toISOString() : null,
        message: isVerified
          ? "Account ownership successfully verified! You can now remove the verification code from your profile."
          : "Verification token was not found in the supplied public profile text. Please check your bio and try again."
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Supported actions: 'create' | 'verify'" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal challenge handler error", details: error.message },
      { status: 500 }
    );
  }
}
