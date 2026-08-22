import { SerializedError } from "./types";
import { normalizeError } from "./normalize-error";
import { ERROR_CODES } from "./constants";

export function serializeError(
  error: unknown,
  componentStack?: string,
): SerializedError {
  const normalized = normalizeError(error);

  // Create a tracking error ID corresponding to logger telemetry
  const errorId =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);

  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    return {
      errorId,
      message: normalized.message,
      code: normalized.code,
      statusCode: normalized.statusCode,
      metadata: normalized.metadata,
      stack: normalized.stack,
      cause:
        normalized.cause instanceof Error
          ? normalized.cause.message
          : String(normalized.cause),
      componentStack,
    } as SerializedError;
  }

  // Production representation masks stack traces and internal messages
  // (unless it's a safe validation/user error)
  const isSafeClientMessage =
    normalized.code === ERROR_CODES.VALIDATION ||
    normalized.code === ERROR_CODES.UNAUTHENTICATED ||
    normalized.code === ERROR_CODES.UNAUTHORIZED ||
    normalized.code === ERROR_CODES.NOT_FOUND;

  return {
    errorId,
    message: isSafeClientMessage
      ? normalized.message
      : "An internal server error occurred. Please contact support.",
    code: normalized.code,
    statusCode: normalized.statusCode,
    metadata: isSafeClientMessage ? normalized.metadata : undefined,
  } as SerializedError;
}
