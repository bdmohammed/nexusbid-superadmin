import httpClient from "./client";
import { clientEnv } from "@/env/client";
import { AUTH_ENDPOINTS } from "./constants";
import { ApiResponse, CsrfTokenResponse } from "./types";
import { logger } from "@/lib/logger";

const API_BASE_URL = `${clientEnv.NEXT_PUBLIC_API_URL}/api/v1`;

let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

/**
 * Get cached CSRF token.
 */
export function getCsrfToken(): string | null {
  return csrfToken;
}

/**
 * Set CSRF token.
 */
export function setCsrfToken(token: string | null): void {
  csrfToken = token;
}

/**
 * Clear cached CSRF token.
 */
export function clearCsrfToken(): void {
  csrfToken = null;
}

/**
 * Fetch a new CSRF token from the backend.
 * Multiple concurrent requests share the same promise.
 */
export async function fetchCsrfToken(): Promise<string | null> {
  if (csrfToken) {
    return csrfToken;
  }

  if (csrfPromise) {
    return csrfPromise;
  }

  csrfPromise = (async () => {
    try {
      const { data } = await httpClient.get<ApiResponse<CsrfTokenResponse>>(
        `${API_BASE_URL}${AUTH_ENDPOINTS.CSRF_TOKEN}`,
        {
          withCredentials: true,
        },
      );

      csrfToken = data.data.csrfToken;

      return csrfToken;
    } catch (error) {
      logger.error("Failed to fetch CSRF token", error);

      csrfToken = null;

      return null;
    } finally {
      csrfPromise = null;
    }
  })();

  return csrfPromise;
}
