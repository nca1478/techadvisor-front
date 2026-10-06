import { expect, test } from '@playwright/test';

test('home renders the TechAdvisor hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'TechAdvisor' })).toBeVisible();
  await expect(
    page.getByText('Tech store with a shopping advisor that answers with real sources.'),
  ).toBeVisible();
});
