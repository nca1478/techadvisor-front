import { expect, test } from '@playwright/test';

test('home renders the cover hero', async ({ page }) => {
  await page.goto('/en');
  await expect(
    page.getByRole('heading', { name: 'The tech you want, explained with evidence' }),
  ).toBeVisible();
  await expect(
    page.getByText(
      'Tell us your budget and what it is for: the advisor checks spec sheets, manuals and warranties before recommending.',
    ),
  ).toBeVisible();
});

test('root redirects to the default locale', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => page.url()).toContain('/en');
});
