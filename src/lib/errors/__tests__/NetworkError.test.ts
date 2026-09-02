import { describe, expect, it } from 'vitest';

import { NetworkError } from '../NetworkError';
import { ERROR_CODES } from '../constants';

describe('NetworkError', () => {
  it('creates a network error with default values', () => {
    const error = new NetworkError();

    expect(error).toBeInstanceOf(NetworkError);
    expect(error).toBeInstanceOf(Error);

    expect(error.name).toBe('NetworkError');
    expect(error.message).toBe('Network connectivity issue');
    expect(error.statusCode).toBe(503);
    expect(error.code).toBe(ERROR_CODES.NETWORK_OFFLINE);
    expect(error.metadata).toEqual({});
    expect(error.traceId).toBe('');
  });

  it('accepts custom values', () => {
    const metadata = {
      url: '/api/users',
      method: 'GET',
    };

    const error = new NetworkError(
      'Connection timed out',
      metadata,
      undefined,
    );

    expect(error.message).toBe('Connection timed out');
    expect(error.statusCode).toBe(503);
    expect(error.code).toBe(ERROR_CODES.NETWORK_OFFLINE);
    expect(error.metadata).toEqual(metadata);
    expect(error.traceId).toBe('');
  });

  it('preserves the error cause', () => {
    const cause = new Error('Socket closed');

    const error = new NetworkError(
      'Unable to reach server',
      undefined,
      { cause },
    );

    expect(error.cause).toBe(cause);
  });

  it('always uses HTTP 503 status', () => {
    const error = new NetworkError('Offline');

    expect(error.statusCode).toBe(503);
  });

  it('always uses the NETWORK_OFFLINE error code', () => {
    const error = new NetworkError();

    expect(error.code).toBe(ERROR_CODES.NETWORK_OFFLINE);
  });
});
