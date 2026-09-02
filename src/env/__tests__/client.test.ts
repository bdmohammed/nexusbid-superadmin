import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

describe('env/client', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('detects development environment', async () => {
    vi.stubEnv('NODE_ENV', 'development');

    const { isDevEnv, isProdEnv, isTestEnv } = await import('../client');

    expect(isDevEnv()).toBe(true);
    expect(isProdEnv()).toBe(false);
    expect(isTestEnv()).toBe(false);
  });

  it('detects production environment', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    const { isDevEnv, isProdEnv, isTestEnv } = await import('../client');

    expect(isDevEnv()).toBe(false);
    expect(isProdEnv()).toBe(true);
    expect(isTestEnv()).toBe(false);
  });

  it('detects test environment', async () => {
    vi.stubEnv('NODE_ENV', 'test');

    const { isDevEnv, isProdEnv, isTestEnv } = await import('../client');

    expect(isDevEnv()).toBe(false);
    expect(isProdEnv()).toBe(false);
    expect(isTestEnv()).toBe(true);
  });

  it('uses NEXT_PUBLIC_API_URL from env', async () => {
    vi.stubEnv('NEXT_PUBLIC_API_URL', 'https://api.example.com');

    const { clientEnv } = await import('../client');

    expect(clientEnv.NEXT_PUBLIC_API_URL).toBe('https://api.example.com');
  });

  it('uses default API URL', async () => {
    const { clientEnv } = await import('../client');

    expect(clientEnv.NEXT_PUBLIC_API_URL).toBe('http://localhost:3000/api');
  });

  it('detects browser environment', async () => {
    const { isBrowser } = await import('../client');

    expect(isBrowser()).toBe(true);
  });
});
