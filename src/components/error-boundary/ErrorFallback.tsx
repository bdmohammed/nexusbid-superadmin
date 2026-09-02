'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Check, Copy, Home, RefreshCw } from 'lucide-react';

import { serializeError } from '@/lib/errors/serializeError';

export interface ErrorFallbackProps {
  error: Error;
  reset?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, reset }) => {
  const [copied, setCopied] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Normalize error properties for UI display (safe in prod, detailed in dev)
  const serialized = serializeError(error);

  const handleCopy = async () => {
    const diagnosticPayload = JSON.stringify(
      {
        errorId: serialized.errorId,
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause,
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );

    try {
      await navigator.clipboard.writeText(diagnosticPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy diagnostics:', err);
    }
  };

  const handleReset = () => {
    if (reset) {
      setIsResetting(true);
      try {
        reset();
      } catch (err) {
        console.error('Failed to reset boundary:', err);
      } finally {
        setIsResetting(false);
      }
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className="min-h-[70vh] w-full flex items-center justify-center p-6 bg-linear-to-b from-[var(--background,rgba(9,10,15,1))] to-[var(--surface-secondary,rgba(17,19,28,0.6))] text-[var(--foreground,#f5f5f5)]"
    >
      <div className="relative w-full max-w-xl p-8 rounded-2xl border border-[var(--border,rgba(255,255,255,0.05))] bg-[var(--background,rgba(17,19,28,0.85))] shadow-2xl overflow-hidden backdrop-blur-md">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center">
          {/* Header Warning Icon */}
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mb-6 animate-pulse">
            <AlertTriangle className="w-10 h-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Something Went Wrong
          </h1>

          <p className="text-sm text-[var(--muted,#9ca3af)] max-w-md mb-3">{serialized.message}</p>

          <span className="text-[10px] uppercase font-mono tracking-widest text-[var(--muted,#9ca3af)] opacity-70 bg-white/5 px-2.5 py-1 rounded-md mb-6">
            Error ID: {serialized.errorId}
          </span>

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-3 items-center justify-center mb-8">
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white transition-all shadow-lg shadow-red-500/10 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
              {isResetting ? 'Retrying...' : 'Try Again'}
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border border-[var(--border,rgba(255,255,255,0.05))] bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Go Back Home
            </Link>
          </div>

          {/* Diagnostics Section (Development Only) */}
          {isDevelopment && (
            <div className="w-full text-left bg-black/40 border border-white/5 rounded-xl p-4 mt-2">
              <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-500">
                  Developer Diagnostics
                </span>

                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-semibold bg-white/5 hover:bg-white/10 rounded-md transition-colors cursor-pointer"
                  title="Copy error diagnostic information"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Diagnostics
                    </>
                  )}
                </button>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-2 font-mono text-[11px] leading-relaxed text-neutral-300">
                <div>
                  <span className="text-neutral-500">Name:</span> {error.name}
                </div>
                <div>
                  <span className="text-neutral-500">Message:</span> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <span className="text-neutral-500">Stack:</span>
                    <pre className="mt-1 whitespace-pre-wrap overflow-x-auto text-[10px] text-neutral-400 bg-black/25 p-2 rounded-lg">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
