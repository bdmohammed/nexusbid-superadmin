'use client';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface GlobalErrorContentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function GlobalErrorContent({ error, reset }: GlobalErrorContentProps) {
  const handleRefresh = () => {
    // For global layout crashes, refreshing the window page is safest
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };
  return (
    <div className="w-full max-w-lg p-8 rounded-2xl border border-white/5 bg-[#11131c] shadow-2xl text-center relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 blur-3xl rounded-full" />

      <div className="inline-flex p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-full mb-6">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight mb-2">A Fatal Error Occurred</h1>

      <p className="text-sm text-neutral-400 mb-6 max-w-sm mx-auto leading-relaxed">
        The application encountered a critical layout rendering failure. Please refresh the browser
        window to recover.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={handleRefresh}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-500 text-white transition-all shadow-lg cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Application
        </button>

        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
        >
          Try Fast Recovery
        </button>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 text-left bg-black/40 border border-white/5 rounded-xl p-4 text-xs font-mono max-h-40 overflow-y-auto text-neutral-400">
          <span className="text-yellow-500 font-bold block mb-1">Fatal Trace:</span>
          {error.stack ?? error.message}
        </div>
      )}
    </div>
  );
}
