"use client";

import React, { useState } from "react";
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

  // LeetCode HMAC Challenge State
  const challengeCode = "twm-challenge-9a4f7e2c";
  const [copied, setCopied] = useState(false);
  const [verifyingLeetCode, setVerifyingLeetCode] = useState(false);
  const [leetCodeVerified, setLeetCodeVerified] = useState(false);
  const [hackerRankUsername, setHackerRankUsername] = useState("aarav_codes");

  const copyChallenge = () => {
    navigator.clipboard.writeText(challengeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const verifyLeetCode = () => {
    setVerifyingLeetCode(true);
    setTimeout(() => {
      setVerifyingLeetCode(false);
      setLeetCodeVerified(true);
    }, 1000);
  };

  const handleFinish = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#090A0E] text-[#F5F6F8] flex flex-col justify-between selection:bg-[#F59E0B] selection:text-[#090A0E] relative overflow-hidden bg-tech-dots">
      {/* Header */}
      <header className="p-6 relative z-10 max-w-4xl mx-auto w-full flex items-center justify-between">
        <BrandLogo showLivePulse={true} />

        {/* Step Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-[#8D94A5]">
          <span className={`px-2 py-0.5 rounded-full ${step === 1 ? "bg-[#F59E0B] text-[#090A0E] font-bold" : "bg-[#181B23] border border-white/[0.06]"}`}>1</span>
          <span className="text-white/20">&rarr;</span>
          <span className={`px-2 py-0.5 rounded-full ${step === 2 ? "bg-[#F59E0B] text-[#090A0E] font-bold" : "bg-[#181B23] border border-white/[0.06]"}`}>2</span>
          <span className="text-white/20">&rarr;</span>
          <span className={`px-2 py-0.5 rounded-full ${step === 3 ? "bg-[#F59E0B] text-[#090A0E] font-bold" : "bg-[#181B23] border border-white/[0.06]"}`}>3</span>
        </div>
      </header>

      {/* Main Form Step Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#111319] p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {/* STEP 1: Roster Identity Match */}
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
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono mb-2">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>Roster Match Confirmed</span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#F5F6F8] tracking-tight">Confirm Your Identity</h1>
                  <p className="text-xs text-[#8D94A5] mt-1">
                    Your GitHub identity was verified against the faculty class roster.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#181B23] border border-white/[0.06] font-mono text-xs space-y-2.5">
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-[#8D94A5]">Student Name:</span>
                    <span className="text-[#F5F6F8] font-bold font-sans">Aarav Sharma</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-[#8D94A5]">Register Number:</span>
                    <span className="text-[#F5F6F8] font-bold">2022BCSE042</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-white/[0.06]">
                    <span className="text-[#8D94A5]">College Email:</span>
                    <span className="text-[#C8CDD6]">aarav.sharma@univ.edu</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8D94A5]">Cohort:</span>
                    <span className="text-emerald-400 font-semibold">B.Tech CSE - Batch 2026 (Sec A)</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#090A0E] font-mono font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <span>Continue to Privacy Settings</span>
                  <ArrowRight className="h-4 w-4" />
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
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs font-mono mb-2">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Control Your Experience</span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#F5F6F8] tracking-tight">Privacy Preferences</h1>
                  <p className="text-xs text-[#8D94A5] mt-1">
                    You can change or revoke these settings at any time from your profile.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Leaderboard Opt-In Toggle */}
                  <div
                    onClick={() => setOptInLeaderboard(!optInLeaderboard)}
                    className="p-4 rounded-xl border border-white/[0.08] bg-[#181B23] flex items-start justify-between gap-4 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F6F8]">Participate in Class Leaderboards</h4>
                      <p className="text-xs text-[#8D94A5] mt-0.5 leading-relaxed">
                        Appear on platform-specific weekly boards (GitHub active days, LeetCode solved count).
                      </p>
                    </div>
                    <div className={`h-6 w-11 rounded-full p-1 transition-colors shrink-0 ${optInLeaderboard ? "bg-[#F59E0B]" : "bg-[#090A0E] border border-white/10"}`}>
                      <div className={`h-4 w-4 rounded-full bg-[#090A0E] transition-transform ${optInLeaderboard ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </div>

                  {/* Public Profile Toggle */}
                  <div
                    onClick={() => setPublicProfile(!publicProfile)}
                    className="p-4 rounded-xl border border-white/[0.08] bg-[#181B23] flex items-start justify-between gap-4 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F6F8]">Public Profile Visibility</h4>
                      <p className="text-xs text-[#8D94A5] mt-0.5 leading-relaxed">
                        Allow classmates to see your connected handles and tech interest tags.
                      </p>
                    </div>
                    <div className={`h-6 w-11 rounded-full p-1 transition-colors shrink-0 ${publicProfile ? "bg-[#F59E0B]" : "bg-[#090A0E] border border-white/10"}`}>
                      <div className={`h-4 w-4 rounded-full bg-[#090A0E] transition-transform ${publicProfile ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </div>

                  {/* Weekly Recap Toggle */}
                  <div
                    onClick={() => setWeeklyRecap(!weeklyRecap)}
                    className="p-4 rounded-xl border border-white/[0.08] bg-[#181B23] flex items-start justify-between gap-4 cursor-pointer hover:border-white/20 transition-colors"
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-[#F5F6F8]">Weekly Developer Recap</h4>
                      <p className="text-xs text-[#8D94A5] mt-0.5 leading-relaxed">
                        Receive a private Sunday night summary of your coding rhythm and small next targets.
                      </p>
                    </div>
                    <div className={`h-6 w-11 rounded-full p-1 transition-colors shrink-0 ${weeklyRecap ? "bg-[#F59E0B]" : "bg-[#090A0E] border border-white/10"}`}>
                      <div className={`h-4 w-4 rounded-full bg-[#090A0E] transition-transform ${weeklyRecap ? "translate-x-5" : "translate-x-0"}`} />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono text-[#8D94A5]"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#090A0E] font-mono font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <span>Connect Developer Profiles</span>
                    <ArrowRight className="h-4 w-4" />
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
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20 text-xs font-mono mb-2">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Proof of Control</span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#F5F6F8] tracking-tight">Connect Your Accounts</h1>
                  <p className="text-xs text-[#8D94A5] mt-1">
                    Unverified accounts cannot enter competitive rankings.
                  </p>
                </div>

                {/* 1. GitHub Connection (Pre-verified via OAuth) */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Github className="h-5 w-5 text-white" />
                    <div>
                      <div className="text-sm font-semibold text-white">GitHub: @aarav-dev</div>
                      <div className="text-[11px] font-mono text-emerald-400">OAuth Verified • Active Days Live</div>
                    </div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                </div>

                {/* 2. LeetCode HMAC Challenge Verification */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#181B23] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Code2 className="h-5 w-5 text-[#FFA116]" />
                      <span className="text-sm font-semibold text-[#F5F6F8]">LeetCode Profile</span>
                    </div>
                    {leetCodeVerified ? (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        HMAC_VERIFIED
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        PENDING_PROOF
                      </span>
                    )}
                  </div>

                  {!leetCodeVerified ? (
                    <div className="space-y-2">
                      <p className="text-xs text-[#8D94A5] leading-relaxed">
                        To prove ownership, paste this 15-minute challenge code into your public LeetCode Bio:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-[#090A0E] border border-white/10 p-2 rounded-lg text-xs font-mono text-[#F59E0B] select-all">
                          {challengeCode}
                        </code>
                        <button
                          onClick={copyChallenge}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[#C8CDD6]"
                          title="Copy Code"
                        >
                          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>

                      <button
                        onClick={verifyLeetCode}
                        disabled={verifyingLeetCode}
                        className="w-full py-2 px-3 rounded-lg bg-[#090A0E] hover:bg-white/5 border border-amber-500/30 text-[#F59E0B] text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-colors"
                      >
                        {verifyingLeetCode ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Checking LeetCode Bio...</span>
                          </>
                        ) : (
                          <span>Verify Challenge Now</span>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                      Ownership verified! You can now remove the challenge code from your bio.
                    </div>
                  )}
                </div>

                {/* 3. HackerRank Profile Handle */}
                <div className="p-4 rounded-xl border border-white/[0.08] bg-[#181B23] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-[#00EA64]" />
                    <div>
                      <div className="text-sm font-semibold text-[#F5F6F8]">HackerRank Handle</div>
                      <div className="text-[11px] font-mono text-[#8D94A5]">Cumulative Badge Display Only</div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={hackerRankUsername}
                    onChange={(e) => setHackerRankUsername(e.target.value)}
                    className="w-32 bg-[#090A0E] border border-white/10 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-[#F59E0B]"
                    placeholder="username"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="px-4 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono text-[#8D94A5]"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex-1 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#090A0E] font-mono font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Complete Setup &amp; Launch Dashboard</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-[#636A7E]">
        Class Community: B.Tech CSE 2026 • Independent Co-Admin Audited
      </footer>
    </div>
  );
}
