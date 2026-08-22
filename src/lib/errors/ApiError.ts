// src/lib/errors/ApiError.ts

import { AppError } from "./AppError";
import { ERROR_CODES } from "./constants";

export class ApiError extends AppError {
  constructor(
    message: string = "API request failed",
    statusCode: number = 500,
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
    traceId?: string,
  ) {
    super(
      message,
      statusCode,
      ERROR_CODES.API_FAILURE,
      metadata,
      options,
      traceId,
    );
  }
}
