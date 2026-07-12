// src/app/error-demo/ErrorDemoClient.tsx
'use client';

import React, { useState } from 'react';
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary';
import { ErrorDialog } from '@/components/error-boundary/ErrorDialog';
import { submitFailingFormAction, triggerServerActionCrash } from './actions';
import { normalizeError } from '@/lib/errors/normalize-error';
import { AppError } from '@/lib/errors/AppError';

// A mock sub-component that throws on demand
const BuggyComponent: React.FC<{ shouldCrash: boolean }> = ({ shouldCrash }) => {
  if (shouldCrash) {
    throw new Error('Unchecked runtime exception inside client component render.');
  }
  return (
    <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
      <span className="text-green-500 text-sm font-semibold">✓ Client Subcomponent Rendering Successfully</span>
    </div>
  );
};

// A buggy widget representing a map or third party widget
const FaultyWidget: React.FC = () => {
  const [crashed, setCrashed] = useState(false);
  if (crashed) {
    throw new Error('Third-party map widget failed to parse tiles API.');
  }
  return (
    <div className="p-6 bg-white/5 border border-white/5 rounded-xl text-center flex flex-col items-center">
      <span className="text-sm font-semibold text-neutral-300">Third-Party Widget Wrapper</span>
      <p className="text-xs text-neutral-500 mt-1 mb-4">Wrapped in an ErrorBoundary and ErrorDialog fallback.</p>
      <button
        onClick={() => setCrashed(true)}
        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-xs font-semibold rounded-md transition cursor-pointer"
      >
        Crash Map Widget
      </button>
    </div>
  );
};

