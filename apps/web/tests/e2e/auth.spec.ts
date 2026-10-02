import { expect, test } from '@playwright/test';
import { unique } from './fixtures';

test.describe('Customer authentication', () => {
  const email = `${unique('e2e')}@example.com`;
  const password = 'Password123';

  test('register → dashboard → logout → login', async ({ page }) => {
    await page.goto('/auth/register');
    await page.fill('#firstName', 'Playwright');
    await page.fill('#lastName', 'Customer');
    await page.fill('#email', email);
    await page.fill('#phone', '+971 50 222 3344');
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);
    await page.getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
    await expect(page.getByRole('heading', { name: /Hello, Playwright/ })).toBeVisible();

    await page.getByRole('button', { name: 'Account menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
    await expect(page).toHaveURL(/\/auth\/login/);

    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });

  test('shows an error for wrong credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('#email', email);
    await page.fill('#password', 'WrongPassword1');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email or password')).toBeVisible();
  });

  test('forgot password never reveals whether an account exists', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.fill('#email', 'no-such-user@example.com');
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await expect(page.getByText('If an account exists for that email')).toBeVisible();
  });
});
