// src/lib/errors/AuthenticationError.ts

import { AppError } from "./AppError";
import { ERROR_CODES } from "./constants";

export class AuthenticationError extends AppError {
  constructor(
    message: string = "Authentication required",
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
    traceId?: string,
  ) {
    super(
      message,
      401,
      ERROR_CODES.UNAUTHENTICATED,
      metadata,
      options,
      traceId,
    );
  }
}
