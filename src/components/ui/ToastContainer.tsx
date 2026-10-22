"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isWarning = toast.type === "warning";
          const isError = toast.type === "error";

          const Icon = isSuccess
            ? CheckCircle2
            : isWarning
            ? AlertTriangle
            : isError
            ? XCircle
            : Info;

          const borderColor = isSuccess
            ? "border-emerald-500/30"
            : isWarning
            ? "border-amber-500/30"
            : isError
            ? "border-rose-500/30"
            : "border-sky-500/30";

          const iconColor = isSuccess
            ? "text-emerald-400"
            : isWarning
            ? "text-amber-400"
            : isError
            ? "text-rose-400"
            : "text-sky-400";

          const bgAura = isSuccess
            ? "from-emerald-500/10 via-transparent to-transparent"
            : isWarning
            ? "from-amber-500/10 via-transparent to-transparent"
            : isError
            ? "from-rose-500/10 via-transparent to-transparent"
            : "from-sky-500/10 via-transparent to-transparent";

          const progressBg = isSuccess
            ? "bg-emerald-400"
            : isWarning
            ? "bg-amber-400"
            : isError
            ? "bg-rose-400"
            : "bg-sky-400";

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.92 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className={`pointer-events-auto p-4 rounded-2xl bg-surface/90 backdrop-blur-2xl border ${borderColor} shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.06)] flex items-start gap-3.5 relative overflow-hidden`}
            >
              {/* Subtle Ambient Radial Glow */}
              <div className={`absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-br ${bgAura} rounded-full blur-xl pointer-events-none`} />

              <div className={`p-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] shrink-0 mt-0.5`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>

              <div className="flex-1 pr-4 relative z-10">
                <div className="text-xs font-semibold text-ink font-sans tracking-wide">
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="text-[11px] text-muted mt-0.5 leading-relaxed font-sans">
                    {toast.description}
                  </div>
                )}
                <div className="text-[9px] font-mono text-muted mt-1.5 opacity-80">
                  {toast.timestamp}
                </div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-muted hover:text-white p-1 rounded-lg hover:bg-white/[0.06] transition-colors absolute top-3 right-3 z-20"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Animated Progress Countdown Bar */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: (toast.duration || 5000) / 1000, ease: "linear" }}
                className={`absolute bottom-0 left-0 right-0 h-0.5 ${progressBg} opacity-80`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