export default function ErrorDemoClient() {
  // Client component crash state
  const [clientCrash, setClientCrash] = useState(false);

  // Server actions states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [formFeedback, setFormFeedback] = useState<any>(null);
  const [actionCrashFeedback, setActionCrashFeedback] = useState<any>(null);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [isCrashingAction, setIsCrashingAction] = useState(false);

  // API Normalization simulator state
  const [simulatedError, setSimulatedError] = useState<AppError | null>(null);

  // Faulty widget modal recovery state
  const [widgetError, setWidgetError] = useState<Error | null>(null);

  // Server Action 1: Submit and validate form
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    setFormFeedback(null);
    try {
      const res = await submitFailingFormAction({ name, email });
      setFormFeedback(res);
    } catch (err) {
      setFormFeedback({ success: false, error: err });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  // Server Action 2: Trigger action crash
  const handleActionCrash = async () => {
    setIsCrashingAction(true);
    setActionCrashFeedback(null);
    try {
      const res = await triggerServerActionCrash();
      setActionCrashFeedback(res);
    } catch (err) {
      setActionCrashFeedback({ success: false, error: err });
    } finally {
      setIsCrashingAction(false);
    }
  };

  // API response normalizer simulations
  const handleSimulateApi = (type: 'validation' | 'auth' | '404' | 'network' | '500') => {
    let mockException: any;

    switch (type) {
      case 'validation':
        mockException = {
          isAxiosError: true,
          response: {
            status: 400,
            data: { message: 'Invalid payload parameters supplied.' },
          },
        };
        break;
      case 'auth':
        mockException = {
          isAxiosError: true,
          response: {
            status: 401,
            data: { message: 'Bearer access token expired.' },
          },
        };
        break;
      case '404':
        mockException = {
          isAxiosError: true,
          response: {
            status: 404,
            data: { message: 'Tender database row not found.' },
          },
        };
        break;
      case 'network':
        mockException = new TypeError('failed to fetch');
        break;
      case '500':
        mockException = {
          isAxiosError: true,
          response: {
            status: 500,
            data: { message: 'Internal Server Error (Database connection issue).' },
          },
        };
        break;
    }

    const normalized = normalizeError(mockException);
    setSimulatedError(normalized);
  };

  return (
    <div className="space-y-8">
      {/* 1. Client Component Crash & Error Boundary */}
      <section className="p-6 bg-white/5 border border-white/5 rounded-2xl">
        <h2 className="text-lg font-bold mb-2">1. Local React Error Boundary</h2>
        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          The buggy component below is wrapped inside a custom &lt;ErrorBoundary&gt;. Crashing it displays the standard &lt;ErrorFallback&gt; component just for this card, protecting the parent page layout.
        </p>

        <div className="border border-white/5 rounded-xl p-4 bg-black/20">
          <ErrorBoundary
            fallback={({ error, reset }) => (
              <div className="p-6 border border-red-500/20 bg-red-500/5 text-red-500 rounded-xl text-center">
                <p className="text-sm font-bold mb-2">Caught by Local ErrorBoundaryProps</p>
                <p className="text-xs text-neutral-400 mb-4">{error.message}</p>
                <button
                  onClick={() => {
                    setClientCrash(false);
                    reset();
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-md transition cursor-pointer"
                >
                  Reset Local Component
                </button>
              </div>
            )}
          >
            <BuggyComponent shouldCrash={clientCrash} />
          </ErrorBoundary>
        </div>

        {!clientCrash && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setClientCrash(true)}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-xs font-semibold rounded-md transition cursor-pointer"
            >
              Simulate Subcomponent Crash
            </button>
          </div>
        )}
      </section>

      {/* 2. Server Action Failures & Serialization */}
      <section className="p-6 bg-white/5 border border-white/5 rounded-2xl">
        <h2 className="text-lg font-bold mb-2">2. Server Action Errors</h2>
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Next.js Server Actions execute code directly on the server. Errors are captured using `handleActionError` and returned safely across the client network boundary.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Action A: Form validation */}
          <div className="p-4 bg-black/20 border border-white/5 rounded-xl">
            <h3 className="text-sm font-bold mb-3">Validation Failure</h3>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. John"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#171924]/80 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-hidden focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-semibold text-neutral-500 mb-1">Email</label>
                <input
                  type="text"
                  placeholder="e.g. j@doe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#171924]/80 border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-hidden focus:border-red-500"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmittingForm}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition cursor-pointer"
              >
                {isSubmittingForm ? 'Submitting...' : 'Submit to Validate'}
              </button>
            </form>

            {formFeedback && (
              <div className="mt-4 p-3 rounded-lg text-xs bg-black/40 border border-white/5 overflow-x-auto max-h-40">
                <span className="font-bold block mb-1">Response JSON:</span>
                <pre className="text-[10px] text-neutral-400">
                  {JSON.stringify(formFeedback, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Action B: Severe Crash */}
          <div className="p-4 bg-black/20 border border-white/5 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold mb-1">Fatal Server Crash</h3>
              <p className="text-xs text-neutral-500 mb-4">
                Triggers a database connection throw. Production serialization strips server stack trace, returning only a safe generic message with an Error ID.
              </p>
            </div>
            <div>
              <button
                onClick={handleActionCrash}
                disabled={isCrashingAction}
                className="w-full py-2 bg-red-950/40 hover:bg-red-950 border border-red-500/20 text-red-400 text-xs font-semibold rounded-md transition cursor-pointer"
              >
                {isCrashingAction ? 'Crashing...' : 'Trigger Action Crash'}
              </button>

              {actionCrashFeedback && (
                <div className="mt-4 p-3 rounded-lg text-xs bg-black/40 border border-white/5 overflow-x-auto max-h-40">
                  <span className="font-bold block mb-1">Safe Client Response:</span>
                  <pre className="text-[10px] text-neutral-400">
                    {JSON.stringify(actionCrashFeedback, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. API Normalizer */}
      <section className="p-6 bg-white/5 border border-white/5 rounded-2xl">
        <h2 className="text-lg font-bold mb-2">3. API Normalizer & Code Mapping</h2>
        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          Simulate different network and HTTP exception types to watch the normalizer translate status codes into specific client-facing Error classes.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => handleSimulateApi('validation')}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            400 Validation
          </button>
          <button
            onClick={() => handleSimulateApi('auth')}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            401 Unauthorized
          </button>
          <button
            onClick={() => handleSimulateApi('404')}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            404 Not Found
          </button>
          <button
            onClick={() => handleSimulateApi('network')}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            Network Offline
          </button>
          <button
            onClick={() => handleSimulateApi('500')}
            className="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            500 Database Crash
          </button>
        </div>

        {simulatedError && (
          <div className="p-4 bg-black/30 border border-white/5 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-blue-400">Normalized Error Output</span>
              <button
                onClick={() => setSimulatedError(null)}
                className="text-[10px] text-neutral-500 hover:text-neutral-300"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-neutral-500">Class:</span> <span className="text-yellow-500">{simulatedError.name}</span>
              </div>
              <div>
                <span className="text-neutral-500">Status Code:</span> {simulatedError.statusCode}
              </div>
              <div>
                <span className="text-neutral-500">App Error Code:</span> {simulatedError.code}
              </div>
              <div>
                <span className="text-neutral-500">Message:</span> {simulatedError.message}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Dialog Boundary Overlay */}
      <section className="p-6 bg-white/5 border border-white/5 rounded-2xl">
        <h2 className="text-lg font-bold mb-2">4. Inline Widget Boundary & Dialog fallbacks</h2>
        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          For minor UI widgets, rendering full-page error fallbacks is disruptive. The map widget below handles its own crash via local state and triggers a modal ErrorDialog overlay, permitting recovery.
        </p>

        <div className="border border-white/5 rounded-xl p-4 bg-black/20">
          <ErrorBoundary
            onError={(err) => setWidgetError(err)}
            fallback={<div className="p-6 text-center text-xs text-red-500 border border-red-500/20 bg-red-500/5 rounded-xl">Widget is currently offline</div>}
          >
            <FaultyWidget />
          </ErrorBoundary>
        </div>

        {widgetError && (
          <ErrorDialog
            error={widgetError}
            onClose={() => setWidgetError(null)}
            reset={() => setWidgetError(null)}
          />
        )}
      </section>
    </div>
  );
}
