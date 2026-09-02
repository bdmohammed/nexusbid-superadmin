import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { serializeError } from '../serializeError';
import { ApiError } from '../ApiError';
import { AuthenticationError } from '../AuthenticationError';
import { ValidationError } from '../ValidationError';
import { UnknownError } from '../UnknownError';
import { ERROR_CODES } from '../constants';

describe('serializeError', () => {
  const originalCrypto = globalThis.crypto;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();

    Object.defineProperty(globalThis, 'crypto', {
      value: originalCrypto,
      configurable: true,
    });
  });

  it('serializes all fields in development mode', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: vi.fn(() => 'uuid-123'),
      },
      configurable: true,
    });

    const cause = new Error('Database unavailable');

    const error = new ApiError(
      'API failed',
      500,
      { endpoint: '/users' },
      { cause },
      'trace-1',
    );

    const serialized = serializeError(error, 'ComponentStack');

    expect(serialized).toEqual({
      errorId: 'uuid-123',
      message: 'API failed',
      code: ERROR_CODES.API_FAILURE,
      statusCode: 500,
      metadata: { endpoint: '/users' },
      stack: error.stack,
      cause: 'Database unavailable',
      componentStack: 'ComponentStack',
    });
  });

  it('serializes non-Error causes in development', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => 'uuid-1',
      },
      configurable: true,
    });

    const error = new UnknownError(
      'Boom',
      {},
      { cause: 'network' },
    );

    const serialized = serializeError(error);

    expect(serialized.cause).toBe('network');
  });

  it('uses randomUUID when available', () => {
    const randomUUID = vi.fn(() => 'generated-id');

    Object.defineProperty(globalThis, 'crypto', {
      value: { randomUUID },
      configurable: true,
    });

    const result = serializeError(new Error('boom'));

    expect(randomUUID).toHaveBeenCalledOnce();
    expect(result.errorId).toEqual('generated-id');
  });

  it('falls back to Math.random when crypto.randomUUID is unavailable', () => {
    Object.defineProperty(globalThis, 'crypto', {
      value: {},
      configurable: true,
    });

    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);

    const result = serializeError(new Error('boom'));

    expect(result.errorId).toBeTruthy();
  });

  it('keeps validation messages in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => 'uuid',
      },
      configurable: true,
    });

    const result = serializeError(
      new ValidationError('Email is required', {
        field: 'email',
      }),
    );

    expect(result.message).toBe('Email is required');
    expect(result.metadata).toEqual({
      field: 'email',
    });
  });

  it('keeps authentication messages in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const result = serializeError(
      new AuthenticationError('Login required'),
    );

    expect(result.message).toBe('Login required');
  });

  it('masks internal errors in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const result = serializeError(
      new ApiError('Database exploded'),
    );

    expect(result.message).toBe(
      'An internal server error occurred. Please contact support.',
    );

    expect(result.metadata).toBeUndefined();
  });

  it('normalizes unknown errors before serializing', () => {
    vi.stubEnv('NODE_ENV', 'production');

    const result = serializeError(new Error('Unexpected'));

    expect(result.code).toBe(ERROR_CODES.UNKNOWN);
  });

  it('includes generated error id in production', () => {
    vi.stubEnv('NODE_ENV', 'production');

    Object.defineProperty(globalThis, 'crypto', {
      value: {
        randomUUID: () => 'prod-id',
      },
      configurable: true,
    });

    const result = serializeError(new Error('boom'));

    expect(result.errorId).toBe('prod-id');
  });
});
