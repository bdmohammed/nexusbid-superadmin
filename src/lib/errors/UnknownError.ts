// src/lib/errors/UnknownError.ts

import { AppError } from "./AppError";
import { ERROR_CODES } from "./constants";

export class UnknownError extends AppError {
  constructor(
    message: string = "An unknown error occurred",
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
    traceId?: string,
  ) {
    super(message, 500, ERROR_CODES.UNKNOWN, metadata, options, traceId);
  }
}
