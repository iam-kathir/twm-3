"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, ArrowRight, ShieldAlert, GraduationCap } from "lucide-react";
import { Github } from "@/components/ui/GithubIcon";
import { BrandLogo } from "@/components/ui/BrandLogo";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const isDemoOAuth = searchParams.get("demo_oauth") === "true";

  const handleGitHubLogin = () => {
    if (isLoading) return;
    setLoginError(null);
    setIsLoading(true);
    // Real GitHub OAuth initiation with CSRF state protection
    try {
      window.location.href = "/api/auth/github";
    } catch {
      setIsLoading(false);
      setLoginError("Could not start the GitHub sign-in redirect. Check your connection and try again.");
    }
  };

  const handleDemoStudentLogin = (studentId: string) => {
    if (isLoading) return;
    setLoginError(null);
    setIsLoading(true);
    try {
      window.location.href = `/api/auth/github/callback?demo_student_id=${encodeURIComponent(studentId)}`;
    } catch {
      setIsLoading(false);
      setLoginError("Could not start the demo sign-in redirect. Check your connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-brand-primary/30 selection:text-white relative overflow-hidden bg-tech-dots">
      {/* Header */}
      <header className="p-6 relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between">
        <BrandLogo showLivePulse={true} />

        <Link
          href="/"
          className="text-sm text-muted hover:text-white transition-colors flex items-center gap-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded-md px-1 py-1"
        >
          <span aria-hidden="true">&larr;</span>
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-lg rounded-panel border border-white/10 bg-surface p-8 sm:p-10 relative shadow-none space-y-8"
        >
          {/* Top Logo & Pill */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-2">
              <BrandLogo variant="horizontal" size="lg" href="" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Class SSO Sign In</h1>
            <p className="text-sm text-muted leading-relaxed font-sans max-w-sm mx-auto">
              Authenticate via GitHub OAuth. Your verified institutional email is mapped to the authoritative class roster.
            </p>
          </div>

          {loginError && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-300 flex items-start gap-2.5"
            >
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <p className="leading-relaxed">{loginError}</p>
            </div>
          )}

          <p role="status" aria-live="polite" className="sr-only">
            {isLoading ? "Redirecting to GitHub sign-in…" : ""}
          </p>

          {/* Action Trigger */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGitHubLogin}
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-white text-canvas hover:bg-slate-100 font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-colors shadow-xl disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer font-sans focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
            >
              <Github className="h-5 w-5" aria-hidden="true" />
              <span>{isLoading ? "Redirecting to GitHub…" : "Continue with GitHub"}</span>
              <ArrowRight className="h-4 w-4 ml-auto text-slate-500" aria-hidden="true" />
            </button>

            {/* University Domains Pill */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted">
              <GraduationCap className="h-4 w-4 text-brand-secondary" aria-hidden="true" />
              <span>Supported: karunya.edu, .edu.in, .ac.in</span>
            </div>

            {/* Dev Demo Fast-Track Modal / Card if demo mode active or requested */}
            {isDemoOAuth ? (
              <div className="p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/25 space-y-3 text-left">
                <div className="flex items-center gap-2 text-sm font-bold text-brand-primary">
                  <span aria-hidden="true">Demo</span>
                  <span>Local Dev OAuth Simulator</span>
                </div>
                <p className="text-sm text-slate-300 font-sans">
                  GitHub Client ID not yet set in .env.local. Select a seed classmate to log in instantly. This signs you in as a demo student only.
                </p>
                <div className="space-y-1.5">
                  {[
                    { id: "roster_aarav_sharma", name: "Aarav Sharma (2022BCSE042)" },
                    { id: "roster_priya_nair", name: "Priya Nair (2022BCSE008)" },
                    { id: "roster_rohan_kulkarni", name: "Rohan Kulkarni (2022BCSE091)" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleDemoStudentLogin(s.id)}
                      disabled={isLoading}
                      className="w-full py-2.5 px-3 rounded-lg bg-surface hover:bg-surface-raised border border-white/10 text-sm text-ink text-left flex items-center justify-between transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
                    >
                      <span>{s.name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-brand-secondary" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Quick Demo Link */
              <div className="pt-4 border-t border-white/[0.08] text-center space-y-2">
                <span className="text-sm font-semibold text-muted block">
                  Demo data — local development shortcut
                </span>
                <button
                  type="button"
                  onClick={() => handleDemoStudentLogin("roster_aarav_sharma")}
                  disabled={isLoading}
                  className="text-sm font-medium text-brand-secondary hover:underline inline-flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded-md px-1 py-1"
                >
                  <span>Simulate Instant Sign In (Aarav Sharma)</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* Privacy & Zero-Password Guarantee */}
          <div className="p-4 sm:p-5 rounded-2xl bg-surface-raised/60 border border-white/[0.06] text-sm text-muted space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Shield className="h-4 w-4" aria-hidden="true" />
              <span>Zero Passwords Stored</span>
            </div>
            <p className="text-sm text-muted leading-relaxed font-sans">
              Stateless HMAC-SHA256 tokens tied to verified university roll numbers. No credentials, tokens, or surveillance scripts are ever persisted.{" "}
              <Link href="/privacy" className="text-brand-secondary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary rounded">
                Read the privacy policy
              </Link>
              .
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted">
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
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-secondary border-t-transparent" role="status" aria-label="Loading sign-in" />
        </div>
      }
    >
      <LoginContent />
    </React.Suspense>
  );
}
