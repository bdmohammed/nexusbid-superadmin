// src/lib/errors/types.ts

import { ErrorCode } from "./constants";

export interface ErrorContext {
  pathname?: string;
  userId?: string;
  correlationId?: string;
  component?: string;
  browser?: string;
  userAgent?: string;
  componentStack?: string;
  [key: string]: unknown;
}

export interface SerializedError {
  errorId: string;
  message: string;
  code: ErrorCode;
  statusCode: number;
  metadata?: Record<string, unknown>;
  stack?: string;
  cause?: string;
  componentStack?: string;
}
