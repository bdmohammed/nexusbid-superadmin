import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn(() => ({}));

vi.mock('axios', () => ({
  default: {
    create: createMock,
  },
}));

vi.mock('@/env/client', () => ({
  clientEnv: {
    NEXT_PUBLIC_API_URL: 'https://api.example.com',
  },
}));

describe('httpClient', () => {
  beforeEach(() => {
    vi.resetModules();
    createMock.mockClear();
  });

  it.todo('creates axios instance with expected configuration', async () => {
    const { AXIOS_CONFIG, CONTENT_TYPES, HTTP_HEADERS } = await import('../constants');

    await import('../client');

    expect(createMock).toHaveBeenCalledTimes(1);

    expect(createMock).toHaveBeenCalledWith({
      baseURL: 'https://api.example.com/api/v1',
      timeout: AXIOS_CONFIG.TIMEOUT,
      withCredentials: true,
      headers: {
        [HTTP_HEADERS.CONTENT_TYPE]: CONTENT_TYPES.JSON,
      },
    });
  });

  it.todo('exports the created axios instance', async () => {
    const instance = { get: vi.fn() };

    createMock.mockReturnValueOnce(instance);

    const { httpClient, default: defaultExport } = await import('../client');

    expect(httpClient).toBe(instance);
    expect(defaultExport).toBe(instance);
  });
});
