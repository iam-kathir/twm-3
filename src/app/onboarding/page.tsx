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

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isUnmatched = searchParams.get("unmatched_roster") === "true";
  const unmatchedGithub = searchParams.get("github") || "";
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loadingSession, setLoadingSession] = useState(true);
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
  const [challengeCode, setChallengeCode] = useState("twm-verify-init-challenge");
  const [copied, setCopied] = useState(false);
  const [verifyingLeetCode, setVerifyingLeetCode] = useState(false);
  const [leetCodeVerified, setLeetCodeVerified] = useState(false);
  const [leetCodeError, setLeetCodeError] = useState<string | null>(null);
  const [hackerRankUsername, setHackerRankUsername] = useState("aarav_codes");

  // Load authenticated session on mount
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
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
        }
      } catch (err) {
        console.error("Failed to load student session:", err);
      } finally {
        setLoadingSession(false);
      }
    }

    loadSession();
  }, []);

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
        setOtpSuccessMsg(data.message || "Verification code dispatched to your institutional inbox.");
      } else {
        setOtpError(data.message || data.error || "Failed to request verification code.");
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
          data.attemptsRemaining !== undefined
            ? `${data.message} (${data.attemptsRemaining} attempts remaining)`
            : data.message || data.error || "Verification failed.";
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
        .then((res) => res.json())
        .then((data) => {
          if (data.challengeCode) {
            setChallengeCode(data.challengeCode);
          }
        })
        .catch(() => {});
    }
  }, [step, leetCodeVerified, student]);

  const copyChallenge = () => {
    navigator.clipboard.writeText(challengeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      if (data.verified) {
        setLeetCodeVerified(true);
      } else {
        setLeetCodeError(data.error ?? data.message ?? "Verification failed.");
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
          <div className="w-full max-w-lg rounded-2xl border border-red-500/20 bg-surface p-8 sm:p-10 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Roster Match Not Found</h1>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                GitHub account <span className="font-mono text-white font-bold">@{unmatchedGithub}</span> is not listed
                on the active cohort roster.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] text-xs font-mono text-muted text-left space-y-2">
              <p className="text-white font-semibold">Authorized Cohort Enrolment Required:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Verify you signed into GitHub with your college-linked handle.</li>
                <li>Contact the course coordinator if your registration was recently updated.</li>
              </ul>
            </div>
            <Link
              href="/login"
              className="inline-flex w-full py-3.5 rounded-xl bg-surface-raised hover:bg-white/10 border border-white/10 text-white font-bold text-sm items-center justify-center gap-2 transition-colors"
            >
              <span>Back to Login</span>
            </Link>
          </div>
        </main>

        <footer className="p-6 text-center text-xs font-mono text-muted-soft">
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
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <span
            className={`px-2.5 py-0.5 rounded-full ${
              step === 1 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"
            }`}
          >
            1. Identity &amp; Email
          </span>
          <span className="text-white/20">&rarr;</span>
          <span
            className={`px-2.5 py-0.5 rounded-full ${
              step === 2 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"
            }`}
          >
            2. Privacy
          </span>
          <span className="text-white/20">&rarr;</span>
          <span
            className={`px-2.5 py-0.5 rounded-full ${
              step === 3 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"
            }`}
          >
            3. Accounts
          </span>
        </div>
      </header>

      {/* Main Step Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-surface p-8 sm:p-10 shadow-2xl">
          {loadingSession ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-muted">
              <Loader2 className="h-6 w-6 animate-spin text-accent" />
              <p className="text-xs font-mono">Loading student identity session...</p>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold uppercase mb-3">
                      <UserCheck className="h-4 w-4" />
                      <span>Roster Match Confirmed</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                      Confirm Student Identity
                    </h1>
                    <p className="text-xs sm:text-sm text-muted mt-2 leading-relaxed">
                      Verify your institutional college email via one-time passcode (OTP) to unlock competitive class
                      rankings.
                    </p>
                  </div>

                  {/* Student Card */}
                  <div className="p-5 rounded-2xl bg-surface-raised border border-white/[0.08] font-mono text-sm space-y-3 shadow-inner">
                    <div className="flex justify-between pb-2.5 border-b border-white/[0.06]">
                      <span className="text-muted text-xs">Student Name:</span>
                      <span className="text-white font-bold font-sans text-sm">{student?.name || "Aarav Sharma"}</span>
                    </div>
                    <div className="flex justify-between pb-2.5 border-b border-white/[0.06]">
                      <span className="text-muted text-xs">Register Number:</span>
                      <span className="text-accent font-bold text-sm">{student?.rollNo || "2022BCSE042"}</span>
                    </div>
                    <div className="flex justify-between pb-2.5 border-b border-white/[0.06]">
                      <span className="text-muted text-xs">Cohort:</span>
                      <span className="text-ink-secondary text-xs">{student?.cohort || "B.Tech CSE - Batch 2026"}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted text-xs">Email Status:</span>
                      {student?.emailVerified ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono">
                          <AlertCircle className="h-3.5 w-3.5" />
                          VERIFICATION_REQUIRED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Email OTP Verification Section */}
                  {!student?.emailVerified ? (
                    <div className="p-5 rounded-2xl border border-white/10 bg-canvas space-y-4">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-accent" />
                        <h3 className="text-sm font-bold text-white font-mono">Institutional Email OTP</h3>
                      </div>

                      {/* Feedback Alerts */}
                      {otpError && (
                        <div
                          role="alert"
                          className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-2"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">{otpError}</div>
                        </div>
                      )}

                      {otpSuccessMsg && (
                        <div
                          role="status"
                          className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-start gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">{otpSuccessMsg}</div>
                        </div>
                      )}

                      {!otpRequested ? (
                        /* Stage A: Email Input & Request OTP */
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-mono text-muted mb-1.5" htmlFor="college-email-input">
                              Official College Email (.ac.in / .edu):
                            </label>
                            <input
                              id="college-email-input"
                              type="email"
                              value={emailInput}
                              onChange={(e) => setEmailInput(e.target.value)}
                              placeholder="rollno@college.ac.in"
                              className="w-full bg-surface-raised border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white placeholder:text-muted-soft focus:outline-none focus:border-accent"
                            />
                          </div>

                          <button
                            type="button"
                            onClick={handleRequestOtp}
                            disabled={sendingOtp || cooldownRemaining > 0 || !emailInput.trim()}
                            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface-raised disabled:text-muted disabled:border disabled:border-white/10 text-canvas font-bold text-sm font-mono flex items-center justify-center gap-2 transition-all shadow-md shadow-accent/10"
                          >
                            {sendingOtp ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Generating Secure OTP...</span>
                              </>
                            ) : cooldownRemaining > 0 ? (
                              <>
                                <Clock className="h-4 w-4" />
                                <span>Resend Cooldown ({cooldownRemaining}s)</span>
                              </>
                            ) : (
                              <>
                                <KeyRound className="h-4 w-4" />
                                <span>Send Verification Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        /* Stage B: Enter 6-digit OTP & Verify */
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-xs font-mono text-muted">
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
                              className="text-accent hover:underline text-xs"
                            >
                              Change Email
                            </button>
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1.5">
                              <label className="block text-xs font-mono text-muted" htmlFor="otp-input">
                                Enter 6-Digit Passcode:
                              </label>
                              {expiryRemaining > 0 && (
                                <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
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
                              className="w-full bg-surface-raised border border-white/10 rounded-xl px-4 py-3 text-center text-2xl font-mono tracking-widest text-white placeholder:text-muted-soft focus:outline-none focus:border-accent"
                              autoFocus
                            />
                          </div>

                          <div className="flex gap-2.5">
                            <button
                              type="button"
                              onClick={handleRequestOtp}
                              disabled={sendingOtp || cooldownRemaining > 0}
                              className="px-4 py-3 rounded-xl bg-surface-raised hover:bg-white/10 border border-white/10 text-xs font-mono font-bold text-muted hover:text-white disabled:opacity-50 transition-colors flex items-center gap-1.5"
                            >
                              <RefreshCw className={`h-3.5 w-3.5 ${sendingOtp ? "animate-spin" : ""}`} />
                              <span>{cooldownRemaining > 0 ? `${cooldownRemaining}s` : "Resend"}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || otpInput.trim().length !== 6}
                              className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface-raised disabled:text-muted disabled:border disabled:border-white/10 text-canvas font-bold text-sm font-mono flex items-center justify-center gap-2 transition-all shadow-md shadow-accent/10"
                            >
                              {verifyingOtp ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span>Verifying Passcode...</span>
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span>Verify &amp; Activate</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>Institutional college email confirmed. Ready for next step.</span>
                    </div>
                  )}

                  {/* Proceed to Step 2 */}
                  <button
                    onClick={() => setStep(2)}
                    disabled={!student?.emailVerified}
                    className="w-full py-4 rounded-xl bg-accent hover:bg-accent-hover disabled:bg-surface-raised disabled:text-muted disabled:border disabled:border-white/10 disabled:cursor-not-allowed text-canvas font-bold text-base flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/20"
                  >
                    <span>Continue to Privacy Settings</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-mono font-bold uppercase mb-3">
                      <Sliders className="h-4 w-4" />
                      <span>Control Your Experience</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Privacy Preferences</h1>
                    <p className="text-sm sm:text-base text-muted mt-2 leading-relaxed">
                      You can change or revoke these settings at any time from your settings console.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Leaderboard Opt-In Toggle */}
                    <div
                      onClick={() => setOptInLeaderboard(!optInLeaderboard)}
                      className="p-5 rounded-2xl border border-white/10 bg-surface-raised flex items-start justify-between gap-4 cursor-pointer hover:border-white/20 transition-all shadow-sm"
                    >
                      <div>
                        <h4 className="text-base font-bold text-white">Participate in Class Leaderboards</h4>
                        <p className="text-sm text-muted mt-1 leading-relaxed">
                          Appear on platform-specific weekly boards (GitHub active days, LeetCode solved count).
                        </p>
                      </div>
                      <div
                        className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${
                          optInLeaderboard ? "bg-accent" : "bg-canvas border border-white/10"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-canvas transition-transform ${
                            optInLeaderboard ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Public Profile Toggle */}
                    <div
                      onClick={() => setPublicProfile(!publicProfile)}
                      className="p-5 rounded-2xl border border-white/10 bg-surface-raised flex items-start justify-between gap-4 cursor-pointer hover:border-white/20 transition-all shadow-sm"
                    >
                      <div>
                        <h4 className="text-base font-bold text-white">Public Profile Visibility</h4>
                        <p className="text-sm text-muted mt-1 leading-relaxed">
                          Allow classmates to see your connected handles and tech interest tags.
                        </p>
                      </div>
                      <div
                        className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${
                          publicProfile ? "bg-accent" : "bg-canvas border border-white/10"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-canvas transition-transform ${
                            publicProfile ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Weekly Recap Toggle */}
                    <div
                      onClick={() => setWeeklyRecap(!weeklyRecap)}
                      className="p-5 rounded-2xl border border-white/10 bg-surface-raised flex items-start justify-between gap-4 cursor-pointer hover:border-white/20 transition-all shadow-sm"
                    >
                      <div>
                        <h4 className="text-base font-bold text-white">Weekly Developer Recap</h4>
                        <p className="text-sm text-muted mt-1 leading-relaxed">
                          Receive a private Sunday night summary of your coding rhythm and small next targets.
                        </p>
                      </div>
                      <div
                        className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${
                          weeklyRecap ? "bg-accent" : "bg-canvas border border-white/10"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full bg-canvas transition-transform ${
                            weeklyRecap ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-muted hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-4 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-bold text-base flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/20"
                    >
                      <span>Connect Developer Profiles</span>
                      <ArrowRight className="h-5 w-5" />
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
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 text-xs font-mono font-bold uppercase mb-3">
                      <ShieldCheck className="h-4 w-4" />
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
                      <Github className="h-6 w-6 text-white" />
                      <div>
                        <div className="text-base font-bold text-white">
                          GitHub: @{student?.handleGithub || "aarav-dev"}
                        </div>
                        <div className="text-xs font-mono text-emerald-400 mt-0.5">
                          OAuth Verified • Active Days Live
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                  </div>

                  {/* 2. LeetCode HMAC Challenge Verification */}
                  <div className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-surface-raised space-y-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Code2 className="h-6 w-6 text-provider-leetcode-brand" />
                        <span className="text-base font-bold text-white">LeetCode Profile</span>
                      </div>
                      {leetCodeVerified ? (
                        <span className="text-xs font-mono px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="h-4 w-4" />
                          HMAC_VERIFIED
                        </span>
                      ) : (
                        <span className="text-xs font-mono px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                          PENDING_PROOF
                        </span>
                      )}
                    </div>

                    {!leetCodeVerified ? (
                      <div className="space-y-3">
                        <p className="text-sm text-muted leading-relaxed">
                          To prove ownership, paste this 15-minute challenge code into your public LeetCode Bio:
                        </p>
                        <div className="flex items-center gap-2.5">
                          <code className="flex-1 bg-canvas border border-white/10 p-3 rounded-xl text-sm font-mono text-accent select-all font-bold">
                            {challengeCode}
                          </code>
                          <button
                            onClick={copyChallenge}
                            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-ink-secondary hover:text-white transition-colors"
                            title="Copy Code"
                          >
                            {copied ? <Check className="h-5 w-5 text-emerald-400" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>

                        <button
                          onClick={verifyLeetCode}
                          disabled={verifyingLeetCode}
                          className="w-full py-3 px-4 rounded-xl bg-canvas hover:bg-white/5 border border-accent/30 text-accent text-sm font-mono font-bold flex items-center justify-center gap-2 transition-colors"
                        >
                          {verifyingLeetCode ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Checking LeetCode Bio...</span>
                            </>
                          ) : (
                            <span>Verify Challenge Now</span>
                          )}
                        </button>

                        {leetCodeError && (
                          <p
                            role="alert"
                            className="text-xs font-mono text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 leading-relaxed"
                          >
                            {leetCodeError}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm font-mono text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 font-semibold">
                        Ownership verified! You can now remove the challenge code from your bio.
                      </div>
                    )}
                  </div>

                  {/* 3. HackerRank Profile Handle */}
                  <div className="p-5 rounded-2xl border border-white/10 bg-surface-raised flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <Award className="h-6 w-6 text-provider-hackerrank" />
                      <div>
                        <div className="text-base font-bold text-white">HackerRank Handle</div>
                        <div className="text-xs font-mono text-muted mt-0.5">Cumulative Badge Display Only</div>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={hackerRankUsername}
                      onChange={(e) => setHackerRankUsername(e.target.value)}
                      className="w-40 bg-canvas border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono text-white placeholder:text-muted-soft focus:outline-none focus:border-accent"
                      placeholder="username"
                    />
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-4 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold text-muted hover:text-white transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleFinish}
                      className="flex-1 py-4 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-bold text-base flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/20"
                    >
                      <Sparkles className="h-5 w-5" />
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
      <footer className="p-6 text-center text-xs font-mono text-muted-soft">
        Class Community: B.Tech CSE 2026 • Independent Co-Admin Audited
      </footer>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
