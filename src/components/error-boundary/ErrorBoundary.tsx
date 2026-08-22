// src/components/error-boundary/ErrorBoundary.tsx
"use client";

import React, { Component } from "react";

import type { ErrorInfo, ReactNode } from "react";
import { handleClientError } from "@/lib/errors/utils";

export interface ErrorBoundaryProps {
  fallback?:
    | ReactNode
    | React.ComponentType<{ error: Error; reset: () => void }>;
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return {
      hasError: true,
      error,
    };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log client-side error to logger/telemetry
    //@ts-ignore
    handleClientError(error, {
      component: "ErrorBoundary",
      componentStack: errorInfo.componentStack || undefined,
    });

    // Invoke user custom error callback
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error(
          "Error in ErrorBoundary onError callback:",
          callbackError,
        );
      }
    }
  }

  reset = (): void => {
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (callbackError) {
        console.error(
          "Error in ErrorBoundary onReset callback:",
          callbackError,
        );
      }
    }

    this.setState({
      hasError: false,
      error: null,
    });
  };

  override render(): ReactNode {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;

    if (hasError && error) {
      if (fallback) {
        if (typeof fallback === "function") {
          const FallbackComponent = fallback as React.ComponentType<{
            error: Error;
            reset: () => void;
          }>;
          return <FallbackComponent error={error} reset={this.reset} />;
        }
        return fallback;
      }

      // Default fallback UI will be handled by the companion ErrorFallback component.
      // If none is provided, we default to rendering the error message simply.
      return (
        <div className="p-6 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl text-center">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">{error.message}</p>
          <button
            onClick={this.reset}
            className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-semibold hover:bg-red-600 transition"
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
