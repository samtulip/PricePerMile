"use client";

import { X } from "lucide-react";

interface RiskWarningModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function RiskWarningModal({ isOpen, onDismiss }: RiskWarningModalProps) {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only dismiss if clicking directly on the overlay, not on the modal content
    if (e.target === e.currentTarget) {
      onDismiss();
    }
  };

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onDismiss();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 cursor-pointer"
      onClick={handleOverlayClick}
      role="presentation"
      style={{ touchAction: "manipulation" }}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-lg shadow-lg max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            ⚠️ Important Notice
          </h2>
          <button
            type="button"
            onClick={handleButtonClick}
            className="flex items-center justify-center text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
            aria-label="Close warning"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-700 dark:text-slate-300">
            <strong>Use this site at your own risk.</strong> PricePerMile is an experimental project created for exploring &quot;vibe coding&quot; approaches and alternative development patterns.
          </p>

          <p className="text-slate-700 dark:text-slate-300">
            Fuel price data may not always be current or accurate. For reliable, up-to-date UK fuel pricing information, please consult official sources or dedicated fuel price comparison services.
          </p>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            This is a proof-of-concept project and should not be relied upon for critical decisions.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800 rounded-b-lg border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={handleButtonClick}
            className="w-full px-4 py-2 bg-[var(--accent-600)] text-[var(--accent-on)] rounded-lg font-medium hover:bg-[var(--accent-700)] transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
