'use client';

import { useEffect } from 'react';

import { GlobalErrorContent } from '@/components/error-boundary/GlobalErrorContent';
import { handleClientError } from '@/lib/errors/utils';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    // Log root rendering crash to client console/ingestion
    handleClientError(error, {
      component: 'GlobalError',
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <head>
        <title>Fatal Application Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-[#090a0f] text-[#f5f5f5] font-sans antialiased flex items-center justify-center p-6">
        <GlobalErrorContent error={error} reset={reset} />
      </body>
    </html>
  );
}
