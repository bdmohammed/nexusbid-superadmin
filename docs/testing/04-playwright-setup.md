# 04. Playwright Setup & Configuration (v1.0 Final)

## Overview

This guide details the setup for **Playwright** in **`rfpnexa-admin`** for End-to-End (E2E), Visual Regression, and Automated Accessibility testing.

---

## 1. Browser Support Execution Policy

To maintain fast CI pipeline turnaround times on PRs while guaranteeing cross-browser compliance:

- **PR Gate (Fast Pass):** Executes exclusively against **Chromium**. Required to pass before PR merge.
- **Nightly & Main Branch:** Executes across **Chromium, Firefox, WebKit (Safari), and Mobile Chrome**.

```bash
# PR Fast Run (Chromium only)
npx playwright test --project=chromium

# Full Matrix Run (All Browsers)
npx playwright test
```

---

## 2. Configuration (`playwright.config.ts`)

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3002',
    reuseExistingServer: !process.env.CI,
  },
});
```
