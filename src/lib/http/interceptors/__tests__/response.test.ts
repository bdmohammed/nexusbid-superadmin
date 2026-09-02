import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosInstance } from 'axios';
import { setupResponseInterceptor } from '../response';
import { HTTP_STATUS } from '../../constants';
import { clearCsrfToken, fetchCsrfToken } from '../../csrf';
import { refreshSession } from '../../refresh';

// --- Hoisted Mocks to guarantee reference equality ---
const { clearCsrfTokenMock, fetchCsrfTokenMock } = vi.hoisted(() => ({
  clearCsrfTokenMock: vi.fn(),
  fetchCsrfTokenMock: vi.fn(),
}));

const { refreshSessionMock } = vi.hoisted(() => ({
  refreshSessionMock: vi.fn(),
}));

const { normalizeErrorMock } = vi.hoisted(() => ({
  normalizeErrorMock: vi.fn((err) => ({ normalized: true, original: err })),
}));

vi.mock('../csrf', () => ({
  clearCsrfToken: clearCsrfTokenMock,
  fetchCsrfToken: fetchCsrfTokenMock,
}));

vi.mock('../refresh', () => ({
  refreshSession: refreshSessionMock,
}));

vi.mock('@/lib/errors', () => ({
  normalizeError: normalizeErrorMock,
}));

vi.mock('../constants', () => ({
  HTTP_STATUS: {
    CSRF_TOKEN_INVALID: 419,
    UNAUTHORIZED: 401,
  },
}));

// Helper to create standard Axios Error objects
const createError = (
  status: number | undefined,
  url = '/api/data',
  retry = false,
  csrfRetry = false
) => ({
  response: status ? { status } : undefined,
  config: { url, _retry: retry, _csrfRetry: csrfRetry },
  isAxiosError: true,
  message: 'Mock Error',
});

let mockApi: any;
let successHandler: any;
let errorHandler: any;

// Variables to track global side effects
let setCookies: string[] = [];
let mockHref = '';

describe.todo('setupResponseInterceptor', () => {

  beforeEach(() => {
    mockHref = '';
    setCookies = [];

    // Mock Window API
    Object.defineProperty(global, 'window', {
      value: {
        location: {
          pathname: '/dashboard',
          search: '',
          get href() { return mockHref; },
          set href(val) { mockHref = val; },
        },
      },
      writable: true,
    });

    // Mock Document API (specifically for cookie clearing)
    Object.defineProperty(global, 'document', {
      value: {
        get cookie() { return 'session=abc123; csrf=xyz789'; },
        set cookie(val) { setCookies.push(val); },
      },
      writable: true,
    });

    // Mock Axios Instance
    mockApi = vi.fn();
    mockApi.interceptors = {
      response: {
        use: vi.fn((success, error) => {
          successHandler = success;
          errorHandler = error;
        }),
      },
    };

    setupResponseInterceptor(mockApi as AxiosInstance);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // @ts-ignore
    delete global.window;
    // @ts-ignore
    delete global.document;
  });

  it('should register success and error handlers', () => {
    expect(mockApi.interceptors.response.use).toHaveBeenCalledTimes(1);
    expect(successHandler).toBeTypeOf('function');
    expect(errorHandler).toBeTypeOf('function');
  });

  it('should return response as-is on success', async () => {
    const mockResponse = { data: 'success', status: 200 };
    const result = await successHandler(mockResponse);
    expect(result).toBe(mockResponse);
  });

  it('should reject immediately if originalRequest (config) is missing', async () => {
    const error = { response: { status: 500 }, config: null };
    await expect(errorHandler(error)).rejects.toEqual(error);
  });

  it('should reject with normalized error if response object is missing (e.g., network error)', async () => {
    const error = createError(undefined);
    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: error,
    });
  });

});
describe.todo('CSRF Token Handling (419)', () => {
  it('should retry request and fetch new CSRF token on 419 when _csrfRetry is false', async () => {
    const error = createError(HTTP_STATUS.CSRF_TOKEN_INVALID, '/api/submit');
    mockApi.mockResolvedValue({ data: 'retried success' });

    const result = await errorHandler(error);

    expect(clearCsrfToken).toHaveBeenCalled();
    expect(fetchCsrfToken).toHaveBeenCalled();
    expect(mockApi).toHaveBeenCalledWith(error.config);
    expect(error.config._csrfRetry).toBe(true);
    expect(result).toEqual({ data: 'retried success' });
  });

  it('should reject on 419 if _csrfRetry is already true (prevent infinite loop)', async () => {
    const error = createError(HTTP_STATUS.CSRF_TOKEN_INVALID, '/api/submit', false, true);

    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: error,
    });

    expect(clearCsrfToken).not.toHaveBeenCalled();
    expect(fetchCsrfToken).not.toHaveBeenCalled();
  });
});

