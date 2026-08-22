// src/lib/http/types.ts

import {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";

/**
 * Standard API Error Response
 */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
  errors?: Record<string, string[]> | string[];
  timestamp?: string;
  path?: string;
}

/**
 * Standard API Success Response
 */
export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

/**
 * Axios API Error
 */
export type ApiAxiosError = AxiosError<ApiErrorResponse>;

/**
 * Extended Axios Request Config
 */
export interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
  _csrfRetry?: boolean;
}

/**
 * Pending Request Queue Item
 */
export interface PendingRequest {
  resolve: () => void;
  reject: (error: unknown) => void;
}

/**
 * Refresh Function
 */
export type RefreshHandler = () => Promise<void>;

/**
 * CSRF Token Response
 */
export interface CsrfTokenResponse {
  csrfToken: string;
}

/**
 * Generic HTTP Request Config
 */
export interface HttpRequestConfig<D = unknown> extends AxiosRequestConfig<D> {
  skipAuth?: boolean;
  skipCsrf?: boolean;
}
