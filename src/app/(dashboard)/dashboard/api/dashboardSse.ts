import {
  type ConnectionEvent,
  type DashboardEventName,
  DashboardEvents,
  type DashboardSnapshot,
  type ShutdownEvent,
} from '../types/dashboard';

import type { CriticalAlerts, SystemHealth } from '@/features/dashboard/types';
import { logger } from '@/lib/logger';

export interface DashboardSSEOptions {
  onConnection?(data: ConnectionEvent): void;
  onDashboard?(data: DashboardSnapshot): void;
  onAlerts?(data: CriticalAlerts): void;
  onHealth?(data: SystemHealth): void;
  onError?(data: ErrorEvent): void;
  onShutdown?(data: ShutdownEvent): void;
}

/**
 * Local storage key used to persist the last received SSE event id.
 */
const LAST_EVENT_ID_STORAGE_KEY = 'dashboard-last-event-id';

/**
 * Load persisted Last-Event-ID.
 */
function loadLastEventId(): string | null {
  try {
    return localStorage.getItem(LAST_EVENT_ID_STORAGE_KEY);
  } catch (err) {
    logger.warn('Unable to read Last-Event-ID from localStorage', {
      context: {
        source: 'dashboardSSE',
        action: 'loadLastEventId',
      },
      error: err,
    });

    return null;
  }
}

/**
 * Persist Last-Event-ID.
 */
function saveLastEventId(eventId: string): void {
  try {
    localStorage.setItem(LAST_EVENT_ID_STORAGE_KEY, eventId);
  } catch (err) {
    logger.warn('Unable to persist Last-Event-ID', {
      context: {
        source: 'dashboardSSE',
        action: 'saveLastEventId',
      },
      error: err,
    });
  }
}

/**
 * Remove persisted event id.
 */
function clearLastEventId(): void {
  try {
    localStorage.removeItem(LAST_EVENT_ID_STORAGE_KEY);
  } catch (err) {
    logger.warn('Unable to remove Last-Event-ID', {
      context: {
        source: 'dashboardSSE',
        action: 'clearLastEventId',
      },
      error: err,
    });
  }
}

/**
 * Remember browser EventSource event ids.
 */
function rememberEvent(event: MessageEvent): void {
  if (event.lastEventId) {
    saveLastEventId(event.lastEventId);
  }
}

/**
 * Safe JSON parsing helper.
 */
function parseEventData<T>(event: MessageEvent): T | null {
  try {
    return JSON.parse(event.data) as T;
  } catch (err) {
    logger.error('Failed to parse dashboard SSE payload', err as Error, {
      context: {
        source: 'dashboardSSE',
        action: 'parseEventData',
        payload: event.data,
      },
    });

    return null;
  }
}

/**
 * Registers a strongly typed SSE event listener.
 */
function registerListener<T>(
  source: EventSource,
  eventName: DashboardEventName,
  callback?: (payload: T) => void,
): void {
  if (!callback) {
    return;
  }

  source.addEventListener(eventName, (event: MessageEvent) => {
    rememberEvent(event);

    const payload = parseEventData<T>(event);

    if (!payload) {
      return;
    }

    callback(payload);
  });
}

/**
 * Establishes a dashboard SSE connection.
 */
export function connectDashboardStream(options: DashboardSSEOptions): EventSource {
  const lastEventId = loadLastEventId();

  const url = lastEventId
    ? `/api/v1/dashboard/stream?lastEventId=${encodeURIComponent(lastEventId)}`
    : '/api/v1/dashboard/stream';

  const source = new EventSource(url, {
    withCredentials: true,
  });

  logger.info('Opening dashboard SSE connection', {
    context: {
      source: 'dashboardSSE',
      action: 'connectDashboardStream',
      lastEventId,
    },
  });

  registerListener<ConnectionEvent>(source, DashboardEvents.CONNECTION, options.onConnection);

  registerListener<DashboardSnapshot>(source, DashboardEvents.DASHBOARD, options.onDashboard);

  registerListener<CriticalAlerts>(source, DashboardEvents.ALERTS, options.onAlerts);

  registerListener<SystemHealth>(source, DashboardEvents.HEALTH, options.onHealth);

  registerListener<ErrorEvent>(source, DashboardEvents.ERROR, options.onError);

  registerListener<ShutdownEvent>(source, DashboardEvents.SHUTDOWN, (payload) => {
    logger.warn('Dashboard SSE shutdown received', {
      context: {
        source: 'dashboardSSE',
        action: 'shutdown',
      },
    });

    clearLastEventId();

    options.onShutdown?.(payload);

    source.close();
  });

  source.onopen = () => {
    logger.info('Dashboard SSE connected', {
      context: {
        source: 'dashboardSSE',
        action: 'onopen',
      },
    });
  };

  source.onerror = (event) => {
    logger.warn('Dashboard SSE connection error', {
      context: {
        source: 'dashboardSSE',
        action: 'onerror',
      },
      error: event,
    });

    /**
     * Do not close the connection here.
     * The browser automatically reconnects using the
     * server-provided `retry:` directive.
     */
  };

  return source;
}

/**
 * Gracefully closes the dashboard stream.
 */
export function disconnectDashboardStream(source: EventSource | null | undefined): void {
  if (!source) {
    return;
  }

  logger.info('Closing dashboard SSE connection', {
    context: {
      source: 'dashboardSSE',
      action: 'disconnectDashboardStream',
    },
  });

  source.close();
}
