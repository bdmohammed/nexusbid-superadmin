import { describe, expect, it } from 'vitest';

import { ApiError } from '../ApiError';
import { ERROR_CODES } from '../constants';

describe('ApiError', () => {
  it('uses default values', () => {
    const error = new ApiError();

    expect(error.message).toBe('API request failed');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(ERROR_CODES.API_FAILURE);
    expect(error.name).toBe('ApiError');
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('accepts custom values', () => {
    const metadata = { endpoint: '/users' };

    const error = new ApiError(
      'Unauthorized',
      401,
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

  it('preserves the cause', () => {
    const cause = new Error('Network');

    const error = new ApiError(
      'Failed',
      502,
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });
});
