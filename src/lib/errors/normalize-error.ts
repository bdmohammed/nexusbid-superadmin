// src/lib/errors/normalize-error.ts

import { AppError } from "./AppError";
import { ValidationError } from "./ValidationError";
import { AuthenticationError } from "./AuthenticationError";
import { AuthorizationError } from "./AuthorizationError";
import { NotFoundError } from "./NotFoundError";
import { NetworkError } from "./NetworkError";
import { ApiError } from "./ApiError";
import { UnknownError } from "./UnknownError";

interface AxiosLikeError {
  isAxiosError: boolean;
  response?: {
    status: number;
    data?: any;
  };
  request?: any;
  message: string;
}

function isAxiosError(error: any): error is AxiosLikeError {
  return error && typeof error === "object" && error.isAxiosError === true;
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // ── Axios errors must be checked BEFORE `instanceof Error` because
  //    AxiosError extends Error — the generic Error branch would otherwise
  //    swallow all Axios errors and return UnknownError("Request failed…").
  if (isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const responseData = error.response.data || {};
      const apiMessage = responseData.message || error.message;

      switch (status) {
        case 400:
          return new ValidationError(apiMessage, { responseData });
        case 401:
          return new AuthenticationError(apiMessage, { responseData });
        case 403:
          return new AuthorizationError(apiMessage, { responseData });
        case 404:
          return new NotFoundError(apiMessage, { responseData });
        default:
          return new ApiError(
            apiMessage,
            status,
            { responseData },
            { cause: error },
          );
      }
    } else if (error.request) {
      // Request was made but no response received
      return new NetworkError(
        "No response received from API server",
        { request: error.request },
        { cause: error },
      );
    }
  }

  // Handle standard JavaScript Error inheritance
  if (error instanceof Error) {
    // Detect typical Network connection issues
    if (
      error.message.includes("Network Error") ||
      error.message.includes("fetch failed") ||
      (error.name === "TypeError" && error.message.includes("failed to fetch"))
    ) {
      return new NetworkError(error.message, {}, { cause: error });
    }

    // Handle Zod Validation Errors if imported/used
    if (error.name === "ZodError" || "issues" in error) {
      const issues = (error as any).issues || [];
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of issues) {
        const path = (issue.path || []).join(".");
        if (path) {
          if (!fieldErrors[path]) fieldErrors[path] = [];
          fieldErrors[path].push(issue.message);
        }
      }

      return new ValidationError(
        "Validation failed",
        { fieldErrors, issues },
        { cause: error },
      );
    }

    return new UnknownError(error.message, {}, { cause: error });
  }

  // Handle string errors
  if (typeof error === "string") {
    return new UnknownError(error);
  }

  // Fallback for completely unknown object shapes
  return new UnknownError("An unexpected server error occurred", {
    rawError: error,
  });
}
