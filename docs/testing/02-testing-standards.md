# 02. Testing Standards & Conventions (v1.0 Final)

## Overview

This document specifies mandatory directory layouts, browser support policies, code coverage expectations, file naming rules, context provider testing, and test suite performance optimizations for **`rfpnexa-admin`**.

---

## 1. Directory Tree Layout Convention

Standardized layout for test colocation and centralized helpers:

```text
src/
├── app/
│   ├── (dashboard)/
│   │   ├── rfp/
│   │   │   ├── page.tsx
│   │   │   ├── page.e2e.spec.ts          # E2E Page Test
│   │   │   ├── loading.test.tsx          # Loading UI Test
│   │   │   └── metadata.test.ts          # Metadata Unit Test
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx               # Component Unit Test
│   │   └── Button.a11y.test.tsx          # Component Accessibility Test
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── LoginForm.feature.test.tsx# Feature Test
│   │   ├── api/
│   │   │   └── authContract.contract.test.ts
│
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
│
├── services/
│   ├── rfpService.ts
│   └── rfpService.test.ts
│
├── stores/
│   ├── userStore.ts
│   └── userStore.store.test.ts
│
└── testing/
    ├── setup.ts                           # Vitest Global Setup
    ├── test-utils.tsx                     # Custom render helper
    └── msw/
        ├── handlers.ts                    # MSW Route Handlers
        └── server.ts                      # MSW Server Instance

e2e/                                       # Cross-feature Playwright Specs
├── auth.e2e.spec.ts
└── rfp-workflow.e2e.spec.ts
```

---

## 2. Browser Support & Execution Policy

| Execution Context         | Target Browsers                              | Strategy                                                     |
| :------------------------ | :------------------------------------------- | :----------------------------------------------------------- |
| **Pull Request (PR CI)**  | **Desktop Chromium**                         | Required fast pass blocking merge. Ensures maximum velocity. |
| **Main Branch & Nightly** | **Chromium, Firefox, WebKit, Mobile Chrome** | Full cross-browser matrix validation before release tags.    |

---

## 3. React Context Provider Testing

```tsx
// src/providers/__tests__/AuthProvider.test.tsx
import { render, screen } from '@/testing/test-utils';
import { describe, expect, it } from 'vitest';
import { AuthProvider, useAuthContext } from '../AuthProvider';

function TestConsumer() {
  const { user } = useAuthContext();
  return <div>User: {user ? user.name : 'Guest'}</div>;
}

describe('AuthProvider Composition', () => {
  it('provides default unauthenticated auth state to consumers', () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('User: Guest')).toBeInTheDocument();
  });
});
```

---

## 4. Code Coverage Expectations

| Area / Module                                 |   Minimum Target   | Rationale                                                   |
| :-------------------------------------------- | :----------------: | :---------------------------------------------------------- |
| **Utilities & Helpers (`src/lib/*`)**         |      **100%**      | Pure utility functions must have zero regressions.          |
| **Zustand Stores (`src/stores/*`)**           |      **100%**      | Global state mutations impact the whole application.        |
| **Custom Hooks (`src/hooks/*`)**              |      **95%**       | Reusable hook logic requires near-complete branch coverage. |
| **API Clients & Services (`src/services/*`)** |      **95%**       | Protects data parsing, headers, and error handling.         |
| **UI Components (`src/components/*`)**        |      **90%**       | Verifies props, roles, and interactions.                    |
| **Feature Modules (`src/features/*`)**        |      **90%**       | Verifies critical multi-component interaction flows.        |
| **App Pages (`src/app/**/page.tsx`)**         | **Don't Enforce**  | Page wrappers are verified via Playwright E2E.              |
| **E2E Journeys (`e2e/*`)**                    | **Critical Flows** | Covers primary business journeys.                           |
