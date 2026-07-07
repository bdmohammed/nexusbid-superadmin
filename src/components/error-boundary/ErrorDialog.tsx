// src/components/error-boundary/ErrorDialog.tsx
'use client';

import React, { useState } from 'react';
import { AlertCircle, X, Copy, Check, RefreshCw } from 'lucide-react';
import { serializeError } from '@/lib/errors/serialize-error';

export interface ErrorDialogProps {
  error: Error;
  reset?: () => void;
  onClose?: () => void;
}

export const ErrorDialog: React.FC<ErrorDialogProps> = ({ error, reset, onClose }) => {
  const [copied, setCopied] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const serialized = serializeError(error);

  const handleCopy = async () => {
    const diagnosticPayload = JSON.stringify(
      {
        errorId: serialized.errorId,
        message: error.message,
        name: error.name,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
    try {
      await navigator.clipboard.writeText(diagnosticPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy diagnostics:', err);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="error-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs text-[var(--foreground,#f5f5f5)] animate-fade-in"
    >
      <div className="relative w-full max-w-md p-6 rounded-xl border border-white/10 bg-neutral-900 shadow-2xl overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span id="error-dialog-title" className="font-bold text-sm">
              Component Error Captured
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/5 rounded-md transition-colors cursor-pointer"
              aria-label="Close Error Dialog"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content body */}
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-neutral-300">
            {serialized.message}
          </p>

          <div className="text-[10px] text-neutral-500 font-mono">
            Error ID: {serialized.errorId}
          </div>

          {/* Development Details */}
          {isDevelopment && (
            <div className="bg-black/50 rounded-lg p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-wider">
                  Dev Logs
                </span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3 text-green-500" />
                  ) : (
                    <Copy className="w-3" />
                  )}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <div className="max-h-24 overflow-y-auto font-mono text-[10px] text-neutral-400 whitespace-pre-wrap">
                {error.stack || error.message}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 rounded-md transition-all cursor-pointer"
              >
                Dismiss
              </button>
            )}
            {reset && (
              <button
                onClick={reset}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-md transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Component
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
