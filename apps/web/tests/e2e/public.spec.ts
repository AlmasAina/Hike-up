import { expect, test } from '@playwright/test';

test.describe('Public website', () => {
  test('home page shows hero, services, packages and CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Maintenance');
    await expect(page.getByRole('link', { name: 'Get a Quote' }).first()).toBeVisible();
    await expect(page.locator('#services-heading')).toBeVisible();
    await expect(page.locator('#packages-heading')).toBeVisible();
    await expect(page.locator('#how-heading')).toBeVisible();
  });

  test('WhatsApp links use wa.me with international digits and a prefilled message', async ({ page }) => {
    await page.goto('/');
    const href = await page.getByTestId('cta-whatsapp').first().getAttribute('href');
    expect(href).toMatch(/^https:\/\/wa\.me\/971\d{8,9}\?text=/);
    expect(href).not.toContain('+');
    expect(decodeURIComponent(href!.split('text=')[1])).toContain('quote');
  });

  test('call links use tel: with E.164 numbers', async ({ page }) => {
    await page.goto('/contact');
    const href = await page.getByTestId('contact-phone').getAttribute('href');
    expect(href).toMatch(/^tel:\+971\d{8,9}$/);
  });

  test('services list links to a detail page with SEO metadata', async ({ page }) => {
    await page.goto('/services');
    await page.getByRole('link', { name: /Plumbing Services/ }).first().click();
    await expect(page).toHaveURL(/\/services\/plumbing-services$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Plumbing Services');
    await expect(page.getByRole('heading', { name: 'What we cover' })).toBeVisible();
    await expect(page).toHaveTitle(/Plumbing/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/services\/plumbing-services$/);
  });

  test('packages page has a comparison table without hard-coded prices', async ({ page }) => {
    await page.goto('/packages');
    const table = page.getByRole('table');
    await expect(table).toContainText('Spare Parts Coverage');
    await expect(table).toContainText('Bronze');
    await expect(page.getByText('Pricing on request').first()).toBeVisible();
  });

  test('legal pages, sitemap and robots are served', async ({ page, request }) => {
    await page.goto('/privacy-policy');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacy Policy');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.ok()).toBeTruthy();
    expect(await sitemap.text()).toContain('/services/plumbing-services');
    expect(await (await request.get('/robots.txt')).text()).toContain('Disallow: /admin');
  });

  test('unknown pages render the 404 page', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist');
    expect(res?.status()).toBe(404);
    await expect(page.getByText("We couldn't find that page")).toBeVisible();
  });

  test('protected pages redirect to login', async ({ page }) => {
    await page.goto('/customer/dashboard');
    await expect(page).toHaveURL(/\/auth\/login\?next=%2Fcustomer%2Fdashboard/);
    await page.goto('/admin/services');
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
