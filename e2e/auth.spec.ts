import { expect, test } from '@playwright/test';

test.describe('Admin Authentication E2E Tests', () => {
  test('Login page displays all fields and links', async ({ page }) => {
    await page.goto('/login');

    await expect(page).toHaveTitle(/Admin Sign In/i);
    await expect(page.getByRole('heading', { name: /Welcome Back/i })).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByLabel(/Password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^Log In$/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Forgot Password\?/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Register for free/i })).toBeVisible();
  });

  test('Register page displays registration fields', async ({ page }) => {
    await page.goto('/register');

    await expect(page).toHaveTitle(/Create an Account/i);
    await expect(page.getByRole('heading', { name: /Create an Account/i })).toBeVisible();
    await expect(page.getByLabel(/Full Name/i)).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Create Account/i })).toBeVisible();
  });

  test('Forgot password page displays reset form', async ({ page }) => {
    await page.goto('/forgot-password');

    await expect(page).toHaveTitle(/Forgot Password/i);
    await expect(page.getByRole('heading', { name: /Forgot Password\?/i })).toBeVisible();
    await expect(page.getByLabel(/Email Address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Send Reset Link/i })).toBeVisible();
  });

  test('Reset password page requires valid token', async ({ page }) => {
    await page.goto('/reset-password');

    await expect(page.getByText(/Missing reset token/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Login/i })).toBeVisible();
  });

  test('Verify email page handles missing token gracefully', async ({ page }) => {
    await page.goto('/verify-email');

    await expect(page.getByText(/No verification token provided/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Back to Login/i })).toBeVisible();
  });
});
