import { expect, test } from '@playwright/test';
import { SAMPLE_IMAGE } from './fixtures';

test.describe('Forms', () => {
  test('quote request with image upload shows a reference number', async ({ page }) => {
    await page.goto('/get-a-quote?service=ac-hvac-services');
    await page.fill('#firstName', 'E2E');
    await page.fill('#lastName', 'Guest');
    await page.fill('#email', 'e2e.guest@example.com');
    await page.fill('#phone', '+971 50 123 4567');
    await page.selectOption('#propertyType', 'APARTMENT');
    await page.fill('#location', 'Al Raha, Abu Dhabi');
    await page.fill('#description', 'Split AC unit is leaking water onto the wall.');
    await page.locator('#images[data-ready="true"]').waitFor({ state: 'attached' });
    await page.setInputFiles('#images', SAMPLE_IMAGE);
    await expect(page.getByRole('img', { name: 'Selected image 1' })).toBeVisible();
    await page.getByRole('button', { name: 'Submit request' }).click();
    await expect(page.getByText(/HU-\d{4}-\d{6}/).first()).toBeVisible();
    await expect(page.getByText('not a confirmed booking')).toBeVisible();
  });

  test('quote form shows validation errors', async ({ page }) => {
    await page.goto('/get-a-quote');
    await page.getByRole('button', { name: 'Submit request' }).click();
    await expect(page.getByText('First name is required')).toBeVisible();
    await expect(page.getByText('Select a property type')).toBeVisible();
  });

  test('rejects unsupported file types before upload', async ({ page }) => {
    await page.goto('/get-a-quote');
    await page.locator('#images[data-ready="true"]').waitFor({ state: 'attached' });
    await page.setInputFiles('#images', { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hello') });
    await expect(page.getByText(/only JPEG, PNG or WEBP/i)).toBeVisible();
  });

  test('contact form submits', async ({ page }) => {
    await page.goto('/contact');
    await page.fill('#contact-name', 'E2E Visitor');
    await page.fill('#contact-email', 'visitor@example.com');
    await page.fill('#contact-subject', 'Maintenance contract');
    await page.fill('#contact-message', 'Please call me about an annual contract.');
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByText('Thank you for your message')).toBeVisible();
  });
});
