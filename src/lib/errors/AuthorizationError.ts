// src/lib/errors/AuthorizationError.ts

import { AppError } from "./AppError";
import { ERROR_CODES } from "./constants";

export class AuthorizationError extends AppError {
  constructor(
    message: string = "Access denied",
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
    traceId?: string,
  ) {
    super(message, 403, ERROR_CODES.UNAUTHORIZED, metadata, options, traceId);
  }
}
