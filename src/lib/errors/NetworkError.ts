// src/lib/errors/NetworkError.ts

import { AppError } from "./AppError";
import { ERROR_CODES } from "./constants";

export class NetworkError extends AppError {
  constructor(
    message: string = "Network connectivity issue",
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
  ) {
    super(message, 503, ERROR_CODES.NETWORK_OFFLINE, metadata, options);
  }
}
