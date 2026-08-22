# 01. Testing Strategy (v1.0 Final)

## Overview & Core Philosophy

> **Core Testing Philosophy:** Test behavior, not implementation. Tests should verify what the user observes or what the system guarantees, rather than internal implementation details.

This document outlines the testing strategy, decision-making tree, and architectural boundaries for **`rfpnexa-admin`** (Next.js 16 App Router & React 19).

---

## 1. App Router Special Files Testing Matrix

| Next.js App Router File | Primary Test Strategy | Recommended Tooling |
| :--- | :--- | :--- |
| **`page.tsx`** | End-to-End & Layout Verification | **Playwright** |
| **`layout.tsx`** | Component & Provider Composition | **Vitest + RTL** |
| **`template.tsx`** | Remount & State Reset Verification | **Vitest + RTL** |
| **`loading.tsx`** | Skeleton Rendering & Suspense Fallback | **Vitest + RTL** |
| **`error.tsx`** | Error Boundary Rendering & Reset Trigger | **Vitest + RTL** |
| **`not-found.tsx`** | 404 Status & Navigation Action | **Vitest + Playwright** |
| **`route.ts`** | Route Handler HTTP Methods & Status Codes | **Vitest** |
| **`middleware.ts`** | Request Guards & Token Redirect Logic | **Vitest (Logic) + Playwright (E2E)** |

---

## 2. Feature vs. Integration Tests (Concrete Examples)

### Feature Test Example
*Flow:* `LoginForm` → Field Validation → MSW Network Request → Toast Notification → Router Push.

```tsx
// src/features/auth/__tests__/LoginForm.feature.test.tsx
import { render, screen, waitFor } from '@/testing/test-utils';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/testing/msw/server';
import { LoginForm } from '../components/LoginForm';

it('completes login flow, displays toast notification, and navigates', async () => {
  server.use(
    http.post('/api/v1/auth/login', () => HttpResponse.json({ token: 'jwt-123' }))
  );

  render(<LoginForm />);

  await userEvent.type(screen.getByLabelText(/email/i), 'admin@rfpnexa.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(screen.getByText(/successfully logged in/i)).toBeInTheDocument();
  });
});
```

### Integration Test Example
*Orchestration:* `DashboardLayout` → `Sidebar` → `Header` → `PermissionProvider` → `ThemeProvider`.

```tsx
// src/components/layouts/__tests__/DashboardLayout.integration.test.tsx
import { render, screen } from '@/testing/test-utils';
import { DashboardLayout } from '../DashboardLayout';
import { PermissionProvider } from '@/providers/PermissionProvider';

it('integrates layout elements with user permission provider state', () => {
  render(
    <PermissionProvider userRole="ADMIN">
      <DashboardLayout>
        <div>Dashboard Main View</div>
      </DashboardLayout>
    </PermissionProvider>
  );

  expect(screen.getByRole('navigation')).toBeInTheDocument(); // Sidebar
  expect(screen.getByText('Admin Settings')).toBeInTheDocument(); // Role-protected link
  expect(screen.getByText('Dashboard Main View')).toBeInTheDocument();
});
```

---

## 3. Server Actions Mocking Guidance (`'use server'`)

When unit testing Server Actions, mock all server infrastructure (cookies, headers, database, external services) rather than hitting live backend infrastructure:

```ts
// src/actions/__tests__/updateRfpAction.test.ts
import { describe, expect, it, vi } from 'vitest';
import { updateRfpAction } from '../updateRfpAction';

// Mock Server Dependencies
vi.mock('next/headers', () => ({
  cookies: () => ({ get: vi.fn().mockReturnValue({ value: 'mock-token' }) }),
  headers: () => new Headers(),
}));

vi.mock('@/services/db', () => ({
  db: { rfp: { update: vi.fn().mockResolvedValue({ id: 'rfp-1', status: 'UPDATED' }) } },
}));

describe('updateRfpAction', () => {
  it('updates RFP record and returns success payload', async () => {
    const result = await updateRfpAction('rfp-1', { status: 'APPROVED' });
    expect(result.success).toBe(true);
  });
});
```

---

## 4. TanStack Query Mutation Testing

Test mutations, optimistic updates, cache invalidation, and rollback behavior:

```tsx
// src/features/rfp/hooks/__tests__/useUpdateRfpMutation.test.tsx
import { renderHook, waitFor, act } from '@/testing/test-utils';
import { describe, expect, it } from 'vitest';
import { useUpdateRfpMutation } from '../useUpdateRfpMutation';
import { server } from '@/testing/msw/server';
import { http, HttpResponse } from 'msw';

describe('useUpdateRfpMutation', () => {
  it('performs optimistic update and rolls back on failure', async () => {
    server.use(
      http.patch('/api/v1/rfp/1', () => HttpResponse.json({ error: 'Server Error' }, { status: 500 }))
    );

    const { result } = renderHook(() => useUpdateRfpMutation());

    act(() => {
      result.current.mutate({ id: '1', title: 'Optimistic Title' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    // Verify rollback
    expect(result.current.context?.previousData.title).not.toBe('Optimistic Title');
  });
});
```

---

## 5. Testing Decision Tree

```text
Is this code pure logic or a utility without UI rendering?
│
├── YES ───► Write a UNIT TEST (Vitest)
│
└── NO (It renders UI or JSX)
    │
    ├── Is it an isolated primitive without external dependencies or data fetching?
    │   └── YES ───► Write a COMPONENT TEST (Vitest + React Testing Library)
    │
    ├── Is it a multi-component feature flow with forms, state, or network calls?
    │   └── YES ───► Write a FEATURE TEST (Vitest + RTL + MSW)
    │
    ├── Is it a React Server Component (RSC) with async data fetching?
    │   ├── Business / Service Logic ───► UNIT TEST (Vitest)
    │   └── Rendered RSC Page UI ──────► E2E TEST (Playwright)
    │
    └── Is it a full multi-page user journey or route navigation?
        └── YES ───► Write an END-TO-END (E2E) TEST (Playwright)
```
