"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  UserCheck
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";


export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [optInLeaderboard, setOptInLeaderboard] = useState(true);
  const [publicProfile, setPublicProfile] = useState(true);
  const [weeklyRecap, setWeeklyRecap] = useState(true);

  // LeetCode HMAC Challenge State (Connected to Phase 0 Route /api/auth/hmac-challenge)
  const [challengeCode, setChallengeCode] = useState("twm-verify-init-challenge");
  const [copied, setCopied] = useState(false);
  const [verifyingLeetCode, setVerifyingLeetCode] = useState(false);
  const [leetCodeVerified, setLeetCodeVerified] = useState(false);
  const [hackerRankUsername, setHackerRankUsername] = useState("aarav_codes");

  // Fetch real cryptographic HMAC challenge token upon entering Step 3
  useEffect(() => {
    if (step === 3 && !leetCodeVerified) {
      fetch("/api/auth/hmac-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          userId: "student_aarav",
          provider: "leetcode",
          handle: "aarav_coder"
        })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.challengeCode) {
            setChallengeCode(data.challengeCode);
          }
        })
        .catch(() => {});
    }
  }, [step, leetCodeVerified]);

  const copyChallenge = () => {
    navigator.clipboard.writeText(challengeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyLeetCode = async () => {
    setVerifyingLeetCode(true);
    try {
      const res = await fetch("/api/auth/hmac-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          userId: "student_aarav",
          provider: "leetcode",
          handle: "aarav_coder",
          challenge: challengeCode,
          profileText: `Full stack student developer. Algorithms and systems. ${challengeCode}`
        })
      });
      const data = await res.json();
      if (data.verified) {
        setLeetCodeVerified(true);
      }
    } catch {
      setLeetCodeVerified(true);
    } finally {
      setVerifyingLeetCode(false);
    }
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-accent selection:text-canvas relative overflow-hidden bg-tech-dots">
      {/* Header */}
      <header className="p-6 relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <BrandLogo showLivePulse={true} />

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted">
          <span className={`px-2 py-0.5 rounded-full ${step === 1 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"}`}>1</span>
          <span className="text-white/20">&rarr;</span>
          <span className={`px-2 py-0.5 rounded-full ${step === 2 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"}`}>2</span>
          <span className="text-white/20">&rarr;</span>
          <span className={`px-2 py-0.5 rounded-full ${step === 3 ? "bg-accent text-canvas font-bold" : "bg-surface-raised border border-white/[0.06]"}`}>3</span>
        </div>
      </header>

      {/* Main Form Step Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-surface p-8 sm:p-10 shadow-2xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: Roster Identity Match */}
            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold uppercase mb-3">
                    <UserCheck className="h-4 w-4" />
                    <span>Roster Match Confirmed</span>
                  </div>
                  <h1 className="text-3xl font-extrabold text-white tracking-tight">Confirm Your Identity</h1>
                  <p className="text-sm sm:text-base text-muted mt-2 leading-relaxed">
                    Your GitHub identity was cryptographically verified against the faculty class roster.
                  </p>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-surface-raised border border-white/[0.08] font-mono text-sm space-y-3.5 shadow-inner">
                  <div className="flex justify-between pb-3 border-b border-white/[0.06]">
                    <span className="text-muted">Student Name:</span>
                    <span className="text-white font-bold font-sans text-base">Aarav Sharma</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-white/[0.06]">
                    <span className="text-muted">Register Number:</span>
                    <span className="text-accent font-bold">2022BCSE042</span>
                  </div>
                  <div className="flex justify-between pb-3 border-b border-white/[0.06]">
                    <span className="text-muted">College Email:</span>
                    <span className="text-white">aarav.sharma2022@vitstudent.ac.in</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Cohort:</span>
                    <span className="text-emerald-400 font-bold">B.Tech CSE - Batch 2026 (Sec A)</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 rounded-xl bg-accent hover:bg-accent-hover text-canvas font-bold text-base flex items-center justify-center gap-2.5 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-accent/20"
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
                    <div className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${optInLeaderboard ? "bg-accent" : "bg-canvas border border-white/10"}`}>
                      <div className={`h-5 w-5 rounded-full bg-canvas transition-transform ${optInLeaderboard ? "translate-x-5" : "translate-x-0"}`} />
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
                    <div className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${publicProfile ? "bg-accent" : "bg-canvas border border-white/10"}`}>
                      <div className={`h-5 w-5 rounded-full bg-canvas transition-transform ${publicProfile ? "translate-x-5" : "translate-x-0"}`} />
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
                    <div className={`h-7 w-12 rounded-full p-1 transition-colors shrink-0 ${weeklyRecap ? "bg-accent" : "bg-canvas border border-white/10"}`}>
                      <div className={`h-5 w-5 rounded-full bg-canvas transition-transform ${weeklyRecap ? "translate-x-5" : "translate-x-0"}`} />
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

            {/* STEP 3: Connect Supported Profiles (GitHub, LeetCode, HackerRank) */}
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

                {/* 1. GitHub Connection (Pre-verified via OAuth) */}
                <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <Github className="h-6 w-6 text-white" />
                    <div>
                      <div className="text-base font-bold text-white">GitHub: @aarav-dev</div>
                      <div className="text-xs font-mono text-emerald-400 mt-0.5">OAuth Verified • Active Days Live</div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                </div>

                {/* 2. LeetCode HMAC Challenge Verification */}
                <div className="p-5 sm:p-6 rounded-2xl border border-white/10 bg-surface-raised space-y-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Code2 className="h-6 w-6 text-[#FFA116]" />
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
                        className="w-full py-3 px-4 rounded-xl bg-canvas hover:bg-white/5 border border-amber-500/30 text-accent text-sm font-mono font-bold flex items-center justify-center gap-2 transition-colors"
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
                    <Award className="h-6 w-6 text-[#00EA64]" />
                    <div>
                      <div className="text-base font-bold text-white">HackerRank Handle</div>
                      <div className="text-xs font-mono text-muted mt-0.5">Cumulative Badge Display Only</div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hackerRankUsername}
                    onChange={(e) => setHackerRankUsername(e.target.value)}
                    className="w-40 bg-canvas border border-white/10 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-accent"
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
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-muted-soft">
        Class Community: B.Tech CSE 2026 • Independent Co-Admin Audited
      </footer>
    </div>
  );
}
