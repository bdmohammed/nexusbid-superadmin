import { describe, expect, it } from 'vitest';

import { AuthenticationError } from '../AuthenticationError';
import { ERROR_CODES } from '../constants';

describe('AuthenticationError', () => {
  it('creates an authentication error with default values', () => {
    const error = new AuthenticationError();

    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error).toBeInstanceOf(Error);

    expect(error.name).toBe('AuthenticationError');
    expect(error.message).toBe('Authentication required');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.UNAUTHENTICATED);
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('accepts custom values', () => {
    const metadata = {
      reason: 'Missing token',
    };

    const error = new AuthenticationError(
      'Token expired',
      metadata,
      undefined,
      'trace-123',
    );

    expect(error.message).toBe('Token expired');
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe(ERROR_CODES.UNAUTHENTICATED);
    expect(error.metadata).toEqual(metadata);
    expect(error.traceId).toBe('trace-123');
  });

  it('preserves the error cause', () => {
    const cause = new Error('JWT verification failed');

    const error = new AuthenticationError(
      'Authentication failed',
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('uses the UNAUTHENTICATED error code', () => {
    const error = new AuthenticationError('Any message');

    expect(error.code).toBe(ERROR_CODES.UNAUTHENTICATED);
  });

  it('always uses HTTP 401 status', () => {
    const error = new AuthenticationError('Unauthorized');

    expect(error.statusCode).toBe(401);
  });
});
