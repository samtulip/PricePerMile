"use client";

import { X } from "lucide-react";

interface RiskWarningModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

export function RiskWarningModal({ isOpen, onDismiss }: RiskWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="flex items-start justify-between p-6 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-900">⚠️ Important Notice</h2>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-700 transition-colors"
            aria-label="Close warning"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-slate-700">
            <strong>Use this site at your own risk.</strong> PricePerMile is an experimental project created for exploring &quot;vibe coding&quot; approaches and alternative development patterns.
          </p>

          <p className="text-slate-700">
            Fuel price data may not always be current or accurate. For reliable, up-to-date UK fuel pricing information, please consult official sources or dedicated fuel price comparison services.
          </p>

          <p className="text-sm text-slate-600">
            This is a proof-of-concept project and should not be relied upon for critical decisions.
          </p>
        </div>

        <div className="px-6 py-4 bg-slate-50 rounded-b-lg border-t border-slate-200">
          <button
            type="button"
            onClick={onDismiss}
            className="w-full px-4 py-2 bg-[var(--accent-600)] text-[var(--accent-on)] rounded-lg font-medium hover:bg-[var(--accent-700)] transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
