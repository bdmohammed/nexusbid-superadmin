import { InternalAxiosRequestConfig } from "axios";

import { fetchCsrfToken, getCsrfToken } from "../csrf";
import { CONTENT_TYPES, HTTP_HEADERS, HttpMethod, MUTATING_METHODS } from "../constants";
import { HttpRequestConfig } from "../types";

/**
 * Request Interceptor
 */
export async function requestInterceptor(
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> {
  const request = config as HttpRequestConfig;

  /**
   * Skip auth/csrf if requested
   */
  if (request.skipCsrf) {
    return config;
  }

  /**
   * Default Content-Type
   */
  config.headers.set(HTTP_HEADERS.CONTENT_TYPE, CONTENT_TYPES.JSON);

  /**
   * Attach CSRF Token for mutating requests.
   */
  const method = (config.method?.toLowerCase() ?? '') as HttpMethod;

  if (method && MUTATING_METHODS.has(method)) {
    let csrfToken = getCsrfToken();

    if (!csrfToken) {
      csrfToken = await fetchCsrfToken();
    }

    if (csrfToken) {
      config.headers.set(HTTP_HEADERS.CSRF_TOKEN, csrfToken);
    }
  }

  return config;
}
