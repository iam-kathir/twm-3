"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  ShieldCheck,
  Github,
  Code2,
  Award,
  ArrowRight,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Sliders,
  UserCheck,
  Mail,
  KeyRound,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

interface StudentSessionData {
  studentId: string;
  rollNo: string;
  name: string;
  email: string;
  handleGithub: string;
  emailVerified: boolean;
  emailVerifiedAt?: string | null;
  cohort?: string;
}

function errorMessageFromStatus(status: number, data: any, fallback: string): string {
  const serverMsg = data?.message || data?.error;
  if (status === 429) {
    const wait = data?.retryAfterSeconds ?? data?.cooldownSeconds;
    return serverMsg
      ? `${serverMsg}${wait ? ` Try again in ${wait} seconds.` : ""}`
      : `Too many requests. Please wait${wait ? ` ${wait} seconds` : " a moment"} and try again.`;
  }
  if (status >= 500) {
    return serverMsg ?? "The verification service returned a server error. Please try again shortly.";
  }
  return serverMsg ?? fallback;
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUnmatched = searchParams.get("unmatched_roster") === "true";
  const unmatchedGithub = searchParams.get("github") || "";
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loadingSession, setLoadingSession] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [sessionNonce, setSessionNonce] = useState(0);
  const [student, setStudent] = useState<StudentSessionData | null>(null);

  // Email OTP Verification State
  const [emailInput, setEmailInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [expiryRemaining, setExpiryRemaining] = useState(0);

  // Privacy Preferences State
  const [optInLeaderboard, setOptInLeaderboard] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(true);

  // LeetCode HMAC Challenge State
  const [challengeCode, setChallengeCode] = useState("");
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const [verifyingLeetCode, setVerifyingLeetCode] = useState(false);
  const [leetCodeVerified, setLeetCodeVerified] = useState(false);
  const [leetCodeError, setLeetCodeError] = useState<string | null>(null);
  const [hackerRankUsername, setHackerRankUsername] = useState("");

  // Load authenticated session on mount
  useEffect(() => {
    async function loadSession() {
      setLoadingSession(true);
      setSessionError(null);
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (!res.ok && !data.authenticated && !data.fallbackDefaultUser) {
          throw new Error(errorMessageFromStatus(res.status, data, "Could not load your student session."));
        }
        if (data.authenticated && data.session) {
          const s = data.session;
          setStudent({
            studentId: s.studentId,
            rollNo: s.rollNo,
            name: s.name,
            email: s.email,
            handleGithub: s.handleGithub,
            emailVerified: Boolean(s.emailVerified),
            emailVerifiedAt: s.emailVerifiedAt,
            cohort: "B.Tech CSE - Batch 2026 (Sec A)",
          });
          setEmailInput(s.email || "");
        } else if (data.fallbackDefaultUser) {
          const fallback = data.fallbackDefaultUser;
          setStudent({
            studentId: fallback.id,
            rollNo: fallback.rollNo,
            name: fallback.name,
            email: fallback.email,
            handleGithub: fallback.handleGithub,
            emailVerified: false,
            cohort: "B.Tech CSE - Batch 2026 (Sec A)",
          });
          setEmailInput(fallback.email || "");
        } else {
          setStudent(null);
          setSessionError("No authenticated student session was found. Sign in again to continue onboarding.");
        }
      } catch (err) {
        console.error("Failed to load student session:", err);
        setSessionError(
          err instanceof Error && err.message
            ? err.message
            : "Failed to load your student session. Check your connection and retry."
        );
      } finally {
        setLoadingSession(false);
      }
    }

    loadSession();
  }, [sessionNonce]);

  // Cooldown & Expiry countdown timers
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (expiryRemaining <= 0) return;
    const timer = setInterval(() => {
      setExpiryRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [expiryRemaining]);

  // Request Email OTP
  const handleRequestOtp = async () => {
    if (!emailInput.trim() || sendingOtp || cooldownRemaining > 0) return;

    setSendingOtp(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/email/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOtpRequested(true);
        setCooldownRemaining(data.cooldownSeconds || 60);
        setExpiryRemaining(600); // 10 minutes
        setOtpSuccessMsg(data.message || "Verification code sent to your institutional inbox.");
      } else {
        if (res.status === 429 && (data.cooldownSeconds ?? data.retryAfterSeconds)) {
          setCooldownRemaining(data.cooldownSeconds ?? data.retryAfterSeconds);
        }
        setOtpError(errorMessageFromStatus(res.status, data, "Failed to request verification code."));
      }
    } catch {
      setOtpError("Network error. Unable to reach verification service.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Verify Submitted OTP
  const handleVerifyOtp = async () => {
    if (!otpInput.trim() || verifyingOtp) return;

    setVerifyingOtp(true);
    setOtpError(null);

    try {
      const res = await fetch("/api/auth/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          otp: otpInput.trim(),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStudent((prev) => (prev ? { ...prev, emailVerified: true } : null));
        setOtpSuccessMsg("College email verified successfully! Identity unlocked.");
        setOtpRequested(false);
        setOtpInput("");
      } else {
        const errorMsg =
          res.status === 429
            ? errorMessageFromStatus(res.status, data, "Verification failed.")
            : data.attemptsRemaining !== undefined
              ? `${data.message} (${data.attemptsRemaining} attempts remaining)`
              : errorMessageFromStatus(res.status, data, "Verification failed.");
        setOtpError(errorMsg);
      }
    } catch {
      setOtpError("Network failure. Verification could not be confirmed.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  // HMAC Challenge for LeetCode
  useEffect(() => {
    if (step === 3 && !leetCodeVerified && student) {
      let cancelled = false;
      setChallengeLoading(true);
      setLeetCodeError(null);
      fetch("/api/auth/hmac-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: student.studentId,
          provider: "leetcode",
          handle: "aarav_coder",
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (cancelled) return;
          if (res.ok && data.challengeCode) {
            setChallengeCode(data.challengeCode);
          } else {
            setLeetCodeError(errorMessageFromStatus(res.status, data, "Could not generate a verification challenge. Try again."));
          }
        })
        .catch(() => {
          if (!cancelled) setLeetCodeError("Could not reach the verification route. Try again.");
        })
        .finally(() => {
          if (!cancelled) setChallengeLoading(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [step, leetCodeVerified, student]);

  const copyChallenge = async () => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(challengeCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Could not copy the code automatically. Select the code above and copy it manually.");
    }
  };

  const verifyLeetCode = async () => {
    if (!student) return;
    setVerifyingLeetCode(true);
    setLeetCodeError(null);
    try {
      const res = await fetch("/api/auth/hmac-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          userId: student.studentId,
          provider: "leetcode",
          handle: "aarav_coder",
          challenge: challengeCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setLeetCodeVerified(true);
      } else {
        setLeetCodeError(errorMessageFromStatus(res.status, data, "Verification failed. Make sure the challenge code is pasted in your public LeetCode bio."));
      }
    } catch {
      setLeetCodeError("Could not reach the verification route. Try again.");
    } finally {
      setVerifyingLeetCode(false);
    }
  };

  const handleFinish = () => {
    router.push(returnTo);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  if (isUnmatched) {
    return (
      <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-accent selection:text-canvas relative overflow-hidden bg-tech-dots">
        <header className="p-6 relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
          <BrandLogo showLivePulse={true} />
        </header>

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg rounded-panel border border-status-error/30 bg-surface p-8 sm:p-10 shadow-none space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Roster Match Not Found</h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                GitHub account <span className="font-semibold text-white">@{unmatchedGithub}</span> is not listed
                on the active cohort roster.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] text-sm text-muted text-left space-y-2">
              <p className="text-white font-semibold">Authorized Cohort Enrolment Required:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Verify you signed into GitHub with your college-linked handle.</li>
                <li>Contact the course coordinator if your registration was recently updated.</li>
              </ul>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full py-3.5 rounded-xl bg-surface-raised hover:bg-white/10 border border-white/10 text-white font-bold text-sm items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </main>

        <footer className="p-6 text-center text-sm text-muted">
          TWM 3.1 • Zero Fabrication Enforced
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-accent selection:text-canvas relative overflow-hidden bg-tech-dots">
      {/* Header */}
      <header className="p-6 relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <BrandLogo showLivePulse={true} />

        {/* Step Indicator */}
        <nav aria-label="Onboarding progress" className="flex items-center gap-2 text-sm text-muted">
          <span
            aria-current={step === 1 ? "step" : undefined}
            className={`px-2.5 py-1 rounded-full ${
              step === 1 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"
            }`}
          >
            1. Identity &amp; Email
          </span>
          <span className="text-white/40" aria-hidden="true">&rarr;</span>
          <span
            aria-current={step === 2 ? "step" : undefined}
            className={`px-2.5 py-1 rounded-full ${
              step === 2 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"
            }`}
          >
            2. Privacy
          </span>
          <span className="text-white/40" aria-hidden="true">&rarr;</span>
          <span
            aria-current={step === 3 ? "step" : undefined}
            className={`px-2.5 py-1 rounded-full ${
              step === 3 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"
            }`}
          >
            3. Accounts
          </span>
        </nav>
      </header>

      {/* Main Step Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-panel border border-white/10 bg-surface p-8 sm:p-10 shadow-none">
          {loadingSession ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted" role="status" aria-live="polite">
              <Loader2 className="h-6 w-6 animate-spin text-accent" aria-hidden="true" />
              <p className="text-sm">Loading student identity session…</p>
            </div>
          ) : sessionError || !student ? (
            <div className="py-8 space-y-5">
              <div role="alert" className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-300 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">Identity session unavailable</h1>
                  <p className="leading-relaxed mt-1">{sessionError ?? "We could not verify your student identity."}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setSessionNonce((n) => n + 1)}
                  className="flex-1 py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-semibold text-base flex items-center justify-center gap-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  <span>Retry Loading Session</span>
                </button>
                <Link
                  href="/login"
                  className="flex-1 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 text-muted hover:text-white transition-colors text-sm font-semibold flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span>Back to Login</span>
                </Link>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* STEP 1: Identity & College Email OTP Verification */}
              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold mb-3">
                      <UserCheck className="h-4 w-4" aria-hidden="true" />
                      <span>Roster Match Confirmed</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Confirm Student Identity
                    </h1>
                    <p className="text-sm text-muted mt-2 leading-relaxed">
                      Verify your institutional college email via one-time passcode (OTP) to unlock competitive class
                      rankings.
                    </p>
                  </div>

                  {/* Student Card */}
                  <div className="p-5 rounded-2xl bg-surface-raised border border-white/[0.08] text-sm space-y-3 shadow-inner">
                    <div className="flex justify-between pb-2.5 border-b border-white/[0.06]">
                      <span className="text-muted text-sm">Student Name:</span>
                      <span className="text-white font-bold text-sm">{student?.name ?? "Unavailable"}</span>
                    </div>
                    <div className="flex justify-between pb-2.5 border-b border-white/[0.06]">
                      <span className="text-muted text-sm">Register Number:</span>
                      <span className="text-accent font-bold text-sm">{student?.rollNo ?? "Unavailable"}</span>
                    </div>
                    <div className="flex justify-between pb-2.5 border-b border-white/[0.06]">
                      <span className="text-muted text-sm">Cohort:</span>
                      <span className="text-ink-secondary text-sm">{student?.cohort ?? "Unavailable"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted text-sm">Email Status:</span>
                      {student?.emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/25 text-xs font-bold">
                          <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                          Verification Required
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email OTP Verification Section */}
                  {!student?.emailVerified ? (
                    <div className="p-5 rounded-2xl border border-white/10 bg-canvas space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-accent" aria-hidden="true" />
                        <h2 className="text-sm font-bold text-white">Institutional Email OTP</h2>
                      </div>

                      {/* Feedback Alerts */}
                      {otpError && (
                        <div
                          role="alert"
                          className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-300 flex items-start gap-2.5"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="leading-relaxed">Error: {otpError}</div>
                        </div>
                      )}

                      {otpSuccessMsg && (
                        <div
                          role="status"
                          aria-live="polite"
                          className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-300 flex items-start gap-2.5"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                          <div className="leading-relaxed">{otpSuccessMsg}</div>
                        </div>
                      )}

                      {!otpRequested ? (
                        /* Stage A: Email Input & Request OTP */
                        <form
                          className="space-y-3"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleRequestOtp();
                          }}
                        >
                          <div>
                            <label className="block text-sm text-muted mb-1.5" htmlFor="college-email-input">
                              Official College Email (.ac.in / .edu):
                            </label>
                            <input
                              id="college-email-input"
                              type="email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              placeholder="rollno@college.ac.in"
                              autoComplete="email"
                              aria-invalid={otpError ? "true" : undefined}
                              aria-describedby={otpError ? "otp-error" : "college-email-help"}
                              className="w-full bg-surface-raised border border-white/10 rounded-xl px-3.5 py-3 text-base text-white placeholder:text-muted focus:outline-none focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            />
                            <p id="college-email-help" className="text-sm text-muted mt-1.5">
                              Use the email on your college roster. A 6-digit code will be sent to this address.
                            </p>
                            {otpError && <p id="otp-error" className="sr-only">{otpError}</p>}
                          </div>

                          <button
                            type="submit"
                            disabled={sendingOtp || cooldownRemaining > 0 || !emailInput.trim()}
                            aria-busy={sendingOtp}
                            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface-raised disabled:text-muted disabled:border disabled:border-white/10 text-canvas font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                          >
                            {sendingOtp ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                <span>Sending Verification Code…</span>
                              </>
                            ) : cooldownRemaining > 0 ? (
                              <>
                                <Clock className="h-4 w-4" aria-hidden="true" />
                                <span>Resend Cooldown ({cooldownRemaining}s)</span>
                              </>
                            ) : (
                              <>
                                <KeyRound className="h-4 w-4" aria-hidden="true" />
                                <span>Send Verification Code</span>
                              </>
                            )}
                          </button>
                        </form>
                      ) : (
                        /* Stage B: Enter 6-digit OTP & Verify */
                        <form
                          className="space-y-4"
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleVerifyOtp();
                          }}
                        >
                          <div className="flex items-center justify-between text-sm text-muted">
                            <span className="truncate max-w-[240px]">
                              To: <strong className="text-white">{emailInput}</strong>
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setOtpRequested(false);
                                setOtpError(null);
                                setOtpSuccessMsg(null);
                              }}
                              className="text-accent hover:underline text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded px-1"
                            >
                              Change Email
                            </button>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-sm text-muted" htmlFor="otp-input">
                                Enter 6-Digit Passcode:
                              </label>
                              {expiryRemaining > 0 && (
                                <span className="text-sm text-amber-300 flex items-center gap-1" role="timer" aria-label={`Code expires in ${formatTimer(expiryRemaining)}`}>
                                  <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                  Expires in {formatTimer(expiryRemaining)}
                                </span>
                              )}
                            </div>
                            <input
                              id="otp-input"
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={6}
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                              placeholder="123456"
                              autoComplete="one-time-code"
                              aria-invalid={otpError ? "true" : undefined}
                              aria-describedby={otpError ? "otp-error" : "otp-help"}
                              className="w-full bg-surface-raised border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-widest text-white placeholder:text-muted focus:outline-none focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                              autoFocus
                            />
                            <p id="otp-help" className="text-sm text-muted mt-1.5">
                              Enter the 6-digit code from your inbox. Codes expire after 10 minutes.
                            </p>
                            {otpError && <p id="otp-error" className="sr-only">{otpError}</p>}
                          </div>

                          <div className="flex gap-2.5">
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              disabled={sendingOtp || cooldownRemaining > 0}
                              aria-busy={sendingOtp}
                              className="px-4 py-3 rounded-xl bg-surface-raised hover:bg-white/10 border border-white/10 text-sm font-bold text-muted hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${sendingOtp ? "animate-spin" : ""}`} aria-hidden="true" />
                              <span>{cooldownRemaining > 0 ? `${cooldownRemaining}s` : "Resend"}</span>
                            </button>

                            <button
                              type="submit"
                              disabled={verifyingOtp || otpInput.trim().length !== 6}
                              aria-busy={verifyingOtp}
                              className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface-raised disabled:text-muted disabled:border disabled:border-white/10 text-canvas font-semibold text-base flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            >
                              {verifyingOtp ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                                  <span>Verifying Passcode…</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                                  <span>Verify &amp; Activate</span>
                                </>
                              )}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  ) : (
                    <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-sm text-emerald-300 flex items-center gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
                      <span>Institutional college email confirmed. Ready for next step.</span>
                    </div>
                  )}

                  {/* Proceed to Step 2 */}
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!student?.emailVerified}
                    aria-describedby={!student?.emailVerified ? "step1-blocked" : undefined}
                    className="w-full py-4 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface-raised disabled:text-muted disabled:border disabled:border-white/10 disabled:cursor-not-allowed text-canvas font-semibold text-base flex items-center justify-center gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    <span>Continue to Privacy Settings</span>
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {!student?.emailVerified && (
                    <p id="step1-blocked" className="text-sm text-muted text-center">
                      Verify your college email above to continue.
                    </p>
                  )}
                </motion.div>
              )}

              {/* STEP 2: Privacy & Visibility Choices */}
              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-bold mb-3">
                      <Sliders className="h-4 w-4" aria-hidden="true" />
                      <span>Control Your Experience</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Preferences</h1>
                    <p className="text-sm sm:text-base text-muted mt-2 leading-relaxed">
                      You can change or revoke these settings at any time from your settings console.
                    </p>
                  </div>

                  <fieldset className="space-y-4">
                    <legend className="sr-only">Leaderboard and profile visibility</legend>
                    {/* Leaderboard Opt-In Toggle */}
                    <button
                      type="button"
                      onClick={() => setOptInLeaderboard(!optInLeaderboard)}
                      aria-pressed={optInLeaderboard}
                      className="w-full p-5 rounded-2xl border border-white/10 bg-surface-raised flex items-start justify-between gap-4 hover:border-white/25 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span>
                        <span className="text-base font-bold text-white block">Participate in Class Leaderboards</span>
                        <span className="text-sm text-muted mt-1 leading-relaxed block">
                          Appear on platform-specific weekly boards (GitHub active days, LeetCode solved count).
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${
                          optInLeaderboard ? "bg-accent" : "bg-canvas border border-white/10"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-5 w-5 rounded-full bg-canvas block transition-transform ${
                            optInLeaderboard ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>

                    {/* Public Profile Toggle */}
                    <button
                      type="button"
                      onClick={() => setPublicProfile(!publicProfile)}
                      aria-pressed={publicProfile}
                      className="w-full p-5 rounded-2xl border border-white/10 bg-surface-raised flex items-start justify-between gap-4 hover:border-white/25 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span>
                        <span className="text-base font-bold text-white block">Public Profile Visibility</span>
                        <span className="text-sm text-muted mt-1 leading-relaxed block">
                          Allow classmates to see your connected handles and tech interest tags.
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${
                          publicProfile ? "bg-accent" : "bg-canvas border border-white/10"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-5 w-5 rounded-full bg-canvas block transition-transform ${
                            publicProfile ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>

                    {/* Weekly Recap Toggle */}
                    <button
                      type="button"
                      onClick={() => setWeeklyRecap(!weeklyRecap)}
                      aria-pressed={weeklyRecap}
                      className="w-full p-5 rounded-2xl border border-white/10 bg-surface-raised flex items-start justify-between gap-4 hover:border-white/25 transition-colors text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      <span>
                        <span className="text-base font-bold text-white block">Weekly Developer Recap</span>
                        <span className="text-sm text-muted mt-1 leading-relaxed block">
                          Receive a private Sunday night summary of your coding rhythm and small next targets.
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${
                          weeklyRecap ? "bg-accent" : "bg-canvas border border-white/10"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-5 w-5 rounded-full bg-canvas block transition-transform ${
                            weeklyRecap ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </span>
                    </button>
                  </fieldset>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-semibold text-base flex items-center justify-center gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <span>Connect Developer Profiles</span>
                      <ArrowRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Connect Supported Profiles */}
              {step === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-bold mb-3">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                      <span>Proof of Control</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Connect Your Accounts</h1>
                    <p className="text-sm sm:text-base text-muted mt-2 leading-relaxed">
                      Unverified accounts cannot enter competitive rankings.
                    </p>
                  </div>

                  {/* 1. GitHub Connection */}
                  <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <Github className="h-6 w-6 text-white" aria-hidden="true" />
                      <div>
                        <div className="text-base font-bold text-white">
                          GitHub: @{student?.handleGithub || "Unknown"}
                        </div>
                        <div className="text-sm text-emerald-400 mt-0.5">
                          OAuth Verified • Active Days Live
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" aria-label="GitHub verified" />
                  </div>

                  {/* 2. LeetCode HMAC Challenge Verification */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-surface-raised space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Code2 className="h-6 w-6 text-provider-leetcode-brand" aria-hidden="true" />
                        <span className="text-base font-bold text-white">LeetCode Profile</span>
                      </div>
                      {leetCodeVerified ? (
                        <span className="text-xs px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          HMAC Verified
                        </span>
                      ) : (
                        <span className="text-xs px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/25 font-bold">
                          Pending proof
                        </span>
                      )}
                    </div>

                    {!leetCodeVerified ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted leading-relaxed">
                          To prove ownership, paste this 15-minute challenge code into your public LeetCode Bio:
                        </p>
                        {challengeLoading ? (
                          <div role="status" aria-live="polite" className="flex items-center gap-2.5 p-3 rounded-xl bg-canvas border border-white/10 text-sm text-muted min-h-[52px]">
                            <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden="true" />
                            <span>Generating verification challenge…</span>
                          </div>
                        ) : challengeCode ? (
                          <div className="flex items-center gap-2.5">
                            <code className="flex-1 bg-canvas border border-white/10 p-3 rounded-xl text-sm text-accent select-all font-bold break-all">
                              {challengeCode}
                            </code>
                            <button
                              type="button"
                              onClick={copyChallenge}
                              aria-label="Copy challenge code"
                              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-ink-secondary hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            >
                              {copied ? <Check className="h-5 w-5 text-emerald-400" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-canvas border border-white/10 text-sm text-muted flex items-center gap-2.5 min-h-[52px]">
                            <AlertCircle className="h-4 w-4 text-amber-300 shrink-0" aria-hidden="true" />
                            <span>No challenge code is available yet. Use the retry control below.</span>
                          </div>
                        )}
                        {copyError && (
                          <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-xl p-3 leading-relaxed">
                            {copyError}
                          </p>
                        )}

                        <button
                          type="button"
                          onClick={verifyLeetCode}
                          disabled={verifyingLeetCode || challengeLoading || !challengeCode}
                          aria-busy={verifyingLeetCode}
                          className="w-full py-3 px-4 rounded-xl bg-canvas hover:bg-white/5 border border-accent/30 text-accent text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        >
                          {verifyingLeetCode ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                              <span>Checking LeetCode Bio…</span>
                            </>
                          ) : (
                            <span>Verify Challenge Now</span>
                          )}
                        </button>

                        {leetCodeError && (
                          <p
                            role="alert"
                            className="text-sm text-red-300 bg-red-500/10 border border-red-500/25 rounded-xl p-3 leading-relaxed"
                          >
                            {leetCodeError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div role="status" className="text-sm text-emerald-300 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/25 font-semibold">
                        Ownership verified! You can now remove the challenge code from your bio.
                      </div>
                    )}
                  </div>

                  {/* 3. HackerRank Profile Handle */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-surface-raised space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <Award className="h-6 w-6 text-provider-hackerrank" aria-hidden="true" />
                        <div>
                          <div className="text-base font-bold text-white">HackerRank Handle</div>
                          <div className="text-sm text-muted mt-0.5">Cumulative badge display only — excluded from weekly competition.</div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="hackerrank-handle" className="block text-sm text-muted mb-1.5">
                        HackerRank username (optional)
                      </label>
                      <input
                        id="hackerrank-handle"
                        type="text"
                        value={hackerRankUsername}
                        onChange={(e) => setHackerRankUsername(e.target.value)}
                        placeholder="username"
                        autoComplete="username"
                        className="w-full bg-canvas border border-white/10 rounded-xl px-3.5 py-2.5 text-base text-white placeholder:text-muted focus:outline-none focus:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-muted hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleFinish}
                      className="flex-1 py-4 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-semibold text-base flex items-center justify-center gap-2.5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                      <span>Complete Setup &amp; Launch Dashboard</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted">
        Class Community: B.Tech CSE 2026 • Independent Co-Admin Audited
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center" role="status" aria-label="Loading onboarding">
          <Loader2 className="h-8 w-8 animate-spin text-accent" aria-hidden="true" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
