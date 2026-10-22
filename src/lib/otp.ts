import crypto from "node:crypto";
import {
  createEmailOtpChallenge,
  getLatestActiveOtpChallenge,
  incrementOtpChallengeAttempts,
  consumeOtpChallenge,
  invalidateActiveOtpChallenges,
  markStudentEmailVerified,
  getRosterMemberById,
  getRosterMemberByEmail,
  type EmailOtpChallengeRow,
} from "./db.ts";
import { getEmailProvider } from "./email/provider.ts";
import { buildOtpEmailContent } from "./email/template.ts";
import { checkRateLimit } from "./rate-limit.ts";

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const OTP_MAX_ATTEMPTS = 5;

/**
 * Normalizes email address server-side
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
}

/**
 * Resolves allowed institutional college domains.
 * Prioritizes COLLEGE_EMAIL_DOMAINS environment variable over hardcoded defaults.
 */
export function getAllowedCollegeDomains(): string[] {
  const configured = process.env.COLLEGE_EMAIL_DOMAINS;
  if (configured && configured.trim().length > 0) {
    return configured
      .split(",")
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean);
  }
  // Default institutional pilot domains
  return ["karunya.edu", "vitstudent.ac.in", "student.annauniv.edu"];
}

/**
 * Strict institutional domain validation.
 * Does NOT assume arbitrary .edu or .ac.in addresses belong to the institution.
 */
