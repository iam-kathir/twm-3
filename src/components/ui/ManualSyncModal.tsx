"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { RotateCw, X, Globe, Database, ShieldCheck } from "lucide-react";
import { useApp } from "@/context/AppContext";

export function ManualSyncModal() {
  const { isSyncModalOpen, closeSyncModal, triggerLiveSync, isSyncing, syncStep } = useApp();
  const [hasRequested, setHasRequested] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!isSyncModalOpen) return;
    previousFocusRef.current = document.activeElement;
    setHasRequested(false);
    // Move focus into the dialog on open so keyboard users land inside it.
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSyncModal();
      } else if (e.key === "Tab") {
        // Simple focus trap within the dialog.
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(t);
      // Restore focus to the control that opened the modal.
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, [isSyncModalOpen, closeSyncModal]);

  const handleStartSync = useCallback(async () => {
    setHasRequested(true);
    await triggerLiveSync();
  }, [triggerLiveSync]);

  // Keep dialog mounted briefly for exit animation; AnimatePresence reads `open`.
  if (!isSyncModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
      onClick={closeSyncModal}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="manual-sync-modal-title"
        aria-describedby="manual-sync-modal-desc"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-lg rounded-panel bg-surface border border-white/10 p-6 shadow-overlay overflow-hidden relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-primary/10 border border-brand-primary/20 text-brand-primary">
              <RotateCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} aria-hidden="true" />
            </div>
            <div>
              <h3 id="manual-sync-modal-title" className="text-base font-bold text-ink font-sans">
                Live Telemetry Synchronizer
              </h3>
              <p id="manual-sync-modal-desc" className="text-sm text-muted">
                Manual Crawler Trigger • Rate-Limit Protected
              </p>
            </div>
          </div>

          <button
            ref={closeRef}
            onClick={closeSyncModal}
            aria-label="Close sync dialog"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Sync Progress & Steps */}
        <div className="my-6 space-y-4">
          <div className="p-4 rounded-xl bg-surface-raised border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Execution Status</span>
              <span role="status" aria-live="polite" className={`font-semibold ${isSyncing ? "text-brand-secondary" : hasRequested ? "text-slate-200" : "text-slate-300"}`}>
                {isSyncing ? "Sync In Progress…" : hasRequested ? "Sync Requested" : "Ready"}
              </span>
            </div>

            {/* Pipeline Steps - queued, not claimed complete until notifications confirm */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm">
                <Globe className="h-4 w-4 text-brand-secondary shrink-0" aria-hidden="true" />
                <span className="text-slate-200">GitHub REST API (4 Course Repositories)</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm">
                <Database className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span className="text-slate-200">LeetCode GraphQL Verified Delta</span>
              </div>

              <div className="flex items-center gap-2.5 text-sm">
                <ShieldCheck className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
                <span className="text-slate-200">Sunday 23:59:59 IST Boundary Audit</span>
              </div>
            </div>

            {/* Live Status readout */}
            {isSyncing && (
              <div role="status" aria-live="polite" className="mt-3 p-2.5 rounded-lg bg-black/40 border border-white/10 text-sm text-brand-secondary flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary animate-ping" aria-hidden="true" />
                <span>{syncStep}</span>
              </div>
            )}
            {hasRequested && !isSyncing && (
              <p className="mt-3 text-sm text-muted">
                Sync request sent. Check notifications for the confirmed outcome — this dialog does not claim success before the server responds.
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-muted">
            <span className="text-brand-secondary font-semibold">Rule §9.2 Compliance:</span> Manual sync requests are rate-limited to 1 request per 10 minutes to protect platform quotas and preserve deterministic delta timestamps.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <button
            onClick={closeSyncModal}
            className="px-4 py-2.5 rounded-xl text-sm text-muted hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
          >
            Close
          </button>

          <button
            onClick={handleStartSync}
            disabled={isSyncing}
            aria-busy={isSyncing}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-secondary hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <RotateCw className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} aria-hidden="true" />
            <span>{isSyncing ? "Synchronizing…" : "Execute Sync Now"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
