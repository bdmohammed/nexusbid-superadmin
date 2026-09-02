import { logger } from "../logger";
import { serializeError } from "./serializeError";
import { ErrorContext, SerializedError } from "./types";

/**
 * Handles errors occurring in Server Components, Route Handlers, or Middleware.
 * Normalizes, logs, and returns a safe serialized structure.
 */
export function handleServerError(
  error: unknown,
  context?: ErrorContext,
): SerializedError {
  const serialized = serializeError(error);

  // Log the detailed error with stack on the server console/telemetry
  logger.error(error as any, {
    correlationId: serialized.errorId,
    ...context,
  });

  return serialized;
}

/**
 * Handles errors occurring in client-side interactive elements (e.g. event handlers).
 * Logs the error to console/telemetry and normalizes it for presentation.
 */
export function handleClientError(
  error: unknown,
  context?: ErrorContext,
): SerializedError {
  const serialized = serializeError(error);

  logger.warn(`Client error captured: ${serialized.message}`, {
    correlationId: serialized.errorId,
    ...context,
  });

  return serialized;
}

/**
 * Normalizes and formats API response handler exceptions.
 * Returns a response structure suitable for standard Next.js Route Handlers.
 */
export function handleApiError(
  error: unknown,
  context?: ErrorContext,
): { status: number; body: { success: false; error: SerializedError } } {
  const serialized = handleServerError(error, context);

  return {
    status: serialized.statusCode,
    body: {
      success: false,
      error: serialized,
    },
  };
}

/**
 * Safe wrapper for Server Actions, returning a serialized object structure.
 * Prevents throwing uncaught exceptions across the network boundary.
 */
export async function handleActionError<T>(
  action: () => Promise<T>,
  context?: ErrorContext,
): Promise<
  { success: true; data: T } | { success: false; error: SerializedError }
> {
  try {
    const data = await action();
    return { success: true, data };
  } catch (error) {
    const serialized = handleServerError(error, context);
    return { success: false, error: serialized };
  }
}

/**
 * Helper to safely extract user-friendly error messages from either
 * normalized AppError instances or raw Axios error responses.
 */
export function getErrorMessage(err: any): string {
  if (!err) return "";
  return (
    err.response?.data?.message ||
    err.metadata?.responseData?.message ||
    err.message ||
    "An unexpected error occurred"
  );
}

/**
 * Helper to safely extract field-level validation errors from either
 * normalized AppError instances or raw Axios error responses.
 */
export function getValidationErrors(
  err: any,
): Array<{ field: string; message: string }> | undefined {
  if (!err) return undefined;
  return err.response?.data?.errors || err.metadata?.responseData?.errors;
}
