import httpClient from "./client";
import { clientEnv } from "@/env/client";
import { AUTH_ENDPOINTS } from "./constants";
import { ApiAxiosError, PendingRequest } from "./types";

const API_BASE_URL = `${clientEnv.NEXT_PUBLIC_API_URL}/api/v1`;

let isRefreshing = false;

let pendingQueue: PendingRequest[] = [];

/**
 * Process waiting requests after refresh completes.
 */
function processQueue(error?: unknown): void {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve();
    }
  });

  pendingQueue = [];
}

/**
 * Wait until refresh completes.
 */
export function waitForRefresh(): Promise<void> {
  return new Promise((resolve, reject) => {
    pendingQueue.push({
      resolve,
      reject,
    });
  });
}

/**
 * Refresh session using HttpOnly refresh cookie.
 */
export async function refreshSession(): Promise<void> {
  if (isRefreshing) {
    return waitForRefresh();
  }

  isRefreshing = true;

  try {
    await httpClient.post(
      `${API_BASE_URL}${AUTH_ENDPOINTS.REFRESH}`,
      {},
      {
        withCredentials: true,
      },
    );

    processQueue();
  } catch (error) {
    processQueue(error);

    throw error as ApiAxiosError;
  } finally {
    isRefreshing = false;
  }
}
