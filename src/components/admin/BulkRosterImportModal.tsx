"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, FileSpreadsheet, CheckCircle2, AlertCircle, Users, Download } from "lucide-react";

interface BulkRosterImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SAMPLE_CSV = `roll_no,name,email,class_section,handle_github,handle_leetcode,handle_hackerrank
2022BCSE101,Vikram Mehta,vikram.mehta@college.edu,CSE-A,vikram_dev,vikram_m,vikram_hr
2022BCSE102,Ananya Sen,ananya.sen@college.edu,CSE-A,ananya_code,ananya_s,ananya_py
2022BCSE103,Karthik Raja,karthik.raja@college.edu,CSE-A,karthik_r,karthik_algo,karthik_stars
2022BCSE104,Divya Patel,divya.patel@college.edu,CSE-A,divya_dev,divya_lc,divya_hack
2022BCSE105,Siddharth Rao,siddharth.rao@college.edu,CSE-A,sid_codes,sid_leet,sid_hr`;

export function BulkRosterImportModal({ isOpen, onClose, onSuccess }: BulkRosterImportModalProps) {
  const [csvText, setCsvText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importResult, setImportResult] = useState<{
    importedCount: number;
    skippedCount: number;
    skipped: Array<{ rollNo: string; name: string; reason: string }>;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    csvInputRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "twm_class_roster_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvText(text);
        setErrorMessage(null);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!csvText.trim()) {
      setErrorMessage("Please paste CSV data or upload a file first.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setImportResult(null);

    try {
      const res = await fetch("/api/roster/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "text/csv" },
        body: csvText,
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || data.error || "Failed to import roster");
        return;
      }

      setImportResult({
        importedCount: data.summary.importedCount,
        skippedCount: data.summary.skippedCount,
        skipped: data.skipped || [],
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("twm:roster-updated"));
      }

      onSuccess();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Network error during batch import");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-import-title"
          aria-describedby="bulk-import-help"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-surface border border-white/10 rounded-panel p-6 sm:p-8 shadow-overlay space-y-6 relative max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2.5 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-brand-primary shrink-0">
                <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 id="bulk-import-title" className="text-xl font-bold text-white break-words">Bulk Class Roster Importer</h3>
                <p id="bulk-import-help" className="text-xs text-muted">§3.3 Authoritative Quorum Denominator</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close bulk roster importer"
              className="p-2 rounded-lg text-muted hover:text-white hover:bg-white/5 transition-colors shrink-0"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors font-semibold"
            >
              <Download className="h-4 w-4 text-brand-primary shrink-0" aria-hidden="true" />
              <span>Download Template (CSV)</span>
            </button>

            <label htmlFor="bulk-csv-file" className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-primary/10 hover:bg-brand-primary/20 text-brand-primary border border-brand-primary/20 cursor-pointer transition-colors font-semibold">
              <UploadCloud className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Choose CSV File</span>
              <input id="bulk-csv-file" type="file" accept=".csv,text/csv" onChange={handleFileUpload} className="hidden" aria-label="Choose a CSV file to load" />
            </label>
          </div>

          {/* CSV Input Area */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor="bulk-csv-data" className="text-xs font-semibold text-muted break-words">
                CSV Data (roll_no, name, email, class_section, [github], [leetcode], [hackerrank])
              </label>
              <button
                type="button"
                onClick={() => setCsvText(SAMPLE_CSV)}
                className="text-xs font-semibold text-brand-secondary hover:text-white transition-colors underline-offset-2 hover:underline"
                aria-label="Load demo rows into the CSV text area"
              >
                Load Demo Rows
              </button>
            </div>
            <textarea
              ref={csvInputRef}
              id="bulk-csv-data"
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="Paste comma-separated rows or upload a .csv file above..."
              rows={8}
              aria-describedby="bulk-import-help"
              className="w-full rounded-xl bg-surface-raised border border-white/10 px-4 py-3 text-[13px] font-mono text-slate-200 placeholder:text-muted focus:outline-none focus:border-brand-primary"
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div role="alert" className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span className="break-words">{errorMessage}</span>
            </div>
          )}

          {/* Result Banner */}
          {importResult && (
            <div role="status" className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="break-words">Batch Import Completed Successfully!</span>
              </div>
              <div className="text-sm text-slate-300 break-words">
                • Successfully enrolled: <strong className="text-white tabular-nums">{importResult.importedCount}</strong> students.
                {importResult.skippedCount > 0 && (
                  <span>
                    {" "}• Skipped: <strong className="text-amber-400 tabular-nums">{importResult.skippedCount}</strong> rows.
                  </span>
                )}
              </div>
              {importResult.skipped.length > 0 && (
                <div className="text-[13px] text-muted max-h-24 overflow-y-auto space-y-1 pt-1">
                  {importResult.skipped.map((s, idx) => (
                    <div key={`${s.rollNo}-${idx}`} className="flex items-start gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="break-words">
                        {s.rollNo ?? "Unavailable"} ({s.name ?? "Unknown"}): {s.reason ?? "Unavailable"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !csvText.trim()}
              className="px-6 py-2.5 rounded-xl bg-brand-secondary hover:bg-accent-hover text-white font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Users className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{isSubmitting ? "Importing Roster..." : "Execute Batch Import"}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
