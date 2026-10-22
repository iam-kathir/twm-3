import crypto from "node:crypto";
import { getDb, type RosterMemberRow } from "./db.ts";
import { isValidInstitutionalDomain } from "./otp.ts";

export type IdentityTier = "LEGAL_NAME" | "HANDLE_ONLY" | "ANONYMOUS";

export interface StudentSession {
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  classSection: string;
  handleGithub: string | null;
  handleLeetcode: string | null;
  handleHackerrank: string | null;
  identityTier: IdentityTier;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;
  issuedAt: number;
  expiresAt: number;
}

const SESSION_COOKIE_NAME = "twm_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const CSRF_COOKIE_NAME = "twm_oauth_csrf";

/**
 * Returns session secret. In production, requires strong 32+ char secret.
 */
export function getSessionSecret(): string {
  const secret = process.env.TWM_SESSION_SECRET;
  if (!secret || secret.trim().length === 0) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: TWM_SESSION_SECRET must be configured in production environment.");
    }
    return "twm-insecure-dev-session-secret-change-in-prod-7f89b";
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error("FATAL: TWM_SESSION_SECRET must be at least 32 characters in production.");
  }
  return secret;
}

/**
 * Validates if an email belongs to an institutional college/university domain (§6.1, §17.4).
 */
export function isInstitutionalCollegeEmail(email: string): boolean {
  return isValidInstitutionalDomain(email);
}

/**
 * Validates returnTo path to prevent open redirects
 */
export function sanitizeReturnTo(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "/dashboard";
  const trimmed = url.trim();
  // Safe relative paths start with single slash, not followed by / or \
  if (trimmed.startsWith("/") && !trimmed.startsWith("//") && !trimmed.startsWith("/\\")) {
    return trimmed;
  }
  return "/dashboard";
}

/**
 * Signs a session payload into a tamper-proof stateless token: <base64url-payload>.<hmac-sha256>
 */
export function signSessionToken(session: StudentSession): string {
  const secret = getSessionSecret();
  const payloadStr = JSON.stringify(session);
  const payloadBase64 = Buffer.from(payloadStr, "utf-8").toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(payloadBase64).digest("base64url");
  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a session token string, ensuring HMAC validity, schema shape, and expiration.
 */
export function verifySessionToken(token: string): StudentSession | null {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadBase64, providedSig] = parts;
  const secret = getSessionSecret();
  const expectedSig = crypto.createHmac("sha256", secret).update(payloadBase64).digest("base64url");

  // Constant-time comparison against timing attacks
  const expectedBuf = Buffer.from(expectedSig);
  const providedBuf = Buffer.from(providedSig);
  if (expectedBuf.length !== providedBuf.length || !crypto.timingSafeEqual(expectedBuf, providedBuf)) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    const session = JSON.parse(jsonStr) as StudentSession;

    // Validate payload schema structure
    if (!session.studentId || !session.rollNo || !session.expiresAt || !session.issuedAt) {
      return null;
    }

    // Check expiration
    if (Date.now() > session.expiresAt) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Formats a student's public display name based on their active Identity Tier (§18.1).
 */
export function formatStudentDisplayName(student: {
  name: string;
  rollNo: string;
  handleGithub?: string | null;
  identityTier?: IdentityTier;
}): string {
  const tier = student.identityTier || "LEGAL_NAME";
  switch (tier) {
    case "HANDLE_ONLY":
      return student.handleGithub ? `@${student.handleGithub}` : student.rollNo;
    case "ANONYMOUS": {
      // Deterministic anonymous label based on roll number hash: "Candidate #42"
      const hash = crypto.createHash("md5").update(student.rollNo).digest("hex");
      const shortNum = parseInt(hash.slice(0, 4), 16) % 900 + 100;
      return `Candidate #${shortNum}`;
    }
    case "LEGAL_NAME":
    default:
      return student.name;
  }
}

/**
 * Retrieves the current student session from HTTP cookies, loading authoritative
 * verification status directly from the SQLite database.
 */
export async function getCurrentSession(): Promise<StudentSession | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    const session = verifySessionToken(sessionCookie.value);
    if (!session) return null;

    // Load authoritative verification state from database
    const db = getDb();
    const member = db.prepare("SELECT email_verified, email_verified_at, email FROM roster_members WHERE id = ?").get(session.studentId) as { email_verified: number; email_verified_at: string | null; email: string } | undefined;
    if (member) {
      session.emailVerified = Boolean(member.email_verified);
      session.emailVerifiedAt = member.email_verified_at;
      session.email = member.email;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Creates and sets an HTTP-only session cookie for the given student roster record.
 */
export function buildStudentSession(
  member: RosterMemberRow,
  identityTier: IdentityTier = "LEGAL_NAME",
  overrideVerified?: boolean
): StudentSession {
  const now = Date.now();
  const isVerified = overrideVerified !== undefined ? overrideVerified : Boolean(member.email_verified);
  return {
    studentId: member.id,
    rollNo: member.roll_no,
    name: member.name,
    email: member.email,
    classSection: member.class_section,
    handleGithub: member.handle_github,
    handleLeetcode: member.handle_leetcode,
    handleHackerrank: member.handle_hackerrank,
    identityTier,
    emailVerified: isVerified,
    emailVerifiedAt: isVerified ? (member.email_verified_at || new Date().toISOString()) : null,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
  };
}

export { SESSION_COOKIE_NAME, CSRF_COOKIE_NAME, SESSION_TTL_SECONDS };

