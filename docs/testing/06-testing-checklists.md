# 06. Testing Checklists & CI/CD Pipeline (v1.0 Final)

## Overview

This document provides PR review checklists, pre-commit guidelines, and a complete production **GitHub Actions CI/CD Workflow** for **`rfpnexa-admin`**.

---

## 1. Production GitHub Actions Workflow (`.github/workflows/test.yml`)

Create `.github/workflows/test.yml` in your repository:

```yaml
name: CI Pipeline & Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  static-analysis:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck

  vitest-suite:
    name: Vitest (Unit, Component, Feature, Stores)
    runs-on: ubuntu-latest
    needs: static-analysis
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run test:run

  playwright-suite:
    name: Playwright E2E & A11y
    runs-on: ubuntu-latest
    needs: static-analysis
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - name: Cache Playwright Browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e

  build-check:
    name: Verify Next.js Build
    runs-on: ubuntu-latest
    needs: [vitest-suite, playwright-suite]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
```

---

## 2. Pull Request (PR) Testing Checklist

Before requesting review on any PR, developers must ensure:

- [ ] All new utility functions have 100% unit test coverage.
- [ ] New components have colocated `*.test.tsx` files using the custom `render` helper.
- [ ] New features include MSW-intercepted feature tests.
- [ ] State mutations in Zustand stores have corresponding store tests.
- [ ] Accessible roles (`aria-*`, `role=""`) are verified.
- [ ] No `setTimeout` or fixed time delays exist in test logic.
- [ ] Biome linter passes without warnings (`npm run lint`).
- [ ] TypeScript typecheck passes (`npm run typecheck`).
- [ ] Local Vitest suite executes cleanly (`npm run test:run`).

---

## 3. Flaky Test Prevention Rules

- **Reset All Mocks:** Ensure `afterEach(() => vi.clearAllMocks())` is active.
- **Clear Caches:** Reset TanStack Query cache and Zustand stores prior to each test.
- **Isolated Browser Contexts:** Playwright specs must never rely on pre-existing cookies or DOM state from prior specs.
- **Declarative Waiting:** Use `findByRole` or `waitFor` instead of fixed timeout pauses.
