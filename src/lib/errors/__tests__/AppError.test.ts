import { describe, expect, it } from 'vitest';

import { AppError } from '../AppError';
import { ERROR_CODES } from '../constants';

describe('AppError', () => {
  it('creates an error with required values', () => {
    const error = new AppError('Something went wrong');

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);

    expect(error.name).toBe('AppError');
    expect(error.message).toBe('Something went wrong');

    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(ERROR_CODES.UNKNOWN);
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('accepts custom values', () => {
    const metadata = {
      endpoint: '/users',
      method: 'POST',
    };

    const error = new AppError(
      'Unauthorized',
      401,
      ERROR_CODES.API_FAILURE,
      metadata,
      undefined,
      'trace-123',
    );

    expect(error.message).toBe('Unauthorized');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.API_FAILURE);
    expect(error.metadata).toEqual(metadata);
    expect(error.traceId).toBe('trace-123');
  });

  it('stores the error cause', () => {
    const cause = new Error('Database unavailable');

    const error = new AppError(
      'Request failed',
      500,
      ERROR_CODES.UNKNOWN,
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('defaults metadata to an empty object', () => {
    const error = new AppError('Error');

    expect(error.metadata).toEqual({});
  });

  it('defaults traceId to an empty string', () => {
    const error = new AppError('Error');

    expect(error.traceId).toBe('');
  });

  it('restores the prototype chain', () => {
    const error = new AppError('Error');

    expect(error instanceof AppError).toBe(true);
    expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
  });

  it('captures the constructor name as the error name', () => {
    const error = new AppError('Error');

    expect(error.name).toBe('AppError');
  });
});
