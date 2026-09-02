'use client';

import { useEffect } from 'react';

import { ErrorFallback } from '@/components/error-boundary/ErrorFallback';
import { handleClientError } from '@/lib/errors/utils';

export interface RouteErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RouteErrorProps) {
  useEffect(() => {
    // Log unexpected route errors to console or ingestion
    handleClientError(error, {
      component: 'RootError',
      digest: error.digest,
    });
  }, [error]);

  return <ErrorFallback error={error} reset={reset} />;
}
