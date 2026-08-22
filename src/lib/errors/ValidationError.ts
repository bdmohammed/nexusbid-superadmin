// src/lib/errors/ValidationError.ts

import { AppError } from "./AppError";
import { ERROR_CODES } from "./constants";

export class ValidationError extends AppError {
  constructor(
    message: string = "Validation failed",
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
    traceId?: string,
  ) {
    super(message, 400, ERROR_CODES.VALIDATION, metadata, options, traceId);
  }
}
