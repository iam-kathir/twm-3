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

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto p-3.5 rounded-xl bg-surface/95 backdrop-blur-md border ${borderColor} shadow-2xl flex items-start gap-3 relative overflow-hidden`}
            >
              <Icon className={`h-5 w-5 ${iconColor} shrink-0 mt-0.5`} />

              <div className="flex-1 pr-4">
                <div className="text-xs font-semibold text-ink font-sans">
                  {toast.title}
                </div>
                {toast.description && (
                  <div className="text-[11px] text-muted mt-0.5 leading-relaxed font-sans">
                    {toast.description}
                  </div>
                )}
                <div className="text-[9px] font-mono text-muted-soft mt-1">
                  {toast.timestamp}
                </div>
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="text-muted-soft hover:text-ink p-1 rounded-md hover:bg-white/5 transition-colors absolute top-2.5 right-2.5"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Subtle top indicator bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-0.5 ${
                  isSuccess
                    ? "bg-emerald-400"
                    : isWarning
                    ? "bg-amber-400"
                    : isError
                    ? "bg-rose-400"
                    : "bg-sky-400"
                }`}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
