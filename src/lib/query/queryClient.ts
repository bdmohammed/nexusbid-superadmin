import {
  QueryClient,
  QueryCache,
  MutationCache,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { QUERY_CONFIG } from "../http";
import { logger } from "../logger";

/**
 * Creates a fresh, isolated QueryClient instance with production defaults.
 * Follows TanStack Query v5 Next.js App Router guidelines.
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        logger.error(error);
      },
    }),

    mutationCache: new MutationCache({
      onError: (error) => {
        logger.error(error);
      },
    }),

    defaultOptions: {
      queries: {
        staleTime: QUERY_CONFIG.STALE_TIME,
        gcTime: QUERY_CONFIG.GC_TIME,
        retry: QUERY_CONFIG.RETRY,
        retryDelay: QUERY_CONFIG.RETRY_DELAY,
        refetchOnWindowFocus: QUERY_CONFIG.REFETCH_ON_WINDOW_FOCUS,
        refetchOnReconnect: QUERY_CONFIG.REFETCH_ON_RECONNECT,
        refetchOnMount: QUERY_CONFIG.REFETCH_ON_MOUNT,
        throwOnError: false,
      },

      mutations: {
        retry: 0,
        networkMode: "online",
      },

      dehydrate: {
        // Include pending queries in SSR dehydration boundary
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === "pending",
      },
    },
  });
}

let browserQueryClient: QueryClient | null = null;

/**
 * Server-Safe QueryClient Factory
 * - On the Server: Always creates a new QueryClient instance per HTTP request to avoid cross-request cache leaks.
 * - On the Browser: Creates and reuses a single browser-scoped QueryClient instance.
 */
export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    // Server execution:
    // Always create a fresh QueryClient to avoid sharing cache
    // between independent server renders.
    return createQueryClient();
  }

  // Browser execution: lazy initialize singleton
  if (browserQueryClient === null) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}
