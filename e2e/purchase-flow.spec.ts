import { expect, test } from '@playwright/test';

/**
 * Full purchase smoke against the mock backend (`e2e/mock-backend.mjs`,
 * started by `playwright.config.ts`): register → search/filter → add to
 * cart → checkout → paid order. The mock flips the order to `PAID` when the
 * checkout session is created, simulating the Stripe webhook confirmation.
 */
test('register, search, add to cart, checkout and see the paid order', async ({ page }) => {
  const email = `e2e-${String(Date.now())}@example.com`;

  // 1. Register.
  await page.goto('/en/registro');
  await page.getByLabel('Name (optional)').fill('E2E Tester');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill('correct-horse-battery-42');
  await page.getByRole('button', { name: 'Create account' }).click();
  await expect(page).toHaveURL(/\/en\/?$/);

  // 2. Search / filter the listing.
  await page.goto('/en/productos');
  await expect(page.getByRole('link', { name: 'Mock Laptop 13' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mock Mouse Pro' }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Filters' }).click();
  await page.getByRole('textbox', { name: 'Search' }).fill('laptop');
  await expect(page).toHaveURL(/q=laptop/);
  await expect(page.getByRole('link', { name: 'Mock Laptop 13' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'Mock Mouse Pro' })).toHaveCount(0);

  // 3. Product detail → add to cart.
  await page.getByRole('link', { name: 'Mock Laptop 13' }).first().click();
  await expect(page).toHaveURL(/\/en\/productos\/mock-laptop-13/);
  await expect(page.getByRole('heading', { level: 1, name: 'Mock Laptop 13' })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: 'Added to cart' })).toBeVisible();

  // 4. Cart shows the server-side line.
  await page.goto('/en/carrito');
  await expect(page.getByText('Mock Laptop 13')).toBeVisible();
  await page.getByRole('link', { name: 'Go to checkout' }).click();
  await expect(page).toHaveURL(/\/en\/checkout$/);

  // 5. Checkout: shipping address + hosted-checkout redirect (mocked).
  await page.getByLabel('Full name').fill('Ada Lovelace');
  await page.getByLabel('Address line 1').fill('Calle Mayor 1');
  await page.getByLabel('City').fill('Madrid');
  await page.getByLabel('Country').selectOption('ES');
  await page.getByRole('button', { name: 'Pay with Stripe' }).click();

  // 6. Paid order page (mock webhook already applied `PAID`).
  await expect(page).toHaveURL(/\/en\/checkout\/exito\?orderId=/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Payment confirmed' })).toBeVisible({
    timeout: 15000,
  });
});
