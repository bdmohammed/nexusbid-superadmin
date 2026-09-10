import type { UserStats } from '@/features/auth/types';
import type {
  CriticalAlerts,
  RevenueStats,
  SystemHealth,
  TenderStats,
} from '@/features/dashboard/types';

/**
 * Snapshot pushed from the dashboard SSE endpoint.
 *
 * Fields are optional because the backend removes
 * data the current user is not authorized to see.
 */
export interface DashboardSnapshot {
  timestamp: number;

  tender?: TenderStats;
  revenue?: RevenueStats;
  user?: UserStats;
  alerts?: CriticalAlerts[];
  health?: SystemHealth;
}

/**
 * Initial connection acknowledgement.
 */
export interface ConnectionEvent {
  status: 'connected';
  clientId: string;
}

/**
 * Polling or transport error sent by server.
 */
export interface ErrorEvent {
  message: string;
  timestamp: number;
}

/**
 * Server shutdown notification.
 */
export interface ShutdownEvent {
  message: string;
}

/**
 * Current client connection state.
 */
export type DashboardConnectionStatus =
  'connecting' | 'connected' | 'reconnecting' | 'disconnected';

/**
 * Supported server event names.
 */
export const DashboardEvents = {
  CONNECTION: 'connection',
  DASHBOARD: 'dashboard',
  ALERTS: 'alerts',
  HEALTH: 'health',
  ERROR: 'error',
  SHUTDOWN: 'shutdown',
} as const;

export type DashboardEventName = (typeof DashboardEvents)[keyof typeof DashboardEvents];

/**
 * Response from GET /dashboard/stream/status
 */
export interface DashboardStreamDiagnostics {
  connectedClients: number;
  activeClients: number;
  uptimeSeconds: number;

  cacheAgeMs: number | null;

  pollIntervalMs: number;
  heartbeatIntervalMs: number;

  isPolling: boolean;
  isShuttingDown: boolean;
  hasCachedSnapshot: boolean;
  cacheFresh: boolean;

  pollCount: number;
  failedPolls: number;
  broadcastCount: number;

  lastPollDurationMs: number;
  averagePollDurationMs: number;

  lastPollTimestamp: string | null;
  lastBroadcastTimestamp: string | null;
}
