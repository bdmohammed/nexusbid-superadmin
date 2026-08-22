# 05. Mock Service Worker (MSW) Setup

## Overview

This guide details the setup for **MSW** in **`rfpnexa-admin`** to intercept network requests during Vitest integration and feature testing.

---

## 1. Installation

```bash
npm install -D msw
```

---

## 2. API Handlers (`src/testing/msw/handlers.ts`)

```ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/v1/auth/me', () => {
    return HttpResponse.json({
      id: 'usr_123',
      name: 'Mohammed Admin',
      email: 'admin@rfpnexa.com',
      role: 'ADMIN',
    });
  }),
  http.get('/api/v1/rfp', () => {
    return HttpResponse.json([
      { id: 'rfp_1', title: 'Enterprise Cloud Migration', budget: 150000 },
    ]);
  }),
];
```

---

## 3. Server Instance (`src/testing/msw/server.ts`)

```ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```
