import { test, describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import {
  generateSecureOTP,
  generateOtpSalt,
  hashOTP,
  verifyOTPHash,
  normalizeEmail,
  isValidInstitutionalDomain,
  getAllowedCollegeDomains,
  requestEmailOtp,
  verifyEmailOtp,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
} from "../src/lib/otp.ts";
import {
  getMockEmailQueue,
  clearMockEmailQueue,
  getEmailProvider,
} from "../src/lib/email/provider.ts";
import {
  buildStudentSession,
  signSessionToken,
  verifySessionToken,
  sanitizeReturnTo,
} from "../src/lib/auth.ts";
import {
  getDb,
  getRosterMemberById,
  markStudentEmailVerified,
  createEmailOtpChallenge,
  consumeOtpChallenge,
  getLatestActiveOtpChallenge,
  invalidateActiveOtpChallenges,
} from "../src/lib/db.ts";

// Set environment for test mode
process.env.NODE_ENV = "test";
process.env.EMAIL_PROVIDER = "mock";
process.env.TWM_SESSION_SECRET = "twm_test_secret_for_automated_testing_minimum_32_characters_long_123456";

describe("TWM College Email OTP Verification & Auth Hardening", () => {
  const db = getDb();

  // Test student from seeded roster
  const testStudentId = "usr-aarav";
  const testStudentEmail = "aarav.sharma2022@vitstudent.ac.in";
  const otherStudentId = "usr-priya";
  const otherStudentEmail = "priya.nair2022@vitstudent.ac.in";

  before(() => {
    // Reset test student email verified state for clean test run
    db.prepare("UPDATE roster_members SET email_verified = 0, email_verified_at = NULL WHERE id = ?").run(testStudentId);
    // Clear mock email queue
    clearMockEmailQueue();
  });

  after(() => {
    // Clean up challenges created during tests
    db.prepare("DELETE FROM email_otp_challenges WHERE student_id IN (?, ?)").run(testStudentId, otherStudentId);
  });

  // =========================================================================
  // 1. Cryptographic OTP Generation & Timing-Safe Comparison
  // =========================================================================
  describe("1. OTP Cryptography & Format", () => {
    it("generates cryptographically secure 6-digit numeric OTPs", () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateSecureOTP();
        assert.equal(typeof otp, "string");
        assert.equal(otp.length, 6);
        assert.match(otp, /^\d{6}$/);
        const num = parseInt(otp, 10);
        assert.ok(num >= 100000 && num <= 999999);
      }
    });

    it("generates unique salts and HMAC-SHA256 hashes", () => {
      const otp = "849201";
      const salt1 = generateOtpSalt();
      const salt2 = generateOtpSalt();
      assert.notEqual(salt1, salt2);
      assert.equal(salt1.length, 32); // 16 bytes hex

      const hash1 = hashOTP(otp, salt1);
      const hash2 = hashOTP(otp, salt2);
      assert.notEqual(hash1, hash2);
      assert.equal(hash1.length, 64); // 256 bits hex
      assert.equal(hashOTP(otp, salt1), hash1); // Deterministic with same salt
    });

    it("timing-safe comparison accepts correct OTP and rejects incorrect/malformed", () => {
      const otp = "654321";
      const salt = generateOtpSalt();
      const hash = hashOTP(otp, salt);

      assert.equal(verifyOTPHash(otp, hash, salt), true);
      assert.equal(verifyOTPHash("654320", hash, salt), false);
      assert.equal(verifyOTPHash("000000", hash, salt), false);
      assert.equal(verifyOTPHash("abc", hash, salt), false);
      assert.equal(verifyOTPHash("", hash, salt), false);
      assert.equal(verifyOTPHash("6543210", hash, salt), false);
    });
  });

  // =========================================================================
  // 2. Email Normalization & Institutional Domain Validation
  // =========================================================================
  describe("2. Email Normalization & Institutional Domain Validation", () => {
    it("normalizes email addresses correctly", () => {
      assert.equal(normalizeEmail("  Student.Name@College.EDU  "), "student.name@college.edu");
      assert.equal(normalizeEmail("USER@VITSTUDENT.AC.IN"), "user@vitstudent.ac.in");
      assert.equal(normalizeEmail(""), "");
    });

    it("accepts valid institutional domains from allowlist", () => {
      assert.equal(isValidInstitutionalDomain("aarav@vitstudent.ac.in"), true);
      assert.equal(isValidInstitutionalDomain("test@karunya.edu"), true);
      assert.equal(isValidInstitutionalDomain("dept@student.annauniv.edu"), true);
    });

    it("rejects unauthorized commercial and arbitrary domains", () => {
      assert.equal(isValidInstitutionalDomain("attacker@gmail.com"), false);
      assert.equal(isValidInstitutionalDomain("hacker@yahoo.com"), false);
      assert.equal(isValidInstitutionalDomain("student@unauthorized-school.edu"), false);
      assert.equal(isValidInstitutionalDomain("fake@phishing-ac.in"), false);
      assert.equal(isValidInstitutionalDomain("invalid-format"), false);
      assert.equal(isValidInstitutionalDomain(""), false);
    });
  });

  // =========================================================================
  // 3. OTP Request Flow & Transactional Email Delivery
  // =========================================================================
  describe("3. OTP Request Flow & Email Delivery", () => {
    it("successfully requests OTP and dispatches branded email to inbox", async () => {
      clearMockEmailQueue();

      const result = await requestEmailOtp({
        studentId: testStudentId,
        email: testStudentEmail,
        ipAddress: "127.0.0.1",
      });

      assert.equal(result.success, true);
      assert.ok(result.expiresAt);
      assert.ok(result.resendAvailableAt);

      const queue = getMockEmailQueue();
      assert.equal(queue.length, 1);
      assert.equal(queue[0].to, testStudentEmail);
      assert.match(queue[0].subject, /Verification Code/i);
      assert.match(queue[0].html, /Track\. Win\. Maintain/i);
      assert.match(queue[0].text, /10 minutes/i);

      // Extract the 6-digit OTP from email body
      const otpMatch = queue[0].text.match(/\b\d{6}\b/);
      assert.ok(otpMatch, "Email must contain 6-digit OTP code");
    });

    it("enforces resend cooldown preventing spam", async () => {
      const result = await requestEmailOtp({
        studentId: testStudentId,
        email: testStudentEmail,
        ipAddress: "127.0.0.1",
      });

      assert.equal(result.success, false);
      assert.equal(result.code, "COOLDOWN_ACTIVE");
      assert.match(result.message, /wait/i);
    });

    it("rejects request if student tries to claim another student's email", async () => {
      const result = await requestEmailOtp({
        studentId: testStudentId,
        email: otherStudentEmail, // Priya's email claimed by Aarav
        ipAddress: "127.0.0.1",
      });

      assert.equal(result.success, false);
      assert.equal(result.code, "EMAIL_INELIGIBLE");
    });

    it("rejects non-institutional email during OTP request", async () => {
      const result = await requestEmailOtp({
        studentId: testStudentId,
        email: "student@gmail.com",
        ipAddress: "127.0.0.1",
      });

      assert.equal(result.success, false);
      assert.equal(result.code, "INVALID_COLLEGE_DOMAIN");
    });
  });

  // =========================================================================
  // 4. OTP Verification, Atomic Consumption & Replay Prevention
  // =========================================================================
  describe("4. OTP Verification & Atomic Consumption", () => {
    it("rejects incorrect OTP and decrements remaining attempts", async () => {
      const verifyRes = await verifyEmailOtp({
        studentId: testStudentId,
        email: testStudentEmail,
        otp: "000000",
      });

      assert.equal(verifyRes.success, false);
      assert.equal(verifyRes.code, "INCORRECT_CODE");
      assert.equal(verifyRes.attemptsRemaining, 4);
    });

    it("rejects malformed OTP format", async () => {
      const verifyRes = await verifyEmailOtp({
        studentId: testStudentId,
        email: testStudentEmail,
        otp: "123", // too short
      });

      assert.equal(verifyRes.success, false);
      assert.equal(verifyRes.code, "INVALID_FORMAT");
    });

    it("accepts valid OTP, marks student verified in DB, and consumes challenge", async () => {
      const queue = getMockEmailQueue();
      const lastEmail = queue[queue.length - 1];
      const otp = lastEmail.text.match(/\b\d{6}\b/)[0];

      const verifyRes = await verifyEmailOtp({
        studentId: testStudentId,
        email: testStudentEmail,
        otp,
      });

      assert.equal(verifyRes.success, true);
      assert.equal(verifyRes.verifiedEmail, testStudentEmail);

      // Verify DB roster member was updated
      const student = getRosterMemberById(testStudentId);
      assert.equal(student?.email_verified, 1);
      assert.ok(student?.email_verified_at);

      // Verify challenge was atomically consumed
      const challenge = getLatestActiveOtpChallenge(testStudentId, testStudentEmail);
      assert.equal(challenge, undefined, "Consumed challenge must no longer be active");
    });

    it("rejects OTP replay after successful consumption", async () => {
      const queue = getMockEmailQueue();
      const lastEmail = queue[queue.length - 1];
      const otp = lastEmail.text.match(/\b\d{6}\b/)[0];

      // Second attempt with same code must fail
      const replayRes = await verifyEmailOtp({
        studentId: testStudentId,
        email: testStudentEmail,
        otp,
      });

      assert.equal(replayRes.success, false);
      assert.equal(replayRes.code, "NO_ACTIVE_CHALLENGE");
    });
  });

  // =========================================================================
  // 5. Expiration & Attempt Limit Enforcement
  // =========================================================================
  describe("5. Expiry and Lockout Enforcement", () => {
    it("rejects expired OTP challenge", async () => {
      const expiredChallengeId = `test-expired-${Date.now()}`;
      const otp = "777888";
      const salt = generateOtpSalt();
      const otpHash = hashOTP(otp, salt);

      createEmailOtpChallenge({
        id: expiredChallengeId,
        studentId: otherStudentId,
        email: otherStudentEmail,
        otpHash,
        salt,
        maxAttempts: 5,
        expiresAt: Date.now() - 5000, // expired 5 seconds ago
        resendAvailableAt: Date.now() + 60000,
      });

      const verifyRes = await verifyEmailOtp({
        studentId: otherStudentId,
        email: otherStudentEmail,
        otp,
      });

      assert.equal(verifyRes.success, false);
      assert.equal(verifyRes.code, "CODE_EXPIRED");
    });

    it("rejects verification once max attempts are exceeded", async () => {
      const lockChallengeId = `test-lock-${Date.now()}`;
      const otp = "111222";
      const salt = generateOtpSalt();
      const otpHash = hashOTP(otp, salt);

      // Reset any active challenges for otherStudent
      invalidateActiveOtpChallenges(otherStudentId, otherStudentEmail);

      createEmailOtpChallenge({
        id: lockChallengeId,
        studentId: otherStudentId,
        email: otherStudentEmail,
        otpHash,
        salt,
        maxAttempts: 3,
        expiresAt: Date.now() + 600000,
        resendAvailableAt: Date.now() + 60000,
      });

      // Submit 3 wrong attempts
      await verifyEmailOtp({ studentId: otherStudentId, email: otherStudentEmail, otp: "999001" });
      await verifyEmailOtp({ studentId: otherStudentId, email: otherStudentEmail, otp: "999002" });
      const third = await verifyEmailOtp({ studentId: otherStudentId, email: otherStudentEmail, otp: "999003" });

      assert.equal(third.attemptsRemaining, 0);

      // 4th attempt must be rejected for exceeding max attempts
      const fourth = await verifyEmailOtp({ studentId: otherStudentId, email: otherStudentEmail, otp: otp });
      assert.equal(fourth.success, false);
      assert.equal(fourth.code, "MAX_ATTEMPTS_EXCEEDED");
    });
  });

  // =========================================================================
  // 6. Security Hardening: CSRF, Open Redirect & Session Integrity
  // =========================================================================
  describe("6. Auth Security Hardening", () => {
    it("sanitizeReturnTo blocks open redirect attacks", () => {
      // Safe internal routes allowed
      assert.equal(sanitizeReturnTo("/dashboard"), "/dashboard");
      assert.equal(sanitizeReturnTo("/settings?tab=privacy"), "/settings?tab=privacy");
      assert.equal(sanitizeReturnTo("/onboarding"), "/onboarding");

      // Malicious external and open-redirect vectors sanitized to /dashboard
      assert.equal(sanitizeReturnTo("https://attacker.com"), "/dashboard");
      assert.equal(sanitizeReturnTo("//attacker.com"), "/dashboard");
      assert.equal(sanitizeReturnTo("/\\attacker.com"), "/dashboard");
      assert.equal(sanitizeReturnTo("javascript:alert(1)"), "/dashboard");
      assert.equal(sanitizeReturnTo(""), "/dashboard");
      assert.equal(sanitizeReturnTo(null), "/dashboard");
    });

    it("session token includes verified email flag and resists tampering", () => {
      const student = getRosterMemberById(testStudentId);
      assert.ok(student);

      const session = buildStudentSession(student, "LEGAL_NAME");
      assert.equal(session.emailVerified, true);

      const token = signSessionToken(session);
      assert.ok(token);

      const decoded = verifySessionToken(token);
      assert.ok(decoded);
      assert.equal(decoded.studentId, testStudentId);
      assert.equal(decoded.emailVerified, true);

      // Tampered token test (modify payload in token)
      const parts = token.split(".");
      const tamperedPayload = Buffer.from(JSON.stringify({ ...session, studentId: "forged" })).toString("base64url");
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2]}`;

      const tamperedResult = verifySessionToken(tamperedToken);
      assert.equal(tamperedResult, null, "Tampered signature must fail verification closed");
    });
  });
});
