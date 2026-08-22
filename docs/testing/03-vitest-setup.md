# 03. Vitest Setup & Configuration (v1.0 Final)

## Overview

This guide details the setup for **Vitest** in **`rfpnexa-admin`**, including our custom `render` test utility.

---

## 1. Custom `render` Helper (`src/testing/test-utils.tsx`)

Instead of passing `{ wrapper: TestWrapper }` manually in every test file, export a custom `render` helper from `src/testing/test-utils.tsx`:

```tsx
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
}

interface AllTheProvidersProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  const [queryClient] = React.useState(() => createTestQueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override default render method
export { customRender as render };
```

### Usage in Components/Feature Tests:
```tsx
// Simple, clean import of custom render
import { render, screen } from '@/testing/test-utils';
import { Button } from '@/components/ui/Button';

it('renders button cleanly without manual provider setup', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

---

## 2. Configuration (`vitest.config.mts`)

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/testing/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/testing/'],
    },
  },
});
```

---

## 3. Global Setup File (`src/testing/setup.ts`)

```ts
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './msw/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => server.close());
```
