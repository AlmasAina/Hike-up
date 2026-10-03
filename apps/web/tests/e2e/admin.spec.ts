import { expect, test, type Page } from '@playwright/test';
import { ADMIN, unique } from './fixtures';

async function adminLogin(page: Page) {
  await page.goto('/admin/login');
  await page.fill('#email', ADMIN.email);
  await page.fill('#password', ADMIN.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin\/dashboard/);
}

test.describe('Admin panel', () => {
  test('dashboard shows KPIs and charts', async ({ page }) => {
    await adminLogin(page);
    await expect(page.getByText('New quote requests')).toBeVisible();
    await expect(page.getByText('Quote requests by month')).toBeVisible();
  });

  test('service CRUD: create, publish, view on site, delete', async ({ page }) => {
    const title = `E2E Service ${Date.now()}`;
    await adminLogin(page);
    await page.goto('/admin/services/new');
    await page.fill('#title', title);
    await page.locator('#title').blur();
    await page.fill('#shortDescription', 'A temporary service created by the end-to-end test.');
    await page.locator('[role="textbox"]').first().fill('Full description written in the rich text editor.');
    await page.selectOption('#status', 'PUBLISHED');
    await page.getByRole('button', { name: 'Create service' }).click();
    await expect(page).toHaveURL(/\/admin\/services\/[0-9a-f-]{36}$/);

    const slug = await page.inputValue('#slug');
    await page.goto(`/services/${slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

    await page.goto('/admin/services');
    await page.fill('input[type="search"][placeholder="Search services"]', title);
    const row = page.getByRole('row', { name: new RegExp(title) });
    await row.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Service deleted')).toBeVisible();
  });

  test('package CRUD with comparison values', async ({ page }) => {
    const name = unique('Pkg');
    await adminLogin(page);
    await page.goto('/admin/packages/new');
    await page.fill('#name', name);
    await page.locator('#name').blur();
    await page.selectOption('select[aria-label="Emergency Maintenance availability"]', 'INCLUDED');
    await page.getByRole('button', { name: 'Create package' }).click();
    await expect(page).toHaveURL(/\/admin\/packages\/[0-9a-f-]{36}$/);
    await page.goto('/packages');
    await expect(page.getByRole('heading', { name: name, exact: false }).first()).toBeVisible();
    await page.goto('/admin/packages');
    await page.getByRole('button', { name: `Delete ${name}` }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Package deleted')).toBeVisible();
  });

  test('quote requests can be filtered and opened', async ({ page, request }) => {
    // Create a fresh request so the test does not depend on existing data.
    const created = await request.post('/api/v1/quote-requests', {
      data: {
        firstName: 'Filter',
        lastName: 'Test',
        email: 'filter.test@example.com',
        phone: '+971 50 765 4321',
        location: 'Mussafah, Abu Dhabi',
        propertyType: 'OFFICE',
        preferredContact: 'WHATSAPP',
        description: 'Office lights flickering in the meeting room.',
      },
    });
    expect(created.ok()).toBeTruthy();
    await adminLogin(page);
    await page.goto('/admin/quote-requests');
    await page.selectOption('select[aria-label="Filter by status"]', 'NEW');
    await page.locator('tbody tr').first().click();
    await expect(page).toHaveURL(/\/admin\/quote-requests\/[0-9a-f-]{36}$/);
    await expect(page.getByRole('heading', { name: 'Update status' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/\d+\?text=/);
  });
});
