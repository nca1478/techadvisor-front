import { expect, test, type Page } from '@playwright/test';

/**
 * Compare + compatibility e2e against the mock backend
 * (`e2e/mock-backend.mjs`, started by `playwright.config.ts`).
 *
 * - `/comparar?ids=` renders the SQL table with the highlighted best
 *   column plus the cited advisor summary.
 * - The cart calls `POST /compatibility/check` (deterministic rule engine,
 *   no LLM): DDR4 memory in a DDR5 board is an error that gates checkout
 *   behind explicit acknowledgement (never a hard block); an AM4 CPU in an
 *   LGA1700 board shows the socket warning.
 * - The shared mock cart is emptied before/after each test so files running
 *   in parallel workers do not see each other's lines.
 */

async function emptyCart(page: Page) {
  const res = await page.request.get('/api/cart');
  if (!res.ok()) return;
  const cart = (await res.json()) as { items?: { productId?: string }[] };
  for (const item of cart.items ?? []) {
    if (typeof item.productId === 'string') {
      await page.request.delete(`/api/cart/items/${encodeURIComponent(item.productId)}`);
    }
  }
}

async function addFromDetail(page: Page, slug: string, name: string) {
  await page.goto(`/en/productos/${slug}`);
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible();
  await page.getByRole('button', { name: 'Add to cart' }).click();
  await expect(page.getByRole('button', { name: 'Added to cart' })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/en');
  // Hermetic compare selection: client-side navigation (below) does not
  // clear full page loads, so drop any ids left by a previous test.
  await page.evaluate(() => {
    window.localStorage.removeItem('techadvisor:compare-selection');
  });
  await emptyCart(page);
});

test.afterEach(async ({ page }) => {
  await emptyCart(page);
});

test('comparar page shows the SQL table with best highlight and cited summary', async ({
  page,
}) => {
  await page.goto('/en/comparar?ids=prod-mock-laptop-13,prod-mock-mouse-pro');
  await expect(page.getByRole('heading', { level: 1, name: 'Compare products' })).toBeVisible();
  // SQL table: product columns link to detail, cheapest price highlighted.
  await expect(page.getByRole('link', { name: 'Mock Laptop 13' })).toBeVisible();
  await expect(page.getByText('Best').first()).toBeVisible();
  // Advisor summary with [n] citation markers and visible sources.
  await expect(page.getByText(/costs less than.*\[1\]/)).toBeVisible();
  await expect(page.getByText('Sources', { exact: true })).toBeVisible();
});

test('compare selection resets when navigating away and back', async ({ page }) => {
  await page.goto('/en/productos');
  await page.getByRole('checkbox', { name: 'Compare: Mock Laptop 13' }).check();
  await page.getByRole('checkbox', { name: 'Compare: Mock Mouse Pro' }).check();
  await expect(page.getByText('2/3 to compare')).toBeVisible();

  // Client-side navigation (Next Link), which is what the reset-on-navigation
  // store listens to: full page loads remount the app and keep the persisted
  // selection by design.
  await page.getByRole('banner').getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByText('2/3 to compare')).toHaveCount(0);

  await page
    .getByRole('navigation', { name: 'Categories' })
    .getByRole('link', { name: 'All', exact: true })
    .click();
  await expect(page.getByText('2/3 to compare')).toHaveCount(0);
  // Los productos también quedan desmarcados, no solo la barra.
  await expect(page.getByRole('checkbox', { name: 'Compare: Mock Laptop 13' })).not.toBeChecked();
});

test('cart with incompatible CPU and board shows the warning', async ({ page }) => {
  await addFromDetail(page, 'mock-cpu-am4', 'Mock CPU AM4');
  await addFromDetail(page, 'mock-board-lga1700', 'Mock Board LGA1700');

  await page.goto('/en/carrito');
  await expect(page.getByText(/socket AM4.*socket LGA1700/)).toBeVisible();
  await expect(page.getByRole('link', { name: 'View product: Mock CPU AM4' })).toHaveAttribute(
    'href',
    '/en/productos/mock-cpu-am4',
  );
});

test('DDR4 RAM with a DDR5 board shows the error and requires acknowledgement', async ({
  page,
}) => {
  await addFromDetail(page, 'mock-ram-ddr4', 'Mock RAM DDR4');
  await addFromDetail(page, 'mock-board-ddr5', 'Mock Board DDR5');

  await page.goto('/en/carrito');
  await expect(page.getByText(/is DDR4, but board.*only accepts DDR5/)).toBeVisible();

  // Errors never block the purchase, but checkout needs explicit opt-in.
  const checkoutButton = page.getByRole('button', { name: 'Go to checkout' });
  await expect(checkoutButton).toBeDisabled();
  await page.getByRole('checkbox', { name: /I have reviewed the compatibility notices/ }).check();
  await expect(page.getByRole('link', { name: 'Go to checkout' })).toHaveAttribute(
    'href',
    '/en/checkout',
  );
});
