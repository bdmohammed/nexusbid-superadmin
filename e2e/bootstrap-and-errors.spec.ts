import { expect, test } from '@playwright/test';

test.describe('Bootstrap & Error Pages E2E Tests', () => {
  test('403 Forbidden page renders access denied notice and link to sign in', async ({ page }) => {
    await page.goto('/403');

    await expect(page.getByRole('heading', { name: /403 Forbidden/i })).toBeVisible();
    await expect(page.getByText(/Access Denied/i)).toBeVisible();

    const signInBtn = page.getByRole('button', { name: /Go to Sign In/i });
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('Bootstrap setup page handles missing token gracefully', async ({ page }) => {
    await page.goto('/bootstrap');

    await expect(page.getByRole('heading', { name: /Admin Bootstrap Setup/i })).toBeVisible();
    await expect(page.getByText(/No bootstrap token provided/i)).toBeVisible();
  });
});
