"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, CheckCircle2, ShieldCheck, X, Server, Database, Globe } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ManualSyncModal() {
  const { isSyncModalOpen, closeSyncModal, triggerLiveSync, isSyncing, syncStep } = useApp();
  const [hasRun, setHasRun] = useState(false);

  if (!isSyncModalOpen) return null;

  const handleStartSync = async () => {
    setHasRun(true);
    await triggerLiveSync();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-2xl bg-surface border border-white/10 p-6 shadow-2xl overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent/10 border border-accent/20 text-accent">
              <RotateCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink font-sans">
                Live Telemetry Synchronizer
              </h3>
              <p className="text-xs text-muted font-mono">
                Manual Crawler Trigger • Rate-Limit Protected
              </p>
            </div>
          </div>

          <button
            onClick={closeSyncModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sync Progress & Steps */}
        <div className="my-6 space-y-4">
          <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted">Execution Status</span>
              <span className={`font-semibold ${isSyncing ? "text-accent" : hasRun ? "text-emerald-400" : "text-slate-400"}`}>
                {isSyncing ? "Sync In Progress..." : hasRun ? "Completed (Fresh)" : "Ready"}
              </span>
            </div>

            {/* Pipeline Steps */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs font-mono">
                <Globe className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-slate-300">GitHub REST API (4 Course Repositories)</span>
                {hasRun && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
              </div>

              <div className="flex items-center gap-2.5 text-xs font-mono">
                <Database className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-slate-300">LeetCode GraphQL Verified Delta</span>
                {hasRun && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
              </div>

              <div className="flex items-center gap-2.5 text-xs font-mono">
                <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                <span className="text-slate-300">Sunday 23:59:59 IST Boundary Audit</span>
                {hasRun && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 ml-auto" />}
              </div>
            </div>

            {/* Live Status readout */}
            {isSyncing && (
              <div className="mt-3 p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-accent flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                <span>{syncStep}</span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono text-muted">
            <span className="text-accent font-semibold">Rule §9.2 Compliance:</span> Manual sync requests are rate-limited to 1 request per 10 minutes to protect platform quotas and preserve deterministic delta timestamps.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            onClick={closeSyncModal}
            className="px-4 py-2 rounded-xl text-xs font-mono text-muted hover:text-white hover:bg-white/5 transition-colors"
          >
            Close
          </button>

          <button
            onClick={handleStartSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-50 text-canvas text-xs font-mono font-bold transition-all shadow-md active:scale-95"
          >
            <RotateCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Synchronizing..." : "Execute Sync Now"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
