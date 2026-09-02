'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import type { ReactNode } from 'react';
import { getQueryClient } from '@/lib/query/queryClient';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * TanStack Query Provider Component
 * Consumes the server-safe getQueryClient() factory to ensure proper cache isolation
 * across SSR requests and persistent cache reuse in browser environments.
 * Integrates ReactQueryDevtools for inspection.
 */
export default function QueryProvider({ children }: QueryProviderProps) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
