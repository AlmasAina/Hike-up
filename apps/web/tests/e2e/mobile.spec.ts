import { expect, test } from '@playwright/test';

test.describe('Mobile', () => {
  test('menu drawer, floating call/WhatsApp buttons and no horizontal scroll', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Open menu' }).click();
    const drawer = page.getByRole('dialog', { name: 'Main menu' });
    await expect(drawer.getByRole('link', { name: 'Packages' })).toBeVisible();
    await drawer.getByRole('link', { name: 'Packages' }).click();
    await expect(page).toHaveURL(/\/packages$/);

    await expect(page.getByRole('link', { name: 'Chat on WhatsApp' }).last()).toBeVisible();
    await expect(page.getByRole('link', { name: /^Call / }).last()).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});