export function isValidInstitutionalDomain(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized || !normalized.includes("@")) return false;

  const parts = normalized.split("@");
  if (parts.length !== 2 || !parts[1]) return false;
  const domain = parts[1];

  const allowed = getAllowedCollegeDomains();
  return allowed.some((allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`));
}

/**
 * Cryptographically secure 6-digit numeric OTP generation
 */
export function generateSecureOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Generates a random cryptographic salt for OTP storage
 */
export function generateOtpSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Salted HMAC-SHA256 hash for OTP persistence
 */
export function hashOTP(otp: string, salt: string): string {
  return crypto.createHmac("sha256", salt).update(otp).digest("hex");
}

/**
 * Constant-time comparison between candidate OTP and stored hash
 */
export function verifyOTPHash(candidateOtp: string, expectedHash: string, salt: string): boolean {
  if (!candidateOtp || candidateOtp.length !== 6 || !/^\d{6}$/.test(candidateOtp)) {
    return false;
  }
  const candidateHash = hashOTP(candidateOtp, salt);
  const candidateBuf = Buffer.from(candidateHash, "hex");
  const expectedBuf = Buffer.from(expectedHash, "hex");

  if (candidateBuf.length !== expectedBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuf, expectedBuf);
}

export interface RequestOtpParams {
  studentId: string;
  email: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export type OtpRequestFailureReason =
  | "INVALID_COLLEGE_DOMAIN"
  | "DOMAIN_NOT_ALLOWED"
  | "RATE_LIMITED"
  | "ROSTER_NOT_FOUND"
  | "ROSTER_MISMATCH"
  | "EMAIL_INELIGIBLE"
  | "COOLDOWN_ACTIVE"
  | "EMAIL_DELIVERY_FAILED"
  | "DELIVERY_FAILED";

export interface RequestOtpResult {
  success: boolean;
  code?: OtpRequestFailureReason;
  reason?: OtpRequestFailureReason;
  message: string;
  resendAvailableAt?: number;
  cooldownSeconds?: number;
  expiresAt?: number;
}

/**
 * Executes Step B — Request an Email OTP
 */
export async function requestEmailOtp(params: RequestOtpParams): Promise<RequestOtpResult> {
  const normalizedEmail = normalizeEmail(params.email);

  if (!normalizedEmail || !isValidInstitutionalDomain(normalizedEmail)) {
    return {
      success: false,
      code: "INVALID_COLLEGE_DOMAIN",
      reason: "DOMAIN_NOT_ALLOWED",
      message: "Please enter an eligible institutional college email address.",
    };
  }

  // Rate Limiting by IP and by Student ID
  if (params.ipAddress) {
    const ipCheck = checkRateLimit(`otp-req-ip:${params.ipAddress}`, { limit: 10, windowMs: 600000 });
    if (!ipCheck.allowed) {
      return {
        success: false,
        code: "RATE_LIMITED",
        reason: "RATE_LIMITED",
        message: "Too many verification requests from this network. Please wait a few minutes.",
      };
    }
  }

  const studentCheck = checkRateLimit(`otp-req-student:${params.studentId}`, { limit: 5, windowMs: 600000 });
  if (!studentCheck.allowed) {
    return {
      success: false,
      code: "RATE_LIMITED",
      reason: "RATE_LIMITED",
      message: "Too many verification requests for this account. Please wait before requesting another code.",
    };
  }

  // Verify student exists on authoritative roster
  const student = getRosterMemberById(params.studentId);
  if (!student) {
    return {
      success: false,
      code: "ROSTER_NOT_FOUND",
      reason: "ROSTER_MISMATCH",
      message: "Authenticated student record was not found on the class roster.",
    };
  }

  // Cross-check: A student cannot claim another student's email
  const existingWithEmail = getRosterMemberByEmail(normalizedEmail);
  if (existingWithEmail && existingWithEmail.id !== student.id) {
    // Neutral response to avoid email enumeration
    return {
      success: false,
      code: "EMAIL_INELIGIBLE",
      reason: "ROSTER_MISMATCH",
      message: "This email address cannot be verified for your account.",
    };
  }

  // Check resend cooldown on existing active challenge
  const activeChallenge = getLatestActiveOtpChallenge(student.id, normalizedEmail);
  const now = Date.now();
  if (activeChallenge && activeChallenge.resend_available_at > now) {
    const remainingSecs = Math.ceil((activeChallenge.resend_available_at - now) / 1000);
    return {
      success: false,
      code: "COOLDOWN_ACTIVE",
      reason: "COOLDOWN_ACTIVE",
      message: `A verification code was recently sent. Please wait ${remainingSecs}s before requesting a new code.`,
      resendAvailableAt: activeChallenge.resend_available_at,
      cooldownSeconds: remainingSecs,
    };
  }

  // Invalidate any previously active challenges for this student/email
  invalidateActiveOtpChallenges(student.id, normalizedEmail);

  // Generate OTP, salt, and hash
  const rawOtp = generateSecureOTP();
  const salt = generateOtpSalt();
  const otpHash = hashOTP(rawOtp, salt);

  const expiresAt = now + OTP_TTL_MS;
  const resendAvailableAt = now + OTP_RESEND_COOLDOWN_MS;
  const challengeId = `otp-${now}-${crypto.randomBytes(6).toString("hex")}`;

  // Persist challenge in SQLite
  createEmailOtpChallenge({
    id: challengeId,
    studentId: student.id,
    email: normalizedEmail,
    otpHash,
    salt,
    maxAttempts: OTP_MAX_ATTEMPTS,
    expiresAt,
    resendAvailableAt,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  // Render branded email and dispatch via email provider
  const emailProvider = getEmailProvider();
  const emailContent = buildOtpEmailContent({
    name: student.name,
    otp: rawOtp,
    expiryMinutes: 10,
    rollNo: student.roll_no,
  });

  const sendResult = await emailProvider.sendEmail({
    to: normalizedEmail,
    subject: emailContent.subject,
    html: emailContent.html,
    text: emailContent.text,
  });

  if (!sendResult.success) {
    // Invalidate challenge if email delivery actually failed
    invalidateActiveOtpChallenges(student.id, normalizedEmail);

    return {
      success: false,
      code: "EMAIL_DELIVERY_FAILED",
      reason: "DELIVERY_FAILED",
      message: "Could not deliver verification email. Please check your address or contact your instructor.",
    };
  }

  return {
    success: true,
    message: "A 6-digit verification code has been dispatched to your college email.",
    expiresAt,
    resendAvailableAt,
    cooldownSeconds: 60,
  };
}

export interface VerifyOtpParams {
  studentId: string;
  email?: string;
  otp: string;
  ipAddress?: string | null;
}

export type OtpVerifyFailureReason =
  | "INVALID_FORMAT"
  | "RATE_LIMITED"
  | "ROSTER_NOT_FOUND"
  | "NO_ACTIVE_CHALLENGE"
  | "CHALLENGE_NOT_FOUND"
  | "CODE_EXPIRED"
  | "EXPIRED"
  | "MAX_ATTEMPTS_EXCEEDED"
  | "INCORRECT_CODE"
  | "INVALID_OTP"
  | "CHALLENGE_ALREADY_USED";

export interface VerifyOtpResult {
  success: boolean;
  code?: OtpVerifyFailureReason;
  reason?: OtpVerifyFailureReason;
  message: string;
  verifiedEmail?: string;
  attemptsRemaining?: number;
}

/**
 * Executes Step D — Verify the Submitted OTP
 */
export async function verifyEmailOtp(params: VerifyOtpParams): Promise<VerifyOtpResult> {
  const cleanOtp = (params.otp || "").trim();

  if (!cleanOtp || !/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      code: "INVALID_FORMAT",
      reason: "INVALID_FORMAT",
      message: "Please enter a valid 6-digit numeric verification code.",
    };
  }

  // Rate Limiting by IP
  if (params.ipAddress) {
    const ipCheck = checkRateLimit(`otp-verify-ip:${params.ipAddress}`, { limit: 15, windowMs: 300000 });
    if (!ipCheck.allowed) {
      return {
        success: false,
        code: "RATE_LIMITED",
        reason: "RATE_LIMITED",
        message: "Too many verification attempts from this network. Please wait a few minutes.",
      };
    }
  }

  const student = getRosterMemberById(params.studentId);
  if (!student) {
    return {
      success: false,
      code: "ROSTER_NOT_FOUND",
      reason: "ROSTER_NOT_FOUND",
      message: "Authenticated student record was not found on the class roster.",
    };
  }

  const targetEmail = normalizeEmail(params.email || student.email);

  // Find latest active challenge for this student & email
  const challenge = getLatestActiveOtpChallenge(student.id, targetEmail);
  if (!challenge) {
    return {
      success: false,
      code: "NO_ACTIVE_CHALLENGE",
      reason: "CHALLENGE_NOT_FOUND",
      message: "No active verification challenge found. Please request a new code.",
    };
  }

  const now = Date.now();

  // Check expiration
  if (now > challenge.expires_at) {
    return {
      success: false,
      code: "CODE_EXPIRED",
      reason: "EXPIRED",
      message: "This verification code has expired. Please request a fresh code.",
    };
  }

  // Check attempts
  if (challenge.attempts >= challenge.max_attempts) {
    return {
      success: false,
      code: "MAX_ATTEMPTS_EXCEEDED",
      reason: "MAX_ATTEMPTS_EXCEEDED",
      message: "Maximum verification attempts exceeded. Please request a new code.",
    };
  }

  // Check constant-time hash match
  const matches = verifyOTPHash(cleanOtp, challenge.otp_hash, challenge.salt);

  if (!matches) {
    incrementOtpChallengeAttempts(challenge.id);
    const remainingAttempts = challenge.max_attempts - (challenge.attempts + 1);
    return {
      success: false,
      code: "INCORRECT_CODE",
      reason: "INVALID_OTP",
      attemptsRemaining: Math.max(0, remainingAttempts),
      message: remainingAttempts > 0
        ? `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`
        : "Incorrect code. Maximum attempts reached. Please request a new code.",
    };
  }

  // Atomic consumption of challenge
  const consumed = consumeOtpChallenge(challenge.id, now);
  if (!consumed) {
    return {
      success: false,
      code: "CHALLENGE_ALREADY_USED",
      reason: "CHALLENGE_ALREADY_USED",
      message: "This verification challenge has already been consumed or has expired.",
    };
  }

  // Persist verified email state on roster member
  markStudentEmailVerified(student.id, challenge.email);

  return {
    success: true,
    message: "Your institutional college email has been successfully verified.",
    verifiedEmail: challenge.email,
  };
}
