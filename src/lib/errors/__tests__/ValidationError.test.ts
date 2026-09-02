import { describe, expect, it } from 'vitest';

import { AppError } from '../AppError';
import { ValidationError } from '../ValidationError';
import { ERROR_CODES } from '../constants';

describe('ValidationError', () => {
  it('creates with default values', () => {
    const error = new ValidationError();

    expect(error).toBeInstanceOf(ValidationError);
    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);

    expect(error.name).toBe('ValidationError');
    expect(error.message).toBe('Validation failed');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ERROR_CODES.VALIDATION);
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('creates with custom values', () => {
    const metadata = {
      fieldErrors: {
        email: ['Email is required'],
      },
    };

    const error = new ValidationError(
      'Invalid input',
      metadata,
      undefined,
      'trace-123',
    );

    expect(error.message).toBe('Invalid input');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe(ERROR_CODES.VALIDATION);
    expect(error.metadata).toEqual(metadata);
    expect(error.traceId).toBe('trace-123');
  });

  it('preserves cause', () => {
    const cause = new Error('Zod validation failed');

    const error = new ValidationError(
      'Validation failed',
      {},
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('uses empty metadata when omitted', () => {
    const error = new ValidationError('Invalid');

    expect(error.metadata).toEqual({});
  });

  it('captures a stack trace', () => {
    const error = new ValidationError();

    expect(error.stack).toBeDefined();
    expect(error.stack).toContain('ValidationError');
  });
});
