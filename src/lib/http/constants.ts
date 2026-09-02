import { isTestEnv } from "@/env/client";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,

  CSRF_TOKEN_INVALID: 419,

  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  CSRF_TOKEN: "x-csrf-token",
  REQUEST_ID: "x-request-id",
  TRACE_ID: "x-trace-id",
  COOKIE: 'Cookie',
  SET_COOKIE: 'Set-Cookie',
} as const;

/**
 * Content Types
 */
export const CONTENT_TYPES = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  OCTET_STREAM: "application/octet-stream",
} as const;

/**
 * Auth Endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    CSRF_TOKEN: '/auth/csrf-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
} as const;

/**
 * Endpoints that DO NOT require authentication.
 */
const publicEndpoints = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REGISTER,
  API_ENDPOINTS.AUTH.CSRF_TOKEN,
  API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
  API_ENDPOINTS.AUTH.RESET_PASSWORD,
  API_ENDPOINTS.AUTH.VERIFY_EMAIL,
] as const;

export const PUBLIC_ENDPOINTS = new Set(publicEndpoints);

/**
 * Mutating HTTP methods.
 */
export const HTTP_METHODS = {
  GET: 'get',
  POST: 'post',
  PUT: 'put',
  PATCH: 'patch',
  DELETE: 'delete',
} as const;

export type HttpMethod =
  (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export const MUTATING_METHODS = new Set<HttpMethod>([
  HTTP_METHODS.POST,
  HTTP_METHODS.PUT,
  HTTP_METHODS.PATCH,
  HTTP_METHODS.DELETE,
]);

/**
 * Axios Defaults
 */
export const AXIOS_CONFIG = {
  TIMEOUT: isTestEnv() ? 300 : 30_000,
  MAX_RETRY_COUNT: isTestEnv() ? 0 : 1,
} as const;

export const QUERY_CONFIG = {
  STALE_TIME: 5 * MINUTE, // 5 minutes
  GC_TIME: 30 * MINUTE, // 30 minutes
  RETRY: isTestEnv() ? 0 : AXIOS_CONFIG.MAX_RETRY_COUNT,
  RETRY_DELAY: (attempt: number) => Math.min(2 ** attempt * SECOND, 30 * SECOND),
  REFETCH_ON_WINDOW_FOCUS: false,
  REFETCH_ON_RECONNECT: true,
  REFETCH_ON_MOUNT: false,
} as const;
