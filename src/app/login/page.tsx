"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Github, Shield, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleGitHubLogin = () => {
    setIsLoading(true);
    // Real GitHub OAuth initiation with CSRF state protection
    window.location.href = "/api/auth/github";
  };

  return (
    <div className="min-h-screen bg-canvas text-ink flex flex-col justify-between selection:bg-accent selection:text-canvas relative overflow-hidden bg-tech-dots">
      {/* Header */}
      <header className="p-6 relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between">
        <BrandLogo showLivePulse={true} />

        <Link
          href="/"
          className="text-xs font-mono text-muted hover:text-white transition-colors"
        >
          &larr; Back to Home
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg rounded-2xl border border-white/10 bg-surface p-8 sm:p-10 relative shadow-2xl space-y-8"
        >
          {/* Top Logo & Pill */}
          <div className="text-center space-y-3">
            <div className="flex justify-center mb-4">
              <BrandLogo variant="horizontal" size="lg" href="" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Class Sign In</h1>
            <p className="text-sm sm:text-base text-muted leading-relaxed">
              Authenticate via GitHub OAuth and university class roster.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="space-y-5">
            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-white text-canvas hover:bg-slate-100 font-bold text-base flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <Github className="h-5 w-5" />
              <span>{isLoading ? "Authenticating with GitHub..." : "Continue with GitHub"}</span>
              <ArrowRight className="h-5 w-5 ml-auto text-slate-500" />
            </button>

            {/* Quick Demo Bypass */}
            <div className="pt-5 border-t border-white/[0.08] text-center space-y-2">
              <span className="text-xs font-mono font-bold text-muted-soft block uppercase tracking-wider">
                TEST DEMO SHORTCUT
              </span>
              <button
                onClick={() => router.push("/onboarding")}
                className="text-sm font-mono font-semibold text-accent hover:underline inline-block"
              >
                Simulate Roster Matched Student (&rarr; Onboarding)
              </button>
            </div>
          </div>

          {/* Privacy & Zero-Password Guarantee */}
          <div className="p-5 rounded-2xl bg-surface-raised border border-white/[0.06] text-sm font-mono text-muted space-y-2">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold">
              <Shield className="h-4 w-4" />
              <span>Zero Passwords Collected</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-soft leading-relaxed font-sans">
              TWM issues secure session tokens tied exclusively to your university register number.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-muted-soft">
        Timezone: Asia/Kolkata (IST) • 100% Opt-In Privacy
      </footer>
    </div>
  );
}
