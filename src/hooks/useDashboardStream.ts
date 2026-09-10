import { useEffect } from 'react';

import {
  connectDashboardStream,
  disconnectDashboardStream,
} from '@/app/(dashboard)/dashboard/api/dashboardSse';
import { logger } from '@/lib/logger';
import { useDashboardStore } from '@/store/useDashboardStore';

export function useDashboardStream(): void {
  const setSnapshot = useDashboardStore((state) => state.setSnapshot);

  const setConnectionStatus = useDashboardStore((state) => state.setConnectionStatus);

  // const setError = useDashboardStore(
  //   (state) => state.setError,
  // );

  useEffect(() => {
    setConnectionStatus('connecting');

    const stream = connectDashboardStream({
      onConnection() {
        setConnectionStatus('connected');
      },

      onDashboard(snapshot) {
        setSnapshot(snapshot);
      },

      onError(error) {
        // setError(error);

        logger.error('Dashboard SSE error', new Error(error.message), {
          context: {
            source: 'useDashboardStream',
            action: 'onError',
          },
        });
      },

      onShutdown() {
        setConnectionStatus('disconnected');
      },
    });

    stream.onerror = () => {
      /**
       * Native EventSource automatically reconnects.
       * Reflect this in UI.
       */
      setConnectionStatus('reconnecting');
    };

    stream.onopen = () => {
      setConnectionStatus('connected');
    };

    return () => {
      disconnectDashboardStream(stream);

      setConnectionStatus('disconnected');
    };
  }, [
    setConnectionStatus,
    // setError,
    setSnapshot,
  ]);
}
