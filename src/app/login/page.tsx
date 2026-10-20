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
    // Simulate GitHub OAuth roundtrip
    setTimeout(() => {
      router.push("/onboarding");
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#090A0E] text-[#F5F6F8] flex flex-col justify-between selection:bg-[#F59E0B] selection:text-[#090A0E] relative overflow-hidden bg-tech-dots">
      {/* Header */}
      <header className="p-6 relative z-10 max-w-5xl mx-auto w-full flex items-center justify-between">
        <BrandLogo showLivePulse={true} />

        <Link
          href="/"
          className="text-xs font-mono text-[#8D94A5] hover:text-white transition-colors"
        >
          &larr; Back to Home
        </Link>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111319] p-8 relative"
        >
          {/* Top Logo & Pill */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-5">
              <BrandLogo variant="horizontal" size="md" href="" />
            </div>
            <h1 className="text-2xl font-bold text-[#F5F6F8] tracking-tight">Class Sign In</h1>
            <p className="mt-1.5 text-xs text-[#8D94A5]">
              Authenticate via GitHub OAuth and university class roster.
            </p>
          </div>

          {/* Action Trigger */}
          <div className="space-y-4">
            <button
              onClick={handleGitHubLogin}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-white text-[#090A0E] hover:bg-slate-100 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
            >
              <Github className="h-4 w-4" />
              <span>{isLoading ? "Authenticating with GitHub..." : "Continue with GitHub"}</span>
              <ArrowRight className="h-4 w-4 ml-auto text-slate-400" />
            </button>

            {/* Quick Demo Bypass */}
            <div className="pt-4 border-t border-white/[0.06] text-center">
              <span className="text-[11px] font-mono text-[#636A7E] block mb-2">
                TEST DEMO SHORTCUT
              </span>
              <button
                onClick={() => router.push("/onboarding")}
                className="text-xs font-mono text-[#F59E0B] hover:underline"
              >
                Simulate Roster Matched Student (&rarr; Onboarding)
              </button>
            </div>
          </div>

          {/* Privacy & Zero-Password Guarantee */}
          <div className="mt-6 p-3.5 rounded-xl bg-[#181B23] border border-white/[0.06] text-xs font-mono text-[#8D94A5] space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>Zero Passwords Collected</span>
            </div>
            <p className="text-[11px] text-[#636A7E] leading-normal">
              TWM issues secure session tokens tied exclusively to your university register number.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-xs font-mono text-[#636A7E]">
        Timezone: Asia/Kolkata (IST) • 100% Opt-In Privacy
      </footer>
    </div>
  );
}
