// src/app/error-demo/page.tsx
import React, { use } from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, CloudRain, Cpu, FileText, Globe } from 'lucide-react';
import ErrorDemoClient from './ErrorDemoClient';

interface PageProps {
  searchParams: Promise<{ crash?: string }>;
}

function ServerCrashComponent(): never {
  throw new Error('Database connection timeout (Simulated Server-Side Component Crash).');
}

export default async function ErrorDemoPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const shouldCrashServer = params.crash === 'server';

  // If URL contains ?crash=server, render the crashing component to trigger route-level error.tsx
  if (shouldCrashServer) {
    return <ServerCrashComponent />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#090a0f] to-[#11131c] text-[#f5f5f5] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="inline-flex p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Error Handling Architecture Demo
          </h1>
          <p className="mt-3 text-sm text-neutral-400 max-w-xl mx-auto leading-relaxed">
            Test route-level boundaries, custom class-based error boundaries, environment-aware loggers, API normalization, and Server Action errors.
          </p>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-2">
              <CloudRain className="w-4 h-4" />
              <span>Route Boundaries</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Handled by `error.tsx` and `global-error.tsx`. Isolates rendering errors to the current layout section.
            </p>
          </div>
          <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
              <Cpu className="w-4 h-4" />
              <span>React Error Boundaries</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Class-based boundaries isolating unstable widgets or third-party features from crashing the main page.
            </p>
          </div>
          <div className="p-5 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
              <Globe className="w-4 h-4" />
              <span>API Normalizer</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Transforms fetch/axios responses into custom error subclasses with error code indexing.
            </p>
          </div>
        </div>

        {/* Server Component Trigger */}
        <div className="p-6 bg-red-950/20 border border-red-500/15 rounded-2xl mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm text-white">Server-Side Page Crash</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-md">
                Force a Server Component to throw during layout compilation. Caught by the page-level `error.tsx` boundary.
              </p>
            </div>
          </div>
          <Link
            href="/error-demo?crash=server"
            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs transition cursor-pointer"
          >
            Trigger Server Crash
          </Link>
        </div>

        {/* Client Interactive Area */}
        <ErrorDemoClient />
      </div>
    </div>
  );
}
