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
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REGISTER: "/auth/register",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
  CSRF_TOKEN: "/auth/csrf-token",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",
} as const;

/**
 * Endpoints that DO NOT require authentication.
 */
export const PUBLIC_ENDPOINTS = new Set<string>([
  AUTH_ENDPOINTS.LOGIN,
  AUTH_ENDPOINTS.REGISTER,
  AUTH_ENDPOINTS.CSRF_TOKEN,
  AUTH_ENDPOINTS.FORGOT_PASSWORD,
  AUTH_ENDPOINTS.RESET_PASSWORD,
  AUTH_ENDPOINTS.VERIFY_EMAIL,
]);

/**
 * Mutating HTTP methods.
 */
export const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

/**
 * Axios Defaults
 */
export const AXIOS_CONFIG = {
  TIMEOUT: 30_000,
  MAX_RETRY_COUNT: 1,
} as const;

export const QUERY_CONFIG = {
  STALE_TIME: 1000 * 60 * 5, // 5 minutes
  GC_TIME: 1000 * 60 * 30, // 30 minutes
  RETRY: 1,
  RETRY_DELAY: (attempt: number) => Math.min(1000 * 2 ** attempt, 30_000),
  REFETCH_ON_WINDOW_FOCUS: false,
  REFETCH_ON_RECONNECT: true,
  REFETCH_ON_MOUNT: false,
} as const;
