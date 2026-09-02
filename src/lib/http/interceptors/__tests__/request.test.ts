import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosHeaders } from 'axios';

import { requestInterceptor } from '../request';
import { fetchCsrfToken, getCsrfToken } from '../../csrf';
import { HTTP_HEADERS, CONTENT_TYPES } from '../../constants';

vi.mock('../../csrf', () => ({
  fetchCsrfToken: vi.fn(),
  getCsrfToken: vi.fn(),
}));

function createConfig(method = 'get') {
  return {
    method,
    headers: new AxiosHeaders(),
    skipCsrf: false,
  };
}

describe('requestInterceptor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns immediately when skipCsrf is true', async () => {
    const config = createConfig('post');
    config.skipCsrf = true;

    const result = await requestInterceptor(config);

    expect(result).toBe(config);
    expect(fetchCsrfToken).not.toHaveBeenCalled();
    expect(getCsrfToken).not.toHaveBeenCalled();
  });

  it('sets Content-Type header', async () => {
    const config = createConfig('get');

    await requestInterceptor(config);

    expect(config.headers.get(HTTP_HEADERS.CONTENT_TYPE)).toBe(
      CONTENT_TYPES.JSON,
    );
  });

  it('does not attach csrf for GET requests', async () => {
    const config = createConfig('get');

    await requestInterceptor(config);

    expect(getCsrfToken).not.toHaveBeenCalled();
    expect(fetchCsrfToken).not.toHaveBeenCalled();
    expect(config.headers.get(HTTP_HEADERS.CSRF_TOKEN)).toBeUndefined();
  });

  it('uses cached csrf token', async () => {
    vi.mocked(getCsrfToken).mockReturnValue('cached-token');

    const config = createConfig('post');

    await requestInterceptor(config);

    expect(getCsrfToken).toHaveBeenCalledOnce();
    expect(fetchCsrfToken).not.toHaveBeenCalled();
    expect(config.headers.get(HTTP_HEADERS.CSRF_TOKEN)).toBe('cached-token');
  });

  it('fetches csrf token when cache is empty', async () => {
    vi.mocked(getCsrfToken).mockReturnValue(null);
    vi.mocked(fetchCsrfToken).mockResolvedValue('fresh-token');

    const config = createConfig('patch');

    await requestInterceptor(config);

    expect(fetchCsrfToken).toHaveBeenCalledOnce();
    expect(config.headers.get(HTTP_HEADERS.CSRF_TOKEN)).toBe('fresh-token');
  });

  it('does not set csrf header when fetch returns nothing', async () => {
    vi.mocked(getCsrfToken).mockReturnValue(null);
    vi.mocked(fetchCsrfToken).mockResolvedValue(null);

    const config = createConfig('delete');

    await requestInterceptor(config);

    expect(config.headers.has(HTTP_HEADERS.CSRF_TOKEN)).toBe(false);
  });
});
