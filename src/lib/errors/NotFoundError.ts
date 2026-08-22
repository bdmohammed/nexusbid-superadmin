// src/lib/errors/NotFoundError.ts

import { AppError } from "./AppError";
import { ERROR_CODES } from "./constants";

export class NotFoundError extends AppError {
  constructor(
    message: string = "Resource not found",
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
    traceId?: string,
  ) {
    super(message, 404, ERROR_CODES.NOT_FOUND, metadata, options, traceId);
  }
}
