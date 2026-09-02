import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { normalizeError } from '../normalizeError';
import { ApiError } from '../ApiError';
import { AuthenticationError } from '../AuthenticationError';
import { AuthorizationError } from '../AuthorizationError';
import { NetworkError } from '../NetworkError';
import { NotFoundError } from '../NotFoundError';
import { UnknownError } from '../UnknownError';
import { ValidationError } from '../ValidationError';

describe('normalizeError', () => {
  it('returns AppError instances unchanged', () => {
    const error = new ApiError('Already normalized');

    expect(normalizeError(error)).toBe(error);
  });

  it('maps axios 400 to ValidationError', () => {
    const result = normalizeError({
      isAxiosError: true,
      message: 'Bad request',
      response: {
        status: 400,
        data: {
          message: 'Validation failed',
        },
      },
    });

    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Validation failed');
  });

  it('maps axios 401 to AuthenticationError', () => {
    const result = normalizeError({
      isAxiosError: true,
      message: 'Unauthorized',
      response: {
        status: 401,
        data: {
          message: 'Login required',
        },
      },
    });

    expect(result).toBeInstanceOf(AuthenticationError);
    expect(result.statusCode).toBe(401);
  });

  it('maps axios 403 to AuthorizationError', () => {
    const result = normalizeError({
      isAxiosError: true,
      message: 'Forbidden',
      response: {
        status: 403,
        data: {
          message: 'Access denied',
        },
      },
    });

    expect(result).toBeInstanceOf(AuthorizationError);
    expect(result.statusCode).toBe(403);
  });

  it('maps axios 404 to NotFoundError', () => {
    const result = normalizeError({
      isAxiosError: true,
      message: 'Missing',
      response: {
        status: 404,
        data: {
          message: 'Not found',
        },
      },
    });

    expect(result).toBeInstanceOf(NotFoundError);
    expect(result.statusCode).toBe(404);
  });

  it('maps other axios response errors to ApiError', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Server error',
      response: {
        status: 500,
        data: {
          message: 'Internal error',
        },
      },
    };

    const result = normalizeError(axiosError);

    expect(result).toBeInstanceOf(ApiError);
    expect(result.statusCode).toBe(500);
    expect(result.message).toBe('Internal error');
    expect(result.cause).toBe(axiosError);
  });

  it('falls back to axios error message when response has no message', () => {
    const result = normalizeError({
      isAxiosError: true,
      message: 'Gateway timeout',
      response: {
        status: 504,
        data: {},
      },
    });

    expect(result).toBeInstanceOf(ApiError);
    expect(result.message).toBe('Gateway timeout');
  });

  it('maps axios request errors to NetworkError', () => {
    const axiosError = {
      isAxiosError: true,
      message: 'Network',
      request: {},
    };

    const result = normalizeError(axiosError);

    expect(result).toBeInstanceOf(NetworkError);
    expect(result.message).toBe('No response received from API server');
    expect(result.cause).toBe(axiosError);
  });

  it.each([
    'Network Error',
    'fetch failed',
  ])('detects network error message "%s"', (message) => {
    const result = normalizeError(new Error(message));

    expect(result).toBeInstanceOf(NetworkError);
    expect(result.message).toBe(message);
  });

  it('detects failed to fetch TypeError', () => {
    const error = new TypeError('failed to fetch');

    const result = normalizeError(error);

    expect(result).toBeInstanceOf(NetworkError);
  });

  it('maps ZodError to ValidationError', () => {
    const schema = z.object({
      email: z.string().email(),
    });

    const parsed = schema.safeParse({
      email: 'invalid',
    });

    expect(parsed.success).toBe(false);

    const result = normalizeError(parsed.error);

    expect(result).toBeInstanceOf(ValidationError);
    expect(result.message).toBe('Validation failed');
    expect(result.metadata?.fieldErrors).toEqual({
      email: ['Invalid email address'],
    });
  });

  it('maps normal Error to UnknownError', () => {
    const error = new Error('Boom');

    const result = normalizeError(error);

    expect(result).toBeInstanceOf(UnknownError);
    expect(result.message).toBe('Boom');
    expect(result.cause).toBe(error);
  });

  it('maps string errors to UnknownError', () => {
    const result = normalizeError('Something broke');

    expect(result).toBeInstanceOf(UnknownError);
    expect(result.message).toBe('Something broke');
  });

  it('maps unknown objects to UnknownError', () => {
    const raw = {
      foo: 'bar',
    };

    const result = normalizeError(raw);

    expect(result).toBeInstanceOf(UnknownError);
    expect(result.message).toBe('An unexpected server error occurred');
    expect(result.metadata).toEqual({
      rawError: raw,
    });
  });

  it('handles null', () => {
    const result = normalizeError(null);

    expect(result).toBeInstanceOf(UnknownError);
    expect(result.metadata).toEqual({
      rawError: null,
    });
  });

  it('handles undefined', () => {
    const result = normalizeError(undefined);

    expect(result).toBeInstanceOf(UnknownError);
    expect(result.metadata).toEqual({
      rawError: undefined,
    });
  });
});
