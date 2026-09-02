'use client';

import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private readonly handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full p-6 my-4 bg-[var(--surface-secondary)] border border-red-500/20 rounded-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-500 opacity-5 blur-2xl rounded-full"></div>

          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg shrink-0">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[var(--foreground)]">Failed to load section</h3>

              <p className="mt-1 text-sm text-[var(--muted)]">
                An error occurred while loading this part of the page.
              </p>

              {this.state.error?.message && (
                <p className="mt-2 text-xs font-mono text-red-500/80 break-words line-clamp-2">
                  {this.state.error.message}
                </p>
              )}

              <button
                onClick={this.handleReset}
                className="mt-4 inline-flex items-center gap-2 py-1.5 px-3 bg-[var(--background)] hover:bg-[var(--border)] border border-[var(--border)] text-[var(--foreground)] text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Section
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
