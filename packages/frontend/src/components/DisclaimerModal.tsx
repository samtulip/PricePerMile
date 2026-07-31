"use client";

import { XIcon } from "lucide-react";
import { useState } from "react";

interface DisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DisclaimerModal({ isOpen, onClose }: DisclaimerModalProps) {
  const [neverShowAgain, setNeverShowAgain] = useState(false);

  const handleClose = () => {
    if (neverShowAgain) {
      onClose();
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            ⚠️ Disclaimer
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            aria-label="Close disclaimer"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4 text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-base">
            Please read the following important information before using PricePerMile:
          </p>

          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Use at Your Own Risk
              </p>
              <p>
                This service is provided as-is without any warranties or guarantees. Use it at your own risk.
                The information provided is for informational purposes only and should not be relied upon for making
                purchasing decisions without independent verification.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Experimental Project
              </p>
              <p>
                PricePerMile is a project for exploring AI agent-based software development (vibe coding).
                This is an experimental application and may contain bugs, incomplete features, or unexpected behavior.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                No Price Guarantees
              </p>
              <p>
                There are no guarantees that fuel prices displayed are current, accurate, or up to date.
                Prices may have changed since they were last updated. Always verify prices at the petrol station
                before making a purchase decision.
              </p>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white mb-1">
                Data Sources
              </p>
              <p>
                The fuel price data provided in this application comes from external sources and may not reflect
                real-time prices. We do not guarantee the accuracy, completeness, or timeliness of this data.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 px-6 py-4 bg-slate-50 dark:bg-slate-800">
          <label className="flex items-center gap-3 cursor-pointer mb-4">
            <input
              type="checkbox"
              checked={neverShowAgain}
              onChange={(e) => setNeverShowAgain(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[var(--accent-600)] focus:ring-2 focus:ring-[var(--accent-600)]"
              aria-label="Don't show this message again"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">
              Don't show this message again
            </span>
          </label>

          <button
            type="button"
            onClick={handleClose}
            className="w-full bg-[var(--accent-600)] hover:bg-[var(--accent-700)] text-[var(--accent-on)] font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
