import { describe, expect, it } from 'vitest';

import { AuthorizationError } from '../AuthorizationError';
import { ERROR_CODES } from '../constants';

describe('AuthorizationError', () => {
  it('creates an authorization error with default values', () => {
    const error = new AuthorizationError();

    expect(error).toBeInstanceOf(AuthorizationError);
    expect(error).toBeInstanceOf(Error);

    expect(error.name).toBe('AuthorizationError');
    expect(error.message).toBe('Access denied');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('accepts custom values', () => {
    const metadata = {
      permission: 'admin:users',
    };

    const error = new AuthorizationError(
      'Insufficient permissions',
      metadata,
      undefined,
      'trace-123',
    );

    expect(error.message).toBe('Insufficient permissions');
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
    expect(error.metadata).toEqual(metadata);
    expect(error.traceId).toBe('trace-123');
  });

  it('preserves the error cause', () => {
    const cause = new Error('Role check failed');

    const error = new AuthorizationError(
      'Forbidden',
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('always uses HTTP 403 status', () => {
    const error = new AuthorizationError('Forbidden');

    expect(error.statusCode).toBe(403);
  });

  it('always uses the UNAUTHORIZED error code', () => {
    const error = new AuthorizationError();

    expect(error.code).toBe(ERROR_CODES.UNAUTHORIZED);
  });
});
