import { QueryClient, QueryCache, MutationCache } from "@tanstack/react-query";
import { QUERY_CONFIG } from "../http";
import { logger } from "../logger";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      logger.error(error as any);
    },
  }),

  mutationCache: new MutationCache({
    onError: (error) => {
      logger.error(error as any);
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
    },
  },
});

export default queryClient;
