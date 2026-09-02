import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getErrorMessage,
  getValidationErrors,
  handleActionError,
  handleApiError,
  handleClientError,
  handleServerError,
} from '../index';

import { ApiError } from '../ApiError';
import { logger } from '../../logger';

vi.mock('../../logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock('../serializeError', async () => {
  const actual = await vi.importActual<typeof import('../serializeError')>(
    '../serializeError',
  );

  return {
    ...actual,
    serializeError: vi.fn(() => ({
      errorId: 'error-123',
      message: 'Something failed',
      code: 'API_FAILURE',
      statusCode: 500,
      metadata: {},
    })),
  };
});

describe('error handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleServerError', () => {
    it('serializes and logs the error', () => {
      const error = new ApiError('Boom');

      const result = handleServerError(error, {
        route: '/users',
      });

      expect(result.errorId).toBe('error-123');

      expect(logger.error).toHaveBeenCalledWith(error, {
        correlationId: 'error-123',
        route: '/users',
      });
    });
  });

  describe('handleClientError', () => {
    it('serializes and logs a warning', () => {
      const error = new Error('Boom');

      const result = handleClientError(error);

      expect(result.errorId).toBe('error-123');

      expect(logger.warn).toHaveBeenCalledWith(
        'Client error captured: Something failed',
        {
          correlationId: 'error-123',
        },
      );
    });
  });

  describe('handleApiError', () => {
    it('returns api response structure', () => {
      const result = handleApiError(new Error());

      expect(result).toEqual({
        status: 500,
        body: {
          success: false,
          error: {
            errorId: 'error-123',
            message: 'Something failed',
            code: 'API_FAILURE',
            statusCode: 500,
            metadata: {},
          },
        },
      });
    });
  });

  describe('handleActionError', () => {
    it('returns success response', async () => {
      const result = await handleActionError(async () => 'hello');

      expect(result).toEqual({
        success: true,
        data: 'hello',
      });
    });

    it('returns serialized error when action throws', async () => {
      const result = await handleActionError(async () => {
        throw new Error('oops');
      });

      expect(result).toEqual({
        success: false,
        error: {
          errorId: 'error-123',
          message: 'Something failed',
          code: 'API_FAILURE',
          statusCode: 500,
          metadata: {},
        },
      });

      expect(logger.error).toHaveBeenCalled();
    });
  });

  describe('getErrorMessage', () => {
    it('returns empty string for null', () => {
      expect(getErrorMessage(null)).toBe('');
    });

    it('reads axios response message', () => {
      expect(
        getErrorMessage({
          response: {
            data: {
              message: 'Axios message',
            },
          },
        }),
      ).toBe('Axios message');
    });

    it('reads normalized metadata message', () => {
      expect(
        getErrorMessage({
          metadata: {
            responseData: {
              message: 'Metadata message',
            },
          },
        }),
      ).toBe('Metadata message');
    });

    it('falls back to error.message', () => {
      expect(
        getErrorMessage({
          message: 'Native message',
        }),
      ).toBe('Native message');
    });

    it('falls back to default message', () => {
      expect(getErrorMessage({})).toBe(
        'An unexpected error occurred',
      );
    });
  });

  describe('getValidationErrors', () => {
    const errors = [
      {
        field: 'email',
        message: 'Invalid',
      },
    ];

    it('returns undefined for null', () => {
      expect(getValidationErrors(null)).toBeUndefined();
    });

    it('reads axios validation errors', () => {
      expect(
        getValidationErrors({
          response: {
            data: {
              errors,
            },
          },
        }),
      ).toEqual(errors);
    });

    it('reads normalized validation errors', () => {
      expect(
        getValidationErrors({
          metadata: {
            responseData: {
              errors,
            },
          },
        }),
      ).toEqual(errors);
    });

    it('returns undefined when no errors exist', () => {
      expect(getValidationErrors({})).toBeUndefined();
    });
  });
});
