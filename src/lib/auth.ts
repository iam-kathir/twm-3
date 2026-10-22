import crypto from "node:crypto";
import { getDb, type RosterMemberRow } from "./db.ts";

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
  issuedAt: number;
  expiresAt: number;
}

const SESSION_COOKIE_NAME = "twm_session";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const CSRF_COOKIE_NAME = "twm_oauth_csrf";

function getSessionSecret(): string {
  return process.env.TWM_SESSION_SECRET || "twm-insecure-dev-session-secret-change-in-prod-7f89b";
}

/**
 * Validates if an email belongs to an institutional college/university domain (§6.1, §17.4).
 */
export function isInstitutionalCollegeEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase();
  return (
    domain.endsWith(".edu") ||
    domain.endsWith(".edu.in") ||
    domain.endsWith(".ac.in") ||
    domain.endsWith(".ernet.in") ||
    domain.includes("karunya.edu") ||
    domain.includes("university.edu")
  );
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
 * Verifies a session token string, ensuring HMAC validity and expiration.
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
 * Retrieves the current student session from HTTP cookies.
 */
export async function getCurrentSession(): Promise<StudentSession | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) return null;
    return verifySessionToken(sessionCookie.value);
  } catch {
    return null;
  }
}

/**
 * Creates and sets an HTTP-only session cookie for the given student roster record.
 */
export function buildStudentSession(
  member: RosterMemberRow,
  identityTier: IdentityTier = "LEGAL_NAME"
): StudentSession {
  const now = Date.now();
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
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS * 1000,
  };
}

export { SESSION_COOKIE_NAME, CSRF_COOKIE_NAME, SESSION_TTL_SECONDS };
