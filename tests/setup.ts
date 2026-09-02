import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { server } from './msw/server';

import '@testing-library/jest-dom/vitest';

// Mock global EventSource for jsdom environment
if (typeof window !== 'undefined') {
  class MockEventSource {
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    close = vi.fn();
  }
  window.EventSource = MockEventSource as any;
  global.EventSource = MockEventSource as any;
}

beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));

afterEach(() => {
  server.resetHandlers();
});

vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'mock-id'),
});

afterAll(() => server.close());
