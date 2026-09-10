import { create } from 'zustand';

import type {
  DashboardConnectionStatus,
  DashboardSnapshot,
} from '@/app/(dashboard)/dashboard/types/dashboard';

interface DashboardState {
  /**
   * Latest dashboard snapshot received from the server.
   */
  snapshot: DashboardSnapshot | null;

  /**
   * Current SSE connection state.
   */
  connectionStatus: DashboardConnectionStatus;

  /**
   * Last received SSE event identifier.
   */
  lastEventId: string | null;

  /**
   * Timestamp of the latest successful update.
   */
  lastUpdated: number | null;

  // /**
  //  * Last error reported by the stream.
  //  */
  // lastError: ErrorEvent | null;

  setSnapshot: (snapshot: DashboardSnapshot) => void;
  setConnectionStatus: (status: DashboardConnectionStatus) => void;
  setLastEventId: (id: string) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  snapshot: null,
  connectionStatus: 'disconnected',
  lastEventId: null,
  lastUpdated: null,
  // lastError: null,

  setSnapshot: (snapshot) =>
    set({
      snapshot,
      lastUpdated: Date.now(),
    }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus }),
  setLastEventId: (lastEventId) => set({ lastEventId }),
  // setError: (lastError) => set({ lastError }),
  reset: () =>
    set({
      snapshot: null,
      connectionStatus: 'disconnected',
      lastEventId: null,
      lastUpdated: null,
      // lastError: null,
    }),
}));
