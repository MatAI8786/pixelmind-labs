import { test, expect } from '@playwright/test';

test('Save workflow pops success toast', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.getByRole('button', { name: 'Save Workflow' }).click();
  await page.getByRole('dialog').getByPlaceholder('Workflow name').fill('toast-e2e');
  await page.getByRole('button', { name: /^ok$/i }).click();
  await expect(page.locator('.react-hot-toast')).toContainText('saved');
});
