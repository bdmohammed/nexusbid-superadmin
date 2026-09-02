import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Query } from '@tanstack/react-query';

import { createQueryClient, getQueryClient } from '../queryClient';
import { QUERY_CONFIG } from '../../http';
import { logger } from '../../logger';

vi.mock('../../logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('query-client', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    });
  });

  describe('createQueryClient', () => {
    it('creates a QueryClient', () => {
      const client = createQueryClient();

      expect(client).toBeDefined();
    });

    it('uses configured query defaults', () => {
      const client = createQueryClient();

      const defaults = client.getDefaultOptions().queries!;

      expect(defaults.staleTime).toBe(QUERY_CONFIG.STALE_TIME);
      expect(defaults.gcTime).toBe(QUERY_CONFIG.GC_TIME);
      expect(defaults.retry).toBe(QUERY_CONFIG.RETRY);
      expect(defaults.retryDelay).toBe(QUERY_CONFIG.RETRY_DELAY);
      expect(defaults.refetchOnWindowFocus).toBe(
        QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
      );
      expect(defaults.refetchOnReconnect).toBe(
        QUERY_CONFIG.REFETCH_ON_RECONNECT,
      );
      expect(defaults.refetchOnMount).toBe(
        QUERY_CONFIG.REFETCH_ON_MOUNT,
      );
      expect(defaults.throwOnError).toBe(false);
    });

    it('uses configured mutation defaults', () => {
      const client = createQueryClient();

      const defaults = client.getDefaultOptions().mutations!;

      expect(defaults.retry).toBe(0);
      expect(defaults.networkMode).toBe('online');
    });

    it('logs query cache errors', () => {
      const client = createQueryClient();

      const error = new Error('query');

      client.getQueryCache().config.onError?.(
        error,
        {} as unknown as Query<unknown, unknown, unknown, readonly unknown[]>,
      );

      expect(logger.error).toHaveBeenCalledWith(error);
    });

    it('logs mutation cache errors', () => {
      const client = createQueryClient();

      const error = new Error('mutation');

      client.getMutationCache().config.onError?.(
        error,
        {} as any,       // variables
        undefined,       // context
        {} as any,       // mutation
        {} as any,       // mutationFnContext
      );

      expect(logger.error).toHaveBeenCalledWith(error);
    });

    it('configures dehydration', () => {
      const client = createQueryClient();

      expect(
        client.getDefaultOptions().dehydrate?.shouldDehydrateQuery,
      ).toBeTypeOf('function');
    });
  });

  describe('getQueryClient', () => {
    it('creates a new client on the server', () => {
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        configurable: true,
      });

      const client1 = getQueryClient();
      const client2 = getQueryClient();

      expect(client1).not.toBe(client2);
    });

    it('returns the same client in the browser', () => {
      Object.defineProperty(globalThis, 'window', {
        value: {},
        configurable: true,
      });

      const client1 = getQueryClient();
      const client2 = getQueryClient();

      expect(client1).toBe(client2);
    });
  });
});
