import { describe, expect, it } from 'vitest';

import { UnknownError } from '../UnknownError';
import { AppError } from '../AppError';
import { ERROR_CODES } from '../constants';

describe('UnknownError', () => {
  it('creates with default values', () => {
    const error = new UnknownError();

    expect(error).toBeInstanceOf(UnknownError);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);

    expect(error.name).toBe('UnknownError');
    expect(error.message).toBe('An unknown error occurred');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(ERROR_CODES.UNKNOWN);
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('creates with custom values', () => {
    const metadata = {
      operation: 'createUser',
      retry: false,
    };

    const error = new UnknownError(
      'Unexpected failure',
      metadata,
      undefined,
      'trace-123',
    );

    expect(error.message).toBe('Unexpected failure');
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe(ERROR_CODES.UNKNOWN);
    expect(error.metadata).toEqual(metadata);
    expect(error.traceId).toBe('trace-123');
  });

  it('preserves cause', () => {
    const cause = new Error('Database unavailable');

    const error = new UnknownError(
      'Unknown failure',
      {},
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('uses empty metadata when omitted', () => {
    const error = new UnknownError('Failure');

    expect(error.metadata).toEqual({});
  });

  it('captures a stack trace', () => {
    const error = new UnknownError();

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('UnknownError');
  });
});
