import { describe, expect, it } from 'vitest';

import { NotFoundError } from '../NotFoundError';
import { ERROR_CODES } from '../constants';

describe('NotFoundError', () => {
  it('creates a not found error with default values', () => {
    const error = new NotFoundError();

    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(Error);

    expect(error.name).toBe('NotFoundError');
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('accepts custom values', () => {
    const metadata = {
      resource: 'User',
      id: '123',
    };

    const error = new NotFoundError(
      'User not found',
      metadata,
      undefined,
      'trace-123',
    );

    expect(error.message).toBe('User not found');
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
    expect(error.metadata).toEqual(metadata);
    expect(error.traceId).toBe('trace-123');
  });

  it('preserves the error cause', () => {
    const cause = new Error('Lookup failed');

    const error = new NotFoundError(
      'Record not found',
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('always uses HTTP 404 status', () => {
    const error = new NotFoundError('Missing');

    expect(error.statusCode).toBe(404);
  });

  it('always uses the NOT_FOUND error code', () => {
    const error = new NotFoundError();

    expect(error.code).toBe(ERROR_CODES.NOT_FOUND);
  });
});