describe.todo('401 Unauthorized & Session Refresh', () => {
  it('should refresh session and retry request on 401 when _retry is false', async () => {
    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/api/data');
    (refreshSession as any).mockResolvedValue(undefined);
    mockApi.mockResolvedValue({ data: 'refreshed success' });

    const result = await errorHandler(error);

    expect(refreshSession).toHaveBeenCalled();
    expect(mockApi).toHaveBeenCalledWith(error.config);
    expect(error.config._retry).toBe(true);
    expect(result).toEqual({ data: 'refreshed success' });
  });

  it('should clear cookies and redirect if refresh fails on private path', async () => {
    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/api/data');
    const refreshError = new Error('Refresh failed');
    (refreshSession as any).mockRejectedValue(refreshError);

    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: refreshError,
    });

    expect(clearCsrfToken).toHaveBeenCalled();
    expect(setCookies.some(c => c.includes('session=;expires='))).toBe(true);
    expect(mockHref).toBe('/login?redirect=%2Fdashboard');
  });

  it('should clear cookies but NOT redirect if refresh fails on public path', async () => {
    (window as any).location.pathname = '/login';
    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/api/data');
    const refreshError = new Error('Refresh failed');
    (refreshSession as any).mockRejectedValue(refreshError);

    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: refreshError,
    });

    expect(clearCsrfToken).toHaveBeenCalled();
    expect(setCookies.some(c => c.includes('session=;expires='))).toBe(true);
    expect(mockHref).toBe(''); // No redirect expected
  });

  it('should correctly encode search params in redirect URL', async () => {
    (window as any).location.pathname = '/dashboard';
    (window as any).location.search = '?tab=profile&active=true';

    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/api/data');
    (refreshSession as any).mockRejectedValue(new Error('Refresh failed'));

    await expect(errorHandler(error)).rejects.toBeTruthy();

    expect(mockHref).toBe('/login?redirect=%2Fdashboard%3Ftab%3Dprofile%26active%3Dtrue');
  });

  it('should not refresh session and just reject if URL is an auth endpoint', async () => {
    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/auth/login');

    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: error,
    });

    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('should treat /auth/me as auth endpoint ONLY on public/guest paths', async () => {
    // 1. On private path (should attempt refresh)
    (window as any).location.pathname = '/dashboard';
    const errorPrivate = createError(HTTP_STATUS.UNAUTHORIZED, '/auth/me');
    (refreshSession as any).mockResolvedValue(undefined);
    mockApi.mockResolvedValue({ data: 'success' });

    await errorHandler(errorPrivate);
    expect(refreshSession).toHaveBeenCalled();

    vi.clearAllMocks();

    // 2. On public path (should NOT attempt refresh)
    (window as any).location.pathname = '/login';
    const errorPublic = createError(HTTP_STATUS.UNAUTHORIZED, '/auth/me');

    await expect(errorHandler(errorPublic)).rejects.toEqual({
      normalized: true,
      original: errorPublic,
    });
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('should clear cookies and redirect on 401 if retry is already exhausted (private path)', async () => {
    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/api/data', true); // _retry = true

    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: error,
    });

    expect(refreshSession).not.toHaveBeenCalled();
    expect(setCookies.some(c => c.includes('session=;expires='))).toBe(true);
    expect(mockHref).toBe('/login?redirect=%2Fdashboard');
  });

  it('should NOT redirect on 401 if retry is exhausted on public path', async () => {
    (window as any).location.pathname = '/login';
    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/api/data', true); // _retry = true

    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: error,
    });

    expect(refreshSession).not.toHaveBeenCalled();
    expect(mockHref).toBe('');
  });

  it('should treat subpaths of public paths as public (e.g. /login/verify)', async () => {
    (window as any).location.pathname = '/login/verify';
    const error = createError(HTTP_STATUS.UNAUTHORIZED, '/api/data');
    (refreshSession as any).mockRejectedValue(new Error('Refresh failed'));

    await expect(errorHandler(error)).rejects.toBeTruthy();
    expect(mockHref).toBe(''); // No redirect
  });
});

describe.todo('Other Errors', () => {
  it('should reject with normalized error for 500 status', async () => {
    const error = createError(500, '/api/data');

    await expect(errorHandler(error)).rejects.toEqual({
      normalized: true,
      original: error,
    });
  });
});
