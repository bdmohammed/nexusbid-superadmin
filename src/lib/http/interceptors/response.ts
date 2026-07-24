import { AxiosInstance } from "axios";

import { clearCsrfToken, fetchCsrfToken } from "../csrf";
import { HTTP_STATUS } from "../constants";
import { refreshSession } from "../refresh";
import { ApiAxiosError, RetryRequestConfig } from "../types";
import { normalizeError } from "@/lib/errors";

const PUBLIC_AND_GUEST_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/bootstrap",
  "/verify-email",
  "/403",
  "/error-demo",
];

function isPublicOrGuestPath(pathname: string): boolean {
  return PUBLIC_AND_GUEST_PATHS.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function clearAuthCookiesAndRedirect(): void {
  if (typeof window !== "undefined") {
    // Clear all cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    const pathname = window.location.pathname;
    const search = window.location.search;

    if (!isPublicOrGuestPath(pathname)) {
      const redirectUrl = encodeURIComponent(pathname + search);
      window.location.href = `/login?redirect=${redirectUrl}`;
    }
  }
}

/**
 * Register response interceptor.
 */
export function setupResponseInterceptor(api: AxiosInstance): void {
  api.interceptors.response.use(
    (response) => response,

    async (error: ApiAxiosError) => {
      const originalRequest = error.config as RetryRequestConfig;

      if (!originalRequest) {
        return Promise.reject(error);
      }

      /**
       * ------------------------------------------------------------
       * 419 - Invalid / Expired CSRF Token
       * ------------------------------------------------------------
       */
      if (
        error.response?.status === HTTP_STATUS.CSRF_TOKEN_INVALID &&
        !originalRequest._csrfRetry
      ) {
        originalRequest._csrfRetry = true;
        clearCsrfToken();
        await fetchCsrfToken();
        return api(originalRequest);
      }

      const requestUrl = originalRequest.url ?? "";
      const currentPathname =
        typeof window !== "undefined" ? window.location.pathname : "";
      const isPublicOrGuest = isPublicOrGuestPath(currentPathname);

      const isAuthEndpoint =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/refresh") ||
        requestUrl.includes("/auth/bootstrap") ||
        (isPublicOrGuest && requestUrl.includes("/auth/me"));

      /**
       * ------------------------------------------------------------
       * 401 - Access Token Expired / Unauthenticated
       * ------------------------------------------------------------
       */
      if (
        error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
        !originalRequest._retry &&
        !isAuthEndpoint
      ) {
        originalRequest._retry = true;
        try {
          await refreshSession();
          return api(originalRequest);
        } catch (refreshError) {
          clearCsrfToken();
          clearAuthCookiesAndRedirect();
          return Promise.reject(normalizeError(refreshError));
        }
      } else if (
        error.response?.status === HTTP_STATUS.UNAUTHORIZED &&
        !isPublicOrGuest &&
        !isAuthEndpoint
      ) {
        // Direct 401 on private page when retry is already exhausted or not refreshable
        clearCsrfToken();
        clearAuthCookiesAndRedirect();
      }

      return Promise.reject(normalizeError(error));
    },
  );
}
