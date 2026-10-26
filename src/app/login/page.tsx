"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Shield, ArrowRight, CheckCircle2, Lock, Sparkles, GraduationCap } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const isDemoOAuth = searchParams.get("demo_oauth") === "true";

  const handleGitHubLogin = () => {
    setIsLoading(true);
    // Real GitHub OAuth initiation with CSRF state protection
    window.location.href = "/api/auth/github";
  };

  const handleDemoStudentLogin = (studentId: string) => {
    setIsLoading(true);
    window.location.href = `/api/auth/github/callback?demo_student_id=${encodeURIComponent(studentId)}`;
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-accent selection:text-canvas relative overflow-hidden bg-tech-dots">
      {/* Precision Ambient Atmosphere */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[360px] bg-accent/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="p-6 relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between">
        <BrandLogo showLivePulse={true} />

        <Link
          href="/"
          className="text-xs font-mono text-muted hover:text-white transition-colors flex items-center gap-1.5"
        >
          <span>&larr;</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-lg rounded-panel border border-white/10 bg-surface p-8 sm:p-10 relative shadow-overlay space-y-8"
        >
          {/* Top Logo & Pill */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <BrandLogo variant="horizontal" size="lg" href="" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Class SSO Sign In</h1>
            <p className="text-xs sm:text-sm text-muted leading-relaxed font-sans max-w-sm mx-auto">
              Authenticate via GitHub OAuth. Your verified institutional email is mapped to the authoritative class roster.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.015, boxShadow: "0 0 24px -2px rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.985 }}
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-white text-canvas hover:bg-slate-100 font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-60 cursor-pointer font-sans"
            >
              <Github className="h-5 w-5" />
              <span>{isLoading ? "Authenticating with GitHub..." : "Continue with GitHub"}</span>
              <ArrowRight className="h-4 w-4 ml-auto text-slate-500" />
            </motion.button>

            {/* University Domains Pill */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <GraduationCap className="h-3.5 w-3.5 text-accent" />
              <span>Supported: karunya.edu, .edu.in, .ac.in</span>
            </div>

            {/* Dev Demo Fast-Track Modal / Card if demo mode active or requested */}
            {isDemoOAuth ? (
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/25 space-y-3 text-left">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Local Dev OAuth Simulator</span>
                </div>
                <p className="text-xs text-slate-300 font-sans">
                  GitHub Client ID not yet set in .env.local. Select a seed classmate to log in instantly:
                </p>
                <div className="space-y-1.5">
                  {[
                    { id: "roster_aarav_sharma", name: "Aarav Sharma (2022BCSE042)" },
                    { id: "roster_priya_nair", name: "Priya Nair (2022BCSE008)" },
                    { id: "roster_rohan_kulkarni", name: "Rohan Kulkarni (2022BCSE091)" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => handleDemoStudentLogin(s.id)}
                      className="w-full py-2 px-3 rounded-lg bg-surface hover:bg-surface-raised border border-white/10 text-xs font-mono text-ink text-left flex items-center justify-between transition-colors"
                    >
                      <span>{s.name}</span>
                      <ArrowRight className="h-3 w-3 text-accent" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Quick Demo Link */
              <div className="pt-4 border-t border-white/[0.08] text-center space-y-2">
                <span className="text-xs font-semibold text-muted block">
                  Test Shortcut
                </span>
                <button
                  onClick={() => handleDemoStudentLogin("roster_aarav_sharma")}
                  className="text-xs font-mono font-medium text-accent hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Simulate Instant Sign In (Aarav Sharma)</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>

          {/* Privacy & Zero-Password Guarantee */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-raised/60 border border-white/[0.06] text-xs font-mono text-muted space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Shield className="h-3.5 w-3.5" />
              <span>Zero Passwords Stored</span>
            </div>
            <p className="text-xs text-muted leading-relaxed font-sans">
              Stateless HMAC-SHA256 tokens tied to verified university roll numbers. No credentials, tokens, or surveillance scripts are ever persisted.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-muted">
        Timezone: Asia/Kolkata (IST) • Institutional Opt-In Privacy (§18)
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-canvas text-ink flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}

